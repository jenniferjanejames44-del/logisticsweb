import { afterEach, describe, expect, it, vi } from "vitest";
import { getSmsProvider, hasSmsProviderKey, resolveSmsProviderConfig } from "../../supabase/functions/_shared/sms-providers";

const config = { provider_key: "termii", api_key: null, sender_id: "RACLOGISTIC", base_url: "https://api.ng.termii.com" };

afterEach(() => vi.unstubAllGlobals());

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