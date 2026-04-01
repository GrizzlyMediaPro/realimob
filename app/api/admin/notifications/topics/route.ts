import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

type TopicPayload = {
  topicId: string;
  sendToAgents: boolean;
  sendToClients: boolean;
  sendToAdmins: boolean;
};

export async function PUT(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const body = (await request.json()) as { topics?: TopicPayload[] };
    const list = body.topics;
    if (!Array.isArray(list) || list.length === 0) {
      return NextResponse.json(
        { error: "Lipsește lista de topicuri." },
        { status: 400 }
      );
    }

    for (const row of list) {
      if (
        typeof row.topicId !== "string" ||
        typeof row.sendToAgents !== "boolean" ||
        typeof row.sendToClients !== "boolean" ||
        typeof row.sendToAdmins !== "boolean"
      ) {
        return NextResponse.json(
          { error: "Date topic nevalide." },
          { status: 400 }
        );
      }

      await prisma.emailTopicPreference.update({
        where: { topicId: row.topicId },
        data: {
          sendToAgents: row.sendToAgents,
          sendToClients: row.sendToClients,
          sendToAdmins: row.sendToAdmins,
        },
      });
    }

    const topics = await prisma.emailTopicPreference.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("PUT /api/admin/notifications/topics", error);
    return NextResponse.json(
      { error: "Nu am putut salva preferințele." },
      { status: 500 }
    );
  }
}
