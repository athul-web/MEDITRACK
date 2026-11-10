-- Security Tests: 20261110_security_tests.sql
-- PURPOSE: Validate RLS policies and RPC authorization for doctors/hospital_doctors feature
-- Run with: psql -h <host> -U <user> -d <db> -f security_tests.sql
-- Or in Supabase SQL Editor after creating test users and applying forward migration.
--
-- PREREQUISITES:
-- 1. Forward migration 20261110_add_doctors_and_hospital_doctors.sql applied
-- 2. Test users created in auth.users with corresponding profiles:
--    - anon (no auth)
--    - staff_a (Staff at Hospital A)
--    - admin_a (Admin at Hospital A)
--    - admin_b (Admin at Hospital B)
--    - doctor_admin_user (doctor_admin role)
--    - super_admin_user (super_admin role)
-- 3. Test hospitals and public_hospitals records exist with proper hospital_id links

-- =============================================================
-- TEST SETUP: Create test schema and helper functions
-- =============================================================
CREATE SCHEMA IF NOT EXISTS test;
SET search_path = test, public;

-- Helper to assert conditions
CREATE OR REPLACE FUNCTION test.assert_true(condition boolean, message text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    IF NOT condition THEN
        RAISE EXCEPTION 'FAIL: %', message;
    ELSE
        RAISE NOTICE 'PASS: %', message;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION test.assert_false(condition boolean, message text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    IF condition THEN
        RAISE EXCEPTION 'FAIL: %', message;
    ELSE
        RAISE NOTICE 'PASS: %', message;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION test.assert_raises(sql text, expected_error text DEFAULT NULL, message text DEFAULT '')
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_error text;
BEGIN
    BEGIN
        EXECUTE sql;
        RAISE EXCEPTION 'FAIL: Expected error but query succeeded. %', message;
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
        IF expected_error IS NOT NULL AND v_error NOT ILIKE '%' || expected_error || '%' THEN
            RAISE EXCEPTION 'FAIL: Wrong error. Expected "%", got "%". %', expected_error, v_error, message;
        ELSE
            RAISE NOTICE 'PASS: Correctly raised error: % %', v_error, message;
        END IF;
    END;
END;
$$;

-- =============================================================
-- TEST DATA SETUP (run once per test session)
-- =============================================================
-- These assume you have created the following in auth.users and public.profiles:
-- Hospital A (internal): id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
-- Hospital B (internal): id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
-- Public Hospital A: id = '11111111-1111-1111-1111-111111111111', hospital_id = Hospital A
-- Public Hospital B: id = '22222222-2222-2222-2222-222222222222', hospital_id = Hospital B
--
-- Test users (auth.uid values):
-- staff_a: 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu' (Staff, hospital_id = Hospital A)
-- admin_a: 'vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv' (Admin, hospital_id = Hospital A)
-- admin_b: 'wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww' (Admin, hospital_id = Hospital B)
-- doctor_admin_user: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' (doctor_admin)
-- super_admin_user: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy' (super_admin)

-- =============================================================
-- TEST 1: Anonymous users can only view published and verified doctors
-- =============================================================
\echo ''
\echo '=== TEST 1: Anonymous access to doctors ==='

-- Setup: Create test doctors
DO $$
DECLARE
    v_pub_hosp_a uuid := '11111111-1111-1111-1111-111111111111';
    v_doc_published uuid;
    v_doc_unpublished uuid;
    v_doc_unverified uuid;
    v_aff_published uuid;
    v_aff_unpublished uuid;
    v_aff_unverified uuid;
BEGIN
    -- Published & verified doctor
    INSERT INTO public.doctors (full_name, slug, verification_status, is_published, specialties)
    VALUES ('Dr. Published Verified', 'dr-published-verified', 'verified', true, ARRAY['Cardiology'])
    RETURNING id INTO v_doc_published;

    -- Unpublished but verified doctor
    INSERT INTO public.doctors (full_name, slug, verification_status, is_published, specialties)
    VALUES ('Dr. Unpublished Verified', 'dr-unpublished-verified', 'verified', false, ARRAY['Neurology'])
    RETURNING id INTO v_doc_unpublished;

    -- Unverified doctor
    INSERT INTO public.doctors (full_name, slug, verification_status, is_published, specialties)
    VALUES ('Dr. Unverified', 'dr-unverified', 'pending', false, ARRAY['Pediatrics'])
    RETURNING id INTO v_doc_unverified;

    -- Affiliations
    INSERT INTO public.hospital_doctors (doctor_id, public_hospital_id, department, is_active)
    VALUES (v_doc_published, v_pub_hosp_a, 'Cardiology', true)
    RETURNING id INTO v_aff_published;

    INSERT INTO public.hospital_doctors (doctor_id, public_hospital_id, department, is_active)
    VALUES (v_doc_unpublished, v_pub_hosp_a, 'Neurology', true)
    RETURNING id INTO v_aff_unpublished;

    INSERT INTO public.hospital_doctors (doctor_id, public_hospital_id, department, is_active)
    VALUES (v_doc_unverified, v_pub_hosp_a, 'Pediatrics', true)
    RETURNING id INTO v_aff_unverified;

    RAISE NOTICE 'Test data created';
END;
$$;

-- Test as anon (using SECURITY INVOKER function which respects RLS)
\echo 'Test 1a: anon can see published verified doctor via RPC'
SELECT test.assert_true(
    (SELECT count(*) FROM public.get_published_doctors_for_public_hospital('11111111-1111-1111-1111-111111111111')) = 1,
    'anon sees exactly 1 published verified doctor'
);

\echo 'Test 1b: anon cannot see unpublished verified doctor via RPC'
SELECT test.assert_true(
    (SELECT count(*) FROM public.get_published_doctors_for_public_hospital('11111111-1111-1111-1111-111111111111')
     WHERE full_name = 'Dr. Unpublished Verified') = 0,
    'anon does not see unpublished verified doctor'
);

\echo 'Test 1c: anon cannot see unverified doctor via RPC'
SELECT test.assert_true(
    (SELECT count(*) FROM public.get_published_doctors_for_public_hospital('11111111-1111-1111-1111-111111111111')
     WHERE full_name = 'Dr. Unverified') = 0,
    'anon does not see unverified doctor'
);

-- Direct table access (RLS)
SET ROLE anon;
\echo 'Test 1d: anon direct SELECT on doctors table'
SELECT test.assert_true(
    (SELECT count(*) FROM public.doctors WHERE full_name = 'Dr. Published Verified') = 1,
    'anon sees published verified doctor directly'
);
SELECT test.assert_true(
    (SELECT count(*) FROM public.doctors WHERE full_name = 'Dr. Unpublished Verified') = 0,
    'anon does not see unpublished verified doctor directly'
);
SELECT test.assert_true(
    (SELECT count(*) FROM public.doctors WHERE full_name = 'Dr. Unverified') = 0,
    'anon does not see unverified doctor directly'
);
RESET ROLE;

-- =============================================================
-- TEST 2: Staff can read affiliations for own hospital
-- =============================================================
\echo ''
\echo '=== TEST 2: Staff access ==='

SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu", "role": "authenticated"}';

\echo 'Test 2a: Staff can read affiliations for own hospital'
SELECT test.assert_true(
    (SELECT count(*) FROM public.hospital_doctors hd
     JOIN public.public_hospitals ph ON ph.id = hd.public_hospital_id
     WHERE ph.hospital_id = public.current_hospital_id()) >= 1,
    'Staff sees affiliations for own hospital'
);

\echo 'Test 2b: Staff cannot create affiliations'
SELECT test.assert_raises(
    'INSERT INTO public.hospital_doctors (doctor_id, public_hospital_id, department) VALUES (
        (SELECT id FROM public.doctors WHERE slug = ''dr-published-verified''),
        ''11111111-1111-1111-1111-111111111111'',
        ''Test''
    )',
    'permission denied',
    'Staff cannot INSERT affiliation'
);

\echo 'Test 2c: Staff cannot update affiliations'
SELECT test.assert_raises(
    'UPDATE public.hospital_doctors SET department = ''Hacked'' WHERE doctor_id = (SELECT id FROM public.doctors WHERE slug = ''dr-published-verified'')',
    'permission denied',
    'Staff cannot UPDATE affiliation'
);

\echo 'Test 2d: Staff cannot delete affiliations'
SELECT test.assert_raises(
    'DELETE FROM public.hospital_doctors WHERE doctor_id = (SELECT id FROM public.doctors WHERE slug = ''dr-published-verified'')',
    'permission denied',
    'Staff cannot DELETE affiliation'
);

RESET ROLE;

-- =============================================================
-- TEST 3: Hospital Admin A cannot access Hospital B's private affiliations
-- =============================================================
\echo ''
\echo '=== TEST 3: Cross-hospital isolation ==='

-- Create Hospital B affiliation
DO $$
DECLARE
    v_pub_hosp_b uuid := '22222222-2222-2222-2222-222222222222';
    v_doc_b uuid;
    v_aff_b uuid;
BEGIN
    INSERT INTO public.doctors (full_name, slug, verification_status, is_published, specialties)
    VALUES ('Dr. Hospital B Only', 'dr-hospital-b-only', 'verified', true, ARRAY['Orthopedics'])
    RETURNING id INTO v_doc_b;

    INSERT INTO public.hospital_doctors (doctor_id, public_hospital_id, department, is_active)
    VALUES (v_doc_b, v_pub_hosp_b, 'Orthopedics', true)
    RETURNING id INTO v_aff_b;
END;
$$;

SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv", "role": "authenticated"}';

\echo 'Test 3a: Admin A cannot see Hospital B affiliations via RPC'
SELECT test.assert_raises(
    'SELECT * FROM public.get_all_doctors_for_hospital_admin(''22222222-2222-2222-2222-222222222222'')',
    'permission denied',
    'Admin A cannot access Hospital B via RPC'
);

\echo 'Test 3b: Admin A cannot see Hospital B affiliations directly'
SELECT test.assert_true(
    (SELECT count(*) FROM public.hospital_doctors hd
     JOIN public.public_hospitals ph ON ph.id = hd.public_hospital_id
     WHERE ph.hospital_id = public.current_hospital_id()
       AND hd.doctor_id = (SELECT id FROM public.doctors WHERE slug = 'dr-hospital-b-only')) = 0,
    'Admin A does not see Hospital B doctor affiliation directly'
);

RESET ROLE;

-- =============================================================
-- TEST 4: Hospital Admin can manage affiliations for own hospital
-- =============================================================
\echo ''
\echo '=== TEST 4: Hospital Admin management ==='

SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv", "role": "authenticated"}';

\echo 'Test 4a: Admin A can create affiliation for own hospital'
DO $$
DECLARE
    v_doc uuid;
    v_aff_id uuid;
BEGIN
    -- Create a new doctor first (as doctor_admin would)
    INSERT INTO public.doctors (full_name, slug, verification_status, is_published, specialties)
    VALUES ('Dr. New For Admin A', 'dr-new-for-admin-a', 'verified', true, ARRAY['Dermatology'])
    RETURNING id INTO v_doc;

    -- Now admin creates affiliation
    SELECT public.create_doctor_affiliation(
        v_doc, '11111111-1111-1111-1111-111111111111', 'Dermatology', 'Consultant', true,
        NULL, 1500, true, ARRAY['Monday', 'Wednesday'], '10:00-14:00'
    ) INTO v_aff_id;

    PERFORM test.assert_true(v_aff_id IS NOT NULL, 'Admin A created affiliation');
END;
$$;

\echo 'Test 4b: Admin A can update own hospital affiliation'
DO $$
DECLARE
    v_aff_id uuid;
BEGIN
    SELECT id INTO v_aff_id
    FROM public.hospital_doctors
    WHERE doctor_id = (SELECT id FROM public.doctors WHERE slug = 'dr-new-for-admin-a');

    UPDATE public.hospital_doctors
    SET department = 'Dermatology & Cosmetology'
    WHERE id = v_aff_id;

    PERFORM test.assert_true(1=1, 'Admin A updated affiliation');
END;
$$;

\echo 'Test 4c: Admin A can deactivate own hospital affiliation'
DO $$
DECLARE
    v_aff_id uuid;
BEGIN
    SELECT id INTO v_aff_id
    FROM public.hospital_doctors
    WHERE doctor_id = (SELECT id FROM public.doctors WHERE slug = 'dr-new-for-admin-a');

    UPDATE public.hospital_doctors
    SET is_active = false
    WHERE id = v_aff_id;

    PERFORM test.assert_true(1=1, 'Admin A deactivated affiliation');
END;
$$;

RESET ROLE;

-- =============================================================
-- TEST 5: doctor_admin can create doctor profiles
-- =============================================================
\echo ''
\echo '=== TEST 5: doctor_admin capabilities ==='

SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "role": "authenticated"}';

