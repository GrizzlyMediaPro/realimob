/** Zi calendaristică UTC din string YYYY-MM-DD */
export function parseUtcDateParam(s: string | null): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return dt;
}

export function startOfUtcDayFromDate(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

export function endOfUtcDayFromDate(d: Date): Date {
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
}

/** Începutul lunii UTC curente (față de `now`) */
export function utcCurrentMonthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Sfârșitul lunii UTC curente */
export function utcCurrentMonthEnd(now = new Date()): Date {
  return endOfUtcDayFromDate(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
  );
}

/** Primul moment UTC al zilei de după `d` (exclusiv pentru intervale) */
export function addUtcDays(d: Date, days: number): Date {
  const t = startOfUtcDayFromDate(d).getTime() + days * 24 * 60 * 60 * 1000;
  return new Date(t);
}

export const MAX_ANALYTICS_RANGE_DAYS = 800;

export function utcYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/** Preset fără „tot timpul” și fără custom — returnează capete YYYY-MM-DD (UTC). */
export function computePresetRange(
  preset: "luna" | "l3" | "l6" | "l12",
  now = new Date()
): { from: string; to: string } {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  if (preset === "luna") {
    const start = new Date(Date.UTC(y, m, 1));
    const lastCalDay = new Date(Date.UTC(y, m + 1, 0));
    return { from: utcYmd(start), to: utcYmd(lastCalDay) };
  }
  const monthBack = preset === "l3" ? 2 : preset === "l6" ? 5 : 11;
  const start = new Date(Date.UTC(y, m - monthBack, 1));
  const toDay = startOfUtcDayFromDate(now);
  return { from: utcYmd(start), to: utcYmd(toDay) };
}
