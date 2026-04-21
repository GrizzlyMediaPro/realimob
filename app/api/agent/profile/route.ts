import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";
import type { AgentApplicationMetadata } from "@/lib/agent-application";
import { syncCompletedViewingQuestionnaires } from "@/lib/viewing-questionnaire-sync";
import { getAgentQuestionnaireCompliance } from "@/lib/agent-questionnaire-compliance";
import { rejectIfAgentSuspended } from "@/lib/reject-if-agent-suspended";

const MAX_AGENT_BIO_LEN = 2500;
const MAX_AVATAR_URL_LEN = 2048;

type AgentPublicMetadata = {
  isAgent?: boolean;
  agentStatus?: "none" | "pending" | "approved" | "rejected" | "suspended";
  agentProfile?: {
    phone?: string;
    role?: string;
    location?: string;
    avatarUrl?: string | null;
  };
  agentApplication?: AgentApplicationMetadata;
};

/** UserButton / Clerk folosesc `imageUrl`, nu avatarul din DB — îl aliniem după salvare. */
async function syncClerkProfileImageIfNeeded(
  userId: string,
  client: Awaited<ReturnType<typeof clerkClient>>,
  avatarUrl: string | null,
  previousAgentAvatar: string | null,
) {
  const next = avatarUrl ?? null;
  const prev = previousAgentAvatar ?? null;
  if (next === prev) return;

  try {
    if (!next) {
      await client.users.deleteUserProfileImage(userId);
      return;
    }
    const res = await fetch(next, { redirect: "follow", signal: AbortSignal.timeout(25_000) });
    if (!res.ok) {
      console.warn("Clerk profile image sync: fetch failed", res.status, next);
      return;
    }
    const mime =
      res.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
    if (!mime.startsWith("image/")) {
      console.warn("Clerk profile image sync: unexpected content-type", mime);
      return;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) {
      console.warn("Clerk profile image sync: empty body");
      return;
    }
    const file = new File([buf], "profile.jpg", { type: mime });
    await client.users.updateUserProfileImage(userId, { file });
  } catch (e) {
    console.warn("Clerk profile image sync failed", e);
  }
}

type UpdateAgentProfilePayload = {
  name?: string;
  phone?: string;
  role?: string;
  location?: string;
  bio?: string | null;
  avatarUrl?: string | null;
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

function sanitizeAgentBio(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim().slice(0, MAX_AGENT_BIO_LEN);
  if (!s) return null;
  return s.replace(/[<>]/g, "");
}

function normalizeAvatarUrl(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim().slice(0, MAX_AVATAR_URL_LEN);
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return null;
    return s;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    await syncCompletedViewingQuestionnaires();

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
    let avatarFromDb: string | null = null;
    let bioFromDb: string | null = null;

    let googleCalendarConnected = false;
    let googleCalendarEmail: string | null = null;

    let questionnaireCompliance: Awaited<
      ReturnType<typeof getAgentQuestionnaireCompliance>
    > | null = null;

    if (email) {
      const dbAgent = await prisma.agent.findFirst({
        where: { email },
        select: {
          id: true,
          phone: true,
          avatar: true,
          bio: true,
          googleRefreshToken: true,
          googleCalendarEmail: true,
        },
      });
      phoneFromDb = dbAgent?.phone ?? null;
      avatarFromDb = dbAgent?.avatar ?? null;
      bioFromDb = dbAgent?.bio ?? null;
      googleCalendarConnected = Boolean(dbAgent?.googleRefreshToken);
      googleCalendarEmail = dbAgent?.googleCalendarEmail ?? null;
      if (dbAgent?.id && agentStatus === "approved") {
        questionnaireCompliance = await getAgentQuestionnaireCompliance(dbAgent.id);
      }
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
        bio: bioFromDb ?? "",
        avatarUrl: avatarFromDb,
      },
      googleCalendar: {
        connected: googleCalendarConnected,
        googleCalendarEmail,
      },
      questionnaireCompliance,
    });
  } catch (error) {
    console.error("Failed to fetch agent profile", error);
    return NextResponse.json(
      { error: "Eroare la citirea profilului de agent" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const suspended = await rejectIfAgentSuspended(userId);
    if (suspended) return suspended;

    const body = (await request.json()) as UpdateAgentProfilePayload;
    const name = body.name?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const role = body.role?.trim() ?? "";
    const location = body.location?.trim() ?? "";
    const bio = sanitizeAgentBio(body.bio);
    const avatarUrl = normalizeAvatarUrl(body.avatarUrl);

    if (body.avatarUrl != null && body.avatarUrl !== "" && avatarUrl === null) {
      return NextResponse.json(
        { error: "URL-ul imaginii de profil trebuie să fie HTTPS valid." },
        { status: 400 },
      );
    }

    if (!name || !phone || !role || !location) {
      return NextResponse.json(
        { error: "Completeaza toate campurile profilului." },
        { status: 400 },
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const currentMetadata = (user.publicMetadata ?? {}) as AgentPublicMetadata;
    const { firstName, lastName } = splitFullName(name);
    const email = user.emailAddresses[0]?.emailAddress ?? null;

    const previousAgentAvatar =
      email != null
        ? (
            await prisma.agent.findFirst({
              where: { email },
              select: { avatar: true },
            })
          )?.avatar ?? null
        : typeof currentMetadata.agentProfile?.avatarUrl === "string"
          ? currentMetadata.agentProfile.avatarUrl
          : null;

    await client.users.updateUser(userId, {
      firstName,
      lastName: lastName || undefined,
    });

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...currentMetadata,
        agentProfile: {
          ...(currentMetadata.agentProfile ?? {}),
          phone,
          role,
          location,
          avatarUrl,
        },
      },
    });

    if (email) {
      await prisma.agent.updateMany({
        where: { email },
        data: {
          name,
          phone,
          avatar: avatarUrl,
          bio,
        },
      });
    }

    await syncClerkProfileImageIfNeeded(userId, client, avatarUrl, previousAgentAvatar);

    return NextResponse.json({
      success: true,
      profile: {
        name,
        email,
        phone,
        role,
        location,
        bio: bio ?? "",
        avatarUrl,
      },
    });
  } catch (error) {
    console.error("Failed to update agent profile", error);
    return NextResponse.json(
      { error: "Eroare la actualizarea profilului de agent" },
      { status: 500 },
    );
  }
}
