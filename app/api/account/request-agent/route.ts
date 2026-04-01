import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const publicMetadata = (user.publicMetadata ?? {}) as {
      agentStatus?: string;
    };
    const unsafe = (user.unsafeMetadata ?? {}) as {
      requestedRole?: "agent" | "client";
    };

    if (publicMetadata.agentStatus === "approved") {
      return NextResponse.json(
        { error: "Contul tău este deja agent aprobat.", code: "already_approved" },
        { status: 400 },
      );
    }

    if (unsafe.requestedRole === "agent") {
      return NextResponse.json({ success: true, alreadyRequested: true });
    }

    await client.users.updateUserMetadata(userId, {
      unsafeMetadata: {
        ...unsafe,
        requestedRole: "agent",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("request-agent", error);
    return NextResponse.json(
      { error: "Nu am putut activa fluxul de agent" },
      { status: 500 },
    );
  }
}
