import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/** Grație după crearea chestionarului (vizionare încheiată) înainte de suspendare automată. */
export const QUESTIONNAIRE_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export const AGENT_SUSPENSION_REASON_QUESTIONNAIRE = "viewing_questionnaire_overdue";

type ClerkPublicMeta = {
  isAgent?: boolean;
  agentStatus?: string;
  agentSuspensionReason?: string;
};

async function findClerkUserIdByEmail(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const client = await clerkClient();
  const list = await client.users.getUserList({
    emailAddress: [normalized],
    limit: 5,
  });
  const u = list.data[0];
  return u?.id ?? null;
}

/**
 * Suspendă în Clerk agenții aprobați cu chestionare necompletate după grație.
 */
export async function enforceQuestionnaireSuspensions(): Promise<{
  suspendedCount: number;
}> {
  const cutoff = new Date(Date.now() - QUESTIONNAIRE_GRACE_MS);
  const overdue = await prisma.viewingQuestionnaire.findMany({
    where: {
      agentSubmittedAt: null,
      createdAt: { lte: cutoff },
    },
    select: { agentId: true },
  });
  const uniqueAgentIds = [...new Set(overdue.map((o) => o.agentId))];
  let suspendedCount = 0;
  const client = await clerkClient();

  for (const agentId of uniqueAgentIds) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { email: true },
    });
    const email = agent?.email?.trim();
    if (!email) continue;

    const userId = await findClerkUserIdByEmail(email);
    if (!userId) continue;

    const user = await client.users.getUser(userId);
    const meta = (user.publicMetadata ?? {}) as ClerkPublicMeta;
    if (meta.agentStatus !== "approved") continue;

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...meta,
        agentStatus: "suspended",
        agentSuspensionReason: AGENT_SUSPENSION_REASON_QUESTIONNAIRE,
      },
    });
    suspendedCount += 1;
  }

  return { suspendedCount };
}

export type AgentQuestionnaireCompliance = {
  gracePeriodWarning: boolean;
  pendingInGraceCount: number;
  nextDeadlineIso: string | null;
  hoursRemainingApprox: number | null;
};

export async function getAgentQuestionnaireCompliance(
  agentId: string,
): Promise<AgentQuestionnaireCompliance> {
  const now = Date.now();
  const inGrace = await prisma.viewingQuestionnaire.findMany({
    where: {
      agentId,
      agentSubmittedAt: null,
      createdAt: { gt: new Date(now - QUESTIONNAIRE_GRACE_MS) },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  if (inGrace.length === 0) {
    return {
      gracePeriodWarning: false,
      pendingInGraceCount: 0,
      nextDeadlineIso: null,
      hoursRemainingApprox: null,
    };
  }

  const oldest = inGrace[0].createdAt.getTime();
  const deadlineMs = oldest + QUESTIONNAIRE_GRACE_MS;
  const hoursRemainingApprox = Math.max(
    0,
    Math.ceil((deadlineMs - now) / (60 * 60 * 1000)),
  );

  return {
    gracePeriodWarning: true,
    pendingInGraceCount: inGrace.length,
    nextDeadlineIso: new Date(deadlineMs).toISOString(),
    hoursRemainingApprox,
  };
}

/**
 * Dacă nu mai există chestionare depășite necompletate, reactivează agentul
 * suspendat automat pentru chestionare.
 */
export async function tryRestoreAgentAfterQuestionnaireProgress(
  agentId: string,
): Promise<void> {
  const cutoff = new Date(Date.now() - QUESTIONNAIRE_GRACE_MS);
  const stillOverdue = await prisma.viewingQuestionnaire.count({
    where: {
      agentId,
      agentSubmittedAt: null,
      createdAt: { lte: cutoff },
    },
  });
  if (stillOverdue > 0) return;

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { email: true },
  });
  const email = agent?.email?.trim();
  if (!email) return;

  const userId = await findClerkUserIdByEmail(email);
  if (!userId) return;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = { ...(user.publicMetadata ?? {}) } as Record<string, unknown> &
    ClerkPublicMeta;

  if (meta.agentStatus !== "suspended") return;
  if (meta.agentSuspensionReason !== AGENT_SUSPENSION_REASON_QUESTIONNAIRE) return;

  const next = { ...meta };
  delete next.agentSuspensionReason;
  next.agentStatus = "approved";
  await client.users.updateUserMetadata(userId, {
    publicMetadata: next,
  });
}