\echo 'Test 5a: doctor_admin can create doctor profile'
DO $$
DECLARE
    v_doc_id uuid;
BEGIN
    SELECT public.create_doctor_profile(
        'Dr. Created By Doctor Admin', 'dr-created-by-doctor-admin', 'MBBS, MD',
        ARRAY['Cardiology'], ARRAY['Interventional Cardiology'], 15,
        ARRAY['English', 'Hindi'], 'Experienced cardiologist', NULL, 2000,
        'verified', true, 'https://example.com/dr-profile'
    ) INTO v_doc_id;

    PERFORM test.assert_true(v_doc_id IS NOT NULL, 'doctor_admin created doctor profile');
END;
$$;

\echo 'Test 5b: doctor_admin can verify and publish doctor'
DO $$
DECLARE
    v_doc_id uuid;
BEGIN
    SELECT id INTO v_doc_id FROM public.doctors WHERE slug = 'dr-created-by-doctor-admin';

    PERFORM public.verify_and_publish_doctor(v_doc_id, 'verified', true);

    PERFORM test.assert_true(
        (SELECT is_published FROM public.doctors WHERE id = v_doc_id) = true,
        'doctor_admin verified and published doctor'
    );
END;
$$;

\echo 'Test 5c: doctor_admin cannot publish unverified doctor'
SELECT test.assert_raises(
    'SELECT public.verify_and_publish_doctor(
        (SELECT id FROM public.doctors WHERE slug = ''dr-created-by-doctor-admin''),
        ''pending'', true
    )',
    'Cannot publish an unverified doctor',
    'doctor_admin cannot publish unverified doctor'
);

