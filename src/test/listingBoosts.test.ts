import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  effectiveBoostType,
  boostWeight,
  isCarouselEligible,
  boostDaysRemaining,
  BOOST_PRICES_PENCE,
} from "@/lib/listingBoosts";

const FUTURE = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
const PAST = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

// ── effectiveBoostType ────────────────────────────────────────────────────────

describe("effectiveBoostType", () => {
  it("returns null when boostType is null", () => {
    expect(effectiveBoostType(null, FUTURE)).toBeNull();
  });

  it("returns null when expiresAt is null", () => {
    expect(effectiveBoostType("featured", null)).toBeNull();
  });

  it("returns null when expiry is in the past", () => {
    expect(effectiveBoostType("featured", PAST)).toBeNull();
  });

  it("returns the boost type when active and not expired", () => {
    expect(effectiveBoostType("featured", FUTURE)).toBe("featured");
    expect(effectiveBoostType("spotlight", FUTURE)).toBe("spotlight");
  });

  it("returns null when both inputs are undefined", () => {
    expect(effectiveBoostType(undefined, undefined)).toBeNull();
  });
});

// ── boostWeight ───────────────────────────────────────────────────────────────

describe("boostWeight", () => {
  it("spotlight has higher weight than featured", () => {
    expect(boostWeight("spotlight")).toBeGreaterThan(boostWeight("featured"));
  });

  it("featured has higher weight than null", () => {
    expect(boostWeight("featured")).toBeGreaterThan(boostWeight(null));
  });

  it("null returns 0", () => {
    expect(boostWeight(null)).toBe(0);
  });

  it("spotlight returns 2", () => {
    expect(boostWeight("spotlight")).toBe(2);
  });

  it("featured returns 1", () => {
    expect(boostWeight("featured")).toBe(1);
  });
});

// ── isCarouselEligible ────────────────────────────────────────────────────────

describe("isCarouselEligible", () => {
  it("returns true for active spotlight", () => {
    expect(isCarouselEligible("spotlight", FUTURE)).toBe(true);
  });

  it("returns false for expired spotlight", () => {
    expect(isCarouselEligible("spotlight", PAST)).toBe(false);
  });

  it("returns false for active featured (not spotlight)", () => {
    expect(isCarouselEligible("featured", FUTURE)).toBe(false);
  });

  it("returns false for null boost type", () => {
    expect(isCarouselEligible(null, FUTURE)).toBe(false);
  });

  it("returns false when expiresAt is null", () => {
    expect(isCarouselEligible("spotlight", null)).toBe(false);
  });
});

// ── boostDaysRemaining ────────────────────────────────────────────────────────

describe("boostDaysRemaining", () => {
  it("returns 0 for null expiresAt", () => {
    expect(boostDaysRemaining(null)).toBe(0);
  });

  it("returns 0 for past expiry", () => {
    expect(boostDaysRemaining(PAST)).toBe(0);
  });

  it("returns roughly 3 for expiry 3 days out", () => {
    const threeDay = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(boostDaysRemaining(threeDay)).toBe(3);
  });

  it("returns 7 for expiry 7 days out", () => {
    const sevenDay = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(boostDaysRemaining(sevenDay)).toBe(7);
  });
});

// ── Sort weighting invariants ─────────────────────────────────────────────────

describe("sort weighting with mixed boosts", () => {
  it("spotlight sorts before featured sorts before unboosted", () => {
    const items = [
      { type: null, expires: null },
      { type: "spotlight" as const, expires: FUTURE },
      { type: "featured" as const, expires: FUTURE },
    ];
    const sorted = [...items].sort(
      (a, b) =>
        boostWeight(effectiveBoostType(b.type, b.expires)) -
        boostWeight(effectiveBoostType(a.type, a.expires)),
    );
    expect(sorted[0].type).toBe("spotlight");
    expect(sorted[1].type).toBe("featured");
    expect(sorted[2].type).toBeNull();
  });

  it("expired spotlight treated same as unboosted in sort", () => {
    const items = [
      { type: "spotlight" as const, expires: PAST },
      { type: "featured" as const, expires: FUTURE },
    ];
    const sorted = [...items].sort(
      (a, b) =>
        boostWeight(effectiveBoostType(b.type, b.expires)) -
        boostWeight(effectiveBoostType(a.type, a.expires)),
    );
    expect(sorted[0].type).toBe("featured");
  });
});

// ── Prices ────────────────────────────────────────────────────────────────────

describe("boost prices", () => {
  it("featured is 299 pence", () => {
    expect(BOOST_PRICES_PENCE.featured).toBe(299);
  });

  it("spotlight is 599 pence", () => {
    expect(BOOST_PRICES_PENCE.spotlight).toBe(599);
  });

  it("spotlight costs more than featured", () => {
    expect(BOOST_PRICES_PENCE.spotlight).toBeGreaterThan(BOOST_PRICES_PENCE.featured);
  });
});
