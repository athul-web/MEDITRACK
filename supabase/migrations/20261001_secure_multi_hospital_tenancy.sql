-- Migration: Secure Multi-Hospital Tenant Isolation (CORRECTED)
-- Applied after 20260921_multi_hospital_tenancy.sql
--
-- This is a corrected replacement for the original 20261001 draft. It has
-- NOT been run against a live database. It is written to be idempotent:
-- safe to run after 20260921 has been applied, and safe to re-run itself.
--
-- Fixes vs. the original draft (see accompanying change log for details):
--   1. RLS was never enabled on any table by either migration -> every
--      policy below was previously a no-op. This migration enables RLS.
--   2. Every CREATE POLICY that duplicated a name already created by
--      20260921 is now preceded by DROP POLICY IF EXISTS, so this file no
--      longer aborts with "policy already exists".
--   3. Admin policies checked the ROLE COLUMN OF THE TARGET ROW
--      ("role = 'Admin'") instead of the caller's own role. On profiles
--      this let any hospital member modify/delete an admin's own profile
--      row. On the other tables it referenced a "role" column that these
--      tables do not appear to define at all, which would have made the
--      migration fail outright. Replaced everywhere with a new
--      current_user_role() helper scoped to auth.uid().
--   4. profiles_insert_policy could never succeed for a brand-new signup:
--      it required hospital_id = current_hospital_id(), but
--      current_hospital_id() looks up the CALLER'S OWN existing profiles
--      row -- which does not exist yet during that same INSERT. Replaced
--      with a signup-safe check against the same default hospital the
--      onboarding trigger assigns.
--   5. increment_equipment_downtime() was SECURITY DEFINER and grantable
--      to PUBLIC (including anon), with no validation on `hours`.
--      Rewritten as SECURITY INVOKER (relies on existing RLS instead of
--      re-implementing it), input-validated, atomic, and restricted to
--      the `authenticated` role.
--
-- NOT independently verified (no access to supabase_schema.sql):
--   - Whether `technicians`, `equipment`, `problem_reports`,
--     `maintenance_records`, `notifications`, `facility_settings` have a
--     `role` column. The fix below sidesteps the question entirely by
--     never referencing that column on those tables.
--   - The exact type of `profiles.role` (text/varchar/enum). The helper
--     below casts explicitly to text so it works either way.
--   - The current GRANT state on these tables for `anon`/`authenticated`.
--     This migration adds explicit REVOKE/GRANT statements defensively;
--     please confirm they match your intended access model.
--   - Whether any other role (besides table owner) needs to bypass RLS
--     directly against the table owner. FORCE ROW LEVEL SECURITY is
--     deliberately NOT enabled here -- see the change log for why.

BEGIN;

-- =============================================================
-- 0. ENABLE ROW LEVEL SECURITY
-- =============================================================
-- Neither prior migration enabled RLS. Without this, every policy below
-- (and every policy 20260921 already created) has no effect at all.
ALTER TABLE public.hospitals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 1. DROP LEGACY / PRE-EXISTING POLICIES (idempotent guards)
-- =============================================================
-- 1a. Legacy pre-tenancy policy names (carried over from the original
--     draft; harmless no-ops if these were never created).
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view technicians" ON public.technicians;
DROP POLICY IF EXISTS "Admins can manage technicians" ON public.technicians;
DROP POLICY IF EXISTS "Staff can insert technicians" ON public.technicians;
DROP POLICY IF EXISTS "Staff can update technicians" ON public.technicians;
DROP POLICY IF EXISTS "Anyone can view equipment" ON public.equipment;
DROP POLICY IF EXISTS "Admins can manage equipment" ON public.equipment;
DROP POLICY IF EXISTS "Staff can insert equipment" ON public.equipment;
DROP POLICY IF EXISTS "Staff can update equipment" ON public.equipment;
DROP POLICY IF EXISTS "Anyone can view problem reports" ON public.problem_reports;
DROP POLICY IF EXISTS "Authenticated users can report problems" ON public.problem_reports;
DROP POLICY IF EXISTS "Admins can manage problem reports" ON public.problem_reports;
DROP POLICY IF EXISTS "Staff can update problem reports" ON public.problem_reports;
DROP POLICY IF EXISTS "Anyone can view maintenance" ON public.maintenance_records;
DROP POLICY IF EXISTS "Admins can manage maintenance" ON public.maintenance_records;
DROP POLICY IF EXISTS "Staff can insert maintenance records" ON public.maintenance_records;
DROP POLICY IF EXISTS "Staff can update maintenance records" ON public.maintenance_records;
DROP POLICY IF EXISTS "Anyone can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "Staff can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can view settings" ON public.facility_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.facility_settings;

