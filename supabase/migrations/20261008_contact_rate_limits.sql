-- Persistent rate-limiting table for the contact-form Edge Function.
-- The function uses the service role only; table is not exposed to browser roles.
CREATE TABLE IF NOT EXISTS public.contact_rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_ip text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_ip_created
    ON public.contact_rate_limits (requester_ip, created_at DESC);

REVOKE ALL ON public.contact_rate_limits FROM anon, authenticated;
ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- No browser-facing policies intentionally. Service role bypasses RLS by design
-- when executing as a privileged server-side client.