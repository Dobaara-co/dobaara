import { describe, expect, it } from 'vitest'
import { calculateBuyerProtection, calculateCheckoutPricing } from '@/lib/pricing'

describe('buyer protection pricing', () => {
  it('charges 3.5% of the item price plus 30p', () => {
    expect(calculateBuyerProtection(10_000)).toBe(380)
  })

  it('rounds to the nearest penny and includes postage in the total', () => {
    expect(calculateCheckoutPricing(9_999, 495)).toEqual({
      itemPrice: 9_999,
      buyerProtection: 380,
      postage: 495,
      total: 10_874,
    })
  })
})