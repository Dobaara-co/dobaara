import { useState } from 'react'
import { Loader2, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import {
  BOOST_PRICES_PENCE,
  boostDaysRemaining,
  boostLabel,
  effectiveBoostType,
  type BoostType,
} from '@/lib/listingBoosts'
import type { Listing } from '@/data/seedData'

const tiers: Array<{ type: BoostType; title: string; description: string }> = [
  {
    type: 'featured',
    title: 'Featured',
    description: 'Higher placement in browse and category results for 7 days.',
  },
  {
    type: 'spotlight',
    title: 'Spotlight',
    description: 'Top placement plus inclusion in the homepage Spotlight carousel for 7 days.',
  },
]

export default function BoostListingCard({ listing, sellerId }: { listing: Listing; sellerId: string }) {
  const { toast } = useToast()
  const [loadingTier, setLoadingTier] = useState<BoostType | null>(null)
  const active = effectiveBoostType(listing.activeBoostType, listing.activeBoostExpiresAt)
  const daysRemaining = boostDaysRemaining(listing.activeBoostExpiresAt)

  async function purchaseBoost(boostType: BoostType) {
    setLoadingTier(boostType)
    try {
      const { data, error } = await supabase.functions.invoke('create-boost-checkout', {
        body: { listing_id: listing.id, seller_id: sellerId, boost_type: boostType },
      })
      if (error || !data?.checkout_url) throw new Error(error?.message ?? 'Could not start checkout')
      window.location.href = data.checkout_url
    } catch (error) {
      toast({
        title: 'Could not start boost',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
      setLoadingTier(null)
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-gold/40 bg-gold-light/30 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-gold" />
        <h2 className="font-display text-lg font-semibold text-primary">Boost this listing</h2>
      </div>

      {active ? (
        <div className="mt-3 flex items-center gap-3 rounded-md border border-gold/30 bg-card p-3">
          <Zap className="h-5 w-5 text-gold" />
          <div>
            <p className="text-sm font-semibold">{boostLabel(active)} is active</p>
            <p className="text-xs text-muted-foreground">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tiers.map((tier) => (
            <div key={tier.type} className="flex flex-col rounded-md border border-border bg-card p-3">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display font-semibold">{tier.title}</h3>
                <span className="text-sm font-bold text-primary">
                  £{(BOOST_PRICES_PENCE[tier.type] / 100).toFixed(2)}
                </span>
              </div>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{tier.description}</p>
              <Button
                variant={tier.type === 'spotlight' ? 'gold' : 'outline'}
                size="sm"
                className="mt-3 w-full"
                disabled={loadingTier !== null}
                onClick={() => purchaseBoost(tier.type)}
              >
                {loadingTier === tier.type ? <Loader2 className="h-4 w-4 animate-spin" /> : `Buy ${tier.title}`}
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}