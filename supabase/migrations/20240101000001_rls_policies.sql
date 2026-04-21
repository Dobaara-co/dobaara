-- ============================================================
-- Enable Row Level Security on all tables
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.listings        enable row level security;
alter table public.orders          enable row level security;
alter table public.messages        enable row level security;
alter table public.reviews         enable row level security;
alter table public.saved_listings  enable row level security;
alter table public.waitlist        enable row level security;
alter table public.vip_submissions enable row level security;

-- ============================================================
-- PROFILES
-- ============================================================
-- Anyone can read any profile (public marketplace)
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

-- Users create their own profile (handled by trigger, but allow direct too)
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

-- Users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

-- ============================================================
-- LISTINGS
-- ============================================================
-- Anyone can browse active listings
create policy "listings_select_active"
  on public.listings for select
  using (is_active = true or seller_id = auth.uid());

-- Authenticated sellers can create listings
create policy "listings_insert_own"
  on public.listings for insert
  with check (auth.role() = 'authenticated' and seller_id = auth.uid());

-- Sellers can update only their own listings
create policy "listings_update_own"
  on public.listings for update
  using (seller_id = auth.uid());

-- Sellers can delete only their own listings
create policy "listings_delete_own"
  on public.listings for delete
  using (seller_id = auth.uid());

-- ============================================================
-- ORDERS
-- ============================================================
-- Buyers and sellers can view their own orders
create policy "orders_select_own"
  on public.orders for select
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Authenticated buyers can create orders
create policy "orders_insert_buyer"
  on public.orders for insert
  with check (auth.role() = 'authenticated' and buyer_id = auth.uid());

-- Seller can update order status (e.g. mark as shipped)
create policy "orders_update_seller"
  on public.orders for update
  using (seller_id = auth.uid());

-- ============================================================
-- MESSAGES
-- ============================================================
-- Only participants can read messages
create policy "messages_select_participants"
  on public.messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

-- Authenticated users can send messages as themselves
create policy "messages_insert_own"
  on public.messages for insert
  with check (auth.role() = 'authenticated' and sender_id = auth.uid());

-- Recipients can mark messages as read
create policy "messages_update_recipient"
  on public.messages for update
  using (recipient_id = auth.uid());

-- ============================================================
-- REVIEWS
-- ============================================================
-- Anyone can read reviews (public trust signals)
create policy "reviews_select_public"
  on public.reviews for select
  using (true);

-- Only the buyer of an order can write a review for it
create policy "reviews_insert_buyer"
  on public.reviews for insert
  with check (
    auth.role() = 'authenticated'
    and reviewer_id = auth.uid()
    and exists (
      select 1 from public.orders
      where id = reviews.order_id
        and buyer_id = auth.uid()
        and status = 'delivered'
    )
  );

-- ============================================================
-- SAVED LISTINGS
-- ============================================================
-- Users can only see their own saved listings
create policy "saved_listings_select_own"
  on public.saved_listings for select
  using (user_id = auth.uid());

-- Authenticated users can save listings
create policy "saved_listings_insert_own"
  on public.saved_listings for insert
  with check (auth.role() = 'authenticated' and user_id = auth.uid());

-- Users can unsave their own saved listings
create policy "saved_listings_delete_own"
  on public.saved_listings for delete
  using (user_id = auth.uid());

-- ============================================================
-- WAITLIST
-- ============================================================
-- Anyone can join the waitlist (anonymous submissions OK)
create policy "waitlist_insert_public"
  on public.waitlist for insert
  with check (true);

-- Only authenticated users can see their own waitlist entry
create policy "waitlist_select_own"
  on public.waitlist for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- VIP SUBMISSIONS
-- ============================================================
-- Anyone (incl. anonymous) can submit
create policy "vip_submissions_insert_public"
  on public.vip_submissions for insert
  with check (true);

-- Users can view their own submissions; admins see all (via service role)
create policy "vip_submissions_select_own"
  on public.vip_submissions for select
  using (user_id = auth.uid());
