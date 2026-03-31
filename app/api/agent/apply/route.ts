import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

type AgentApplicationPayload = {
  buletinUrl?: string;
  formaOrganizare?: string;
  cui?: string;
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const body = (await request.json()) as AgentApplicationPayload;
    const buletinUrl = body.buletinUrl?.trim();
    const formaOrganizare = body.formaOrganizare?.trim();
    const cui = body.cui?.trim();

    if (!buletinUrl || !formaOrganizare || !cui) {
      return NextResponse.json(
        { error: "Completează toate câmpurile obligatorii." },
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

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...(user.publicMetadata ?? {}),
        isAgent: true,
        agentStatus: "pending",
        agentApplication: {
          buletinUrl,
          formaOrganizare,
          cui,
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
