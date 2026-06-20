import { prisma } from "@/lib/prisma";

export type ListingStats = {
  viewCount: number;
  favoriteCount: number;
};

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

type RawUpdateResult = {
  ok?: number;
  nModified?: number;
  writeErrors?: Array<{ errmsg?: string }>;
};

export async function getListingFavoriteCount(
  listingId: string,
): Promise<number> {
  return prisma.favorite.count({ where: { listingId } });
}

export async function getListingStats(listingId: string): Promise<ListingStats> {
  const [listing, favoriteCount] = await Promise.all([
    prisma.listing.findUnique({
      where: { id: listingId },
      select: { viewCount: true },
    }),
    getListingFavoriteCount(listingId),
  ]);

  const rawViews = listing?.viewCount;
  const viewCount =
    rawViews != null && Number.isFinite(Number(rawViews))
      ? Number(rawViews)
      : 0;

  return { viewCount, favoriteCount };
}

/**
 * Incrementează vizualizările atomic.
 * Folosește pipeline MongoDB ($ifNull) — funcționează când viewCount lipsește sau e null.
 * Prisma `{ increment: 1 }` și `$inc` simplu eșuează silențios în aceste cazuri.
 */
export async function recordListingViewAndGetStats(
  listingId: string,
): Promise<ListingStats> {
  if (!OBJECT_ID_RE.test(listingId)) {
    return getListingStats(listingId);
  }

  try {
    const result = (await prisma.$runCommandRaw({
      update: "Listing",
      updates: [
        {
          q: { _id: { $oid: listingId } },
          u: [
            {
              $set: {
                viewCount: {
                  $add: [{ $ifNull: ["$viewCount", 0] }, 1],
                },
              },
            },
          ],
        },
      ],
    })) as RawUpdateResult;

    const failed =
      result?.ok !== 1 ||
      (Array.isArray(result.writeErrors) && result.writeErrors.length > 0) ||
      (result.nModified ?? 0) < 1;

    if (failed) {
      await fallbackSetViewCount(listingId);
    }
  } catch (error) {
    console.error("recordListingView pipeline failed, fallback to set:", error);
    await fallbackSetViewCount(listingId);
  }

  return getListingStats(listingId);
}

async function fallbackSetViewCount(listingId: string): Promise<void> {
  const current = await getListingStats(listingId);
  await prisma.listing.update({
    where: { id: listingId },
    data: { viewCount: current.viewCount + 1 },
  });
}

/** Normalizează viewCount null/lipsă la 0 pentru toate anunțurile existente. */
export async function backfillListingViewCounts(): Promise<number> {
  const result = (await prisma.$runCommandRaw({
    update: "Listing",
    updates: [
      {
        q: {
          $or: [
            { viewCount: { $exists: false } },
            { viewCount: null },
          ],
        },
        u: { $set: { viewCount: 0 } },
        multi: true,
      },
    ],
  })) as { nModified?: number };

  return result?.nModified ?? 0;
}
