import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import type { AgentApplicationMetadata } from "@/lib/agent-application";

type AgentPublicMetadata = {
  isAgent?: boolean;
  agentStatus?: "none" | "pending" | "approved" | "rejected";
  agentProfile?: {
    phone?: string;
    role?: string;
    location?: string;
  };
  agentApplication?: AgentApplicationMetadata;
};

type UpdateAgentProfilePayload = {
  name?: string;
  phone?: string;
  role?: string;
  location?: string;
};

const splitFullName = (name: string) => {
  const normalized = name.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const parts = normalized.split(" ");
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const publicMetadata = (user.publicMetadata ?? {}) as AgentPublicMetadata;
    const unsafeMetadata = (user.unsafeMetadata ?? {}) as {
      requestedRole?: "agent" | "client";
    };

    const requestedRole = unsafeMetadata.requestedRole ?? "client";
    const isAgent = Boolean(publicMetadata.isAgent) || requestedRole === "agent";
    const agentStatus = publicMetadata.agentStatus ?? (isAgent ? "none" : "none");
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.username ||
      "";
    const email = user.emailAddresses[0]?.emailAddress ?? null;
    const phoneFromClerk = user.phoneNumbers[0]?.phoneNumber ?? null;
    const phoneFromApplication =
      publicMetadata.agentApplication?.telefon?.trim() || null;
    let phoneFromDb: string | null = null;

    let googleCalendarConnected = false;
    let googleCalendarEmail: string | null = null;

    if (email) {
      const dbAgent = await prisma.agent.findFirst({
        where: { email },
        select: { phone: true, googleRefreshToken: true, googleCalendarEmail: true },
      });
      phoneFromDb = dbAgent?.phone ?? null;
      googleCalendarConnected = Boolean(dbAgent?.googleRefreshToken);
      googleCalendarEmail = dbAgent?.googleCalendarEmail ?? null;
    }

    return NextResponse.json({
      id: user.id,
      email,
      name: fullName || null,
      phone:
        publicMetadata.agentProfile?.phone ??
        phoneFromApplication ??
        phoneFromDb ??
        phoneFromClerk,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
      isAgent,
      agentStatus,
      agentApplication: publicMetadata.agentApplication ?? null,
      agentProfile: {
        phone:
          publicMetadata.agentProfile?.phone ??
          phoneFromApplication ??
          phoneFromDb ??
          phoneFromClerk,
        role: publicMetadata.agentProfile?.role ?? "Agent imobiliar",
        location: publicMetadata.agentProfile?.location ?? "Bucuresti",
      },
      googleCalendar: {
        connected: googleCalendarConnected,
        googleCalendarEmail,
      },
    });
  } catch (error) {
    console.error("Failed to fetch agent profile", error);
    return NextResponse.json(
      { error: "Eroare la citirea profilului de agent" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateAgentProfilePayload;
    const name = body.name?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const role = body.role?.trim() ?? "";
    const location = body.location?.trim() ?? "";

    if (!name || !phone || !role || !location) {
      return NextResponse.json(
        { error: "Completeaza toate campurile profilului." },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const currentMetadata = (user.publicMetadata ?? {}) as AgentPublicMetadata;
    const { firstName, lastName } = splitFullName(name);
    const email = user.emailAddresses[0]?.emailAddress ?? null;

    await client.users.updateUser(userId, {
      firstName,
      lastName: lastName || undefined,
    });

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...currentMetadata,
        agentProfile: {
          phone,
          role,
          location,
        },
      },
    });

    if (email) {
      await prisma.agent.updateMany({
        where: { email },
        data: {
          name,
          phone,
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        name,
        email,
        phone,
        role,
        location,
      },
    });
  } catch (error) {
    console.error("Failed to update agent profile", error);
    return NextResponse.json(
      { error: "Eroare la actualizarea profilului de agent" },
      { status: 500 }
    );
  }
}
