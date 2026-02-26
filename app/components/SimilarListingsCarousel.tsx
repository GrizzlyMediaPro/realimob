"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdAttachMoney,
  MdSquareFoot,
  MdLocationOn,
  MdStairs,
  MdBuild,
  MdBalcony,
  MdHomeWork,
  MdStar,
  MdDeck,
  MdViewQuilt,
  MdAutoAwesome,
  MdHome,
} from "react-icons/md";
import type { IconType } from "react-icons";

import {
  getSimilarAnunturi,
  parsePretToNumber,
  type Anunt,
} from "../../lib/anunturiData";

type SimilarListingsCarouselProps = {
  anunt: Anunt;
  isInchiriere?: boolean;
  basePath: string; // ex: "/vanzare", "/inchiriere", "/anunturi"
};

// Funcție helper pentru a obține icoana potrivită pentru fiecare tag
const getTagIcon = (tag: string): IconType | null => {
  const lowerTag = tag.toLowerCase();

  if (lowerTag.includes("€") || lowerTag.includes("pret") || lowerTag.includes("de la")) {
    return MdAttachMoney;
  }
  if (lowerTag.includes("m²") || lowerTag.includes("suprafata")) {
    return MdSquareFoot;
  }
  if (lowerTag.includes("centru") || lowerTag.includes("sector") || lowerTag.includes("locatie")) {
    return MdLocationOn;
  }
  if (lowerTag.includes("etaj") || lowerTag.includes("parter")) {
    return MdStairs;
  }
  if (lowerTag.includes("mobilat") || lowerTag.includes("mobila")) {
    return MdHome;
  }
  if (lowerTag.includes("balcon")) {
    return MdBalcony;
  }
  if (lowerTag.includes("renovat") || lowerTag.includes("renovare")) {
    return MdBuild;
  }
  if (lowerTag.includes("duplex")) {
    return MdHomeWork;
  }
  if (lowerTag.includes("lux") || lowerTag.includes("premium")) {
    return MdStar;
  }
  if (lowerTag.includes("terasa") || lowerTag.includes("terasă")) {
    return MdDeck;
  }
  if (lowerTag.includes("compartimentare") || lowerTag.includes("decomandat")) {
    return MdViewQuilt;
  }
  if (lowerTag.includes("modern")) {
    return MdAutoAwesome;
  }

  return null;
};

// Funcție helper pentru a formata prețul ca "X €/lună" pentru închiriere
const formatPretLuna = (pret: string): string => {
  const pretVanzare = parsePretToNumber(pret);
  let factor = 120;
  if (pretVanzare < 50000) factor = 100;
  if (pretVanzare > 150000) factor = 150;

  const chirie = Math.round(pretVanzare / factor);
  const chirieFinala = Math.max(300, Math.min(2000, chirie));

  return `${chirieFinala.toLocaleString("ro-RO")} €/lună`;
};

export default function SimilarListingsCarousel({
  anunt,
  isInchiriere = false,
  basePath,
}: SimilarListingsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const similarAnunturi = getSimilarAnunturi(anunt, 10);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    checkScroll();
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

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
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 100);
    }
  };

  if (!similarAnunturi.length) return null;

  return (
    <section className="w-full mt-4 md:mt-6 pb-4 md:pb-8">
      <div className="w-full max-w-[1250px] mx-auto">
        <div
          className="rounded-none md:rounded-3xl overflow-hidden relative"
          style={{
            fontFamily: "var(--font-galak-regular)",
            background: isDark ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.6)",
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

          <div className="p-4 md:p-6 relative z-1" style={{ background: "transparent" }}>
            <div className="flex items-center justify-between gap-2 md:gap-3 flex-wrap mb-3 md:mb-6">
              <h2
                className="home-section-title text-xl md:text-3xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Anunțuri similare
              </h2>
            </div>

            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto hide-scrollbar pb-4"
              >
                {similarAnunturi.map((item) => {
                  const pretAfisat = isInchiriere ? formatPretLuna(item.pret) : item.pret;
                  const href = `${basePath}/${item.id}`;

                  return (
                    <Link
                      key={item.id}
                      href={href}
                      className="shrink-0 w-[320px] rounded-lg overflow-hidden relative cursor-pointer"
                      style={{
                        background: isDark
                          ? "rgba(35, 35, 48, 0.45)"
                          : "rgba(255, 255, 255, 0.55)",
                        border: isDark
                          ? "1px solid rgba(255, 255, 255, 0.1)"
                          : "1px solid rgba(255, 255, 255, 0.45)",
                        boxShadow: isDark
                          ? "0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                          : "0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                        backdropFilter: "blur(60px) saturate(1.6)",
                        WebkitBackdropFilter: "blur(60px) saturate(1.6)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = isDark
                          ? "0 6px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                          : "0 6px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.55)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = isDark
                          ? "0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                          : "0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)";
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

                      {/* Imagine cu preț overlay */}
                      <div className="w-full h-[200px] relative">
                        <Image
                          src={item.image}
                          alt={item.titlu}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-black/60 backdrop-blur-sm">
                          <div
                            className="text-xl font-bold text-white"
                            style={{ fontFamily: "var(--font-galak-regular)" }}
                          >
                            {pretAfisat}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 relative z-1">
                        <h3
                          className="text-lg font-bold mb-3 text-foreground line-clamp-2"
                          style={{
                            fontFamily: "var(--font-galak-regular)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "3.2rem",
                          }}
                        >
                          {item.titlu}
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, index) => {
                            const Icon = getTagIcon(tag);
                            return (
                              <span
                                key={`${item.id}-tag-${index}`}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                style={{ fontFamily: "var(--font-galak-regular)" }}
                              >
                                {Icon && <Icon size={14} />}
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Buton navigare stânga */}
              {showLeftArrow && (
                <button
                  onClick={() => scroll("left")}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full hover:opacity-80 items-center justify-center text-foreground transition-opacity shadow-lg z-10"
                  style={{
                    background: isDark ? "rgba(35, 35, 48, 0.6)" : "rgba(255, 255, 255, 0.7)",
                    border: isDark
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "1px solid rgba(255, 255, 255, 0.5)",
                    backdropFilter: "blur(40px) saturate(1.6)",
                    WebkitBackdropFilter: "blur(40px) saturate(1.6)",
                    boxShadow: isDark
                      ? "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                      : "0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                  }}
                  aria-label="Scroll left"
                >
                  <MdOutlineKeyboardArrowLeft size={24} />
                </button>
              )}

              {/* Buton navigare dreapta */}
              {showRightArrow && (
                <button
                  onClick={() => scroll("right")}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full hover:opacity-80 items-center justify-center text-foreground transition-opacity shadow-lg z-10"
                  style={{
                    background: isDark ? "rgba(35, 35, 48, 0.6)" : "rgba(255, 255, 255, 0.7)",
                    border: isDark
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "1px solid rgba(255, 255, 255, 0.5)",
                    backdropFilter: "blur(40px) saturate(1.6)",
                    WebkitBackdropFilter: "blur(40px) saturate(1.6)",
                    boxShadow: isDark
                      ? "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                      : "0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                  }}
                  aria-label="Scroll right"
                >
                  <MdOutlineKeyboardArrowRight size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

