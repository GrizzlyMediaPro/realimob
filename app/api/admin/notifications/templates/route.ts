import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const body = (await request.json()) as {
      name?: string;
      subject?: string;
      bodyHtml?: string;
      active?: boolean;
    };

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const bodyHtml =
      typeof body.bodyHtml === "string" ? body.bodyHtml : "";

    if (!name || !subject) {
      return NextResponse.json(
        { error: "Numele și subiectul sunt obligatorii." },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        bodyHtml,
        active: body.active !== false,
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("POST /api/admin/notifications/templates", error);
    return NextResponse.json(
      { error: "Nu am putut crea șablonul." },
      { status: 500 }
    );
  }
}
