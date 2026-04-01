import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
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

    const { id: requestId } = await params;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? null;
    if (!email) {
      return NextResponse.json({ error: "Email indisponibil" }, { status: 400 });
    }

    const agent = await prisma.agent.findFirst({
      where: { email },
      select: { id: true },
    });
    if (!agent) {
      return NextResponse.json({ error: "Agent inexistent" }, { status: 404 });
    }

    const booking = await prisma.viewingBookingRequest.findUnique({
      where: { id: requestId },
    });

    if (!booking || booking.agentId !== agent.id) {
      return NextResponse.json({ error: "Cerere inexistentă" }, { status: 404 });
    }
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Cererea nu mai este în așteptare." },
        { status: 400 },
      );
    }

    await prisma.viewingBookingRequest.update({
      where: { id: requestId },
      data: { status: "rejected" },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("viewing reject", e);
    return NextResponse.json({ error: "Eroare" }, { status: 500 });
  }
}