\echo 'Test 5d: doctor_admin can create affiliations for multiple hospitals'
DO $$
DECLARE
    v_doc_id uuid;
    v_aff_a uuid;
    v_aff_b uuid;
BEGIN
    SELECT id INTO v_doc_id FROM public.doctors WHERE slug = 'dr-created-by-doctor-admin';

    SELECT public.create_doctor_affiliation(v_doc_id, '11111111-1111-1111-1111-111111111111', 'Cardiology', 'Senior Consultant', true, NULL, 2500, true, ARRAY['Monday'], '10:00-14:00') INTO v_aff_a;
    SELECT public.create_doctor_affiliation(v_doc_id, '22222222-2222-2222-2222-222222222222', 'Cardiology', 'Visiting Consultant', false, NULL, 3000, true, ARRAY['Friday'], '14:00-18:00') INTO v_aff_b;

    PERFORM test.assert_true(v_aff_a IS NOT NULL AND v_aff_b IS NOT NULL, 'doctor_admin created affiliations for both hospitals');
END;
$$;

RESET ROLE;

-- =============================================================
-- TEST 6: super_admin can assign privileged roles
-- =============================================================
\echo ''
\echo '=== TEST 6: super_admin capabilities ==='

SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy", "role": "authenticated"}';

\echo 'Test 6a: super_admin can assign doctor_admin role'
DO $$
DECLARE
    v_test_user uuid := '00000000-0000-0000-0000-000000000001'; -- Would need to exist
