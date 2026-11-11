-- Migration: 20261110_add_doctors_and_hospital_doctors.sql
-- PURPOSE: Add doctors directory with hospital affiliations
-- Depends on: 20260921_multi_hospital_tenancy.sql, 20260924_123436_create_public_hospitals.sql, 20261001_secure_multi_hospital_tenancy.sql
-- Safe to run after existing migrations; idempotent where possible.

BEGIN;

-- =============================================================
-- 0. EXTEND PROFILES ROLE CONSTRAINT
-- =============================================================
-- Add doctor_admin and super_admin roles to existing profiles table
-- The existing constraint is: role TEXT CHECK (role IN ('Staff', 'Admin')) DEFAULT 'Staff'
-- We need to drop and recreate the constraint with new roles.

ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('Staff', 'Admin', 'doctor_admin', 'super_admin'));

COMMENT ON COLUMN public.profiles.role IS 'User role: Staff, Admin (hospital-scoped), doctor_admin (global doctor directory), super_admin (global admin)';

-- =============================================================
-- 1. DOCTORS TABLE (Canonical doctor profiles)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.doctors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    slug text NOT NULL UNIQUE,
    qualification text,
    specialties text[] NOT NULL DEFAULT '{}',
    sub_specialties text[] NOT NULL DEFAULT '{}',
    experience_years integer,
    languages text[] NOT NULL DEFAULT '{}',
    bio text,
    profile_image_url text,
    consultation_fee_inr integer,
    verification_status text NOT NULL DEFAULT 'unverified'
        CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    is_published boolean NOT NULL DEFAULT false,
    source_url text,
    last_verified_at timestamptz,
    verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.doctors IS 'Canonical doctor profiles. One profile per doctor, even if affiliated with multiple hospitals.';
COMMENT ON COLUMN public.doctors.verification_status IS 'unverified: not reviewed; pending: under review; verified: credentials confirmed; rejected: failed verification';
COMMENT ON COLUMN public.doctors.is_published IS 'Only verified AND published doctors appear in public directory';

-- Indexes for doctors
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON public.doctors(slug);
CREATE INDEX IF NOT EXISTS idx_doctors_verification_status ON public.doctors(verification_status);
CREATE INDEX IF NOT EXISTS idx_doctors_is_published ON public.doctors(is_published);
CREATE INDEX IF NOT EXISTS idx_doctors_specialties ON public.doctors USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_doctors_sub_specialties ON public.doctors USING GIN(sub_specialties);
CREATE INDEX IF NOT EXISTS idx_doctors_full_name ON public.doctors(full_name);

-- =============================================================
-- 2. HOSPITAL_DOCTORS TABLE (Junction table for affiliations)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.hospital_doctors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    public_hospital_id uuid NOT NULL REFERENCES public.public_hospitals(id) ON DELETE CASCADE,
    department text NOT NULL,
    designation text,
    is_primary_affiliation boolean NOT NULL DEFAULT false,
    appointment_booking_url text,
    hospital_consultation_fee_inr integer,
    is_accepting_patients boolean NOT NULL DEFAULT true,
    available_days text[] NOT NULL DEFAULT '{}',
    available_hours text,
    is_active boolean NOT NULL DEFAULT true,
    affiliation_verified_at timestamptz,
    affiliation_verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- One active affiliation per doctor per hospital
    CONSTRAINT uq_hospital_doctors_doctor_hospital_active
        UNIQUE (doctor_id, public_hospital_id)
        WHERE (is_active),

    -- Primary affiliation uniqueness: one primary per doctor per hospital
    CONSTRAINT uq_hospital_doctors_primary_per_doctor_per_hospital
        UNIQUE (doctor_id, public_hospital_id)
        WHERE (is_primary_affiliation AND is_active)
);

COMMENT ON TABLE public.hospital_doctors IS 'Junction table linking doctors to public_hospitals with hospital-specific details';
COMMENT ON COLUMN public.hospital_doctors.hospital_consultation_fee_inr IS 'Overrides canonical doctor.consultation_fee_inr when set';
COMMENT ON COLUMN public.hospital_doctors.is_primary_affiliation IS 'One primary affiliation per doctor per hospital (not global)';

