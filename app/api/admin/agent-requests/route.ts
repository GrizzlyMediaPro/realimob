import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type AgentStatus = "pending" | "approved" | "rejected" | "none";

const getUserStatus = (status: unknown): AgentStatus => {
  if (status === "pending" || status === "approved" || status === "rejected") {
    return status;
  }
  return "none";
};

async function assertAdmin(userId: string) {
  const client = await clerkClient();
  const currentUser = await client.users.getUser(userId);
  const isAdmin = Boolean(currentUser.publicMetadata?.isAdmin);

  if (!isAdmin) {
    return null;
  }

  return client;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const client = await assertAdmin(userId);
    if (!client) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const usersResponse = await client.users.getUserList({
      orderBy: "-created_at",
      limit: 100,
    });

    const users = usersResponse.data
      .filter((user) => {
        const requestedRole = (user.unsafeMetadata as { requestedRole?: string } | undefined)?.requestedRole;
        const publicMetadata = user.publicMetadata as { isAgent?: boolean } | undefined;
        return requestedRole === "agent" || Boolean(publicMetadata?.isAgent);
      })
      .map((user) => {
        const metadata = user.publicMetadata as {
          agentStatus?: AgentStatus;
          agentApplication?: {
            buletinUrl?: string;
            formaOrganizare?: string;
            cui?: string;
            submittedAt?: string;
          };
        };
        const app = metadata.agentApplication ?? {};

        return {
          id: user.id,
          nume:
            [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
            user.username ||
            user.emailAddresses[0]?.emailAddress ||
            "Agent fără nume",
          email: user.emailAddresses[0]?.emailAddress ?? "-",
          telefon: user.phoneNumbers[0]?.phoneNumber ?? "-",
          status: getUserStatus(metadata.agentStatus),
          dataInregistrare: new Date(user.createdAt).toISOString(),
          formaOrganizare: app.formaOrganizare ?? null,
          cui: app.cui ?? null,
          buletinUrl: app.buletinUrl ?? null,
          submittedAt: app.submittedAt ?? null,
        };
      });

    return NextResponse.json({ agents: users });
  } catch (error) {
    console.error("Failed to fetch agent requests", error);
    return NextResponse.json(
      { error: "Eroare la citirea cererilor de agent" },
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

    const client = await assertAdmin(userId);
    if (!client) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const body = (await request.json()) as { targetUserId?: string; action?: "approve" | "reject" };
    const targetUserId = body.targetUserId?.trim();
    const action = body.action;

    if (!targetUserId || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { error: "Date invalide pentru actualizarea cererii." },
        { status: 400 }
      );
    }

    const targetUser = await client.users.getUser(targetUserId);
    const targetMetadata = (targetUser.publicMetadata ?? {}) as {
      agentApplication?: {
        submittedAt?: string;
      };
    };

    const nextStatus = action === "approve" ? "approved" : "rejected";

    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        ...(targetUser.publicMetadata ?? {}),
        isAgent: true,
        agentStatus: nextStatus,
        agentApplication: {
          ...(targetMetadata.agentApplication ?? {}),
          reviewedAt: new Date().toISOString(),
          reviewedBy: userId,
        },
      },
    });

    if (action === "approve") {
      const email = targetUser.emailAddresses[0]?.emailAddress;
      const phone = targetUser.phoneNumbers[0]?.phoneNumber;
      const name =
        [targetUser.firstName, targetUser.lastName].filter(Boolean).join(" ").trim() ||
        targetUser.username ||
        email ||
        "Agent";

      if (email) {
        const existing = await prisma.agent.findFirst({
          where: { email },
          select: { id: true },
        });

        if (!existing) {
          await prisma.agent.create({
            data: {
              name,
              email,
              phone: phone ?? null,
              avatar: targetUser.imageUrl ?? null,
              sectors: [],
              rating: 3.0,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update agent request", error);
    return NextResponse.json(
      { error: "Eroare la actualizarea cererii de agent" },
      { status: 500 }
    );
  }
}
