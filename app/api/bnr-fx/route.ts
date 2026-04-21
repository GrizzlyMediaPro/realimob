import { NextResponse } from "next/server";
import { parseBnrNbrFxRatesXml } from "../../../lib/bnrFxRates";

const BNR_URL = "https://www.bnr.ro/nbrfxrates.xml";

export async function GET() {
  try {
    const res = await fetch(BNR_URL, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/xml, text/xml, */*" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "BNR indisponibil", status: res.status },
        { status: 502 },
      );
    }
    const xml = await res.text();
    const parsed = parseBnrNbrFxRatesXml(xml);
    if (!parsed) {
      return NextResponse.json(
        { error: "Nu s-au putut citi cursurile" },
        { status: 502 },
      );
    }
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("bnr-fx:", e);
    return NextResponse.json(
      { error: "Eroare la preluarea cursurilor BNR" },
      { status: 502 },
    );
  }
}
