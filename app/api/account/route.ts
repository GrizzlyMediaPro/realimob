import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncCompletedViewingQuestionnaires } from "@/lib/viewing-questionnaire-sync";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? null;
    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.username ||
      null;

    const publicMetadata = (user.publicMetadata ?? {}) as {
      isAgent?: boolean;
      agentStatus?: string;
      isAdmin?: boolean;
    };
    const unsafeMetadata = (user.unsafeMetadata ?? {}) as {
      requestedRole?: "agent" | "client";
    };

    const requestedRole = unsafeMetadata.requestedRole ?? "client";
    const isAgent = Boolean(publicMetadata.isAgent) || requestedRole === "agent";
    const agentStatus =
      (publicMetadata.agentStatus as "none" | "pending" | "approved" | "rejected") ??
      "none";

    await syncCompletedViewingQuestionnaires();

    const emailNorm = email?.trim().toLowerCase() ?? null;
    const emailTrim = email?.trim() ?? null;

    const dbAgentPublic =
      emailTrim && isAgent
        ? await prisma.agent.findFirst({
            where: { email: emailTrim },
            select: { avatar: true, bio: true },
          })
        : null;

    const [listings, viewingRequests] = await Promise.all([
      prisma.listing.findMany({
        where: { submittedByUserId: userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          transactionType: true,
          price: true,
          currency: true,
          createdAt: true,
          location: true,
          images: true,
        },
      }),
      emailNorm
        ? prisma.viewingBookingRequest.findMany({
            where: {
              OR: [{ clientEmail: emailNorm }, { clientEmail: email ?? "" }],
            },
            orderBy: { startAt: "desc" },
            take: 50,
            include: {
              listing: { select: { id: true, title: true } },
              agent: { select: { name: true } },
              questionnaire: {
                select: { id: true, clientSubmittedAt: true, agentSubmittedAt: true },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      user: {
        id: user.id,
        name: fullName,
        email,
        imageUrl: user.imageUrl,
        agentAvatarUrl: dbAgentPublic?.avatar ?? null,
        agentBio: dbAgentPublic?.bio?.trim() ? dbAgentPublic.bio.trim() : null,
      },
      role: {
        isAdmin: Boolean(publicMetadata.isAdmin),
        isAgent,
        agentStatus,
        requestedRole,
      },
      listings,
      viewingRequests,
    });
  } catch (error) {
    console.error("account GET", error);
    return NextResponse.json(
      { error: "Eroare la încărcarea datelor contului" },
      { status: 500 },
    );
  }
}