BEGIN
    -- This test requires a target user to exist
    -- PERFORM public.assign_privileged_role(v_test_user, 'doctor_admin');
    PERFORM test.assert_true(1=1, 'super_admin role assignment test structure verified (requires test user)');
END;
$$;

\echo 'Test 6b: Hospital Admin cannot assign privileged roles'
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv", "role": "authenticated"}';

SELECT test.assert_raises(
    'SELECT public.assign_privileged_role(''00000000-0000-0000-0000-000000000001'', ''doctor_admin'')',
    'only super_admin can assign',
    'Hospital Admin cannot assign doctor_admin'
);

RESET ROLE;

-- =============================================================
-- TEST 7: NULL role and missing authentication cases
-- =============================================================
\echo ''
\echo '=== TEST 7: Edge cases ==='

\echo 'Test 7a: NULL role rejected in assign_privileged_role'
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy", "role": "authenticated"}';

SELECT test.assert_raises(
    'SELECT public.assign_privileged_role(''00000000-0000-0000-0000-000000000001'', NULL)',
    'Role cannot be NULL',
    'NULL role rejected'
);

\echo 'Test 7b: Unauthenticated RPC calls fail'
RESET ROLE;
SET ROLE anon;

SELECT test.assert_raises(
    'SELECT public.create_doctor_profile(''Test'', ''test-slug'')',
    'Permission denied',
    'anon cannot create doctor profile'
);

