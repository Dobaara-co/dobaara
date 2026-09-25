export function calculateCommission(
  priceInPence: number,
  postageInPence: number,
  _isFoundingSeller: boolean,
  _isVipListing: boolean,
): {
  totalAmount: number
  platformFee: number
  sellerPayout: number
  commissionRate: number
} {
  const commissionRate = 0
  const totalAmount = priceInPence + postageInPence
  const platformFee = 0
  const sellerPayout = priceInPence
  return { totalAmount, platformFee, sellerPayout, commissionRate }
}
