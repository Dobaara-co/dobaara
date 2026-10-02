-- ============================================================
-- REVIEWS: three improvements
--   1. Fix seller_id validation gap in insert RLS
--   2. Add seller_response column with one-shot update policy
--   3. Add admin (service_role) delete policy
-- ============================================================

-- 1. Add seller_response column
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS seller_response text;

-- 2. Fix insert policy — also verify seller_id matches the order's seller
DROP POLICY IF EXISTS "reviews_insert_buyer" ON public.reviews;

CREATE POLICY "reviews_insert_buyer"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = reviews.order_id
        AND buyer_id  = auth.uid()
        AND seller_id = reviews.seller_id   -- gap fix: must match order's seller
        AND status    = 'delivered'
    )
  );

-- 3. Seller can set their response exactly once.
--    USING filters to rows where seller_response IS NULL, so once a response
--    is written the row is no longer eligible for update — no re-editing.
CREATE POLICY "reviews_update_seller_response"
  ON public.reviews FOR UPDATE
  USING    (seller_id = auth.uid() AND seller_response IS NULL)
  WITH CHECK (seller_id = auth.uid());

-- Belt-and-suspenders trigger: prevent overwriting seller_response even via
-- service_role or future policy changes.
CREATE OR REPLACE FUNCTION public.prevent_seller_response_overwrite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.seller_response IS NOT NULL
     AND NEW.seller_response IS DISTINCT FROM OLD.seller_response THEN
    RAISE EXCEPTION 'Seller response cannot be changed once set';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_seller_response_immutability ON public.reviews;
CREATE TRIGGER enforce_seller_response_immutability
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.prevent_seller_response_overwrite();

-- 4. Admin delete — matches the service_role pattern used for virtual_models
--    and listing_tryons.  No buyer/seller delete allowed (intentional).
CREATE POLICY "reviews_delete_admin"
  ON public.reviews FOR DELETE
  USING (auth.role() = 'service_role');
