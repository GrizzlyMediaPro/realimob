import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPrimaryCalendarEventForAgentId } from "@/lib/google-calendar";

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

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? null;
    if (!email) {
      return NextResponse.json({ error: "Email indisponibil" }, { status: 400 });
    }

    const agent = await prisma.agent.findFirst({
      where: { email },
      select: { id: true, googleRefreshToken: true },
    });
    if (!agent?.googleRefreshToken) {
      return NextResponse.json(
        { error: "Conectează Google Calendar înainte de aprobare." },
        { status: 400 },
      );
    }

    const booking = await prisma.viewingBookingRequest.findUnique({
      where: { id: requestId },
      include: { listing: { select: { title: true } } },
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

    const start = booking.startAt;
    const end = booking.endAt;
    const event = await createPrimaryCalendarEventForAgentId(agent.id, {
      summary: `Vizionare — ${booking.listing.title}`,
      description: [
        `Client: ${booking.clientName}`,
        booking.clientPhone ? `Tel: ${booking.clientPhone}` : "",
        booking.message ? `Mesaj: ${booking.message}` : "",
        `Email client: ${booking.clientEmail}`,
      ]
        .filter(Boolean)
        .join("\n"),
      start,
      end,
      attendeeEmails: [booking.clientEmail],
    });

    await prisma.viewingBookingRequest.update({
      where: { id: requestId },
      data: {
        status: "approved",
        googleEventId: event.id ?? null,
      },
    });

    return NextResponse.json({ success: true, googleEventId: event.id });
  } catch (e) {
    console.error("viewing approve", e);
    const msg = e instanceof Error ? e.message : "";
    return NextResponse.json(
      {
        error:
          msg.includes("invalid_grant") || msg.includes("401")
            ? "Token Google expirat. Reconectează calendarul."
            : "Nu am putut crea evenimentul în calendar. Verifică disponibilitatea.",
      },
      { status: 500 },
    );
  }
}
