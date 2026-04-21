import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// ============================================================
// useSavedListings — set of listing IDs the current user has saved
// ============================================================
export function useSavedListings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['saved_listings', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_listings')
        .select('listing_id')
        .eq('user_id', user!.id)
      if (error) throw error
      return new Set((data ?? []).map((r) => r.listing_id))
    },
    staleTime: 30_000,
  })
}

// ============================================================
// useToggleSave — optimistically toggle a save
// ============================================================
export function useToggleSave() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ listingId, isSaved }: { listingId: string; isSaved: boolean }) => {
      if (!user) throw new Error('Must be signed in to save listings')

      if (isSaved) {
        const { error } = await supabase
          .from('saved_listings')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('saved_listings')
          .insert({ user_id: user.id, listing_id: listingId })
        if (error) throw error
      }
    },
    onMutate: async ({ listingId, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: ['saved_listings', user?.id] })
      const previous = queryClient.getQueryData<Set<string>>(['saved_listings', user?.id])
      queryClient.setQueryData<Set<string>>(['saved_listings', user?.id], (old) => {
        const next = new Set(old ?? [])
        if (isSaved) next.delete(listingId)
        else next.add(listingId)
        return next
      })
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['saved_listings', user?.id], ctx.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved_listings', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}
