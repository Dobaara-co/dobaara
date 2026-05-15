-- Run this in your Supabase SQL editor before launching the waitlist page.
-- Pre-launch waitlist table for the Dobaara landing page.

CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  type text NOT NULL CHECK (type IN ('buyer','seller','both')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add name columns (safe if table already exists)
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS name text;

-- Ensure email is unique so upsert works correctly
ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_email_unique UNIQUE (email);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow updates for upserts
DROP POLICY IF EXISTS "Anyone can update waitlist" ON public.waitlist;
CREATE POLICY "Anyone can update waitlist"
  ON public.waitlist
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow select so upsert can check conflicts (required by some Supabase client paths)
DROP POLICY IF EXISTS "Anyone can read waitlist" ON public.waitlist;
CREATE POLICY "Anyone can read waitlist"
  ON public.waitlist
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS waitlist_email_idx ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON public.waitlist(created_at DESC);