-- Indexes for hospital_doctors
CREATE INDEX IF NOT EXISTS idx_hospital_doctors_doctor_id ON public.hospital_doctors(doctor_id);
CREATE INDEX IF NOT EXISTS idx_hospital_doctors_public_hospital_id ON public.hospital_doctors(public_hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_doctors_is_active ON public.hospital_doctors(is_active);
CREATE INDEX IF NOT EXISTS idx_hospital_doctors_is_primary ON public.hospital_doctors(is_primary_affiliation);
CREATE INDEX IF NOT EXISTS idx_hospital_doctors_department ON public.hospital_doctors(department);

-- =============================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_doctors ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 4. HELPER FUNCTIONS
-- =============================================================

-- Check if caller is doctor_admin or super_admin
CREATE OR REPLACE FUNCTION public.is_doctor_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.current_user_role() IN ('doctor_admin', 'super_admin');
$$;

REVOKE ALL ON FUNCTION public.is_doctor_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_doctor_admin() TO authenticated;

-- Check if caller is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.current_user_role() = 'super_admin';
$$;

REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Check if caller can manage affiliations for a given public_hospital_id
-- Hospital Admin: own hospital only
-- doctor_admin/super_admin: any hospital
CREATE OR REPLACE FUNCTION public.can_manage_hospital_affiliations(p_public_hospital_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        public.current_user_role() IN ('doctor_admin', 'super_admin')
        OR (
            public.current_user_role() = 'Admin'
            AND EXISTS (
                SELECT 1
                FROM public.public_hospitals ph
                WHERE ph.id = p_public_hospital_id
                  AND ph.hospital_id = public.current_hospital_id()
            )
        );
$$;

REVOKE ALL ON FUNCTION public.can_manage_hospital_affiliations(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_hospital_affiliations(uuid) TO authenticated;

-- =============================================================
-- 5. DOCTORS TABLE RLS POLICIES
-- =============================================================

-- Public read: only verified AND published doctors
DROP POLICY IF EXISTS doctors_public_select ON public.doctors;
CREATE POLICY doctors_public_select
    ON public.doctors
    FOR SELECT
    TO anon, authenticated
    USING (verification_status = 'verified' AND is_published = true);

-- Authenticated read: doctor_admin/super_admin see all; others see only published
DROP POLICY IF EXISTS doctors_authenticated_select ON public.doctors;
CREATE POLICY doctors_authenticated_select
    ON public.doctors
    FOR SELECT
    TO authenticated
    USING (
        public.is_doctor_admin()
        OR (verification_status = 'verified' AND is_published = true)
    );

-- Insert: only doctor_admin/super_admin
DROP POLICY IF EXISTS doctors_insert ON public.doctors;
CREATE POLICY doctors_insert
    ON public.doctors
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_doctor_admin());

-- Update: only doctor_admin/super_admin
DROP POLICY IF EXISTS doctors_update ON public.doctors;
CREATE POLICY doctors_update
    ON public.doctors
    FOR UPDATE
    TO authenticated
    USING (public.is_doctor_admin())
    WITH CHECK (public.is_doctor_admin());

-- Delete: only super_admin
DROP POLICY IF EXISTS doctors_delete ON public.doctors;
CREATE POLICY doctors_delete
    ON public.doctors
    FOR DELETE
    TO authenticated
    USING (public.is_super_admin());

-- =============================================================
-- 6. HOSPITAL_DOCTORS TABLE RLS POLICIES
-- =============================================================

-- Public read: only active affiliations of verified/published doctors
DROP POLICY IF EXISTS hospital_doctors_public_select ON public.hospital_doctors;
CREATE POLICY hospital_doctors_public_select
    ON public.hospital_doctors
    FOR SELECT
    TO anon, authenticated
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1
            FROM public.doctors d
            WHERE d.id = hospital_doctors.doctor_id
              AND d.verification_status = 'verified'
              AND d.is_published = true
        )
    );

