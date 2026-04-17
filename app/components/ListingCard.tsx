"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CiImageOn } from "react-icons/ci";
import { FaWhatsapp } from "react-icons/fa";
import { MdClose, MdLocationOn, MdPhone } from "react-icons/md";
import type { IconType } from "react-icons";
import ViewingBookingModal from "./ViewingBookingModal";
import ListingFavoriteButton from "./ListingFavoriteButton";

type ListingCardProps = {
  id: string;
  titlu: string;
  image: string;
  pret: string;
  tags: string[];
  locationText: string;
  imageCount: number;
  getTagIcon: (tag: string) => IconType | null;
  href: string;
  compact?: boolean;
  /** Afișează ID-ul anunțului (referință în contracte / administrare). */
  showListingId?: boolean;
  contactPhone?: string | null;
};

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function ListingCard({
  id,
  titlu,
  image,
  pret,
  tags,
  locationText,
  imageCount,
  getTagIcon,
  href,
  compact = false,
  showListingId = false,
  contactPhone,
}: ListingCardProps) {
  const isDark = useDarkMode();
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);

  const normalShadow = isDark
    ? "0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
    : "0 6px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)";

  const hoverShadow = isDark
    ? "0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
    : "0 10px 40px rgba(0, 0, 0, 0.09), inset 0 1px 0 rgba(255, 255, 255, 0.55)";

  const cardStyle: React.CSSProperties = {
    background: isDark
      ? "rgba(35, 35, 48, 0.5)"
      : "rgba(255, 255, 255, 0.6)",
    border: isDark
      ? "1px solid rgba(255, 255, 255, 0.12)"
      : "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: normalShadow,
    backdropFilter: "blur(80px) saturate(1.6)",
    WebkitBackdropFilter: "blur(80px) saturate(1.6)",
    transition: "all 0.3s ease",
  };

  const normalizePhoneForWhatsApp = (phone: string): string | null => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return null;
    if (digits.startsWith("40")) return digits;
    if (digits.startsWith("0")) return `40${digits.slice(1)}`;
    if (digits.length === 9) return `40${digits}`;
    return digits;
  };

  const fallbackWaPhone = (process.env.NEXT_PUBLIC_WHATSAPP_FALLBACK || "").trim();
  const resolvedWaPhone = normalizePhoneForWhatsApp(contactPhone || "") ??
    normalizePhoneForWhatsApp(fallbackWaPhone);
  const canWhatsApp = Boolean(resolvedWaPhone);

  useEffect(() => {
    if (!showContactPopup) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowContactPopup(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showContactPopup]);

  const openWhatsApp = () => {
    if (!resolvedWaPhone) return;
    const listingUrl = href.startsWith("/")
      ? `${window.location.origin}${href}`
      : href;
    const text = `Bună, sunt interesat de anunțul: ${titlu}. Link: ${listingUrl}`;
    window.open(
      `https://wa.me/${resolvedWaPhone}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  /* ── Compact card (map view mobile) ── */
  if (compact) {
    return (
      <>
        <Link
          href={href}
          className="block rounded-xl overflow-hidden relative cursor-pointer"
          style={cardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = hoverShadow;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = normalShadow;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div className="flex flex-row items-stretch h-full relative z-2">
            {/* Imagine mică stânga */}
            <div className="w-[110px] h-[110px] relative shrink-0 overflow-hidden rounded-l-xl">
              <Image
                src={image}
                alt={titlu}
                fill
                className="object-cover object-center"
              />
              <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] flex items-center gap-1 backdrop-blur-xl">
                <CiImageOn size={12} />
                <span className="font-medium">{imageCount}</span>
              </div>
            </div>

            {/* Info dreapta — compact */}
            <div className="p-2.5 flex-1 flex flex-col justify-between min-w-0">
              <div className="min-w-0">
                <h3
                  className="text-xs font-bold text-foreground leading-tight"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {titlu}
                </h3>
                {showListingId && (
                  <p className="mt-0.5 text-[9px] font-mono text-gray-500 dark:text-gray-400 truncate" title={id}>
                    ID: {id}
                  </p>
                )}
                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                  <MdLocationOn size={11} />
                  <span className="truncate">București, {locationText}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag, idx) => {
                    const Icon = getTagIcon(tag);
                    return (
                      <span
                        key={`${id}-tag-${idx}`}
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[9px] leading-tight"
                      >
                        {Icon && <Icon size={10} />}
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-1 flex items-center justify-between">
                <div className="text-sm font-bold text-foreground">{pret}</div>
                <button
                  type="button"
                  className="w-6 h-6 rounded-full bg-[#1F2D44] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowContactPopup(true);
                  }}
                >
                  <MdPhone size={12} />
                </button>
              </div>
            </div>
          </div>
        </Link>

        {showContactPopup && (
          <div
            className="fixed inset-0 z-9998 flex items-center justify-center p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setShowContactPopup(false);
            }}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
            <div
              className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden"
              style={{
                background: isDark ? "rgba(35, 35, 48, 0.58)" : "rgba(255, 255, 255, 0.72)",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid rgba(255, 255, 255, 0.55)",
                boxShadow: isDark
                  ? "0 18px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                  : "0 18px 60px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(80px) saturate(1.6)",
                WebkitBackdropFilter: "blur(80px) saturate(1.6)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "42%",
                  background: isDark
                    ? "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)"
                    : "linear-gradient(180deg, rgba(255, 255, 255, 0.38) 0%, transparent 100%)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />

              <div className="relative z-10 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-foreground">Contact rapid</h4>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/80 hover:bg-white/25 dark:hover:bg-white/10 transition-colors"
                    onClick={() => setShowContactPopup(false)}
                    aria-label="Închide"
                  >
                    <MdClose size={18} />
                  </button>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactPopup(false);
                      setShowViewingModal(true);
                    }}
                    className="w-full px-4 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      boxShadow:
                        "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    Programare vizionare
                  </button>

                  <button
                    type="button"
                    onClick={openWhatsApp}
                    disabled={!canWhatsApp}
                    className="w-full px-4 py-3 rounded-xl font-medium transition-opacity flex items-center justify-center gap-2 text-foreground disabled:opacity-45 disabled:cursor-not-allowed"
                    style={{
                      background: isDark ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.58)",
                      border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.55)",
                      boxShadow: isDark
                        ? "0 2px 10px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                        : "0 2px 10px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.55)",
                    }}
                  >
                    <FaWhatsapp className="text-lg text-[#25D366]" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ViewingBookingModal
          open={showViewingModal}
          onClose={() => setShowViewingModal(false)}
          listingId={id}
          listingTitle={titlu}
        />
      </>
    );
  }

  /* ── Card normal ── */
  return (
    <>
    <Link
      href={href}
      className="block rounded-2xl overflow-hidden relative cursor-pointer sm:h-64 md:h-72"
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = hoverShadow;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = normalShadow;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Reflexie mată subtilă */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: isDark
            ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div className="flex flex-col sm:flex-row items-stretch h-full relative z-2">
        <div className="w-full sm:w-88 md:w-96 h-40 sm:h-full relative shrink-0 overflow-hidden rounded-l-2xl">
          <Image
            src={image}
            alt={titlu}
            fill
            className="object-cover object-center"
          />
          <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-md bg-black/60 text-white text-sm flex items-center gap-2 backdrop-blur-xl">
            <CiImageOn size={18} />
            <span className="font-medium">{imageCount}</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between rounded-r-2xl h-full">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3
                className="text-lg md:text-xl font-bold text-foreground flex-1"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {titlu}
              </h3>
              <ListingFavoriteButton anuntId={id} className="hidden sm:flex ml-3" />
            </div>
            {showListingId && (
              <p className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
                ID anunț: {id}
              </p>
            )}
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MdLocationOn size={16} />
              <span>București, {locationText}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {tags.map((tag, idx) => {
                const Icon = getTagIcon(tag);
                return (
                  <span
                    key={`${id}-tag-${idx}`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {Icon && <Icon size={14} />}
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-foreground">
              {pret}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-[#1F2D44] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowContactPopup(true);
                }}
              >
                <MdPhone size={18} />
              </button>
              <ListingFavoriteButton anuntId={id} className="sm:hidden" />
            </div>
          </div>
        </div>
      </div>
    </Link>

    {showContactPopup && (
      <div
        className="fixed inset-0 z-9998 flex items-center justify-center p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) setShowContactPopup(false);
        }}
      >
        <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
        <div
          className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            background: isDark ? "rgba(35, 35, 48, 0.58)" : "rgba(255, 255, 255, 0.72)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid rgba(255, 255, 255, 0.55)",
            boxShadow: isDark
              ? "0 18px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              : "0 18px 60px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(80px) saturate(1.6)",
            WebkitBackdropFilter: "blur(80px) saturate(1.6)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "42%",
              background: isDark
                ? "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)"
                : "linear-gradient(180deg, rgba(255, 255, 255, 0.38) 0%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div className="relative z-10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-foreground">Contact rapid</h4>
              <button
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/80 hover:bg-white/25 dark:hover:bg-white/10 transition-colors"
                onClick={() => setShowContactPopup(false)}
                aria-label="Închide"
              >
                <MdClose size={18} />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowContactPopup(false);
                  setShowViewingModal(true);
                }}
                className="w-full px-4 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow:
                    "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                }}
              >
                Programare vizionare
              </button>

              <button
                type="button"
                onClick={openWhatsApp}
                disabled={!canWhatsApp}
                className="w-full px-4 py-3 rounded-xl font-medium transition-opacity flex items-center justify-center gap-2 text-foreground disabled:opacity-45 disabled:cursor-not-allowed"
                style={{
                  background: isDark ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.58)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.55)",
                  boxShadow: isDark
                    ? "0 2px 10px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                    : "0 2px 10px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.55)",
                }}
              >
                <FaWhatsapp className="text-lg text-[#25D366]" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    <ViewingBookingModal
      open={showViewingModal}
      onClose={() => setShowViewingModal(false)}
      listingId={id}
      listingTitle={titlu}
    />
    </>
  );
}
