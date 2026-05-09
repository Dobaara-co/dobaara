-- ============================================================
-- Virtual models for the try-on selector
-- ============================================================

create table if not exists public.virtual_models (
  id               uuid primary key default gen_random_uuid(),
  name             text    not null,
  height           text    not null,
  size_range       text    not null,
  reference_image_url text,
  display_order    integer not null default 0,
  is_default       boolean not null default false,
  created_at       timestamptz not null default now()
);

-- The 5 models. reference_image_url is null for all except Tara.
insert into public.virtual_models (name, height, size_range, display_order, is_default, reference_image_url) values
  ('Tara',  '5''5"', 'Size 10–12', 1, true,  'https://i.ibb.co/ycxyhNvh/tara-white.png'),
  ('Priya', '5''1"', 'Size 8–10',  2, false, null),
  ('Meera', '5''9"', 'Size 10–12', 3, false, null),
  ('Zara',  '5''5"', 'Size 16–18', 4, false, null),
  ('Asha',  '5''4"', 'Size 12–14', 5, false, null);

-- ============================================================
-- Per-listing, per-model try-on results
-- ============================================================

create table if not exists public.listing_tryons (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references public.listings(id) on delete cascade,
  model_id        uuid not null references public.virtual_models(id) on delete cascade,
  tryon_image_url text not null,
  created_at      timestamptz not null default now(),
  unique (listing_id, model_id)
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.virtual_models enable row level security;
alter table public.listing_tryons  enable row level security;

-- Anyone can read models and tryon results
create policy "virtual_models: public read"
  on public.virtual_models for select using (true);

create policy "listing_tryons: public read"
  on public.listing_tryons for select using (true);

-- Only service role (edge functions) can write
create policy "virtual_models: service role write"
  on public.virtual_models for all
  using (auth.role() = 'service_role');

create policy "listing_tryons: service role write"
  on public.listing_tryons for all
  using (auth.role() = 'service_role');
