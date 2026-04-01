import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "unauthenticated" | "forbidden" };

async function getAdminAuth(): Promise<AdminAuthResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, reason: "unauthenticated" };
  }

  const client = await clerkClient();
  const currentUser = await client.users.getUser(userId);
  const isAdmin = Boolean(currentUser.publicMetadata?.isAdmin);

  if (!isAdmin) {
    return { ok: false, reason: "forbidden" };
  }

  return { ok: true, userId };
}

/** Pentru rute API: JSON 401/403. */
export async function requireAdmin(): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const result = await getAdminAuth();
  if (result.ok) {
    return { ok: true, userId: result.userId };
  }
  if (result.reason === "unauthenticated") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Neautorizat" }, { status: 401 }),
    };
  }
  return {
    ok: false,
    response: NextResponse.json({ error: "Acces interzis" }, { status: 403 }),
  };
}

/** Pentru pagini App Router: redirecționează utilizatorii neautentificați sau non-admin. */
export async function requireAdminPage(): Promise<string> {
  const result = await getAdminAuth();
  if (result.ok) {
    return result.userId;
  }
  if (result.reason === "unauthenticated") {
    redirect("/sign-in");
  }
  redirect("/");
}
