import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { tracking_number, old_status, new_status }: NotificationRequest = await req.json();

    if (!tracking_number || !new_status) {
      throw new Error("Missing required fields: tracking_number and new_status");
    }

    // Get all active subscribers for this tracking number
    const { data: subscribers, error: subError } = await supabase
      .from("shipment_notifications")
      .select("email")
      .eq("tracking_number", tracking_number)
      .eq("is_active", true);

    if (subError) {
      throw new Error(`Failed to fetch subscribers: ${subError.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers for this shipment" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if Resend API key is configured
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - logging notification instead");
      console.log("Would send email to:", subscribers.map(s => s.email));
      console.log("Tracking:", tracking_number, "Status:", old_status, "->", new_status);
      return new Response(
        JSON.stringify({ 
          message: "Email notifications not configured yet - API key pending",
          subscribers: subscribers.length 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emails = subscribers.map(s => s.email);
    const formattedOldStatus = formatStatus(old_status || "Unknown");
    const formattedNewStatus = formatStatus(new_status);

    // Send email using Resend API via fetch
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RAC Logistics <notifications@yourdomain.com>", // Replace with your verified domain
        to: emails,
        subject: `Shipment Update: ${tracking_number}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #D4AF37, #B8860B); padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { color: #1a1a2e; margin: 0; font-size: 24px; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
              .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37; }
              .tracking-number { font-size: 18px; font-weight: bold; color: #1a1a2e; }
              .status-change { display: flex; align-items: center; gap: 10px; margin-top: 15px; }
              .old-status { color: #6c757d; text-decoration: line-through; }
              .new-status { color: #28a745; font-weight: bold; font-size: 16px; }
              .arrow { color: #D4AF37; font-size: 20px; }
              .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px; }
              .btn { display: inline-block; background: #D4AF37; color: #1a1a2e; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚚 RAC Logistics</h1>
              </div>
              <div class="content">
                <h2>Shipment Status Update</h2>
                <p>Great news! Your shipment status has been updated.</p>
                
                <div class="status-box">
                  <div class="tracking-number">Tracking: ${tracking_number}</div>
                  <div class="status-change">
                    <span class="old-status">${formattedOldStatus}</span>
                    <span class="arrow">→</span>
                    <span class="new-status">${formattedNewStatus}</span>
                  </div>
                </div>

                <p>Track your shipment in real-time for the latest updates.</p>
                
                <a href="https://logisticsweb.lovable.app/track?number=${tracking_number}" class="btn">
                  Track Shipment
                </a>

                <div class="footer">
                  <p>You're receiving this because you subscribed to updates for shipment ${tracking_number}.</p>
                  <p>© ${new Date().getFullYear()} RAC Logistics. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailsSent: emails.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-shipment-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
