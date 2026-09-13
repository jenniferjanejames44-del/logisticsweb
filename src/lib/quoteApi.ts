import { supabase } from "@/integrations/supabase/client";
import type { QuoteBreakdown, ShipmentDirection, BoxInput } from "@/lib/pricingCore";

export interface QuoteRequest {
  direction: ShipmentDirection;
  originCountry?: string | null;
  destinationCountry?: string | null;
  warehouseCountry?: string | null;
  shippingMethod: string;
  serviceType?: string | null;
  boxes?: BoxInput[];
  weightKg?: number | null;
  declaredValue?: number | null;
  discount?: number | null;
}

export interface QuoteResult {
  quote: QuoteBreakdown;
  debug?: { matched_rule: unknown; candidates: number };
}

export class QuoteError extends Error {}

/**
 * THE only way the app obtains an authoritative price.
 * The maths runs server-side against the admin pricing rules.
 */
export async function fetchQuote(req: QuoteRequest): Promise<QuoteResult> {
  const { data, error } = await supabase.functions.invoke("calculate-quote", { body: req });

  if (error) {
    // Supabase wraps non-2xx responses; try to surface the server message.
    let message = "Could not load pricing right now. Please try again.";
    const ctx = (error as unknown as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const payload = await ctx.json();
        if (payload?.error) message = payload.error;
      } catch {
        /* ignore */
      }
    }
    throw new QuoteError(message);
  }

  if (!data?.quote) throw new QuoteError(data?.error || "Pricing is currently unavailable.");
  return data as QuoteResult;
}
