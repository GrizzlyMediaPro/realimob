import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const rows = await prisma.viewingQuestionnaire.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        listing: { select: { id: true, title: true, transactionType: true } },
        agent: { select: { id: true, name: true, email: true } },
        viewingRequest: {
          select: {
            id: true,
            startAt: true,
            endAt: true,
            clientName: true,
            clientEmail: true,
            status: true,
          },
        },
      },
    });

    const payload = rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      clientEmail: r.clientEmail,
      agentSubmittedAt: r.agentSubmittedAt?.toISOString() ?? null,
      clientSubmittedAt: r.clientSubmittedAt?.toISOString() ?? null,
      agentAnswers: r.agentAnswers,
      clientAnswers: r.clientAnswers,
      listing: r.listing,
      agent: r.agent,
      viewingRequest: {
        ...r.viewingRequest,
        startAt: r.viewingRequest.startAt.toISOString(),
        endAt: r.viewingRequest.endAt.toISOString(),
      },
    }));

    return NextResponse.json({ questionnaires: payload });
  } catch (e) {
    console.error("admin viewing-questionnaires", e);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
