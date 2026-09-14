-- Expanded South Asian sizing data for listings + buyer measurements on profiles.
-- Run this in the Supabase SQL editor.

alter table public.listings
  add column if not exists blouse_bust_cm numeric,
  add column if not exists blouse_waist_cm numeric,
  add column if not exists blouse_length_cm numeric,
  add column if not exists shoulder_cm numeric,
  add column if not exists sleeve_length_cm numeric,
  add column if not exists blouse_margin_cm numeric,
  add column if not exists skirt_waist_cm numeric,
  add column if not exists skirt_length_cm numeric,
  add column if not exists skirt_flare_cm numeric,
  add column if not exists skirt_margin_cm numeric,
  add column if not exists margin_cm numeric,
  add column if not exists stitching_status text,
  add column if not exists waist_type text,
  add column if not exists height_min_cm numeric,
  add column if not exists height_max_cm numeric,
  add column if not exists alteration_notes text;

alter table public.profiles
  add column if not exists bust_cm numeric,
  add column if not exists waist_cm numeric,
  add column if not exists hips_cm numeric,
  add column if not exists height_cm numeric;
