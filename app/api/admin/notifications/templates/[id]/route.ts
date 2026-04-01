import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      name?: string;
      subject?: string;
      bodyHtml?: string;
      active?: boolean;
    };

    const data: {
      name?: string;
      subject?: string;
      bodyHtml?: string;
      active?: boolean;
    } = {};

    if (typeof body.name === "string") {
      const n = body.name.trim();
      if (n.length === 0) {
        return NextResponse.json(
          { error: "Numele nu poate fi gol." },
          { status: 400 }
        );
      }
      data.name = n;
    }
    if (typeof body.subject === "string") {
      const s = body.subject.trim();
      if (s.length === 0) {
        return NextResponse.json(
          { error: "Subiectul nu poate fi gol." },
          { status: 400 }
        );
      }
      data.subject = s;
    }
    if (typeof body.bodyHtml === "string") data.bodyHtml = body.bodyHtml;
    if (typeof body.active === "boolean") data.active = body.active;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nimic de actualizat." },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data,
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("PATCH template", error);
    return NextResponse.json(
      { error: "Nu am putut actualiza șablonul." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;

  try {
    await prisma.emailTemplate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE template", error);
    return NextResponse.json(
      { error: "Nu am putut șterge șablonul." },
      { status: 500 }
    );
  }
}
