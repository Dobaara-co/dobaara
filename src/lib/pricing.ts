export const BUYER_PROTECTION_RATE = 0.035
export const BUYER_PROTECTION_FIXED_PENCE = 30

export function calculateBuyerProtection(itemPricePence: number): number {
  return Math.round(itemPricePence * BUYER_PROTECTION_RATE) + BUYER_PROTECTION_FIXED_PENCE
}

export function calculateCheckoutPricing(
  itemPricePence: number,
  postagePence: number,
): {
  itemPrice: number
  buyerProtection: number
  postage: number
  total: number
} {
  const buyerProtection = calculateBuyerProtection(itemPricePence)
  return {
    itemPrice: itemPricePence,
    buyerProtection,
    postage: postagePence,
    total: itemPricePence + buyerProtection + postagePence,
  }
}