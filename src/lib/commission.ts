export function calculateCommission(
  priceInPence: number,
  postageInPence: number,
  isFoundingSeller: boolean,
  isVipListing: boolean,
): {
  totalAmount: number
  platformFee: number
  sellerPayout: number
  commissionRate: number
} {
  const commissionRate = isVipListing ? 0.25 : isFoundingSeller ? 0.08 : 0.10
  const totalAmount = priceInPence + postageInPence
  const platformFee = Math.round(priceInPence * commissionRate)
  const sellerPayout = totalAmount - platformFee
  return { totalAmount, platformFee, sellerPayout, commissionRate }
}
