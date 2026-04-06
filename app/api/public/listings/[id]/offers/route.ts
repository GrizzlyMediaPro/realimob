import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: listingId } = await params;

    const listing = await prisma.listing.findFirst({
      where: { id: listingId, status: "approved" },
      select: { id: true },
    });
    if (!listing) {
      return NextResponse.json({ error: "Anunț indisponibil" }, { status: 404 });
    }

    const offers = await prisma.listingOffer.findMany({
      where: { listingId, status: "confirmed" },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        amount: true,
        currency: true,
        createdAt: true,
        proposedBy: true,
      },
    });

    return NextResponse.json({ offers });
  } catch (e) {
    console.error("public listing offers", e);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
