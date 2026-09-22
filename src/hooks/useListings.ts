import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Listing as DBListing, ListingWithSeller } from '@/types/database'
import type { Listing, Seller } from '@/data/seedData'
import { assessFit } from '@/lib/fitMatch'
import type { MyMeasurements } from '@/hooks/useMyMeasurements'

// ============================================================
// DB → frontend type mappers
// ============================================================
export function mapDbListingToFrontend(row: DBListing): Listing {
  const extra = row as unknown as Record<string, unknown>
  const num = (key: string) => {
    const v = extra[key]
    return v === null || v === undefined ? undefined : Number(v)
  }
  const str = (key: string) => {
    const v = extra[key]
    return typeof v === 'string' && v.length > 0 ? v : undefined
  }
  return {
    blouseBustCm: num('blouse_bust_cm'),
    blouseWaistCm: num('blouse_waist_cm'),
    blouseLengthCm: num('blouse_length_cm'),
    shoulderCm: num('shoulder_cm'),
    sleeveLengthCm: num('sleeve_length_cm'),
    blouseMarginCm: num('blouse_margin_cm'),
    skirtWaistCm: num('skirt_waist_cm'),
    skirtLengthCm: num('skirt_length_cm'),
    skirtFlareCm: num('skirt_flare_cm'),
    skirtMarginCm: num('skirt_margin_cm'),
    marginCm: num('margin_cm'),
    stitchingStatus: str('stitching_status') as Listing['stitchingStatus'],
    waistType: str('waist_type') as Listing['waistType'],
    heightMinCm: num('height_min_cm'),
    heightMaxCm: num('height_max_cm'),
    alterationNotes: str('alteration_notes'),
    sareeLengthCm: num('saree_length_cm'),
    sareeWidthCm: num('saree_width_cm'),
    fallPicoAttached: extra['fall_pico_attached'] === true,
    blouseIncluded: extra['blouse_included'] === true,
    kameezBustCm: num('kameez_bust_cm'),
    kameezWaistCm: num('kameez_waist_cm'),
    kameezHipCm: num('kameez_hip_cm'),
    kameezLengthCm: num('kameez_length_cm'),
    kameezMarginCm: num('kameez_margin_cm'),
    salwarWaistCm: num('salwar_waist_cm'),
    salwarLengthCm: num('salwar_length_cm'),
    dupattaIncluded: extra['dupatta_included'] === true,
    anarkaliiBustCm: num('anarkali_bust_cm'),
    anarkaliWaistCm: num('anarkali_waist_cm'),
    anarkaliFullLengthCm: num('anarkali_full_length_cm'),
    anarkaliiFlareCm: num('anarkali_flare_cm'),
    anarkaliMarginCm: num('anarkali_margin_cm'),
    sherwaniChestCm: num('sherwani_chest_cm'),
    sherwaniFullLengthCm: num('sherwani_full_length_cm'),
    sherwaniMarginCm: num('sherwani_margin_cm'),
    trouserWaistCm: num('trouser_waist_cm'),
    trouserLengthCm: num('trouser_length_cm'),
    dupattaLengthCm: num('dupatta_length_cm'),
    dupattaWidthCm: num('dupatta_width_cm'),
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description ?? '',
    category: row.category,
    occasion: row.occasion ?? '',
    condition: row.condition as Listing['condition'],
    colour: row.colour ?? '',
    designerBrand: row.designer_brand ?? '',
    sizeLabel: row.size_label ?? '',
    bustCm: row.bust_cm ?? undefined,
    waistCm: row.waist_cm ?? undefined,
    hipsCm: row.hips_cm ?? undefined,
    lengthCm: row.length_cm ?? undefined,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    postagePrice: row.postage_price,
    freePostage: row.free_postage,
    images: row.images,
    primaryImageIndex: row.primary_image_index,
    isVipVerified: row.is_vip_verified,
    isActive: row.is_active,
    isSold: row.is_sold,
    viewsCount: row.views_count,
    savesCount: row.saves_count,
    location: row.location ?? '',
    shipsFrom: row.ships_from ?? '',
    shipsTo: row.ships_to,
    tags: row.tags,
    createdAt: row.created_at,
    tryonStatus: row.tryon_status ?? null,
    tryonImageUrl: row.tryon_image_url ?? null,
  }
}

export function mapDbProfileToSeller(row: ListingWithSeller['profiles']): Seller | undefined {
  if (!row) return undefined
  return {
    id: row.id,
    fullName: row.full_name ?? row.username,
    username: row.username,
    avatarUrl: row.avatar_url ?? '',
    bio: row.bio ?? '',
    location: row.location ?? '',
    isFoundingSeller: row.is_founding_seller,
    isVipSeller: row.is_vip_seller,
    totalSalesCount: row.total_sales_count,
    averageRating: Number(row.average_rating),
    stripeOnboardingComplete: row.stripe_onboarding_complete,
  }
}

// ============================================================
// Filter shape
// ============================================================
export interface ListingFilters {
  categories?: string[]
  occasions?: string[]
  conditions?: string[]
  sizes?: string[]
  verifiedOnly?: boolean
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'most_saved'
  limit?: number
  fitsMe?: MyMeasurements | null
}

// ============================================================
// useListings — filterable list of active listings
// ============================================================
export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .eq('is_sold', false)

      if (filters.categories?.length) {
        query = query.in('category', filters.categories)
      }
      if (filters.occasions?.length) {
        query = query.in('occasion', filters.occasions)
      }
      if (filters.conditions?.length) {
        query = query.in('condition', filters.conditions)
      }
      if (filters.sizes?.length) {
        query = query.in('size_label', filters.sizes)
      }
      if (filters.verifiedOnly) {
        query = query.eq('is_vip_verified', true)
      }

      switch (filters.sort) {
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        case 'most_saved':
          query = query.order('saves_count', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
      if (error) throw error
      const results = (data ?? []).map(mapDbListingToFrontend)
      if (filters.fitsMe) {
        const buyer = filters.fitsMe
        return results.filter((l) => {
          const fit = assessFit(l, buyer)
          return fit.overall === 'FITS' || fit.overall === 'FITS_WITH_ALTERATION'
        })
      }
      return results
    },
    staleTime: 60_000,
  })
}

// ============================================================
// useListing — single listing with seller profile joined
// ============================================================
export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*, profiles(*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      const row = data as unknown as ListingWithSeller
      return {
        listing: mapDbListingToFrontend(row),
        seller: mapDbProfileToSeller(row.profiles),
      }
    },
    staleTime: 60_000,
  })
}

// ============================================================
// useSellerListings — all active listings by a seller
// ============================================================
export function useSellerListings(sellerId: string | undefined) {
  return useQuery({
    queryKey: ['listings', 'seller', sellerId],
    enabled: !!sellerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', sellerId!)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapDbListingToFrontend)
    },
    staleTime: 60_000,
  })
}
