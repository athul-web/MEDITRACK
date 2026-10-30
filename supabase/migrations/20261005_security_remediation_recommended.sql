-- Migration: 20261005_security_remediation_recommended.sql
-- PURPOSE: Corrective security baseline for gaps discovered during the MediTrack
-- security audit. This migration is NOT automatically applied by the repository
-- deployment process shown here. Treat it as PREPARED SQL for manual review and
-- execution against a dedicated test database before any production deployment.
--
-- STATUS: Pending / manual review required.

BEGIN;

-- =============================================================
-- 1. Enable RLS on previously omitted public-facing tables
-- =============================================================
ALTER TABLE public.public_hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 2. Public hospital directory: read-only to clients
-- =============================================================
REVOKE ALL ON public.public_hospitals FROM anon, authenticated;
GRANT SELECT ON public.public_hospitals TO anon, authenticated;

DROP POLICY IF EXISTS "public_hospitals_select_all" ON public.public_hospitals;
CREATE POLICY public_hospitals_select_all
    ON public.public_hospitals
    FOR SELECT
    USING (true);

-- Intentionally no INSERT/UPDATE/DELETE policy here. Anonymous users cannot
-- mutate public hospital records. A future controlled resource-update feature
-- must use an Edge Function/service-role path or an explicitly authenticated
-- workflow with a separate submissions table.
REVOKE INSERT, UPDATE, DELETE ON public.public_hospitals
    FROM anon, authenticated;

-- =============================================================
-- 3. Contact inquiries: Edge Function is the intended intake path
-- =============================================================
REVOKE ALL ON public.contact_inquiries FROM anon, authenticated;
-- Administrators may review and update inquiry status through authorized clients.
GRANT SELECT, UPDATE, DELETE ON public.contact_inquiries TO authenticated;

DROP POLICY IF EXISTS "Allow anon to insert inquiries" ON public.contact_inquiries;
DROP POLICY IF EXISTS "contact_inquiries_admin_policy" ON public.contact_inquiries;
CREATE POLICY contact_inquiries_admin_policy
    ON public.contact_inquiries
    FOR ALL
    TO authenticated
    USING (
        public.current_user_role() = 'Admin'
    )
    WITH CHECK (
        public.current_user_role() = 'Admin'
    );

-- Anon INSERT is intentionally removed. Anonymous submissions, if still
-- required, must go through the validated Supabase Edge Function which uses a
-- trusted service-role client. Keep the service role secret server-side only.

-- =============================================================
-- 4. Re-validate tenant RLS enablement for core operational tables
-- =============================================================
ALTER TABLE public.hospitals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 5. Remove legacy broad policy names if this base schema was used
-- =============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view technicians" ON public.technicians;
DROP POLICY IF EXISTS "Admins can manage technicians" ON public.technicians;
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
DROP POLICY IF EXISTS "Public hospitals are viewable by everyone" ON public.public_hospitals;

-- =============================================================
-- 6. Correct RPC argument type to match equipment.id (text)
-- =============================================================
DROP FUNCTION IF EXISTS public.increment_equipment_downtime(uuid, double precision);
CREATE FUNCTION public.increment_equipment_downtime(
    equipment_id text,
    hours double precision
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_updated_id text;
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

    UPDATE public.equipment
    SET total_downtime_hours = COALESCE(total_downtime_hours, 0) + hours
    WHERE id = equipment_id
      AND hospital_id = public.current_hospital_id()
    RETURNING id INTO v_updated_id;

    IF v_updated_id IS NULL THEN
        RAISE EXCEPTION 'Permission denied: equipment not found or not in your hospital';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_equipment_downtime(text, double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_equipment_downtime(text, double precision) TO authenticated;

COMMIT;
