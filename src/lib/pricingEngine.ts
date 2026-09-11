import { supabase } from "@/integrations/supabase/client";
import { calculateQuote, computeWeights, type PricingRuleRow } from "@/lib/pricingCore";

export interface CountryPricingRule {
  id: string;
  country: string;
  currency: string;
  flat_price: number;
  flat_weight_threshold_kg: number;
  price_per_kg: number;
  handling_fee: number;
  vat_percent: number;
  insurance_percent: number;
  is_active: boolean;
  /** Optional advanced fields carried over from the admin pricing engine. */
  pricing_model?: string | null;
  minimum_charge?: number | null;
  customs_fee?: number | null;
  volumetric_divisor?: number | null;
}

export interface PriceBreakdown {
  country: string;
  currency: string;
  weight: number;
  declaredValue: number;
  basePrice: number;
  handlingFee: number;
  subtotal: number;
  vatPercent: number;
  vat: number;
  insurancePercent: number;
  insurance: number;
  total: number;
  // Backward-compat fields used by older form code
  shippingCost: number;
  extraCharges: { name: string; price: number }[];
  extraChargesTotal: number;
  processingFee: number;
  taxes: { name: string; rate: number; amount: number }[];
  taxTotal: number;
  zone: string | null;
}

export class PricingError extends Error {
  code: "MISSING_WEIGHT" | "MISSING_VALUE" | "COUNTRY_NOT_SUPPORTED";
  constructor(code: PricingError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export async function fetchCountryPricingRule(country: string): Promise<CountryPricingRule | null> {
  const { data } = await (supabase as any)
    .from("country_pricing_rules")
    .select("*")
    .eq("country", country)
    .eq("is_active", true)
    .maybeSingle();
  return data ?? null;
}

export function computeBreakdown(
  rule: CountryPricingRule,
  weightKg: number,
  declaredValue: number,
): PriceBreakdown {
  const basePrice =
    weightKg <= Number(rule.flat_weight_threshold_kg)
      ? Number(rule.flat_price)
      : weightKg * Number(rule.price_per_kg);

  const handlingFee = Number(rule.handling_fee);
  const subtotal = basePrice + handlingFee;
  const vat = (subtotal * Number(rule.vat_percent)) / 100;
  const insurance = (Number(declaredValue || 0) * Number(rule.insurance_percent)) / 100;
  const total = subtotal + vat + insurance;

  return {
    country: rule.country,
    currency: rule.currency,
    weight: weightKg,
    declaredValue: Number(declaredValue || 0),
    basePrice: round2(basePrice),
    handlingFee: round2(handlingFee),
    subtotal: round2(subtotal),
    vatPercent: Number(rule.vat_percent),
    vat: round2(vat),
    insurancePercent: Number(rule.insurance_percent),
    insurance: round2(insurance),
    total: round2(total),
    // Compat fields
    shippingCost: round2(basePrice),
    extraCharges: [],
    extraChargesTotal: 0,
    processingFee: round2(handlingFee),
    taxes: [{ name: "VAT", rate: Number(rule.vat_percent), amount: round2(vat) }],
    taxTotal: round2(vat),
    zone: rule.country,
  };
}

/**
 * Backward-compatible signature kept so existing callers
 * (AfricaniesShipmentForm) keep working.
 */
export async function calculateShippingCost(
  destinationCountry: string,
  weightKg: number,
  _selectedExtras: string[] = [],
  declaredValue: number = 0,
): Promise<PriceBreakdown> {
  if (!destinationCountry) {
    throw new PricingError("COUNTRY_NOT_SUPPORTED", "Destination country is required.");
  }
  if (!weightKg || weightKg <= 0) {
    throw new PricingError("MISSING_WEIGHT", "Weight is required to calculate price.");
  }

  const rule = await fetchCountryPricingRule(destinationCountry);
  if (!rule) {
    throw new PricingError(
      "COUNTRY_NOT_SUPPORTED",
      `We don't ship to ${destinationCountry} yet. Please contact support.`,
    );
  }

  return computeBreakdown(rule, weightKg, declaredValue);
}

export async function listCountryPricingRules(): Promise<CountryPricingRule[]> {
  const { data } = await (supabase as any)
    .from("country_pricing_rules")
    .select("*")
    .order("country", { ascending: true });
  return (data ?? []) as CountryPricingRule[];
}

export const SUPPORTED_PRICING_CURRENCIES = ["USD", "GBP", "EUR", "NGN", "CNY"] as const;

export function formatPriceInCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// =====================================================================
// Package-based dimensional weight engine — single source of truth used
// by the shipment form, summary, checkout, invoice, and admin dashboards.
// =====================================================================

export const DEFAULT_VOLUMETRIC_DIVISOR = 5000;

export interface ShipmentItemInput {
  quantity: number;
  weightKg: number; // total weight for this line (NOT per unit)
  declaredValue?: number;
}

export interface PackageDims {
  length_cm: number | null | undefined;
  width_cm: number | null | undefined;
  height_cm: number | null | undefined;
}

export interface ShipmentTotals {
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  declaredValue: number;
  packagingCost: number;
  /** Flat/base portion of the shipping charge (covers the included weight). */
  basePrice: number;
  includedWeight: number;
  additionalWeight: number;
  additionalRatePerKg: number;
  additionalCharge: number;
  minimumChargeApplied: boolean;
  shippingCost: number;
  handlingFee: number;
  customsFee: number;
  subtotal: number;
  vat: number;
  vatPercent: number;
  insurance: number;
  insurancePercent: number;
  total: number;
  currency: string;
}

export interface ComputeShipmentArgs {
  packageDims: PackageDims;
  divisor?: number;
  items: ShipmentItemInput[];
  packagePrice?: number;
  rule: CountryPricingRule | null;
  declaredValue?: number;
}

/**
 * Thin adapter over the ONE authoritative pricing core.
 * No pricing maths lives here — see supabase/functions/_shared/pricing-core.ts
 */
export function computeShipmentTotals({
  packageDims,
  divisor = DEFAULT_VOLUMETRIC_DIVISOR,
  items,
  packagePrice = 0,
  rule,
  declaredValue,
}: ComputeShipmentArgs): ShipmentTotals {
  const actualWeight = round2(
    // weightKg is ALWAYS the total weight for the line — never multiply by quantity.
    items.reduce((sum, it) => sum + (Number(it.weightKg) || 0), 0),
  );

  const computedDeclared =
    declaredValue ??
    items.reduce(
      (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.declaredValue) || 0),
      0,
    );

  const safeDivisor =
    (rule?.volumetric_divisor && Number(rule.volumetric_divisor) > 0
      ? Number(rule.volumetric_divisor)
      : divisor) || DEFAULT_VOLUMETRIC_DIVISOR;

  const box = {
    length_cm: Number(packageDims.length_cm) || 0,
    width_cm: Number(packageDims.width_cm) || 0,
    height_cm: Number(packageDims.height_cm) || 0,
    actual_weight_kg: actualWeight,
    packaging_price: Number(packagePrice) || 0,
  };

  if (!rule) {
    const w = computeWeights([box], safeDivisor);
    return {
      actualWeight: w.actual,
      volumetricWeight: w.volumetric,
      chargeableWeight: w.chargeable,
      declaredValue: round2(computedDeclared),
      packagingCost: round2(packagePrice),
      basePrice: 0,
      includedWeight: 0,
      additionalWeight: 0,
      additionalRatePerKg: 0,
      additionalCharge: 0,
      minimumChargeApplied: false,
      shippingCost: 0,
      handlingFee: 0,
      customsFee: 0,
      subtotal: round2(packagePrice),
      vat: 0,
      vatPercent: 0,
      insurance: 0,
      insurancePercent: 0,
      total: round2(packagePrice),
      currency: "USD",
    };
  }

  const coreRule: PricingRuleRow = {
    id: rule.id,
    shipment_type: "import",
    name: rule.country,
    origin_country: rule.country,
    warehouse_country: null,
    destination_country: rule.country,
    shipping_method: "air",
    service_type: null,
    pricing_model: (rule.pricing_model as PricingRuleRow["pricing_model"]) || "tiered",
    min_weight_kg: null,
    max_weight_kg: null,
    flat_price: Number(rule.flat_price),
    flat_weight_threshold_kg: Number(rule.flat_weight_threshold_kg),
    price_per_kg: Number(rule.price_per_kg),
    minimum_charge: Number(rule.minimum_charge ?? 0),
    handling_fee: Number(rule.handling_fee),
    customs_fee: Number(rule.customs_fee ?? 0),
    vat_percent: Number(rule.vat_percent),
    insurance_percent: Number(rule.insurance_percent),
    volumetric_divisor: safeDivisor,
    currency: rule.currency,
    estimated_days_min: null,
    estimated_days_max: null,
    is_active: true,
    priority: 0,
  };

  const q = calculateQuote(coreRule, {
    direction: "import",
    shippingMethod: "air",
    boxes: [box],
    declaredValue: Number(computedDeclared) || 0,
  });

  return {
    actualWeight: q.actual_weight_kg,
    volumetricWeight: q.volumetric_weight_kg,
    chargeableWeight: q.chargeable_weight_kg,
    declaredValue: round2(computedDeclared),
    packagingCost: q.packaging_cost,
    basePrice: q.base_price,
    includedWeight: q.included_weight_kg,
    additionalWeight: q.additional_weight_kg,
    additionalRatePerKg: q.additional_rate_per_kg,
    additionalCharge: q.additional_charge,
    minimumChargeApplied: q.minimum_charge_applied,
    shippingCost: q.shipping_cost,
    handlingFee: q.handling_fee,
    customsFee: q.customs_fee,
    subtotal: q.subtotal,
    vat: q.vat,
    vatPercent: q.vat_percent,
    insurance: q.insurance,
    insurancePercent: q.insurance_percent,
    total: q.total,
    currency: q.currency,
  };
}