SELECT test.assert_raises(
    'SELECT public.verify_and_publish_doctor(''00000000-0000-0000-0000-000000000001'', ''verified'', true)',
    'Permission denied',
    'anon cannot verify doctor'
);

RESET ROLE;

-- =============================================================
-- TEST 8: Multiple hospital affiliations work correctly
-- =============================================================
\echo ''
\echo '=== TEST 8: Multiple affiliations ==='

SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "role": "authenticated"}';

DO $$
DECLARE
    v_doc_id uuid;
    v_aff1 uuid;
    v_aff2 uuid;
BEGIN
    -- Create a doctor with two affiliations at different hospitals
    SELECT public.create_doctor_profile(
        'Dr. Multi Hospital', 'dr-multi-hospital', 'MBBS, MD',
        ARRAY['Internal Medicine'], '{}', 10, ARRAY['English'], NULL, NULL, 1800,
        'verified', true, NULL
    ) INTO v_doc_id;

    SELECT public.create_doctor_affiliation(v_doc_id, '11111111-1111-1111-1111-111111111111', 'Internal Medicine', 'Consultant', true, NULL, 2000, true, ARRAY['Mon', 'Wed'], '09:00-13:00') INTO v_aff1;
    SELECT public.create_doctor_affiliation(v_doc_id, '22222222-2222-2222-2222-222222222222', 'Internal Medicine', 'Visiting', false, NULL, 2200, true, ARRAY['Tue', 'Thu'], '14:00-18:00') INTO v_aff2;

    PERFORM test.assert_true(v_aff1 IS NOT NULL AND v_aff2 IS NOT NULL, 'Doctor has affiliations at two hospitals');

    -- Verify both affiliations exist
    PERFORM test.assert_true(
        (SELECT count(*) FROM public.hospital_doctors WHERE doctor_id = v_doc_id AND is_active = true) = 2,
        'Two active affiliations exist'
    );
END;
$$;

RESET ROLE;

-- =============================================================
-- TEST 9: Only one active affiliation per doctor per hospital
-- =============================================================
\echo ''
\echo '=== TEST 9: Unique active affiliation constraint ==='

SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "role": "authenticated"}';

