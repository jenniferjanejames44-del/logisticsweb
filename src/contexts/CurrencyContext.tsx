import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BASE_CURRENCY,
  buildExchangeRates,
  convertAmount,
  convertFromUsd,
  CURRENCY_CONTEXT_CACHE_KEY,
  CURRENCY_STORAGE_KEY,
  EXCHANGE_RATE_CACHE_TTL_MS,
  FALLBACK_EXCHANGE_RATES,
  formatMoney,
  formatUsdForDisplay,
  isSupportedCurrency,
  type ExchangeRates,
  type SupportedCurrency,
} from "@/lib/currency";

interface CurrencyContextValue {
  baseCurrency: typeof BASE_CURRENCY;
  selectedCurrency: SupportedCurrency;
  detectedCurrency: SupportedCurrency;
  exchangeRates: ExchangeRates;
  countryCode: string | null;
  countryName: string | null;
  hasManualOverride: boolean;
  loading: boolean;
  setCurrency: (currency: SupportedCurrency) => void;
  resetCurrencyPreference: () => void;
  convertUsdAmount: (amount: number, targetCurrency?: SupportedCurrency) => number;
  convertAmount: (amount: number, fromCurrency?: string | null, targetCurrency?: SupportedCurrency) => number;
  formatMoney: (amount: number, currency?: string | null, options?: Intl.NumberFormatOptions) => string;
  formatUsd: (amount: number, targetCurrency?: SupportedCurrency, options?: Intl.NumberFormatOptions) => string;
  formatConverted: (amount: number, fromCurrency?: string | null, targetCurrency?: SupportedCurrency, options?: Intl.NumberFormatOptions) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

interface CachedCurrencyContext {
  exchangeRates: ExchangeRates;
  detectedCurrency: SupportedCurrency;
  countryCode: string | null;
  countryName: string | null;
  fetchedAt: number;
}

function readCachedCurrencyContext(): CachedCurrencyContext | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CURRENCY_CONTEXT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCurrencyContext;

    if (!parsed?.fetchedAt || Date.now() - parsed.fetchedAt > EXCHANGE_RATE_CACHE_TTL_MS) {
      return null;
    }

    return {
      exchangeRates: buildExchangeRates(parsed.exchangeRates),
      detectedCurrency: isSupportedCurrency(parsed.detectedCurrency) ? parsed.detectedCurrency : BASE_CURRENCY,
      countryCode: parsed.countryCode ?? null,
      countryName: parsed.countryName ?? null,
      fetchedAt: parsed.fetchedAt,
    };
  } catch {
    return null;
  }
}

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [manualCurrency, setManualCurrency] = useState<SupportedCurrency | null>(null);
  const [detectedCurrency, setDetectedCurrency] = useState<SupportedCurrency>(BASE_CURRENCY);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(FALLBACK_EXCHANGE_RATES);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedCurrency = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (isSupportedCurrency(storedCurrency)) {
      setManualCurrency(storedCurrency);
    }

    const cached = readCachedCurrencyContext();
    if (cached) {
      setExchangeRates(cached.exchangeRates);
      setDetectedCurrency(cached.detectedCurrency);
      setCountryCode(cached.countryCode);
      setCountryName(cached.countryName);
      setLoading(false);
    }

    let isActive = true;

    const fetchCurrencyContext = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("currency-context");
        if (error) throw error;
        if (!isActive || !data) return;

        const nextRates = buildExchangeRates(data.rates);
        const nextDetected = isSupportedCurrency(data.defaultCurrency) ? data.defaultCurrency : BASE_CURRENCY;
        const cachePayload: CachedCurrencyContext = {
          exchangeRates: nextRates,
          detectedCurrency: nextDetected,
          countryCode: data.countryCode ?? null,
          countryName: data.countryName ?? null,
          fetchedAt: Date.now(),
        };

        setExchangeRates(nextRates);
        setDetectedCurrency(nextDetected);
        setCountryCode(data.countryCode ?? null);
        setCountryName(data.countryName ?? null);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(CURRENCY_CONTEXT_CACHE_KEY, JSON.stringify(cachePayload));
        }
      } catch (error) {
        console.error("Failed to load currency context:", error);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    const hasFreshCache = !!cached;
    if (!hasFreshCache) {
      fetchCurrencyContext();
    } else {
      fetchCurrencyContext();
    }

    return () => {
      isActive = false;
    };
  }, []);

  const setCurrency = useCallback((currency: SupportedCurrency) => {
    setManualCurrency(currency);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    }
  }, []);

  const resetCurrencyPreference = useCallback(() => {
    setManualCurrency(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CURRENCY_STORAGE_KEY);
    }
  }, []);

  const selectedCurrency = manualCurrency ?? detectedCurrency;

  const convertUsdAmount = useCallback(
    (amount: number, targetCurrency: SupportedCurrency = selectedCurrency) => convertFromUsd(amount, targetCurrency, exchangeRates),
    [exchangeRates, selectedCurrency],
  );

  const convertAnyAmount = useCallback(
    (amount: number, fromCurrency: string | null | undefined = BASE_CURRENCY, targetCurrency: SupportedCurrency = selectedCurrency) =>
      convertAmount(amount, fromCurrency, targetCurrency, exchangeRates),
    [exchangeRates, selectedCurrency],
  );

  const formatRawMoney = useCallback(
    (amount: number, currency: string | null | undefined = selectedCurrency, options: Intl.NumberFormatOptions = {}) =>
      formatMoney(amount, currency, options),
    [selectedCurrency],
  );

  const formatUsd = useCallback(
    (amount: number, targetCurrency: SupportedCurrency = selectedCurrency, options: Intl.NumberFormatOptions = {}) =>
      formatUsdForDisplay(amount, targetCurrency, exchangeRates, options),
    [exchangeRates, selectedCurrency],
  );

  const formatConverted = useCallback(
    (amount: number, fromCurrency: string | null | undefined = BASE_CURRENCY, targetCurrency: SupportedCurrency = selectedCurrency, options: Intl.NumberFormatOptions = {}) =>
      formatMoney(convertAmount(amount, fromCurrency, targetCurrency, exchangeRates), targetCurrency, options),
    [exchangeRates, selectedCurrency],
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      baseCurrency: BASE_CURRENCY,
      selectedCurrency,
      detectedCurrency,
      exchangeRates,
      countryCode,
      countryName,
      hasManualOverride: manualCurrency !== null,
      loading,
      setCurrency,
      resetCurrencyPreference,
      convertUsdAmount,
      convertAmount: convertAnyAmount,
      formatMoney: formatRawMoney,
      formatUsd,
      formatConverted,
    }),
    [
      selectedCurrency,
      detectedCurrency,
      exchangeRates,
      countryCode,
      countryName,
      manualCurrency,
      loading,
      setCurrency,
      resetCurrencyPreference,
      convertUsdAmount,
      convertAnyAmount,
      formatRawMoney,
      formatUsd,
      formatConverted,
    ],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}