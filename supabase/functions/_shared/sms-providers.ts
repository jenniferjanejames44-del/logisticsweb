// SMS provider abstraction for the RAC Logistics SMS Management System.
// Adapters are implemented strictly from official provider documentation:
// - Termii: https://developers.termii.com/messaging-api , https://developer.termii.com/balance
// - BulkSMS Nigeria: https://www.bulksmsnigeria.com/api
// No endpoints, headers, or payloads beyond those documented are used.

export interface SmsProviderConfig {
  provider_key: string;
  api_key: string | null;
  sender_id: string | null;
  base_url: string;
}

export interface SendResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
  raw?: unknown;
}

export interface BalanceResult {
  supported: boolean;
  balance?: number;
  currency?: string;
  error?: string;
}

export interface StatusResult {
  supported: boolean;
  status?: string;
  error?: string;
}

export interface SmsProvider {
  readonly key: string;
  readonly capabilities: {
    send: boolean;
    bulkSend: boolean; // native multi-recipient submit
    balance: boolean;
    status: boolean; // per-message delivery status lookup
  };
  sendSms(to: string | string[], body: string, messageType: "transactional" | "marketing"): Promise<SendResult>;
  getBalance(): Promise<BalanceResult>;
  getStatus(providerMessageId: string): Promise<StatusResult>;
  testConnection(): Promise<{ ok: boolean; error?: string }>;
}

/** Normalize international numbers and Nigerian local mobile numbers for SMS. */
export function normalizePhone(raw: string): string {
  const digits = (raw || "").replace(/[^\d]/g, "");
  if (/^0[789]\d{9}$/.test(digits)) return `234${digits.slice(1)}`;
  if (digits.startsWith("00")) return digits.slice(2);
  return digits;
}

function baseUrl(config: SmsProviderConfig): string {
  return (config.base_url || "").replace(/\/+$/, "");
}

class TermiiSmsProvider implements SmsProvider {
  readonly key = "termii";
  readonly capabilities = { send: true, bulkSend: true, balance: true, status: true };

  constructor(private config: SmsProviderConfig) {}

