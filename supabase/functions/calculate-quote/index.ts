import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  calculateQuote,
  computeWeights,
  DEFAULT_VOLUMETRIC_DIVISOR,
  normaliseMethod,
  selectRule,
  type PricingRuleRow,
  type QuoteInput,
} from "../_shared/pricing-core.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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
      return json(
        {
          error:
            "Pricing is currently unavailable for this route and service. Please contact us for a quotation.",
          code: "PRICING_UNAVAILABLE",
        },
        404,
      );
    }

    const quote = calculateQuote(rule, input);

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

    if (!isAdmin) {
      const { rule_id: _id, rule_name: _name, ...publicQuote } = quote;
      return json({ quote: publicQuote });
    }

    return json({ quote, debug: { matched_rule: rule, candidates: rules.length } });
  } catch (e) {
    const err = e as Error;
    console.error("calculate-quote error:", err.message);
    return json({ error: err.message || "Unable to calculate a quote." }, 500);
  }
});
