import { NextResponse } from "next/server";
import { getOrCreatePlatformSettings } from "@/lib/platformSettings";

/** Date publice pentru pagini (fără autentificare admin). */
export async function GET() {
  try {
    const s = await getOrCreatePlatformSettings();
    return NextResponse.json({
      siteName: s.siteName,
      supportEmail: s.supportEmail,
      supportPhone: s.supportPhone,
      defaultCurrency: s.defaultCurrency,
      registrationsEnabled: s.registrationsEnabled,
      collaboratorsTitle: s.collaboratorsTitle,
      collaboratorsImageUrl: s.collaboratorsImageUrl,
      collaboratorsDescription: s.collaboratorsDescription,
      collaborators: s.collaborators,
    });
  } catch (e) {
    console.error("GET /api/settings/public", e);
    return NextResponse.json(
      {
        siteName: "realimob",
        supportEmail: null,
        supportPhone: null,
        defaultCurrency: "RON",
        registrationsEnabled: true,
        collaboratorsTitle: null,
        collaboratorsImageUrl: null,
        collaboratorsDescription: null,
        collaborators: [],
      },
      { status: 200 }
    );
  }
}
