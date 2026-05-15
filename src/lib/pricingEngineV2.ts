import { supabase } from "@/integrations/supabase/client";
import type { CountryPricingRule } from "@/lib/pricingEngine";

export type ShipmentType = "import" | "export";

export interface PricingRuleV2 {
  id: string;
  shipment_type: ShipmentType;
  name: string;
  origin_country: string;
  warehouse_country: string | null;
  destination_country: string;
  shipping_method: string;
  service_type: string | null;
  min_weight_kg: number | null;
  max_weight_kg: number | null;
  flat_price: number;
  flat_weight_threshold_kg: number;
  price_per_kg: number;
  handling_fee: number;
  customs_fee: number;
  vat_percent: number;
  insurance_percent: number;
  currency: string;
  estimated_days_min: number | null;
  estimated_days_max: number | null;
  is_active: boolean;
  priority: number;
  notes: string | null;
}

export class MissingPricingRuleError extends Error {
  constructor(msg = "No pricing rule found for this route. Please contact support.") {
    super(msg);
    this.name = "MissingPricingRuleError";
  }
}

export interface MatchArgs {
  shipmentType: ShipmentType;
  originCountry?: string | null;
  destinationCountry?: string | null;
  warehouseCountry?: string | null;
  shippingMethod?: string | null;
  serviceType?: string | null;
  chargeableWeight?: number | null;
}

const normMethod = (m?: string | null) => {
  if (!m) return "";
  const s = m.toLowerCase();
  if (s.startsWith("air")) return "air";
  if (s.startsWith("ocean") || s.startsWith("sea")) return "ocean";
  if (s.startsWith("road") || s.startsWith("ground")) return "road";
  return s;
};

export async function matchPricingRule(args: MatchArgs): Promise<PricingRuleV2 | null> {
  const method = normMethod(args.shippingMethod);
  if (!args.shipmentType || !method) return null;

  let q = (supabase as any)
    .from("pricing_rules")
    .select("*")
    .eq("shipment_type", args.shipmentType)
    .eq("is_active", true);

  if (args.shipmentType === "export") {
    q = q.eq("origin_country", "Nigeria");
    if (args.destinationCountry) q = q.eq("destination_country", args.destinationCountry);
  } else {
    q = q.eq("destination_country", "Nigeria");
    if (args.warehouseCountry) q = q.eq("warehouse_country", args.warehouseCountry);
    else if (args.originCountry) q = q.eq("origin_country", args.originCountry);
  }

  const { data, error } = await q;
  if (error || !data) return null;

  const w = Number(args.chargeableWeight) || 0;

  const candidates = (data as PricingRuleV2[]).filter((r) => {
    if (normMethod(r.shipping_method) !== method) return false;
    if (args.serviceType && r.service_type && r.service_type !== args.serviceType) return false;
    if (r.min_weight_kg != null && w > 0 && w < Number(r.min_weight_kg)) return false;
    if (r.max_weight_kg != null && w > 0 && w > Number(r.max_weight_kg)) return false;
    return true;
  });

  if (!candidates.length) return null;

  // Specificity: higher priority first; then service_type match; then warehouse match
  candidates.sort((a, b) => {
    const pa = (b.priority || 0) - (a.priority || 0);
    if (pa !== 0) return pa;
    const sa = (a.service_type === args.serviceType ? 1 : 0) - (b.service_type === args.serviceType ? 1 : 0);
    if (sa !== 0) return sa;
    return 0;
  });

  return candidates[0];
}

/** Adapt the new rule to the legacy CountryPricingRule shape used by computeShipmentTotals. */
export function toLegacyRule(rule: PricingRuleV2): CountryPricingRule {
  return {
    id: rule.id,
    country: rule.warehouse_country || rule.destination_country,
    currency: rule.currency,
    flat_price: Number(rule.flat_price),
    flat_weight_threshold_kg: Number(rule.flat_weight_threshold_kg),
    price_per_kg: Number(rule.price_per_kg),
    // Roll customs into handling so existing breakdown displays full ops cost.
    handling_fee: Number(rule.handling_fee) + Number(rule.customs_fee),
    vat_percent: Number(rule.vat_percent),
    insurance_percent: Number(rule.insurance_percent),
    is_active: rule.is_active,
  };
}

/** Convert any supported currency amount to NGN using admin-managed rates. */
export async function convertToNGN(amount: number, currency: string): Promise<number> {
  const c = (currency || "NGN").toUpperCase();
  if (c === "NGN") return Math.round(amount * 100) / 100;
  const { data } = await (supabase as any)
    .from("exchange_rates")
    .select("rate")
    .eq("from_currency", c)
    .eq("to_currency", "NGN")
    .eq("is_active", true)
    .maybeSingle();
  const rate = data?.rate ? Number(data.rate) : null;
  if (!rate) throw new Error(`Missing exchange rate for ${c} → NGN. Please contact support.`);
  return Math.round(amount * rate * 100) / 100;
}

export async function getNgnRate(currency: string): Promise<number> {
  const c = (currency || "NGN").toUpperCase();
  if (c === "NGN") return 1;
  const { data } = await (supabase as any)
    .from("exchange_rates")
    .select("rate")
    .eq("from_currency", c)
    .eq("to_currency", "NGN")
    .eq("is_active", true)
    .maybeSingle();
  return data?.rate ? Number(data.rate) : 0;
}
