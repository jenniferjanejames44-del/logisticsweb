const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://www.raclogisticltd.com";
const ALLOWED_HOSTNAMES = new Set(["raclogisticltd.com", "www.raclogisticltd.com"]);

function getDefaultRedirectPath(emailActionType: string): string {
  switch (emailActionType) {
    case "recovery":
      return "/reset-password";
    case "magiclink":
      return "/dashboard";
    case "email_change":
      return "/dashboard/profile";
    case "invite":
      return "/auth";
    case "signup":
    default:
      return "/auth";
  }
}

function sanitizeRedirectTarget(redirectTo: string | undefined, emailActionType: string): string {
  const fallbackUrl = new URL(getDefaultRedirectPath(emailActionType), SITE_URL).toString();

  if (!redirectTo) {
    return fallbackUrl;
  }

  try {
    const url = new URL(redirectTo, SITE_URL);

    if (!ALLOWED_HOSTNAMES.has(url.hostname)) {
      return new URL(`${url.pathname}${url.search}${url.hash}`, SITE_URL).toString();
    }

    return url.toString();
  } catch {
    return fallbackUrl;
  }
}

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
  <tr>
    <td style="background:linear-gradient(135deg,#061043,#0a1a6e);padding:28px 30px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">🚚 RAC LOGISTICS LTD</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">Premier Global Logistics Solutions</p>
    </td>
  </tr>
  <tr>
    <td style="padding:30px;">
      ${bodyContent}
    </td>
  </tr>
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

function buildConfirmSignupEmail(confirmationUrl: string, email: string): { subject: string; html: string } {
  const body = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Verify Your Email Address ✉️</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px;">Welcome to RAC Logistics! Please verify your email address to activate your account.</p>
    
    <p style="color:#555;font-size:14px;margin:0 0 8px;">Click the button below to confirm your email:</p>
    
    <div style="text-align:center;margin:24px 0;">
      <a href="${confirmationUrl}" style="display:inline-block;background:#FF4D00;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px;">Verify My Email</a>
    </div>
    
    <p style="color:#888;font-size:12px;margin:20px 0 0;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="color:#FF4D00;font-size:12px;word-break:break-all;margin:4px 0 0;">${confirmationUrl}</p>
    
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="color:#888;font-size:12px;">If you didn't create an account with RAC Logistics, you can safely ignore this email.</p>
  `;
  return {
    subject: "Verify Your Email - RAC Logistics",
    html: emailWrapper("Email Verification", body),
  };
}

function buildRecoveryEmail(confirmationUrl: string, email: string): { subject: string; html: string } {
  const body = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Reset Your Password 🔐</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px;">We received a request to reset your password for your RAC Logistics account.</p>
    
    <p style="color:#555;font-size:14px;margin:0 0 8px;">Click the button below to set a new password:</p>
    
    <div style="text-align:center;margin:24px 0;">
      <a href="${confirmationUrl}" style="display:inline-block;background:#FF4D00;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px;">Reset Password</a>
    </div>
    
    <p style="color:#888;font-size:12px;margin:20px 0 0;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="color:#FF4D00;font-size:12px;word-break:break-all;margin:4px 0 0;">${confirmationUrl}</p>
    
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="color:#888;font-size:12px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  `;
  return {
    subject: "Reset Your Password - RAC Logistics",
    html: emailWrapper("Password Reset", body),
  };
}

function buildMagicLinkEmail(confirmationUrl: string, email: string): { subject: string; html: string } {
  const body = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Sign In to RAC Logistics 🔗</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px;">Click the link below to sign in to your account:</p>
    
    <div style="text-align:center;margin:24px 0;">
      <a href="${confirmationUrl}" style="display:inline-block;background:#FF4D00;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px;">Sign In</a>
    </div>
    
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="color:#888;font-size:12px;">If you didn't request this link, you can safely ignore this email.</p>
  `;
  return {
    subject: "Sign In Link - RAC Logistics",
    html: emailWrapper("Magic Link", body),
  };
}

function buildEmailChangeEmail(confirmationUrl: string, email: string): { subject: string; html: string } {
  const body = `
    <h2 style="margin:0 0 8px;color:#061043;font-size:20px;">Confirm Email Change ✉️</h2>
    <p style="color:#555;font-size:14px;margin:0 0 20px;">You requested to change your email address. Please confirm this change:</p>
    
    <div style="text-align:center;margin:24px 0;">
      <a href="${confirmationUrl}" style="display:inline-block;background:#FF4D00;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px;">Confirm Email Change</a>
    </div>
    
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="color:#888;font-size:12px;">If you didn't request this change, please contact support immediately.</p>
  `;
  return {
    subject: "Confirm Email Change - RAC Logistics",
    html: emailWrapper("Email Change", body),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured for auth-email-hook");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    
    // Supabase Auth webhook sends: { user, email_data }
    // email_data contains: { token, token_hash, redirect_to, email_action_type, site_url }
    const user = payload.user;
    const emailData = payload.email_data;
    
    if (!user || !emailData) {
      console.error("Invalid auth webhook payload:", JSON.stringify(payload).substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email = user.email;
    const emailActionType = emailData.email_action_type;
    const tokenHash = emailData.token_hash;
    const redirectTo = sanitizeRedirectTarget(emailData.redirect_to, emailActionType);

    if (!tokenHash) {
      return new Response(
        JSON.stringify({ error: "Missing token hash" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Build the confirmation URL using the token_hash
    // Supabase expects: {site_url}/auth/confirm?token_hash={hash}&type={type}&next={redirect_to}
    let confirmationType = "signup";
    switch (emailActionType) {
      case "signup":
        confirmationType = "signup";
        break;
      case "recovery":
        confirmationType = "recovery";
        break;
      case "magiclink":
        confirmationType = "magiclink";
        break;
      case "email_change":
        confirmationType = "email_change";
        break;
      case "invite":
        confirmationType = "invite";
        break;
    }

    const confirmationUrl = `${SITE_URL}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(confirmationType)}&next=${encodeURIComponent(redirectTo)}`;

    // Build email based on type
    let emailContent: { subject: string; html: string };
    
    switch (emailActionType) {
      case "signup":
        emailContent = buildConfirmSignupEmail(confirmationUrl, email);
        break;
      case "recovery":
        emailContent = buildRecoveryEmail(confirmationUrl, email);
        break;
      case "magiclink":
        emailContent = buildMagicLinkEmail(confirmationUrl, email);
        break;
      case "email_change":
        emailContent = buildEmailChangeEmail(confirmationUrl, email);
        break;
      default:
        emailContent = buildConfirmSignupEmail(confirmationUrl, email);
        break;
    }

    // Send via Resend
    const fromAddress = "RAC Logistics <no-reply@raclogisticltd.com>";
    
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend auth email error:", JSON.stringify(result));
      return new Response(
        JSON.stringify({ error: "Failed to send auth email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Auth email sent: type=${emailActionType}, to=${email}, resend_id=${result.id}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("auth-email-hook error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