-- 1b. Policies already created by 20260921 that this migration replaces.
--     Dropping these here (rather than relying on 20260921 not having run
--     yet) is what makes this migration safe to run after 20260921 AND
--     safe to re-run itself.
DROP POLICY IF EXISTS hospitals_select_policy        ON public.hospitals;
DROP POLICY IF EXISTS profiles_select_policy         ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_policy         ON public.profiles;
DROP POLICY IF EXISTS profiles_update_policy         ON public.profiles;
DROP POLICY IF EXISTS technicians_select_policy      ON public.technicians;
DROP POLICY IF EXISTS technicians_insert_policy      ON public.technicians;
DROP POLICY IF EXISTS technicians_update_policy      ON public.technicians;
DROP POLICY IF EXISTS fac_settings_select_policy     ON public.facility_settings;
DROP POLICY IF EXISTS fac_settings_insert_policy     ON public.facility_settings;
DROP POLICY IF EXISTS fac_settings_update_policy     ON public.facility_settings;
DROP POLICY IF EXISTS equipment_select_policy        ON public.equipment;
DROP POLICY IF EXISTS equipment_insert_policy        ON public.equipment;
DROP POLICY IF EXISTS equipment_update_policy        ON public.equipment;
DROP POLICY IF EXISTS problem_reports_select_policy  ON public.problem_reports;
DROP POLICY IF EXISTS problem_reports_insert_policy  ON public.problem_reports;
DROP POLICY IF EXISTS problem_reports_update_policy  ON public.problem_reports;
DROP POLICY IF EXISTS maintenance_select_policy      ON public.maintenance_records;
DROP POLICY IF EXISTS maintenance_insert_policy      ON public.maintenance_records;
DROP POLICY IF EXISTS maintenance_update_policy      ON public.maintenance_records;
DROP POLICY IF EXISTS notifications_select_policy    ON public.notifications;
DROP POLICY IF EXISTS notifications_insert_policy    ON public.notifications;
DROP POLICY IF EXISTS notifications_update_policy    ON public.notifications;

-- 1c. Policies this migration itself creates further down (guards for
--     re-running this file).
DROP POLICY IF EXISTS profiles_delete_policy         ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_policy          ON public.profiles;
DROP POLICY IF EXISTS technicians_delete_policy      ON public.technicians;
DROP POLICY IF EXISTS technicians_admin_policy       ON public.technicians;
DROP POLICY IF EXISTS equipment_delete_policy        ON public.equipment;
DROP POLICY IF EXISTS equipment_admin_policy         ON public.equipment;
DROP POLICY IF EXISTS problem_reports_delete_policy  ON public.problem_reports;
DROP POLICY IF EXISTS problem_reports_admin_policy   ON public.problem_reports;
DROP POLICY IF EXISTS maintenance_delete_policy      ON public.maintenance_records;
DROP POLICY IF EXISTS maintenance_admin_policy       ON public.maintenance_records;
DROP POLICY IF EXISTS notifications_delete_policy    ON public.notifications;
DROP POLICY IF EXISTS notifications_admin_policy     ON public.notifications;
DROP POLICY IF EXISTS fac_settings_delete_policy     ON public.facility_settings;
DROP POLICY IF EXISTS fac_settings_admin_policy      ON public.facility_settings;

-- =============================================================
-- 2. HELPER FUNCTIONS
-- =============================================================
-- public.current_hospital_id() already exists from 20260921 and is
-- correct as written (STABLE, SECURITY DEFINER, fixed search_path,
-- keyed only off auth.uid() with no client-supplied input) -- left
-- untouched here.

-- NEW: caller's own role, resolved server-side the same way
-- current_hospital_id() resolves the caller's own hospital. Any
-- authorization check that means "is the CALLER an Admin" should use
-- this -- never a role column on the row being accessed.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role::text
    FROM   public.profiles
    WHERE  id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

-- NEW: the single default hospital used for onboarding. Factored out of
-- the signup trigger so the trigger and the INSERT policy use one
-- source of truth instead of two independent lookups that could drift.
-- SECURITY DEFINER is required here: a brand-new user has no profiles
-- row yet, so they cannot pass hospitals_select_policy (which itself
-- depends on current_hospital_id(), which depends on having a profiles
-- row) to read this value directly.
CREATE OR REPLACE FUNCTION public.default_onboarding_hospital_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id
    FROM   public.hospitals
    WHERE  facility_code = 'CGH-01'
    LIMIT  1;
