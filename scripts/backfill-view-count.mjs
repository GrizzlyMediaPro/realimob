import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const result = await prisma.$runCommandRaw({
    update: "Listing",
    updates: [
      {
        q: {
          $or: [{ viewCount: { $exists: false } }, { viewCount: null }],
        },
        u: { $set: { viewCount: 0 } },
        multi: true,
      },
    ],
  });
  console.log("Backfill result:", result);
} finally {
  await prisma.$disconnect();
}
