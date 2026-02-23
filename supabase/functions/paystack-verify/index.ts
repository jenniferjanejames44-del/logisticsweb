import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
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
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
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
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Handle wallet top-up verification
    if (metadata.type === "wallet_topup") {
      if (metadata.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: "Access denied" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (txn.status === "success") {
        const paidAmountNGN = txn.amount / 100;

        // Check for duplicate
        const { data: existingTxn } = await adminClient
          .from("wallet_transactions")
          .select("id")
          .eq("reference_id", reference)
          .single();

        if (!existingTxn) {
          // Credit wallet
          await adminClient.from("wallet_transactions").insert({
            user_id: userId,
            amount: paidAmountNGN,
            type: "credit",
            description: `Wallet top-up via Paystack`,
            reference_id: reference,
          });
        }

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

    // Handle invoice payment verification (existing flow)
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
      const expectedAmount = Number(invoice.amount);

      if (paidAmountNGN < expectedAmount) {
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

      await adminClient.from("payments").insert({
        user_id: userId,
        shipment_id: invoice.shipment_id,
        amount: expectedAmount,
        currency: "NGN",
        status: "completed",
        payment_method: txn.channel || "paystack",
        transaction_id: reference,
        description: `Paystack payment for invoice ${invoice.invoice_number}`,
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
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
