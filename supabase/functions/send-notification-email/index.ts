import { createClient } from "npm:@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "info@raclogisticltd.com";
const SITE_URL = "https://www.raclogisticltd.com";
const SENDER_DOMAIN = "notify.raclogisticltd.com";

// ──────────────────────────────────────
// Role-based FROM addresses
// ──────────────────────────────────────
function getFromAddress(role: "info" | "support" | "billing" | "no-reply"): string {
  const map: Record<string, string> = {
    "info": "RAC Logistics <info@raclogisticltd.com>",
    "support": "RAC Support <info@raclogisticltd.com>",
    "billing": "RAC Billing <info@raclogisticltd.com>",
    "no-reply": "RAC Logistics <info@raclogisticltd.com>",
  };
  return map[role] || "RAC Logistics <info@raclogisticltd.com>";
}

// ──────────────────────────────────────
// Email type → sender role mapping
// ──────────────────────────────────────

function getSenderRole(type: string): "info" | "support" | "billing" | "no-reply" {
  switch (type) {
    // info@ — general notifications, shipment updates
    case "shipment_created":
    case "shipment_status_update":
    case "account_verified":
    case "partner_application_received":
    case "partner_admin_notification":
    case "partner_approved":
    case "partner_rejected":
      return "info";

    // support@ — tickets and replies
    case "support_ticket_created":
    case "admin_ticket_reply":
    case "contact_message":
      return "support";

    // billing@ — payments and invoices
    case "payment_confirmation":
    case "payment_failed":
    case "wallet_topup":
      return "billing";

    // no-reply@ — OTP, security, system
    case "otp_verification":
    case "security_alert":
    case "login_notification":
      return "no-reply";

    default:
      return "info";
  }
}

interface EmailRequest {
  type: string;
  data: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: "Email service is not configured" }),
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

    const senderRole = getSenderRole(type);
    const fromAddress = getFromAddress(senderRole);
    const emails = buildEmails(type, data);
    const results = [];
    const admin = createClient(supabaseUrl, serviceKey);

    for (const email of emails) {
      const recipients = Array.isArray(email.to) ? email.to : [email.to];
      for (const rawRecipient of recipients) {
        const recipient = String(rawRecipient).trim().toLowerCase();
        if (!recipient || !/.+@.+\..+/.test(recipient)) continue;
        const messageId = `notification-${type}-${crypto.randomUUID()}`;
        const { error } = await admin.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: messageId,
            to: recipient,
            from: email.from || fromAddress,
            sender_domain: SENDER_DOMAIN,
            subject: email.subject,
            html: email.html,
            text: email.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
            purpose: "transactional",
            label: type,
            idempotency_key: messageId,
            queued_at: new Date().toISOString(),
          },
        });
        results.push({ to: recipient, success: !error, error: error?.message });
        await admin.from("email_send_log").insert({
          message_id: messageId,
          template_name: type,
          recipient_email: recipient,
          status: error ? "failed" : "pending",
          error_message: error?.message || null,
          metadata: { subject: email.subject },
        });
      }
    }

    return new Response(
      JSON.stringify({ success: results.length > 0 && results.every((result) => result.success), results }),
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
  from?: string; // Override per-email if admin emails need different from
}

