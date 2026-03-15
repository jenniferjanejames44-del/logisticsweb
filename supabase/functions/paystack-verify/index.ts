import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildGatewayQuote } from "../_shared/currency.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendNotificationEmail(supabaseUrl: string, serviceKey: string, type: string, data: Record<string, any>) {
  try {
    const funcUrl = `${supabaseUrl}/functions/v1/send-notification-email`;
    await fetch(funcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ type, data }),
    });
  } catch (err) {
    console.error("Email notification failed (non-blocking):", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { reference } = await req.json();
    if (!reference) {
      return new Response(
        JSON.stringify({ error: "reference is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("Paystack verify failed:", paystackData);
      return new Response(
        JSON.stringify({ error: "Payment verification failed", status: "failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const txn = paystackData.data;
    const metadata = txn.metadata || {};
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Fetch user profile for email notifications
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", userId)
      .single();

    // ── Wallet top-up ──
    if (metadata.type === "wallet_topup") {
      if (metadata.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: "Access denied" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (txn.status === "success") {
        const paidAmountNGN = txn.amount / 100;

        const { data: existingTxn } = await adminClient
          .from("wallet_transactions")
          .select("id")
          .eq("reference_id", reference)
          .single();

        if (!existingTxn) {
          await adminClient.from("wallet_transactions").insert({
            user_id: userId,
            amount: paidAmountNGN,
            type: "credit",
            description: `Wallet top-up via Paystack`,
            reference_id: reference,
          });
        }

        // Send wallet top-up email
        sendNotificationEmail(supabaseUrl, serviceKey, "wallet_topup", {
          user_name: profile?.full_name,
          user_email: profile?.email,
          amount: paidAmountNGN,
          reference,
        });

        return new Response(
          JSON.stringify({ status: "success", message: "Wallet funded successfully!", type: "wallet_topup" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ status: "failed", message: `Payment status: ${txn.status}`, type: "wallet_topup" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Shopping order payment ──
    if (metadata.type === "shopping_order") {
      if (metadata.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: "Access denied" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: order, error: orderError } = await adminClient
        .from("shopping_orders")
        .select("id, user_id, order_number, total_cost, payment_status")
        .eq("id", metadata.shopping_order_id)
        .single();

      if (orderError || !order) {
        return new Response(
          JSON.stringify({ error: "Shopping order not found for this payment" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (order.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: "Access denied" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (order.payment_status === "paid") {
        return new Response(
          JSON.stringify({ status: "success", message: "Shopping order already paid", type: "shopping_order" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (txn.status !== "success") {
        return new Response(
          JSON.stringify({ status: "failed", message: `Payment status: ${txn.status}`, type: "shopping_order" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const paidAmountNGN = txn.amount / 100;
      const fallbackQuote = await buildGatewayQuote({
        amount: Number(order.total_cost),
        baseCurrency: "USD",
        gateway: "paystack",
      });
      const expectedAmount = Number(metadata.gateway_amount || fallbackQuote.payableAmount);
      const gatewayCurrency = metadata.gateway_currency || txn.currency || "NGN";

      if (paidAmountNGN + 0.01 < expectedAmount) {
        console.error(`Shopping order amount mismatch: paid ${paidAmountNGN}, expected ${expectedAmount}`);
        return new Response(
          JSON.stringify({ error: "Amount mismatch", status: "failed", type: "shopping_order" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await adminClient
        .from("shopping_orders")
        .update({
          payment_status: "paid",
          status: "paid",
        })
        .eq("id", order.id);

      const { data: existingPayment } = await adminClient
        .from("payments")
        .select("id")
        .eq("transaction_id", reference)
        .maybeSingle();

      if (!existingPayment) {
        await adminClient.from("payments").insert({
          user_id: userId,
          shipment_id: null,
          amount: paidAmountNGN,
          currency: gatewayCurrency,
          status: "completed",
          payment_method: txn.channel || "paystack",
          transaction_id: reference,
          description: `Paystack payment for shopping order ${order.order_number}`,
        });
      }

      return new Response(
        JSON.stringify({
          status: "success",
          message: "Payment verified and shopping order marked as paid",
          type: "shopping_order",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Invoice payment ──
    const { data: invoice, error: invError } = await adminClient
      .from("invoices")
      .select("*")
      .eq("paystack_reference", reference)
      .single();

    if (invError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found for this reference" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (invoice.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (invoice.status === "paid") {
      return new Response(
        JSON.stringify({ status: "success", message: "Already paid" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (txn.status === "success") {
      const paidAmountNGN = txn.amount / 100;
      const fallbackQuote = await buildGatewayQuote({
        amount: Number(invoice.amount),
        baseCurrency: invoice.currency || "USD",
        gateway: "paystack",
      });
      const expectedAmount = Number(metadata.gateway_amount || fallbackQuote.payableAmount);
      const gatewayCurrency = metadata.gateway_currency || txn.currency || "NGN";

      if (paidAmountNGN + 0.01 < expectedAmount) {
        console.error(`Amount mismatch: paid ${paidAmountNGN}, expected ${expectedAmount}`);
        return new Response(
          JSON.stringify({ error: "Amount mismatch", status: "failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await adminClient
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_channel: txn.channel || "paystack",
          payment_reference: reference,
        })
        .eq("id", invoice.id);

      const { data: existingPayment } = await adminClient
        .from("payments")
        .select("id")
        .eq("transaction_id", reference)
        .maybeSingle();

      if (!existingPayment) {
        await adminClient.from("payments").insert({
          user_id: userId,
          shipment_id: invoice.shipment_id,
          amount: paidAmountNGN,
          currency: gatewayCurrency,
          status: "completed",
          payment_method: txn.channel || "paystack",
          transaction_id: reference,
          description: `Paystack payment for invoice ${invoice.invoice_number}`,
        });
      }

      // Get shipment tracking number
      const { data: shipment } = await adminClient
        .from("shipments")
        .select("tracking_number")
        .eq("id", invoice.shipment_id)
        .single();

      // Auto-generate invoice PDF
      try {
        const funcUrl = `${supabaseUrl}/functions/v1/generate-invoice-pdf`;
        await fetch(funcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ invoice_id: invoice.id }),
        });
      } catch (pdfErr) {
        console.error("Invoice PDF generation failed (non-blocking):", pdfErr);
      }

      // Send payment confirmation email
      sendNotificationEmail(supabaseUrl, serviceKey, "payment_confirmation", {
        user_name: profile?.full_name,
        user_email: profile?.email,
        amount: paidAmountNGN,
        currency: gatewayCurrency,
        invoice_number: invoice.invoice_number,
        tracking_number: shipment?.tracking_number,
        payment_channel: txn.channel || "paystack",
        reference,
      });

      return new Response(
        JSON.stringify({ status: "success", message: "Payment verified and recorded" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ status: "failed", message: `Payment status: ${txn.status}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
