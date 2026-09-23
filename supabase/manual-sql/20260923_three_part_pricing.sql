ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS item_price_amount integer,
  ADD COLUMN IF NOT EXISTS buyer_protection_amount integer,
  ADD COLUMN IF NOT EXISTS postage_amount integer;

COMMENT ON COLUMN public.orders.item_price_amount IS 'Item listing price in pence';
COMMENT ON COLUMN public.orders.buyer_protection_amount IS 'Buyer protection fee in pence';
COMMENT ON COLUMN public.orders.postage_amount IS 'Postage charged to buyer in pence';