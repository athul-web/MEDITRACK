BEGIN;

WITH default_hospital AS (
    SELECT id
    FROM public.hospitals
    WHERE facility_code = 'CGH-01'
    LIMIT 1
)
UPDATE public.facility_settings
SET hospital_id = (SELECT id FROM default_hospital)
WHERE hospital_id IS NULL;

COMMIT;