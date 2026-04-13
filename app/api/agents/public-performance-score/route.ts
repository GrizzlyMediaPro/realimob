import { NextResponse } from "next/server";
import { getCachedAgentPerformanceScore } from "@/lib/agentPerformanceScore";

/**
 * Scor public agent (vânzări / închirieri, 90 zile) pentru cardul de contact.
 * Primește `agentId` (id intern Prisma Agent) ca query param.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get("agentId")?.trim();
    if (!agentId) {
      return NextResponse.json({ error: "Lipsește agentId." }, { status: 400 });
    }

    const score = await getCachedAgentPerformanceScore(agentId);
    return NextResponse.json({
      scorVanzari: score.scorVanzari,
      scorInchirieri: score.scorInchirieri,
    });
  } catch (error) {
    console.error("GET /api/agents/public-performance-score", error);
    return NextResponse.json(
      { error: "Nu am putut încărca scorul agentului." },
      { status: 500 }
    );
  }
}
