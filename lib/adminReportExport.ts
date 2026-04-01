import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/** Aceeași structură ca răspunsul GET /api/admin/analytics */
export type ReportAnalyticsPayload = {
  listings: {
    approved: number;
    denied: number;
    pending: number;
    total: number;
    approvalRatePercent: number;
  };
  agents: { total: number; active: number };
  users: { total: number; newLast30Days: number };
  listingsByTransaction: { transactionType: string; count: number }[];
  listingsByPropertyType: { propertyType: string; count: number }[];
  topSectors: { sector: string; count: number }[];
  priceByCurrencyApproved: {
    currency: string;
    avgPrice: number;
    count: number;
  }[];
  newListings: { last7Days: number; last30Days: number };
  monthlyCreated: { key?: string; label: string; count: number }[];
  dailyCreatedLast7: { key: string; label: string; count: number }[];
  topAgents: { id: string; name: string; listings: number }[];
};

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

function todayStamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Raport complet CSV (UTF-8 cu BOM pentru Excel) */
export function buildAnalyticsCsv(payload: ReportAnalyticsPayload): string {
  const lines: string[] = [];
  const L = (row: (string | number)[]) => lines.push(csvRow(row));

  L(["Raport platformă Realimob", ""]);
  L(["Generat la", new Date().toISOString()]);
  L([]);

  L(["— Sumar anunțuri —", ""]);
  L(["Metrică", "Valoare"]);
  L(["Total anunțuri", payload.listings.total]);
  L(["Aprobate", payload.listings.approved]);
  L(["Respinse", payload.listings.denied]);
  L(["În așteptare", payload.listings.pending]);
  L([
    "Rată aprobare (%)",
    String(payload.listings.approvalRatePercent).replace(".", ","),
  ]);
  L([]);

  L(["— Agenți și utilizatori —", ""]);
  L(["Metrică", "Valoare"]);
  L(["Agenți total", payload.agents.total]);
  L(["Agenți cu anunțuri", payload.agents.active]);
  L(["Utilizatori (Clerk)", payload.users.total]);
  L(["Utilizatori noi (30 zile)", payload.users.newLast30Days]);
  L([]);

  L(["— Anunțuri noi —", ""]);
  L(["Perioadă", "Număr"]);
  L(["Ultimele 7 zile", payload.newListings.last7Days]);
  L(["Ultimele 30 zile", payload.newListings.last30Days]);
  L([]);

  L(["— După tip tranzacție —", ""]);
  L(["Tip tranzacție", "Număr"]);
  for (const r of payload.listingsByTransaction) {
    L([r.transactionType, r.count]);
  }
  L([]);

  L(["— După tip proprietate —", ""]);
  L(["Tip proprietate", "Număr"]);
  for (const r of payload.listingsByPropertyType) {
    L([r.propertyType, r.count]);
  }
  L([]);

  L(["— Top sectoare —", ""]);
  L(["Sector", "Număr anunțuri"]);
  for (const r of payload.topSectors) {
    L([r.sector, r.count]);
  }
  L([]);

  L(["— Preț mediu (anunțuri aprobate) —", ""]);
  L(["Monedă", "Preț mediu", "Număr anunțuri"]);
  for (const r of payload.priceByCurrencyApproved) {
    L([
      r.currency,
      Math.round(r.avgPrice * 100) / 100,
      r.count,
    ]);
  }
  L([]);

  L(["— Anunțuri create pe lună (ultimele 6) —", ""]);
  L(["Lună", "Număr"]);
  for (const r of payload.monthlyCreated) {
    L([r.label, r.count]);
  }
  L([]);

  L(["— Anunțuri create pe zi (ultimele 7) —", ""]);
  L(["Zi", "Număr"]);
  for (const r of payload.dailyCreatedLast7) {
    L([r.label, r.count]);
  }
  L([]);

  L(["— Top agenți (după număr anunțuri) —", ""]);
  L(["Nume agent", "Număr anunțuri"]);
  for (const r of payload.topAgents) {
    L([r.name, r.listings]);
  }

  return "\uFEFF" + lines.join("\r\n");
}

