-- Migration: Create contact_inquiries table and setup RLS
-- Purpose: Store public contact form submissions securely

BEGIN;

-- 1. Create the contact inquiries table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    inquiry_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved')),
    processed_at TIMESTAMPTZ
);

-- 2. Enable Row Level Security
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Policy: Allow anonymous users to insert their inquiries
CREATE POLICY "Allow anon to insert inquiries"
ON public.contact_inquiries
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Allow authenticated Admins to manage all inquiries
-- We reuse the current_user_role() helper from previous migrations
CREATE POLICY "Admins can manage contact inquiries"
ON public.contact_inquiries
FOR ALL
TO authenticated
USING (public.current_user_role() = 'Admin');

COMMIT;
