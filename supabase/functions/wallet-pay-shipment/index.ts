import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildGatewayQuote } from "../_shared/currency.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendNotificationEmail(supabaseUrl: string, serviceKey: string, type: string, data: Record<string, unknown>) {
  try {
    await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ type, data }),
    });
  } catch (error) {
    console.error("wallet-pay-shipment email error:", error);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userId = claimsData.claims.sub;
    const { shipment_id, invoice_id, preview_only = false } = await req.json();

    if (!shipment_id && !invoice_id) {
      return new Response(JSON.stringify({ error: "shipment_id or invoice_id is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    let query = adminClient.from("invoices").select("*, shipments(tracking_number)").eq("user_id", userId);
    query = invoice_id ? query.eq("id", invoice_id) : query.eq("shipment_id", shipment_id);

    const { data: invoice, error: invoiceError } = await query.single();
    if (invoiceError || !invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (invoice.status === "paid") {
      return new Response(JSON.stringify({ status: "success", message: "Invoice already paid" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const walletQuote = await buildGatewayQuote({ amount: Number(invoice.amount), baseCurrency: invoice.currency || "USD", gateway: "paystack" });
    const debitAmount = walletQuote.payableAmount;

    const { data: walletTransactions, error: walletError } = await adminClient
      .from("wallet_transactions")
      .select("amount, type")
      .eq("user_id", userId);

    if (walletError) {
      return new Response(JSON.stringify({ error: walletError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const walletBalance = (walletTransactions || []).reduce((sum, item) => sum + (item.type === "credit" ? Number(item.amount) : -Number(item.amount)), 0);
    const hasSufficientFunds = walletBalance + 0.01 >= debitAmount;

    if (preview_only) {
      return new Response(JSON.stringify({
        status: "preview",
        charged_amount: debitAmount,
        currency: "NGN",
        wallet_balance: walletBalance,
        has_sufficient_funds: hasSufficientFunds,
        invoice_number: invoice.invoice_number,
        base_amount: Number(invoice.amount),
        base_currency: invoice.currency || "USD",
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!hasSufficientFunds) {
      return new Response(JSON.stringify({ error: "Insufficient wallet balance", required_amount: debitAmount, wallet_balance: walletBalance, currency: "NGN" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const reference = `WALLET-${invoice.invoice_number}-${Date.now()}`;

    await adminClient.from("wallet_transactions").insert({
      user_id: userId,
      amount: debitAmount,
      type: "debit",
      description: `Wallet payment for invoice ${invoice.invoice_number}`,
      reference_id: reference,
    });

    await adminClient.from("invoices").update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_channel: "wallet",
      payment_reference: reference,
    }).eq("id", invoice.id);

    await adminClient.from("payments").insert({
      user_id: userId,
      shipment_id: invoice.shipment_id,
      amount: debitAmount,
      currency: "NGN",
      status: "completed",
      payment_method: "wallet",
      transaction_id: reference,
      description: `Wallet payment for invoice ${invoice.invoice_number}`,
    });

    const { data: profile } = await adminClient.from("profiles").select("full_name, email").eq("user_id", userId).single();
    sendNotificationEmail(supabaseUrl, serviceKey, "payment_confirmation", {
      user_name: profile?.full_name,
      user_email: profile?.email,
      amount: debitAmount,
      currency: "NGN",
      invoice_number: invoice.invoice_number,
      tracking_number: invoice.shipments?.tracking_number,
      payment_channel: "wallet",
      reference,
    });

    return new Response(JSON.stringify({ status: "success", reference, charged_amount: debitAmount, currency: "NGN" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("wallet-pay-shipment error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message || "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});