$$;

REVOKE ALL ON FUNCTION public.default_onboarding_hospital_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.default_onboarding_hospital_id() TO authenticated;

-- Re-point the existing onboarding trigger at the shared helper. This
-- does not need a new CREATE TRIGGER statement -- the trigger created in
-- 20260921 already calls this function by name, so replacing the
-- function body is enough. Behavior for existing signups is unchanged
-- (still forces every new profile onto the single default hospital).
CREATE OR REPLACE FUNCTION public.assign_hospital_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.hospital_id := public.default_onboarding_hospital_id();
    RETURN NEW;
END;
$$;

-- =============================================================
-- 3. TABLE GRANTS (defensive -- see "not independently verified" above)
-- =============================================================
-- GRANT is additive/idempotent (re-granting an existing privilege is a
-- no-op) and REVOKE on a privilege that was never granted is also a
-- no-op, so these are safe to run regardless of the current state.
REVOKE ALL ON public.hospitals, public.profiles, public.technicians,
    public.facility_settings, public.equipment, public.problem_reports,
    public.maintenance_records, public.notifications
    FROM anon;

GRANT SELECT ON public.hospitals TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
    public.profiles, public.technicians, public.facility_settings,
    public.equipment, public.problem_reports, public.maintenance_records,
    public.notifications
    TO authenticated;

-- =============================================================
-- 4. SELECT POLICIES (tenant-scoped)
-- =============================================================
CREATE POLICY hospitals_select_policy
    ON public.hospitals
    FOR SELECT
    USING (id = public.current_hospital_id());

CREATE POLICY profiles_select_policy
    ON public.profiles
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY technicians_select_policy
    ON public.technicians
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY equipment_select_policy
    ON public.equipment
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY problem_reports_select_policy
    ON public.problem_reports
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY maintenance_select_policy
    ON public.maintenance_records
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY notifications_select_policy
    ON public.notifications
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY fac_settings_select_policy
    ON public.facility_settings
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

-- =============================================================
-- 5. INSERT POLICIES (WITH CHECK)
-- =============================================================
-- profiles: must be the caller's own row, and must land on the default
-- onboarding hospital -- the SAME value the BEFORE INSERT trigger forces
-- onto NEW.hospital_id. (The old version compared against
-- current_hospital_id(), which requires an existing profiles row for
-- this same user and therefore rejected every first-time signup.)
CREATE POLICY profiles_insert_policy
    ON public.profiles
    FOR INSERT
    WITH CHECK (
        id = auth.uid()
        AND hospital_id = public.default_onboarding_hospital_id()
    );

CREATE POLICY technicians_insert_policy
    ON public.technicians
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY equipment_insert_policy
    ON public.equipment
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY problem_reports_insert_policy
    ON public.problem_reports
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY maintenance_insert_policy
    ON public.maintenance_records
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY notifications_insert_policy
    ON public.notifications
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY fac_settings_insert_policy
    ON public.facility_settings
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

-- =============================================================
-- 6. UPDATE POLICIES (USING + WITH CHECK)
-- =============================================================
-- profiles: a user may only ever touch their OWN row (USING), may not
-- move it to another hospital, and may not change their own role.
-- Both checks compare the NEW value against the OLD value read via
-- current_hospital_id()/current_user_role() -- because those helper
-- functions query profiles fresh, and MVCC visibility rules mean that
-- query sees the pre-update row for the very row being updated in the
-- same command, this correctly pins "new must equal old" without
-- needing to reference OLD.* directly (which RLS expressions cannot do).
CREATE POLICY profiles_update_policy
    ON public.profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (
        hospital_id = public.current_hospital_id()
        AND role::text = public.current_user_role()
    );

CREATE POLICY technicians_update_policy
    ON public.technicians
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY equipment_update_policy
    ON public.equipment
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY problem_reports_update_policy
    ON public.problem_reports
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY maintenance_update_policy
    ON public.maintenance_records
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY notifications_update_policy
    ON public.notifications
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY fac_settings_update_policy
    ON public.facility_settings
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

