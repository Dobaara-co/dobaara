-- ============================================================
-- Virtual try-on fields on listings
-- ============================================================

alter table public.listings
  add column if not exists tryon_status    text check (tryon_status in ('pending','processing','completed','failed')),
  add column if not exists tryon_image_url text,
  add column if not exists tryon_task_id   text,
  add column if not exists tryon_error     text,
  add column if not exists tryon_cost_pence integer default 7;