export function downloadTextFile(
  content: string,
  filename: string,
  mime: string
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAnalyticsCsv(payload: ReportAnalyticsPayload): void {
  const csv = buildAnalyticsCsv(payload);
  downloadTextFile(
    csv,
    `realimob-raport-${todayStamp()}.csv`,
    "text/csv;charset=utf-8"
  );
}

type DocWithTable = jsPDF & { lastAutoTable?: { finalY: number } };

function nextY(doc: DocWithTable, fallback: number): number {
  const y = doc.lastAutoTable?.finalY;
  return typeof y === "number" ? y + 10 : fallback;
}

/** jsPDF foloseste fonturi fara suport UTF-8 complet — text PDF fara diacritice */
function pdfAscii(s: string): string {
  return s
    .replace(/ă/g, "a")
    .replace(/Ă/g, "A")
    .replace(/â/g, "a")
    .replace(/Â/g, "A")
    .replace(/î/g, "i")
    .replace(/Î/g, "I")
    .replace(/ș/g, "s")
    .replace(/Ș/g, "S")
    .replace(/ț/g, "t")
    .replace(/Ț/g, "T")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function pdfStr(v: string | number): string {
  return pdfAscii(String(v));
}

export function downloadAnalyticsPdf(payload: ReportAnalyticsPayload): void {
  const doc = new jsPDF({ format: "a4", unit: "mm" }) as DocWithTable;
  const title = pdfAscii("Raport platformă Realimob");
  let y = 18;

  doc.setFontSize(16);
  doc.text(title, 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(80);
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  doc.text(pdfAscii(`Generat: ${stamp}`), 14, y);
  doc.setTextColor(0);
  y += 12;

  autoTable(doc, {
    startY: y,
    head: [[pdfStr("Metrică"), pdfStr("Valoare")]],
    body: [
      [pdfStr("Total anunțuri"), String(payload.listings.total)],
      [pdfStr("Aprobate"), String(payload.listings.approved)],
      [pdfStr("Respinse"), String(payload.listings.denied)],
      [pdfStr("În așteptare"), String(payload.listings.pending)],
      [
        pdfStr("Rată aprobare (%)"),
        pdfStr(
          payload.listings.approvalRatePercent.toLocaleString("ro-RO", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          })
        ),
      ],
      [pdfStr("Agenți total"), String(payload.agents.total)],
      [pdfStr("Agenți cu anunțuri"), String(payload.agents.active)],
      [pdfStr("Utilizatori (Clerk)"), String(payload.users.total)],
      [pdfStr("Utilizatori noi (30 zile)"), String(payload.users.newLast30Days)],
      [pdfStr("Anunțuri noi (7 zile)"), String(payload.newListings.last7Days)],
      [pdfStr("Anunțuri noi (30 zile)"), String(payload.newListings.last30Days)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [194, 90, 43] },
  });

  y = nextY(doc, 100);

  autoTable(doc, {
    startY: y,
    head: [[pdfStr("Tip tranzacție"), pdfStr("Număr")]],
    body: payload.listingsByTransaction.map((r) => [
      pdfStr(r.transactionType),
      String(r.count),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [194, 90, 43] },
  });

  y = nextY(doc, y + 40);

  autoTable(doc, {
    startY: y,
    head: [[pdfStr("Tip proprietate"), pdfStr("Număr")]],
    body: payload.listingsByPropertyType.map((r) => [
      pdfStr(r.propertyType),
      String(r.count),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [194, 90, 43] },
  });

  y = nextY(doc, y + 40);

  autoTable(doc, {
    startY: y,
    head: [[pdfStr("Sector"), pdfStr("Număr")]],
    body: payload.topSectors.map((r) => [pdfStr(r.sector), String(r.count)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [194, 90, 43] },
  });

  y = nextY(doc, y + 40);

  autoTable(doc, {
    startY: y,
    head: [
      [pdfStr("Monedă"), pdfStr("Preț mediu"), pdfStr("Anunțuri")],
    ],
    body: payload.priceByCurrencyApproved.map((r) => [
      pdfStr(r.currency),
      pdfStr(Math.round(r.avgPrice).toLocaleString("ro-RO")),
      String(r.count),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [194, 90, 43] },
  });

  y = nextY(doc, y + 40);

  autoTable(doc, {
    startY: y,
    head: [[pdfStr("Lună"), pdfStr("Anunțuri create")]],
    body: payload.monthlyCreated.map((r) => [pdfStr(r.label), String(r.count)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [194, 90, 43] },
  });

  y = nextY(doc, y + 40);

  autoTable(doc, {
    startY: y,
    head: [[pdfStr("Zi (ultimele 7)"), pdfStr("Anunțuri")]],
    body: payload.dailyCreatedLast7.map((r) => [
      pdfStr(r.label),
      String(r.count),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [194, 90, 43] },
  });

  y = nextY(doc, y + 40);

  autoTable(doc, {
    startY: y,
    head: [[pdfStr("Agent"), pdfStr("Anunțuri")]],
    body: payload.topAgents.map((r) => [pdfStr(r.name), String(r.listings)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [194, 90, 43] },
  });

  doc.save(`realimob-raport-${todayStamp()}.pdf`);
}
