import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Package, CheckCircle2, Loader2, CreditCard, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSellerListings } from '@/hooks/useListings'
import { effectiveBoostType, boostDaysRemaining, boostLabel, BOOST_PRICES_PENCE } from '@/lib/listingBoosts'
import type { BoostType } from '@/lib/listingBoosts'

const schema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers and underscores only'),
  bio: z.string().max(200, 'Max 200 characters').optional(),
  location: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const Account = () => {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [stripeLoading, setStripeLoading] = useState(false)
  const [boostingListingId, setBoostingListingId] = useState<string | null>(null)
  const { data: sellerListings = [] } = useSellerListings(user?.id)

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      full_name: profile?.full_name ?? '',
      username: profile?.username ?? '',
      bio: profile?.bio ?? '',
      location: profile?.location ?? '',
    },
  })

  // Handle return from Stripe onboarding or boost checkout
  useEffect(() => {
    const stripeParam = searchParams.get('stripe')
    const boostParam = searchParams.get('boost')
    if (stripeParam === 'success') {
      toast({ title: 'Payment setup complete!', description: 'You can now receive payouts from sales.' })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    } else if (stripeParam === 'refresh') {
      toast({
        title: 'Payment setup incomplete',
        description: 'Please complete your payment setup to start selling.',
        variant: 'destructive',
      })
    } else if (boostParam === 'success') {
      toast({ title: 'Boost activated!', description: 'Your listing is now boosted for 7 days.' })
      queryClient.invalidateQueries({ queryKey: ['listings', 'seller'] })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to /auth only once we know auth state has finished loading
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true, state: { from: '/account' } })
    }
  }, [loading, user, navigate])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // User exists but profile row not yet loaded (or missing)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  async function handleStripeOnboard() {
    setStripeLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboard', {
        body: {
          user_id: user!.id,
          return_url: 'https://www.dobaara.co/account?stripe=success',
          refresh_url: 'https://www.dobaara.co/account?stripe=refresh',
        },
      })
      if (error || !data?.url) throw new Error(error?.message ?? 'Could not start onboarding')
      window.location.href = data.url
    } catch (err) {
      toast({
        title: 'Could not start payment setup',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      })
      setStripeLoading(false)
    }
  }

  async function handleBoost(listingId: string, boostType: BoostType) {
    setBoostingListingId(listingId)
    try {
      const { data, error } = await supabase.functions.invoke('create-boost-checkout', {
        body: { listing_id: listingId, seller_id: user!.id, boost_type: boostType },
      })
      if (error || !data?.checkout_url) throw new Error(error?.message ?? 'Could not start checkout')
      window.location.href = data.checkout_url
    } catch (err) {
      toast({
        title: 'Could not start boost',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      })
      setBoostingListingId(null)
    }
  }

  async function onSubmit(values: FormValues) {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: values.full_name,
        username: values.username,
        bio: values.bio ?? null,
        location: values.location ?? null,
      })
      .eq('id', user!.id)

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Profile updated' })
      queryClient.invalidateQueries({ queryKey: ['profile', user!.id] })
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="container py-10 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
          <LogOut className="h-4 w-4 mr-1" /> Sign out
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-8 p-4 rounded-lg border border-border bg-card">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback>{profile.full_name?.[0] ?? profile.username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{profile.full_name ?? profile.username}</p>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
        </div>
      </div>

      <div className="mb-8 p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Selling</span>
        </div>
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{profile.total_sales_count}</p>
            <p className="text-xs text-muted-foreground">Total Sales</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{Number(profile.average_rating).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate('/sell')}>
          + List an item for sale
        </Button>
      </div>

      {/* Your listings */}
      {sellerListings.length > 0 && (
        <div className="mb-8 p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-gold" />
            <span className="font-semibold text-sm">Your Listings</span>
          </div>
          <div className="space-y-3">
            {sellerListings.map((listing) => {
              const active = effectiveBoostType(listing.activeBoostType, listing.activeBoostExpiresAt)
              const daysLeft = boostDaysRemaining(listing.activeBoostExpiresAt)
              const isLoading = boostingListingId === listing.id
              return (
                <div key={listing.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  {listing.images[listing.primaryImageIndex] && (
                    <img
                      src={listing.images[listing.primaryImageIndex]}
                      alt={listing.title}
                      className="h-12 w-12 rounded-md object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={`/listing/${listing.id}`} className="text-sm font-medium hover:underline line-clamp-1">
                      {listing.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">£{(listing.price / 100).toFixed(2)}</p>
                    {active ? (
                      <p className="text-xs text-gold font-medium mt-0.5">
                        {boostLabel(active)} · {daysLeft}d left
                      </p>
                    ) : null}
                  </div>
                  {!active && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2"
                        disabled={isLoading}
                        onClick={() => handleBoost(listing.id, 'featured')}
                      >
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : `Featured £${(BOOST_PRICES_PENCE.featured / 100).toFixed(2)}`}
                      </Button>
                      <Button
                        variant="gold"
                        size="sm"
                        className="text-xs h-7 px-2"
                        disabled={isLoading}
                        onClick={() => handleBoost(listing.id, 'spotlight')}
                      >
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : `Spotlight £${(BOOST_PRICES_PENCE.spotlight / 100).toFixed(2)}`}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stripe payment setup */}
      <div className="mb-8 p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Seller Payments</span>
        </div>
        {profile.stripe_onboarding_complete ? (
          <div>
            <div className="flex items-center gap-2 text-sm text-success font-medium mb-1">
              <CheckCircle2 className="h-4 w-4" /> Payments set up ✓
            </div>
            <p className="text-xs text-muted-foreground">
              Your earnings will be paid out within 7 days of each sale.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Connect your bank account to start receiving payments from sales.
            </p>
            {searchParams.get('stripe') === 'refresh' && (
              <p className="text-xs text-destructive mb-2">
                Your setup wasn't completed — please try again.
              </p>
            )}
            <Button
              variant="hero"
              size="sm"
              className="w-full"
              onClick={handleStripeOnboard}
              disabled={stripeLoading}
            >
              {stripeLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirecting…</>
              ) : (
                'Set up payments'
              )}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <h2 className="text-lg font-semibold">Edit Profile</h2>
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" {...register('full_name')} />
          {errors.full_name && <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
            <Input id="username" className="pl-7" {...register('username')} />
          </div>
          {errors.username && <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>}
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="e.g. London" {...register('location')} />
        </div>
        <div>
          <Label htmlFor="bio">Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea id="bio" rows={3} placeholder="Tell buyers a bit about yourself…" {...register('bio')} />
          {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>}
        </div>
        <Button variant="hero" type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}

export default Account
