import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  calculateQuote,
  calculateZoneQuote,
  computeWeights,
  DEFAULT_VOLUMETRIC_DIVISOR,
  normaliseMethod,
  selectRule,
  selectZoneRate,
  type PricingRuleRow,
  type QuoteInput,
  type ZonePricingRate,
} from "../_shared/pricing-core.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const UNAVAILABLE =
  "Pricing is currently unavailable for this route and service. Please contact us for a quotation.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));

    const direction = body.direction === "export" ? "export" : body.direction === "import" ? "import" : null;
    const shippingMethod = typeof body.shippingMethod === "string" ? body.shippingMethod : "";
    if (!direction) return json({ error: "direction must be 'import' or 'export'." }, 400);
    if (!normaliseMethod(shippingMethod)) return json({ error: "shippingMethod is required." }, 400);

    const boxes = Array.isArray(body.boxes) ? body.boxes : [];
    const weightKg = Number(body.weightKg) || 0;
    if (!boxes.length && !(weightKg > 0)) {
      return json({ error: "Provide boxes or a weight greater than zero." }, 400);
    }

    const input: QuoteInput = {
      direction,
      originCountry: body.originCountry ?? null,
      destinationCountry: body.destinationCountry ?? null,
      warehouseCountry: body.warehouseCountry ?? null,
      shippingMethod,
      serviceType: body.serviceType ?? null,
      boxes,
      weightKg,
      declaredValue: body.declaredValue != null ? Number(body.declaredValue) : null,
      discount: body.discount != null ? Number(body.discount) : null,
    };

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Admin callers get the rule identity for debugging; customers do not.
    let isAdmin = false;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (userData?.user) {
        const { data: roleOk } = await supabase.rpc("has_role", {
          _user_id: userData.user.id,
          _role: "admin",
        });
        isAdmin = Boolean(roleOk);
      }
    }

    // -----------------------------------------------------------------
    // 1. COUNTRY -> ZONE (database, never hardcoded)
    //    IMPORT  -> the foreign ORIGIN / warehouse country.
    //    EXPORT  -> the foreign DESTINATION country.
    // -----------------------------------------------------------------
    let zone: Record<string, unknown> | null = null;
    const zoneCode = typeof body.countryCode === "string" ? body.countryCode : null;
    const zoneName = direction === "import"
      ? (input.warehouseCountry || input.originCountry)
      : input.destinationCountry;
    try {
      if (zoneCode) {
        const { data: z } = await supabase.rpc("get_zone_by_country", { _iso_code: zoneCode });
        zone = Array.isArray(z) ? z[0] ?? null : z ?? null;
      }
      if (!zone && zoneName) {
        const { data: c } = await supabase
          .from("countries")
          .select("iso_code")
          .ilike("name", zoneName)
          .maybeSingle();
        if (c?.iso_code) {
          const { data: z } = await supabase.rpc("get_zone_by_country", { _iso_code: c.iso_code });
          zone = Array.isArray(z) ? z[0] ?? null : z ?? null;
        }
      }
    } catch (_) {
      zone = null;
    }

    // -----------------------------------------------------------------
    // 2. ZONE TARIFF (the authoritative Zone 1-8 price table)
    // -----------------------------------------------------------------
    if (zone && zone.zone_active !== false && zone.country_active !== false) {
      const { data: rateRows } = await supabase
        .from("zone_pricing_rates")
        .select("*")
        .eq("is_active", true)
        .eq("direction", direction)
        .eq("zone_id", zone.zone_id as string);

      const rates = (rateRows || []) as unknown as ZonePricingRate[];
      const rate = selectZoneRate(rates, input, zone.zone_id as string);

      if (rate) {
        const quote = calculateZoneQuote(rate, input, (zone.zone_name as string) || null);
        if (!isAdmin) {
          const { rule_id: _i, rule_name: _n, ...publicQuote } = quote;
          return json({ quote: publicQuote, zone });
        }
        return json({
          quote,
          zone,
          debug: { source: "zone_tariff", matched_rule: rate, candidates: rates.length },
        });
      }
    }

    // -----------------------------------------------------------------
    // 3. Route-level pricing rules (legacy / non-zoned routes)
    // -----------------------------------------------------------------
    const { data, error } = await supabase
      .from("pricing_rules")
      .select("*")
      .eq("is_active", true)
      .eq("shipment_type", direction);

    if (error) return json({ error: "Could not load pricing configuration." }, 500);

    const rules = (data || []) as PricingRuleRow[];
    const probe = boxes.length
      ? computeWeights(boxes, DEFAULT_VOLUMETRIC_DIVISOR).chargeable
      : weightKg;

    const rule = selectRule(rules, input, probe);
    if (!rule) {
      return json({ error: UNAVAILABLE, code: "PRICING_UNAVAILABLE", zone }, 404);
    }

    const quote = calculateQuote(rule, input);

    if (!isAdmin) {
      const { rule_id: _id, rule_name: _name, ...publicQuote } = quote;
      return json({ quote: publicQuote, zone });
    }

    return json({
      quote,
      zone,
      debug: { source: "pricing_rules", matched_rule: rule, candidates: rules.length },
    });
  } catch (e) {
    const err = e as Error;
    console.error("calculate-quote error:", err.message);
    return json({ error: err.message || UNAVAILABLE }, 500);
  }
});