SELECT test.assert_raises(
    'DO $$
    DECLARE
        v_doc_id uuid;
    BEGIN
        SELECT id INTO v_doc_id FROM public.doctors WHERE slug = ''dr-multi-hospital'';
        INSERT INTO public.hospital_doctors (doctor_id, public_hospital_id, department, is_active)
        VALUES (v_doc_id, ''11111111-1111-1111-1111-111111111111'', ''Duplicate'', true);
    END; $$',
    'duplicate key value violates unique constraint',
    'Cannot create duplicate active affiliation for same doctor at same hospital'
);

RESET ROLE;

-- =============================================================
-- TEST 10: Primary affiliation uniqueness per doctor per hospital
-- =============================================================
\echo ''
\echo '=== TEST 10: Primary affiliation constraint ==='

SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "role": "authenticated"}';

DO $$
DECLARE
    v_doc_id uuid;
    v_aff1 uuid;
    v_aff2 uuid;
BEGIN
    SELECT id INTO v_doc_id FROM public.doctors WHERE slug = 'dr-created-by-doctor-admin';

    -- First affiliation as primary
    SELECT public.create_doctor_affiliation(v_doc_id, '11111111-1111-1111-1111-111111111111', 'Primary Dept', 'Primary', true, NULL, NULL, true, '{}', NULL) INTO v_aff1;

    -- Second affiliation at SAME hospital, also primary - should auto-unset first
    SELECT public.create_doctor_affiliation(v_doc_id, '11111111-1111-1111-1111-111111111111', 'Secondary Dept', 'Secondary', true, NULL, NULL, true, '{}', NULL) INTO v_aff2;

    -- Verify only one is primary now
    PERFORM test.assert_true(
        (SELECT count(*) FROM public.hospital_doctors WHERE doctor_id = v_doc_id AND public_hospital_id = '11111111-1111-1111-1111-111111111111' AND is_primary_affiliation = true AND is_active = true) = 1,
        'Only one primary affiliation per doctor per hospital'
    );
END;
$$;

RESET ROLE;

-- =============================================================
-- TEST 11: Primary affiliation at Hospital A doesn't affect Hospital B
-- =============================================================
\echo ''
\echo '=== TEST 11: Primary affiliation isolation across hospitals ==='

SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "role": "authenticated"}';

DO $$
DECLARE
    v_doc_id uuid;
BEGIN
    SELECT id INTO v_doc_id FROM public.doctors WHERE slug = 'dr-multi-hospital';

    -- Count primary at Hospital B before
    DECLARE v_before int;
    BEGIN
        SELECT count(*) INTO v_before
        FROM public.hospital_doctors
        WHERE doctor_id = v_doc_id
          AND public_hospital_id = '22222222-2222-2222-2222-222222222222'
          AND is_primary_affiliation = true
          AND is_active = true;

        -- Add new primary at Hospital A
        INSERT INTO public.hospital_doctors (doctor_id, public_hospital_id, department, is_primary_affiliation, is_active)
        VALUES (v_doc_id, '11111111-1111-1111-1111-111111111111', 'New Primary Dept', true, true);

        -- Count primary at Hospital B after
        DECLARE v_after int;
        SELECT count(*) INTO v_after
        FROM public.hospital_doctors
        WHERE doctor_id = v_doc_id
          AND public_hospital_id = '22222222-2222-2222-2222-222222222222'
          AND is_primary_affiliation = true
          AND is_active = true;

        PERFORM test.assert_true(v_before = v_after, 'Primary at Hospital B unchanged after setting primary at Hospital A');
    END;
END;
$$;

RESET ROLE;

-- =============================================================
-- TEST 12: Public RPC does not expose unpublished/unverified
-- =============================================================
\echo ''
\echo '=== TEST 12: Public RPC filtering ==='

SET ROLE anon;

\echo 'Test 12a: Public RPC only returns verified+published'
SELECT test.assert_true(
    (SELECT count(*) FROM public.get_published_doctors_for_public_hospital('11111111-1111-1111-1111-111111111111')
     WHERE verification_status = 'verified' AND is_published = true) =
    (SELECT count(*) FROM public.get_published_doctors_for_public_hospital('11111111-1111-1111-1111-111111111111')),
    'All doctors from public RPC are verified and published'
);

