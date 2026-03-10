export const BASE_CURRENCY = "USD" as const;
export const SUPPORTED_CURRENCIES = ["USD", "GBP", "NGN", "CNY", "EUR"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export type ExchangeRates = Record<SupportedCurrency, number>;

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

const FALLBACK_EXCHANGE_RATES: ExchangeRates = {
  USD: 1,
  GBP: 0.79,
  NGN: 1600,
  CNY: 7.2,
  EUR: 0.92,
};

const EU_COUNTRY_CODES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

const PAYMENT_GATEWAY_SUPPORTED_CURRENCIES = {
  paystack: ["NGN"] as const,
  stripe: ["USD", "GBP"] as const,
};

let exchangeRateCache: { fetchedAt: number; rates: ExchangeRates; source: string } | null = null;
const geoCache = new Map<string, { expiresAt: number; countryCode: string | null; countryName: string | null; currency: SupportedCurrency; source: string }>();

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

export function resolveGatewayCurrency(
  gateway: keyof typeof PAYMENT_GATEWAY_SUPPORTED_CURRENCIES,
  preferredCurrency?: string | null,
): SupportedCurrency {
  const supported = PAYMENT_GATEWAY_SUPPORTED_CURRENCIES[gateway];
  const normalized = normalizeCurrency(preferredCurrency);
  return supported.includes(normalized as (typeof supported)[number]) ? normalized : supported[0];
}

export async function getUsdExchangeRates() {
  if (exchangeRateCache && Date.now() - exchangeRateCache.fetchedAt < CACHE_TTL_MS) {
    return {
      fetchedAt: new Date(exchangeRateCache.fetchedAt).toISOString(),
      rates: exchangeRateCache.rates,
      source: exchangeRateCache.source,
    };
  }

  let source = "fallback";
  let rates = FALLBACK_EXCHANGE_RATES;

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      headers: { Accept: "application/json" },
    });
    const payload = await response.json();

    if (response.ok && payload?.result === "success" && payload?.rates) {
      rates = buildExchangeRates(payload.rates);
      source = "open.er-api.com";
    }
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
  }

  exchangeRateCache = { fetchedAt: Date.now(), rates, source };

  return {
    fetchedAt: new Date(exchangeRateCache.fetchedAt).toISOString(),
    rates,
    source,
  };
}

function isPublicIp(ip: string) {
  return !(
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip === "localhost" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
  );
}

export function getClientIp(req: Request) {
  const headerCandidates = [
    req.headers.get("x-forwarded-for"),
    req.headers.get("x-real-ip"),
    req.headers.get("cf-connecting-ip"),
    req.headers.get("fly-client-ip"),
  ];

  for (const candidate of headerCandidates) {
    if (!candidate) continue;
    const ip = candidate.split(",")[0]?.trim();
    if (ip) return ip;
  }

  return null;
}

export function mapCountryToCurrency(countryCode?: string | null): SupportedCurrency {
  const normalized = (countryCode || "").toUpperCase();
  if (normalized === "GB") return "GBP";
  if (normalized === "US") return "USD";
  if (normalized === "NG") return "NGN";
  if (normalized === "CN") return "CNY";
  if (EU_COUNTRY_CODES.has(normalized)) return "EUR";
  return "USD";
}

export async function detectCurrencyFromRequest(req: Request) {
  const ip = getClientIp(req);
  if (!ip || !isPublicIp(ip)) {
    return { countryCode: null, countryName: null, currency: BASE_CURRENCY, source: "fallback" };
  }

  const cached = geoCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      headers: { Accept: "application/json" },
    });
    const payload = await response.json();

    if (response.ok && payload?.success !== false) {
      const result = {
        countryCode: payload.country_code ?? null,
        countryName: payload.country ?? null,
        currency: mapCountryToCurrency(payload.country_code),
        source: "ipwho.is",
      };

      geoCache.set(ip, { ...result, expiresAt: Date.now() + CACHE_TTL_MS });
      return result;
    }
  } catch (error) {
    console.error("Failed to detect currency from IP:", error);
  }

  return { countryCode: null, countryName: null, currency: BASE_CURRENCY, source: "fallback" };
}

export async function buildGatewayQuote(args: {
  amount: number;
  baseCurrency?: string | null;
  gateway: keyof typeof PAYMENT_GATEWAY_SUPPORTED_CURRENCIES;
  preferredCurrency?: string | null;
}) {
  const { rates } = await getUsdExchangeRates();
  const baseCurrency = normalizeCurrency(args.baseCurrency);
  const gatewayCurrency = resolveGatewayCurrency(args.gateway, args.preferredCurrency);
  const payableAmount = convertAmount(args.amount, baseCurrency, gatewayCurrency, rates);

  return {
    baseAmount: roundCurrencyAmount(args.amount),
    baseCurrency,
    gatewayCurrency,
    payableAmount,
    exchangeRate: convertAmount(1, baseCurrency, gatewayCurrency, rates),
    rates,
  };
}