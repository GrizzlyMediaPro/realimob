import { prisma } from "@/lib/prisma";
import { enforceQuestionnaireSuspensions } from "@/lib/agent-questionnaire-compliance";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Pentru fiecare vizionare aprobată al cărei interval s-a încheiat, creează
 * rândul de chestionar și notificările pentru agent și client.
 */
export async function syncCompletedViewingQuestionnaires(): Promise<{
  created: number;
}> {
  const now = new Date();
  const bookings = await prisma.viewingBookingRequest.findMany({
    where: {
      status: "approved",
      endAt: { lte: now },
      questionnaire: null,
    },
    select: {
      id: true,
      listingId: true,
      agentId: true,
      clientEmail: true,
      clientName: true,
      listing: { select: { title: true } },
    },
  });

  let created = 0;
  for (const b of bookings) {
    const emailNorm = normalizeEmail(b.clientEmail);
    try {
      await prisma.$transaction(async (tx) => {
        await tx.viewingQuestionnaire.create({
          data: {
            viewingRequestId: b.id,
            listingId: b.listingId,
            agentId: b.agentId,
            clientEmail: emailNorm,
          },
        });
        await tx.appNotification.create({
          data: {
            type: "viewing_questionnaire",
            title: "Chestionar după vizionare",
            body: `Completează chestionarul pentru vizionarea la „${b.listing.title}”.`,
            href: `/cont/chestionar-vizionare/${b.id}`,
            clientEmail: emailNorm,
          },
        });
        await tx.appNotification.create({
          data: {
            type: "viewing_questionnaire",
            title: "Chestionar după vizionare",
            body: `Chestionar vizionare — ${b.clientName} („${b.listing.title}”).`,
            href: `/agent/chestionar-vizionare/${b.id}`,
            agentId: b.agentId,
          },
        });
      });
      created += 1;
    } catch (e) {
      console.error("syncCompletedViewingQuestionnaires booking", b.id, e);
    }
  }

  await enforceQuestionnaireSuspensions();

  return { created };
}