function buildEmails(type: string, data: Record<string, any>): EmailPayload[] {
  switch (type) {
    case "shipment_created":
      return buildShipmentCreatedEmails(data);
    case "shipment_status_update":
      return buildShipmentStatusUpdateEmails(data);
    case "payment_confirmation":
      return buildPaymentConfirmationEmails(data);
    case "payment_failed":
      return buildPaymentFailedEmails(data);
    case "wallet_topup":
      return buildWalletTopupEmails(data);
    case "contact_message":
      return buildContactMessageEmails(data);
    case "support_ticket_created":
      return buildSupportTicketCreatedEmails(data);
    case "admin_ticket_reply":
      return buildAdminTicketReplyEmails(data);
    case "account_verified":
      return buildAccountVerifiedEmails(data);
    case "login_notification":
      return buildLoginNotificationEmails(data);
    case "partner_application_received":
      return buildPartnerApplicationReceivedEmails(data);
    case "partner_admin_notification":
      return buildPartnerAdminNotificationEmails(data);
    case "partner_approved":
      return buildPartnerApprovedEmails(data);
    case "partner_rejected":
      return buildPartnerRejectedEmails(data);
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
      <p style="margin:0;color:#888;font-size:11px;">info@raclogisticltd.com | www.raclogisticltd.com</p>
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
    open: "#3b82f6",
    in_progress: "#8b5cf6",
    resolved: "#22c55e",
    closed: "#6b7280",
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
// 1. Shipment Created (from: info@)
// ──────────────────────────────────────

function buildShipmentCreatedEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];
  const trackUrl = `${SITE_URL}/track?number=${data.tracking_number}`;
  const timestamp = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

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
// 10. Login Notification (from: no-reply@)
// ──────────────────────────────────────

function buildLoginNotificationEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];
  if (!data.user_email) return emails;

  const when = data.login_time
    ? new Date(data.login_time).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })
    : new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" });

  const body = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">New sign-in to your account</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px;">Hi ${data.user_name || "there"}, we noticed a new sign-in to your RAC Logistics account.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;padding:18px;margin-bottom:20px;">
      <tr><td style="color:#888;font-size:12px;padding:4px 0;">Time</td><td style="color:#061043;font-size:13px;font-weight:600;text-align:right;">${when}</td></tr>
      ${data.device ? `<tr><td style="color:#888;font-size:12px;padding:4px 0;">Device</td><td style="color:#061043;font-size:13px;font-weight:600;text-align:right;">${data.device}</td></tr>` : ""}
      ${data.browser ? `<tr><td style="color:#888;font-size:12px;padding:4px 0;">Browser</td><td style="color:#061043;font-size:13px;font-weight:600;text-align:right;">${data.browser}</td></tr>` : ""}
      ${data.location ? `<tr><td style="color:#888;font-size:12px;padding:4px 0;">Location</td><td style="color:#061043;font-size:13px;font-weight:600;text-align:right;">${data.location}</td></tr>` : ""}
    </table>

    <p style="color:#555;font-size:13px;margin:0 0 20px;">If this was you, no action is needed. If you don't recognise this activity, please reset your password immediately and contact our support team.</p>

    ${ctaButton("Review account security", `${SITE_URL}/dashboard/profile`)}

    <p style="color:#888;font-size:12px;text-align:center;margin-top:20px;">Questions? Reach us at info@raclogisticltd.com</p>
  `;

  emails.push({
    to: data.user_email,
    subject: "New sign-in to your RAC Logistics account",
    html: emailWrapper("Sign-in notification", body),
  });
  return emails;
}

// ──────────────────────────────────────
// 11. Partner Application Received (applicant) (from: info@)
// ──────────────────────────────────────

function buildPartnerApplicationReceivedEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];
  if (!data.applicant_email) return emails;

  const body = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">We've received your partner application 🤝</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px;">Hi ${data.applicant_name || "there"}, thanks for applying to the RAC Logistics Partner Program. Your application is now under review.</p>

    <div style="background:#fff7ed;border-left:4px solid #DF5101;border-radius:6px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;color:#9a3412;font-size:13px;font-weight:600;">What happens next?</p>
      <p style="margin:6px 0 0;color:#7c2d12;font-size:13px;line-height:1.6;">Our team will review your application within 2–3 business days. You'll receive an email as soon as a decision has been made — and if you're approved, your unique referral code and link will be inside.</p>
    </div>

    <p style="color:#555;font-size:14px;margin:0 0 20px;">In the meantime, feel free to explore our services and learn how partners earn commission on every shipment they refer.</p>

    ${ctaButton("Visit RAC Logistics", `${SITE_URL}`)}

    <p style="color:#888;font-size:12px;text-align:center;margin-top:20px;">Questions about the program? Reply to this email or contact info@raclogisticltd.com</p>
  `;

  emails.push({
    to: data.applicant_email,
    subject: "Your RAC Logistics partner application has been received",
    html: emailWrapper("Application received", body),
  });
  return emails;
}

// ──────────────────────────────────────
// 12. Partner Admin Notification (admin) (from: info@)
// ──────────────────────────────────────

function buildPartnerAdminNotificationEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];

  const row = (label: string, value?: string | null) =>
    `<tr><td style="color:#888;font-size:12px;padding:6px 0;width:140px;">${label}</td><td style="color:#061043;font-size:13px;font-weight:600;">${value || '<span style="color:#bbb;font-weight:400;">Not provided</span>'}</td></tr>`;

  const body = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">New partner application 📨</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px;">A new partner application has just been submitted. Review the details below and approve or reject from the admin dashboard.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:8px;padding:18px;margin-bottom:20px;">
      ${row("Full name", data.full_name)}
      ${row("Email", data.email)}
      ${row("Phone", data.phone)}
      ${row("Address", data.address)}
      ${row("City", data.city)}
      ${row("State", data.state)}
      ${row("Country", data.country)}
      ${row("Zip / Postal", data.zip_code)}
      ${row("Business name", data.business_name)}
      ${row("Social / Site", data.social_link)}
    </table>

    ${data.referral_plan ? `
      <p style="color:#888;font-size:12px;margin:0 0 6px;">How they plan to refer customers</p>
      <p style="color:#061043;font-size:13px;background:#f8f9fb;border-radius:6px;padding:12px;margin:0 0 16px;">${data.referral_plan}</p>
    ` : ""}

    ${data.message ? `
      <p style="color:#888;font-size:12px;margin:0 0 6px;">Additional message</p>
      <p style="color:#061043;font-size:13px;background:#f8f9fb;border-radius:6px;padding:12px;margin:0 0 16px;">${data.message}</p>
    ` : ""}

    ${ctaButton("Review in admin dashboard", `${SITE_URL}/admin/partners`)}
  `;

  emails.push({
    to: ADMIN_EMAIL,
    subject: `New partner application: ${data.full_name || data.email || "Unknown applicant"}`,
    html: emailWrapper("New partner application", body),
  });
  return emails;
}

// ──────────────────────────────────────
// 13. Partner Approved (from: info@)
// ──────────────────────────────────────

function buildPartnerApprovedEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];
  if (!data.partner_email || !data.referral_code) return emails;

  const referralLink = `${SITE_URL}/auth?ref=${encodeURIComponent(data.referral_code)}`;
  const dashboardLink = `${SITE_URL}/dashboard/partner`;

  const body = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">You're in! Welcome to the RAC Logistics Partner Program 🎉</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px;">Hi ${data.partner_name || "there"}, congratulations — your partner application has been approved. You can start referring customers and earning commission today.</p>

    <div style="background:#ecfdf5;border-radius:8px;padding:20px;margin-bottom:20px;text-align:center;">
      <p style="margin:0;color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your referral code</p>
      <p style="margin:8px 0 0;color:#061043;font-size:26px;font-weight:800;letter-spacing:2px;">${data.referral_code}</p>
    </div>

    <p style="color:#888;font-size:12px;margin:0 0 6px;">Your unique referral link</p>
    <p style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;color:#061043;font-size:13px;word-break:break-all;margin:0 0 20px;">${referralLink}</p>

    ${ctaButton("Open partner dashboard", dashboardLink)}

    <h3 style="color:#061043;font-size:15px;margin:24px 0 10px;">How to start earning</h3>
    <ol style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;margin:0 0 20px;">
      <li>Share your referral link on WhatsApp, Instagram, X, email, or your website.</li>
      <li>Anyone who signs up through your link is tracked to your partner account.</li>
      <li>Earn commission on every shipment your referrals pay for — automatically.</li>
      <li>Track clicks, signups and earnings in your partner dashboard at any time.</li>
    </ol>

    <p style="color:#888;font-size:12px;text-align:center;margin-top:20px;">Need promotional materials or have a question? Contact info@raclogisticltd.com</p>
  `;

  emails.push({
    to: data.partner_email,
    subject: "🎉 Your RAC Logistics partner account is approved",
    html: emailWrapper("Partner approved", body),
  });
  return emails;
}

// ──────────────────────────────────────
// 14. Partner Rejected (from: info@)
// ──────────────────────────────────────

function buildPartnerRejectedEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];
  if (!data.partner_email) return emails;

  const body = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Update on your partner application</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px;">Hi ${data.partner_name || "there"}, thank you for your interest in the RAC Logistics Partner Program and for taking the time to apply.</p>

    <p style="color:#555;font-size:14px;margin:0 0 20px;">After careful review, we're unable to approve your application at this time. We receive a high volume of applications and unfortunately can't move forward with every one — this isn't a reflection of your potential as a partner.</p>

    <p style="color:#555;font-size:14px;margin:0 0 20px;">You're welcome to reapply in the future as your business grows or your referral channels expand. In the meantime, you can continue using RAC Logistics as a customer for all your shipping needs.</p>

    ${ctaButton("Visit RAC Logistics", `${SITE_URL}`)}

    <p style="color:#888;font-size:12px;text-align:center;margin-top:20px;">Questions? We're happy to help — contact info@raclogisticltd.com</p>
  `;

  emails.push({
    to: data.partner_email,
    subject: "Update on your RAC Logistics partner application",
    html: emailWrapper("Application update", body),
  });
  return emails;
}

// ──────────────────────────────────────
// 2. Shipment Status Update (from: info@)
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
// 3. Payment Confirmation (from: billing@)
// ──────────────────────────────────────

function buildPaymentConfirmationEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];
  const dashboardUrl = `${SITE_URL}/dashboard/payments`;

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
// 4. Payment Failed (from: billing@)
// ──────────────────────────────────────

function buildPaymentFailedEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];

  if (data.user_email) {
    const body = `
      <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Payment Failed ❌</h2>
      <p style="color:#555;font-size:14px;margin:0 0 20px;">Hi ${data.user_name || "Customer"}, unfortunately your payment could not be processed.</p>
      
      <div style="background:#f8d7da;border-radius:8px;padding:16px;margin-bottom:20px;text-align:center;">
        <p style="margin:0;color:#721c24;font-size:12px;font-weight:600;">PAYMENT FAILED</p>
        <p style="margin:4px 0 0;color:#721c24;font-size:28px;font-weight:800;">${currencyFormat(data.amount, data.currency)}</p>
      </div>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${data.tracking_number ? infoRow("Tracking Number", data.tracking_number) : ""}
        ${data.reference ? infoRow("Reference", data.reference) : ""}
        ${infoRow("Date", new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }))}
      </table>

      <p style="color:#555;font-size:13px;">Please try again or use a different payment method. If the issue persists, contact our support team.</p>
      ${ctaButton("Retry Payment", `${SITE_URL}/dashboard/shipments`)}
    `;
    emails.push({
      to: data.user_email,
      subject: `Payment Failed - Action Required`,
      html: emailWrapper("Payment Failed", body),
    });
  }

  const adminBody = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">⚠️ Payment Failed</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
      ${infoRow("Customer", `${data.user_name || "N/A"} (${data.user_email || "N/A"})`)}
      ${infoRow("Amount", `<strong>${currencyFormat(data.amount, data.currency)}</strong>`)}
      ${data.tracking_number ? infoRow("Tracking", data.tracking_number) : ""}
      ${data.reference ? infoRow("Reference", data.reference) : ""}
      ${infoRow("Time", new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }))}
    </table>
  `;
  emails.push({
    to: ADMIN_EMAIL,
    subject: `[Admin] Payment Failed: ${data.user_email || "Unknown"}`,
    html: emailWrapper("Payment Failed Alert", adminBody),
  });

  return emails;
}

// ──────────────────────────────────────
// 5. Wallet Top-up (from: billing@)
// ──────────────────────────────────────

function buildWalletTopupEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];

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
// 6. Contact / Support Message (from: support@)
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

// ──────────────────────────────────────
// 7. Support Ticket Created (from: support@)
// ──────────────────────────────────────

function buildSupportTicketCreatedEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];
  const ticketUrl = `${SITE_URL}/dashboard/support/${data.ticket_id}`;

  if (data.user_email) {
    const body = `
      <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Support Ticket Created 🎫</h2>
      <p style="color:#555;font-size:14px;margin:0 0 20px;">Hi ${data.user_name || "Customer"}, we've received your support request and our team will respond shortly.</p>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${infoRow("Ticket Number", `<strong>${data.ticket_number}</strong>`)}
        ${infoRow("Subject", data.subject || "N/A")}
        ${infoRow("Category", (data.category || "").replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()))}
        ${infoRow("Status", statusBadge("open"))}
        ${infoRow("Created", new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }))}
      </table>

      ${ctaButton("View Your Ticket", ticketUrl)}
      
      <p style="color:#888;font-size:12px;text-align:center;">Our support team typically responds within 24 hours.</p>
    `;
    emails.push({
      to: data.user_email,
      subject: `Support Ticket Created - ${data.ticket_number}`,
      html: emailWrapper("Support Ticket Created", body),
    });
  }

  const adminBody = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">🎫 New Support Ticket</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
      ${infoRow("Ticket Number", `<strong>${data.ticket_number}</strong>`)}
      ${infoRow("Customer", `${data.user_name || "N/A"} (${data.user_email || "N/A"})`)}
      ${infoRow("Subject", data.subject || "N/A")}
      ${infoRow("Category", (data.category || "").replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()))}
      ${infoRow("Created", new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }))}
    </table>
    ${ctaButton("View Ticket", `${SITE_URL}/admin/support/${data.ticket_id}`)}
  `;
  emails.push({
    to: ADMIN_EMAIL,
    subject: `[Admin] New Ticket: ${data.ticket_number} - ${data.subject}`,
    html: emailWrapper("New Support Ticket", adminBody),
  });

  return emails;
}

// ──────────────────────────────────────
// 8. Admin Reply to Ticket (from: support@)
// ──────────────────────────────────────

function buildAdminTicketReplyEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];
  const ticketUrl = `${SITE_URL}/dashboard/support/${data.ticket_id}`;

  if (data.user_email) {
    const body = `
      <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">New Reply on Your Support Ticket 💬</h2>
      <p style="color:#555;font-size:14px;margin:0 0 20px;">Hi ${data.user_name || "Customer"}, our support team has replied to your ticket.</p>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${infoRow("Ticket Number", `<strong>${data.ticket_number}</strong>`)}
        ${infoRow("Subject", data.subject || "N/A")}
      </table>

      <div style="background:#f8f9fb;border-radius:8px;padding:16px;margin-bottom:20px;border-left:4px solid #061043;">
        <p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:600;">ADMIN REPLY</p>
        <p style="margin:0;color:#1a1a2e;font-size:14px;line-height:1.6;white-space:pre-wrap;">${data.reply_message || ""}</p>
      </div>

      ${ctaButton("View & Reply", ticketUrl)}
    `;
    emails.push({
      to: data.user_email,
      subject: `Reply on Ticket ${data.ticket_number} - ${data.subject}`,
      html: emailWrapper("Support Ticket Reply", body),
    });
  }

  return emails;
}

// ──────────────────────────────────────
// 9. Account Verified / Welcome (from: info@)
// ──────────────────────────────────────

function buildAccountVerifiedEmails(data: Record<string, any>): EmailPayload[] {
  const emails: EmailPayload[] = [];

  if (data.user_email) {
    const body = `
      <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Welcome to RAC Logistics! 🎉</h2>
      <p style="color:#555;font-size:14px;margin:0 0 20px;">Hi ${data.user_name || "there"}, your account has been verified and you're all set to start shipping with us.</p>
      
      <div style="background:#e8f5e9;border-radius:8px;padding:20px;margin-bottom:20px;text-align:center;">
        <p style="margin:0;color:#2e7d32;font-size:16px;font-weight:700;">✅ Account Verified</p>
        <p style="margin:8px 0 0;color:#388e3c;font-size:13px;">Your account is now fully active</p>
      </div>

      <h3 style="color:#061043;font-size:16px;margin:20px 0 12px;">Here's what you can do:</h3>
      <ul style="color:#555;font-size:14px;line-height:2;padding-left:20px;">
        <li>Create and track shipments worldwide</li>
        <li>Get instant shipping quotes</li>
        <li>Manage invoices and payments</li>
        <li>Access 24/7 customer support</li>
      </ul>

      ${ctaButton("Go to Dashboard", `${SITE_URL}/dashboard`)}
      
      <p style="color:#888;font-size:12px;text-align:center;">Need help getting started? Contact us at info@raclogisticltd.com</p>
    `;
    emails.push({
      to: data.user_email,
      subject: `Welcome to RAC Logistics - Account Verified!`,
      html: emailWrapper("Welcome to RAC Logistics", body),
    });
  }

  return emails;
}
