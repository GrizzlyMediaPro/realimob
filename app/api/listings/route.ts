import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      details,
      images,
    } = body;

    if (!titlu || !descriere || !tipTranzactie || !tipProprietate || !pret || !moneda || !locatie) {
      return NextResponse.json(
        { error: "Câmpuri obligatorii lipsă" },
        { status: 400 },
      );
    }

    const priceNumber = Number(pret);
    if (Number.isNaN(priceNumber)) {
      return NextResponse.json(
        { error: "Prețul trebuie să fie numeric" },
        { status: 400 },
      );
    }

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

