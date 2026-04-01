import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const FORME_ORGANIZARE = ["PFA", "SRL"] as const;

type AgentApplicationPayload = {
  buletinUrl?: string;
  formaOrganizare?: string;
  cui?: string;
  telefon?: string;
  gdprAccepted?: boolean;
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const body = (await request.json()) as AgentApplicationPayload;
    const buletinUrl = body.buletinUrl?.trim();
    const formaRaw = body.formaOrganizare?.trim().toUpperCase();
    const formaOrganizare =
      formaRaw && FORME_ORGANIZARE.includes(formaRaw as (typeof FORME_ORGANIZARE)[number])
        ? formaRaw
        : "";
    const cui = body.cui?.trim();
    const telefon = body.telefon?.trim();
    const gdprAccepted = body.gdprAccepted === true;

    if (!buletinUrl || !formaOrganizare || !cui || !telefon) {
      return NextResponse.json(
        { error: "Completează toate câmpurile obligatorii, inclusiv numărul de telefon." },
        { status: 400 }
      );
    }

    if (!gdprAccepted) {
      return NextResponse.json(
        { error: "Trebuie să accepți prelucrarea datelor cu caracter personal (GDPR) pentru a trimite cererea." },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const unsafeMetadata = (user.unsafeMetadata ?? {}) as {
      requestedRole?: "agent" | "client";
    };

    if (unsafeMetadata.requestedRole !== "agent") {
      return NextResponse.json(
        { error: "Doar conturile de agent pot trimite această cerere." },
        { status: 403 }
      );
    }

    const publicMeta = (user.publicMetadata ?? {}) as { agentStatus?: string };
    if (publicMeta.agentStatus === "approved") {
      return NextResponse.json(
        { error: "Contul este deja aprobat." },
        { status: 400 }
      );
    }

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...(user.publicMetadata ?? {}),
        isAgent: true,
        agentStatus: "pending",
        agentApplication: {
          buletinUrl,
          formaOrganizare,
          cui,
          telefon,
          gdprAcceptedAt: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit agent application", error);
    return NextResponse.json(
      { error: "Eroare la trimiterea cererii de agent" },
      { status: 500 }
    );
  }
}
