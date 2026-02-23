import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paystack-signature",
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

    // Validate Paystack signature
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("Missing Paystack signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const hash = createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Signature mismatch");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event);

    if (event.event === "charge.success") {
      const txn = event.data;
      const reference = txn.reference;

      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Find invoice by paystack_reference
      const { data: invoice, error: invError } = await adminClient
        .from("invoices")
        .select("*")
        .eq("paystack_reference", reference)
        .single();

      if (invError || !invoice) {
        console.error("Invoice not found for reference:", reference);
        return new Response("OK", { status: 200 });
      }

      // Prevent duplicate updates
      if (invoice.status === "paid") {
        console.log("Invoice already paid:", invoice.id);
        return new Response("OK", { status: 200 });
      }

      // Verify amount
      const paidAmountNGN = txn.amount / 100;
      const expectedAmount = Number(invoice.amount);

      if (paidAmountNGN < expectedAmount) {
        console.error(`Webhook amount mismatch: paid ${paidAmountNGN}, expected ${expectedAmount}`);
        return new Response("OK", { status: 200 });
      }

      // Update invoice - triggers invoice_paid_update_shipment
      await adminClient
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_channel: txn.channel || "paystack",
          payment_reference: reference,
        })
        .eq("id", invoice.id);

      // Log payment
      await adminClient.from("payments").insert({
        user_id: invoice.user_id,
        shipment_id: invoice.shipment_id,
        amount: expectedAmount,
        currency: "NGN",
        status: "completed",
        payment_method: txn.channel || "paystack",
        transaction_id: reference,
        description: `Paystack webhook payment for invoice ${invoice.invoice_number}`,
      });

      console.log("Webhook: Invoice paid successfully:", invoice.id);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Server error", { status: 500 });
  }
});
