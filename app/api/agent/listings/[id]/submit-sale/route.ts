import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rejectIfAgentSuspended } from "@/lib/reject-if-agent-suspended";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const suspended = await rejectIfAgentSuspended(userId);
    if (suspended) return suspended;

    const { id: listingId } = await params;
    const body = (await request.json()) as {
      contractUrl?: string;
      contractFileName?: string;
    };
    const contractUrl = body.contractUrl?.trim();
    const contractFileName = body.contractFileName?.trim() ?? null;
    if (!contractUrl) {
      return NextResponse.json(
        { error: "Lipsește documentul (URL contract)." },
        { status: 400 },
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? null;
    if (!email) {
      return NextResponse.json({ error: "Email indisponibil" }, { status: 400 });
    }

    const agent = await prisma.agent.findFirst({
      where: { email },
      select: { id: true },
    });
    if (!agent) {
      return NextResponse.json({ error: "Agent inexistent" }, { status: 404 });
    }

    const listing = await prisma.listing.findFirst({
      where: { id: listingId, agentId: agent.id },
    });
    if (!listing) {
      return NextResponse.json({ error: "Anunț inexistent" }, { status: 404 });
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
        { error: "Există deja un contract în curs de verificare." },
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
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("submit-sale", e);
    return NextResponse.json({ error: "Eroare la salvare" }, { status: 500 });
  }
}
