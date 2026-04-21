-- ============================================================
-- TRIGGER: Auto-create profile on new auth.users row
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix        int := 0;
begin
  -- Derive a base username from email prefix or Google display name
  base_username := coalesce(
    new.raw_user_meta_data->>'preferred_username',
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'))
  );
  -- Ensure uniqueness
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TRIGGER: Keep listings.saves_count in sync
-- ============================================================
create or replace function public.update_listing_saves_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.listings
    set saves_count = saves_count + 1
    where id = new.listing_id;
  elsif (tg_op = 'DELETE') then
    update public.listings
    set saves_count = greatest(0, saves_count - 1)
    where id = old.listing_id;
  end if;
  return null;
end;
$$;

create trigger on_saved_listing_change
  after insert or delete on public.saved_listings
  for each row execute procedure public.update_listing_saves_count();

-- ============================================================
-- TRIGGER: Update seller average_rating when review added
-- ============================================================
create or replace function public.update_seller_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set average_rating = (
    select round(avg(rating)::numeric, 2)
    from public.reviews
    where seller_id = new.seller_id
  )
  where id = new.seller_id;
  return new;
end;
$$;

create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.update_seller_rating();

-- ============================================================
-- TRIGGER: Mark listing as sold and increment seller sales when order delivered
-- ============================================================
create or replace function public.handle_order_delivered()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'delivered' and old.status <> 'delivered' then
    -- Mark the listing as sold
    update public.listings
    set is_sold = true, is_active = false
    where id = new.listing_id;
    -- Increment seller's total_sales_count
    update public.profiles
    set total_sales_count = total_sales_count + 1
    where id = new.seller_id;
  end if;
  return new;
end;
$$;

create trigger on_order_status_change
  after update on public.orders
  for each row execute procedure public.handle_order_delivered();

-- ============================================================
-- RPC: Increment listing view count (called from client)
-- Bypasses RLS using security definer — intentional for view tracking
-- ============================================================
create or replace function public.increment_listing_views(p_listing_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.listings
  set views_count = views_count + 1
  where id = p_listing_id and is_active = true;
$$;

-- ============================================================
-- FUNCTION: updated_at auto-update helper
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_listings_updated_at
  before update on public.listings
  for each row execute procedure public.set_updated_at();

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

create trigger set_vip_submissions_updated_at
  before update on public.vip_submissions
  for each row execute procedure public.set_updated_at();
