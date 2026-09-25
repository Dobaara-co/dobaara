import { describe, it, expect } from "vitest";
import { calcFees } from "@/lib/checkoutFees";

// ── Fee calculation in isolation ──────────────────────────────────────────────

describe("calcFees — standard listing", () => {
  it("seller receives 100% of item price", () => {
    const f = calcFees(2000, 0, false);
    expect(f.sellerPayoutPence).toBe(2000);
  });

  it("buyer protection fee = 3.5% + 30p flat", () => {
    // 2000 * 0.035 = 70, + 30 = 100
    const f = calcFees(2000, 0, false);
    expect(f.buyerProtectionFeePence).toBe(100);
  });

  it("total charge = item + buyer protection + postage", () => {
    // 2000 + 100 + 395 = 2495
    const f = calcFees(2000, 395, false);
    expect(f.totalChargePence).toBe(2495);
  });

  it("platform fee equals buyer protection fee", () => {
    const f = calcFees(5000, 0, false);
    expect(f.platformFeePence).toBe(f.buyerProtectionFeePence);
  });

  it("isVerified is false", () => {
    expect(calcFees(1000, 0, false).isVerified).toBe(false);
  });

  it("£0.30 flat fee dominates at low prices — £3 item", () => {
    // 300 * 0.035 = 10.5 → rounds to 11, + 30 = 41
    const f = calcFees(300, 0, false);
    expect(f.buyerProtectionFeePence).toBe(41);
    // fee is 41/300 ≈ 13.7% — larger than 3.5%
    expect(f.buyerProtectionFeePence / f.itemPricePence).toBeGreaterThan(0.035);
  });

  it("very low price — £1 item", () => {
    // 100 * 0.035 = 3.5 → rounds to 4, + 30 = 34
    const f = calcFees(100, 0, false);
    expect(f.buyerProtectionFeePence).toBe(34);
    expect(f.sellerPayoutPence).toBe(100);
    expect(f.totalChargePence).toBe(134);
  });

  it("large price — £200 item", () => {
    // 20000 * 0.035 = 700, + 30 = 730
    const f = calcFees(20000, 0, false);
    expect(f.buyerProtectionFeePence).toBe(730);
    expect(f.sellerPayoutPence).toBe(20000);
  });

  it("free postage — postagePence stays 0, not in total", () => {
    const f = calcFees(5000, 0, false);
    expect(f.postagePence).toBe(0);
    expect(f.totalChargePence).toBe(f.itemPricePence + f.buyerProtectionFeePence);
  });

  it("paid postage included in total but not in seller payout", () => {
    const f = calcFees(5000, 500, false);
    expect(f.sellerPayoutPence).toBe(5000);
    expect(f.totalChargePence).toBe(5000 + f.buyerProtectionFeePence + 500);
  });
});

// ── Verified listing (unchanged commission model) ─────────────────────────────

describe("calcFees — Verified listing", () => {
  it("platform takes 25% of item price", () => {
    // 5000 * 0.25 = 1250
    const f = calcFees(5000, 0, true);
    expect(f.platformFeePence).toBe(1250);
  });

  it("seller payout = item price minus 25% commission", () => {
    const f = calcFees(5000, 0, true);
    expect(f.sellerPayoutPence).toBe(3750);
  });

  it("buyer protection fee is 0 for Verified", () => {
    const f = calcFees(5000, 0, true);
    expect(f.buyerProtectionFeePence).toBe(0);
  });

  it("total charge = item + postage only (no buyer protection line)", () => {
    const f = calcFees(5000, 400, true);
    expect(f.totalChargePence).toBe(5400);
  });

  it("isVerified is true", () => {
    expect(calcFees(1000, 0, true).isVerified).toBe(true);
  });

  it("25% commission on large Verified sale", () => {
    // £300 item = 30000p → commission = 7500, payout = 22500
    const f = calcFees(30000, 0, true);
    expect(f.platformFeePence).toBe(7500);
    expect(f.sellerPayoutPence).toBe(22500);
  });
});

// ── Standard vs Verified comparison ──────────────────────────────────────────

describe("standard vs Verified comparison", () => {
  it("standard seller gets more than Verified seller at same price", () => {
    const std = calcFees(10000, 0, false);
    const vip = calcFees(10000, 0, true);
    expect(std.sellerPayoutPence).toBeGreaterThan(vip.sellerPayoutPence);
  });

  it("Verified total charge is lower than standard total charge", () => {
    const std = calcFees(10000, 0, false);
    const vip = calcFees(10000, 0, true);
    // Standard: item + buyerProtection. Verified: item only.
    expect(vip.totalChargePence).toBeLessThan(std.totalChargePence);
  });
});
