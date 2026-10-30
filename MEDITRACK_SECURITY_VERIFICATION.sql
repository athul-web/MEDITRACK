-- Verification queries for MediTrack Supabase/PostgreSQL RLS.
-- Run these in Supabase SQL editor as service role or as application queries
-- where specified. They do not modify data.

-- 1. RLS enabled status
SELECT schemaname, tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. All policies
SELECT schemaname, tablename, policyname, cmd,
       roles, qual AS using_clause, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- 3. Potentially dangerous overlaps (USING true / WITH CHECK true)
SELECT * FROM pg_policies
WHERE schemaname = 'public'
  AND (
       COALESCE(qual, '') ILIKE '%true%'
    OR COALESCE(with_check, '') ILIKE '%true%'
  );

-- 4. Table privileges
SELECT table_name, grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
ORDER BY table_name, grantee, privilege_type;

-- 5. Function execution privileges
SELECT n.nspname AS schema, p.proname AS function_name,
       r.rolname AS grantee, pg_get_function_identity_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_proc_acl a ON a.objid = p.oid
JOIN LATERAL UNNEST(a.aclgrantee) AS g(grantor) ON true
LEFT JOIN pg_roles r ON r.oid = g.grantor
WHERE n.nspname = 'public'
ORDER BY p.proname, r.rolname;
