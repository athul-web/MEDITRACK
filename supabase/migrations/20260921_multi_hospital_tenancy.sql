BEGIN;

-- 1️⃣  Master tenant table
CREATE TABLE IF NOT EXISTS public.hospitals (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name          text NOT NULL,
    facility_code text NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_hospitals_name_code   UNIQUE (name, facility_code),
    CONSTRAINT uq_hospitals_facility_code UNIQUE (facility_code)
);

-- 2️⃣  Insert the single default hospital (City General Hospital)
INSERT INTO public.hospitals (name, facility_code)
SELECT 'City General Hospital' AS name,
       'CGH-01'               AS facility_code
WHERE NOT EXISTS (
      SELECT 1
      FROM   public.hospitals
      WHERE  name = 'City General Hospital'
        AND  facility_code = 'CGH-01'
);

-- 3️⃣  Add nullable hospital_id column to every tenant‑owned table
ALTER TABLE public.profiles          ADD COLUMN IF NOT EXISTS hospital_id uuid;
ALTER TABLE public.technicians      ADD COLUMN IF NOT EXISTS hospital_id uuid;
ALTER TABLE public.facility_settings ADD COLUMN IF NOT EXISTS hospital_id uuid;
ALTER TABLE public.equipment        ADD COLUMN IF NOT EXISTS hospital_id uuid;
ALTER TABLE public.problem_reports  ADD COLUMN IF NOT EXISTS hospital_id uuid;
ALTER TABLE public.maintenance_records ADD COLUMN IF NOT EXISTS hospital_id uuid;
ALTER TABLE public.notifications    ADD COLUMN IF NOT EXISTS hospital_id uuid;

-- 4️⃣  Back‑fill every row with the default hospital's UUID
WITH default_hospital AS (
    SELECT id FROM public.hospitals
    WHERE name = 'City General Hospital' AND facility_code = 'CGH-01'
)
UPDATE public.profiles
SET    hospital_id = (SELECT id FROM default_hospital)
WHERE  hospital_id IS NULL;

WITH default_hospital AS (
    SELECT id FROM public.hospitals
    WHERE name = 'City General Hospital' AND facility_code = 'CGH-01'
)
UPDATE public.technicians
SET    hospital_id = (SELECT id FROM default_hospital)
WHERE  hospital_id IS NULL;

WITH default_hospital AS (
    SELECT id FROM public.hospitals
    WHERE name = 'City General Hospital' AND facility_code = 'CGH-01'
)
UPDATE public.facility_settings
SET    hospital_id = (SELECT id FROM default_hospital)
WHERE  hospital_id IS NULL;

WITH default_hospital AS (
    SELECT id FROM public.hospitals
    WHERE name = 'City General Hospital' AND facility_code = 'CGH-01'
)
UPDATE public.equipment
SET    hospital_id = (SELECT id FROM default_hospital)
WHERE  hospital_id IS NULL;

WITH default_hospital AS (
    SELECT id FROM public.hospitals
    WHERE name = 'City General Hospital' AND facility_code = 'CGH-01'
)
UPDATE public.problem_reports
SET    hospital_id = (SELECT id FROM default_hospital)
WHERE  hospital_id IS NULL;

WITH default_hospital AS (
    SELECT id FROM public.hospitals
    WHERE name = 'City General Hospital' AND facility_code = 'CGH-01'
)
UPDATE public.maintenance_records
SET    hospital_id = (SELECT id FROM default_hospital)
WHERE  hospital_id IS NULL;

WITH default_hospital AS (
    SELECT id FROM public.hospitals
    WHERE name = 'City General Hospital' AND facility_code = 'CGH-01'
)
UPDATE public.notifications
SET    hospital_id = (SELECT id FROM default_hospital)
WHERE  hospital_id IS NULL;

-- 5️⃣  Validation: ensure no NULL hospital_id remains (pre‑constraint checks)
SELECT
    (SELECT COUNT(*) FROM public.profiles            WHERE hospital_id IS NULL) AS profiles_null,
    (SELECT COUNT(*) FROM public.technicians        WHERE hospital_id IS NULL) AS technicians_null,
    (SELECT COUNT(*) FROM public.facility_settings WHERE hospital_id IS NULL) AS fac_settings_null,
    (SELECT COUNT(*) FROM public.equipment          WHERE hospital_id IS NULL) AS equipment_null,
    (SELECT COUNT(*) FROM public.problem_reports    WHERE hospital_id IS NULL) AS problem_reports_null,
    (SELECT COUNT(*) FROM public.maintenance_records WHERE hospital_id IS NULL) AS maintenance_null,
    (SELECT COUNT(*) FROM public.notifications      WHERE hospital_id IS NULL) AS notifications_null;

