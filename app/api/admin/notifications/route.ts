import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_EMAIL_TOPICS } from "@/lib/emailDefaults";
import { requireAdmin } from "@/lib/requireAdmin";
import {
  isEmailFromConfigured,
  isResendConfigured,
} from "@/lib/resend";

async function ensureDefaultTopics() {
  for (const t of DEFAULT_EMAIL_TOPICS) {
    await prisma.emailTopicPreference.upsert({
      where: { topicId: t.topicId },
      create: {
        topicId: t.topicId,
        label: t.label,
        description: t.description,
        sortOrder: t.sortOrder,
        sendToAgents: t.sendToAgents,
        sendToClients: t.sendToClients,
        sendToAdmins: t.sendToAdmins,
      },
      update: {},
    });
  }
}

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    await ensureDefaultTopics();

    const [topics, templates] = await Promise.all([
      prisma.emailTopicPreference.findMany({
        orderBy: { sortOrder: "asc" },
      }),
      prisma.emailTemplate.findMany({
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      topics,
      templates,
      emailConfigured: {
        resend: isResendConfigured(),
        from: isEmailFromConfigured(),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/notifications", error);
    return NextResponse.json(
      { error: "Nu am putut încărca setările de notificări." },
      { status: 500 }
    );
  }
}