-- =============================================================
-- 7. DELETE POLICIES (Admin-only, within the admin's own hospital)
-- =============================================================
-- FIXED: these now check the CALLER's role via current_user_role(),
-- never a "role" column on the row/table being deleted from.
CREATE POLICY profiles_delete_policy
    ON public.profiles
    FOR DELETE
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY technicians_delete_policy
    ON public.technicians
    FOR DELETE
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY equipment_delete_policy
    ON public.equipment
    FOR DELETE
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY problem_reports_delete_policy
    ON public.problem_reports
    FOR DELETE
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY maintenance_delete_policy
    ON public.maintenance_records
    FOR DELETE
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY notifications_delete_policy
    ON public.notifications
    FOR DELETE
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY fac_settings_delete_policy
    ON public.facility_settings
    FOR DELETE
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

-- =============================================================
-- 8. ADMIN "FOR ALL" POLICIES, SCOPED TO THE ADMIN'S OWN HOSPITAL
-- =============================================================
-- FIXED (same bug as section 7, more severe here): the original version
-- authorized on the TARGET row's role, not the caller's. On `profiles`
-- specifically, that meant "any hospital member may UPDATE/DELETE any
-- row whose role happens to be Admin" -- i.e. non-admin staff could
-- modify or delete an admin's own profile. Replaced with
-- current_user_role() everywhere; these policies now never reference a
-- role column on technicians/equipment/problem_reports/
-- maintenance_records/notifications/facility_settings at all, so it no
-- longer matters whether those tables even have one.
CREATE POLICY profiles_admin_policy
    ON public.profiles
    FOR ALL
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    )
    WITH CHECK (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY technicians_admin_policy
    ON public.technicians
    FOR ALL
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    )
    WITH CHECK (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY equipment_admin_policy
    ON public.equipment
    FOR ALL
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    )
    WITH CHECK (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY problem_reports_admin_policy
    ON public.problem_reports
    FOR ALL
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    )
    WITH CHECK (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY maintenance_admin_policy
    ON public.maintenance_records
    FOR ALL
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    )
    WITH CHECK (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY notifications_admin_policy
    ON public.notifications
    FOR ALL
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    )
    WITH CHECK (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

CREATE POLICY fac_settings_admin_policy
    ON public.facility_settings
    FOR ALL
    USING (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    )
    WITH CHECK (
        public.current_user_role() = 'Admin'
        AND hospital_id = public.current_hospital_id()
    );

-- =============================================================
-- 9. SECURE RPC: increment_equipment_downtime
-- =============================================================
-- FIXED:
--   - SECURITY INVOKER instead of DEFINER: tenant isolation is now
--     enforced by equipment_update_policy (already scoped to
--     hospital_id = current_hospital_id()) rather than re-implemented
--     inside the function, so there is no need for this function to run
--     with elevated privileges at all.
--   - `hours` is validated: rejects NULL, negative, NaN and +/-Infinity
--     before touching any row.
--   - The permission check and the update are now a single atomic
--     UPDATE ... WHERE ... RETURNING, instead of a separate EXISTS
--     check followed by an unconditional UPDATE.
--   - EXECUTE is revoked from PUBLIC (which includes anon) and granted
--     only to `authenticated`.
CREATE OR REPLACE FUNCTION public.increment_equipment_downtime(
    equipment_id uuid,
    hours float
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_updated_id uuid;
BEGIN
    IF hours IS NULL THEN
        RAISE EXCEPTION 'hours must not be NULL';
    END IF;

    IF hours = 'NaN'::float THEN
        RAISE EXCEPTION 'hours must not be NaN';
    END IF;

    IF hours = 'Infinity'::float OR hours = '-Infinity'::float THEN
        RAISE EXCEPTION 'hours must be finite';
    END IF;

    IF hours < 0 THEN
        RAISE EXCEPTION 'hours must not be negative';
    END IF;

    -- Relies on equipment_update_policy for tenant scoping: if the
    -- equipment row is not in the caller's hospital, RLS makes it
    -- invisible to this UPDATE and zero rows are affected, regardless
    -- of what this function's own WHERE clause says.
    UPDATE public.equipment
    SET    total_downtime_hours = COALESCE(total_downtime_hours, 0) + hours
    WHERE  id = equipment_id
      AND  hospital_id = public.current_hospital_id()
    RETURNING id INTO v_updated_id;

    IF v_updated_id IS NULL THEN
        RAISE EXCEPTION 'Permission denied: equipment not found or not in your hospital';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_equipment_downtime(uuid, float) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_equipment_downtime(uuid, float) TO authenticated;

COMMIT;
