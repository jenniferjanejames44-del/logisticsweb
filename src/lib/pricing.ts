import { supabase } from "@/integrations/supabase/client";

// Maps form service_type values to pricing_plans service_type
const SERVICE_TYPE_MAP: Record<string, string> = {
  "air-express": "air_express",
  "air-standard": "air",
  "ocean-fcl": "ocean",
  "ocean-lcl": "ocean",
  "road-freight": "road",
};

export async function calculateShipmentPrice(
  serviceType: string,
  weightKg: number
): Promise<number | null> {
  const pricingServiceType = SERVICE_TYPE_MAP[serviceType];
  if (!pricingServiceType) return null;

  const { data, error } = await supabase
    .from("pricing_plans")
    .select("base_price, price_per_kg")
    .eq("service_type", pricingServiceType)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return Number(data.base_price) + Number(data.price_per_kg) * weightKg;
}

const PENDING_SHIPMENT_KEY = "pending_shipment_data";

export interface PendingShipmentData {
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  weight: string;
  service_type: string;
  description: string;
}

export function savePendingShipment(data: PendingShipmentData) {
  localStorage.setItem(PENDING_SHIPMENT_KEY, JSON.stringify(data));
}

export function getPendingShipment(): PendingShipmentData | null {
  const raw = localStorage.getItem(PENDING_SHIPMENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingShipment() {
  localStorage.removeItem(PENDING_SHIPMENT_KEY);
}
