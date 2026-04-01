import { addDays } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";

const TZ = "Europe/Bucharest";
const SLOT_MINUTES = 30;
const DEFAULT_DAYS_AHEAD = 14;

/** Luni–vineri, 09:00–18:00 (ultimul slot începe la 17:30). */
const WORK_START_H = 9;
const WORK_END_H = 18;

export type BusyInterval = { start: Date; end: Date };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function parseDayInTz(yyyyMmDd: string, hour: number, minute: number): Date {
  return toDate(`${yyyyMmDd}T${pad2(hour)}:${pad2(minute)}:00`, {
    timeZone: TZ,
  });
}

function isoDayOfWeekMonday1(yyyyMmDd: string): number {
  const noon = parseDayInTz(yyyyMmDd, 12, 0);
  return Number(formatInTimeZone(noon, TZ, "i"));
}

/** Generează sloturi candidate (fără Google), înainte de filtrare busy. */
export function generateCandidateSlotsUtc(
  now: Date,
  daysAhead = DEFAULT_DAYS_AHEAD,
): { start: Date; end: Date }[] {
  const slots: { start: Date; end: Date }[] = [];
  const todayStr = formatInTimeZone(now, TZ, "yyyy-MM-dd");

  for (let d = 0; d < daysAhead; d++) {
    const noonUtc = parseDayInTz(todayStr, 12, 0);
    const dayStr = formatInTimeZone(addDays(noonUtc, d), TZ, "yyyy-MM-dd");
    const isoDow = isoDayOfWeekMonday1(dayStr);
    if (isoDow > 5) continue;

    for (let h = WORK_START_H; h < WORK_END_H; h++) {
      for (const m of [0, 30]) {
        const start = parseDayInTz(dayStr, h, m);
        const end = new Date(start.getTime() + SLOT_MINUTES * 60 * 1000);
        if (start.getTime() < now.getTime()) continue;
        slots.push({ start, end });
      }
    }
  }

  return slots;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && aEnd > bStart;
}

/** Elimină sloturile care intersectează intervale busy (Google freebusy). */
export function subtractBusyIntervals(
  slots: { start: Date; end: Date }[],
  busy: BusyInterval[],
): { start: Date; end: Date }[] {
  if (!busy.length) return slots;
  const busyMs = busy.map((b) => ({
    s: b.start.getTime(),
    e: b.end.getTime(),
  }));
  return slots.filter((slot) => {
    const s = slot.start.getTime();
    const e = slot.end.getTime();
    return !busyMs.some((b) => overlaps(s, e, b.s, b.e));
  });
}
