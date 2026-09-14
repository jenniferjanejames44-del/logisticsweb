import { describe, expect, it } from "vitest";
import {
  calculateZoneQuote,
  selectZoneRate,
  type ZonePricingRate,
} from "@/lib/pricingCore";

const ZONES: Record<number, number[]> = {
  // [0-2, 3, 4, 5, 6, 7, 8, 9, 10, above10]
  1: [85, 90, 95, 110, 125, 140, 155, 165, 180, 18],
  2: [85, 100, 115, 135, 145, 165, 185, 220, 235, 24],
  3: [95, 145, 150, 170, 185, 215, 225, 245, 250, 25],
  4: [90, 110, 120, 125, 145, 165, 180, 190, 215, 22],
  5: [90, 115, 125, 130, 150, 170, 190, 205, 225, 23],
  6: [160, 195, 205, 215, 230, 255, 280, 295, 310, 31],
  7: [95, 125, 135, 150, 170, 190, 210, 230, 250, 25],
  8: [110, 150, 165, 175, 200, 225, 255, 280, 305, 31],
};

const zoneRate = (zn: number, over: Partial<ZonePricingRate> = {}): ZonePricingRate => {
  const p = ZONES[zn];
  return {
    id: `zone-${zn}-import-air`,
    zone_id: `zid-${zn}`,
    zone_number: zn,
    direction: "import",
    shipping_method: "air",
    service_type: null,
    currency: "USD",
    price_0_2: p[0],
    price_3: p[1],
    price_4: p[2],
    price_5: p[3],
    price_6: p[4],
    price_7: p[5],
    price_8: p[6],
    price_9: p[7],
    price_10: p[8],
    above_10_rate_per_kg: p[9],
    handling_fee: 0,
    customs_fee: 0,
    vat_percent: 0,
    insurance_percent: 0,
    volumetric_divisor: 5000,
    weight_rounding: "ceil",
    estimated_days_min: null,
    estimated_days_max: null,
    priority: 0,
    is_active: true,
    ...over,
  };
};

const total = (zn: number, weightKg: number, over: Partial<ZonePricingRate> = {}) =>
  calculateZoneQuote(zoneRate(zn, over), {
    direction: over.direction || "import",
    shippingMethod: "air",
    weightKg,
  }).total;

describe("zone tariff — exact tiers", () => {
  it("Zone 1: 2 kg = 85", () => expect(total(1, 2)).toBe(85));
  it("Zone 1: 1 kg uses the 0-2 price", () => expect(total(1, 1)).toBe(85));
  it("Zone 1: 3 kg = 90", () => expect(total(1, 3)).toBe(90));
  it("Zone 1: 5 kg = 110", () => expect(total(1, 5)).toBe(110));
  it("Zone 1: 10 kg = 180", () => expect(total(1, 10)).toBe(180));

  it("every zone matches the published 3-10 kg table", () => {
    for (const zn of Object.keys(ZONES).map(Number)) {
      const p = ZONES[zn];
      expect(total(zn, 2)).toBe(p[0]);
      for (let w = 3; w <= 10; w++) expect(total(zn, w)).toBe(p[w - 2]);
    }
  });
});

describe("zone tariff — above 10 kg is TOTAL WEIGHT x rate", () => {
  it("Zone 1: 11 kg = 198", () => expect(total(1, 11)).toBe(198));
  it("Zone 1: 12 kg = 216", () => expect(total(1, 12)).toBe(216));
  it("Zone 1: 20 kg = 360", () => expect(total(1, 20)).toBe(360));
  it("Zone 7: 11 kg = 275", () => expect(total(7, 11)).toBe(275));
  it("Zone 7: 20 kg = 500", () => expect(total(7, 20)).toBe(500));
  it("Zone 8: 12 kg = 372", () => expect(total(8, 12)).toBe(372));
  it("Zone 6: 15 kg = 465", () => expect(total(6, 15)).toBe(465));
  it("Zone 3: 15 kg = 375", () => expect(total(3, 15)).toBe(375));

  it("is never the 10 kg price plus extra kilos", () => {
    expect(total(8, 12)).not.toBe(305 + 2 * 31);
    expect(total(2, 11)).not.toBe(235 + 24);
  });

});

