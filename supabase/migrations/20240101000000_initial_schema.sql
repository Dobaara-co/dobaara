-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (public extension of auth.users)
-- ============================================================
create table public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  username        text unique not null,
  full_name       text,
  avatar_url      text,
  bio             text,
  location        text,
  is_founding_seller  boolean default false,
  is_vip_seller       boolean default false,
  total_sales_count   integer default 0,
  average_rating      numeric(3,2) default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- LISTINGS
-- ============================================================
create table public.listings (
  id                  uuid default uuid_generate_v4() primary key,
  seller_id           uuid references public.profiles(id) on delete cascade not null,
  title               text not null,
  description         text,
  category            text not null check (category in (
                        'lehenga','salwar_kameez','saree','anarkali','sharara',
                        'gharara','sherwani','kurta','dupatta','jewellery',
                        'accessories','other')),
  occasion            text check (occasion in (
                        'wedding','eid','diwali','mehendi','sangeet','casual','party')),
  condition           text not null check (condition in ('excellent','very_good','good','fair')),
  colour              text,
  designer_brand      text,
  size_label          text,
  bust_cm             numeric,
  waist_cm            numeric,
  hips_cm             numeric,
  length_cm           numeric,
  price               integer not null check (price > 0),  -- pence
  original_price      integer check (original_price > 0),  -- pence
  postage_price       integer default 0,                    -- pence
  free_postage        boolean default false,
  images              text[] default '{}',
  primary_image_index integer default 0,
  is_vip_verified     boolean default false,
  is_active           boolean default true,
  is_sold             boolean default false,
  views_count         integer default 0,
  saves_count         integer default 0,
  location            text,
  ships_from          text,
  ships_to            text[] default '{"UK"}',
  tags                text[] default '{}',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index listings_seller_id_idx   on public.listings(seller_id);
create index listings_category_idx    on public.listings(category);
create index listings_is_active_idx   on public.listings(is_active);
create index listings_created_at_idx  on public.listings(created_at desc);

-- ============================================================
-- ORDERS
-- ============================================================
create table public.orders (
  id                       uuid default uuid_generate_v4() primary key,
  listing_id               uuid references public.listings(id) on delete set null,
  buyer_id                 uuid references public.profiles(id) on delete set null not null,
  seller_id                uuid references public.profiles(id) on delete set null not null,
  amount                   integer not null,  -- total in pence (price + postage)
  status                   text not null default 'pending'
                             check (status in ('pending','paid','shipped','delivered','cancelled','refunded')),
  stripe_payment_intent_id text,
  shipping_address         jsonb,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

create index orders_buyer_id_idx   on public.orders(buyer_id);
create index orders_seller_id_idx  on public.orders(seller_id);

-- ============================================================
-- MESSAGES
-- ============================================================
create table public.messages (
  id            uuid default uuid_generate_v4() primary key,
  listing_id    uuid references public.listings(id) on delete set null,
  sender_id     uuid references public.profiles(id) on delete cascade not null,
  recipient_id  uuid references public.profiles(id) on delete cascade not null,
  body          text not null,
  is_read       boolean default false,
  created_at    timestamptz default now()
);

create index messages_sender_id_idx     on public.messages(sender_id);
create index messages_recipient_id_idx  on public.messages(recipient_id);

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id           uuid default uuid_generate_v4() primary key,
  order_id     uuid references public.orders(id) on delete cascade unique,
  reviewer_id  uuid references public.profiles(id) on delete cascade not null,
  seller_id    uuid references public.profiles(id) on delete cascade not null,
  rating       integer not null check (rating between 1 and 5),
  body         text,
  created_at   timestamptz default now()
);

create index reviews_seller_id_idx on public.reviews(seller_id);

-- ============================================================
-- SAVED LISTINGS
-- ============================================================
create table public.saved_listings (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  listing_id  uuid references public.listings(id) on delete cascade not null,
  created_at  timestamptz default now(),
  unique(user_id, listing_id)
);

create index saved_listings_user_id_idx     on public.saved_listings(user_id);
create index saved_listings_listing_id_idx  on public.saved_listings(listing_id);

-- ============================================================
-- WAITLIST
-- ============================================================
create table public.waitlist (
  id          uuid default uuid_generate_v4() primary key,
  email       text unique not null,
  name        text,
  created_at  timestamptz default now()
);

-- ============================================================
-- VIP SUBMISSIONS (Dobaara Verified)
-- ============================================================
create table public.vip_submissions (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references public.profiles(id) on delete set null,
  email            text not null,
  full_name        text not null,
  item_type        text not null,
  description      text,
  estimated_value  integer,  -- pence
  status           text not null default 'pending'
                     check (status in ('pending','reviewing','accepted','declined')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
