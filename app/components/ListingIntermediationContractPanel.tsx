"use client";

import { useState } from "react";
import { MdDescription, MdDownload } from "react-icons/md";
import { UploadButton } from "./Uploadthing";

type ListingIntermediationContractPanelProps = {
  listingId: string;
  contractSubmitted: boolean;
  contractRejected: boolean;
  rejectionNote: string | null;
  onSubmitted: () => void;
  isDark: boolean;
  compact?: boolean;
};

export default function ListingIntermediationContractPanel({
  listingId,
  contractSubmitted,
  contractRejected,
  rejectionNote,
  onSubmitted,
  isDark,
  compact = false,
}: ListingIntermediationContractPanelProps) {
  const [contractUrl, setContractUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const awaitingReview = contractSubmitted && !contractRejected;

  const submit = async () => {
    if (!contractUrl.trim()) {
      setError("Încarcă contractul semnat înainte de trimitere.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(
        `/api/account/listings/${listingId}/submit-intermediation-contract`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractUrl: contractUrl.trim(),
            contractFileName: fileName.trim() || null,
          }),
        },
      );
      const j = await r.json();
      if (!r.ok) {
        setError(j?.error ?? "Trimiterea a eșuat.");
        return;
      }
      setContractUrl("");
      setFileName("");
      onSubmitted();
    } catch {
      setError("Eroare de rețea.");
    } finally {
      setSubmitting(false);
    }
  };

  if (awaitingReview) {
    return (
      <p className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-1.5 rounded-lg mt-2">
        Contract trimis — în verificare la administrator. Anunțul se publică după
        aprobarea anunțului și a contractului.
      </p>
    );
  }

  return (
    <div
      className={`mt-2 rounded-xl border border-dashed ${
        compact ? "p-2.5" : "p-3"
      } border-[#C25A2B]/35 bg-[#C25A2B]/5 dark:bg-[#C25A2B]/10`}
    >
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-start gap-1.5">
        <MdDescription className="text-[#C25A2B] shrink-0 mt-0.5" size={16} />
        <span>
          Descarcă contractul de intermediere, semnează-l și încarcă varianta semnată.
          Anunțul se publică doar după ce administratorul aprobă anunțul și contractul.
        </span>
      </p>
      {contractRejected && rejectionNote && (
        <p className="text-xs text-red-700 dark:text-red-300 bg-red-500/10 px-2 py-1 rounded-lg mb-2">
          Contract respins: {rejectionNote}
        </p>
      )}
      {contractRejected && !rejectionNote && (
        <p className="text-xs text-red-700 dark:text-red-300 bg-red-500/10 px-2 py-1 rounded-lg mb-2">
          Contractul anterior nu a fost acceptat. Te rugăm să încarci din nou documentul
          semnat.
        </p>
      )}
      <a
        href="/api/listings/intermediation-contract-template"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C25A2B] hover:underline mb-2"
      >
        <MdDownload size={16} />
        Descarcă contractul
      </a>
      <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-2 bg-white/40 dark:bg-white/5">
        <UploadButton
          endpoint="documentUploader"
          onClientUploadComplete={(res) => {
            const f = res?.[0];
            if (f?.url) {
              setContractUrl(f.url);
              setFileName(f.name ?? "");
            }
          }}
          onUploadError={(e: Error) => setError(e.message)}
          content={{
            button: "Încarcă contractul semnat (PDF)",
            allowedContent: "PDF",
          }}
        />
        {contractUrl ? (
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
            Pregătit: <strong>{fileName || "document"}</strong>
          </p>
        ) : null}
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}
      <button
        type="button"
        disabled={submitting || !contractUrl}
        onClick={submit}
        className="mt-2 text-xs font-semibold px-3 py-2 rounded-xl text-white bg-[#C25A2B] disabled:opacity-45"
      >
        {submitting ? "Se trimite…" : "Trimite contractul semnat"}
      </button>
    </div>
  );
}
