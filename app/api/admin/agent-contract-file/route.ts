import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { AgentApplicationMetadata } from "@/lib/agent-application";
import { safeAttachmentFileName } from "@/lib/contract-download";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const client = await clerkClient();
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("targetUserId")?.trim();
    const kind = searchParams.get("kind");
    if (!targetUserId || (kind !== "template" && kind !== "signed")) {
      return NextResponse.json({ error: "Parametri invalizi." }, { status: 400 });
    }

    const target = await client.users.getUser(targetUserId);
    const app = (
      (target.publicMetadata ?? {}) as { agentApplication?: AgentApplicationMetadata }
    ).agentApplication ?? {};

    const url =
      kind === "template" ? app.contractTemplateUrl?.trim() : app.signedContractUrl?.trim();
    if (!url) {
      return NextResponse.json({ error: "Nu există fișier." }, { status: 404 });
    }

    const rawName =
      kind === "template" ? app.contractTemplateFileName : app.signedContractFileName;
    const fallback =
      kind === "template" ? "contract-agent.pdf" : "contract-semnat-agent.pdf";
    const fileName = safeAttachmentFileName(rawName ?? "", fallback);

    const upstream = await fetch(url, { redirect: "follow" });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Fișier indisponibil." }, { status: 502 });
    }

    const buf = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (e) {
    console.error("GET admin/agent-contract-file", e);
    return NextResponse.json({ error: "Eroare la descărcare." }, { status: 500 });
  }
}
