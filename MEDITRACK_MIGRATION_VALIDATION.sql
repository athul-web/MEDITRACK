-- Migration validation script for 20261009.
-- Run against the dedicated Supabase test database before and after the migration.
-- Read-only checks only. Do not use production data.

-- 1. Source and destination row counts
SELECT 'kerala_hospitals' AS table_name, count(*) AS row_count
FROM public.kerala_hospitals
UNION ALL
SELECT 'public_hospitals', count(*)
FROM public.public_hospitals;

-- 2. Missing canonical columns (should all be present)
SELECT 'public_hospitals' AS table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'public_hospitals';

-- 3. Conflicting IDs between source and destination
SELECT k.id, 'id exists in both tables' AS conflict
FROM public.kerala_hospitals k
JOIN public.public_hospitals p ON p.id = k.id;

-- 4. Rows in source missing from destination after migration
SELECT k.id, 'source row missing from destination' AS status
FROM public.kerala_hospitals k
LEFT JOIN public.public_hospitals p ON p.id = k.id
WHERE p.id IS NULL;

-- 5. Invalid hospital_id foreign keys on destination records
SELECT p.id, p.hospital_id
FROM public.public_hospitals p
WHERE p.hospital_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.hospitals h WHERE h.id = p.hospital_id);

-- 6. Null-resource or malformed resource objects
SELECT id, resources
FROM public.public_hospitals
WHERE resources IS NULL
   OR jsonb_typeof(resources) <> 'object';

-- 7. Migration idempotency: repeated copy construction preview
SELECT k.id,
       (k.resources IS NOT DISTINCT FROM p.resources) AS resources_match,
       (k.name IS NOT DISTINCT FROM p.name) AS name_match
FROM public.kerala_hospitals k
LEFT JOIN public.public_hospitals p ON p.id = k.id;

-- 8. RLS status
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('kerala_hospitals', 'public_hospitals', 'hospitals');

-- 9. Policies currently active
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('kerala_hospitals', 'public_hospitals')
ORDER BY tablename, policyname;

-- 10. Grants for browser roles
SELECT table_name, grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('kerala_hospitals', 'public_hospitals')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;
