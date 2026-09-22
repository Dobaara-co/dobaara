import type { Listing } from '@/data/seedData'
import type { MyMeasurements } from '@/hooks/useMyMeasurements'

export type ComponentFit = 'FITS' | 'FITS_WITH_ALTERATION' | 'UNLIKELY'
export type OverallFit = ComponentFit | 'NO_DATA'

export interface ComponentResult {
  component: string
  state: ComponentFit
}

export interface FitResult {
  overall: OverallFit
  components: ComponentResult[]
  unstitchedNote?: boolean
}

const TOO_LOOSE = 7.5

function assess(
  component: string,
  buyer: number,
  garment: number,
  margin: number | undefined,
): ComponentResult {
  if (buyer <= garment) {
    return {
      component,
      state: garment - buyer > TOO_LOOSE ? 'FITS_WITH_ALTERATION' : 'FITS',
    }
  }
  if (margin != null && margin > 0 && buyer <= garment + margin) {
    return { component, state: 'FITS_WITH_ALTERATION' }
  }
  return { component, state: 'UNLIKELY' }
}

function worstState(states: ComponentFit[]): ComponentFit {
  if (states.includes('UNLIKELY')) return 'UNLIKELY'
  if (states.includes('FITS_WITH_ALTERATION')) return 'FITS_WITH_ALTERATION'
  return 'FITS'
}

function effectiveWaist(cm: number, waistType: string | null | undefined): number {
  return waistType === 'elastic' || waistType === 'drawstring' ? cm + 10 : cm
}

function heightCheck(
  component: string,
  lengthCm: number | undefined,
  heightCm: number | undefined,
  heightMinCm: number | undefined,
  heightMaxCm: number | undefined,
): ComponentResult | null {
  if (lengthCm == null || heightCm == null) return null
  if ((heightMinCm != null && heightCm < heightMinCm) || (heightMaxCm != null && heightCm > heightMaxCm)) {
    return { component, state: 'FITS_WITH_ALTERATION' }
  }
  return null
}

export function assessFit(listing: Listing, buyer: MyMeasurements): FitResult {
  const noData =
    buyer.bustCm == null &&
    buyer.waistCm == null &&
    buyer.hipsCm == null &&
    buyer.heightCm == null
  if (noData) return { overall: 'NO_DATA', components: [] }

  if (listing.stitchingStatus === 'unstitched') {
    return { overall: 'FITS', components: [], unstitchedNote: true }
  }

  const cat = (listing.category ?? '').toLowerCase()
  const fallbackMargin = listing.marginCm
  const components: ComponentResult[] = []

  const push = (
    label: string,
    buyerVal: number | undefined,
    garmentVal: number | undefined,
    margin: number | undefined,
  ) => {
    if (buyerVal == null || garmentVal == null) return
    components.push(assess(label, buyerVal, garmentVal, margin))
  }

  const pushHeight = (component: string, lengthCm: number | undefined) => {
    const r = heightCheck(
      component,
      lengthCm,
      buyer.heightCm,
      listing.heightMinCm,
      listing.heightMaxCm,
    )
    if (r) components.push(r)
  }

  if (cat === 'lehenga') {
    const topM = listing.blouseMarginCm ?? fallbackMargin
    push('Blouse bust', buyer.bustCm, listing.blouseBustCm, topM)
    push('Blouse waist', buyer.waistCm, listing.blouseWaistCm, topM)
    const botM = listing.skirtMarginCm ?? fallbackMargin
    const skirtW =
      listing.skirtWaistCm != null
        ? effectiveWaist(listing.skirtWaistCm, listing.waistType)
        : undefined
    push('Skirt waist', buyer.waistCm, skirtW, botM)
    pushHeight('Skirt length', listing.skirtLengthCm)
  } else if (cat === 'saree' || cat === 'sari') {
    pushHeight('Saree length', listing.sareeLengthCm)
    if (listing.blouseIncluded) {
      const topM = listing.blouseMarginCm ?? fallbackMargin
      push('Blouse bust', buyer.bustCm, listing.blouseBustCm, topM)
      push('Blouse waist', buyer.waistCm, listing.blouseWaistCm, topM)
    }
  } else if (cat === 'salwar_kameez') {
    const topM = listing.kameezMarginCm ?? fallbackMargin
    push('Kameez bust', buyer.bustCm, listing.kameezBustCm, topM)
    push('Kameez waist', buyer.waistCm, listing.kameezWaistCm, topM)
    push('Kameez hip', buyer.hipsCm, listing.kameezHipCm, topM)
    const salwarW =
      listing.salwarWaistCm != null
        ? effectiveWaist(listing.salwarWaistCm, listing.waistType)
        : undefined
    push('Salwar waist', buyer.waistCm, salwarW, fallbackMargin)
  } else if (cat === 'anarkali') {
    const topM = listing.anarkaliMarginCm ?? fallbackMargin
    push('Bust', buyer.bustCm, listing.anarkaliiBustCm, topM)
    push('Waist', buyer.waistCm, listing.anarkaliWaistCm, topM)
    pushHeight('Anarkali length', listing.anarkaliFullLengthCm)
  } else if (cat === 'sherwani') {
    const topM = listing.sherwaniMarginCm ?? fallbackMargin
    push('Chest', buyer.bustCm, listing.sherwaniChestCm, topM)
    const trouserW =
      listing.trouserWaistCm != null
        ? effectiveWaist(listing.trouserWaistCm, listing.waistType)
        : undefined
    push('Trouser waist', buyer.waistCm, trouserW, fallbackMargin)
    pushHeight('Sherwani length', listing.sherwaniFullLengthCm)
  }

  if (components.length === 0) return { overall: 'NO_DATA', components: [] }

  return {
    overall: worstState(components.map((c) => c.state)),
    components,
  }
}
