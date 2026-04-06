import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncCompletedViewingQuestionnaires } from "@/lib/viewing-questionnaire-sync";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    await syncCompletedViewingQuestionnaires();

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress?.trim().toLowerCase() ?? null;

    const agent = email
      ? await prisma.agent.findFirst({
          where: { email },
          select: { id: true },
        })
      : null;

    const or: { agentId?: string; clientEmail?: string }[] = [];
    if (agent?.id) or.push({ agentId: agent.id });
    if (email) or.push({ clientEmail: email });

    if (or.length === 0) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.appNotification.findMany({
      where: { OR: or },
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        id: true,
        createdAt: true,
        readAt: true,
        type: true,
        title: true,
        body: true,
        href: true,
      },
    });

    return NextResponse.json({ notifications });
  } catch (e) {
    console.error("notifications GET", e);
    return NextResponse.json(
      { error: "Eroare la încărcarea notificărilor" },
      { status: 500 },
    );
  }
}
