import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeAttachmentFileName } from "@/lib/contract-download";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    if (!currentUser.publicMetadata?.isAdmin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const { id: listingId } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        intermediationContractUrl: true,
        intermediationContractFileName: true,
      },
    });
    if (!listing?.intermediationContractUrl?.trim()) {
      return NextResponse.json({ error: "Nu există contract încărcat." }, { status: 404 });
    }

    const url = listing.intermediationContractUrl.trim();
    const fileName = safeAttachmentFileName(
      listing.intermediationContractFileName ?? "",
      "contract-intermediere-semnat.pdf",
    );

    const upstream = await fetch(url, { redirect: "follow" });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Fișierul nu a putut fi preluat." },
        { status: 502 },
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
    console.error("admin intermediation-contract GET", e);
    return NextResponse.json({ error: "Eroare la descărcare." }, { status: 500 });
  }
}
