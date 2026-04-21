-- ============================================================
-- Dobaara — Development Seed Data
-- ============================================================
-- PURPOSE : Populate the DB with 2 seed seller profiles and 4
--           Tara lehenga listings so the homepage "New Arrivals"
--           section renders during local / staging development.
--
-- SAFE TO RE-RUN : Uses ON CONFLICT DO NOTHING on every insert.
--                  To fully reset, run the "Reset" block below first.
--
-- IMPORTANT : These are NOT real users. Profile IDs follow the
--             pattern 00000000-0000-0000-dada-* and must never
--             be used in production data.
--
-- IMAGE URLS : Images must be uploaded to Supabase Storage BEFORE
--              these URLs resolve. See README section below.
-- ============================================================

-- ============================================================
-- STEP 0  Bypass FK checks so we can insert profiles without
--         matching auth.users rows (seed accounts only).
--         The postgres / service-role user ignores RLS; this
--         extra toggle disables referential-integrity checks for
--         this session only.
-- ============================================================
SET session_replication_role = replica;

-- ============================================================
-- STEP 1  Seed profiles  (2 sellers)
-- ============================================================
-- Seller A — Priya Singh, London, founding seller (8 % commission tier)
-- Seller B — Aisha Mahmood, Birmingham, standard seller

INSERT INTO public.profiles (
  id,
  username,
  full_name,
  bio,
  location,
  is_founding_seller,
  is_vip_seller,
  total_sales_count,
  average_rating,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-0000-dada-000000000001',
    'priya_singh_london',
    'Priya Singh',
    'Bridal fashion lover based in London. Selling my collection of designer lehengas and sarees — each piece has a story.',
    'London, UK',
    true,   -- founding seller → 8 % commission tier
    false,
    12,
    4.90,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-dada-000000000002',
    'aisha_mahmood_bham',
    'Aisha Mahmood',
    'Birmingham-based South Asian fashion enthusiast. Carefully curated pieces from weddings and family events.',
    'Birmingham, UK',
    false,
    false,
    5,
    4.75,
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 2  Seed listings  (4 Tara outfits)
-- ============================================================
-- Image public URLs assume files are uploaded to the
-- listing-images bucket under the path  seed/<filename>
-- e.g. https://mutxjqldhjzbgculyiom.supabase.co/storage/v1/object/public/listing-images/seed/tara-cream.jpg

INSERT INTO public.listings (
  id,
  seller_id,
  title,
  description,
  category,
  occasion,
  condition,
  colour,
  designer_brand,
  size_label,
  bust_cm,
  waist_cm,
  hips_cm,
  length_cm,
  price,
  original_price,
  postage_price,
  free_postage,
  images,
  primary_image_index,
  is_active,
  is_sold,
  ships_from,
  ships_to,
  tags,
  created_at,
  updated_at
) VALUES
  (
    -- a) Ivory & Gold Bridal Lehenga (tara-cream.jpg)
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-dada-000000000001',  -- Priya, London
    'Ivory & Gold Bridal Lehenga — Sabyasachi Style',
    E'Breathtaking ivory and gold bridal lehenga with intricate zardozi and dabka embroidery on heavy silk. '
    'The skirt features dense gold threadwork with floral motifs throughout, and the matching heavily-embroidered blouse '
    'has a deep back. Comes with a matching embroidered organza dupatta with gold border.\n\n'
    'Worn once at a wedding ceremony, professionally dry cleaned and stored in a muslin bag. '
    'Purchased from a London boutique. This is a true showstopper that photographs beautifully.',
    'lehenga',
    'wedding',
    'excellent',
    'Ivory',
    'Sabyasachi Style',
    'M',
    89,    -- bust  ~35 in
    74,    -- waist ~29 in
    99,    -- hips  ~39 in
    107,   -- length ~42 in
    65000,   -- £650
    250000,  -- original ~£2,500
    550,     -- £5.50 postage
    false,
    ARRAY['https://mutxjqldhjzbgculyiom.supabase.co/storage/v1/object/public/listing-images/seed/tara-cream.jpg'],
    0,
    true,
    false,
    'London',
    ARRAY['UK'],
    ARRAY['lehenga','bridal','sabyasachi','ivory','gold','wedding','embroidery'],
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    -- b) Blush Pink Sequin Lehenga (tara-blush.jpg)
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-dada-000000000002',  -- Aisha, Birmingham
    'Blush Pink Sequin Lehenga — Manish Malhotra Style',
    E'Stunning blush pink lehenga in the Manish Malhotra aesthetic. Lightweight georgette skirt covered in '
    'all-over silver and rose-gold sequin work that catches the light beautifully at every angle. '
    'Comes with a matching sequined blouse with sheer sleeves and a plain organza dupatta with sequin border.\n\n'
    'Ideal for sangeet, reception, or a glamorous party. Worn once and dry cleaned — the sequins are all intact '
    'with no pulls or missing pieces. Stunning in photos.',
    'lehenga',
    'sangeet',
    'very_good',
    'Blush Pink',
    'Manish Malhotra Style',
    'S',
    86,    -- bust  ~34 in
    71,    -- waist ~28 in
    96,    -- hips  ~38 in
    107,   -- length ~42 in
    38000,   -- £380
    180000,  -- original ~£1,800
    550,     -- £5.50 postage
    false,
    ARRAY['https://mutxjqldhjzbgculyiom.supabase.co/storage/v1/object/public/listing-images/seed/tara-blush.jpg'],
    0,
    true,
    false,
    'Birmingham',
    ARRAY['UK'],
    ARRAY['lehenga','sangeet','manish-malhotra','blush','pink','sequin','reception'],
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    -- c) Teal & Gold Embroidered Lehenga (tara-teal.jpg)
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-dada-000000000001',  -- Priya, London
    'Teal & Gold Embroidered Lehenga — Anita Dongre Style',
    E'Gorgeous teal and gold lehenga inspired by Anita Dongre''s signature nature motifs. '
    'Rich teal raw silk skirt with hand-done gold thread floral and paisley embroidery throughout. '
    'Comes with a matching mirror-work blouse and a teal organza dupatta with gold zari border.\n\n'
    'A truly versatile piece — perfect for a wedding guest or a reception outfit. Worn once at a '
    'reception and professionally dry cleaned. The colour photographs beautifully in both daylight and evening settings.',
    'lehenga',
    'wedding',
    'excellent',
    'Teal',
    'Anita Dongre Style',
    'M',
    89,    -- bust  ~35 in
    74,    -- waist ~29 in
    99,    -- hips  ~39 in
    107,   -- length ~42 in
    52000,   -- £520
    160000,  -- original ~£1,600
    550,     -- £5.50 postage
    false,
    ARRAY['https://mutxjqldhjzbgculyiom.supabase.co/storage/v1/object/public/listing-images/seed/tara-teal.jpg'],
    0,
    true,
    false,
    'London',
    ARRAY['UK'],
    ARRAY['lehenga','anita-dongre','teal','emerald','gold','wedding','embroidery','mirror-work'],
    now() - interval '3 hours',
    now() - interval '3 hours'
  ),
  (
    -- d) Champagne Beige Lehenga (tara-beige.jpg)
    '00000000-0000-0000-0001-000000000004',
    '00000000-0000-0000-dada-000000000002',  -- Aisha, Birmingham
    'Champagne Beige Lehenga — Tarun Tahiliani Style',
    E'Understated luxury in champagne beige, inspired by Tarun Tahiliani''s signature tissue silk silhouettes. '
    'Sheer tissue silk skirt with delicate gold mukaish (all-over) embellishment and a scalloped hem. '
    'Comes with a heavily embroidered blouse with a halter neckline and a nude organza dupatta with gold border.\n\n'
    'Ideal for a mehendi ceremony or an intimate sangeet. The muted tones complement all skin tones beautifully. '
    'Worn once and lovingly stored — the fabric is pristine with no pulls or snags.',
    'lehenga',
    'mehendi',
    'very_good',
    'Champagne',
    'Tarun Tahiliani Style',
    'L',
    91,    -- bust  ~36 in
    76,    -- waist ~30 in
    102,   -- hips  ~40 in
    107,   -- length ~42 in
    42000,   -- £420
    120000,  -- original ~£1,200
    550,     -- £5.50 postage
    false,
    ARRAY['https://mutxjqldhjzbgculyiom.supabase.co/storage/v1/object/public/listing-images/seed/tara-beige.jpg'],
    0,
    true,
    false,
    'Birmingham',
    ARRAY['UK'],
    ARRAY['lehenga','tarun-tahiliani','champagne','beige','mehendi','sangeet','tissue-silk'],
    now() - interval '1 hour',
    now() - interval '1 hour'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 3  Restore normal FK enforcement
-- ============================================================
SET session_replication_role = DEFAULT;

-- ============================================================
-- VERIFY (optional — uncomment to check row counts)
-- ============================================================
-- SELECT 'profiles' AS tbl, count(*) FROM public.profiles WHERE id::text LIKE '00000000-0000-0000-dada-%'
-- UNION ALL
-- SELECT 'listings', count(*) FROM public.listings WHERE id::text LIKE '00000000-0000-0000-0001-%';

-- ============================================================
-- RESET BLOCK — run this BEFORE re-seeding to start clean
-- ============================================================
-- DELETE FROM public.listings WHERE id::text LIKE '00000000-0000-0000-0001-%';
-- DELETE FROM public.profiles WHERE id::text LIKE '00000000-0000-0000-dada-%';
