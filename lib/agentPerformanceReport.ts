import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function isVanzareTransactionType(transactionType: string): boolean {
  const t = transactionType.toLowerCase();
  return t.includes("vânz") || t.includes("vanz");
}

export function isInchiriereTransactionType(transactionType: string): boolean {
  const t = transactionType.toLowerCase();
  return t.includes("închirier") || t.includes("inchiri");
}

export function extractSuprafataUtila(details: unknown): number | null {
  if (!details || typeof details !== "object") return null;
  const d = details as Record<string, unknown>;
  const raw = d.suprafataUtila ?? d.suprafata;
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function safeAverage(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export type AgentPerformanceRow = {
  nume: string;
  email: string;
  telefon: string;
  vanzariInPerioada: number;
  inchirieriInPerioada: number;
  anunturiNoiInPerioada: number;
  anunturiActiveAcum: number;
  anunturiTotalAtribuite: number;
  vizionariInPerioada: number;
  ofertePrimiteInPerioada: number;
  pretMediuVanzari: number | null;
  pretMediuInchirieri: number | null;
  suprafataMedieVanzariMp: number | null;
  suprafataMedieInchirieriMp: number | null;
  medieZileCrearePanaLaTranzactie: number | null;
  medieZileVanzari: number | null;
  medieZileInchirieri: number | null;
};

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

function fmtNum(n: number | null, decimals: number): string {
  if (n === null || Number.isNaN(n)) return "";
  return n.toLocaleString("ro-RO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** CSV cu UTF-8 BOM pentru Excel */
export function buildAgentPerformanceCsv(
  rows: AgentPerformanceRow[],
  periodLabel: string,
): string {
  const lines: string[] = [];
  const L = (row: (string | number)[]) => lines.push(csvRow(row));

  L(["Raport performanță agenți — Realimob", ""]);
  L(["Perioadă", periodLabel]);
  L(["Generat la", new Date().toISOString()]);
  L([
    "Notă",
    "Zilele până la tranzacție = media zilelor între data creării anunțului și verificarea finală (vânzare/închiriere). Data exactă a atribuirii agentului nu este stocată în sistem.",
  ]);
  L([]);

  L([
    "Nume",
    "Email",
    "Telefon",
    "Vânzări (perioadă)",
    "Închirieri (perioadă)",
    "Anunțuri noi (create în perioadă)",
    "Anunțuri active acum",
    "Total anunțuri atribuite",
    "Vizionări (perioadă)",
    "Oferte primite de la clienți (perioadă)",
    "Preț mediu vânzări",
    "Preț mediu închirieri",
    "Suprafață medie vânzări (m²)",
    "Suprafață medie închirieri (m²)",
    "Medie zile creare → tranzacție",
    "Medie zile (doar vânzări)",
    "Medie zile (doar închirieri)",
  ]);

  for (const r of rows) {
    L([
      r.nume,
      r.email,
      r.telefon,
      r.vanzariInPerioada,
      r.inchirieriInPerioada,
      r.anunturiNoiInPerioada,
      r.anunturiActiveAcum,
      r.anunturiTotalAtribuite,
      r.vizionariInPerioada,
      r.ofertePrimiteInPerioada,
      fmtNum(r.pretMediuVanzari, 2),
      fmtNum(r.pretMediuInchirieri, 2),
      fmtNum(r.suprafataMedieVanzariMp, 1),
      fmtNum(r.suprafataMedieInchirieriMp, 1),
      fmtNum(r.medieZileCrearePanaLaTranzactie, 1),
      fmtNum(r.medieZileVanzari, 1),
      fmtNum(r.medieZileInchirieri, 1),
    ]);
  }

  return "\uFEFF" + lines.join("\r\n");
}

type DocWithTable = jsPDF & { lastAutoTable?: { finalY: number } };

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

function p(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "-";
  return pdfAscii(String(v));
}

/** PDF landscape; diacritice eliminate (limitare jsPDF standard fonts) */
export function buildAgentPerformancePdf(
  rows: AgentPerformanceRow[],
  periodLabel: string,
): Uint8Array {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  }) as DocWithTable;

  doc.setFontSize(14);
  doc.text(pdfAscii("Raport performanta agenti — Realimob"), 14, 12);
  doc.setFontSize(8);
  doc.setTextColor(80);
  doc.text(p(`Perioada: ${periodLabel}`), 14, 18);
  doc.text(p(`Generat: ${new Date().toLocaleString("ro-RO")}`), 14, 22);
  doc.setTextColor(0);
  doc.setFontSize(7);
  doc.text(
    p(
      "Zile tranzactie = medie zile creare anunt -> verificare finala (fara data atribuiri exacte in DB).",
    ),
    14,
    26,
  );

  const head = [
    [
      "Nume",
      "Email",
      "Tel",
      "Vanz",
      "Inch",
      "Anunt noi",
      "Activ",
      "Total",
      "Viz",
      "Oferte",
      "Pret med V",
      "Pret med I",
      "Sup V",
      "Sup I",
      "Zile med",
      "Zile V",
      "Zile I",
    ].map((h) => p(h)),
  ];

  const body = rows.map((r) => [
    p(r.nume.slice(0, 28)),
    p(r.email.slice(0, 32)),
    p(r.telefon.slice(0, 14)),
    String(r.vanzariInPerioada),
    String(r.inchirieriInPerioada),
    String(r.anunturiNoiInPerioada),
    String(r.anunturiActiveAcum),
    String(r.anunturiTotalAtribuite),
    String(r.vizionariInPerioada),
    String(r.ofertePrimiteInPerioada),
    p(fmtNum(r.pretMediuVanzari, 0)),
    p(fmtNum(r.pretMediuInchirieri, 0)),
    p(fmtNum(r.suprafataMedieVanzariMp, 1)),
    p(fmtNum(r.suprafataMedieInchirieriMp, 1)),
    p(fmtNum(r.medieZileCrearePanaLaTranzactie, 1)),
    p(fmtNum(r.medieZileVanzari, 1)),
    p(fmtNum(r.medieZileInchirieri, 1)),
  ]);

  autoTable(doc, {
    startY: 30,
    head,
    body,
    styles: { fontSize: 6, cellPadding: 0.8 },
    headStyles: { fillColor: [194, 90, 43] },
    horizontalPageBreak: true,
  });

  return new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
}
