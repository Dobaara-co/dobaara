import { describe, it, expect } from "vitest";
import { assessFit } from "@/lib/fitMatch";
import type { Listing } from "@/data/seedData";
import type { MyMeasurements } from "@/hooks/useMyMeasurements";

function listing(overrides: Partial<Listing>): Listing {
  return {
    id: "t",
    sellerId: "s",
    title: "T",
    description: "",
    category: "lehenga",
    occasion: "",
    condition: "excellent",
    colour: "",
    designerBrand: "",
    sizeLabel: "",
    price: 1000,
    postagePrice: 0,
    freePostage: true,
    images: [],
    primaryImageIndex: 0,
    isVipVerified: false,
    isActive: true,
    isSold: false,
    viewsCount: 0,
    savesCount: 0,
    location: "",
    shipsFrom: "",
    shipsTo: [],
    tags: [],
    createdAt: "",
    ...overrides,
  };
}

const buyer: MyMeasurements = { bustCm: 86, waistCm: 70, hipsCm: 92, heightCm: 163 };

// ── NO_DATA ──────────────────────────────────────────────────────────────────

describe("NO_DATA", () => {
  it("returns NO_DATA when buyer has no measurements", () => {
    const result = assessFit(listing({ blouseBustCm: 88 }), {});
    expect(result.overall).toBe("NO_DATA");
    expect(result.components).toHaveLength(0);
  });

  it("returns NO_DATA when listing has no relevant measurements", () => {
    const result = assessFit(listing({ category: "lehenga" }), buyer);
    expect(result.overall).toBe("NO_DATA");
  });
});

// ── UNSTITCHED ────────────────────────────────────────────────────────────────

describe("unstitched", () => {
  it("returns FITS with unstitchedNote regardless of measurements", () => {
    const result = assessFit(
      listing({ blouseBustCm: 70, stitchingStatus: "unstitched" }),
      { ...buyer, bustCm: 99 },
    );
    expect(result.overall).toBe("FITS");
    expect(result.unstitchedNote).toBe(true);
    expect(result.components).toHaveLength(0);
  });
});

// ── LEHENGA ───────────────────────────────────────────────────────────────────

describe("lehenga", () => {
  it("FITS when all measurements within range", () => {
    const result = assessFit(
      listing({ blouseBustCm: 88, blouseWaistCm: 72, skirtWaistCm: 72 }),
      buyer,
    );
    expect(result.overall).toBe("FITS");
    expect(result.components.every((c) => c.state === "FITS")).toBe(true);
  });

  it("FITS_WITH_ALTERATION when buyer > garment but within margin", () => {
    const result = assessFit(
      listing({ blouseBustCm: 84, blouseMarginCm: 4 }),
      { ...buyer, bustCm: 87 },
    );
    expect(result.overall).toBe("FITS_WITH_ALTERATION");
    const bust = result.components.find((c) => c.component === "Blouse bust")!;
    expect(bust.state).toBe("FITS_WITH_ALTERATION");
  });

  it("UNLIKELY when buyer exceeds garment and no margin", () => {
    const result = assessFit(
      listing({ blouseBustCm: 82 }),
      { ...buyer, bustCm: 90 },
    );
    expect(result.overall).toBe("UNLIKELY");
  });

  it("UNLIKELY when buyer exceeds garment + margin", () => {
    const result = assessFit(
      listing({ blouseBustCm: 82, blouseMarginCm: 3 }),
      { ...buyer, bustCm: 90 },
    );
    expect(result.overall).toBe("UNLIKELY");
  });

  it("FITS_WITH_ALTERATION when buyer is >7.5cm smaller than garment (too loose)", () => {
    const result = assessFit(
      listing({ blouseBustCm: 96, blouseMarginCm: 4 }),
      { ...buyer, bustCm: 86 },
    );
    const bust = result.components.find((c) => c.component === "Blouse bust")!;
    expect(bust.state).toBe("FITS_WITH_ALTERATION");
  });

  it("FITS when buyer is exactly 7.5cm smaller (not too loose)", () => {
    const result = assessFit(
      listing({ blouseBustCm: 93.5 }),
      { ...buyer, bustCm: 86 },
    );
    const bust = result.components.find((c) => c.component === "Blouse bust")!;
    expect(bust.state).toBe("FITS");
  });

  it("overall is worst across components", () => {
    const result = assessFit(
      listing({
        blouseBustCm: 88,
        skirtWaistCm: 68,
      }),
      buyer,
    );
    const skirt = result.components.find((c) => c.component === "Skirt waist")!;
    expect(skirt.state).toBe("UNLIKELY");
    expect(result.overall).toBe("UNLIKELY");
  });

  it("uses skirtMarginCm for skirt waist, blouseMarginCm for blouse", () => {
    const result = assessFit(
      listing({ blouseBustCm: 82, blouseMarginCm: 2, skirtWaistCm: 66, skirtMarginCm: 6 }),
      { bustCm: 84, waistCm: 70 },
    );
    const bust = result.components.find((c) => c.component === "Blouse bust")!;
    expect(bust.state).toBe("FITS_WITH_ALTERATION");
    const skirt = result.components.find((c) => c.component === "Skirt waist")!;
    expect(skirt.state).toBe("FITS_WITH_ALTERATION");
  });

  it("falls back to general marginCm when component margin absent", () => {
    const result = assessFit(
      listing({ blouseBustCm: 84, marginCm: 5 }),
      { ...buyer, bustCm: 88 },
    );
    const bust = result.components.find((c) => c.component === "Blouse bust")!;
    expect(bust.state).toBe("FITS_WITH_ALTERATION");
  });
});

