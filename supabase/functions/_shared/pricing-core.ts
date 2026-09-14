// =====================================================================
// RAC LOGISTICS — AUTHORITATIVE PRICING CORE
// ---------------------------------------------------------------------
// This is the ONE place a shipping price is ever calculated.
// It is pure (no I/O, no Deno/browser APIs) so it can be:
//   - executed by the `calculate-quote` edge function (authoritative)
//   - unit tested by vitest
// The frontend must NEVER reimplement any of this maths.
// All money arithmetic is done in integer minor units (cents) to avoid
// floating point drift; rounding happens once, at the end of each stage.
// =====================================================================

export type ShipmentDirection = "import" | "export";
export type PricingModel = "flat" | "tiered" | "per_kg" | "zone_table";

export interface PricingRuleRow {
  id: string;
  shipment_type: ShipmentDirection;
  name: string;
  origin_country: string;
  warehouse_country: string | null;
  destination_country: string;
  shipping_method: string;
  service_type: string | null;
  pricing_model: PricingModel | null;
  min_weight_kg: number | null;
  max_weight_kg: number | null;
  flat_price: number;
  flat_weight_threshold_kg: number;
  price_per_kg: number;
  minimum_charge: number | null;
  handling_fee: number;
  customs_fee: number;
  vat_percent: number;
  insurance_percent: number;
  volumetric_divisor: number | null;
  currency: string;
  estimated_days_min: number | null;
  estimated_days_max: number | null;
  is_active: boolean;
  priority: number;
  effective_from?: string | null;
  effective_to?: string | null;
}

export interface BoxInput {
  /** Physical dimensions of THIS box (never multiplied by item quantity). */
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  /** Total actual weight of this box, in kg. Already a total — never multiplied. */
  actual_weight_kg?: number | null;
  /** Packaging material cost for this box, in the rule currency. */
  packaging_price?: number | null;
  /** Optional items inside the box, used only for declared value + weight fallback. */
  items?: ItemInput[];
}

export interface ItemInput {
  quantity?: number | null;
  /** Weight of ONE unit, in kg. Total = quantity x unit_weight_kg. */
  unit_weight_kg?: number | null;
  /** Value of ONE unit. Total = quantity x unit_value. */
  unit_value?: number | null;
}

export interface QuoteInput {
  direction: ShipmentDirection;
  originCountry?: string | null;
  destinationCountry?: string | null;
  warehouseCountry?: string | null;
  shippingMethod: string;
  serviceType?: string | null;
  boxes?: BoxInput[];
  /** Simple mode: a single already-known chargeable weight (e.g. the public calculator). */
  weightKg?: number | null;
  /** Overrides the value derived from items. */
  declaredValue?: number | null;
  /** Flat discount in the rule currency. */
  discount?: number | null;
}

export interface QuoteLine {
  key: string;
  label: string;
  amount: number;
}

export interface QuoteBreakdown {
  currency: string;
  pricing_model: PricingModel;
  rule_id: string;
  rule_name: string;
  direction: ShipmentDirection;
  origin_country: string;
  destination_country: string;
  warehouse_country: string | null;
  shipping_method: string;
  service_type: string | null;

  actual_weight_kg: number;
  volumetric_weight_kg: number;
  chargeable_weight_kg: number;
  volumetric_divisor: number;

  included_weight_kg: number;
  base_price: number;
  additional_weight_kg: number;
  additional_rate_per_kg: number;
  additional_charge: number;
  minimum_charge_applied: boolean;

  shipping_cost: number;
  packaging_cost: number;
  handling_fee: number;
  customs_fee: number;
  subtotal: number;
  vat_percent: number;
  vat: number;
  insurance_percent: number;
  insurance: number;
  declared_value: number;
  discount: number;
  total: number;

  estimated_days_min: number | null;
  estimated_days_max: number | null;
  lines: QuoteLine[];
  calculated_at: string;
}

export class PricingUnavailableError extends Error {
  code = "PRICING_UNAVAILABLE";
  constructor(
    message = "Pricing is currently unavailable for this route/service. Please contact RAC Logistics.",
  ) {
    super(message);
    this.name = "PricingUnavailableError";
  }
}

