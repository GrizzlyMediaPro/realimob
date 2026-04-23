import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import {
  getOrCreatePlatformSettings,
  PLATFORM_SETTINGS_KEY,
  sanitizeCollaboratorsList,
  type CollaboratorEntry,
} from "@/lib/platformSettings";

const CURRENCIES = ["RON", "EUR", "USD"] as const;

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const settings = await getOrCreatePlatformSettings();
    return NextResponse.json(settings);
  } catch (e) {
    console.error("GET /api/admin/settings", e);
    return NextResponse.json(
      { error: "Nu am putut încărca setările." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const body = (await request.json()) as {
      siteName?: unknown;
      supportEmail?: unknown;
      supportPhone?: unknown;
      defaultCurrency?: unknown;
      registrationsEnabled?: unknown;
      newListingsAutoApprove?: unknown;
      cityCenterLatitude?: unknown;
      cityCenterLongitude?: unknown;
      collaboratorsTitle?: unknown;
      collaboratorsImageUrl?: unknown;
      collaboratorsDescription?: unknown;
      collaborators?: unknown;
    };

    await getOrCreatePlatformSettings();

    const data: {
      siteName?: string;
      supportEmail?: string | null;
      supportPhone?: string | null;
      defaultCurrency?: string;
      registrationsEnabled?: boolean;
      newListingsAutoApprove?: boolean;
      cityCenterLatitude?: number | null;
      cityCenterLongitude?: number | null;
      collaboratorsTitle?: string | null;
      collaboratorsImageUrl?: string | null;
      collaboratorsDescription?: string | null;
      collaborators?: CollaboratorEntry[];
    } = {};

    if (typeof body.siteName === "string") {
      const t = body.siteName.trim();
      data.siteName = t.length > 0 ? t.slice(0, 120) : "realimob";
    }
    if (body.supportEmail === null || body.supportEmail === "") {
      data.supportEmail = null;
    } else if (typeof body.supportEmail === "string") {
      const e = body.supportEmail.trim().slice(0, 320);
      data.supportEmail = e.length ? e : null;
    }
    if (body.supportPhone === null || body.supportPhone === "") {
      data.supportPhone = null;
    } else if (typeof body.supportPhone === "string") {
      data.supportPhone = body.supportPhone.trim().slice(0, 40);
    }
    if (typeof body.defaultCurrency === "string") {
      const c = body.defaultCurrency.trim().toUpperCase();
      if (CURRENCIES.includes(c as (typeof CURRENCIES)[number])) {
        data.defaultCurrency = c;
      }
    }
    if (typeof body.registrationsEnabled === "boolean") {
      data.registrationsEnabled = body.registrationsEnabled;
    }
    if (typeof body.newListingsAutoApprove === "boolean") {
      data.newListingsAutoApprove = body.newListingsAutoApprove;
    }
    const parseCoord = (v: unknown): number | null | undefined => {
      if (v === null || v === "") return null;
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string") {
        const t = v.trim().replace(",", ".");
        if (!t) return null;
        const n = Number(t);
        return Number.isFinite(n) ? n : undefined;
      }
      return undefined;
    };
    const lat = parseCoord(body.cityCenterLatitude);
    if (lat !== undefined) data.cityCenterLatitude = lat;
    const lng = parseCoord(body.cityCenterLongitude);
    if (lng !== undefined) data.cityCenterLongitude = lng;
    if (body.collaboratorsTitle === null || body.collaboratorsTitle === "") {
      data.collaboratorsTitle = null;
    } else if (typeof body.collaboratorsTitle === "string") {
      const t = body.collaboratorsTitle.trim().slice(0, 140);
      data.collaboratorsTitle = t.length ? t : null;
    }
    if (
      body.collaboratorsImageUrl === null ||
      body.collaboratorsImageUrl === ""
    ) {
      data.collaboratorsImageUrl = null;
    } else if (typeof body.collaboratorsImageUrl === "string") {
      const url = body.collaboratorsImageUrl.trim().slice(0, 1200);
      data.collaboratorsImageUrl = url.length ? url : null;
    }
    if (
      body.collaboratorsDescription === null ||
      body.collaboratorsDescription === ""
    ) {
      data.collaboratorsDescription = null;
    } else if (typeof body.collaboratorsDescription === "string") {
      const html = body.collaboratorsDescription.trim().slice(0, 12000);
      data.collaboratorsDescription = html.length ? html : null;
    }
    if (body.collaborators !== undefined) {
      data.collaborators = sanitizeCollaboratorsList(body.collaborators);
    }

    if (Object.keys(data).length === 0) {
      const settings = await getOrCreatePlatformSettings();
      return NextResponse.json(settings);
    }

    await prisma.platformSettings.update({
      where: { key: PLATFORM_SETTINGS_KEY },
      data: data as never,
    });

    const settings = await getOrCreatePlatformSettings();
    return NextResponse.json(settings);
  } catch (e) {
    console.error("PUT /api/admin/settings", e);
    return NextResponse.json(
      { error: "Nu am putut salva setările." },
      { status: 500 }
    );
  }
}
