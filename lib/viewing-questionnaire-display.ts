/** Afișare lizibilă în admin pentru răspunsuri salvate ca Json (inclusiv date vechi, parțiale). */

const INTEREST_LABELS: Record<string, string> = {
  foarte_interesat: "Foarte interesat(ă)",
  interesat: "Interesat(ă)",
  neutru: "Neutru",
  nu_intereseaza: "Nu mă interesează",
};

const RECOMMENDATION_LABELS: Record<string, string> = {
  strong_match: "Potrivire foarte bună",
  possible_match: "Potrivire posibilă",
  weak_match: "Potrivire slabă",
  not_a_match: "Nu este potrivire",
};

function asRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

function str(v: unknown, max = 2000): string {
  if (typeof v !== "string") return "";
  const t = v.trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function boolLabel(v: unknown): string {
  if (v === true) return "Da";
  if (v === false) return "Nu";
  return "—";
}

function interestLabel(v: unknown): string {
  if (typeof v !== "string") return "—";
  return INTEREST_LABELS[v] ?? v;
}

function numOrDash(v: unknown): string {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  return String(Math.round(v));
}

function offerLine(o: Record<string, unknown>): string | null {
  const wants = o.wantsOffer === true;
  if (!wants) return "Nu";
  const amt = o.offerAmount;
  const cur = str(o.offerCurrency, 12) || "RON";
  if (typeof amt === "number" && Number.isFinite(amt) && amt > 0) {
    return `${amt.toLocaleString("ro-RO")} ${cur}`;
  }
  return "Da (sumă nespecificată)";
}

export type QuestionnaireDisplayRow = { label: string; value: string };

export function formatAgentQuestionnaireForDisplay(raw: unknown): QuestionnaireDisplayRow[] {
  const o = asRecord(raw);
  if (!o || Object.keys(o).length === 0) {
    return [{ label: "Stare", value: "Nu s-a trimis încă" }];
  }

  const rows: QuestionnaireDisplayRow[] = [
    { label: "A participat la vizionare", value: boolLabel(o.attended) },
    { label: "Nivel interes", value: interestLabel(o.interestLevel) },
    { label: "Potrivire / observații imobil", value: str(o.matchNotes) || "—" },
    { label: "Punctualitate client (1–5)", value: numOrDash(o.clientPunctualityRating) },
    { label: "Implicare client (1–5)", value: numOrDash(o.clientEngagementRating) },
    { label: "Obiecții / întrebări client", value: str(o.clientObjections) || "—" },
    {
      label: "Recomandare agent",
      value:
        typeof o.recommendation === "string"
          ? RECOMMENDATION_LABELS[o.recommendation] ?? o.recommendation
          : "—",
    },
    { label: "Follow-up propus", value: str(o.followUpAction) || "—" },
    { label: "Alte note", value: str(o.additionalNotes) || "—" },
    { label: "Ofertă înregistrată", value: offerLine(o) ?? "—" },
  ];

  return rows;
}

export function formatClientQuestionnaireForDisplay(raw: unknown): QuestionnaireDisplayRow[] {
  const o = asRecord(raw);
  if (!o || Object.keys(o).length === 0) {
    return [{ label: "Stare", value: "Nu s-a trimis încă" }];
  }

  const liked =
    str(o.likedMost) ||
    str(o.matchNotes) ||
    "—";
  const concerns = str(o.concerns) || "—";

  const rows: QuestionnaireDisplayRow[] = [
    { label: "A participat la vizionare", value: boolLabel(o.attended) },
    { label: "Nivel interes", value: interestLabel(o.interestLevel) },
    {
      label: "Experiență vizionare cu agentul (1–5)",
      value:
        typeof o.experienceRating === "number" && Number.isFinite(o.experienceRating)
          ? String(Math.round(o.experienceRating))
          : "—",
    },
    { label: "Ce i-a plăcut", value: liked },
    { label: "Preocupări / nelămuriri", value: concerns },
    { label: "Alte note", value: str(o.additionalNotes) || "—" },
    { label: "Ofertă propusă", value: offerLine(o) ?? "—" },
  ];

  return rows;
}