// ---------------------------------------------------------------------
// Decimal-safe helpers (integer cents)
// ---------------------------------------------------------------------
const toCents = (v: unknown): number => Math.round((Number(v) || 0) * 100);
const fromCents = (c: number): number => Math.round(c) / 100;
const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
/** Weights keep 3 decimals internally, are reported with 2. */
const roundWeight = (kg: number): number => Math.round((kg + Number.EPSILON) * 1000) / 1000;
const displayWeight = (kg: number): number => Math.round((kg + Number.EPSILON) * 100) / 100;

export const DEFAULT_VOLUMETRIC_DIVISOR = 5000;

/** Normalises free-text shipping methods (air-express, Sea Freight, ...) to a canonical family. */
export function normaliseMethod(method?: string | null): string {
  if (!method) return "";
  const s = String(method).toLowerCase().trim();
  if (s.startsWith("air")) return "air";
  if (s.startsWith("ocean") || s.startsWith("sea")) return "ocean";
  if (s.startsWith("road") || s.startsWith("ground") || s.startsWith("land")) return "road";
  return s;
}

// ---------------------------------------------------------------------
// Weight
// ---------------------------------------------------------------------
export interface WeightResult {
  actual: number;
  volumetric: number;
  chargeable: number;
  declaredValue: number;
}

/**
 * Weight rules:
 *  - A box's `actual_weight_kg` is a TOTAL. It is never multiplied by item quantity.
 *  - If a box has no actual weight, we fall back to the sum of its items
 *    (quantity x unit weight), which is the only place quantity multiplies.
 *  - Volumetric weight comes from BOX dimensions only.
 *  - Chargeable weight = MAX(actual, volumetric), summed per box.
 */
export function computeWeights(boxes: BoxInput[], divisor: number): WeightResult {
  const safeDivisor = divisor > 0 ? divisor : DEFAULT_VOLUMETRIC_DIVISOR;
  let actual = 0;
  let volumetric = 0;
  let chargeable = 0;
  let declaredCents = 0;

  for (const box of boxes) {
    const itemsWeight = (box.items || []).reduce(
      (s, it) => s + num(it.quantity ?? 1) * num(it.unit_weight_kg),
      0,
    );
    const boxActual = num(box.actual_weight_kg) > 0 ? num(box.actual_weight_kg) : itemsWeight;

    const l = num(box.length_cm);
    const w = num(box.width_cm);
    const h = num(box.height_cm);
    const boxVolumetric = l > 0 && w > 0 && h > 0 ? (l * w * h) / safeDivisor : 0;

    actual += boxActual;
    volumetric += boxVolumetric;
    chargeable += Math.max(boxActual, boxVolumetric);

    for (const it of box.items || []) {
      declaredCents += Math.round(num(it.quantity ?? 1) * toCents(it.unit_value));
    }
  }

  return {
    actual: roundWeight(actual),
    volumetric: roundWeight(volumetric),
    chargeable: roundWeight(chargeable),
    declaredValue: fromCents(declaredCents),
  };
}

