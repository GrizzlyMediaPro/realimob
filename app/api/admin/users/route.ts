import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/requireAdmin";

type UserStatus = "activ" | "inactiv" | "suspendat";

const INACTIVE_DAYS_THRESHOLD = 90;

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const client = await clerkClient();
    const usersResponse = await client.users.getUserList({
      orderBy: "-created_at",
      limit: 100,
    });

    const now = Date.now();

    const users = usersResponse.data.map((user) => {
      const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
        user.username ||
        user.emailAddresses[0]?.emailAddress ||
        "Utilizator fără nume";

      const email = user.emailAddresses[0]?.emailAddress || "-";
      const telefon = user.phoneNumbers[0]?.phoneNumber;

      const lastSignInAt = user.lastSignInAt ?? null;
      const inactiveThresholdMs = INACTIVE_DAYS_THRESHOLD * 24 * 60 * 60 * 1000;

      let status: UserStatus = "activ";
      if (user.banned) {
        status = "suspendat";
      } else if (!lastSignInAt || now - lastSignInAt > inactiveThresholdMs) {
        status = "inactiv";
      }

      const metadata = user.publicMetadata as {
        anunturiFavorite?: number;
        anunturiVizualizate?: number;
      };

      return {
        id: user.id,
        nume: fullName,
        email,
        telefon,
        anunturiFavorite: Number(metadata?.anunturiFavorite ?? 0),
        anunturiVizualizate: Number(metadata?.anunturiVizualizate ?? 0),
        status,
        dataInregistrare: new Date(user.createdAt).toISOString(),
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch admin users", error);
    return NextResponse.json(
      { error: "Eroare la citirea utilizatorilor" },
      { status: 500 }
    );
  }
}
