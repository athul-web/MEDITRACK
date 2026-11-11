-- Migration: 20261108_kerala_hospitals_public_read.sql
--
-- PURPOSE
-- -------
-- The `kerala_hospitals` table is the real Kerala hospital directory (~395
-- records) used by the public-facing Nearby Hospitals and Hospital Directory
-- features. It was created directly in Supabase without a corresponding
-- migration file, so no RLS SELECT policy was ever applied to it.
--
-- Without a permissive SELECT policy, the Supabase PostgREST API returns an
-- empty array (not an error) for anonymous callers, which caused both the
-- homepage Nearby Hospitals section and the Hospital Directory page to show no
-- results even though the data is present.
--
-- WHAT THIS MIGRATION DOES
-- -------------------------
-- 1. Ensures RLS is enabled on `kerala_hospitals`.
-- 2. Grants SELECT to the `anon` and `authenticated` roles so the browser
--    client can read the directory without being signed in.
-- 3. Adds a permissive SELECT policy that allows every caller to read all rows.
-- 4. Explicitly revokes INSERT, UPDATE, DELETE from both roles so the table
--    remains read-only through the browser client. Mutations must go through
--    an Edge Function that uses a service-role key.
--
-- SECURITY NOTES
-- --------------
-- * This policy is intentionally equivalent to the one on `public_hospitals`
--   (created in 20260924_123436_create_public_hospitals.sql).
-- * No sensitive columns (PII, operational secrets) exist in `kerala_hospitals`;
--   it contains only publicly discoverable directory information.
-- * Multi-hospital tenancy (the `hospitals` table and its related tables) is
--   completely unaffected; those tables have separate RLS policies.

BEGIN;

-- 1. Enable RLS (idempotent: safe to run if already enabled)
ALTER TABLE public.kerala_hospitals ENABLE ROW LEVEL SECURITY;

-- 2. Grant read access to browser client roles
GRANT SELECT ON public.kerala_hospitals TO anon, authenticated;

-- 3. Revoke write access – directory is read-only through the client
REVOKE INSERT, UPDATE, DELETE ON public.kerala_hospitals FROM anon, authenticated;

-- 4. Drop any stale policy with this name before creating (makes migration re-runnable)
DROP POLICY IF EXISTS "kerala_hospitals_public_select" ON public.kerala_hospitals;

-- 5. Allow all callers to read all rows
CREATE POLICY "kerala_hospitals_public_select"
    ON public.kerala_hospitals
    FOR SELECT
    USING (true);

COMMIT;
