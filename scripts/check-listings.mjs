import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const id = "6a26c9f92eacc308d973cd18";

async function bump(listingId) {
  return prisma.$runCommandRaw({
    update: "Listing",
    updates: [
      {
        q: { _id: { $oid: listingId } },
        u: [
          {
            $set: {
              viewCount: { $add: [{ $ifNull: ["$viewCount", 0] }, 1] },
            },
          },
        ],
      },
    ],
  });
}

try {
  console.log("Before:", await prisma.listing.findUnique({ where: { id }, select: { viewCount: true } }));
  await bump(id);
  console.log("After:", await prisma.listing.findUnique({ where: { id }, select: { viewCount: true } }));
} finally {
  await prisma.$disconnect();
}
