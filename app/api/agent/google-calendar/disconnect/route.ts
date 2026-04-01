import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? null;
    if (!email) {
      return NextResponse.json({ error: "Email indisponibil" }, { status: 400 });
    }

    await prisma.agent.updateMany({
      where: { email },
      data: {
        googleRefreshToken: null,
        googleCalendarEmail: null,
        googleCalendarConnectedAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("google calendar disconnect", error);
    return NextResponse.json(
      { error: "Eroare la deconectare" },
      { status: 500 }
    );
  }
}