-- Authenticated read: 
--   - doctor_admin/super_admin: all affiliations
--   - Hospital Admin/Staff: own hospital affiliations (including inactive)
--   - Others: only active affiliations of verified/published doctors
DROP POLICY IF EXISTS hospital_doctors_authenticated_select ON public.hospital_doctors;
CREATE POLICY hospital_doctors_authenticated_select
    ON public.hospital_doctors
    FOR SELECT
    TO authenticated
    USING (
        public.is_doctor_admin()
        OR (
            public.current_user_role() IN ('Staff', 'Admin')
            AND EXISTS (
                SELECT 1
                FROM public.public_hospitals ph
                WHERE ph.id = hospital_doctors.public_hospital_id
                  AND ph.hospital_id = public.current_hospital_id()
            )
        )
        OR (
            is_active = true
            AND EXISTS (
                SELECT 1
                FROM public.doctors d
                WHERE d.id = hospital_doctors.doctor_id
                  AND d.verification_status = 'verified'
                  AND d.is_published = true
            )
        )
    );

-- Insert: 
--   - doctor_admin/super_admin: any hospital
--   - Hospital Admin: own hospital only
DROP POLICY IF EXISTS hospital_doctors_insert ON public.hospital_doctors;
CREATE POLICY hospital_doctors_insert
    ON public.hospital_doctors
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_doctor_admin()
        OR (
            public.current_user_role() = 'Admin'
            AND EXISTS (
                SELECT 1
                FROM public.public_hospitals ph
                WHERE ph.id = hospital_doctors.public_hospital_id
                  AND ph.hospital_id = public.current_hospital_id()
            )
        )
    );

-- Update:
--   - doctor_admin/super_admin: any affiliation
--   - Hospital Admin: own hospital affiliations only
DROP POLICY IF EXISTS hospital_doctors_update ON public.hospital_doctors;
CREATE POLICY hospital_doctors_update
    ON public.hospital_doctors
    FOR UPDATE
    TO authenticated
    USING (public.can_manage_hospital_affiliations(public_hospital_id))
    WITH CHECK (public.can_manage_hospital_affiliations(public_hospital_id));

-- Delete:
--   - doctor_admin/super_admin: any affiliation
--   - Hospital Admin: own hospital affiliations only
DROP POLICY IF EXISTS hospital_doctors_delete ON public.hospital_doctors;
CREATE POLICY hospital_doctors_delete
    ON public.hospital_doctors
    FOR DELETE
    TO authenticated
    USING (public.can_manage_hospital_affiliations(public_hospital_id));

-- =============================================================
-- 7. SECURE RPC FUNCTIONS
-- =============================================================

