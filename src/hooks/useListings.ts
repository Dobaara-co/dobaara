import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Listing as DBListing, ListingWithSeller } from '@/types/database'
import type { Listing, Seller } from '@/data/seedData'

// ============================================================
// DB → frontend type mappers
// ============================================================
export function mapDbListingToFrontend(row: DBListing): Listing {
  return {
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
      return (data ?? []).map(mapDbListingToFrontend)
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
