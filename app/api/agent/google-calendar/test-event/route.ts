import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createPrimaryCalendarEventForAgentEmail } from "@/lib/google-calendar";
import { rejectIfAgentSuspended } from "@/lib/reject-if-agent-suspended";

/**
 * Creează un eveniment de test (30 min) în Google Calendar al agentului conectat.
 * Folosește pentru verificare după OAuth.
 */
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const suspended = await rejectIfAgentSuspended(userId);
    if (suspended) return suspended;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? null;
    if (!email) {
      return NextResponse.json({ error: "Email indisponibil" }, { status: 400 });
    }

    const start = new Date();
    start.setMinutes(start.getMinutes() + 5);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const event = await createPrimaryCalendarEventForAgentEmail(email, {
      summary: "Test RealImob – programare",
      description: "Eveniment de test creat din panoul agent.",
      start,
      end,
    });

    return NextResponse.json({
      success: true,
      eventId: event.id,
      htmlLink: event.htmlLink,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Eroare la crearea evenimentului";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
