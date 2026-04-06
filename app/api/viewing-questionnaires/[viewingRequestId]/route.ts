import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { syncCompletedViewingQuestionnaires } from "@/lib/viewing-questionnaire-sync";
import { parseQuestionnaireBody } from "@/lib/viewing-questionnaire-types";
import { tryRestoreAgentAfterQuestionnaireProgress } from "@/lib/agent-questionnaire-compliance";

async function getActor() {
  const { userId } = await auth();
  if (!userId) return null;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress?.trim().toLowerCase() ?? null;
  const agent = email
    ? await prisma.agent.findFirst({ where: { email }, select: { id: true } })
    : null;
  return { userId, email, agentId: agent?.id ?? null };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ viewingRequestId: string }> },
) {
  try {
    const actor = await getActor();
    if (!actor) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    await syncCompletedViewingQuestionnaires();

    const { viewingRequestId } = await params;
    const booking = await prisma.viewingBookingRequest.findUnique({
      where: { id: viewingRequestId },
      include: {
        listing: { select: { id: true, title: true, price: true, currency: true } },
        questionnaire: true,
      },
    });

    if (!booking || booking.status !== "approved") {
      return NextResponse.json({ error: "Vizionare inexistentă" }, { status: 404 });
    }

    const isAgent = actor.agentId === booking.agentId;
    const clientEmailNorm = booking.clientEmail.trim().toLowerCase();
    const isClient = Boolean(actor.email && actor.email === clientEmailNorm);
    if (!isAgent && !isClient) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    if (!booking.questionnaire) {
      return NextResponse.json(
        {
          error: "Chestionarul nu este încă disponibil (după încheierea intervalului programat).",
          code: "not_ready",
        },
        { status: 400 },
      );
    }

    const q = booking.questionnaire;
    const role = isAgent ? "agent" : "client";
    const alreadySubmitted =
      role === "agent" ? Boolean(q.agentSubmittedAt) : Boolean(q.clientSubmittedAt);

    return NextResponse.json({
      role,
      listing: booking.listing,
      viewing: {
        startAt: booking.startAt.toISOString(),
        endAt: booking.endAt.toISOString(),
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
      },
      questionnaire: {
        id: q.id,
        agentAnswers: q.agentAnswers,
        clientAnswers: q.clientAnswers,
        agentSubmittedAt: q.agentSubmittedAt?.toISOString() ?? null,
        clientSubmittedAt: q.clientSubmittedAt?.toISOString() ?? null,
      },
      alreadySubmitted,
    });
  } catch (e) {
    console.error("viewing-questionnaire GET", e);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ viewingRequestId: string }> },
) {
  try {
    const actor = await getActor();
    if (!actor) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    await syncCompletedViewingQuestionnaires();

    const { viewingRequestId } = await params;
    const body = (await request.json()) as { answers?: unknown };
    const answers = parseQuestionnaireBody(body.answers);
    if (!answers) {
      return NextResponse.json(
        { error: "Date chestionar incomplete sau invalide." },
        { status: 400 },
      );
    }

    const booking = await prisma.viewingBookingRequest.findUnique({
      where: { id: viewingRequestId },
      include: {
        listing: { select: { id: true, currency: true } },
        questionnaire: true,
      },
    });

    if (!booking || booking.status !== "approved" || !booking.questionnaire) {
      return NextResponse.json({ error: "Vizionare sau chestionar inexistent" }, { status: 404 });
    }

    const isAgent = actor.agentId === booking.agentId;
    const clientEmailNorm = booking.clientEmail.trim().toLowerCase();
    const isClient = Boolean(actor.email && actor.email === clientEmailNorm);
    if (!isAgent && !isClient) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const q = booking.questionnaire;
    if (isAgent && q.agentSubmittedAt) {
      return NextResponse.json({ error: "Ai trimis deja chestionarul." }, { status: 400 });
    }
    if (!isAgent && q.clientSubmittedAt) {
      return NextResponse.json({ error: "Ai trimis deja chestionarul." }, { status: 400 });
    }

    const currency =
      answers.offerCurrency?.trim() || booking.listing.currency || "RON";

    await prisma.$transaction(async (tx) => {
      if (isAgent) {
        await tx.viewingQuestionnaire.update({
          where: { id: q.id },
          data: {
            agentAnswers: answers as unknown as Prisma.InputJsonValue,
            agentSubmittedAt: new Date(),
          },
        });
        if (answers.wantsOffer && answers.offerAmount != null && answers.offerAmount > 0) {
          await tx.listingOffer.create({
            data: {
              listingId: booking.listingId,
              viewingRequestId: booking.id,
              proposedBy: "agent",
              amount: answers.offerAmount,
              currency,
              note: answers.additionalNotes?.slice(0, 500) || null,
              status: "confirmed",
            },
          });
        }
      } else {
        await tx.viewingQuestionnaire.update({
          where: { id: q.id },
          data: {
            clientAnswers: answers as unknown as Prisma.InputJsonValue,
            clientSubmittedAt: new Date(),
          },
        });
        if (answers.wantsOffer && answers.offerAmount != null && answers.offerAmount > 0) {
          await tx.listingOffer.create({
            data: {
              listingId: booking.listingId,
              viewingRequestId: booking.id,
              proposedBy: "client",
              amount: answers.offerAmount,
              currency,
              note: answers.additionalNotes?.slice(0, 500) || null,
              status: "pending",
            },
          });
        }
      }
    });

    if (isAgent) {
      await tryRestoreAgentAfterQuestionnaireProgress(booking.agentId);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("viewing-questionnaire POST", e);
    return NextResponse.json({ error: "Eroare la salvare" }, { status: 500 });
  }
}
