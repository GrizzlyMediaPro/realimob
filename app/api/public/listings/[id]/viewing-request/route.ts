import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertValidViewingSlotForListing } from "@/lib/viewing-booking";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: listingId } = await params;
    const body = await request.json();
    const startIso = body?.start as string | undefined;
    const endIso = body?.end as string | undefined;
    const clientName = String(body?.clientName ?? "").trim();
    const clientEmail = String(body?.clientEmail ?? "")
      .trim()
      .toLowerCase();
    const clientPhone = body?.clientPhone
      ? String(body.clientPhone).trim()
      : "";
    const message = body?.message ? String(body.message).trim() : "";

    if (!startIso || !endIso || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: "Completează intervalul, numele și emailul." },
        { status: 400 },
      );
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail);
    if (!emailOk) {
      return NextResponse.json({ error: "Email invalid." }, { status: 400 });
    }

    const start = new Date(startIso);
    const end = new Date(endIso);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Date invalide." }, { status: 400 });
    }
    if (end.getTime() <= start.getTime()) {
      return NextResponse.json({ error: "Interval invalid." }, { status: 400 });
    }

    const check = await assertValidViewingSlotForListing(listingId, start, end);
    if (!check.ok) {
      if (check.code === "invalid_slot") {
        return NextResponse.json(
          {
            error:
              "Acest interval nu mai este disponibil. Reîncarcă și alege altă oră.",
          },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "Nu se poate crea cererea pentru acest anunț." },
        { status: 400 },
      );
    }

    const created = await prisma.viewingBookingRequest.create({
      data: {
        listingId: check.listing.id,
        agentId: check.listing.agentId,
        startAt: start,
        endAt: end,
        clientName,
        clientEmail,
        clientPhone: clientPhone || null,
        message: message || null,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      id: created.id,
      message:
        "Cererea a fost trimisă. Agentul o va confirma în Google Calendar; vei primi detaliile pe email dacă agentul folosește invitații în calendar.",
    });
  } catch (e) {
    console.error("viewing-request", e);
    return NextResponse.json(
      { error: "A apărut o eroare. Încearcă din nou." },
      { status: 500 },
    );
  }
}
