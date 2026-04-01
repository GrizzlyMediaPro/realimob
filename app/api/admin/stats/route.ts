import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { ClerkClient } from "@clerk/backend";
import { prisma } from "@/lib/prisma";

async function countUsersCreatedAfter(
  client: ClerkClient,
  sinceMs: number
): Promise<number> {
  const pageSize = 100;
  let offset = 0;
  let count = 0;
  while (true) {
    const page = await client.users.getUserList({
      limit: pageSize,
      offset,
      orderBy: "-created_at",
    });
    for (const user of page.data) {
      if (new Date(user.createdAt).getTime() >= sinceMs) {
        count += 1;
      } else {
        return count;
      }
    }
    if (page.data.length < pageSize) break;
    offset += pageSize;
  }
  return count;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const isAdmin = Boolean(currentUser.publicMetadata?.isAdmin);

    if (!isAdmin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const [
      approvedListings,
      deniedListings,
      pendingListings,
      totalAgents,
      agentsWithListings,
      usersResponse,
    ] = await Promise.all([
      prisma.listing.count({ where: { status: "approved" } }),
      prisma.listing.count({ where: { status: "denied" } }),
      prisma.listing.count({ where: { status: "pending" } }),
      prisma.agent.count(),
      prisma.agent.count({
        where: {
          listings: {
            some: {},
          },
        },
      }),
      client.users.getUserList({ limit: 1 }),
    ]);

    const totalUsers =
      typeof usersResponse.totalCount === "number"
        ? usersResponse.totalCount
        : usersResponse.data.length;

    const newUsersLast30Days = await countUsersCreatedAfter(
      client,
      thirtyDaysAgo
    );

    return NextResponse.json({
      listings: {
        approved: approvedListings,
        denied: deniedListings,
        pending: pendingListings,
      },
      agents: {
        total: totalAgents,
        active: agentsWithListings,
      },
      users: {
        total: totalUsers,
        newLast30Days: newUsersLast30Days,
      },
    });
  } catch (error) {
    console.error("Failed to fetch admin stats", error);
    return NextResponse.json(
      { error: "Eroare la citirea statisticilor" },
      { status: 500 }
    );
  }
}
