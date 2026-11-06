-- Migration: 20261006_public_hospital_resource_update_authorization.sql
-- PURPOSE: Make hospital-level (public directory) resource updates
-- enforceable for authenticated, assigned Staff/Admin users instead of
-- relying on frontend visibility. Public access remains read-only.
--
-- This assumes 20261005 has already been applied.

BEGIN;

ALTER TABLE public.public_hospitals
    ADD COLUMN IF NOT EXISTS hospital_id uuid;

ALTER TABLE public.public_hospitals
    ADD CONSTRAINT fk_public_hospitals_hospital
        FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id)
        ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_public_hospitals_hospital_id
    ON public.public_hospitals(hospital_id);

-- Only authenticated users assigned to the same hospital may update the
-- resource availability for a published hospital record. This is a
-- deliberately narrow UPDATE-only policy; public records remain
-- created/deleted by privileged/administrative processes, not public or
-- general Staff.
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
