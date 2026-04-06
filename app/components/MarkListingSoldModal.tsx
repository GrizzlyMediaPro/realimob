"use client";

import { useEffect, useState } from "react";
import { MdClose, MdUploadFile } from "react-icons/md";
import { UploadButton } from "./Uploadthing";

type MarkListingSoldModalProps = {
  listingId: string;
  listingTitle: string;
  markLabel: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  isDark: boolean;
};

export default function MarkListingSoldModal({
  listingId,
  listingTitle,
  markLabel,
  isOpen,
  onClose,
  onSubmitted,
  isDark,
}: MarkListingSoldModalProps) {
  const [contractUrl, setContractUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setContractUrl("");
      setFileName("");
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async () => {
    if (!contractUrl.trim()) {
      setError("Încarcă contractul înainte de trimitere.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(`/api/agent/listings/${listingId}/submit-sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractUrl: contractUrl.trim(),
          contractFileName: fileName.trim() || null,
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j?.error ?? "Trimiterea a eșuat.");
        return;
      }
      onSubmitted();
      onClose();
    } catch {
      setError("Eroare de rețea.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-xl"
        style={{
          fontFamily: "var(--font-galak-regular)",
          background: isDark ? "rgba(29, 31, 45, 0.98)" : "rgba(255, 255, 255, 0.98)",
          border: isDark
            ? "1px solid rgba(255, 255, 255, 0.12)"
            : "1px solid rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <MdUploadFile className="text-[#C25A2B] text-xl" />
            <span className="font-semibold text-foreground">{markLabel}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Închide"
          >
            <MdClose className="text-lg" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-medium text-foreground">{listingTitle}</span>
            <br />
            Încarcă contractul de vânzare-cumparare (sau documentul echivalent). Administratorul îl verifică
            înainte ca anunțul să fie scos din site și mutat la „Vândute”.
          </p>
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4">
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
                button: "Încarcă contractul (PDF / imagine)",
                allowedContent: "Document",
              }}
            />
            {contractUrl ? (
              <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                Încărcat: <strong>{fileName || "document"}</strong>
              </p>
            ) : null}
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={submitting || !contractUrl}
              onClick={submit}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#C25A2B] disabled:opacity-45"
            >
              {submitting ? "Se trimite…" : "Trimite spre verificare"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm border border-black/15 dark:border-white/20"
            >
              Renunță
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
