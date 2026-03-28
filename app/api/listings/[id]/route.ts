import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { agent: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Anunțul nu a fost găsit" },
        { status: 404 },
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Failed to fetch listing", error);
    return NextResponse.json(
      { error: "A apărut o eroare la citirea anunțului" },
      { status: 500 },
    );
  }
}
