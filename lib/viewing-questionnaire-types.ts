export type InterestLevel =
  | "foarte_interesat"
  | "interesat"
  | "neutru"
  | "nu_intereseaza";

type BaseQuestionnaireAnswers = {
  attended: boolean | null;
  interestLevel: InterestLevel | null;
  additionalNotes: string;
  wantsOffer: boolean;
  offerAmount?: number;
  offerCurrency?: string;
};

export type ClientQuestionnaireAnswers = BaseQuestionnaireAnswers & {
  experienceRating: number | null;
  likedMost: string;
  concerns: string;
};

export type AgentQuestionnaireAnswers = BaseQuestionnaireAnswers & {
  matchNotes: string;
  clientPunctualityRating: number | null;
  clientEngagementRating: number | null;
  clientObjections: string;
  recommendation: "strong_match" | "possible_match" | "weak_match" | "not_a_match" | null;
  followUpAction: string;
};

export type ViewingQuestionnaireAnswers =
  | ClientQuestionnaireAnswers
  | AgentQuestionnaireAnswers;

function parseRating(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  const rounded = Math.round(raw);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

export function parseQuestionnaireBody(
  raw: unknown,
  role: "agent" | "client",
): ViewingQuestionnaireAnswers | null {
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

  const base: BaseQuestionnaireAnswers = {
    attended,
    interestLevel: il,
    additionalNotes,
    wantsOffer,
    offerAmount,
    offerCurrency,
  };

  if (role === "client") {
    const experienceRating = parseRating(o.experienceRating);
    const likedMost = typeof o.likedMost === "string" ? o.likedMost.slice(0, 4000) : "";
    const concerns = typeof o.concerns === "string" ? o.concerns.slice(0, 4000) : "";
    if (experienceRating === null) return null;
    return {
      ...base,
      experienceRating,
      likedMost,
      concerns,
    };
  }

  const clientPunctualityRating = parseRating(o.clientPunctualityRating);
  const clientEngagementRating = parseRating(o.clientEngagementRating);
  const clientObjections =
    typeof o.clientObjections === "string" ? o.clientObjections.slice(0, 4000) : "";
  const followUpAction =
    typeof o.followUpAction === "string" ? o.followUpAction.slice(0, 4000) : "";
  const matchNotes = typeof o.matchNotes === "string" ? o.matchNotes.slice(0, 4000) : "";
  const recommendationRaw = o.recommendation;
  const validRecommendations = [
    "strong_match",
    "possible_match",
    "weak_match",
    "not_a_match",
  ] as const;
  const recommendation =
    typeof recommendationRaw === "string" &&
    validRecommendations.includes(
      recommendationRaw as (typeof validRecommendations)[number],
    )
      ? (recommendationRaw as (typeof validRecommendations)[number])
      : null;

  if (
    clientPunctualityRating === null ||
    clientEngagementRating === null ||
    recommendation === null
  ) {
    return null;
  }

  return {
    ...base,
    matchNotes,
    clientPunctualityRating,
    clientEngagementRating,
    clientObjections,
    recommendation,
    followUpAction,
  };
}
