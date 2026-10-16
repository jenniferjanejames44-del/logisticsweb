import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendQuotationEmail } from "./quotationEmail";

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke } } }));

describe("quotation email sending", () => {
  beforeEach(() => invoke.mockReset());

  it("sends the saved quotation ID and only accepts a confirmed enqueue", async () => {
    invoke.mockResolvedValue({ data: { success: true, queued: true, messageId: "quotation-test" }, error: null });
    await expect(sendQuotationEmail("saved-quotation")).resolves.toMatchObject({ queued: true });
    expect(invoke).toHaveBeenCalledWith("send-quotation-email", { body: { quotation_id: "saved-quotation" } });
  });

  it("rejects an unconfirmed send", async () => {
    invoke.mockResolvedValue({ data: {}, error: null });
    await expect(sendQuotationEmail("saved-quotation")).rejects.toThrow("not queued");
  });

  it("reports the actual sending error", async () => {
    invoke.mockResolvedValue({ data: null, error: { context: { json: async () => ({ error: "Customer email is missing" }) } } });
    await expect(sendQuotationEmail("saved-quotation")).rejects.toThrow("Customer email is missing");
  });

  it("handles unreadable network errors without crashing", async () => {
    invoke.mockResolvedValue({ data: null, error: { context: { json: async () => { throw new Error("Network failure"); } } } });
    await expect(sendQuotationEmail("saved-quotation")).rejects.toThrow("Unable to send");
  });
});