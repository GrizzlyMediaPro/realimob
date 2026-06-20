import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

async function recordListingViewAndGetStats(listingId) {
  if (!OBJECT_ID_RE.test(listingId)) {
    throw new Error("invalid id");
  }

  await prisma.$runCommandRaw({
    update: "Listing",
    updates: [
      {
        q: { _id: { $oid: listingId } },
        u: { $inc: { viewCount: 1 } },
      },
    ],
  });

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { viewCount: true },
  });

  return { viewCount: Number(listing?.viewCount) || 0 };
}

try {
  const listing = await prisma.listing.findFirst({
    where: { status: "approved" },
    select: { id: true, viewCount: true },
  });
  console.log("Before:", listing);
  const s1 = await recordListingViewAndGetStats(listing.id);
  console.log("After 1st:", s1);
  const s2 = await recordListingViewAndGetStats(listing.id);
  console.log("After 2nd:", s2);
} finally {
  await prisma.$disconnect();
}
