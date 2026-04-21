import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { agent: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Anunțul nu a fost găsit" },
        { status: 404 },
      );
    }

    if (listing.status !== "approved") {
      if (!userId) {
        return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
      }

      let canAccess = listing.submittedByUserId === userId;
      if (!canAccess) {
        const client = await clerkClient();
        const currentUser = await client.users.getUser(userId);
        canAccess = Boolean(currentUser.publicMetadata?.isAdmin);
      }

      if (!canAccess) {
        return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
      }
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Failed to fetch listing", error);
    return NextResponse.json(
      { error: "A apărut o eroare la citirea anunțului" },
      { status: 500 },
    );
  }
}
