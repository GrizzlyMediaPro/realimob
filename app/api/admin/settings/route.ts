import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import {
  getOrCreatePlatformSettings,
  PLATFORM_SETTINGS_KEY,
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
    };

    await getOrCreatePlatformSettings();

    const data: {
      siteName?: string;
      supportEmail?: string | null;
      supportPhone?: string | null;
      defaultCurrency?: string;
      registrationsEnabled?: boolean;
      newListingsAutoApprove?: boolean;
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

    if (Object.keys(data).length === 0) {
      const settings = await prisma.platformSettings.findUniqueOrThrow({
        where: { key: PLATFORM_SETTINGS_KEY },
      });
      return NextResponse.json(settings);
    }

    const settings = await prisma.platformSettings.update({
      where: { key: PLATFORM_SETTINGS_KEY },
      data,
    });

    return NextResponse.json(settings);
  } catch (e) {
    console.error("PUT /api/admin/settings", e);
    return NextResponse.json(
      { error: "Nu am putut salva setările." },
      { status: 500 }
    );
  }
}
