import { detectCurrencyFromRequest, getUsdExchangeRates } from "../_shared/currency.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const [geo, exchange] = await Promise.all([
      detectCurrencyFromRequest(req),
      getUsdExchangeRates(),
    ]);

    return new Response(
      JSON.stringify({
        baseCurrency: "USD",
        defaultCurrency: geo.currency,
        countryCode: geo.countryCode,
        countryName: geo.countryName,
        geoSource: geo.source,
        rateSource: exchange.source,
        fetchedAt: exchange.fetchedAt,
        cacheTtlMs: 12 * 60 * 60 * 1000,
        rates: exchange.rates,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("currency-context error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});