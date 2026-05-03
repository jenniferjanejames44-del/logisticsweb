import { supabase } from "@/integrations/supabase/client";

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
