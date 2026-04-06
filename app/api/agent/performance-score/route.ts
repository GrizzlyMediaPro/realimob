import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getCachedAgentPerformanceScore } from "@/lib/agentPerformanceScore";
import { rejectIfAgentSuspended } from "@/lib/reject-if-agent-suspended";

/** Scor performanță (90 zile), separat vânzări / închirieri — agent autentificat */
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
      return NextResponse.json(
        { error: "Contul nu are email." },
        { status: 400 },
      );
    }

    const agent = await prisma.agent.findFirst({
      where: { email },
      select: { id: true },
    });
    if (!agent) {
      return NextResponse.json(
        { error: "Nu există profil agent pentru acest cont." },
        { status: 404 },
      );
    }

    const score = await getCachedAgentPerformanceScore(agent.id);
    return NextResponse.json(score);
  } catch (e) {
    console.error("GET /api/agent/performance-score", e);
    return NextResponse.json(
      { error: "Nu am putut calcula scorul." },
      { status: 500 },
    );
  }
}
