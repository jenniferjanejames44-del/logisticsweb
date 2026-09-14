// =====================================================================
// RAC LOGISTICS — SHIPPING ZONE RESOLVER (single source of truth)
// ---------------------------------------------------------------------
// Zones live ONLY in the database (shipping_zones / countries /
// shipping_zone_countries). Never hardcode a country -> zone mapping
// anywhere in the app: always resolve it through this service.
// =====================================================================
import { supabase } from "@/integrations/supabase/client";

export interface ShippingZone {
  id: string;
  zone_number: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface ZoneCountry {
  id: string;
  name: string;
  iso_code: string;
  is_active: boolean;
  zone_id: string | null;
}

export interface ZoneResolution {
  zone_id: string;
  zone_number: number;
  zone_name: string;
  zone_active: boolean;
  country_name: string;
  iso_code: string;
  country_active: boolean;
}

/** Resolve a country ISO code (e.g. "US") to its shipping zone. */
export async function getZoneByCountry(countryCode: string): Promise<ZoneResolution | null> {
  const code = (countryCode || "").trim();
  if (!code) return null;
  const { data, error } = await supabase.rpc("get_zone_by_country", { _iso_code: code });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as ZoneResolution) ?? null;
}

/**
 * Resolve the zone that applies to a shipment.
 * IMPORT  -> the foreign ORIGIN country determines the zone.
 * EXPORT  -> the foreign DESTINATION country determines the zone.
 */
export async function resolveShipmentZone(params: {
  direction: "import" | "export";
  originCountryCode?: string | null;
  destinationCountryCode?: string | null;
}): Promise<ZoneResolution | null> {
  const code =
    params.direction === "import" ? params.originCountryCode : params.destinationCountryCode;
  if (!code) return null;
  return getZoneByCountry(code);
}

export async function listZones(): Promise<ShippingZone[]> {
  const { data, error } = await supabase
    .from("shipping_zones")
    .select("*")
    .order("zone_number", { ascending: true });
  if (error) throw error;
  return (data || []) as ShippingZone[];
}

export async function listZoneCountries(): Promise<ZoneCountry[]> {
  const { data, error } = await supabase
    .from("shipping_zone_countries")
    .select("zone_id, countries ( id, name, iso_code, is_active )")
    .order("zone_id", { ascending: true });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.countries.id,
    name: row.countries.name,
    iso_code: row.countries.iso_code,
    is_active: row.countries.is_active,
    zone_id: row.zone_id,
  }));
}
