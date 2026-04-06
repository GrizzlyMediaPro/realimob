import { NextRequest, NextResponse } from "next/server";
import type { Listing, Agent } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { revalidateAgentPerformanceScoreCache } from "@/lib/agentPerformanceScore";

export const dynamic = "force-dynamic";

type ListingWithAgent = Listing & {
  agent: Pick<Agent, "id" | "name" | "email"> | null;
};

/** Aceeași logică ca pe dashboard-ul agentului (sale în așteptare). */
function isSalePendingAdminReview(l: Listing): boolean {
  if (l.status !== "approved") return false;
  const hasSubmission =
    l.saleSubmittedAt != null ||
    (typeof l.saleContractUrl === "string" && l.saleContractUrl.trim().length > 0);
  if (!hasSubmission) return false;
  if (l.saleVerifiedAt != null) return false;
  if (l.saleRejectedAt != null) return false;
  return true;
}

/** Cereri de verificare vânzare: contract încărcat, neaprobat, nerepinsă */
export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "pending";

    if (status === "pending") {
      // Evităm filtre Prisma pe DateTime + MongoDB (pot întoarce [] deși rândurile există).
      // Încărcăm anunțurile approved și filtrăm în memorie ca la agent.
      const approved = await prisma.listing.findMany({
        where: { status: "approved" },
        include: { agent: { select: { id: true, name: true, email: true } } },
      });
      const rows: ListingWithAgent[] = approved
        .filter((l) => isSalePendingAdminReview(l))
        .sort((a, b) => {
          const ta =
            a.saleSubmittedAt != null
              ? new Date(a.saleSubmittedAt).getTime()
              : 0;
          const tb =
            b.saleSubmittedAt != null
              ? new Date(b.saleSubmittedAt).getTime()
              : 0;
          return ta - tb;
        });
      return NextResponse.json({ listings: rows });
    }

    const recent = await prisma.listing.findMany({
      where: {
        OR: [
          { saleVerifiedAt: { not: null } },
          { saleRejectedAt: { not: null } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 80,
      include: { agent: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ listings: recent });
  } catch (e) {
    console.error("admin listing-sales GET", e);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const body = (await request.json()) as {
      listingId?: string;
      action?: "approve" | "reject";
      note?: string;
    };
    const listingId = body.listingId?.trim();
    const action = body.action;
    if (!listingId || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "Date invalide." }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json({ error: "Lipsă" }, { status: 404 });
    }

    if (!isSalePendingAdminReview(listing)) {
      return NextResponse.json(
        { error: "Acest anunț nu are o cerere de vânzare în așteptare." },
        { status: 400 },
      );
    }

    if (action === "approve") {
      const updated = await prisma.listing.update({
        where: { id: listingId },
        data: {
          status: "sold",
          saleVerifiedAt: new Date(),
          saleRejectedAt: null,
          saleRejectionNote: null,
        },
        include: { agent: true },
      });
      revalidateAgentPerformanceScoreCache(updated.agentId);
      return NextResponse.json({ listing: updated });
    }

    const note = body.note?.trim().slice(0, 500) || null;
    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        saleRejectedAt: new Date(),
        saleRejectionNote: note,
        saleContractUrl: null,
        saleContractFileName: null,
        saleSubmittedAt: null,
      },
      include: { agent: true },
    });
    return NextResponse.json({ listing: updated });
  } catch (e) {
    console.error("admin listing-sales PATCH", e);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
