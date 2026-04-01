import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { AgentApplicationMetadata } from "@/lib/agent-application";
import { safeAttachmentFileName } from "@/lib/contract-download";

/**
 * Descărcare contract (șablon de la admin sau varianta încărcată de agent),
 * prin server — evită problemele CORS / atributului download pe URL-uri externe.
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const kind = new URL(request.url).searchParams.get("kind");
    if (kind !== "template" && kind !== "signed") {
      return NextResponse.json({ error: "Parametru kind invalid." }, { status: 400 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const unsafe = (user.unsafeMetadata ?? {}) as { requestedRole?: string };
    const pub = (user.publicMetadata ?? {}) as {
      isAgent?: boolean;
      agentStatus?: string;
      agentApplication?: AgentApplicationMetadata;
    };

    const isAgentFlow =
      unsafe.requestedRole === "agent" || Boolean(pub.isAgent);
    if (!isAgentFlow) {
      return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
    }

    const app = pub.agentApplication ?? {};
    const url =
      kind === "template" ? app.contractTemplateUrl?.trim() : app.signedContractUrl?.trim();
    if (!url) {
      return NextResponse.json({ error: "Nu există fișier pentru descărcare." }, { status: 404 });
    }

    const rawName =
      kind === "template"
        ? app.contractTemplateFileName
        : app.signedContractFileName;
    const fallback =
      kind === "template" ? "contract-realimob.pdf" : "contract-semnat-realimob.pdf";
    const fileName = safeAttachmentFileName(rawName ?? "", fallback);

    const upstream = await fetch(url, { redirect: "follow" });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Fișierul nu a putut fi preluat de pe stocare." },
        { status: 502 }
      );
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
    console.error("GET agent/contract-files", e);
    return NextResponse.json({ error: "Eroare la descărcare." }, { status: 500 });
  }
}