// ---------------------------------------------------------------------
// Rule matching — IMPORT and EXPORT never mix
// ---------------------------------------------------------------------
export function selectRule(rules: PricingRuleRow[], input: QuoteInput, chargeableWeight: number, today = new Date()): PricingRuleRow | null {
  const method = normaliseMethod(input.shippingMethod);
  if (!method || !input.direction) return null;
  const iso = today.toISOString().slice(0, 10);
  const eq = (a?: string | null, b?: string | null) =>
    (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();

  const candidates = rules.filter((r) => {
    if (!r.is_active) return false;
    if (r.shipment_type !== input.direction) return false;
    if (normaliseMethod(r.shipping_method) !== method) return false;
    if (r.effective_from && r.effective_from > iso) return false;
    if (r.effective_to && r.effective_to < iso) return false;

    if (input.direction === "export") {
      if (!eq(r.destination_country, input.destinationCountry)) return false;
    } else {
      const source = input.warehouseCountry || input.originCountry;
      const ruleSource = r.warehouse_country || r.origin_country;
      if (!eq(ruleSource, source)) return false;
    }

    if (input.serviceType && r.service_type && !eq(r.service_type, input.serviceType)) return false;

    const w = chargeableWeight;
    if (w > 0 && r.min_weight_kg != null && w < num(r.min_weight_kg)) return false;
    if (w > 0 && r.max_weight_kg != null && w > num(r.max_weight_kg)) return false;
    return true;
  });

  if (!candidates.length) return null;

  candidates.sort((a, b) => {
    // 1. higher priority wins
    const p = num(b.priority) - num(a.priority);
    if (p !== 0) return p;
    // 2. exact service-type match beats a generic rule
    const sa = eq(a.service_type, input.serviceType) ? 1 : 0;
    const sb = eq(b.service_type, input.serviceType) ? 1 : 0;
    if (sa !== sb) return sb - sa;
    // 3. a weight-banded rule is more specific than an open-ended one
    const ba = (a.min_weight_kg != null ? 1 : 0) + (a.max_weight_kg != null ? 1 : 0);
    const bb = (b.min_weight_kg != null ? 1 : 0) + (b.max_weight_kg != null ? 1 : 0);
    if (ba !== bb) return bb - ba;
    // 4. deterministic tie-break so the same rule is always picked
    return a.id < b.id ? -1 : 1;
  });

  return candidates[0];
}

// ---------------------------------------------------------------------
// The calculation pipeline
// ---------------------------------------------------------------------
export function calculateQuote(rule: PricingRuleRow, input: QuoteInput): QuoteBreakdown {
  if (!rule) throw new PricingUnavailableError();
  if (!rule.is_active) throw new PricingUnavailableError("This rate is not currently active.");
  if (!rule.currency) throw new PricingUnavailableError("This rate has no currency configured.");

  const divisor = num(rule.volumetric_divisor) > 0 ? num(rule.volumetric_divisor) : DEFAULT_VOLUMETRIC_DIVISOR;
  const boxes = input.boxes && input.boxes.length ? input.boxes : [];

  let weights: WeightResult;
  if (boxes.length) {
    weights = computeWeights(boxes, divisor);
  } else {
    const w = roundWeight(num(input.weightKg));
    weights = { actual: w, volumetric: 0, chargeable: w, declaredValue: 0 };
  }

  const chargeable = weights.chargeable;
  if (!(chargeable > 0)) throw new PricingUnavailableError("Weight must be greater than zero.");

  const model: PricingModel = (rule.pricing_model as PricingModel) || "tiered";
  const includedWeight = num(rule.flat_weight_threshold_kg);
  const perKgCents = toCents(rule.price_per_kg);
  const flatCents = toCents(rule.flat_price);

  // --- base + additional weight -------------------------------------
  let baseCents = 0;
  let additionalWeight = 0;
  let additionalCents = 0;

  if (model === "flat") {
    baseCents = flatCents;
  } else if (model === "per_kg") {
    baseCents = Math.round(chargeable * perKgCents);
  } else {
    // tiered: included weight is covered by the flat price, only the
    // EXTRA kilos are charged at the per-kg rate.
    baseCents = flatCents;
    if (chargeable > includedWeight) {
      additionalWeight = roundWeight(chargeable - includedWeight);
      additionalCents = Math.round(additionalWeight * perKgCents);
    }
  }

  let shippingCents = baseCents + additionalCents;

  // --- minimum charge ------------------------------------------------
  const minimumCents = toCents(rule.minimum_charge);
  const minimumApplied = minimumCents > 0 && shippingCents < minimumCents;
  if (minimumApplied) shippingCents = minimumCents;

  // --- fixed fees (each applied exactly once) -------------------------
  const packagingCents = boxes.reduce((s, b) => s + toCents(b.packaging_price), 0);
  const handlingCents = toCents(rule.handling_fee);
  const customsCents = toCents(rule.customs_fee);

  const subtotalCents = shippingCents + packagingCents + handlingCents + customsCents;

  // --- percentage fees ------------------------------------------------
  const declaredValue = input.declaredValue != null && Number.isFinite(Number(input.declaredValue))
    ? num(input.declaredValue)
    : weights.declaredValue;

  const vatPercent = num(rule.vat_percent);
  const insurancePercent = num(rule.insurance_percent);
  const vatCents = Math.round((subtotalCents * vatPercent) / 100);
  const insuranceCents = Math.round((toCents(declaredValue) * insurancePercent) / 100);

  // --- discount + total ------------------------------------------------
  const discountCents = Math.max(0, toCents(input.discount));
  const totalCents = Math.max(0, subtotalCents + vatCents + insuranceCents - discountCents);

  const lines: QuoteLine[] = [];
  const push = (key: string, label: string, cents: number) => {
    if (cents !== 0) lines.push({ key, label, amount: fromCents(cents) });
  };
  push("base", model === "per_kg" ? `Shipping (${displayWeight(chargeable)} kg)` : `Shipping (first ${displayWeight(includedWeight)} kg)`, baseCents);
  push("additional", `Additional weight (${displayWeight(additionalWeight)} kg @ ${fromCents(perKgCents)}/kg)`, additionalCents);
  if (minimumApplied) lines.push({ key: "minimum", label: "Minimum charge adjustment", amount: fromCents(minimumCents - (baseCents + additionalCents)) });
  push("packaging", "Packaging materials", packagingCents);
  push("handling", "Handling", handlingCents);
  push("customs", "Customs clearance", customsCents);
  push("vat", `VAT (${vatPercent}%)`, vatCents);
  push("insurance", `Insurance (${insurancePercent}%)`, insuranceCents);
  if (discountCents > 0) lines.push({ key: "discount", label: "Discount", amount: -fromCents(discountCents) });

  return {
    currency: rule.currency,
    pricing_model: model,
    rule_id: rule.id,
    rule_name: rule.name,
    direction: rule.shipment_type,
    origin_country: rule.origin_country,
    destination_country: rule.destination_country,
    warehouse_country: rule.warehouse_country,
    shipping_method: rule.shipping_method,
    service_type: rule.service_type,

    actual_weight_kg: displayWeight(weights.actual),
    volumetric_weight_kg: displayWeight(weights.volumetric),
    chargeable_weight_kg: displayWeight(chargeable),
    volumetric_divisor: divisor,

    included_weight_kg: includedWeight,
    base_price: fromCents(baseCents),
    additional_weight_kg: displayWeight(additionalWeight),
    additional_rate_per_kg: fromCents(perKgCents),
    additional_charge: fromCents(additionalCents),
    minimum_charge_applied: minimumApplied,

    shipping_cost: fromCents(shippingCents),
    packaging_cost: fromCents(packagingCents),
    handling_fee: fromCents(handlingCents),
    customs_fee: fromCents(customsCents),
    subtotal: fromCents(subtotalCents),
    vat_percent: vatPercent,
    vat: fromCents(vatCents),
    insurance_percent: insurancePercent,
    insurance: fromCents(insuranceCents),
    declared_value: declaredValue,
    discount: fromCents(discountCents),
    total: fromCents(totalCents),

    estimated_days_min: rule.estimated_days_min,
    estimated_days_max: rule.estimated_days_max,
    lines,
    calculated_at: new Date().toISOString(),
  };
}

/** Convenience: match then calculate. Throws PricingUnavailableError when no rule fits. */
export function quoteFromRules(rules: PricingRuleRow[], input: QuoteInput): QuoteBreakdown {
  const divisorGuess = DEFAULT_VOLUMETRIC_DIVISOR;
  const probe = input.boxes && input.boxes.length
    ? computeWeights(input.boxes, divisorGuess).chargeable
    : roundWeight(num(input.weightKg));
  const rule = selectRule(rules, input, probe);
  if (!rule) throw new PricingUnavailableError();
  return calculateQuote(rule, input);
}

/** Display-only money formatter. Never used to change an amount. */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${(Number(amount) || 0).toFixed(2)}`;
  }
}

// =====================================================================
// ZONE TARIFF PRICING (Zone 1 - 8)
// ---------------------------------------------------------------------
// A zone rate stores an EXACT price for 0-2 kg and for each whole
// kilogram from 3 to 10, plus an above-10 kg rate.
//
// MANDATORY RULE for weights above 10 kg:
//     total = TOTAL WEIGHT x above_10_rate_per_kg
// It is NOT the 10 kg price plus extra kilos.
// =====================================================================

export interface ZonePricingRate {
  id: string;
  zone_id: string;
  zone_number: number;
  direction: ShipmentDirection;
  shipping_method: string;
  service_type: string | null;
  currency: string;
  price_0_2: number;
  price_3: number;
  price_4: number;
  price_5: number;
  price_6: number;
  price_7: number;
  price_8: number;
  price_9: number;
  price_10: number;
  above_10_rate_per_kg: number;
  handling_fee: number;
  customs_fee: number;
  vat_percent: number;
  insurance_percent: number;
  volumetric_divisor: number | null;
  /** How a part-kilo weight maps onto the whole-kilo tiers. */
  weight_rounding: "ceil" | "nearest" | "none";
  estimated_days_min: number | null;
  estimated_days_max: number | null;
  priority: number;
  is_active: boolean;
}

/** Picks the zone rate for this zone + direction + method (+ service when configured). */
export function selectZoneRate(
  rates: ZonePricingRate[],
  input: { direction: ShipmentDirection; shippingMethod: string; serviceType?: string | null },
  zoneId: string,
): ZonePricingRate | null {
  const method = normaliseMethod(input.shippingMethod);
  const eq = (a?: string | null, b?: string | null) =>
    (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();

  const candidates = rates.filter((r) => {
    if (!r.is_active) return false;
    if (r.zone_id !== zoneId) return false;
    if (r.direction !== input.direction) return false;
    if (normaliseMethod(r.shipping_method) !== method) return false;
    // A rate with no service_type applies to every service.
    if (r.service_type && input.serviceType && !eq(r.service_type, input.serviceType)) return false;
    return true;
  });

  if (!candidates.length) return null;

  candidates.sort((a, b) => {
    const sa = a.service_type && eq(a.service_type, input.serviceType) ? 1 : 0;
    const sb = b.service_type && eq(b.service_type, input.serviceType) ? 1 : 0;
    if (sa !== sb) return sb - sa;
    const p = num(b.priority) - num(a.priority);
    if (p !== 0) return p;
    return a.id < b.id ? -1 : 1;
  });

  return candidates[0];
}

/** Maps a (possibly decimal) chargeable weight onto a whole-kilo tier. */
export function tierWeight(weightKg: number, rounding: ZonePricingRate["weight_rounding"]): number {
  if (weightKg <= 2) return weightKg;
  if (rounding === "none") return weightKg;
  if (rounding === "nearest") return Math.round(weightKg);
  return Math.ceil(weightKg);
}

/** The zone tariff itself, in integer cents. Exported for testing. */
export function zoneShippingCents(rate: ZonePricingRate, chargeableWeight: number): {
  cents: number;
  tier: number;
  band: string;
} {
  const rounding = rate.weight_rounding || "ceil";
  const tier = tierWeight(chargeableWeight, rounding);

  if (tier <= 2) return { cents: toCents(rate.price_0_2), tier, band: "0-2 kg" };

  if (tier <= 10) {
    const table: Record<number, unknown> = {
      3: rate.price_3,
      4: rate.price_4,
      5: rate.price_5,
      6: rate.price_6,
      7: rate.price_7,
      8: rate.price_8,
      9: rate.price_9,
      10: rate.price_10,
    };
    const key = Math.max(3, Math.min(10, Math.ceil(tier)));
    return { cents: toCents(table[key]), tier, band: `${key} kg` };
  }

  // ABOVE 10 KG: the rate applies to the ENTIRE weight.
  const perKg = toCents(rate.above_10_rate_per_kg);
  return {
    cents: Math.round(tier * perKg),
    tier,
    band: `above 10 kg (${displayWeight(tier)} kg x ${fromCents(perKg)}/kg)`,
  };
}

/** Full quote from a zone tariff, in the same shape every consumer already uses. */
export function calculateZoneQuote(
  rate: ZonePricingRate,
  input: QuoteInput,
  zoneName?: string | null,
): QuoteBreakdown {
  if (!rate) throw new PricingUnavailableError();
  if (!rate.is_active) throw new PricingUnavailableError("This zone rate is not currently active.");
  if (!rate.currency) throw new PricingUnavailableError("This zone rate has no currency configured.");

  const divisor = num(rate.volumetric_divisor) > 0 ? num(rate.volumetric_divisor) : DEFAULT_VOLUMETRIC_DIVISOR;
  const boxes = input.boxes && input.boxes.length ? input.boxes : [];

  const weights: WeightResult = boxes.length
    ? computeWeights(boxes, divisor)
    : (() => {
        const w = Math.round((num(input.weightKg) + Number.EPSILON) * 1000) / 1000;
        return { actual: w, volumetric: 0, chargeable: w, declaredValue: 0 };
      })();

  const chargeable = weights.chargeable;
  if (!(chargeable > 0)) throw new PricingUnavailableError("Weight must be greater than zero.");

  const { cents: shippingCents, tier, band } = zoneShippingCents(rate, chargeable);
  if (!(shippingCents > 0)) {
    throw new PricingUnavailableError(
      "Pricing is currently unavailable for this route and service. Please contact us for a quotation.",
    );
  }

  const packagingCents = boxes.reduce((s, b) => s + toCents(b.packaging_price), 0);
  const handlingCents = toCents(rate.handling_fee);
  const customsCents = toCents(rate.customs_fee);
  const subtotalCents = shippingCents + packagingCents + handlingCents + customsCents;

  const declaredValue = input.declaredValue != null && Number.isFinite(Number(input.declaredValue))
    ? num(input.declaredValue)
    : weights.declaredValue;

  const vatPercent = num(rate.vat_percent);
  const insurancePercent = num(rate.insurance_percent);
  const vatCents = Math.round((subtotalCents * vatPercent) / 100);
  const insuranceCents = Math.round((toCents(declaredValue) * insurancePercent) / 100);
  const discountCents = Math.max(0, toCents(input.discount));
  const totalCents = Math.max(0, subtotalCents + vatCents + insuranceCents - discountCents);

  const lines: QuoteLine[] = [];
  const push = (key: string, label: string, cents: number) => {
    if (cents !== 0) lines.push({ key, label, amount: fromCents(cents) });
  };
  push("base", `Shipping — Zone ${rate.zone_number}, ${band}`, shippingCents);
  push("packaging", "Packaging materials", packagingCents);
  push("handling", "Handling", handlingCents);
  push("customs", "Customs clearance", customsCents);
  push("vat", `VAT (${vatPercent}%)`, vatCents);
  push("insurance", `Insurance (${insurancePercent}%)`, insuranceCents);
  if (discountCents > 0) lines.push({ key: "discount", label: "Discount", amount: -fromCents(discountCents) });

  const aboveTen = tier > 10;

  return {
    currency: rate.currency,
    pricing_model: "zone_table" as unknown as PricingModel,
    rule_id: rate.id,
    rule_name: `Zone ${rate.zone_number}${zoneName ? ` — ${zoneName}` : ""} (${rate.direction})`,
    direction: rate.direction,
    origin_country: input.originCountry || "",
    destination_country: input.destinationCountry || "",
    warehouse_country: input.warehouseCountry ?? null,
    shipping_method: rate.shipping_method,
    service_type: rate.service_type,

    actual_weight_kg: displayWeight(weights.actual),
    volumetric_weight_kg: displayWeight(weights.volumetric),
    chargeable_weight_kg: displayWeight(chargeable),
    volumetric_divisor: divisor,

    included_weight_kg: aboveTen ? 0 : tier,
    base_price: fromCents(shippingCents),
    additional_weight_kg: 0,
    additional_rate_per_kg: aboveTen ? num(rate.above_10_rate_per_kg) : 0,
    additional_charge: 0,
    minimum_charge_applied: false,

    shipping_cost: fromCents(shippingCents),
    packaging_cost: fromCents(packagingCents),
    handling_fee: fromCents(handlingCents),
    customs_fee: fromCents(customsCents),
    subtotal: fromCents(subtotalCents),
    vat_percent: vatPercent,
    vat: fromCents(vatCents),
    insurance_percent: insurancePercent,
    insurance: fromCents(insuranceCents),
    declared_value: declaredValue,
    discount: fromCents(discountCents),
    total: fromCents(totalCents),

    estimated_days_min: rate.estimated_days_min,
    estimated_days_max: rate.estimated_days_max,
    lines,
    calculated_at: new Date().toISOString(),
  };
}
