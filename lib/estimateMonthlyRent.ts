/** Chirie lunară din prețul salvat la anunț (fără transformare). */
export function getMonthlyRentAmount(listingPrice: number): number {
  return listingPrice;
}

/** Text fallback pentru chirie lunară (ex. înainte de conversia valutară). */
export function formatMonthlyRentFallback(
  amount: number,
  currency = "EUR",
): string {
  const sym = currency === "EUR" ? "€" : currency;
  return `${amount.toLocaleString("ro-RO")} ${sym}/lună`;
}

/** Estimare chirie lunară (demo) din prețul de vânzare — doar carduri marketing. */
export function estimateMonthlyRentFromSaleAmount(saleAmount: number): number {
  let factor = 120;
  if (saleAmount < 50000) factor = 100;
  if (saleAmount > 150000) factor = 150;
  const chirie = Math.round(saleAmount / factor);
  return Math.max(300, Math.min(2000, chirie));
}