// ── ELASTIC / DRAWSTRING WAIST ────────────────────────────────────────────────

describe("elastic / drawstring waist", () => {
  it("elastic adds 10cm to skirt waist before comparing", () => {
    // skirtWaistCm=60, elastic → effective=70; buyer.waist=68 → FITS
    const result = assessFit(
      listing({ skirtWaistCm: 60, waistType: "elastic" }),
      { waistCm: 68 },
    );
    const skirt = result.components.find((c) => c.component === "Skirt waist")!;
    expect(skirt.state).toBe("FITS");
  });

  it("drawstring adds 10cm to skirt waist before comparing", () => {
    const result = assessFit(
      listing({ skirtWaistCm: 60, waistType: "drawstring" }),
      { waistCm: 68 },
    );
    const skirt = result.components.find((c) => c.component === "Skirt waist")!;
    expect(skirt.state).toBe("FITS");
  });

  it("without elastic, the same buyer waist is UNLIKELY (no margin)", () => {
    const result = assessFit(
      listing({ skirtWaistCm: 60, waistType: "fixed" }),
      { waistCm: 68 },
    );
    const skirt = result.components.find((c) => c.component === "Skirt waist")!;
    expect(skirt.state).toBe("UNLIKELY");
  });
});

// ── HEIGHT MISMATCH ───────────────────────────────────────────────────────────

describe("height mismatch", () => {
  it("lehenga: flags skirt length when buyer is shorter than heightMinCm", () => {
    const result = assessFit(
      listing({ skirtLengthCm: 110, heightMinCm: 165, heightMaxCm: 175 }),
      { ...buyer, heightCm: 158 },
    );
    const len = result.components.find((c) => c.component === "Skirt length")!;
    expect(len.state).toBe("FITS_WITH_ALTERATION");
  });

  it("lehenga: no height flag when buyer is within range", () => {
    const result = assessFit(
      listing({ skirtLengthCm: 110, heightMinCm: 158, heightMaxCm: 175 }),
      { ...buyer, heightCm: 163 },
    );
    expect(result.components.find((c) => c.component === "Skirt length")).toBeUndefined();
  });

  it("anarkali: flags anarkali length when buyer exceeds heightMaxCm", () => {
    const result = assessFit(
      listing({
        category: "anarkali",
        anarkaliiBustCm: 86,
        anarkaliFullLengthCm: 140,
        heightMaxCm: 160,
      }),
      { ...buyer, heightCm: 168 },
    );
    const len = result.components.find((c) => c.component === "Anarkali length")!;
    expect(len.state).toBe("FITS_WITH_ALTERATION");
  });

  it("saree: flags saree length on height mismatch", () => {
    const result = assessFit(
      listing({ category: "saree", sareeLengthCm: 550, heightMinCm: 160, heightMaxCm: 175 }),
      { ...buyer, heightCm: 155 },
    );
    const len = result.components.find((c) => c.component === "Saree length")!;
    expect(len.state).toBe("FITS_WITH_ALTERATION");
  });

  it("sherwani: flags sherwani length on height mismatch", () => {
    const result = assessFit(
      listing({
        category: "sherwani",
        sherwaniChestCm: 90,
        sherwaniFullLengthCm: 100,
        heightMaxCm: 180,
      }),
      { bustCm: 88, heightCm: 185 },
    );
    const len = result.components.find((c) => c.component === "Sherwani length")!;
    expect(len.state).toBe("FITS_WITH_ALTERATION");
  });
});

// ── SAREE ─────────────────────────────────────────────────────────────────────

