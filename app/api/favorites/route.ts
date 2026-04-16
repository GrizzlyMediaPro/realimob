import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            transactionType: true,
            price: true,
            currency: true,
            location: true,
            status: true,
            images: true,
          },
        },
      },
    });

    const listingIds = favorites.map((f) => f.listingId);
    const listings = favorites
      .filter((f) => f.listing.status === "approved")
      .map((f) => f.listing);

    return NextResponse.json({ listingIds, listings });
  } catch (error) {
    console.error("favorites GET", error);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const body = (await req.json()) as { listingId?: string };
    const listingId = body.listingId;
    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json({ error: "listingId lipsă" }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({ data: { userId, listingId } });
    return NextResponse.json({ favorited: true });
  } catch (error) {
    console.error("favorites POST", error);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
