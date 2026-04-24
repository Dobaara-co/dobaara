import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Dobaara] Missing Supabase env vars. ' +
    'Copy .env.example → .env.local and set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

/** Returns the public URL for a file in the listing-images bucket */
export function getListingImageUrl(path: string): string {
  const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
  return data.publicUrl
}

/** Calls the send-email edge function directly via fetch */
export async function sendEmail(payload: {
  to: string
  subject: string
  html: string
  from?: string
}): Promise<void> {
  const url = `${supabaseUrl}/functions/v1/send-email`
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(payload),
  })
}
