import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  tracking_number: string;
  old_status: string;
  new_status: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { tracking_number, old_status, new_status }: NotificationRequest = await req.json();

    if (!tracking_number || !new_status) {
      throw new Error("Missing required fields: tracking_number and new_status");
    }

    // Get shipment details
    const { data: shipment } = await supabase
      .from("shipments")
      .select("*, profiles!inner(full_name, email)")
      .eq("tracking_number", tracking_number)
      .single();

    // Get subscribers
    const { data: subscribers } = await supabase
      .from("shipment_notifications")
      .select("email")
      .eq("tracking_number", tracking_number)
      .eq("is_active", true);

    const subscriberEmails = (subscribers || []).map((s: any) => s.email);

    // Get user profile from shipment
    let userName = "Customer";
    let userEmail = "";
    if (shipment) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", shipment.user_id)
        .single();
      userName = profile?.full_name || "Customer";
      userEmail = profile?.email || "";
    }

    // Send via centralized email function
    try {
      const funcUrl = `${supabaseUrl}/functions/v1/send-notification-email`;
      await fetch(funcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          type: "shipment_status_update",
          data: {
            tracking_number,
            old_status,
            new_status,
            user_name: userName,
            user_email: userEmail,
            subscriber_emails: subscriberEmails,
            estimated_delivery: shipment?.estimated_delivery,
          },
        }),
      });
    } catch (emailErr) {
      console.error("Email send failed (non-blocking):", emailErr);
    }

    return new Response(
      JSON.stringify({ success: true, notified: subscriberEmails.length + (userEmail ? 1 : 0) }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in send-shipment-notification:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