-- 7.1 Get published doctors for a public hospital (public access)
-- Returns only verified, published doctors with active affiliations
CREATE OR REPLACE FUNCTION public.get_published_doctors_for_public_hospital(p_public_hospital_id uuid)
RETURNS TABLE (
    doctor_id uuid,
    full_name text,
    slug text,
    qualification text,
    specialties text[],
    sub_specialties text[],
    experience_years integer,
    languages text[],
    bio text,
    profile_image_url text,
    consultation_fee_inr integer,
    department text,
    designation text,
    is_primary_affiliation boolean,
    appointment_booking_url text,
    hospital_consultation_fee_inr integer,
    is_accepting_patients boolean,
    available_days text[],
    available_hours text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
    SELECT
        d.id AS doctor_id,
        d.full_name,
        d.slug,
        d.qualification,
        d.specialties,
        d.sub_specialties,
        d.experience_years,
        d.languages,
        d.bio,
        d.profile_image_url,
        COALESCE(hd.hospital_consultation_fee_inr, d.consultation_fee_inr) AS consultation_fee_inr,
        hd.department,
        hd.designation,
        hd.is_primary_affiliation,
        hd.appointment_booking_url,
        hd.hospital_consultation_fee_inr,
        hd.is_accepting_patients,
        hd.available_days,
        hd.available_hours
    FROM public.hospital_doctors hd
    JOIN public.doctors d ON d.id = hd.doctor_id
    WHERE hd.public_hospital_id = p_public_hospital_id
      AND hd.is_active = true
      AND d.verification_status = 'verified'
      AND d.is_published = true
    ORDER BY hd.is_primary_affiliation DESC, d.full_name;
$$;

GRANT EXECUTE ON FUNCTION public.get_published_doctors_for_public_hospital(uuid) TO anon, authenticated;

-- 7.2 Get all doctors for hospital admin (includes unpublished/unverified)
CREATE OR REPLACE FUNCTION public.get_all_doctors_for_hospital_admin(p_public_hospital_id uuid)
RETURNS TABLE (
    doctor_id uuid,
    full_name text,
    slug text,
    qualification text,
    specialties text[],
    sub_specialties text[],
    experience_years integer,
    languages text[],
    bio text,
    profile_image_url text,
    consultation_fee_inr integer,
    verification_status text,
    is_published boolean,
    department text,
    designation text,
    is_primary_affiliation boolean,
    appointment_booking_url text,
    hospital_consultation_fee_inr integer,
    is_accepting_patients boolean,
    available_days text[],
    available_hours text,
    is_active boolean,
    affiliation_verified_at timestamptz,
    affiliation_verified_by uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Authorization check
    IF NOT public.can_manage_hospital_affiliations(p_public_hospital_id) THEN
        RAISE EXCEPTION 'Permission denied: cannot access doctors for this hospital';
    END IF;

    RETURN QUERY
    SELECT
        d.id AS doctor_id,
        d.full_name,
        d.slug,
        d.qualification,
        d.specialties,
        d.sub_specialties,
        d.experience_years,
        d.languages,
        d.bio,
        d.profile_image_url,
        COALESCE(hd.hospital_consultation_fee_inr, d.consultation_fee_inr) AS consultation_fee_inr,
        d.verification_status,
        d.is_published,
        hd.department,
        hd.designation,
        hd.is_primary_affiliation,
        hd.appointment_booking_url,
        hd.hospital_consultation_fee_inr,
        hd.is_accepting_patients,
        hd.available_days,
        hd.available_hours,
        hd.is_active,
        hd.affiliation_verified_at,
        hd.affiliation_verified_by
    FROM public.hospital_doctors hd
    JOIN public.doctors d ON d.id = hd.doctor_id
    WHERE hd.public_hospital_id = p_public_hospital_id
    ORDER BY hd.is_primary_affiliation DESC, d.full_name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_doctors_for_hospital_admin(uuid) TO authenticated;

-- 7.3 Create doctor profile (doctor_admin/super_admin only)
CREATE OR REPLACE FUNCTION public.create_doctor_profile(
    p_full_name text,
    p_slug text,
    p_qualification text DEFAULT NULL,
    p_specialties text[] DEFAULT '{}',
    p_sub_specialties text[] DEFAULT '{}',
    p_experience_years integer DEFAULT NULL,
    p_languages text[] DEFAULT '{}',
    p_bio text DEFAULT NULL,
    p_profile_image_url text DEFAULT NULL,
    p_consultation_fee_inr integer DEFAULT NULL,
    p_verification_status text DEFAULT 'unverified',
    p_is_published boolean DEFAULT false,
    p_source_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_doctor_id uuid;
BEGIN
    -- Authorization check
    IF NOT public.is_doctor_admin() THEN
        RAISE EXCEPTION 'Permission denied: only doctor_admin or super_admin can create doctor profiles';
    END IF;

    -- Validate required fields
    IF p_full_name IS NULL OR trim(p_full_name) = '' THEN
        RAISE EXCEPTION 'full_name is required';
    END IF;

    IF p_slug IS NULL OR trim(p_slug) = '' THEN
        RAISE EXCEPTION 'slug is required';
    END IF;

    -- Validate verification_status
    IF p_verification_status NOT IN ('unverified', 'pending', 'verified', 'rejected') THEN
        RAISE EXCEPTION 'Invalid verification_status';
    END IF;

    -- Prevent publishing unverified doctors
    IF p_is_published AND p_verification_status <> 'verified' THEN
        RAISE EXCEPTION 'Cannot publish an unverified doctor';
    END IF;

    INSERT INTO public.doctors (
        full_name,
        slug,
        qualification,
        specialties,
        sub_specialties,
        experience_years,
        languages,
        bio,
        profile_image_url,
        consultation_fee_inr,
        verification_status,
        is_published,
        source_url
    ) VALUES (
        trim(p_full_name),
        trim(p_slug),
        p_qualification,
        p_specialties,
        p_sub_specialties,
        p_experience_years,
        p_languages,
        p_bio,
        p_profile_image_url,
        p_consultation_fee_inr,
        p_verification_status,
        p_is_published,
        p_source_url
    )
    RETURNING id INTO v_doctor_id;

    RETURN v_doctor_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_doctor_profile(
    text, text, text, text[], text[], integer, text[], text, text, integer,
    text, boolean, text
) TO authenticated;

-- 7.4 Create doctor affiliation (Hospital Admin for own hospital, doctor_admin/super_admin for any)
CREATE OR REPLACE FUNCTION public.create_doctor_affiliation(
    p_doctor_id uuid,
    p_public_hospital_id uuid,
    p_department text,
    p_designation text DEFAULT NULL,
    p_is_primary_affiliation boolean DEFAULT false,
    p_appointment_booking_url text DEFAULT NULL,
    p_hospital_consultation_fee_inr integer DEFAULT NULL,
    p_is_accepting_patients boolean DEFAULT true,
    p_available_days text[] DEFAULT '{}',
    p_available_hours text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_affiliation_id uuid;
BEGIN
    -- Authorization check
    IF NOT public.can_manage_hospital_affiliations(p_public_hospital_id) THEN
        RAISE EXCEPTION 'Permission denied: cannot create affiliations for this hospital';
    END IF;

    -- Validate doctor exists
    IF NOT EXISTS (SELECT 1 FROM public.doctors WHERE id = p_doctor_id) THEN
        RAISE EXCEPTION 'Doctor not found';
    END IF;

    -- Validate public_hospital exists
    IF NOT EXISTS (SELECT 1 FROM public.public_hospitals WHERE id = p_public_hospital_id) THEN
        RAISE EXCEPTION 'Public hospital not found';
    END IF;

    -- Validate required fields
    IF p_department IS NULL OR trim(p_department) = '' THEN
        RAISE EXCEPTION 'department is required';
    END IF;

    -- If setting as primary, unset any existing primary for this doctor at this hospital
    IF p_is_primary_affiliation THEN
        UPDATE public.hospital_doctors
        SET is_primary_affiliation = false,
            updated_at = now()
        WHERE doctor_id = p_doctor_id
          AND public_hospital_id = p_public_hospital_id
          AND is_primary_affiliation = true
          AND is_active = true;
    END IF;

    INSERT INTO public.hospital_doctors (
        doctor_id,
        public_hospital_id,
        department,
        designation,
        is_primary_affiliation,
        appointment_booking_url,
        hospital_consultation_fee_inr,
        is_accepting_patients,
        available_days,
        available_hours
    ) VALUES (
        p_doctor_id,
        p_public_hospital_id,
        trim(p_department),
        p_designation,
        p_is_primary_affiliation,
        p_appointment_booking_url,
        p_hospital_consultation_fee_inr,
        p_is_accepting_patients,
        p_available_days,
        p_available_hours
    )
    RETURNING id INTO v_affiliation_id;

    RETURN v_affiliation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_doctor_affiliation(
    uuid, uuid, text, text, boolean, text, integer, boolean, text[], text
) TO authenticated;

-- 7.5 Verify and publish doctor (doctor_admin/super_admin only)
CREATE OR REPLACE FUNCTION public.verify_and_publish_doctor(
    p_doctor_id uuid,
    p_verification_status text,
    p_is_published boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Authorization check
    IF NOT public.is_doctor_admin() THEN
        RAISE EXCEPTION 'Permission denied: only doctor_admin or super_admin can verify/publish doctors';
    END IF;

    -- Validate verification_status
    IF p_verification_status NOT IN ('unverified', 'pending', 'verified', 'rejected') THEN
        RAISE EXCEPTION 'Invalid verification_status';
    END IF;

    -- Prevent publishing unverified doctors
    IF p_is_published AND p_verification_status <> 'verified' THEN
        RAISE EXCEPTION 'Cannot publish an unverified doctor';
    END IF;

    -- Validate doctor exists
    IF NOT EXISTS (SELECT 1 FROM public.doctors WHERE id = p_doctor_id) THEN
        RAISE EXCEPTION 'Doctor not found';
    END IF;

    UPDATE public.doctors
    SET
        verification_status = p_verification_status,
        is_published = p_is_published,
        last_verified_at = CASE
            WHEN p_verification_status = 'verified' THEN now()
            ELSE last_verified_at
        END,
        verified_by = CASE
            WHEN p_verification_status = 'verified' THEN auth.uid()
            ELSE verified_by
        END,
        updated_at = now()
    WHERE id = p_doctor_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_and_publish_doctor(uuid, text, boolean) TO authenticated;

-- 7.6 Assign privileged role (super_admin only)
CREATE OR REPLACE FUNCTION public.assign_privileged_role(
    p_target_user_id uuid,
    p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_role text;
    v_target_exists boolean;
BEGIN
    -- Authorization check: only super_admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Permission denied: only super_admin can assign privileged roles';
    END IF;

    -- Validate role
    IF p_role NOT IN ('doctor_admin', 'super_admin') THEN
        RAISE EXCEPTION 'Invalid role: can only assign doctor_admin or super_admin';
    END IF;

    -- Prevent NULL role bypass
    IF p_role IS NULL THEN
        RAISE EXCEPTION 'Role cannot be NULL';
    END IF;

    -- Prevent unauthorized self-promotion (super_admin assigning super_admin to self is allowed)
    v_caller_role := public.current_user_role();
    IF p_target_user_id = auth.uid() AND p_role = 'super_admin' AND v_caller_role <> 'super_admin' THEN
        RAISE EXCEPTION 'Cannot self-promote to super_admin';
    END IF;

    -- Check target user exists
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_target_user_id)
    INTO v_target_exists;

    IF NOT v_target_exists THEN
        RAISE EXCEPTION 'Target user profile not found';
    END IF;

    UPDATE public.profiles
    SET role = p_role,
        updated_at = now()
    WHERE id = p_target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_privileged_role(uuid, text) TO authenticated;

-- =============================================================
-- 8. UPDATED_AT TRIGGERS
-- =============================================================

-- Doctors updated_at trigger
CREATE OR REPLACE FUNCTION public.update_doctors_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_doctors_updated_at ON public.doctors;
CREATE TRIGGER trg_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION public.update_doctors_updated_at();

-- Hospital_doctors updated_at trigger
CREATE OR REPLACE FUNCTION public.update_hospital_doctors_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hospital_doctors_updated_at ON public.hospital_doctors;
CREATE TRIGGER trg_hospital_doctors_updated_at
    BEFORE UPDATE ON public.hospital_doctors
    FOR EACH ROW EXECUTE FUNCTION public.update_hospital_doctors_updated_at();

-- =============================================================
-- 9. TABLE GRANTS
-- =============================================================
REVOKE ALL ON public.doctors FROM anon, authenticated;
GRANT SELECT ON public.doctors TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctors TO authenticated;

REVOKE ALL ON public.hospital_doctors FROM anon, authenticated;
GRANT SELECT ON public.hospital_doctors TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospital_doctors TO authenticated;

-- Function grants already handled inline above

COMMIT;