-- Part 2: Constraints, indexes, FK changes, helper function, and trigger

-- 1️⃣  Make hospital_id NOT NULL and add tenant‑scoped constraints & indexes
ALTER TABLE public.profiles
    ALTER COLUMN hospital_id SET NOT NULL,
    ADD CONSTRAINT fk_profiles_hospital
        FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_profiles_id_hospital UNIQUE (id, hospital_id);
CREATE INDEX IF NOT EXISTS idx_profiles_hospital_id ON public.profiles (hospital_id);

ALTER TABLE public.technicians
    ALTER COLUMN hospital_id SET NOT NULL,
    ADD CONSTRAINT fk_technicians_hospital
        FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_technicians_id_hospital UNIQUE (id, hospital_id);
CREATE INDEX IF NOT EXISTS idx_technicians_hospital_id ON public.technicians (hospital_id);

ALTER TABLE public.facility_settings
    ALTER COLUMN hospital_id SET NOT NULL,
    ADD CONSTRAINT fk_fac_settings_hospital
        FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_fac_settings_hospital UNIQUE (hospital_id);   -- one settings row per hospital
CREATE INDEX IF NOT EXISTS idx_fac_settings_hospital_id ON public.facility_settings (hospital_id);

ALTER TABLE public.equipment
    ALTER COLUMN hospital_id SET NOT NULL,
    ADD CONSTRAINT fk_equipment_hospital
        FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_equipment_id_hospital UNIQUE (id, hospital_id);
CREATE INDEX IF NOT EXISTS idx_equipment_hospital_id ON public.equipment (hospital_id);

ALTER TABLE public.problem_reports
    ALTER COLUMN hospital_id SET NOT NULL,
    ADD CONSTRAINT fk_problem_reports_hospital
        FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_problem_reports_id_hospital UNIQUE (id, hospital_id);
CREATE INDEX IF NOT EXISTS idx_problem_reports_hospital_id ON public.problem_reports (hospital_id);

