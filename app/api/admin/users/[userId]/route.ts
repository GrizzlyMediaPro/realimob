import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

type Body = { action?: string };

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: adminUserId } = await auth();

    if (!adminUserId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { userId: targetUserId } = await params;

    if (!targetUserId?.startsWith("user_")) {
      return NextResponse.json({ error: "ID utilizator invalid." }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const action = body.action;

    if (action !== "ban" && action !== "unban") {
      return NextResponse.json(
        { error: "Acțiune necunoscută. Folosește „ban” sau „unban”." },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    const adminUser = await client.users.getUser(adminUserId);
    const isAdmin = Boolean(adminUser.publicMetadata?.isAdmin);

    if (!isAdmin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    if (action === "ban" && targetUserId === adminUserId) {
      return NextResponse.json(
        { error: "Nu îți poți suspenda propriul cont din panou." },
        { status: 400 }
      );
    }

    const targetUser = await client.users.getUser(targetUserId);

    if (action === "ban" && Boolean(targetUser.publicMetadata?.isAdmin)) {
      return NextResponse.json(
        { error: "Nu poți suspenda un alt administrator." },
        { status: 403 }
      );
    }

    if (action === "ban") {
      await client.users.banUser(targetUserId);
    } else {
      await client.users.unbanUser(targetUserId);
    }

    const updated = await client.users.getUser(targetUserId);

    return NextResponse.json({
      ok: true,
      banned: Boolean(updated.banned),
    });
  } catch (error) {
    console.error("Admin user PATCH failed", error);
    return NextResponse.json(
      { error: "Eroare la actualizarea utilizatorului." },
      { status: 500 }
    );
  }
}
