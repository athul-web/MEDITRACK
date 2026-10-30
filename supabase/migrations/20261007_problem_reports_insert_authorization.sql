-- Hardens problem_reports INSERT authorization while preserving RLS and tenant isolation.
-- problem_reports inserts were allowed for any authenticated profile in the caller's
-- hospital. Require the caller profile to be Staff or Admin, and still require the
-- submitted hospital_id to equal the caller's own hospital_id resolved by RLS.
-- This does not disable RLS, does not grant anon access, and does not broaden scope.

DROP POLICY IF EXISTS problem_reports_insert_policy ON public.problem_reports;

CREATE POLICY problem_reports_insert_policy
    ON public.problem_reports
    FOR INSERT
    WITH CHECK (
        public.current_user_role() IN ('Staff', 'Admin')
        AND hospital_id = public.current_hospital_id()
    );

-- Make the intended authorization boundary explicit as documentation only.
COMMENT ON POLICY problem_reports_insert_policy ON public.problem_reports
    IS 'Only Staff/Admin callers may create problem reports scoped to their own hospital; hospital_id must equal current_hospital_id().';