import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { AgentApplicationMetadata } from "@/lib/agent-application";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const body = (await request.json()) as {
      signedContractUrl?: string;
      signedContractFileName?: string;
    };
    const signedContractUrl = body.signedContractUrl?.trim();
    const signedContractFileName = body.signedContractFileName?.trim();
    if (!signedContractUrl) {
      return NextResponse.json(
        { error: "Lipsește URL-ul documentului semnat." },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const unsafeMetadata = (user.unsafeMetadata ?? {}) as {
      requestedRole?: "agent" | "client";
    };
    if (unsafeMetadata.requestedRole !== "agent") {
      return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
    }

    const publicMetadata = (user.publicMetadata ?? {}) as {
      agentStatus?: string;
      agentApplication?: AgentApplicationMetadata;
    };

    if (publicMetadata.agentStatus !== "pending") {
      return NextResponse.json(
        { error: "Poți încărca contractul semnat doar cât timp cererea este în așteptare." },
        { status: 400 }
      );
    }

    const app = publicMetadata.agentApplication ?? {};
    if (!app.contractTemplateUrl) {
      return NextResponse.json(
        { error: "Administratorul nu a trimis încă contractul pentru semnare." },
        { status: 400 }
      );
    }

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...(user.publicMetadata ?? {}),
        agentApplication: {
          ...app,
          signedContractUrl,
          signedContractFileName: signedContractFileName || undefined,
          signedUploadedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("signed-contract POST", error);
    return NextResponse.json(
      { error: "Eroare la salvarea contractului semnat." },
      { status: 500 }
    );
  }
}
