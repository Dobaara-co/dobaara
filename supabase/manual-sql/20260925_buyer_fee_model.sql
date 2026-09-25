-- Store the three fee components explicitly on every order so historical
-- records remain correct if the fee percentage changes in future.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS buyer_protection_fee_pence integer,
  ADD COLUMN IF NOT EXISTS postage_cost_pence         integer,
  ADD COLUMN IF NOT EXISTS seller_payout_pence        integer;
