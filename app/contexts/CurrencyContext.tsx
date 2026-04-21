"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { BnrRateEntry } from "../../lib/bnrFxRates";
import { convertAmountWithBnrRates } from "../../lib/bnrFxRates";

export const DISPLAY_CURRENCIES = ["RON", "EUR", "USD", "GBP"] as const;
export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

const STORAGE_KEY = "realimob-display-currency";

type CurrencyContextValue = {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  rates: Record<string, BnrRateEntry> | null;
  rateDate: string | null;
  loading: boolean;
  error: string | null;
  /** Returnează suma rotunjită în moneda afișată sau null dacă nu se poate converti. */
  convertAmount: (
    amount: number,
    fromCurrency: string,
  ) => number | null;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] =
    useState<DisplayCurrency>("RON");
  const [rates, setRates] = useState<Record<string, BnrRateEntry> | null>(null);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (
        s &&
        (DISPLAY_CURRENCIES as readonly string[]).includes(s)
      ) {
        setDisplayCurrencyState(s as DisplayCurrency);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setDisplayCurrency = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/bnr-fx");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Curs indisponibil");
        }
        if (!cancelled && data?.rates && data?.date) {
          setRates(data.rates as Record<string, BnrRateEntry>);
          setRateDate(String(data.date));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Eroare curs");
          setRates(null);
          setRateDate(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const convertAmount = useCallback(
    (amount: number, fromCurrency: string): number | null => {
      if (!rates) return null;
      const conv = convertAmountWithBnrRates(
        amount,
        fromCurrency,
        displayCurrency,
        rates,
      );
      if (conv == null) return null;
      return Math.round(conv);
    },
    [displayCurrency, rates],
  );

  const value = useMemo(
    () => ({
      displayCurrency,
      setDisplayCurrency,
      rates,
      rateDate,
      loading,
      error,
      convertAmount,
    }),
    [
      displayCurrency,
      setDisplayCurrency,
      rates,
      rateDate,
      loading,
      error,
      convertAmount,
    ],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency trebuie folosit în CurrencyProvider");
  }
  return ctx;
}
