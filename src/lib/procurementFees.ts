import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ProcessingFeeBand = Database["public"]["Tables"]["processing_fees"]["Row"];

export const OPEN_ENDED_MAX = 999999999;

export const fallbackProcessingFeeBands: ProcessingFeeBand[] = [
  { id: "tier-1", min_value: 1, max_value: 150, fee_type: "flat", fee_value: 15, created_at: "", updated_at: "" },
  { id: "tier-2", min_value: 151, max_value: 1000, fee_type: "percentage", fee_value: 10, created_at: "", updated_at: "" },
  { id: "tier-3", min_value: 1001, max_value: 5000, fee_type: "percentage", fee_value: 8, created_at: "", updated_at: "" },
  { id: "tier-4", min_value: 5001, max_value: 10000, fee_type: "percentage", fee_value: 7, created_at: "", updated_at: "" },
  { id: "tier-5", min_value: 10001, max_value: OPEN_ENDED_MAX, fee_type: "percentage", fee_value: 5, created_at: "", updated_at: "" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value % 1 === 0 ? 0 : 2 }).format(value);

export async function fetchProcessingFeeBands(): Promise<ProcessingFeeBand[]> {
  try {
    const { data, error } = await supabase
      .from("processing_fees")
      .select("*")
      .order("min_value", { ascending: true });

    if (error) throw error;
    return data && data.length > 0 ? data : fallbackProcessingFeeBands;
  } catch (error) {
    console.error("Failed to load processing fees:", error);
    return fallbackProcessingFeeBands;
  }
}

export function calculateProcessingFeeFromBands(amount: number, feeBands: ProcessingFeeBand[]) {
  if (amount <= 0) return 0;
  const activeBands = feeBands.length > 0 ? feeBands : fallbackProcessingFeeBands;
  const band = activeBands.find((item) => amount >= Number(item.min_value) && amount <= Number(item.max_value));
  if (!band) return 0;
  return band.fee_type === "flat" ? Number(band.fee_value) : (amount * Number(band.fee_value)) / 100;
}

export function formatProcessingFeeBand(
  band: ProcessingFeeBand,
  formatter: (value: number) => string = formatCurrency,
) {
  const min = Number(band.min_value);
  const max = Number(band.max_value);
  const rangeLabel = max >= OPEN_ENDED_MAX ? `${formatter(min)}+` : `${formatter(min)}–${formatter(max)}`;
  const feeLabel = band.fee_type === "flat" ? `${formatter(Number(band.fee_value))} flat fee` : `${Number(band.fee_value)}%`;
  return { rangeLabel, feeLabel };
}