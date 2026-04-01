import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendTransactionalEmail } from "@/lib/resend";

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const body = (await request.json()) as {
      to?: string;
      templateId?: string | null;
    };

    const to = typeof body.to === "string" ? body.to.trim() : "";
    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { error: "Adresă de email invalidă." },
        { status: 400 }
      );
    }

    let subject = "Test Realimob";
    let html =
      "<p>Acesta este un email de test trimis din panoul de administrare.</p><p>Dacă îl primești, integrarea Resend funcționează.</p>";

    if (body.templateId) {
      const t = await prisma.emailTemplate.findUnique({
        where: { id: body.templateId },
      });
      if (!t) {
        return NextResponse.json(
          { error: "Șablonul nu există." },
          { status: 404 }
        );
      }
      subject = `[Test] ${t.subject}`;
      html = t.bodyHtml || html;
    }

    const data = await sendTransactionalEmail({ to, subject, html });

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Trimiterea a eșuat.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
