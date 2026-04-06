import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { rejectIfAgentSuspended } from "@/lib/reject-if-agent-suspended";

export async function GET() {
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
      return NextResponse.json({ offers: [] });
    }

    const offers = await prisma.listingOffer.findMany({
      where: {
        status: "pending",
        proposedBy: "client",
        listing: { agentId: agent.id },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        amount: true,
        currency: true,
        note: true,
        createdAt: true,
        listing: { select: { id: true, title: true } },
        viewingRequest: {
          select: { id: true, clientName: true, clientEmail: true },
        },
      },
    });

    return NextResponse.json({ offers });
  } catch (e) {
    console.error("agent listing-offers GET", e);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
