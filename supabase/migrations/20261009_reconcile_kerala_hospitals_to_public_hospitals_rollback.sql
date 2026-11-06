-- Rollback guidance for 20261009_reconcile_kerala_hospitals_to_public_hospitals.
-- This does NOT reconstruct the old application behavior automatically.
-- Use only if security changes introduced on the canonical table must be removed
-- while preserving data.

BEGIN;

DROP POLICY IF EXISTS public_hospitals_staff_resource_update ON public.public_hospitals;
DROP POLICY IF EXISTS public_hospitals_select_all ON public.public_hospitals;

-- The copied rows remain in public_hospitals. Remove manually only after
-- confirming they are duplicates and not referenced elsewhere.

COMMIT;
