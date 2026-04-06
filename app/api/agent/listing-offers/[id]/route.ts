import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rejectIfAgentSuspended } from "@/lib/reject-if-agent-suspended";

export async function PATCH(
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
      return NextResponse.json({ error: "Nu ești agent în sistem." }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as { action?: string };
    const action = body.action === "decline" ? "decline" : "confirm";

    const offer = await prisma.listingOffer.findUnique({
      where: { id },
      include: { listing: { select: { agentId: true } } },
    });
    if (!offer || offer.listing.agentId !== agent.id) {
      return NextResponse.json({ error: "Ofertă inexistentă" }, { status: 404 });
    }
    if (offer.status !== "pending") {
      return NextResponse.json({ error: "Oferta nu mai este în așteptare." }, { status: 400 });
    }

    await prisma.listingOffer.update({
      where: { id },
      data: { status: action === "confirm" ? "confirmed" : "declined" },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("agent listing-offer PATCH", e);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
