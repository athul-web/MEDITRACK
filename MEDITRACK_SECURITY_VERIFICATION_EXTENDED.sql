-- Extended security verification queries for MediTrack.
-- Run as privileged user. These queries do not modify data.

-- 1. RLS enabled on all sensitive tables
SELECT schemaname, tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'hospitals','profiles','technicians','facility_settings','equipment',
    'problem_reports','maintenance_records','notifications','public_hospitals',
    'contact_inquiries','contact_rate_limits','kerala_hospitals'
  )
ORDER BY tablename;

-- 2. Table grants for browser roles.
SELECT table_name, grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('anon','authenticated')
  AND table_name IN (
    'hospitals','profiles','technicians','facility_settings','equipment',
    'problem_reports','maintenance_records','notifications','public_hospitals',
    'contact_inquiries','contact_rate_limits','kerala_hospitals'
  )
ORDER BY table_name, grantee, privilege_type;

-- 3. SECURITY DEFINER functions involved in authorization.
SELECT p.proname AS function_name,
       pg_get_functiondef(p.oid) LIKE '%SECURITY DEFINER%' AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'current_user_role','current_hospital_id','default_onboarding_hospital_id',
    'increment_equipment_downtime','assign_hospital_on_signup'
  )
ORDER BY function_name;

-- 4. Check for facility_settings row distribution.
SELECT hospital_id, count(*) AS settings_count
FROM public.facility_settings
GROUP BY hospital_id
ORDER BY settings_count DESC;

-- 5. Detect overly broad policies containing true.
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND (COALESCE(qual, '') ILIKE '%true%' OR COALESCE(with_check, '') ILIKE '%true%');
