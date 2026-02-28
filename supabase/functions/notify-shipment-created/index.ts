import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { shipment_id } = await req.json();
    if (!shipment_id) {
      return new Response(
        JSON.stringify({ error: "shipment_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get shipment
    const { data: shipment, error: shipErr } = await supabase
      .from("shipments")
      .select("*")
      .eq("id", shipment_id)
      .single();

    if (shipErr || !shipment) {
      return new Response(
        JSON.stringify({ error: "Shipment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", shipment.user_id)
      .single();

    // Send email via centralized function
    const funcUrl = `${supabaseUrl}/functions/v1/send-notification-email`;
    const emailRes = await fetch(funcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        type: "shipment_created",
        data: {
          tracking_number: shipment.tracking_number,
          service_type: shipment.service_type,
          origin_city: shipment.origin_city,
          origin_country: shipment.origin_country,
          destination_city: shipment.destination_city,
          destination_country: shipment.destination_country,
          weight: shipment.weight,
          price: shipment.price,
          user_name: profile?.full_name,
          user_email: profile?.email,
        },
      }),
    });

    const result = await emailRes.json();

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("notify-shipment-created error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
