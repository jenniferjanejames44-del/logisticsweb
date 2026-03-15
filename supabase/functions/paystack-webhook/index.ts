import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";
import { buildGatewayQuote } from "../_shared/currency.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paystack-signature",
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
      const metadata = txn.metadata || {};

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, serviceKey);

      // Wallet top-up
      if (metadata.type === "wallet_topup" && metadata.user_id) {
        const paidAmountNGN = txn.amount / 100;
        const userId = metadata.user_id;

        const { data: existingTxn } = await adminClient
          .from("wallet_transactions")
          .select("id")
          .eq("reference_id", reference)
          .single();

        if (existingTxn) {
          console.log("Wallet topup already processed:", reference);
          return new Response("OK", { status: 200 });
        }

        await adminClient.from("wallet_transactions").insert({
          user_id: userId,
          amount: paidAmountNGN,
          type: "credit",
          description: `Wallet top-up via Paystack`,
          reference_id: reference,
        });

        // Fetch profile for email
        const { data: profile } = await adminClient
          .from("profiles")
          .select("full_name, email")
          .eq("user_id", userId)
          .single();

        sendNotificationEmail(supabaseUrl, serviceKey, "wallet_topup", {
          user_name: profile?.full_name,
          user_email: profile?.email,
          amount: paidAmountNGN,
          reference,
        });

        console.log("Webhook: Wallet topped up for user:", userId);
        return new Response("OK", { status: 200 });
      }

      // Shopping order payment
      if (metadata.type === "shopping_order" && metadata.shopping_order_id) {
        const { data: order } = await adminClient
          .from("shopping_orders")
          .select("id, user_id, order_number, total_cost, payment_status")
          .eq("id", metadata.shopping_order_id)
          .single();

        if (!order) {
          console.error("Shopping order not found for reference:", reference);
          return new Response("OK", { status: 200 });
        }

        if (order.payment_status === "paid") {
          console.log("Shopping order already paid:", order.id);
          return new Response("OK", { status: 200 });
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
          console.error(`Webhook shopping order amount mismatch: paid ${paidAmountNGN}, expected ${expectedAmount}`);
          return new Response("OK", { status: 200 });
        }

        await adminClient
          .from("shopping_orders")
          .update({ payment_status: "paid", status: "paid" })
          .eq("id", order.id);

        const { data: existingPayment } = await adminClient
          .from("payments")
          .select("id")
          .eq("transaction_id", reference)
          .maybeSingle();

        if (!existingPayment) {
          await adminClient.from("payments").insert({
            user_id: order.user_id,
            shipment_id: null,
            amount: paidAmountNGN,
            currency: gatewayCurrency,
            status: "completed",
            payment_method: txn.channel || "paystack",
            transaction_id: reference,
            description: `Paystack webhook payment for shopping order ${order.order_number}`,
          });
        }

        console.log("Webhook: Shopping order paid successfully:", order.id);
        return new Response("OK", { status: 200 });
      }

      // Invoice payment
      const { data: invoice, error: invError } = await adminClient
        .from("invoices")
        .select("*")
        .eq("paystack_reference", reference)
        .single();

      if (invError || !invoice) {
        console.error("Invoice not found for reference:", reference);
        return new Response("OK", { status: 200 });
      }

      if (invoice.status === "paid") {
        console.log("Invoice already paid:", invoice.id);
        return new Response("OK", { status: 200 });
      }

      const paidAmountNGN = txn.amount / 100;
      const fallbackQuote = await buildGatewayQuote({
        amount: Number(invoice.amount),
        baseCurrency: invoice.currency || "USD",
        gateway: "paystack",
      });
      const expectedAmount = Number(metadata.gateway_amount || fallbackQuote.payableAmount);
      const gatewayCurrency = metadata.gateway_currency || txn.currency || "NGN";

      if (paidAmountNGN + 0.01 < expectedAmount) {
        console.error(`Webhook amount mismatch: paid ${paidAmountNGN}, expected ${expectedAmount}`);
        return new Response("OK", { status: 200 });
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
          user_id: invoice.user_id,
          shipment_id: invoice.shipment_id,
          amount: paidAmountNGN,
          currency: gatewayCurrency,
          status: "completed",
          payment_method: txn.channel || "paystack",
          transaction_id: reference,
          description: `Paystack webhook payment for invoice ${invoice.invoice_number}`,
        });
      }

      // Get user profile and shipment for email
      const { data: profile } = await adminClient
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", invoice.user_id)
        .single();

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
        console.error("Invoice PDF gen failed (non-blocking):", pdfErr);
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

      console.log("Webhook: Invoice paid successfully:", invoice.id);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Server error", { status: 500 });
  }
});
