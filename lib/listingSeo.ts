import { cache } from "react";
import { prisma } from "./prisma";
import type { ListingSeoInput } from "./seo";

export const fetchApprovedListingForSeo = cache(async function fetchApprovedListingForSeo(
  id: string,
): Promise<ListingSeoInput | null> {
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      transactionType: true,
      propertyType: true,
      location: true,
      sector: true,
      price: true,
      currency: true,
      images: true,
      updatedAt: true,
      status: true,
    },
  });

  if (!listing || listing.status !== "approved") return null;

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    transactionType: listing.transactionType,
    propertyType: listing.propertyType,
    location: listing.location,
    sector: listing.sector,
    price: listing.price,
    currency: listing.currency,
    images: listing.images,
    updatedAt: listing.updatedAt,
  };
});
