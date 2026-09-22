export type BoostType = 'featured' | 'spotlight'

export const BOOST_PRICES_PENCE: Record<BoostType, number> = {
  featured: 299,
  spotlight: 599,
}

export const BOOST_DURATION_DAYS = 7

export function effectiveBoostType(
  boostType: BoostType | null | undefined,
  expiresAt: string | null | undefined,
): BoostType | null {
  if (!boostType || !expiresAt) return null
  if (new Date(expiresAt) <= new Date()) return null
  return boostType
}

// Higher = shown earlier in sorted results. Unboosted = 0.
export function boostWeight(boostType: BoostType | null): number {
  if (boostType === 'spotlight') return 2
  if (boostType === 'featured') return 1
  return 0
}

export function isCarouselEligible(
  boostType: BoostType | null | undefined,
  expiresAt: string | null | undefined,
): boolean {
  return effectiveBoostType(boostType, expiresAt) === 'spotlight'
}

export function boostLabel(boostType: BoostType): string {
  return boostType === 'spotlight' ? 'Spotlight' : 'Featured'
}

export function boostDaysRemaining(expiresAt: string | null | undefined): number {
  if (!expiresAt) return 0
  const ms = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}
