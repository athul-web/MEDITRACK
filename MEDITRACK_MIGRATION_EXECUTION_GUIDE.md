# MediTrack Final Database Migration Execution Guide

No production credentials or patient data may be used. Use a dedicated Supabase test project with synthetic hospitals and synthetic test users.

## 1. Supabase test project setup
1. Create a separate Supabase project in the Supabase dashboard.
2. Ensure the project contains only synthetic data.
3. Apply the repository base schema and all migrations before application testing.
4. Create API keys for test access only (`anon` and `service_role`).

## 2. Required environment variables
Set these for the integration test in your shell, never commit them:

```bash
export SUPABASE_TEST_URL="https://YOUR-TEST-PROJECT.supabase.co"
export SUPABASE_TEST_ANON_KEY="YOUR_TEST_ANON_KEY"
export SUPABASE_TEST_SERVICE_ROLE_KEY="YOUR_TEST_SERVICE_ROLE_KEY"
```

Current cross-tenant test logic requires these variables before running. Without them, tests must be marked skipped, not pass.

## 3. SQL execution order
Run these files in the Supabase SQL Editor against the test project:

1. `supabase/migrations/20260921_multi_hospital_tenancy.sql`
2. `supabase/migrations/20260924_123436_create_public_hospitals.sql`
3. `supabase/migrations/20260924_create_contact_inquiries.sql`
4. `supabase/migrations/20261001_secure_multi_hospital_tenancy.sql`
5. `supabase/migrations/20261002_backfill_facility_settings_hospital_id.sql`
6. `supabase/migrations/20261005_security_remediation_recommended.sql`
7. `supabase/migrations/20261006_public_hospital_resource_update_authorization.sql`
8. `supabase/migrations/20261007_problem_reports_insert_authorization.sql`
9. `supabase/migrations/20261008_contact_rate_limits.sql`
10. `MEDITRACK_MIGRATION_VALIDATION.sql` as a read-only baseline
11. `supabase/migrations/20261009_reconcile_kerala_hospitals_to_public_hospitals.sql`
12. `MEDITRACK_MIGRATION_VALIDATION.sql` as the post-migration check
13. `MEDITRACK_SECURITY_VERIFICATION.sql`
14. `MEDITRACK_SECURITY_VERIFICATION_EXTENDED.sql`

## 4. Test account creation
Create synthetic test users:

- Hospital A Staff
- Hospital A Admin
- Hospital B Staff
- Hospital B Admin

Each user's profile must be linked to the correct `hospital_id` in `public.hospitals`.
No production identities or patient identifiers may be used.

## 5. Test execution
1. Install dependencies:
   `npm install`
2. Run lint:
   `npm run lint`
3. Run the local tests:
   `npm run test`
4. Run the integration test once test DB variables are set:
   suite: `src/security/crossTenantDirectory.security.test.ts`

## 6. Expected PASS conditions
- Anonymous public-directory read does not expose restricted tenant data.
- Anonymous insert/update/delete on `public_hospitals` is rejected.
- Staff A can update a record linked to Hospital A.
- Staff A cannot update a record linked to Hospital B.
- Admin A cannot change `hospital_id` and cannot modify Hospital B.
- Conflicting primary-key IDs and unreachable foreign keys are reported separately.
- RLS and grants remain enabled after migration.

## 7. Expected FAIL conditions
- Any cross-tenant update succeeds.
- Any anonymous write succeeds.
- A `hospital_id` changes without authorization.
- A migration duplicate is silently overwritten.
- RLS is disabled on a sensitive table.
- A skipped test is incorrectly reported as passed.

## 8. Capturing evidence
- Export SQL Editor results as CSV using the Supabase dashboard.
- Save test command output to a plain-text log, e.g. `npm run test > security-test-results.log`.
- Store migration checksums or git commit hashes with the final report.
- Include only synthetic hospital/account IDs, never production users or patient details.
