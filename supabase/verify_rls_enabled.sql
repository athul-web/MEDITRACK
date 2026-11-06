-- ============================================================
-- RLS Verification Script
-- Run this AFTER all migrations to confirm tenant isolation is active
-- ============================================================
-- Usage: psql -h <host> -U <user> -d <db> -f verify_rls_enabled.sql
-- Or run in Supabase SQL Editor
-- ============================================================

\echo ''
\echo '=== RLS VERIFICATION REPORT ==='
\echo ''

-- Check 1: RLS enabled on all tenant tables
\echo '-- Check 1: Row Level Security status on tenant tables --'
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled,
    CASE WHEN rowsecurity THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'hospitals',
    'profiles',
    'technicians',
    'facility_settings',
    'equipment',
    'problem_reports',
    'maintenance_records',
    'notifications'
  )
ORDER BY tablename;

-- Check 2: Policies exist on all tenant tables
\echo ''
\echo '-- Check 2: Policy count per tenant table --'
SELECT
    schemaname,
    tablename,
    COUNT(*) AS policy_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'hospitals',
    'profiles',
    'technicians',
    'facility_settings',
    'equipment',
    'problem_reports',
    'maintenance_records',
    'notifications'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Check 3: No overly permissive policies (USING true or similar)
\echo ''
\echo '-- Check 3: Policies with permissive USING clauses --'
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual AS using_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'hospitals',
    'profiles',
    'technicians',
    'facility_settings',
    'equipment',
    'problem_reports',
    'maintenance_records',
    'notifications'
  )
  AND (qual ILIKE '%true%' OR qual ILIKE '%auth.role()%' OR with_check ILIKE '%true%' OR with_check ILIKE '%auth.role()%')
ORDER BY tablename, policyname;

-- Check 4: Verify tenant-scoped policies use current_hospital_id()
\echo ''
\echo '-- Check 4: Policies referencing current_hospital_id() --'
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE
        WHEN qual LIKE '%current_hospital_id()%' THEN '✅ Uses current_hospital_id()'
        WHEN qual IS NOT NULL THEN '⚠️ Custom USING clause: ' || qual
        ELSE 'No USING clause'
    END AS using_analysis
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'hospitals',
    'profiles',
    'technicians',
    'facility_settings',
    'equipment',
    'problem_reports',
    'maintenance_records',
    'notifications'
  )
ORDER BY tablename, policyname;

-- Check 5: hospital_id column exists and is NOT NULL on tenant tables
\echo ''
\echo '-- Check 5: hospital_id column constraints --'
SELECT
    c.table_name,
    c.column_name,
    c.is_nullable,
    c.column_default,
    CASE
        WHEN c.column_name = 'hospital_id' AND c.is_nullable = 'NO' THEN '✅ NOT NULL'
        WHEN c.column_name = 'hospital_id' AND c.is_nullable = 'YES' THEN '❌ NULLABLE'
        ELSE ''
    END AS status
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name IN (
    'profiles',
    'technicians',
    'facility_settings',
    'equipment',
    'problem_reports',
    'maintenance_records',
    'notifications'
  )
  AND c.column_name = 'hospital_id'
ORDER BY c.table_name;

-- Check 6: Foreign keys to hospitals table
\echo ''
\echo '-- Check 6: Foreign keys referencing hospitals --'
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column,
    '✅ FK exists' AS status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND ccu.table_name = 'hospitals'
  AND tc.table_name IN (
    'profiles',
    'technicians',
    'facility_settings',
    'equipment',
    'problem_reports',
    'maintenance_records',
    'notifications'
  )
ORDER BY tc.table_name;

-- Check 7: Composite foreign keys (tenant-aware)
\echo ''
\echo '-- Check 7: Composite foreign keys (tenant-aware) --'
SELECT
    tc.table_name,
    tc.constraint_name,
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns,
    ccu.table_name AS references_table,
    STRING_AGG(ccu.column_name, ', ' ORDER BY kcu.ordinal_position) AS references_columns,
    '✅ Composite FK' AS status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'equipment',
    'problem_reports',
    'maintenance_records',
    'notifications'
  )
  AND tc.constraint_name LIKE '%composite%'
GROUP BY tc.table_name, tc.constraint_name, ccu.table_name
ORDER BY tc.table_name;

-- Check 8: SECURITY DEFINER functions and their grants
\echo ''
\echo '-- Check 8: SECURITY DEFINER functions --'
SELECT
    p.proname AS function_name,
    p.prosecdef AS security_definer,
    CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security_type,
    pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'current_hospital_id',
    'current_user_role',
    'default_onboarding_hospital_id',
    'assign_hospital_on_signup',
    'increment_equipment_downtime'
  )
ORDER BY p.proname;

-- Check 9: Function execute grants
\echo ''
\echo '-- Check 9: Function execute grants --'
SELECT
    p.proname AS function_name,
    r.rolname AS grantee,
    'EXECUTE' AS privilege
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_proc_acl acl ON acl.objid = p.oid
JOIN pg_roles r ON r.oid = ANY(acl.aclgrantee)
WHERE n.nspname = 'public'
  AND p.proname IN (
    'current_hospital_id',
    'current_user_role',
    'default_onboarding_hospital_id',
    'increment_equipment_downtime'
  )
ORDER BY p.proname, r.rolname;

-- Check 10: anon role has no table privileges
\echo ''
\echo '-- Check 10: anon role table privileges (should be empty) --'
SELECT
    r.rolname,
    c.relname AS table_name,
    a.privilege_type
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_roles r ON r.rolname = 'anon'
CROSS JOIN LATERAL (
    SELECT privilege_type
    FROM information_schema.table_privileges
    WHERE grantee = 'anon'
      AND table_schema = 'public'
      AND table_name = c.relname
) a
WHERE n.nspname = 'public'
  AND c.relname IN (
    'hospitals',
    'profiles',
    'technicians',
    'facility_settings',
    'equipment',
    'problem_reports',
    'maintenance_records',
    'notifications'
  )
ORDER BY c.relname;

-- Summary
\echo ''
\echo '=== VERIFICATION COMPLETE ==='
\echo ''
\echo 'If all checks show ✅ PASS, tenant isolation is correctly configured.'
\echo 'If any check shows ❌ FAIL, review the corresponding migration.'
\echo ''