-- ============================================================
-- Stripe Connect fields
-- ============================================================

-- profiles: seller Stripe Connect account state
alter table public.profiles
  add column if not exists stripe_account_id           text,
  add column if not exists stripe_onboarding_complete  boolean not null default false,
  add column if not exists stripe_charges_enabled      boolean not null default false,
  add column if not exists stripe_payouts_enabled      boolean not null default false;

-- listings: optional Stripe price ID for future use
alter table public.listings
  add column if not exists stripe_price_id  text;

-- orders: Stripe payment tracking + commission breakdown
alter table public.orders
  add column if not exists stripe_payment_intent_id  text,
  add column if not exists stripe_transfer_id        text,
  add column if not exists stripe_charge_id          text,
  add column if not exists platform_fee_amount       integer,  -- pence
  add column if not exists seller_payout_amount      integer;  -- pence

-- orders: extend status to include payment lifecycle states
alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
    check (status in ('pending','payment_confirmed','failed','shipped','delivered','cancelled','refunded'));
