import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getListingCanonicalPath, getSiteUrl } from "@/lib/seo";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: "/", changeFrequency: "daily", priority: 1 },
  { url: "/vanzare", changeFrequency: "hourly", priority: 0.95 },
  { url: "/inchiriere", changeFrequency: "hourly", priority: 0.95 },
  { url: "/anunturi", changeFrequency: "hourly", priority: 0.9 },
  { url: "/harta", changeFrequency: "weekly", priority: 0.75 },
  {
    url: "/termeni-si-conditii",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: "/politica-de-confidentialitate",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  { url: "/politica-cookies", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  let listingEntries: MetadataRoute.Sitemap = [];
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "approved" },
      select: {
        id: true,
        transactionType: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    listingEntries = listings.map((listing) => ({
      url: `${base}${getListingCanonicalPath(listing.transactionType, listing.id)}`,
      lastModified: listing.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap] Failed to load listings:", error);
  }

  return [
    ...STATIC_ROUTES.map((entry) => ({
      ...entry,
      url: entry.url === "/" ? base : `${base}${entry.url}`,
    })),
    ...listingEntries,
  ];
}
