import { NextResponse } from "next/server";
import { getOrCreatePlatformSettings } from "@/lib/platformSettings";

export async function GET() {
  try {
    const settings = await getOrCreatePlatformSettings();
    return NextResponse.json(
      { collaborators: settings.collaborators ?? [] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Public platform settings fetch failed", error);
    return NextResponse.json({ collaborators: [] }, { status: 200 });
  }
}