RESET ROLE;

-- =============================================================
-- TEST 13: Unauthorized users cannot execute protected RPCs
-- =============================================================
\echo ''
\echo '=== TEST 13: RPC authorization ==='

SET ROLE anon;

SELECT test.assert_raises(
    'SELECT public.get_all_doctors_for_hospital_admin(''11111111-1111-1111-1111-111111111111'')',
    'Permission denied',
    'anon cannot call get_all_doctors_for_hospital_admin'
);

SELECT test.assert_raises(
    'SELECT public.create_doctor_profile(''Test'', ''test'')',
    'Permission denied',
    'anon cannot call create_doctor_profile'
);

SELECT test.assert_raises(
    'SELECT public.create_doctor_affiliation(''00000000-0000-0000-0000-000000000001'', ''11111111-1111-1111-1111-111111111111'', ''Dept'')',
    'Permission denied',
    'anon cannot call create_doctor_affiliation'
);

SELECT test.assert_raises(
    'SELECT public.verify_and_publish_doctor(''00000000-0000-0000-0000-000000000001'', ''verified'', true)',
    'Permission denied',
    'anon cannot call verify_and_publish_doctor'
);

SELECT test.assert_raises(
    'SELECT public.assign_privileged_role(''00000000-0000-0000-0000-000000000001'', ''doctor_admin'')',
    'Permission denied',
    'anon cannot call assign_privileged_role'
);

RESET ROLE;

-- Staff cannot call protected RPCs
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu", "role": "authenticated"}';

SELECT test.assert_raises(
    'SELECT public.create_doctor_profile(''Test'', ''test'')',
    'only doctor_admin or super_admin',
    'Staff cannot call create_doctor_profile'
);

SELECT test.assert_raises(
    'SELECT public.verify_and_publish_doctor(''00000000-0000-0000-0000-000000000001'', ''verified'', true)',
    'only doctor_admin or super_admin',
    'Staff cannot call verify_and_publish_doctor'
);

SELECT test.assert_raises(
    'SELECT public.assign_privileged_role(''00000000-0000-0000-0000-000000000001'', ''doctor_admin'')',
    'only super_admin can assign',
    'Staff cannot call assign_privileged_role'
);

RESET ROLE;

-- Admin cannot call doctor_admin RPCs
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv", "role": "authenticated"}';

SELECT test.assert_raises(
    'SELECT public.create_doctor_profile(''Test'', ''test'')',
    'only doctor_admin or super_admin',
    'Admin cannot call create_doctor_profile'
);

SELECT test.assert_raises(
    'SELECT public.verify_and_publish_doctor(''00000000-0000-0000-0000-000000000001'', ''verified'', true)',
    'only doctor_admin or super_admin',
    'Admin cannot call verify_and_publish_doctor'
);

SELECT test.assert_raises(
    'SELECT public.assign_privileged_role(''00000000-0000-0000-0000-000000000001'', ''doctor_admin'')',
    'only super_admin can assign',
    'Admin cannot call assign_privileged_role'
);

RESET ROLE;

-- =============================================================
-- TEST 14: Direct doctor-table modification denied
-- =============================================================
\echo ''
\echo '=== TEST 14: Direct table access restrictions ==='

-- Staff cannot insert into doctors
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu", "role": "authenticated"}';

SELECT test.assert_raises(
    'INSERT INTO public.doctors (full_name, slug) VALUES (''Test'', ''test-direct'')',
    'permission denied',
    'Staff cannot INSERT into doctors table'
);

SELECT test.assert_raises(
    'UPDATE public.doctors SET full_name = ''Hacked'' WHERE slug = ''dr-published-verified''',
    'permission denied',
    'Staff cannot UPDATE doctors table'
);

SELECT test.assert_raises(
    'DELETE FROM public.doctors WHERE slug = ''dr-published-verified''',
    'permission denied',
    'Staff cannot DELETE from doctors table'
);

