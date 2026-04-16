"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { CiHeart } from "react-icons/ci";
import { MdFavorite, MdClose, MdLogin } from "react-icons/md";

type ListingFavoriteButtonProps = {
  anuntId: string;
  className?: string;
};

export default function ListingFavoriteButton({ anuntId, className = "" }: ListingFavoriteButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/favorites", { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as { listingIds: string[] };
        if (!cancelled) setFavorited(j.listingIds.includes(anuntId));
      } catch {
        /* ignore */
      }
    })();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, anuntId]);

  const toggle = useCallback(async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setShowLoginPopup(true);
      return;
    }
    if (busy) return;
    setBusy(true);
    const prev = favorited;
    setFavorited(!prev);
    try {
      const r = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: anuntId }),
      });
      if (!r.ok) {
        setFavorited(prev);
      } else {
        const j = (await r.json()) as { favorited: boolean };
        setFavorited(j.favorited);
      }
    } catch {
      setFavorited(prev);
    } finally {
      setBusy(false);
    }
  }, [isLoaded, isSignedIn, anuntId, busy, favorited]);

  return (
    <>
      <button
        type="button"
        aria-label={favorited ? "Elimină din favorite" : "Adaugă la favorite"}
        aria-pressed={favorited}
        disabled={busy}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity shrink-0 disabled:opacity-60 ${
          favorited ? "bg-[#C25A2B]" : "bg-[#3B1F3A]"
        } ${className}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void toggle();
        }}
      >
        {favorited ? <MdFavorite size={18} /> : <CiHeart size={18} />}
      </button>

      {showLoginPopup && (
        <div
          className="fixed inset-0 z-300 flex items-center justify-center p-4"
          onClick={(ev) => { if (ev.target === ev.currentTarget) setShowLoginPopup(false); }}
        >
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              fontFamily: "var(--font-galak-regular)",
              background: isDark ? "rgba(29, 31, 45, 0.96)" : "rgba(255, 255, 255, 0.96)",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.7)",
              boxShadow: isDark
                ? "0 18px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                : "0 18px 60px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(80px) saturate(1.6)",
              WebkitBackdropFilter: "blur(80px) saturate(1.6)",
            }}
          >
            {/* Glass reflection */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "30%",
                background: isDark
                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
                  : "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)",
                borderRadius: "inherit",
                pointerEvents: "none",
              }}
            />

            <div className="relative p-5 md:p-6">
              <button
                type="button"
                onClick={() => setShowLoginPopup(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Închide"
              >
                <MdClose size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#C25A2B]/10 text-[#C25A2B]">
                  <MdLogin size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Cont necesar</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Pentru a salva favorite
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                Trebuie să fii autentificat pentru a adăuga anunțuri la favorite. Conectează-te sau creează un cont.
              </p>

              <div className="space-y-2.5">
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
                  className="block w-full px-4 py-3 rounded-xl text-white font-medium text-center text-sm hover:opacity-90 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                  }}
                  onClick={() => setShowLoginPopup(false)}
                >
                  Conectare
                </Link>

                <Link
                  href={`/sign-up?redirect_url=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
                  className="block w-full px-4 py-3 rounded-xl font-medium text-center text-sm text-foreground hover:opacity-90 transition-opacity"
                  style={{
                    background: isDark ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.58)",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.55)",
                    boxShadow: isDark
                      ? "0 2px 10px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                      : "0 2px 10px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.55)",
                  }}
                  onClick={() => setShowLoginPopup(false)}
                >
                  Creează cont
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
