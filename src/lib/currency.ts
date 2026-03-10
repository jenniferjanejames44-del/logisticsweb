export const BASE_CURRENCY = "USD" as const;

export const SUPPORTED_CURRENCIES = ["USD", "GBP", "NGN", "CNY", "EUR"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export type ExchangeRates = Record<SupportedCurrency, number>;

export const EXCHANGE_RATE_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
export const CURRENCY_STORAGE_KEY = "rac:selected-currency";
export const CURRENCY_CONTEXT_CACHE_KEY = "rac:currency-context";

export const FALLBACK_EXCHANGE_RATES: ExchangeRates = {
  USD: 1,
  GBP: 0.79,
  NGN: 1600,
  CNY: 7.2,
  EUR: 0.92,
};

export const CURRENCY_META: Record<SupportedCurrency, { code: SupportedCurrency; label: string; locale: string; symbol: string }> = {
  USD: { code: "USD", label: "US Dollar", locale: "en-US", symbol: "$" },
  GBP: { code: "GBP", label: "British Pound", locale: "en-GB", symbol: "£" },
  NGN: { code: "NGN", label: "Nigerian Naira", locale: "en-NG", symbol: "₦" },
  CNY: { code: "CNY", label: "Chinese Yuan", locale: "zh-CN", symbol: "¥" },
  EUR: { code: "EUR", label: "Euro", locale: "de-DE", symbol: "€" },
};

export const PAYMENT_GATEWAY_SUPPORTED_CURRENCIES = {
  paystack: ["NGN"] as const,
  stripe: ["USD", "GBP"] as const,
};

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === "string" && SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);
}

export function normalizeCurrency(value?: string | null): SupportedCurrency {
  return isSupportedCurrency(value) ? value : BASE_CURRENCY;
}

export function buildExchangeRates(rates?: Partial<Record<string, number>> | null): ExchangeRates {
  return SUPPORTED_CURRENCIES.reduce((acc, currency) => {
    const rate = rates?.[currency];
    acc[currency] = typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? rate : FALLBACK_EXCHANGE_RATES[currency];
    return acc;
  }, {} as ExchangeRates);
}

export function roundCurrencyAmount(value: number) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

export function convertAmount(
  amount: number,
  fromCurrency: string | null | undefined,
  toCurrency: SupportedCurrency,
  rates: Partial<ExchangeRates> = FALLBACK_EXCHANGE_RATES,
) {
  const from = normalizeCurrency(fromCurrency);
  const safeRates = buildExchangeRates(rates);
  const numericAmount = Number(amount || 0);

  if (!Number.isFinite(numericAmount)) return 0;
  if (from === toCurrency) return roundCurrencyAmount(numericAmount);

  const amountInUsd = numericAmount / safeRates[from];
  return roundCurrencyAmount(amountInUsd * safeRates[toCurrency]);
}

export function convertFromUsd(amount: number, toCurrency: SupportedCurrency, rates: Partial<ExchangeRates> = FALLBACK_EXCHANGE_RATES) {
  return convertAmount(amount, BASE_CURRENCY, toCurrency, rates);
}

export function formatMoney(
  amount: number,
  currency: string | null | undefined,
  options: Intl.NumberFormatOptions = {},
) {
  const normalized = normalizeCurrency(currency);
  const meta = CURRENCY_META[normalized];

  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: normalized,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatUsdForDisplay(
  amount: number,
  displayCurrency: SupportedCurrency,
  rates: Partial<ExchangeRates> = FALLBACK_EXCHANGE_RATES,
  options: Intl.NumberFormatOptions = {},
) {
  const converted = convertFromUsd(amount, displayCurrency, rates);
  return formatMoney(converted, displayCurrency, options);
}

export function resolveGatewayCurrency(
  gateway: keyof typeof PAYMENT_GATEWAY_SUPPORTED_CURRENCIES,
  preferredCurrency?: string | null,
): SupportedCurrency {
  const supported = PAYMENT_GATEWAY_SUPPORTED_CURRENCIES[gateway];
  const normalized = normalizeCurrency(preferredCurrency);
  return supported.includes(normalized as (typeof supported)[number]) ? normalized : supported[0];
}