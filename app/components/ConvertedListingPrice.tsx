"use client";

import { useCurrency } from "../contexts/CurrencyContext";
import {
  currencyDisplaySymbol,
  normalizeListingCurrencyCode,
} from "../../lib/bnrFxRates";
import { listingTvaSuffix } from "../../lib/listingToAnunt";

type ConvertedListingPriceProps = {
  amount?: number;
  fromCurrency?: string;
  /** Text afișat dacă lipsesc date numerice sau cursurile BNR. */
  fallback: string;
  priceDetails?: Record<string, unknown> | null;
  suffix?: string;
  className?: string;
};

export default function ConvertedListingPrice({
  amount,
  fromCurrency,
  fallback,
  priceDetails,
  suffix = "",
  className,
}: ConvertedListingPriceProps) {
  const { rates, loading, convertAmount, displayCurrency } = useCurrency();
  const fromNorm = normalizeListingCurrencyCode(fromCurrency ?? "");

  if (
    loading ||
    !rates ||
    amount == null ||
    !Number.isFinite(amount) ||
    !fromCurrency?.trim()
  ) {
    return <span className={className}>{fallback}</span>;
  }

  const conv = convertAmount(amount, fromNorm);
  if (conv == null) {
    return <span className={className}>{fallback}</span>;
  }

  const sym = currencyDisplaySymbol(displayCurrency);
  const tva = listingTvaSuffix(priceDetails ?? null);

  return (
    <span className={className} suppressHydrationWarning>
      {`${conv.toLocaleString("ro-RO")} ${sym}${suffix}${tva}`}
    </span>
  );
}
