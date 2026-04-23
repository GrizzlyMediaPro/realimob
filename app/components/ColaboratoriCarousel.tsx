"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MdClose,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import ListingDescriptionDisplay from "./ListingDescriptionDisplay";
import type { CollaboratorEntry } from "@/lib/platformSettings";

type Props = {
  collaborators: CollaboratorEntry[];
};

export default function ColaboratoriCarousel({ collaborators }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const closeModal = useCallback(() => setActiveIndex(null), []);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, closeModal]);

  const activeCollaborator =
    activeIndex !== null ? collaborators[activeIndex] : null;

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [collaborators.length]);

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

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 344;
    scrollContainerRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 100);
  };

  if (collaborators.length === 0) return null;
  const isSingle = collaborators.length === 1;

  const cardBg = isDark ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.55)";
  const cardBorder = isDark
    ? "1px solid rgba(255, 255, 255, 0.1)"
    : "1px solid rgba(255, 255, 255, 0.45)";
  const cardShadow = isDark
    ? "0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
    : "0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)";
  const cardShadowHover = isDark
    ? "0 6px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
    : "0 6px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.55)";
  const imageAreaBg = isDark
    ? "linear-gradient(135deg, rgba(35,35,48,0.65) 0%, rgba(20,20,28,0.85) 100%)"
    : "linear-gradient(135deg, #f6f1ec 0%, #ffffff 100%)";

  return (
    <section className="w-full pb-6 md:pb-12 px-0 md:px-8">
      <div className="w-full md:max-w-[1250px] md:mx-auto">
        <div
          className="rounded-none md:rounded-3xl overflow-hidden relative"
          style={{
            fontFamily: "var(--font-galak-regular)",
            background: isDark
              ? "rgba(35, 35, 48, 0.5)"
              : "rgba(255, 255, 255, 0.6)",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.12)"
              : "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              : "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(80px) saturate(1.6)",
            WebkitBackdropFilter: "blur(80px) saturate(1.6)",
          }}
        >
          {/* Reflexie mată subtilă */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: isDark
                ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
                : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
              borderRadius: "inherit",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <div
            className="p-4 md:p-6 relative z-1"
            style={{ background: "transparent" }}
          >
            <div className="flex items-center justify-between gap-2 md:gap-3 flex-wrap mb-3 md:mb-6">
              <h2
                className="home-section-title text-2xl md:text-5xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Colaboratori
              </h2>
            </div>

            <div className="relative">
              <div
                ref={scrollContainerRef}
                className={
                  isSingle
                    ? "flex justify-center pb-4"
                    : "flex gap-6 overflow-x-auto hide-scrollbar pb-4 snap-x"
                }
              >
                {collaborators.map((collaborator, index) => (
                  <article
                    key={`${collaborator.name || "collab"}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveIndex(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveIndex(index);
                      }
                    }}
                    aria-label={`Vezi detalii despre ${collaborator.name || "colaborator"}`}
                    className={`${
                      isSingle ? "w-full max-w-[360px]" : "shrink-0 w-[320px] snap-start"
                    } rounded-lg overflow-hidden relative flex flex-col cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C25A2B] focus-visible:ring-offset-2`}
                    style={{
                      background: cardBg,
                      border: cardBorder,
                      boxShadow: cardShadow,
                      backdropFilter: "blur(60px) saturate(1.6)",
                      WebkitBackdropFilter: "blur(60px) saturate(1.6)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = cardShadowHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = cardShadow;
                    }}
                  >
                    {/* Reflexie mată */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "50%",
                        background: isDark
                          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
                          : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
                        borderRadius: "inherit",
                        pointerEvents: "none",
                        zIndex: 0,
                      }}
                    />

                    {/* Zonă imagine */}
                    <div
                      className="w-full h-[200px] relative flex items-center justify-center overflow-hidden"
                      style={{ background: imageAreaBg }}
                    >
                      {collaborator.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={collaborator.imageUrl}
                          alt={collaborator.name || "Colaborator"}
                          className="max-w-[80%] max-h-[75%] object-contain"
                        />
                      ) : (
                        <span
                          className="text-5xl font-bold text-[#C25A2B]/60 select-none"
                          style={{ fontFamily: "var(--font-galak-regular)" }}
                        >
                          {(collaborator.name || "?").charAt(0).toUpperCase()}
                        </span>
                      )}
                      {/* Linie de accent jos */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[3px]"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent 0%, #C25A2B 50%, transparent 100%)",
                          opacity: 0.85,
                        }}
                      />
                    </div>

                    {/* Conținut */}
                    <div className="p-4 relative z-1 flex-1 flex flex-col">
                      {collaborator.name ? (
                        <h3
                          className="text-xl font-bold mb-2 text-foreground"
                          style={{
                            fontFamily: "var(--font-galak-regular)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "3.5rem",
                          }}
                        >
                          {collaborator.name}
                        </h3>
                      ) : null}
                      {collaborator.description ? (
                        <div
                          className="overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          <ListingDescriptionDisplay
                            html={collaborator.description}
                          />
                        </div>
                      ) : null}
                      <div
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#C25A2B]"
                        style={{ fontFamily: "var(--font-galak-regular)" }}
                      >
                        Vezi detalii
                        <MdOutlineKeyboardArrowRight size={18} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {!isSingle && showLeftArrow && (
                <button
                  onClick={() => scroll("left")}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full hover:opacity-80 items-center justify-center text-foreground transition-opacity shadow-lg z-10"
                  style={{
                    background: isDark
                      ? "rgba(35, 35, 48, 0.6)"
                      : "rgba(255, 255, 255, 0.7)",
                    border: isDark
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "1px solid rgba(255, 255, 255, 0.5)",
                    backdropFilter: "blur(40px) saturate(1.6)",
                    WebkitBackdropFilter: "blur(40px) saturate(1.6)",
                    boxShadow: isDark
                      ? "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                      : "0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                  }}
                  aria-label="Colaborator anterior"
                >
                  <MdOutlineKeyboardArrowLeft size={24} />
                </button>
              )}

              {!isSingle && showRightArrow && (
                <button
                  onClick={() => scroll("right")}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full hover:opacity-80 items-center justify-center text-foreground transition-opacity shadow-lg z-10"
                  style={{
                    background: isDark
                      ? "rgba(35, 35, 48, 0.6)"
                      : "rgba(255, 255, 255, 0.7)",
                    border: isDark
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "1px solid rgba(255, 255, 255, 0.5)",
                    backdropFilter: "blur(40px) saturate(1.6)",
                    WebkitBackdropFilter: "blur(40px) saturate(1.6)",
                    boxShadow: isDark
                      ? "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                      : "0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                  }}
                  aria-label="Colaborator urm\u0103tor"
                >
                  <MdOutlineKeyboardArrowRight size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeCollaborator ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            activeCollaborator.name
              ? `Detalii ${activeCollaborator.name}`
              : "Detalii colaborator"
          }
          className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8"
          onClick={closeModal}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? "rgba(0, 0, 0, 0.7)"
                : "rgba(15, 15, 25, 0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl md:rounded-3xl overflow-hidden flex flex-col"
            style={{
              fontFamily: "var(--font-galak-regular)",
              background: isDark
                ? "rgba(25, 25, 34, 0.95)"
                : "rgba(255, 255, 255, 0.97)",
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.12)"
                : "1px solid rgba(0, 0, 0, 0.06)",
              boxShadow: isDark
                ? "0 24px 60px rgba(0, 0, 0, 0.5)"
                : "0 24px 60px rgba(0, 0, 0, 0.18)",
            }}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 md:top-4 md:right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-foreground transition-opacity hover:opacity-80"
              style={{
                background: isDark
                  ? "rgba(35, 35, 48, 0.85)"
                  : "rgba(255, 255, 255, 0.9)",
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.12)"
                  : "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
              aria-label="Închide"
            >
              <MdClose size={22} />
            </button>

            {activeCollaborator.imageUrl ? (
              <div
                className="relative w-full h-[220px] md:h-[280px] flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: imageAreaBg }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeCollaborator.imageUrl}
                  alt={activeCollaborator.name || "Colaborator"}
                  className="max-w-[80%] max-h-[80%] object-contain"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, #C25A2B 50%, transparent 100%)",
                    opacity: 0.85,
                  }}
                />
              </div>
            ) : null}

            <div className="overflow-y-auto p-6 md:p-8">
              {activeCollaborator.name ? (
                <h3
                  className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  {activeCollaborator.name}
                </h3>
              ) : null}
              {activeCollaborator.description ? (
                <ListingDescriptionDisplay
                  html={activeCollaborator.description}
                />
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Acest colaborator nu are o descriere completată.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
