import { describe, expect, it } from "vitest";

import {
  buildExchangeRates,
  convertAmount,
  formatMoney,
  formatUsdForDisplay,
  normalizeCurrency,
  resolveGatewayCurrency,
  roundCurrencyAmount,
} from "@/lib/currency";

describe("currency helpers", () => {
  const rates = buildExchangeRates({
    USD: 1,
    GBP: 0.8,
    NGN: 1600,
    CNY: 7.2,
    EUR: 0.9,
  });

  it("converts between supported currencies using the provided rates", () => {
    expect(convertAmount(80, "GBP", "USD", rates)).toBe(100);
    expect(convertAmount(100, "USD", "NGN", rates)).toBe(160000);
    expect(convertAmount(720, "CNY", "EUR", rates)).toBe(90);
  });

  it("falls back to USD when an unsupported currency is provided", () => {
    expect(normalizeCurrency("CAD")).toBe("USD");
    expect(convertAmount(50, "CAD", "GBP", rates)).toBe(40);
  });

  it("returns the gateway-supported currency or the default for that gateway", () => {
    expect(resolveGatewayCurrency("paystack", "GBP")).toBe("NGN");
    expect(resolveGatewayCurrency("paystack", "NGN")).toBe("NGN");
    expect(resolveGatewayCurrency("stripe", "GBP")).toBe("GBP");
  });

  it("rounds currency values to 2 decimal places", () => {
    expect(roundCurrencyAmount(12.345)).toBe(12.35);
    expect(roundCurrencyAmount(12.344)).toBe(12.34);
  });

  it("formats display values in USD", () => {
    expect(formatUsdForDisplay(100, "NGN")).toContain("$");
    expect(formatMoney(2500, "NGN")).toContain("$");
  });
});