import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreatePlatformSettings } from "@/lib/platformSettings";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const skip = (page - 1) * limit;

    const statusFilter = searchParams.get("status");
    // Dacă se cere un status specific (ex: admin), filtrează după el
    // Altfel, returnează doar anunțurile aprobate (pentru public)
    const where = statusFilter ? { status: statusFilter } : { status: "approved" };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { agent: true },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch listings", error);
    return NextResponse.json(
      { error: "A apărut o eroare la citirea anunțurilor" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      titlu,
      descriere,
      tipTranzactie,
      tipProprietate,
      subtipComercial,
      pret,
      moneda,
      locatie,
      adresa,
      sector,
      latitude,
      longitude,
      details,
      images,
    } = body;

    if (!titlu || !descriere || !tipTranzactie || !tipProprietate || !pret || !moneda || !locatie) {
      return NextResponse.json(
        { error: "Câmpuri obligatorii lipsă" },
        { status: 400 },
      );
    }

    const cleanedPret = String(pret).replace(/[^0-9]/g, "");
    const priceNumber = Number(cleanedPret);
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      return NextResponse.json(
        { error: "Prețul trebuie să fie numeric" },
        { status: 400 },
      );
    }

    const platform = await getOrCreatePlatformSettings();
    const status = platform.newListingsAutoApprove ? "approved" : "pending";

    const listing = await prisma.listing.create({
      data: {
        title: titlu,
        description: descriere,
        transactionType: tipTranzactie,
        propertyType: tipProprietate,
        commercialSubtype: subtipComercial || null,
        price: priceNumber,
        currency: moneda,
        location: locatie,
        address: adresa || null,
        sector: sector || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        status,
        details: details ?? {},
        images: images ?? [],
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Failed to create listing", error);
    return NextResponse.json(
      { error: "A apărut o eroare la salvarea anunțului" },
      { status: 500 },
    );
  }
}