  async sendSms(to: string | string[], body: string, messageType: "transactional" | "marketing"): Promise<SendResult> {
    if (!this.config.api_key) return { ok: false, error: "Termii API key is not configured" };
    if (!this.config.sender_id) return { ok: false, error: "Termii sender ID is not configured" };
    const recipients = (Array.isArray(to) ? to : [to]).map(normalizePhone).filter(Boolean);
    if (recipients.length === 0) return { ok: false, error: "No valid recipient phone numbers" };
    if (recipients.length > 100) return { ok: false, error: "Termii accepts at most 100 recipients per request" };

    // Documented channel mapping: generic = promotional/marketing, dnd = transactional.
    const payload = {
      api_key: this.config.api_key,
      to: Array.isArray(to) ? recipients : recipients[0],
      from: this.config.sender_id,
      sms: body,
      type: "plain",
      channel: messageType === "marketing" ? "generic" : "dnd",
    };

    try {
      const res = await fetch(`${baseUrl(this.config)}/api/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { /* keep raw text */ }
      if (!res.ok) {
        return { ok: false, error: `Termii HTTP ${res.status}: ${text.slice(0, 300)}`, raw: data ?? text };
      }
      const messageId = data?.message_id ?? data?.messageId ?? null;
      const okFlag = messageId || /success/i.test(String(data?.message ?? ""));
      if (!okFlag) {
        return { ok: false, error: `Termii rejected the message: ${text.slice(0, 300)}`, raw: data ?? text };
      }
      return { ok: true, providerMessageId: messageId ? String(messageId) : undefined, raw: data };
    } catch (err) {
      return { ok: false, error: `Termii request failed: ${(err as Error).message}` };
    }
  }

  async getBalance(): Promise<BalanceResult> {
    if (!this.config.api_key) return { supported: true, error: "Termii API key is not configured" };
    try {
      const res = await fetch(`${baseUrl(this.config)}/api/get-balance?api_key=${encodeURIComponent(this.config.api_key)}`);
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { /* keep raw */ }
      if (!res.ok) return { supported: true, error: `Termii HTTP ${res.status}: ${text.slice(0, 300)}` };
      return { supported: true, balance: Number(data?.balance ?? NaN), currency: data?.currency ?? undefined };
    } catch (err) {
      return { supported: true, error: `Termii request failed: ${(err as Error).message}` };
    }
  }

  async getStatus(providerMessageId: string): Promise<StatusResult> {
    if (!this.config.api_key) return { supported: true, error: "Termii API key is not configured" };
    try {
      const res = await fetch(
        `${baseUrl(this.config)}/api/sms/inbox?api_key=${encodeURIComponent(this.config.api_key)}&message_id=${encodeURIComponent(providerMessageId)}`,
      );
      const text = await res.text();
      if (!res.ok) return { supported: true, error: `Termii HTTP ${res.status}: ${text.slice(0, 300)}` };
      let data: any = null;
      try { data = JSON.parse(text); } catch { /* keep raw */ }
      const status = data?.status ?? data?.data?.status ?? data?.message_status ?? null;
      return status ? { supported: true, status: String(status) } : { supported: true, error: "Status not present in provider response", };
    } catch (err) {
      return { supported: true, error: `Termii request failed: ${(err as Error).message}` };
    }
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    const bal = await this.getBalance();
    return bal.error ? { ok: false, error: bal.error } : { ok: true };
  }
}

class BulkSmsNigeriaProvider implements SmsProvider {
  readonly key = "bulksmsnigeria";
  // Per-message status lookup is not implemented: the documented delivery-reports
  // endpoint is account-level, so we report the capability honestly as unsupported.
  readonly capabilities = { send: true, bulkSend: false, balance: true, status: false };

  constructor(private config: SmsProviderConfig) {}

  async sendSms(to: string | string[], body: string, _messageType: "transactional" | "marketing"): Promise<SendResult> {
    if (!this.config.api_key) return { ok: false, error: "BulkSMS Nigeria API token is not configured" };
    if (!this.config.sender_id) return { ok: false, error: "BulkSMS Nigeria sender ID is not configured" };
    const recipients = (Array.isArray(to) ? to : [to]).map(normalizePhone).filter(Boolean);
    if (recipients.length === 0) return { ok: false, error: "No valid recipient phone numbers" };

    // Documented single-send endpoint; service layer loops for multiple recipients.
    const results: SendResult[] = [];
    for (const phone of recipients) {
      try {
        const res = await fetch(`${baseUrl(this.config)}/sms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${this.config.api_key}`,
          },
          body: JSON.stringify({ from: this.config.sender_id, to: phone, body, gateway: "international" }),
        });
        const text = await res.text();
        let data: any = null;
        try { data = JSON.parse(text); } catch { /* keep raw */ }
        if (!res.ok) {
          results.push({ ok: false, error: `BulkSMS Nigeria HTTP ${res.status}: ${text.slice(0, 300)}`, raw: data ?? text });
        } else if (data && (data.status === "error" || data.error)) {
          results.push({ ok: false, error: `BulkSMS Nigeria error: ${text.slice(0, 300)}`, raw: data });
        } else {
          const id = data?.data?.id ?? data?.data?.message_id ?? data?.message_id ?? null;
          results.push({ ok: true, providerMessageId: id ? String(id) : undefined, raw: data });
        }
      } catch (err) {
        results.push({ ok: false, error: `BulkSMS Nigeria request failed: ${(err as Error).message}` });
      }
    }

    const failed = results.filter((r) => !r.ok);
    if (failed.length === results.length) {
      return { ok: false, error: failed[0].error, raw: results.map((r) => r.raw) };
    }
    return {
      ok: true,
      providerMessageId: results.find((r) => r.providerMessageId)?.providerMessageId,
      error: failed.length ? `${failed.length}/${results.length} recipients failed: ${failed[0].error}` : undefined,
      raw: results.map((r) => r.raw),
    };
  }

  async getBalance(): Promise<BalanceResult> {
    if (!this.config.api_key) return { supported: true, error: "BulkSMS Nigeria API token is not configured" };
    try {
      const res = await fetch(`${baseUrl(this.config)}/balance`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${this.config.api_key}` },
      });
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { /* keep raw */ }
      if (!res.ok) return { supported: true, error: `BulkSMS Nigeria HTTP ${res.status}: ${text.slice(0, 300)}` };
      const balance = data?.data?.balance ?? data?.balance ?? NaN;
      const currency = data?.data?.currency ?? data?.currency ?? "NGN";
      return { supported: true, balance: Number(balance), currency };
    } catch (err) {
      return { supported: true, error: `BulkSMS Nigeria request failed: ${(err as Error).message}` };
    }
  }

  async getStatus(_providerMessageId: string): Promise<StatusResult> {
    return { supported: false, error: "Not supported by this provider" };
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    const bal = await this.getBalance();
    return bal.error ? { ok: false, error: bal.error } : { ok: true };
  }
}

export function resolveSmsProviderConfig(config: SmsProviderConfig): SmsProviderConfig {
  // Fall back to securely stored secrets when the provider record has no key,
  // so credentials never have to live in the database.
  if (!config.api_key) {
    const secretName =
      config.provider_key === "termii" ? "TERMII_API_KEY" :
      config.provider_key === "bulksmsnigeria" ? "BULKSMS_NIGERIA_API_TOKEN" : null;
    const runtime = globalThis as typeof globalThis & { Deno?: { env: { get(name: string): string | undefined } } };
    const secretValue = secretName ? runtime.Deno?.env.get(secretName) : undefined;
    if (secretValue) config = { ...config, api_key: secretValue };
  }
  return config;
}

export function hasSmsProviderKey(config: SmsProviderConfig): boolean {
  return Boolean(resolveSmsProviderConfig(config).api_key);
}

export function getSmsProvider(config: SmsProviderConfig): SmsProvider {
  config = resolveSmsProviderConfig(config);
  switch (config.provider_key) {
    case "termii":
      return new TermiiSmsProvider(config);
    case "bulksmsnigeria":
      return new BulkSmsNigeriaProvider(config);
    default:
      throw new Error(`Unknown SMS provider: ${config.provider_key}`);
  }
}

/** Render {{variable}} placeholders in a template body. */
export function renderTemplate(body: string, vars: Record<string, unknown>): string {
  return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key) =>
    vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : "",
  );
}
