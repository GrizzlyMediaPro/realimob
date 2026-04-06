import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { id } = await params;
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress?.trim().toLowerCase() ?? null;

    const agent = email
      ? await prisma.agent.findFirst({ where: { email }, select: { id: true } })
      : null;

    const n = await prisma.appNotification.findUnique({
      where: { id },
      select: { id: true, agentId: true, clientEmail: true },
    });
    if (!n) {
      return NextResponse.json({ error: "Lipsă" }, { status: 404 });
    }

    const allowed =
      (n.agentId && agent?.id === n.agentId) ||
      (n.clientEmail && email && n.clientEmail === email);
    if (!allowed) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    await prisma.appNotification.update({
      where: { id: n.id },
      data: { readAt: null },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("notification unread", e);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