ALTER TABLE public.maintenance_records
    ALTER COLUMN hospital_id SET NOT NULL,
    ADD CONSTRAINT fk_maintenance_hospital
        FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_maintenance_id_hospital UNIQUE (id, hospital_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_hospital_id ON public.maintenance_records (hospital_id);

ALTER TABLE public.notifications
    ALTER COLUMN hospital_id SET NOT NULL,
    ADD CONSTRAINT fk_notifications_hospital
        FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_notifications_id_hospital UNIQUE (id, hospital_id);
CREATE INDEX IF NOT EXISTS idx_notifications_hospital_id ON public.notifications (hospital_id);

-- 2️⃣  Drop the old single‑column foreign key constraints
ALTER TABLE public.equipment
    DROP CONSTRAINT IF EXISTS equipment_equipment_assigned_technician_id_fkey;

ALTER TABLE public.problem_reports
    DROP CONSTRAINT IF EXISTS problem_reports_problem_reports_assigned_technician_id_fkey,
    DROP CONSTRAINT IF EXISTS problem_reports_problem_reports_equipment_id_fkey;

ALTER TABLE public.maintenance_records
    DROP CONSTRAINT IF EXISTS maintenance_records_maintenance_records_equipment_id_fkey,
    DROP CONSTRAINT IF EXISTS maintenance_records_maintenance_records_technician_id_fkey;

ALTER TABLE public.notifications
    DROP CONSTRAINT IF EXISTS notifications_notifications_equipment_id_fkey;

-- 3️⃣  Add composite (tenant‑aware) foreign key constraints
ALTER TABLE public.equipment
    ADD CONSTRAINT fk_equipment_technician_composite
        FOREIGN KEY (assigned_technician_id, hospital_id)
        REFERENCES public.technicians (id, hospital_id)
        ON DELETE SET NULL
        ON UPDATE RESTRICT;

ALTER TABLE public.problem_reports
    ADD CONSTRAINT fk_pr_technician_composite
        FOREIGN KEY (assigned_technician_id, hospital_id)
        REFERENCES public.technicians (id, hospital_id)
        ON DELETE SET NULL
        ON UPDATE RESTRICT;

ALTER TABLE public.problem_reports
    ADD CONSTRAINT fk_pr_equipment_composite
        FOREIGN KEY (equipment_id, hospital_id)
        REFERENCES public.equipment (id, hospital_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT;

ALTER TABLE public.maintenance_records
    ADD CONSTRAINT fk_maint_equipment_composite
        FOREIGN KEY (equipment_id, hospital_id)
        REFERENCES public.equipment (id, hospital_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT;

ALTER TABLE public.maintenance_records
    ADD CONSTRAINT fk_maint_technician_composite
        FOREIGN KEY (technician_id, hospital_id)
        REFERENCES public.technicians (id, hospital_id)
        ON DELETE SET NULL
        ON UPDATE RESTRICT;

ALTER TABLE public.notifications
    ADD CONSTRAINT fk_notifications_equipment_composite
        FOREIGN KEY (equipment_id, hospital_id)
        REFERENCES public.equipment (id, hospital_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT;

-- 4️⃣  Tenant helper function (SECURITY DEFINER)
DROP FUNCTION IF EXISTS public.current_hospital_id();

CREATE OR REPLACE FUNCTION public.current_hospital_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT hospital_id
    FROM   public.profiles
    WHERE  id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.current_hospital_id() TO PUBLIC;

-- 5️⃣  Trigger to force default hospital on new profile rows (temporary single‑hospital onboarding)
-- This trigger automatically assigns every newly created profile to the default hospital
-- (City General Hospital / CGH-01). It is intended only for the initial deployment.
-- When multi‑hospital onboarding is implemented, this trigger should be replaced.
CREATE OR REPLACE FUNCTION public.assign_hospital_on_signup()
RETURNS trigger AS $$
DECLARE
    default_hospital uuid;
BEGIN
    SELECT id INTO default_hospital
    FROM   public.hospitals
    WHERE  name = 'City General Hospital'
      AND  facility_code = 'CGH-01'
    LIMIT 1;

    NEW.hospital_id := default_hospital;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_profiles_assign_hospital ON public.profiles;
CREATE TRIGGER trg_profiles_assign_hospital
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.assign_hospital_on_signup();

-- Part 3: RLS policies, validation, and commit

-- 1️⃣  Drop existing broad INSERT policies (if they exist)
DROP POLICY IF EXISTS maintenance_records_public_insert_policy      ON public.maintenance_records;
DROP POLICY IF EXISTS maintenance_records_auth_insert_policy        ON public.maintenance_records;
DROP POLICY IF EXISTS problem_reports_auth_insert_policy           ON public.problem_reports;

-- 2️⃣  Create tenant‑scoped RLS policies

-- hospitals – SELECT only for ordinary users
CREATE POLICY hospitals_select_policy
    ON public.hospitals
    FOR SELECT
    USING (id = public.current_hospital_id());

-- profiles
CREATE POLICY profiles_select_policy
    ON public.profiles
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY profiles_insert_policy
    ON public.profiles
    FOR INSERT
    WITH CHECK (id = auth.uid() AND hospital_id = public.current_hospital_id());

CREATE POLICY profiles_update_policy
    ON public.profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (hospital_id = public.current_hospital_id());

-- technicians
CREATE POLICY technicians_select_policy
    ON public.technicians
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY technicians_insert_policy
    ON public.technicians
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY technicians_update_policy
    ON public.technicians
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

-- facility_settings
CREATE POLICY fac_settings_select_policy
    ON public.facility_settings
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY fac_settings_insert_policy
    ON public.facility_settings
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY fac_settings_update_policy
    ON public.facility_settings
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

-- equipment
CREATE POLICY equipment_select_policy
    ON public.equipment
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY equipment_insert_policy
    ON public.equipment
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY equipment_update_policy
    ON public.equipment
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

-- problem_reports
CREATE POLICY problem_reports_select_policy
    ON public.problem_reports
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY problem_reports_insert_policy
    ON public.problem_reports
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY problem_reports_update_policy
    ON public.problem_reports
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

-- maintenance_records
CREATE POLICY maintenance_select_policy
    ON public.maintenance_records
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY maintenance_insert_policy
    ON public.maintenance_records
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY maintenance_update_policy
    ON public.maintenance_records
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

-- notifications
CREATE POLICY notifications_select_policy
    ON public.notifications
    FOR SELECT
    USING (hospital_id = public.current_hospital_id());

CREATE POLICY notifications_insert_policy
    ON public.notifications
    FOR INSERT
    WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY notifications_update_policy
    ON public.notifications
    FOR UPDATE
    USING (hospital_id = public.current_hospital_id())
    WITH CHECK (hospital_id = public.current_hospital_id());

-- Validation block: abort if any NULL hospital_id or tenant mismatch is found
DO $$
DECLARE
    v_nulls int;
    v_eq_tech_mismatch int;
    v_pr_tech_mismatch int;
    v_pr_eq_mismatch int;
    v_maint_tech_mismatch int;
    v_maint_eq_mismatch int;
    v_notif_eq_mismatch int;
BEGIN
    SELECT
        (SELECT COUNT(*) FROM public.profiles            WHERE hospital_id IS NULL) +
        (SELECT COUNT(*) FROM public.technicians        WHERE hospital_id IS NULL) +
        (SELECT COUNT(*) FROM public.facility_settings WHERE hospital_id IS NULL) +
        (SELECT COUNT(*) FROM public.equipment          WHERE hospital_id IS NULL) +
        (SELECT COUNT(*) FROM public.problem_reports    WHERE hospital_id IS NULL) +
        (SELECT COUNT(*) FROM public.maintenance_records WHERE hospital_id IS NULL) +
        (SELECT COUNT(*) FROM public.notifications      WHERE hospital_id IS NULL)
    INTO v_nulls;

    IF v_nulls > 0 THEN
        RAISE EXCEPTION 'Migration validation failed: % rows have NULL hospital_id', v_nulls;
    END IF;

    SELECT COUNT(*) INTO v_eq_tech_mismatch
    FROM   public.equipment e
    JOIN   public.technicians t ON (e.assigned_technician_id = t.id AND e.hospital_id = t.hospital_id)
    WHERE  e.assigned_technician_id IS NOT NULL
      AND  e.hospital_id <> t.hospital_id;

    IF v_eq_tech_mismatch > 0 THEN
        RAISE EXCEPTION 'Migration validation failed: % equipment‑technician tenant mismatches', v_eq_tech_mismatch;
    END IF;

    SELECT COUNT(*) INTO v_pr_tech_mismatch
    FROM   public.problem_reports r
    JOIN   public.technicians t ON (r.assigned_technician_id = t.id AND r.hospital_id = t.hospital_id)
    WHERE  r.assigned_technician_id IS NOT NULL
      AND  r.hospital_id <> t.hospital_id;

    IF v_pr_tech_mismatch > 0 THEN
        RAISE EXCEPTION 'Migration validation failed: % problem‑report‑technician tenant mismatches', v_pr_tech_mismatch;
    END IF;

    SELECT COUNT(*) INTO v_pr_eq_mismatch
    FROM   public.problem_reports r
    JOIN   public.equipment e ON (r.equipment_id = e.id AND r.hospital_id = e.hospital_id)
    WHERE  r.equipment_id IS NOT NULL
      AND  r.hospital_id <> e.hospital_id;

    IF v_pr_eq_mismatch > 0 THEN
        RAISE EXCEPTION 'Migration validation failed: % problem‑report‑equipment tenant mismatches', v_pr_eq_mismatch;
    END IF;

    SELECT COUNT(*) INTO v_maint_tech_mismatch
    FROM   public.maintenance_records m
    JOIN   public.technicians t ON (m.technician_id = t.id AND m.hospital_id = t.hospital_id)
    WHERE  m.technician_id IS NOT NULL
      AND  m.hospital_id <> t.hospital_id;

    IF v_maint_tech_mismatch > 0 THEN
        RAISE EXCEPTION 'Migration validation failed: % maintenance‑technician tenant mismatches', v_maint_tech_mismatch;
    END IF;

    SELECT COUNT(*) INTO v_maint_eq_mismatch
    FROM   public.maintenance_records m
    JOIN   public.equipment e ON (m.equipment_id = e.id AND m.hospital_id = e.hospital_id)
    WHERE  m.equipment_id IS NOT NULL
      AND  m.hospital_id <> e.hospital_id;

    IF v_maint_eq_mismatch > 0 THEN
        RAISE EXCEPTION 'Migration validation failed: % maintenance‑equipment tenant mismatches', v_maint_eq_mismatch;
    END IF;

    SELECT COUNT(*) INTO v_notif_eq_mismatch
    FROM   public.notifications n
    JOIN   public.equipment e ON (n.equipment_id = e.id AND n.hospital_id = e.hospital_id)
    WHERE  n.equipment_id IS NOT NULL
      AND  n.hospital_id <> e.hospital_id;

    IF v_notif_eq_mismatch > 0 THEN
        RAISE EXCEPTION 'Migration validation failed: % notification‑equipment tenant mismatches', v_notif_eq_mismatch;
    END IF;
END $$;

COMMIT;