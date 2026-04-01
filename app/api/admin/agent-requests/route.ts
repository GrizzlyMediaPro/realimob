import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { AgentApplicationMetadata } from "@/lib/agent-application";

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

function splitFullName(nume: string) {
  const normalized = nume.trim().replace(/\s+/g, " ");
  if (!normalized) return { firstName: "", lastName: "" };
  const parts = normalized.split(" ");
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
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
        const requestedRole = (user.unsafeMetadata as { requestedRole?: string } | undefined)
          ?.requestedRole;
        const publicMetadata = user.publicMetadata as { isAgent?: boolean } | undefined;
        return requestedRole === "agent" || Boolean(publicMetadata?.isAgent);
      })
      .map((user) => {
        const metadata = user.publicMetadata as {
          agentStatus?: AgentStatus;
          agentApplication?: AgentApplicationMetadata;
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
          telefon:
            (app.telefon && app.telefon.trim()) ||
            user.phoneNumbers[0]?.phoneNumber ||
            "-",
          status: getUserStatus(metadata.agentStatus),
          dataInregistrare: new Date(user.createdAt).toISOString(),
          formaOrganizare: app.formaOrganizare ?? null,
          cui: app.cui ?? null,
          buletinUrl: app.buletinUrl ?? null,
          submittedAt: app.submittedAt ?? null,
          rejectionMessage: app.rejectionMessage ?? null,
          contractTemplateUrl: app.contractTemplateUrl ?? null,
          contractTemplateFileName: app.contractTemplateFileName ?? null,
          contractSentAt: app.contractSentAt ?? null,
          signedContractUrl: app.signedContractUrl ?? null,
          signedContractFileName: app.signedContractFileName ?? null,
          signedUploadedAt: app.signedUploadedAt ?? null,
          reviewedAt: app.reviewedAt ?? null,
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

type PatchBody =
  | { targetUserId: string; action: "approve" }
  | { targetUserId: string; action: "reject"; message: string }
  | {
      targetUserId: string;
      action: "send_contract";
      contractTemplateUrl: string;
      contractTemplateFileName?: string;
    }
  | {
      targetUserId: string;
      action: "update";
      updates: {
        nume?: string;
        telefon?: string;
        formaOrganizare?: string;
        cui?: string;
      };
    };

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

    const body = (await request.json()) as PatchBody;
    const targetUserId = body.targetUserId?.trim();
    if (!targetUserId) {
      return NextResponse.json({ error: "Lipsește utilizatorul țintă." }, { status: 400 });
    }

    const targetUser = await client.users.getUser(targetUserId);
    const targetMetadata = (targetUser.publicMetadata ?? {}) as {
      agentApplication?: AgentApplicationMetadata;
      agentStatus?: AgentStatus;
      isAgent?: boolean;
    };
    const app = targetMetadata.agentApplication ?? {};

    if (body.action === "update") {
      const u = body.updates ?? {};
      const nume = u.nume?.trim();
      const telefon = u.telefon?.trim();
      const formaOrganizare = u.formaOrganizare?.trim();
      const cui = u.cui?.trim();

      if (nume) {
        const { firstName, lastName } = splitFullName(nume);
        await client.users.updateUser(targetUserId, {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        });
      }

      const nextApp: AgentApplicationMetadata = { ...app };
      if (telefon !== undefined) nextApp.telefon = telefon || undefined;
      if (formaOrganizare !== undefined) nextApp.formaOrganizare = formaOrganizare || undefined;
      if (cui !== undefined) nextApp.cui = cui || undefined;

      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          ...(targetUser.publicMetadata ?? {}),
          agentApplication: nextApp,
        },
      });

      const email = targetUser.emailAddresses[0]?.emailAddress;
      if (email) {
        const data: { name?: string; phone?: string | null } = {};
        if (nume) data.name = nume;
        if (telefon !== undefined) data.phone = telefon || null;
        if (Object.keys(data).length > 0) {
          await prisma.agent.updateMany({ where: { email }, data });
        }
      }

      return NextResponse.json({ success: true });
    }

    if (body.action === "send_contract") {
      const contractTemplateUrl = body.contractTemplateUrl?.trim();
      const contractTemplateFileName = body.contractTemplateFileName?.trim();
      if (!contractTemplateUrl) {
        return NextResponse.json({ error: "Lipsește fișierul contractului." }, { status: 400 });
      }
      if (!app.submittedAt) {
        return NextResponse.json(
          { error: "Agentul nu a trimis încă datele de verificare." },
          { status: 400 }
        );
      }

      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          ...(targetUser.publicMetadata ?? {}),
          isAgent: true,
          agentStatus: "pending",
          agentApplication: {
            ...app,
            contractTemplateUrl,
            contractTemplateFileName: contractTemplateFileName || undefined,
            contractSentAt: new Date().toISOString(),
          },
        },
      });

      return NextResponse.json({ success: true });
    }

    if (body.action === "reject") {
      const message = body.message?.trim();
      if (!message) {
        return NextResponse.json(
          { error: "Introdu un mesaj pentru agent (explicație respingere)." },
          { status: 400 }
        );
      }

      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          ...(targetUser.publicMetadata ?? {}),
          isAgent: true,
          agentStatus: "rejected",
          agentApplication: {
            ...app,
            reviewedAt: new Date().toISOString(),
            reviewedBy: userId,
            rejectionMessage: message,
          },
        },
      });

      return NextResponse.json({ success: true });
    }

    if (body.action === "approve") {
      if (!app.signedContractUrl?.trim()) {
        return NextResponse.json(
          {
            error:
              "Aprobarea finală este posibilă după ce agentul încarcă contractul semnat. Verifică documentul înainte.",
          },
          { status: 400 }
        );
      }

      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          ...(targetUser.publicMetadata ?? {}),
          isAgent: true,
          agentStatus: "approved",
          agentApplication: {
            ...app,
            reviewedAt: new Date().toISOString(),
            reviewedBy: userId,
          },
        },
      });

      const email = targetUser.emailAddresses[0]?.emailAddress;
      const phone =
        app.telefon?.trim() || targetUser.phoneNumbers[0]?.phoneNumber || null;
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
              phone,
              avatar: targetUser.imageUrl ?? null,
              sectors: [],
              rating: 3.0,
            },
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acțiune necunoscută." }, { status: 400 });
  } catch (error) {
    console.error("Failed to update agent request", error);
    return NextResponse.json(
      { error: "Eroare la actualizarea cererii de agent" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const client = await assertAdmin(userId);
    if (!client) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const body = (await request.json()) as { targetUserId?: string };
    const targetUserId = body.targetUserId?.trim();
    if (!targetUserId) {
      return NextResponse.json({ error: "Lipsește utilizatorul țintă." }, { status: 400 });
    }

    const targetUser = await client.users.getUser(targetUserId);
    const email = targetUser.emailAddresses[0]?.emailAddress;

    if (email) {
      const dbAgent = await prisma.agent.findFirst({
        where: { email },
        select: { id: true },
      });
      if (dbAgent) {
        await prisma.listing.updateMany({
          where: { agentId: dbAgent.id },
          data: { agentId: null },
        });
        await prisma.agent.delete({ where: { id: dbAgent.id } }).catch(() => {});
      }
    }

    const prevUnsafe = (targetUser.unsafeMetadata ?? {}) as Record<string, unknown>;

    await client.users.updateUser(targetUserId, {
      unsafeMetadata: {
        ...prevUnsafe,
        requestedRole: "client",
      },
      publicMetadata: {
        ...(targetUser.publicMetadata ?? {}),
        isAgent: false,
        agentStatus: "none",
        agentApplication: {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE agent-requests", error);
    return NextResponse.json(
      { error: "Eroare la ștergerea înregistrării agentului." },
      { status: 500 }
    );
  }
}
