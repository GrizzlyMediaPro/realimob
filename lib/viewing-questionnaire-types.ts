export type InterestLevel =
  | "foarte_interesat"
  | "interesat"
  | "neutru"
  | "nu_intereseaza";

export type ViewingQuestionnaireAnswers = {
  attended: boolean | null;
  interestLevel: InterestLevel | null;
  matchNotes: string;
  additionalNotes: string;
  wantsOffer: boolean;
  offerAmount?: number;
  offerCurrency?: string;
};

export function parseQuestionnaireBody(raw: unknown): ViewingQuestionnaireAnswers | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const interestLevel = o.interestLevel;
  const validLevels: InterestLevel[] = [
    "foarte_interesat",
    "interesat",
    "neutru",
    "nu_intereseaza",
  ];
  const il =
    typeof interestLevel === "string" && validLevels.includes(interestLevel as InterestLevel)
      ? (interestLevel as InterestLevel)
      : null;

  let attended: boolean | null = null;
  if (o.attended === true) attended = true;
  else if (o.attended === false) attended = false;

  const matchNotes = typeof o.matchNotes === "string" ? o.matchNotes.slice(0, 4000) : "";
  const additionalNotes =
    typeof o.additionalNotes === "string" ? o.additionalNotes.slice(0, 4000) : "";

  const wantsOffer = o.wantsOffer === true;
  let offerAmount: number | undefined;
  if (wantsOffer && typeof o.offerAmount === "number" && Number.isFinite(o.offerAmount)) {
    offerAmount = o.offerAmount;
  }
  const offerCurrency =
    typeof o.offerCurrency === "string" && o.offerCurrency.trim()
      ? o.offerCurrency.trim().slice(0, 8)
      : undefined;

  if (attended === null || il === null) return null;

  return {
    attended,
    interestLevel: il,
    matchNotes,
    additionalNotes,
    wantsOffer,
    offerAmount,
    offerCurrency,
  };
}
