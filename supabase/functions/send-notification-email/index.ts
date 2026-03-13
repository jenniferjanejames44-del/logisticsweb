import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "rex@raclogisticltd.com";
const FROM_EMAIL = "RAC Logistics <onboarding@resend.dev>";
const SITE_URL = "https://logisticsweb.lovable.app";

interface EmailRequest {
  type: string;
  data: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, data }: EmailRequest = await req.json();
    if (!type) {
      return new Response(
        JSON.stringify({ error: "type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emails = buildEmails(type, data);
    const results = [];

    for (const email of emails) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: Array.isArray(email.to) ? email.to : [email.to],
            subject: email.subject,
            html: email.html,
          }),
        });
        const result = await res.json();
        results.push({ to: email.to, success: res.ok, result });
        if (!res.ok) console.error("Resend error:", result);
      } catch (err) {
        console.error("Email send error:", err);
        results.push({ to: email.to, success: false, error: (err as Error).message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-notification-email error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ──────────────────────────────────────
// Email builder
// ──────────────────────────────────────

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
}

function buildEmails(type: string, data: Record<string, any>): EmailPayload[] {
  switch (type) {
    case "shipment_created":
      return buildShipmentCreatedEmails(data);
    case "shipment_status_update":
      return buildShipmentStatusUpdateEmails(data);
    case "payment_confirmation":
      return buildPaymentConfirmationEmails(data);
    case "wallet_topup":
      return buildWalletTopupEmails(data);
    case "contact_message":
      return buildContactMessageEmails(data);
    default:
      console.warn("Unknown email type:", type);
      return [];
  }
}

// ──────────────────────────────────────
// Shared layout
// ──────────────────────────────────────

function emailWrapper(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#061043,#0a1a6e);padding:28px 30px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">🚚 RAC LOGISTICS LTD</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">Premier Global Logistics Solutions</p>
    </td>
  </tr>
  <!-- Body -->
  <tr>
    <td style="padding:30px;">
      ${bodyContent}
    </td>
  </tr>
  <!-- Footer -->
  <tr>
    <td style="background:#f8f9fb;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0 0 4px;color:#061043;font-weight:700;font-size:13px;">RAC LOGISTICS LTD</p>
      <p style="margin:0 0 4px;color:#888;font-size:11px;">29b Osolo Way, Opposite Polaris Bank, Ajao Estate, Isolo, Lagos</p>
      <p style="margin:0;color:#888;font-size:11px;">info@raclogistic.com | www.raclogistics.com</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function statusBadge(status: string): string {
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    in_transit: "#8b5cf6",
    out_for_delivery: "#06b6d4",
    delivered: "#22c55e",
    cancelled: "#ef4444",
    paid: "#22c55e",
    unpaid: "#f59e0b",
  };
  const color = colors[status.toLowerCase()] || "#6b7280";
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return `<span style="display:inline-block;background:${color};color:#fff;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;">${label}</span>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;color:#555;font-weight:600;background:#f8f9fb;border:1px solid #eee;width:40%;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#1a1a2e;border:1px solid #eee;">${value}</td>
  </tr>`;
}

function ctaButton(text: string, url: string): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:#FF4D00;color:#ffffff;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px;">${text}</a>
  </div>`;
}

function currencyFormat(amount: number, currency = "USD"): string {
  void currency;
  const normalizedCurrency = "USD";
  const locale = "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

// ──────────────────────────────────────
// 1. Shipment Created
// ──────────────────────────────────────

function buildShipmentCreatedEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];
  const trackUrl = `${SITE_URL}/track?number=${data.tracking_number}`;
  const timestamp = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  // User email
  if (data.user_email) {
    const body = `
      <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Shipment Created Successfully! 🎉</h2>
      <p style="color:#555;font-size:14px;margin:0 0 20px;">Hi ${data.user_name || "Customer"}, your shipment has been created and is now being processed.</p>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${infoRow("Tracking Number", `<strong>${data.tracking_number}</strong>`)}
        ${infoRow("Service Type", (data.service_type || "").replace(/[-_]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()))}
        ${infoRow("Origin", `${data.origin_city}, ${data.origin_country}`)}
        ${infoRow("Destination", `${data.destination_city}, ${data.destination_country}`)}
        ${infoRow("Weight", `${data.weight} KG`)}
        ${infoRow("Status", statusBadge("pending"))}
        ${data.price ? infoRow("Shipping Cost", currencyFormat(data.price)) : ""}
      </table>

      ${ctaButton("Track Your Shipment", trackUrl)}
      
      <p style="color:#888;font-size:12px;text-align:center;">You'll receive email updates as your shipment progresses.</p>
    `;
    emails.push({
      to: data.user_email,
      subject: `Shipment Created - ${data.tracking_number}`,
      html: emailWrapper("Shipment Created", body),
    });
  }

  // Admin email
  const adminBody = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">📦 New Shipment Created</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px;">A new shipment has been created on the platform.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
      ${infoRow("Tracking Number", `<strong>${data.tracking_number}</strong>`)}
      ${infoRow("Customer", `${data.user_name || "N/A"} (${data.user_email || "N/A"})`)}
      ${infoRow("Service Type", (data.service_type || "").replace(/[-_]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()))}
      ${infoRow("Route", `${data.origin_city}, ${data.origin_country} → ${data.destination_city}, ${data.destination_country}`)}
      ${infoRow("Weight", `${data.weight} KG`)}
      ${data.price ? infoRow("Price", currencyFormat(data.price)) : ""}
      ${infoRow("Created At", timestamp)}
    </table>
  `;
  emails.push({
    to: ADMIN_EMAIL,
    subject: `[Admin] New Shipment: ${data.tracking_number}`,
    html: emailWrapper("New Shipment Alert", adminBody),
  });

  return emails;
}

// ──────────────────────────────────────
// 2. Shipment Status Update
// ──────────────────────────────────────

function buildShipmentStatusUpdateEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];
  const trackUrl = `${SITE_URL}/track?number=${data.tracking_number}`;
  const oldStatus = (data.old_status || "unknown").replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
  const newStatus = (data.new_status || "unknown").replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

  const statusMessages: Record<string, string> = {
    pending: "Your shipment is awaiting processing.",
    processing: "Your shipment is being prepared for transit.",
    in_transit: "Your shipment is on its way!",
    out_for_delivery: "Your shipment is out for delivery and will arrive soon!",
    delivered: "Your shipment has been delivered successfully! 🎉",
    cancelled: "Your shipment has been cancelled.",
  };
  const message = statusMessages[data.new_status] || `Your shipment status has been updated to ${newStatus}.`;

  // User/subscriber emails
  const recipients = data.subscriber_emails || [];
  if (data.user_email && !recipients.includes(data.user_email)) {
    recipients.push(data.user_email);
  }

  if (recipients.length > 0) {
    const body = `
      <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Shipment Status Update</h2>
      <p style="color:#555;font-size:14px;margin:0 0 20px;">${message}</p>
      
      <div style="background:#f8f9fb;border-radius:8px;padding:16px;margin-bottom:20px;border-left:4px solid #FF4D00;">
        <p style="margin:0 0 8px;font-size:13px;color:#888;">Tracking: <strong style="color:#061043;">${data.tracking_number}</strong></p>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="color:#999;text-decoration:line-through;font-size:14px;">${oldStatus}</span>
          <span style="color:#FF4D00;font-size:18px;">→</span>
          ${statusBadge(data.new_status)}
        </div>
      </div>

      ${data.estimated_delivery ? `<p style="color:#555;font-size:13px;">📅 Estimated Delivery: <strong>${data.estimated_delivery}</strong></p>` : ""}
      
      ${ctaButton("Track Shipment", trackUrl)}
    `;

    for (const email of recipients) {
      emails.push({
        to: email,
        subject: `Shipment Update: ${data.tracking_number} - ${newStatus}`,
        html: emailWrapper("Shipment Status Update", body),
      });
    }
  }

  // Admin email
  const adminBody = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">🔄 Shipment Status Changed</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
      ${infoRow("Tracking Number", `<strong>${data.tracking_number}</strong>`)}
      ${infoRow("Customer", `${data.user_name || "N/A"} (${data.user_email || "N/A"})`)}
      ${infoRow("Old Status", oldStatus)}
      ${infoRow("New Status", statusBadge(data.new_status))}
      ${infoRow("Updated At", new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }))}
    </table>
  `;
  emails.push({
    to: ADMIN_EMAIL,
    subject: `[Admin] Status Update: ${data.tracking_number} → ${newStatus}`,
    html: emailWrapper("Shipment Status Update", adminBody),
  });

  return emails;
}

// ──────────────────────────────────────
// 3. Payment Confirmation
// ──────────────────────────────────────

function buildPaymentConfirmationEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];
  const dashboardUrl = `${SITE_URL}/dashboard/payments`;

  // User email
  if (data.user_email) {
    const body = `
      <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Payment Confirmed! ✅</h2>
      <p style="color:#555;font-size:14px;margin:0 0 20px;">Hi ${data.user_name || "Customer"}, your payment has been received and verified.</p>
      
      <div style="background:#d4edda;border-radius:8px;padding:16px;margin-bottom:20px;text-align:center;">
        <p style="margin:0;color:#155724;font-size:12px;font-weight:600;">AMOUNT PAID</p>
        <p style="margin:4px 0 0;color:#155724;font-size:28px;font-weight:800;">${currencyFormat(data.amount, data.currency)}</p>
      </div>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${infoRow("Invoice Number", data.invoice_number || "N/A")}
        ${infoRow("Tracking Number", data.tracking_number || "N/A")}
        ${infoRow("Payment Method", (data.payment_channel || "Paystack").replace(/\b\w/g, (l: string) => l.toUpperCase()))}
        ${infoRow("Reference", data.reference || "N/A")}
        ${infoRow("Date", new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }))}
        ${infoRow("Status", statusBadge("paid"))}
      </table>

      <p style="color:#555;font-size:13px;">Your shipment is now being processed. You'll receive tracking updates via email.</p>
      ${ctaButton("View Payments", dashboardUrl)}
    `;
    emails.push({
      to: data.user_email,
      subject: `Payment Confirmed - ${data.invoice_number || data.tracking_number}`,
      html: emailWrapper("Payment Confirmation", body),
    });
  }

  // Admin email
  const adminBody = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">💰 Payment Received</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
      ${infoRow("Customer", `${data.user_name || "N/A"} (${data.user_email || "N/A"})`)}
      ${infoRow("Amount", `<strong>${currencyFormat(data.amount, data.currency)}</strong>`)}
      ${infoRow("Invoice", data.invoice_number || "N/A")}
      ${infoRow("Tracking", data.tracking_number || "N/A")}
      ${infoRow("Payment Method", data.payment_channel || "Paystack")}
      ${infoRow("Reference", data.reference || "N/A")}
      ${infoRow("Time", new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }))}
    </table>
  `;
  emails.push({
    to: ADMIN_EMAIL,
    subject: `[Admin] Payment: ${currencyFormat(data.amount, data.currency)} - ${data.invoice_number || "N/A"}`,
    html: emailWrapper("Payment Received", adminBody),
  });

  return emails;
}

