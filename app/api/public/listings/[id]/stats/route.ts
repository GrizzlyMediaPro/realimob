import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getListingStats,
  recordListingViewAndGetStats,
} from "@/lib/listingStats";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const stats = await getListingStats(id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("listing stats GET", error);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}

/** Înregistrează o vizualizare și returnează statisticile actualizate. */
export async function POST(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!listing || listing.status !== "approved") {
      return NextResponse.json({ error: "Anunț negăsit" }, { status: 404 });
    }

    const stats = await recordListingViewAndGetStats(id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("listing stats POST", error);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
