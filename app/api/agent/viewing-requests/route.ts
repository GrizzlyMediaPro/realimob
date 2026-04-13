import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncCompletedViewingQuestionnaires } from "@/lib/viewing-questionnaire-sync";
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
      return NextResponse.json({ requests: [] });
    }

    await syncCompletedViewingQuestionnaires();

    const requests = await prisma.viewingBookingRequest.findMany({
      where: { agentId: agent.id },
      orderBy: { startAt: "asc" },
      include: {
        listing: { select: { title: true } },
      },
    });

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        status: r.status,
        startAt: r.startAt.toISOString(),
        endAt: r.endAt.toISOString(),
        listingId: r.listingId,
        listingTitle: r.listing.title,
        clientName: r.clientName,
        clientEmail: r.clientEmail,
        clientPhone: r.clientPhone,
        message: r.message,
        googleEventId: r.googleEventId,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error("agent viewing-requests GET", e);
    return NextResponse.json(
      { error: "Eroare la încărcare" },
      { status: 500 },
    );
  }
}
