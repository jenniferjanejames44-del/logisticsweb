import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your email',
  invite: "You've been invited",
  magiclink: 'Your login link',
  recovery: 'Reset your password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

// Configuration
const SITE_NAME = "Raclogistics Limited"
const ROOT_DOMAIN = "www.raclogisticltd.com"
const TARGET_ORIGIN = `https://${ROOT_DOMAIN}`
const AUTH_CALLBACK_PATH = '/auth/callback'

const DEFAULT_PATH_BY_TYPE: Record<string, string> = {
  signup: '/auth',
  invite: '/auth',
  recovery: '/reset-password',
  magiclink: '/dashboard',
  email_change: '/dashboard/profile',
  email: '/auth',
}

function isTrustedHost(hostname: string): boolean {
  return hostname === ROOT_DOMAIN || hostname === ROOT_DOMAIN.replace('www.', '')
}

function getCombinedParam(url: URL, key: string): string | null {
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
  return url.searchParams.get(key) ?? hashParams.get(key)
}

function getSafeReturnPath(candidate: string | null, fallbackPath: string): string {
  if (!candidate) return fallbackPath
  try {
    const parsed = new URL(candidate, TARGET_ORIGIN)
    if (!isTrustedHost(parsed.hostname)) return fallbackPath
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallbackPath
  } catch {
    return candidate.startsWith('/') ? candidate : fallbackPath
  }
}

function rewriteConfirmationUrl(rawUrl: string | undefined, emailType: string): string {
  const fallbackPath = DEFAULT_PATH_BY_TYPE[emailType] ?? '/dashboard'
  const callbackUrl = new URL(AUTH_CALLBACK_PATH, TARGET_ORIGIN)
  callbackUrl.searchParams.set('next', fallbackPath)

  if (!rawUrl) return callbackUrl.toString()

  try {
    const parsed = new URL(rawUrl)
    const nextPath = getSafeReturnPath(
      getCombinedParam(parsed, 'next') ?? getCombinedParam(parsed, 'redirect_to'),
      fallbackPath,
    )
    callbackUrl.searchParams.set('next', nextPath)
    callbackUrl.searchParams.set('redirect_to', new URL(nextPath, TARGET_ORIGIN).toString())

    for (const key of ['token_hash', 'type', 'access_token', 'refresh_token', 'code']) {
      const value = getCombinedParam(parsed, key)
      if (value) callbackUrl.searchParams.set(key, value)
    }

    if (!callbackUrl.searchParams.has('type')) {
      callbackUrl.searchParams.set('type', emailType)
    }

    return callbackUrl.toString()
  } catch {
    return callbackUrl.toString()
  }
}

/**
 * Send email directly via Resend API
 */
async function sendViaResend(params: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${SITE_NAME} <no-reply@raclogisticltd.com>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    })

    if (!res.ok) {
      const errorBody = await res.text()
      console.error('Resend API error', { status: res.status, body: errorBody })
      return { success: false, error: `Resend API error: ${res.status}` }
    }

    const data = await res.json()
    console.log('Email sent via Resend', { id: data.id })
    return { success: true }
  } catch (error) {
    console.error('Failed to send via Resend', { error })
    return { success: false, error: error.message }
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Handle Supabase Auth webhook
  try {
    const payload = await req.json()
    console.log('Received auth webhook payload', JSON.stringify(payload).substring(0, 500))

    // Supabase Auth Hook format: { user, email_data }
    // email_data contains: token_hash, redirect_to, email_action_type, token, site_url, hashed_token
    const emailData = payload.email_data || payload
    const user = payload.user || {}

    const emailType = emailData.email_action_type || emailData.action_type || emailData.type || 'signup'
    const recipientEmail = user.email || emailData.email || emailData.to
    const tokenHash = emailData.token_hash || emailData.token
    const redirectTo = emailData.redirect_to || emailData.redirect_url || emailData.url

    console.log('Processing auth email', { emailType, recipientEmail })

    const EmailTemplate = EMAIL_TEMPLATES[emailType]
    if (!EmailTemplate) {
      console.error('Unknown email type', { emailType })
      return new Response(
        JSON.stringify({ error: `Unknown email type: ${emailType}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build the confirmation URL pointing to our custom domain
    let confirmationUrl: string

    if (tokenHash) {
      // Build the confirmation URL with the token
      const callbackUrl = new URL(AUTH_CALLBACK_PATH, TARGET_ORIGIN)
      const fallbackPath = DEFAULT_PATH_BY_TYPE[emailType] ?? '/dashboard'
      callbackUrl.searchParams.set('next', fallbackPath)
      callbackUrl.searchParams.set('token_hash', tokenHash)
      callbackUrl.searchParams.set('type', emailType)

      if (redirectTo) {
        const nextPath = getSafeReturnPath(redirectTo, fallbackPath)
        callbackUrl.searchParams.set('next', nextPath)
      }

      confirmationUrl = callbackUrl.toString()
    } else if (redirectTo) {
      confirmationUrl = rewriteConfirmationUrl(redirectTo, emailType)
    } else {
      const fallbackPath = DEFAULT_PATH_BY_TYPE[emailType] ?? '/dashboard'
      const callbackUrl = new URL(AUTH_CALLBACK_PATH, TARGET_ORIGIN)
      callbackUrl.searchParams.set('next', fallbackPath)
      callbackUrl.searchParams.set('type', emailType)
      confirmationUrl = callbackUrl.toString()
    }

    console.log('Built confirmation URL', { confirmationUrl })

    // Build template props
    const templateProps = {
      siteName: SITE_NAME,
      siteUrl: TARGET_ORIGIN,
      recipient: recipientEmail,
      confirmationUrl,
      token: emailData.token,
      email: recipientEmail,
      newEmail: emailData.new_email,
    }

    // Render templates
    const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
    const text = await renderAsync(React.createElement(EmailTemplate, templateProps), {
      plainText: true,
    })

    // Send via Resend
    const result = await sendViaResend({
      to: recipientEmail,
      subject: EMAIL_SUBJECTS[emailType] || 'Notification',
      html,
      text,
    })

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Auth email hook error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
