import { supabase } from "@/integrations/supabase/client";

export interface PriceBreakdown {
  shippingCost: number;
  extraCharges: { name: string; price: number }[];
  extraChargesTotal: number;
  processingFee: number;
  subtotal: number;
  taxes: { name: string; rate: number; amount: number }[];
  taxTotal: number;
  total: number;
  zone: string | null;
}

export async function calculateShippingCost(
  destinationCountry: string,
  weightKg: number,
  selectedExtras: string[] = [],
  declaredValue: number = 0
): Promise<PriceBreakdown> {
  const result: PriceBreakdown = {
    shippingCost: 0,
    extraCharges: [],
    extraChargesTotal: 0,
    processingFee: 0,
    subtotal: 0,
    taxes: [],
    taxTotal: 0,
    total: 0,
    zone: null,
  };

  // 1. Detect zone from destination country
  const { data: zoneCountry } = await (supabase as any)
    .from("zone_countries")
    .select("zone_id, zones(name)")
    .eq("country", destinationCountry)
    .maybeSingle();

  if (!zoneCountry) return result;

  const zoneId = zoneCountry.zone_id;
  result.zone = (zoneCountry as any).zones?.name || null;

  // 2. Check weight pricing (fixed price brackets)
  const { data: weightPrices } = await (supabase as any)
    .from("weight_pricing")
    .select("*")
    .eq("zone_id", zoneId)
    .lte("min_weight", weightKg)
    .gte("max_weight", weightKg)
    .limit(1)
    .maybeSingle();

  if (weightPrices) {
    result.shippingCost = Number(weightPrices.price);
  } else {
    // 3. Check heavy weight pricing (per KG)
    const { data: heavyPrices } = await (supabase as any)
      .from("heavy_weight_pricing")
      .select("*")
      .eq("zone_id", zoneId)
      .lte("min_weight", weightKg)
      .gte("max_weight", weightKg)
      .limit(1)
      .maybeSingle();

    if (heavyPrices) {
      result.shippingCost = weightKg * Number(heavyPrices.price_per_kg);
    }
  }

  // 4. Add extra charges
  if (selectedExtras.length > 0) {
    const { data: extras } = await (supabase as any)
      .from("extra_charges")
      .select("id, name, price")
      .eq("is_active", true)
      .in("id", selectedExtras);

    if (extras) {
      result.extraCharges = extras.map((e) => ({ name: e.name, price: Number(e.price) }));
      result.extraChargesTotal = result.extraCharges.reduce((s, e) => s + e.price, 0);
    }
  }

  // 5. Calculate processing fee from declared value
  if (declaredValue > 0) {
    const { data: fees } = await (supabase as any)
      .from("processing_fees")
      .select("*")
      .lte("min_value", declaredValue)
      .gte("max_value", declaredValue)
      .limit(1)
      .maybeSingle();

    if (fees) {
      result.processingFee =
        fees.fee_type === "flat" ? Number(fees.fee_value) : (declaredValue * Number(fees.fee_value)) / 100;
    }
  }

  // 6. Subtotal
  result.subtotal = result.shippingCost + result.extraChargesTotal + result.processingFee;

  // 7. Apply taxes
  const { data: taxes } = await (supabase as any)
    .from("tax_settings")
    .select("name, rate")
    .eq("is_active", true);

  if (taxes) {
    result.taxes = taxes.map((t) => ({
      name: t.name,
      rate: Number(t.rate),
      amount: (result.subtotal * Number(t.rate)) / 100,
    }));
    result.taxTotal = result.taxes.reduce((s, t) => s + t.amount, 0);
  }

  // 8. Total
  result.total = result.subtotal + result.taxTotal;

  return result;
}
