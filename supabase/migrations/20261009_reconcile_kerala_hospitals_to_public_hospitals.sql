-- Migration: reconcile legacy kerala_hospitals into canonical public_hospitals.
-- This migration is intentionally ADDITIVE and NON-DESTRUCTIVE:
-- existing kerala_hospitals rows are copied with their IDs preserved.
-- The legacy table is left in place; access to it should be disabled via RLS
-- or removed only after all application references are proven migrated.

BEGIN;

-- 1. Ensure the canonical ownership column exists.
ALTER TABLE public.public_hospitals
    ADD COLUMN IF NOT EXISTS hospital_id uuid;

-- 2. Simple copy of existing legacy rows into the canonical table. Idempotent.
DO $$
BEGIN
    IF to_regclass('public.kerala_hospitals') IS NOT NULL THEN
        INSERT INTO public.public_hospitals (
            id, name, address, city, state, verified, image, last_updated,
            resources, contact, latitude, longitude, hospital_id
        )
        SELECT
            k.id, k.name, k.address, k.city, k.state, k.verified, k.image, k.last_updated,
            k.resources, k.contact, k.latitude, k.longitude, NULL
        FROM public.kerala_hospitals k
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 3. Foreign key, if not already present.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_public_hospitals_hospital'
          AND conrelid = 'public.public_hospitals'::regclass
    ) THEN
        ALTER TABLE public.public_hospitals
            ADD CONSTRAINT fk_public_hospitals_hospital
            FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_public_hospitals_hospital_id
    ON public.public_hospitals (hospital_id);

-- 4. Canonical security model.
ALTER TABLE public.public_hospitals ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.public_hospitals FROM anon, authenticated;
GRANT SELECT ON public.public_hospitals TO anon, authenticated;

DROP POLICY IF EXISTS public_hospitals_select_all ON public.public_hospitals;
CREATE POLICY public_hospitals_select_all
    ON public.public_hospitals
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS public_hospitals_staff_resource_update ON public.public_hospitals;
CREATE POLICY public_hospitals_staff_resource_update
    ON public.public_hospitals
    FOR UPDATE
    TO authenticated
    USING (
        hospital_id IS NOT NULL
        AND hospital_id = public.current_hospital_id()
        AND public.current_user_role() IN ('Staff', 'Admin')
    )
    WITH CHECK (
        hospital_id IS NOT NULL
        AND hospital_id = public.current_hospital_id()
        AND public.current_user_role() IN ('Staff', 'Admin')
    );

COMMIT;
