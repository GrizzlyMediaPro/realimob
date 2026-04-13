"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { InterestLevel } from "@/lib/viewing-questionnaire-types";

const INTEREST_OPTIONS: { value: InterestLevel; label: string }[] = [
  { value: "foarte_interesat", label: "Foarte interesat(ă)" },
  { value: "interesat", label: "Interesat(ă)" },
  { value: "neutru", label: "Neutru" },
  { value: "nu_intereseaza", label: "Nu mă interesează" },
];

const AGENT_RECOMMENDATION_OPTIONS = [
  { value: "strong_match", label: "Potrivire foarte bună" },
  { value: "possible_match", label: "Potrivire posibilă" },
  { value: "weak_match", label: "Potrivire slabă" },
  { value: "not_a_match", label: "Nu este potrivire" },
] as const;

/** Select nativ: fundal solid + color-scheme pentru listă/opțiuni în mod întunecat. */
const questionnaireSelectClassName =
  "w-full rounded-lg border border-black/10 dark:border-white/20 bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-100 dark:[color-scheme:dark] px-3 py-2 text-sm";

type Payload = {
  role: "agent" | "client";
  listing: { id: string; title: string; price: number; currency: string };
  viewing: {
    startAt: string;
    endAt: string;
    clientName: string;
    clientEmail: string;
  };
  questionnaire: {
    id: string;
    agentAnswers: unknown;
    clientAnswers: unknown;
    agentSubmittedAt: string | null;
    clientSubmittedAt: string | null;
  };
  alreadySubmitted: boolean;
};

