import { describe, expect, it } from "vitest";
import {
  calculateQuote,
  quoteFromRules,
  selectRule,
  PricingUnavailableError,
  type PricingRuleRow,
} from "@/lib/pricingCore";

const base: PricingRuleRow = {
  id: "rule-import-usa-standard",
  shipment_type: "import",
  name: "Import USA Standard",
  origin_country: "United States",
  warehouse_country: "United States",
  destination_country: "Nigeria",
  shipping_method: "air",
  service_type: "standard",
  pricing_model: "tiered",
  min_weight_kg: null,
  max_weight_kg: null,
  flat_price: 40,
  flat_weight_threshold_kg: 3,
  price_per_kg: 9,
  minimum_charge: 0,
  handling_fee: 0,
  customs_fee: 0,
  vat_percent: 0,
  insurance_percent: 0,
  volumetric_divisor: 5000,
  currency: "USD",
  estimated_days_min: null,
  estimated_days_max: null,
  is_active: true,
  priority: 0,
};

const rule = (over: Partial<PricingRuleRow>): PricingRuleRow => ({ ...base, ...over });

const quote = (r: PricingRuleRow, weightKg: number, extra: Record<string, unknown> = {}) =>
  calculateQuote(r, {
    direction: r.shipment_type,
    warehouseCountry: r.warehouse_country,
    destinationCountry: r.destination_country,
    shippingMethod: r.shipping_method,
    serviceType: r.service_type,
    weightKg,
    ...extra,
  });

describe("tiered base + additional kg", () => {
  it.each([
    [1, 40],
    [2, 40],
    [3, 40],
    [4, 49],
    [5, 58],
    [6, 67],
  ])("%s kg costs $%s", (w, expected) => {
    expect(quote(base, w as number).total).toBe(expected);
  });

  it("reflects an admin price change without code changes", () => {
    expect(quote(rule({ flat_price: 50 }), 3).total).toBe(50);
  });
});

describe("pricing models", () => {
  it("per_kg charges every kilo", () => {
    expect(quote(rule({ pricing_model: "per_kg", price_per_kg: 12 }), 3).total).toBe(36);
  });
  it("flat ignores weight", () => {
    expect(quote(rule({ pricing_model: "flat", flat_price: 99 }), 25).total).toBe(99);
  });
  it("minimum charge lifts a small shipment", () => {
    expect(quote(rule({ pricing_model: "per_kg", price_per_kg: 5, minimum_charge: 30 }), 2).total).toBe(30);
  });
});

describe("fees and currency", () => {
  it("applies fixed fees then percentages", () => {
    const r = rule({ handling_fee: 10, customs_fee: 5, vat_percent: 7.5, insurance_percent: 2 });
    const q = quote(r, 3, { declaredValue: 1000 });
    // 40 + 10 + 5 = 55 subtotal; VAT 4.13; insurance 20
    expect(q.subtotal).toBe(55);
    expect(q.vat).toBe(4.13);
    expect(q.insurance).toBe(20);
    expect(q.total).toBe(79.13);
  });

  it("keeps the rule currency", () => {
    expect(quote(rule({ currency: "GBP" }), 3).currency).toBe("GBP");
  });
});

describe("rule matching", () => {
  const importStandard = base;
  const importExpress = rule({ id: "imp-exp", service_type: "express", flat_price: 75 });
  const exportStandard = rule({
    id: "exp-std",
    shipment_type: "export",
    origin_country: "Nigeria",
    warehouse_country: null,
    destination_country: "United States",
    flat_price: 60,
  });
  const canada = rule({ id: "imp-ca", origin_country: "Canada", warehouse_country: "Canada", flat_price: 55 });
  const all = [importStandard, importExpress, exportStandard, canada];

  const q = (input: Parameters<typeof quoteFromRules>[1]) => quoteFromRules(all, input);

  it("import + USA + standard", () => {
    expect(q({ direction: "import", warehouseCountry: "United States", shippingMethod: "air", serviceType: "standard", weightKg: 3 }).total).toBe(40);
  });
  it("import + USA + express", () => {
    expect(q({ direction: "import", warehouseCountry: "United States", shippingMethod: "air", serviceType: "express", weightKg: 3 }).total).toBe(75);
  });
  it("export + USA + standard never uses the import rule", () => {
    expect(q({ direction: "export", destinationCountry: "United States", shippingMethod: "air", serviceType: "standard", weightKg: 3 }).total).toBe(60);
  });
  it("Canada keeps its own rate", () => {
    expect(q({ direction: "import", warehouseCountry: "Canada", shippingMethod: "air", serviceType: "standard", weightKg: 3 }).total).toBe(55);
  });
  it("throws instead of inventing a price", () => {
    expect(() =>
      q({ direction: "import", warehouseCountry: "Ghana", shippingMethod: "air", serviceType: "standard", weightKg: 3 }),
    ).toThrow(PricingUnavailableError);
  });
  it("skips expired rules", () => {
    const expired = rule({ id: "old", effective_to: "2020-01-01" });
    expect(selectRule([expired], { direction: "import", warehouseCountry: "United States", shippingMethod: "air", serviceType: "standard" }, 3)).toBeNull();
  });
  it("prefers the matching weight band", () => {
    const heavy = rule({ id: "heavy", min_weight_kg: 10, max_weight_kg: 50, flat_price: 100, flat_weight_threshold_kg: 10 });
    expect(quoteFromRules([base, heavy], { direction: "import", warehouseCountry: "United States", shippingMethod: "air", serviceType: "standard", weightKg: 12 }).total).toBe(118);
  });
});
