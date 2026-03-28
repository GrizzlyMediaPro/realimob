import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — Lista agenți, opțional cu scoring pentru un listing specific
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    const agents = await prisma.agent.findMany({
      orderBy: { rating: "desc" },
      include: {
        _count: {
          select: { listings: true },
        },
      },
    });

    if (!listingId) {
      return NextResponse.json({ agents });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ agents });
    }

    const listingSector = listing.sector || "";
    const price = listing.price || 0;
    const priceNorm = Math.min(price / 500000, 1);
    const maxLoad = Math.max(...agents.map((a) => a._count.listings), 1);

    const scoredAgents = agents.map((agent) => {
      const sectorMatch = agent.sectors.some((s) => s === listingSector);
      const sectorScore = sectorMatch ? 35 : 0;

      const ratingNorm = agent.rating / 5;
      const priceRatingMatch = 1 - Math.abs(ratingNorm - priceNorm);
      const priceRatingScore = Math.round(priceRatingMatch * 35);

      const loadRatio = agent._count.listings / Math.max(maxLoad, 1);
      const loadScore = Math.round((1 - loadRatio) * 20);

      const ratingBonusScore = Math.round(ratingNorm * 10);

      const totalScore = sectorScore + priceRatingScore + loadScore + ratingBonusScore;

      return {
        ...agent,
        scoring: {
          total: totalScore,
          breakdown: {
            sector: { score: sectorScore, max: 35, match: sectorMatch, detail: sectorMatch ? `Lucrează în ${listingSector}` : `Nu acoperă ${listingSector || "zona listingului"}` },
            priceRating: { score: priceRatingScore, max: 35, detail: `Rating ${agent.rating}/5 vs. preț ${price.toLocaleString("ro-RO")} ${listing.currency}` },
            load: { score: loadScore, max: 20, detail: `${agent._count.listings} anunțuri active` },
            ratingBonus: { score: ratingBonusScore, max: 10, detail: `Rating general: ${agent.rating}/5` },
          },
        },
      };
    });

    scoredAgents.sort((a, b) => b.scoring.total - a.scoring.total);

    return NextResponse.json({ agents: scoredAgents });
  } catch (error) {
    console.error("Failed to fetch agents", error);
    return NextResponse.json(
      { error: "Eroare la citirea agenților" },
      { status: 500 }
    );
  }
}

// POST — Creează un agent nou
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, avatar, sectors, rating } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Numele agentului este obligatoriu" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        avatar: avatar || null,
        sectors: sectors || [],
        rating: rating ? Number(rating) : 3.0,
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("Failed to create agent", error);
    return NextResponse.json(
      { error: "Eroare la crearea agentului" },
      { status: 500 }
    );
  }
}
