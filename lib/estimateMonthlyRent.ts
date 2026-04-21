/** Estimare chirie lunară (demo) din prețul de vânzare, în aceeași monedă ca prețul sursă. */
export function estimateMonthlyRentFromSaleAmount(saleAmount: number): number {
  let factor = 120;
  if (saleAmount < 50000) factor = 100;
  if (saleAmount > 150000) factor = 150;
  const chirie = Math.round(saleAmount / factor);
  return Math.max(300, Math.min(2000, chirie));
}
