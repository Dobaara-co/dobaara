-- Run this in your Supabase SQL editor (or via the Supabase CLI) to add the
-- tables and columns required by the new /contact and /dobaara-verified pages.

-- 1) Contact form submissions
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

drop policy if exists "Anyone can insert contact submissions" on public.contact_submissions;
create policy "Anyone can insert contact submissions"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

-- (No SELECT policy: rows are write-only from the client.)

-- 2) Extra optional columns on vip_submissions used by the Dobaara Verified form
alter table public.vip_submissions
  add column if not exists designer_brand text,
  add column if not exists photo_urls text[] default '{}'::text[];
