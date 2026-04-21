/** Parsare cursuri BNR (nbrfxrates.xml) — 1 unitate monedă străină = ronPerUnit RON. */

/**
 * Aliniază valorile din formular/DB (ex. „€”, „EURO”) la cod ISO folosit în nbrfxrates.xml.
 */
export function normalizeListingCurrencyCode(raw: string): string {
  const s = String(raw ?? "").trim();
  if (!s) return "RON";
  if (s === "€") return "EUR";
  if (s === "$") return "USD";
  if (s === "£") return "GBP";
  const lower = s.toLowerCase();
  if (lower === "euro" || lower === "eur") return "EUR";
  if (lower === "usd" || lower === "dolar" || lower === "dolari") return "USD";
  if (lower === "ron" || lower === "lei") return "RON";
  if (lower === "gbp") return "GBP";
  if (lower === "chf") return "CHF";
  if (/^[a-z]{3}$/i.test(s)) return s.toUpperCase();
  return s.toUpperCase();
}

export type BnrRateEntry = { ronPerUnit: number };

export type BnrParsedRates = {
  date: string;
  rates: Record<string, BnrRateEntry>;
};

export function parseBnrNbrFxRatesXml(xml: string): BnrParsedRates | null {
  const cube = xml.match(/<Cube\s+date="([^"]+)"/);
  if (!cube) return null;
  const date = cube[1];
  const rates: Record<string, BnrRateEntry> = {};

  const re =
    /<Rate\s+currency="([^"]+)"(?:\s+multiplier="(\d+)")?\s*>([^<]+)<\/Rate>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const currency = m[1].toUpperCase();
    const mult = m[2] ? Number(m[2]) : 1;
    const raw = Number(String(m[3]).trim().replace(",", "."));
    if (!Number.isFinite(raw) || mult <= 0) continue;
    rates[currency] = { ronPerUnit: raw / mult };
  }

  return { date, rates };
}

export function getRonPerUnit(
  currency: string,
  rates: Record<string, BnrRateEntry>,
): number | null {
  const c = normalizeListingCurrencyCode(currency);
  if (c === "RON") return 1;
  const e = rates[c];
  return e?.ronPerUnit != null && Number.isFinite(e.ronPerUnit)
    ? e.ronPerUnit
    : null;
}

export function convertAmountWithBnrRates(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, BnrRateEntry>,
): number | null {
  if (!Number.isFinite(amount)) return null;
  const from = normalizeListingCurrencyCode(fromCurrency);
  const to = normalizeListingCurrencyCode(toCurrency);
  if (from === to) return amount;

  const rFrom = getRonPerUnit(from, rates);
  const rTo = getRonPerUnit(to, rates);
  if (rFrom == null || rTo == null) return null;

  const inRon = from === "RON" ? amount : amount * rFrom;
  return to === "RON" ? inRon : inRon / rTo;
}

export function currencyDisplaySymbol(code: string): string {
  const c = normalizeListingCurrencyCode(code);
  if (c === "RON") return "lei";
  if (c === "EUR") return "€";
  if (c === "USD") return "$";
  if (c === "GBP") return "£";
  if (c === "CHF") return "CHF";
  return c;
}
