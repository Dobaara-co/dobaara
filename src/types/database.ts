export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          is_founding_seller: boolean
          is_vip_seller: boolean
          total_sales_count: number
          average_rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          is_founding_seller?: boolean
          is_vip_seller?: boolean
          total_sales_count?: number
          average_rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          is_founding_seller?: boolean
          is_vip_seller?: boolean
          total_sales_count?: number
          average_rating?: number
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string | null
          category: string
          occasion: string | null
          condition: string
          colour: string | null
          designer_brand: string | null
          size_label: string | null
          bust_cm: number | null
          waist_cm: number | null
          hips_cm: number | null
          length_cm: number | null
          price: number
          original_price: number | null
          postage_price: number
          free_postage: boolean
          images: string[]
          primary_image_index: number
          is_vip_verified: boolean
          is_active: boolean
          is_sold: boolean
          views_count: number
          saves_count: number
          location: string | null
          ships_from: string | null
          ships_to: string[]
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description?: string | null
          category: string
          occasion?: string | null
          condition: string
          colour?: string | null
          designer_brand?: string | null
          size_label?: string | null
          bust_cm?: number | null
          waist_cm?: number | null
          hips_cm?: number | null
          length_cm?: number | null
          price: number
          original_price?: number | null
          postage_price?: number
          free_postage?: boolean
          images?: string[]
          primary_image_index?: number
          is_vip_verified?: boolean
          is_active?: boolean
          is_sold?: boolean
          views_count?: number
          saves_count?: number
          location?: string | null
          ships_from?: string | null
          ships_to?: string[]
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          category?: string
          occasion?: string | null
          condition?: string
          colour?: string | null
          designer_brand?: string | null
          size_label?: string | null
          bust_cm?: number | null
          waist_cm?: number | null
          hips_cm?: number | null
          length_cm?: number | null
          price?: number
          original_price?: number | null
          postage_price?: number
          free_postage?: boolean
          images?: string[]
          primary_image_index?: number
          is_vip_verified?: boolean
          is_active?: boolean
          is_sold?: boolean
          location?: string | null
          ships_from?: string | null
          ships_to?: string[]
          tags?: string[]
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          listing_id: string | null
          buyer_id: string
          seller_id: string
          amount: number
          status: string
          stripe_payment_intent_id: string | null
          shipping_address: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id?: string | null
          buyer_id: string
          seller_id: string
          amount: number
          status?: string
          stripe_payment_intent_id?: string | null
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          stripe_payment_intent_id?: string | null
          shipping_address?: Json | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          listing_id: string | null
          sender_id: string
          recipient_id: string
          body: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          listing_id?: string | null
          sender_id: string
          recipient_id: string
          body: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          reviewer_id: string
          seller_id: string
          rating: number
          body: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          reviewer_id: string
          seller_id: string
          rating: number
          body?: string | null
          created_at?: string
        }
        Update: {
          body?: string | null
        }
      }
      saved_listings: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
        }
        Update: {
          email?: string
          name?: string | null
        }
      }
      vip_submissions: {
        Row: {
          id: string
          user_id: string | null
          email: string
          full_name: string
          item_type: string
          designer_brand: string | null
          description: string | null
          estimated_value: number | null
          photo_urls: string[] | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          full_name: string
          item_type: string
          designer_brand?: string | null
          description?: string | null
          estimated_value?: number | null
          photo_urls?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          updated_at?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          subject: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject: string
          message: string
          created_at?: string
        }
        Update: {
          name?: string
          email?: string
          subject?: string
          message?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_listing_views: {
        Args: { p_listing_id: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience aliases
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Profile = Tables<'profiles'>
export type Listing = Tables<'listings'>
export type Order = Tables<'orders'>
export type Message = Tables<'messages'>
export type Review = Tables<'reviews'>
export type SavedListing = Tables<'saved_listings'>
export type WaitlistEntry = Tables<'waitlist'>
export type VipSubmission = Tables<'vip_submissions'>

// Listing with seller profile joined
export type ListingWithSeller = Listing & {
  profiles: Profile | null
}
