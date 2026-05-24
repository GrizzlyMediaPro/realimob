import { auth } from "@clerk/nextjs/server";
import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  LISTING_INTERMEDIATION_CONTRACT_DOWNLOAD_NAME,
  LISTING_INTERMEDIATION_CONTRACT_TEMPLATE_FILENAME,
} from "@/lib/listingIntermediationContract";

/** Descărcare șablon contract intermediere (PDF din public). */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const filePath = path.join(
      process.cwd(),
      "public",
      LISTING_INTERMEDIATION_CONTRACT_TEMPLATE_FILENAME,
    );
    const buf = await readFile(filePath);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${LISTING_INTERMEDIATION_CONTRACT_DOWNLOAD_NAME}"`,
      },
    });
  } catch (e) {
    console.error("intermediation-contract-template GET", e);
    return NextResponse.json(
      { error: "Contractul nu a putut fi descărcat." },
      { status: 500 },
    );
  }
}
