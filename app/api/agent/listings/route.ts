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
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ listings: [] });
    }

    const agent = await prisma.agent.findFirst({
      where: { email },
      select: { id: true },
    });

    if (!agent) {
      return NextResponse.json({ listings: [] });
    }

    const listings = await prisma.listing.findMany({
      where: {
        agentId: agent.id,
        status: { in: ["approved", "sold"] },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Failed to fetch agent listings", error);
    return NextResponse.json(
      { error: "Eroare la citirea anunțurilor agentului" },
      { status: 500 }
    );
  }
}