// ──────────────────────────────────────
// 4. Wallet Top-up
// ──────────────────────────────────────

function buildWalletTopupEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];

  // User confirmation
  if (data.user_email) {
    const body = `
      <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Wallet Funded Successfully! 💳</h2>
      <p style="color:#555;font-size:14px;margin:0 0 20px;">Hi ${data.user_name || "Customer"}, your wallet has been credited.</p>
      
      <div style="background:#d4edda;border-radius:8px;padding:16px;margin-bottom:20px;text-align:center;">
        <p style="margin:0;color:#155724;font-size:12px;font-weight:600;">AMOUNT CREDITED</p>
        <p style="margin:4px 0 0;color:#155724;font-size:28px;font-weight:800;">${currencyFormat(data.amount)}</p>
      </div>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${infoRow("Reference", data.reference || "N/A")}
        ${infoRow("Date", new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }))}
      </table>
      
      ${ctaButton("View Wallet", `${SITE_URL}/dashboard/wallet`)}
    `;
    emails.push({
      to: data.user_email,
      subject: `Wallet Top-up Confirmed - ${currencyFormat(data.amount)}`,
      html: emailWrapper("Wallet Top-up", body),
    });
  }

  // Admin notification
  const adminBody = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">💳 Wallet Top-up</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
      ${infoRow("Customer", `${data.user_name || "N/A"} (${data.user_email || "N/A"})`)}
      ${infoRow("Amount", `<strong>${currencyFormat(data.amount)}</strong>`)}
      ${infoRow("Reference", data.reference || "N/A")}
      ${infoRow("Time", new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }))}
    </table>
  `;
  emails.push({
    to: ADMIN_EMAIL,
    subject: `[Admin] Wallet Top-up: ${currencyFormat(data.amount)} by ${data.user_name || data.user_email || "User"}`,
    html: emailWrapper("Wallet Top-up Alert", adminBody),
  });

  return emails;
}

// ──────────────────────────────────────
// 5. Contact / Support Message
// ──────────────────────────────────────

function buildContactMessageEmails(data: Record<string, any>): EmailPayload[] {
  const adminBody = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">📩 New Contact Message</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
      ${infoRow("From", `${data.name || "N/A"} (${data.email || "N/A"})`)}
      ${data.phone ? infoRow("Phone", data.phone) : ""}
      ${infoRow("Subject", data.subject || "General Inquiry")}
      ${infoRow("Time", new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }))}
    </table>
    <div style="background:#f8f9fb;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:600;">MESSAGE</p>
      <p style="margin:0;color:#1a1a2e;font-size:14px;line-height:1.6;white-space:pre-wrap;">${data.message || "No message content"}</p>
    </div>
    <p style="color:#888;font-size:12px;">Reply directly to this person at: <a href="mailto:${data.email}" style="color:#FF4D00;">${data.email}</a></p>
  `;

  return [{
    to: ADMIN_EMAIL,
    subject: `[Contact] ${data.subject || "New Message"} from ${data.name || data.email || "Visitor"}`,
    html: emailWrapper("Contact Message", adminBody),
  }];
}
