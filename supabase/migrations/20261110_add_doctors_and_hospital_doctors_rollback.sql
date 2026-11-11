-- Migration: 20261110_add_doctors_and_hospital_doctors_rollback.sql
-- PURPOSE: Rollback for 20261110_add_doctors_and_hospital_doctors.sql
-- WARNING: This will PERMANENTLY DELETE all doctor profiles and affiliations.
-- Never execute against production without explicit approval and backup.

BEGIN;

-- =============================================================
-- 1. DROP TRIGGERS (before dropping trigger functions)
-- =============================================================
DROP TRIGGER IF EXISTS trg_doctors_updated_at ON public.doctors;
DROP TRIGGER IF EXISTS trg_hospital_doctors_updated_at ON public.hospital_doctors;

-- =============================================================
-- 2. DROP TRIGGER FUNCTIONS
-- =============================================================
DROP FUNCTION IF EXISTS public.update_doctors_updated_at();
DROP FUNCTION IF EXISTS public.update_hospital_doctors_updated_at();

-- =============================================================
-- 3. REVOKE FUNCTION EXECUTE GRANTS
-- =============================================================
-- Note: REVOKE is idempotent; safe to run even if grants don't exist
REVOKE ALL ON FUNCTION public.get_published_doctors_for_public_hospital(uuid) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.get_all_doctors_for_hospital_admin(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.create_doctor_profile(text, text, text, text[], text[], integer, text[], text, text, integer, text, boolean, text) FROM authenticated;
REVOKE ALL ON FUNCTION public.create_doctor_affiliation(uuid, uuid, text, text, boolean, text, integer, boolean, text[], text) FROM authenticated;
REVOKE ALL ON FUNCTION public.verify_and_publish_doctor(uuid, text, boolean) FROM authenticated;
REVOKE ALL ON FUNCTION public.assign_privileged_role(uuid, text) FROM authenticated;
REVOKE ALL ON FUNCTION public.is_doctor_admin() FROM authenticated;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM authenticated;
REVOKE ALL ON FUNCTION public.can_manage_hospital_affiliations(uuid) FROM authenticated;

-- =============================================================
-- 4. DROP RPC FUNCTIONS
-- =============================================================
DROP FUNCTION IF EXISTS public.get_published_doctors_for_public_hospital(uuid);
DROP FUNCTION IF EXISTS public.get_all_doctors_for_hospital_admin(uuid);
DROP FUNCTION IF EXISTS public.create_doctor_profile(text, text, text, text[], text[], integer, text[], text, text, integer, text, boolean, text);
DROP FUNCTION IF EXISTS public.create_doctor_affiliation(uuid, uuid, text, text, boolean, text, integer, boolean, text[], text);
DROP FUNCTION IF EXISTS public.verify_and_publish_doctor(uuid, text, boolean);
DROP FUNCTION IF EXISTS public.assign_privileged_role(uuid, text);
DROP FUNCTION IF EXISTS public.is_doctor_admin();
DROP FUNCTION IF EXISTS public.is_super_admin();
DROP FUNCTION IF EXISTS public.can_manage_hospital_affiliations(uuid);

-- =============================================================
-- 5. DROP RLS POLICIES (before dropping tables)
-- =============================================================
DROP POLICY IF EXISTS doctors_public_select ON public.doctors;
DROP POLICY IF EXISTS doctors_authenticated_select ON public.doctors;
DROP POLICY IF EXISTS doctors_insert ON public.doctors;
DROP POLICY IF EXISTS doctors_update ON public.doctors;
DROP POLICY IF EXISTS doctors_delete ON public.doctors;

DROP POLICY IF EXISTS hospital_doctors_public_select ON public.hospital_doctors;
DROP POLICY IF EXISTS hospital_doctors_authenticated_select ON public.hospital_doctors;
DROP POLICY IF EXISTS hospital_doctors_insert ON public.hospital_doctors;
DROP POLICY IF EXISTS hospital_doctors_update ON public.hospital_doctors;
DROP POLICY IF EXISTS hospital_doctors_delete ON public.hospital_doctors;

-- =============================================================
-- 6. DROP TABLES (CASCADE will drop dependent indexes, constraints)
-- =============================================================
-- WARNING: THIS PERMANENTLY DELETES ALL DATA IN THESE TABLES
DROP TABLE IF EXISTS public.hospital_doctors CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;

-- =============================================================
-- 7. REVERT PROFILES ROLE CONSTRAINT
-- =============================================================
-- Revert to original roles: Staff, Admin only
-- WARNING: This will fail if any profiles have doctor_admin or super_admin role.
-- You must manually reassign those profiles to Staff or Admin first.
ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('Staff', 'Admin'));

COMMENT ON COLUMN public.profiles.role IS 'User role: Staff or Admin (hospital-scoped)';

COMMIT;

-- =============================================================
-- POST-ROLLBACK NOTES
-- =============================================================
-- 1. All doctor profiles and hospital affiliations have been DELETED.
-- 2. The profiles.role constraint has been reverted to ('Staff', 'Admin').
--    If any profiles had 'doctor_admin' or 'super_admin' roles, the constraint
--    recreation would have failed. In that case, you must:
--    UPDATE public.profiles SET role = 'Admin' WHERE role IN ('doctor_admin', 'super_admin');
--    before running the constraint recreation.
-- 3. The helper functions (current_hospital_id, current_user_role, etc.) are
--    PRESERVED as they belong to the core multi-hospital tenancy feature.
-- 4. The public_hospitals table and its data are PRESERVED.