describe("decimal weights", () => {
  it("1.5 kg falls in the 0-2 band", () => expect(total(7, 1.5)).toBe(95));
  it("2.5 kg rounds up to the 3 kg tier by default", () => expect(total(7, 2.5)).toBe(125));
  it("10.4 kg rounds up to 11 and uses the above-10 rate", () =>
    expect(total(7, 10.4)).toBe(275));
  it("nearest rounding sends 2.4 kg to the 0-2 band", () =>
    expect(total(7, 2.4, { weight_rounding: "nearest" })).toBe(95));
});

describe("multiple boxes", () => {
  it("4 + 3 + 5 kg = 12 kg -> Zone 7 = 300", () => {
    const q = calculateZoneQuote(zoneRate(7), {
      direction: "import",
      shippingMethod: "air",
      boxes: [
        { actual_weight_kg: 4 },
        { actual_weight_kg: 3 },
        { actual_weight_kg: 5 },
      ],
    });
    expect(q.chargeable_weight_kg).toBe(12);
    expect(q.total).toBe(300);
  });

  it("item quantity never multiplies a box's total weight", () => {
    const q = calculateZoneQuote(zoneRate(7), {
      direction: "import",
      shippingMethod: "air",
      boxes: [{ actual_weight_kg: 10, items: [{ quantity: 10, unit_weight_kg: 1 }] }],
    });
    expect(q.chargeable_weight_kg).toBe(10);
    expect(q.total).toBe(250);
  });
});

describe("currency and breakdown", () => {
  it("stays USD", () => {
    const q = calculateZoneQuote(zoneRate(3), { direction: "import", shippingMethod: "air", weightKg: 3 });
    expect(q.currency).toBe("USD");
    expect(q.total).toBe(145);
    expect(q.pricing_model).toBe("zone_table");
  });

  it("adds configured fees on top of the tariff", () => {
    const q = calculateZoneQuote(
      zoneRate(3, { handling_fee: 10, customs_fee: 5, vat_percent: 7.5 }),
      { direction: "import", shippingMethod: "air", weightKg: 3 },
    );
    expect(q.subtotal).toBe(160);
    expect(q.vat).toBe(12);
    expect(q.total).toBe(172);
  });
});

describe("rate selection — import and export never mix", () => {
  const imp = zoneRate(3);
  const exp = zoneRate(3, { id: "zone-3-export-air", direction: "export", price_3: 200 });
  const rates = [imp, exp];

  it("picks the import rate for imports", () =>
    expect(selectZoneRate(rates, { direction: "import", shippingMethod: "air" }, "zid-3")?.id).toBe(imp.id));
  it("picks the export rate for exports", () =>
    expect(selectZoneRate(rates, { direction: "export", shippingMethod: "air" }, "zid-3")?.id).toBe(exp.id));
  it("returns nothing for a zone with no rate", () =>
    expect(selectZoneRate(rates, { direction: "import", shippingMethod: "air" }, "zid-9")).toBeNull());
  it("returns nothing for an unconfigured method", () =>
    expect(selectZoneRate(rates, { direction: "import", shippingMethod: "ocean" }, "zid-3")).toBeNull());
  it("a service-specific rate beats the generic one", () => {
    const express = zoneRate(3, { id: "zone-3-express", service_type: "express", price_3: 999 });
    const picked = selectZoneRate([imp, express], { direction: "import", shippingMethod: "air", serviceType: "express" }, "zid-3");
    expect(picked?.id).toBe(express.id);
  });
  it("an inactive rate is never used", () =>
    expect(selectZoneRate([zoneRate(3, { is_active: false })], { direction: "import", shippingMethod: "air" }, "zid-3")).toBeNull());
});
