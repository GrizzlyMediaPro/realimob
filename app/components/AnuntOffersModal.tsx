 "use client";

import { useEffect, useState } from "react";
import { MdClose, MdLocalOffer, MdHistory } from "react-icons/md";

type OfferRow = {
  id: string;
  amount: number;
  currency: string;
  createdAt: string;
  proposedBy: string;
};

interface AnuntOffersModalProps {
  anuntId: string;
}

export default function AnuntOffersModal({ anuntId }: AnuntOffersModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Blochează scroll-ul paginii când modalul este deschis
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

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen || !anuntId) return;
    let cancelled = false;
    (async () => {
      setOffersLoading(true);
      setOffersError(null);
      try {
        const r = await fetch(`/api/public/listings/${anuntId}/offers`, {
          cache: "no-store",
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error ?? "Eroare");
        if (!cancelled) setOffers(j.offers ?? []);
      } catch {
        if (!cancelled) {
          setOffersError("Nu am putut încărca ofertele.");
          setOffers([]);
        }
      } finally {
        if (!cancelled) setOffersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, anuntId]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full md:w-auto items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm md:text-[15px] font-medium transition-all duration-300 border bg-white/70 dark:bg-white/5 text-gray-900 dark:text-foreground border-gray-200/80 dark:border-gray-700/70 hover:border-[#C25A2B] hover:text-[#C25A2B]"
        style={{
          boxShadow: isDark
            ? "0 2px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
            : "0 2px 10px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(40px) saturate(1.5)",
          WebkitBackdropFilter: "blur(40px) saturate(1.5)",
        }}
      >
        <MdLocalOffer className="text-[#C25A2B] text-base md:text-lg" />
        <span>Oferte primite</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/55"
            onClick={handleClose}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-[520px] mx-4 md:mx-6 rounded-2xl overflow-hidden"
            style={{
              fontFamily: "var(--font-galak-regular)",
              background: isDark
                ? "rgba(29, 31, 45, 0.96)"
                : "rgba(255, 255, 255, 0.96)",
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.12)"
                : "1px solid rgba(255, 255, 255, 0.7)",
              boxShadow: isDark
                ? "0 18px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                : "0 18px 60px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(80px) saturate(1.6)",
              WebkitBackdropFilter: "blur(80px) saturate(1.6)",
            }}
          >
            {/* Reflexie mată */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "22%",
                background: isDark
                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
                  : "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)",
                borderRadius: "inherit",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            {/* Header */}
            <div className="relative z-[1] flex items-center justify-between px-5 md:px-6 py-4 border-b border-gray-200/80 dark:border-gray-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#C25A2B]/10 text-[#C25A2B]">
                  <MdHistory className="text-lg" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-foreground">
                    Oferte primite
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Istoric pentru acest anunț
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Închide"
              >
                <MdClose className="text-lg" />
              </button>
            </div>

            {/* Content */}
            <div className="relative z-[1] px-5 md:px-6 py-4 md:py-5 max-h-[360px] overflow-y-auto">
              {offersLoading ? (
                <div className="py-6 text-sm text-gray-600 dark:text-gray-300">
                  Se încarcă ofertele…
                </div>
              ) : offersError ? (
                <div className="py-6 text-sm text-amber-700 dark:text-amber-300">
                  {offersError}
                </div>
              ) : offers.length === 0 ? (
                <div className="py-6 text-sm text-gray-600 dark:text-gray-300">
                  Încă nu există oferte confirmate afișate pentru acest anunț.
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.map((offer) => {
                    const amountLabel = `${Number(offer.amount).toLocaleString("ro-RO")} ${offer.currency}`;
                    const dateLabel = new Date(offer.createdAt).toLocaleDateString(
                      "ro-RO",
                      { day: "numeric", month: "short", year: "numeric" },
                    );
                    const src =
                      offer.proposedBy === "agent"
                        ? "Agent"
                        : offer.proposedBy === "client"
                          ? "Client"
                          : offer.proposedBy;
                    return (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-800/70"
                      >
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {amountLabel}
                          </div>
                          <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-500 mt-0.5">
                            {src}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 shrink-0">
                          {dateLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

