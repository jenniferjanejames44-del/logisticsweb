import { afterEach, describe, expect, it, vi } from "vitest";
import { getSmsProvider, hasSmsProviderKey, normalizePhone, resolveSmsProviderConfig } from "../../supabase/functions/_shared/sms-providers";

const config = { provider_key: "termii", api_key: null, sender_id: "RACLOGISTIC", base_url: "https://api.ng.termii.com" };

afterEach(() => vi.unstubAllGlobals());

describe("BulkSMSNigeria delivery route", () => {
  it.each(["transactional", "marketing"] as const)("uses international rather than direct-refund for %s recipients", async (messageType) => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ status: "success", data: { message_id: "test-message" } })));
    vi.stubGlobal("fetch", fetchMock);
    const provider = getSmsProvider({
      provider_key: "bulksmsnigeria", api_key: "synthetic-test-credential",
      sender_id: "RACLOGISTIC", base_url: "https://sms.example.test/api/v2",
    });
    const result = await provider.sendSms(["08000000000", "+2349000000000"], "Route regression test", messageType);
    expect(result.ok).toBe(true);
    expect(result.providerMessageId).toBe("test-message");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [index, call] of fetchMock.mock.calls.entries()) {
      const [url, init] = call as unknown as [string, RequestInit];
      expect(url).toBe("https://sms.example.test/api/v2/sms");
      expect(init.method).toBe("POST");
      expect(JSON.parse(String(init.body))).toEqual({
        from: "RACLOGISTIC", to: ["2348000000000", "2349000000000"][index],
        body: "Route regression test", gateway: "international",
      });
    }
  });
});

describe("SMS phone normalization", () => {
  it("converts Nigerian local mobile numbers to international format", () => {
    expect(normalizePhone("0800 000 0000")).toBe("2348000000000");
    expect(normalizePhone("0900 000 0000")).toBe("2349000000000");
    expect(normalizePhone("0700 000 0000")).toBe("2347000000000");
  });
  it("preserves international numbers and removes their dialling prefix", () => {
    expect(normalizePhone("+234 800 000 0000")).toBe("2348000000000");
    expect(normalizePhone("00234 800 000 0000")).toBe("2348000000000");
    expect(normalizePhone("+44 7700 900000")).toBe("447700900000");
  });
  it("does not invent country codes for incomplete or non-Nigerian local numbers", () => {
    expect(normalizePhone("0800")).toBe("0800");
    expect(normalizePhone("02012345678")).toBe("02012345678");
    expect(normalizePhone("")).toBe("");
  });
  it("sends normalized local recipients to the provider", async () => {
    vi.stubGlobal("Deno", { env: { get: () => "synthetic-test-credential" } });
    let sentRecipients: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
      sentRecipients = JSON.parse(String(init.body)).to;
      return new Response(JSON.stringify({ message_id: "test-message" }));
    }));
    const result = await getSmsProvider(config).sendSms(["08000000000", "09000000000"], "Regression test", "transactional");
    expect(result.ok).toBe(true);
    expect(sentRecipients).toEqual(["2348000000000", "2349000000000"]);
  });
});

describe("SMS secret-backed configuration", () => {
  it("accepts a saved Termii secret with no database key for sending checks", () => {
    vi.stubGlobal("Deno", { env: { get: (name: string) => name === "TERMII_API_KEY" ? "synthetic-test-credential" : undefined } });
    expect(hasSmsProviderKey(config)).toBe(true);
    expect(config.api_key).toBeNull();
  });

  it("rejects a provider when both database and secret configuration are absent", () => {
    vi.stubGlobal("Deno", { env: { get: () => undefined } });
    expect(hasSmsProviderKey(config)).toBe(false);
  });

  it("preserves existing database configuration", () => {
    vi.stubGlobal("Deno", { env: { get: () => undefined } });
    expect(hasSmsProviderKey({ ...config, api_key: "synthetic-legacy-credential" })).toBe(true);
  });

  it("uses the same secret resolution when sending to Termii", async () => {
    vi.stubGlobal("Deno", { env: { get: (name: string) => name === "TERMII_API_KEY" ? "synthetic-test-credential" : undefined } });
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const payload = JSON.parse(String(init.body));
      const authorized = payload.api_key === resolveSmsProviderConfig(config).api_key;
      return new Response(JSON.stringify(authorized ? { message_id: "test-message" } : { message: "Unauthorized" }), { status: authorized ? 200 : 401 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await getSmsProvider(config).sendSms("2348000000000", "Regression test", "transactional");
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("does not use the Termii secret for another provider", () => {
    vi.stubGlobal("Deno", { env: { get: (name: string) => name === "TERMII_API_KEY" ? "synthetic-test-credential" : undefined } });
    expect(hasSmsProviderKey({ ...config, provider_key: "bulksmsnigeria" })).toBe(false);
  });
});