import { prisma } from "./prisma";
import { getPrimaryCalendarFreeBusy } from "./google-calendar";
import {
  generateCandidateSlotsUtc,
  subtractBusyIntervals,
} from "./viewing-slots";

const DAYS_AHEAD = 14;
const MATCH_MS = 90_000;

export type ViewingSlotsResult =
  | { ok: true; slots: { start: string; end: string }[] }
  | { ok: false; code: "not_found" | "no_calendar" | "not_approved" };

export async function getViewingSlotsForListingId(
  listingId: string,
): Promise<ViewingSlotsResult> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { agent: true },
  });

  if (!listing) {
    return { ok: false, code: "not_found" };
  }
  if (listing.status !== "approved") {
    return { ok: false, code: "not_approved" };
  }
  if (!listing.agentId || !listing.agent?.googleRefreshToken) {
    return { ok: false, code: "no_calendar" };
  }

  const now = new Date();
  const candidates = generateCandidateSlotsUtc(now, DAYS_AHEAD);
  if (!candidates.length) {
    return { ok: true, slots: [] };
  }

  const timeMin = candidates[0].start;
  const timeMax = candidates[candidates.length - 1].end;
  const busy = await getPrimaryCalendarFreeBusy(
    listing.agent.googleRefreshToken,
    timeMin,
    timeMax,
  );
  const slots = subtractBusyIntervals(candidates, busy);

  return {
    ok: true,
    slots: slots.map((s) => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
    })),
  };
}

export async function assertValidViewingSlotForListing(
  listingId: string,
  start: Date,
  end: Date,
): Promise<
  | { ok: true; listing: { id: string; title: string; agentId: string } }
  | { ok: false; code: string }
> {
  const res = await getViewingSlotsForListingId(listingId);
  if (!res.ok) {
    return { ok: false, code: res.code };
  }
  const t0 = start.getTime();
  const t1 = end.getTime();
  const match = res.slots.some((s) => {
    const a = new Date(s.start).getTime();
    const b = new Date(s.end).getTime();
    return Math.abs(a - t0) <= MATCH_MS && Math.abs(b - t1) <= MATCH_MS;
  });
  if (!match) {
    return { ok: false, code: "invalid_slot" };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, agentId: true, status: true },
  });
  if (!listing?.agentId || listing.status !== "approved") {
    return { ok: false, code: "not_found" };
  }

  return {
    ok: true,
    listing: {
      id: listing.id,
      title: listing.title,
      agentId: listing.agentId,
    },
  };
}
