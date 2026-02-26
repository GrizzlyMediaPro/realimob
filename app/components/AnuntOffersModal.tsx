 "use client";

import { useEffect, useState } from "react";
import { MdClose, MdLocalOffer, MdHistory } from "react-icons/md";

type Offer = {
  id: number;
  amount: string;
  date: string; // doar data, fără oră
};

interface AnuntOffersModalProps {
  anuntId: string;
}

// În lipsa unui backend real, folosim momentan oferte mock,
// ușor de înlocuit ulterior cu date reale.
const mockOffers: Offer[] = [
  {
    id: 1,
    amount: "118.000 €",
    date: "10 feb 2025",
  },
  {
    id: 2,
    amount: "120.500 €",
    date: "18 feb 2025",
  },
  {
    id: 3,
    amount: "122.000 €",
    date: "22 feb 2025",
  },
];

export default function AnuntOffersModal({ anuntId }: AnuntOffersModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  // Momentan folosim același set de oferte pentru toate anunțurile.
  // Poți înlocui ușor cu un fetch către API sau funcție de utilitate:
  // const offers = getOffersForAnunt(anuntId);
  const offers = mockOffers;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm md:text-[15px] font-medium transition-all duration-300 border bg-white/70 dark:bg-white/5 text-gray-900 dark:text-foreground border-gray-200/80 dark:border-gray-700/70 hover:border-[#C25A2B] hover:text-[#C25A2B]"
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
              {offers.length === 0 ? (
                <div className="py-6 text-sm text-gray-600 dark:text-gray-300">
                  Încă nu există oferte pentru acest anunț.
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-800/70"
                    >
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {offer.amount}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {offer.date}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