describe("saree", () => {
  it("no blouse checks when blouseIncluded is false", () => {
    const result = assessFit(
      listing({ category: "saree", sareeLengthCm: 550, blouseIncluded: false }),
      buyer,
    );
    expect(result.components.find((c) => c.component.includes("louse"))).toBeUndefined();
  });

  it("includes blouse checks when blouseIncluded is true", () => {
    const result = assessFit(
      listing({
        category: "saree",
        sareeLengthCm: 550,
        blouseIncluded: true,
        blouseBustCm: 88,
        blouseWaistCm: 72,
        heightMinCm: 160,
        heightMaxCm: 170,
      }),
      buyer,
    );
    expect(result.components.find((c) => c.component === "Blouse bust")).toBeDefined();
    expect(result.components.find((c) => c.component === "Blouse waist")).toBeDefined();
  });

  it("FITS when blouse measurements match", () => {
    const result = assessFit(
      listing({
        category: "saree",
        blouseIncluded: true,
        blouseBustCm: 88,
        blouseWaistCm: 72,
      }),
      { bustCm: 86, waistCm: 70 },
    );
    expect(result.overall).toBe("FITS");
  });
});

// ── SALWAR KAMEEZ ─────────────────────────────────────────────────────────────

describe("salwar_kameez", () => {
  it("FITS when all kameez and salwar measurements match", () => {
    const result = assessFit(
      listing({
        category: "salwar_kameez",
        kameezBustCm: 90,
        kameezWaistCm: 74,
        kameezHipCm: 96,
        salwarWaistCm: 74,
      }),
      { bustCm: 86, waistCm: 70, hipsCm: 92 },
    );
    expect(result.overall).toBe("FITS");
  });

  it("FITS_WITH_ALTERATION when kameez bust within kameezMarginCm", () => {
    const result = assessFit(
      listing({
        category: "salwar_kameez",
        kameezBustCm: 84,
        kameezMarginCm: 4,
      }),
      { bustCm: 87 },
    );
    expect(result.overall).toBe("FITS_WITH_ALTERATION");
  });

  it("elastic salwar waist adds 10cm", () => {
    const result = assessFit(
      listing({
        category: "salwar_kameez",
        salwarWaistCm: 60,
        waistType: "elastic",
      }),
      { waistCm: 68 },
    );
    const salwar = result.components.find((c) => c.component === "Salwar waist")!;
    expect(salwar.state).toBe("FITS");
  });
});

// ── ANARKALI ──────────────────────────────────────────────────────────────────

describe("anarkali", () => {
  it("FITS when bust and waist within range", () => {
    const result = assessFit(
      listing({
        category: "anarkali",
        anarkaliiBustCm: 90,
        anarkaliWaistCm: 74,
      }),
      { bustCm: 86, waistCm: 70 },
    );
    expect(result.overall).toBe("FITS");
  });

  it("UNLIKELY when bust exceeds anarkali measurement with no margin", () => {
    const result = assessFit(
      listing({ category: "anarkali", anarkaliiBustCm: 84 }),
      { bustCm: 90 },
    );
    expect(result.overall).toBe("UNLIKELY");
  });

  it("FITS_WITH_ALTERATION within anarkaliMarginCm", () => {
    const result = assessFit(
      listing({ category: "anarkali", anarkaliiBustCm: 84, anarkaliMarginCm: 8 }),
      { bustCm: 90 },
    );
    expect(result.overall).toBe("FITS_WITH_ALTERATION");
  });
});

// ── SHERWANI ──────────────────────────────────────────────────────────────────

describe("sherwani", () => {
  it("FITS when chest and trouser waist within range", () => {
    const result = assessFit(
      listing({
        category: "sherwani",
        sherwaniChestCm: 92,
        trouserWaistCm: 80,
      }),
      { bustCm: 88, waistCm: 78 },
    );
    expect(result.overall).toBe("FITS");
  });

  it("UNLIKELY when chest exceeds sherwani chest with no margin", () => {
    const result = assessFit(
      listing({ category: "sherwani", sherwaniChestCm: 84 }),
      { bustCm: 92 },
    );
    expect(result.overall).toBe("UNLIKELY");
  });

  it("FITS_WITH_ALTERATION within sherwaniMarginCm", () => {
    const result = assessFit(
      listing({ category: "sherwani", sherwaniChestCm: 84, sherwaniMarginCm: 10 }),
      { bustCm: 92 },
    );
    expect(result.overall).toBe("FITS_WITH_ALTERATION");
  });

  it("drawstring trouser waist adds 10cm", () => {
    const result = assessFit(
      listing({
        category: "sherwani",
        trouserWaistCm: 70,
        waistType: "drawstring",
      }),
      { waistCm: 78 },
    );
    const t = result.components.find((c) => c.component === "Trouser waist")!;
    expect(t.state).toBe("FITS");
  });
});
