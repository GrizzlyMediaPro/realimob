import { NextRequest, NextResponse } from "next/server";
import { getViewingSlotsForListingId } from "@/lib/viewing-booking";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await getViewingSlotsForListingId(id);

    if (!result.ok) {
      if (result.code === "not_found") {
        return NextResponse.json({ error: "Anunț inexistent" }, { status: 404 });
      }
      if (result.code === "not_approved") {
        return NextResponse.json(
          { error: "Anunț indisponibil", slots: [] },
          { status: 200 },
        );
      }
      return NextResponse.json(
        {
          slots: [],
          code: "no_calendar",
          message:
            "Agentul nu are Google Calendar conectat. Poți lua legătura prin WhatsApp sau telefon.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ slots: result.slots });
  } catch (e) {
    console.error("viewing-slots", e);
    return NextResponse.json(
      { error: "Nu am putut încărca disponibilitatea" },
      { status: 500 },
    );
  }
}