export default function ViewingQuestionnaireForm({
  viewingRequestId,
  backHref,
  backLabel,
}: {
  viewingRequestId: string;
  backHref: string;
  backLabel: string;
}) {
  const router = useRouter();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [attended, setAttended] = useState<boolean | null>(null);
  const [interestLevel, setInterestLevel] = useState<InterestLevel | "">("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [likedMost, setLikedMost] = useState("");
  const [concerns, setConcerns] = useState("");
  const [experienceRating, setExperienceRating] = useState<number | "">("");
  const [matchNotes, setMatchNotes] = useState("");
  const [clientPunctualityRating, setClientPunctualityRating] = useState<number | "">("");
  const [clientEngagementRating, setClientEngagementRating] = useState<number | "">("");
  const [clientObjections, setClientObjections] = useState("");
  const [recommendation, setRecommendation] = useState<
    "strong_match" | "possible_match" | "weak_match" | "not_a_match" | ""
  >("");
  const [followUpAction, setFollowUpAction] = useState("");
  const [wantsOffer, setWantsOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerCurrency, setOfferCurrency] = useState("RON");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const r = await fetch(
        `/api/viewing-questionnaires/${viewingRequestId}`,
        { cache: "no-store" },
      );
      const j = await r.json();
      if (!r.ok) {
        setLoadError(j?.error ?? "Nu am putut încărca chestionarul.");
        setPayload(null);
        return;
      }
      const p = j as Payload;
      setPayload(p);
      if (p.listing?.currency) setOfferCurrency(p.listing.currency);
    } catch {
      setLoadError("Eroare de rețea.");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [viewingRequestId]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload) return;
    setSubmitError(null);
    if (attended === null || !interestLevel) {
      setSubmitError("Completează participarea și nivelul de interes.");
      return;
    }
    if (payload.role === "client" && !experienceRating) {
      setSubmitError("Completează evaluarea experienței tale.");
      return;
    }
    if (
      payload.role === "agent" &&
      (!clientPunctualityRating || !clientEngagementRating || !recommendation)
    ) {
      setSubmitError("Completează evaluarea detaliată a vizionării.");
      return;
    }
    if (wantsOffer) {
      const n = Number(String(offerAmount).replace(",", "."));
      if (!Number.isFinite(n) || n <= 0) {
        setSubmitError("Introdu o sumă validă pentru ofertă.");
        return;
      }
    }
    setSubmitting(true);
    try {
      const body = {
        answers: {
          attended,
          interestLevel,
          additionalNotes,
          ...(payload.role === "client"
            ? {
                experienceRating,
                likedMost,
                concerns,
              }
            : {
                matchNotes,
                clientPunctualityRating,
                clientEngagementRating,
                clientObjections,
                recommendation,
                followUpAction,
              }),
          wantsOffer,
          ...(wantsOffer
            ? {
                offerAmount: Number(String(offerAmount).replace(",", ".")),
                offerCurrency,
              }
            : {}),
        },
      };
      const r = await fetch(`/api/viewing-questionnaires/${viewingRequestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) {
        setSubmitError(j?.error ?? "Nu am putut salva.");
        return;
      }
      if (backHref === "/agent") {
        window.location.href = "/agent";
        return;
      }
      router.push(backHref);
      router.refresh();
    } catch {
      setSubmitError("Eroare la trimitere.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400 py-8 text-center">
        Se încarcă chestionarul…
      </p>
    );
  }

  if (loadError || !payload) {
    return (
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
        {loadError ?? "Date indisponibile."}
        <div className="mt-3">
          <Link
            href={backHref}
            className="text-[#C25A2B] font-medium hover:underline"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  if (payload.alreadySubmitted) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Ai trimis deja chestionarul pentru această vizionare. Mulțumim!
        </p>
        <Link
          href={backHref}
          className="inline-flex text-sm font-medium text-[#C25A2B] hover:underline"
        >
          {backLabel}
        </Link>
      </div>
    );
  }

  const otherAnswers =
    payload.role === "agent" ? payload.questionnaire.clientAnswers : payload.questionnaire.agentAnswers;
  const otherLabel =
    payload.role === "agent" ? "Răspunsul clientului (după trimitere)" : "Răspunsul agentului (după trimitere)";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 p-4 text-sm space-y-1">
        <p className="font-semibold text-foreground">{payload.listing.title}</p>
        <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
          ID anunț: {payload.listing.id}
        </p>
        <p>
          <Link
            href={`/anunturi/${payload.listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#C25A2B] hover:underline"
          >
            Vezi anunțul (pagină publică) →
          </Link>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Vizionare:{" "}
          {new Date(payload.viewing.startAt).toLocaleString("ro-RO", {
            timeZone: "Europe/Bucharest",
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        {payload.role === "agent" && (
          <p className="text-gray-600 dark:text-gray-400">
            Client: {payload.viewing.clientName} ({payload.viewing.clientEmail})
          </p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground mb-2">
          Ai participat la vizionare?
        </legend>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="attended"
            checked={attended === true}
            onChange={() => setAttended(true)}
          />
          Da
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="attended"
            checked={attended === false}
            onChange={() => setAttended(false)}
          />
          Nu
        </label>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Cum evaluezi interesul după vizionare?
        </label>
        <select
          value={interestLevel}
          onChange={(e) => setInterestLevel(e.target.value as InterestLevel)}
          className={questionnaireSelectClassName}
          required
        >
          <option value="">Alege…</option>
          {INTEREST_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {payload.role === "agent"
            ? "Potrivire cu așteptări / observații despre imobil"
            : "Ce ți-a plăcut cel mai mult la imobil?"}
        </label>
        <textarea
          value={payload.role === "agent" ? matchNotes : likedMost}
          onChange={(e) =>
            payload.role === "agent"
              ? setMatchNotes(e.target.value)
              : setLikedMost(e.target.value)
          }
          rows={4}
          className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/30 px-3 py-2 text-sm resize-y min-h-[96px]"
          placeholder={
            payload.role === "agent"
              ? "Ex.: spații, lumină, zonă, starea imobilului…"
              : "Ex.: compartimentare, zonă, facilități, atmosferă…"
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {payload.role === "agent"
            ? "Obiecții/întrebări principale ale clientului"
            : "Ce te-a nemulțumit sau ce îți ridică semne de întrebare?"}
        </label>
        <textarea
          value={payload.role === "agent" ? clientObjections : concerns}
          onChange={(e) =>
            payload.role === "agent"
              ? setClientObjections(e.target.value)
              : setConcerns(e.target.value)
          }
          rows={3}
          className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/30 px-3 py-2 text-sm resize-y"
        />
      </div>

      {payload.role === "client" ? (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Cum evaluezi experiența vizionării cu agentul? (1-5)
          </label>
          <select
            value={experienceRating}
            onChange={(e) =>
              setExperienceRating(e.target.value ? Number(e.target.value) : "")
            }
            className={questionnaireSelectClassName}
            required
          >
            <option value="">Alege nota…</option>
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Punctualitatea clientului (1-5)
              </label>
              <select
                value={clientPunctualityRating}
                onChange={(e) =>
                  setClientPunctualityRating(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                className={questionnaireSelectClassName}
                required
              >
                <option value="">Alege…</option>
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nivel implicare client (1-5)
              </label>
              <select
                value={clientEngagementRating}
                onChange={(e) =>
                  setClientEngagementRating(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                className={questionnaireSelectClassName}
                required
              >
                <option value="">Alege…</option>
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Recomandare agent
            </label>
            <select
              value={recommendation}
              onChange={(e) =>
                setRecommendation(
                  e.target.value as
                    | "strong_match"
                    | "possible_match"
                    | "weak_match"
                    | "not_a_match"
                    | "",
                )
              }
              className={questionnaireSelectClassName}
              required
            >
              <option value="">Alege recomandarea…</option>
              {AGENT_RECOMMENDATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Acțiune de follow-up propusă
            </label>
            <textarea
              value={followUpAction}
              onChange={(e) => setFollowUpAction(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/30 px-3 py-2 text-sm resize-y"
              placeholder="Ex.: trimis ofertă, programat al doilea tur, clarificări documente."
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Alte note (opțional)
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/30 px-3 py-2 text-sm resize-y"
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={wantsOffer}
          onChange={(e) => setWantsOffer(e.target.checked)}
        />
        Vreau să înregistrez o ofertă (sumă)
      </label>

      {wantsOffer && (
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Sumă
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/30 px-3 py-2 text-sm"
              placeholder="ex. 95000"
            />
          </div>
          <div className="w-28">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Monedă
            </label>
            <input
              type="text"
              value={offerCurrency}
              onChange={(e) => setOfferCurrency(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/30 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {(() => {
        const hasOther =
          otherAnswers != null &&
          typeof otherAnswers === "object" &&
          Object.keys(otherAnswers as object).length > 0;
        if (!hasOther) return null;
        return (
          <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-sm">
            <p className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">
              {otherLabel}
            </p>
            <pre className="text-xs whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 overflow-x-auto">
              {JSON.stringify(otherAnswers, null, 2)}
            </pre>
          </div>
        );
      })()}

      {submitError && (
        <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#C25A2B] hover:opacity-95 disabled:opacity-50"
        >
          {submitting ? "Se trimite…" : "Trimite chestionarul"}
        </button>
        <Link
          href={backHref}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5"
        >
          Renunță
        </Link>
      </div>
    </form>
  );
}
