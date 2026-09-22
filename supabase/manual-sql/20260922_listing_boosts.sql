-- listing_boosts table: permanent audit trail of every boost purchase
CREATE TABLE IF NOT EXISTS listing_boosts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  seller_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boost_type    text NOT NULL CHECK (boost_type IN ('featured', 'spotlight')),
  amount_pence  integer NOT NULL,
  stripe_session_id  text,
  starts_at     timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listing_boosts_listing_id_idx ON listing_boosts(listing_id);
CREATE INDEX IF NOT EXISTS listing_boosts_seller_id_idx  ON listing_boosts(seller_id);
CREATE INDEX IF NOT EXISTS listing_boosts_expires_at_idx ON listing_boosts(expires_at);

-- RLS: sellers can read their own boost records; service role writes
ALTER TABLE listing_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sellers_read_own_boosts"
  ON listing_boosts FOR SELECT
  USING (seller_id = auth.uid());

-- Denormalised columns on listings for fast read-time queries
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS active_boost_type       text CHECK (active_boost_type IN ('featured', 'spotlight')),
  ADD COLUMN IF NOT EXISTS active_boost_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS listings_active_boost_type_idx ON listings(active_boost_type)
  WHERE active_boost_type IS NOT NULL;
