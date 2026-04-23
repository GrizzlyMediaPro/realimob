import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { id: listingId } = await params;
    const body = (await request.json()) as {
      contractUrl?: string;
      contractFileName?: string;
    };
    const contractUrl = body.contractUrl?.trim();
    const contractFileName = body.contractFileName?.trim() ?? null;
    if (!contractUrl) {
      return NextResponse.json(
        { error: "Lipsește documentul (URL dovadă)." },
        { status: 400 },
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        status: true,
        submittedByUserId: true,
        saleSubmittedAt: true,
        saleVerifiedAt: true,
        saleRejectedAt: true,
      },
    });
    if (!listing) {
      return NextResponse.json({ error: "Anunț inexistent" }, { status: 404 });
    }
    if (listing.submittedByUserId !== userId) {
      return NextResponse.json(
        { error: "Poți trimite dovada doar pentru anunțurile tale." },
        { status: 403 },
      );
    }
    if (listing.status !== "approved") {
      return NextResponse.json(
        { error: "Doar anunțurile active pot fi marcate." },
        { status: 400 },
      );
    }

    const pendingReview =
      listing.saleSubmittedAt &&
      !listing.saleVerifiedAt &&
      !listing.saleRejectedAt;
    if (pendingReview) {
      return NextResponse.json(
        { error: "Există deja un document în curs de verificare." },
        { status: 400 },
      );
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        saleContractUrl: contractUrl,
        saleContractFileName: contractFileName,
        saleSubmittedAt: new Date(),
        saleRejectedAt: null,
        saleRejectionNote: null,
        saleRequestedByType: "client",
        saleRequestedByUserId: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("account submit-sale", e);
    return NextResponse.json({ error: "Eroare la salvare" }, { status: 500 });
  }
}
