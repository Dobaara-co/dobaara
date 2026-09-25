export interface FeeBreakdown {
  itemPricePence: number
  postagePence: number
  buyerProtectionFeePence: number
  platformFeePence: number
  sellerPayoutPence: number
  totalChargePence: number
  isVerified: boolean
}

export function calcFees(
  itemPricePence: number,
  postagePence: number,
  isVipVerified: boolean,
): FeeBreakdown {
  if (isVipVerified) {
    const platformFeePence = Math.round(itemPricePence * 0.25)
    return {
      itemPricePence,
      postagePence,
      buyerProtectionFeePence: 0,
      platformFeePence,
      sellerPayoutPence: itemPricePence - platformFeePence,
      totalChargePence: itemPricePence + postagePence,
      isVerified: true,
    }
  }

  // Standard peer-to-peer: buyer pays 3.5% + £0.30 flat protection fee.
  // Seller receives 100% of the item price. Postage stays with Dobaara for Packlink settlement.
  const buyerProtectionFeePence = Math.round(itemPricePence * 0.035) + 30
  return {
    itemPricePence,
    postagePence,
    buyerProtectionFeePence,
    platformFeePence: buyerProtectionFeePence,
    sellerPayoutPence: itemPricePence,
    totalChargePence: itemPricePence + buyerProtectionFeePence + postagePence,
    isVerified: false,
  }
}