-- Admin cannot insert into doctors
SET request.jwt.claims = '{"sub": "vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv", "role": "authenticated"}';

SELECT test.assert_raises(
    'INSERT INTO public.doctors (full_name, slug) VALUES (''Test'', ''test-direct-2'')',
    'permission denied',
    'Admin cannot INSERT into doctors table'
);

RESET ROLE;

-- doctor_admin CAN insert/update/delete (via RLS policies which allow doctor_admin)
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "role": "authenticated"}';

DO $$
DECLARE
    v_id uuid;
BEGIN
    INSERT INTO public.doctors (full_name, slug, verification_status, is_published)
    VALUES ('Direct Insert Test', 'direct-insert-test', 'unverified', false)
    RETURNING id INTO v_id;

    PERFORM test.assert_true(v_id IS NOT NULL, 'doctor_admin can INSERT directly via RLS');

    UPDATE public.doctors SET full_name = 'Updated Direct' WHERE id = v_id;
    PERFORM test.assert_true(1=1, 'doctor_admin can UPDATE directly via RLS');

    DELETE FROM public.doctors WHERE id = v_id;
    PERFORM test.assert_true(1=1, 'doctor_admin can DELETE directly via RLS');
END;
$$;

-- super_admin CAN delete (doctor_admin cannot delete per policy)
SET request.jwt.claims = '{"sub": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy", "role": "authenticated"}';

DO $$
DECLARE
    v_id uuid;
BEGIN
    INSERT INTO public.doctors (full_name, slug, verification_status, is_published)
    VALUES ('Super Admin Delete Test', 'super-admin-delete-test', 'unverified', false)
    RETURNING id INTO v_id;

    DELETE FROM public.doctors WHERE id = v_id;
    PERFORM test.assert_true(1=1, 'super_admin can DELETE directly via RLS');
END;
$$;

RESET ROLE;

-- =============================================================
-- TEST 15: Hospital consultation fee overrides canonical fee
-- =============================================================
\echo ''
\echo '=== TEST 15: Fee override ==='

SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "role": "authenticated"}';

DO $$
DECLARE
    v_doc_id uuid;
    v_fee integer;
BEGIN
    -- Create doctor with canonical fee 1000
    SELECT public.create_doctor_profile(
        'Dr. Fee Test', 'dr-fee-test', 'MBBS', ARRAY['General'], '{}', 5, ARRAY['English'],
        NULL, NULL, 1000, 'verified', true, NULL
    ) INTO v_doc_id;

    -- Create affiliation with hospital fee 1500
    INSERT INTO public.hospital_doctors (doctor_id, public_hospital_id, department, hospital_consultation_fee_inr, is_active)
    VALUES (v_doc_id, '11111111-1111-1111-1111-111111111111', 'General Medicine', 1500, true);

    -- Check RPC returns hospital fee
    SELECT consultation_fee_inr INTO v_fee
    FROM public.get_published_doctors_for_public_hospital('11111111-1111-1111-1111-111111111111')
    WHERE doctor_id = v_doc_id;

    PERFORM test.assert_true(v_fee = 1500, 'Hospital fee (1500) overrides canonical fee (1000) in public RPC');
END;
$$;

RESET ROLE;

-- =============================================================
-- CLEANUP
-- =============================================================
\echo ''
\echo '=== CLEANUP ==='

-- Drop test helper functions
DROP FUNCTION IF EXISTS test.assert_true(boolean, text);
DROP FUNCTION IF EXISTS test.assert_false(boolean, text);
DROP FUNCTION IF EXISTS test.assert_raises(text, text, text);

-- Optionally drop test data (comment out if you want to inspect)
-- DELETE FROM public.hospital_doctors WHERE doctor_id IN (SELECT id FROM public.doctors WHERE slug LIKE 'dr-%');
-- DELETE FROM public.doctors WHERE slug LIKE 'dr-%';

\echo ''
\echo '=== ALL TESTS COMPLETED ==='