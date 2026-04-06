import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { revalidateAgentPerformanceScoreCache } from "@/lib/agentPerformanceScore";

// GET — Lista anunțurilor cu filtru de status (pentru admin)
export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const skip = (page - 1) * limit;

    const where = status === "all" ? {} : { status };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { agent: true },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch admin listings", error);
    return NextResponse.json(
      { error: "Eroare la citirea anunțurilor" },
      { status: 500 }
    );
  }
}

// PATCH — Actualizează status / agent pentru un anunț
export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const { listingId, action, agentId } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: "listingId este obligatoriu" },
        { status: 400 }
      );
    }

    // Verifică că anunțul există
    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Anunțul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Acțiuni posibile
    if (action === "approve") {
      // Trebuie să aibă un agent atribuit
      const effectiveAgentId = agentId || existing.agentId;
      if (!effectiveAgentId) {
        return NextResponse.json(
          { error: "Trebuie să atribui un agent înainte de aprobare" },
          { status: 400 }
        );
      }

      const listing = await prisma.listing.update({
        where: { id: listingId },
        data: {
          status: "approved",
          agentId: effectiveAgentId,
        },
        include: { agent: true },
      });

      return NextResponse.json(listing);
    }

    if (action === "deny") {
      const listing = await prisma.listing.update({
        where: { id: listingId },
        data: { status: "denied" },
        include: { agent: true },
      });

      revalidateAgentPerformanceScoreCache(
        listing.agentId ?? existing.agentId,
      );

      return NextResponse.json(listing);
    }

    if (action === "assign_agent") {
      if (!agentId) {
        return NextResponse.json(
          { error: "agentId este obligatoriu pentru atribuire" },
          { status: 400 }
        );
      }

      const listing = await prisma.listing.update({
        where: { id: listingId },
        data: { agentId },
        include: { agent: true },
      });

      return NextResponse.json(listing);
    }

    if (action === "auto_assign") {
      // Algoritm: sector + preț → agent cu rating potrivit
      const agents = await prisma.agent.findMany({
        include: {
          _count: { select: { listings: true } },
        },
      });

      if (agents.length === 0) {
        return NextResponse.json(
          { error: "Nu există agenți în sistem" },
          { status: 400 }
        );
      }

      // 1. Filtrează agenții care au sectorul listingului
      const listingSector = existing.sector || "";
      let matchingAgents = agents.filter((a) =>
        a.sectors.some((s) => s === listingSector)
      );

      // Dacă nu găsim agenți pentru sectorul specific, folosim toți
      if (matchingAgents.length === 0) {
        matchingAgents = agents;
      }

      // 2. Calculează scorul: proprietate scumpă → agent cu rating mare
      // Normalizăm prețul: 0-1 (relativ la maxim din baza de date)
      const maxPrice = Math.max(...agents.map(() => existing.price), existing.price);
      const priceRatio = existing.price / Math.max(maxPrice, 1); // 0..1

      // Scor = rating * (0.4 + 0.6 * priceMatch)
      // priceMatch = cât de potrivit e rating-ul agentului cu priceRatio
      // Agent cu rating 5 → potrivit pentru proprietăți scumpe
      // Agent cu rating 3 → potrivit pentru proprietăți medii
      const scored = matchingAgents.map((agent) => {
        const ratingNorm = agent.rating / 5; // 0..1
        // Cu cât priceRatio e mai mare, cu atât vrem un agent cu rating mai mare
        const priceMatch = 1 - Math.abs(ratingNorm - priceRatio);
        // Bonus dacă agentul are mai puține listings atribuite (distribuție egală)
        const loadPenalty = agent._count.listings * 0.05;
        const score = priceMatch * 0.7 + ratingNorm * 0.3 - loadPenalty;
        return { agent, score };
      });

      // Sortăm descrescător după scor
      scored.sort((a, b) => b.score - a.score);
      const bestAgent = scored[0].agent;

      const listing = await prisma.listing.update({
        where: { id: listingId },
        data: { agentId: bestAgent.id },
        include: { agent: true },
      });

      return NextResponse.json(listing);
    }

    return NextResponse.json(
      { error: "Acțiune necunoscută. Folosește: approve, deny, assign_agent, auto_assign" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to update listing", error);
    return NextResponse.json(
      { error: "Eroare la actualizarea anunțului" },
      { status: 500 }
    );
  }
}
