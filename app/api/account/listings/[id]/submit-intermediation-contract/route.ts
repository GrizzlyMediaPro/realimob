import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isIntermediationContractAwaitingAdmin } from "@/lib/listingIntermediationContract";

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
        { error: "Încarcă contractul semnat înainte de trimitere." },
        { status: 400 },
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        status: true,
        submittedByUserId: true,
        intermediationContractSubmittedAt: true,
        intermediationContractVerifiedAt: true,
        intermediationContractRejectedAt: true,
      },
    });
    if (!listing) {
      return NextResponse.json({ error: "Anunț inexistent" }, { status: 404 });
    }
    if (listing.submittedByUserId !== userId) {
      return NextResponse.json(
        { error: "Poți încărca contractul doar pentru anunțurile tale." },
        { status: 403 },
      );
    }
    if (listing.status !== "pending") {
      return NextResponse.json(
        { error: "Contractul se trimite doar pentru anunțurile în moderare." },
        { status: 400 },
      );
    }

    if (isIntermediationContractAwaitingAdmin(listing)) {
      return NextResponse.json(
        { error: "Există deja un contract în curs de verificare." },
        { status: 400 },
      );
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        intermediationContractUrl: contractUrl,
        intermediationContractFileName: contractFileName,
        intermediationContractSubmittedAt: new Date(),
        intermediationContractRejectedAt: null,
        intermediationContractRejectionNote: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("submit-intermediation-contract", e);
    return NextResponse.json({ error: "Eroare la salvare" }, { status: 500 });
  }
}
