"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  MdOutlineKeyboardArrowRight, 
  MdOutlineKeyboardArrowLeft,
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
  MdHome
} from "react-icons/md";
import type { IconType } from "react-icons";
import {
  type Anunt,
} from "../../lib/anunturiData";
import { countListingImages, transformListingToAnunt } from "../../lib/listingToAnunt";
import ConvertedListingPrice from "./ConvertedListingPrice";

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

type UiAnunt = Anunt & {
  transactionType?: string;
  realImageCount?: number;
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const matchesSelectedType = (
  selectedType: "vanzare" | "inchiriere",
  transactionType?: string,
) => {
  if (!transactionType) return false;
  const normalized = normalizeText(transactionType);
  return selectedType === "vanzare"
    ? normalized.includes("vanzare")
    : normalized.includes("inchiriere");
};

export default function AnunturiNoi() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [selectedType, setSelectedType] = useState<"vanzare" | "inchiriere">("vanzare");
  const [isDark, setIsDark] = useState(false);
  const [dbAnunturi, setDbAnunturi] = useState<UiAnunt[]>([]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchLatestListings = async (attempt = 1): Promise<void> => {
      try {
        const response = await fetch("/api/listings?limit=40", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok || cancelled) return;

        const data = await response.json();
        const listings = Array.isArray(data?.listings) ? data.listings : [];
        const transformed: UiAnunt[] = listings.map((listing: unknown) => {
          const src = (listing ?? {}) as {
            transactionType?: string;
            images?: unknown;
          };
          return {
            ...transformListingToAnunt(listing),
            transactionType: src.transactionType,
            realImageCount: countListingImages(src.images),
          };
        });

        if (!cancelled) setDbAnunturi(transformed);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof DOMException && error.name === "AbortError") return;

        // Eșecuri tranzitorii (pornire server / rețea): mai încercăm de câteva ori.
        if (attempt < 3) {
          const delayMs = attempt * 500;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          if (!cancelled) await fetchLatestListings(attempt + 1);
          return;
        }
      }
    };

    fetchLatestListings();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const highlightedAnunturi = dbAnunturi
    .filter((anunt) => matchesSelectedType(selectedType, anunt.transactionType))
    .slice(0, 10);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340; // card width (320px) + gap (24px)
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 100);
    }
  };

  return (
    <section className="w-full pb-6 md:pb-12 px-0 md:px-8">
      <div className="w-full md:max-w-[1250px] md:mx-auto">
        <div
          className="rounded-none md:rounded-3xl overflow-hidden relative"
          style={{
            fontFamily: "var(--font-galak-regular)",
            background: isDark ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.6)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.5)",
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
          {/* Heading și tab-uri pe aceeași linie (stânga/dreapta) pe toate viewport-urile */}
          <div className="flex items-center justify-between gap-2 md:gap-3 flex-wrap mb-3 md:mb-6">
            <h2
              className="home-section-title text-2xl md:text-5xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Anunțuri noi
            </h2>
            {/* Tab pentru Inchiriere/Vanzare */}
            <div className="flex gap-3 md:gap-4">
              <button
                onClick={() => setSelectedType("vanzare")}
                className={`home-section-tab pb-1 md:pb-2 px-1 text-sm md:text-base font-medium transition-colors ${
                  selectedType === "vanzare"
                    ? "text-[#C25A2B] border-b-2 border-[#C25A2B]"
                    : "text-gray-500 dark:text-gray-400 hover:text-foreground"
                }`}
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Vânzare
              </button>
              <button
                onClick={() => setSelectedType("inchiriere")}
                className={`home-section-tab pb-1 md:pb-2 px-1 text-sm md:text-base font-medium transition-colors ${
                  selectedType === "inchiriere"
                    ? "text-[#C25A2B] border-b-2 border-[#C25A2B]"
                    : "text-gray-500 dark:text-gray-400 hover:text-foreground"
                }`}
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Închiriere
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto hide-scrollbar pb-4"
            >
              {highlightedAnunturi.map((anunt: Anunt) => {
                const href = selectedType === "vanzare" ? `/vanzare/${anunt.id}` : `/inchiriere/${anunt.id}`;
                
                return (
                <Link
                  key={anunt.id}
                  href={href}
                  className="shrink-0 w-[320px] rounded-lg overflow-hidden relative cursor-pointer"
                  style={{
                    background: isDark ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.55)",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.45)",
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
                      src={anunt.image}
                      alt={anunt.titlu}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Preț ca sticker semi-transparent în partea de jos */}
                    <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-black/60 backdrop-blur-sm">
                      <div className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-galak-regular)" }}>
                        <ConvertedListingPrice
                          amount={anunt.priceAmount}
                          fromCurrency={anunt.priceCurrency}
                          fallback={anunt.pret}
                          priceDetails={anunt.priceDetails ?? null}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 relative z-1">
                    <h3
                      className="text-xl font-bold mb-3 text-foreground line-clamp-2"
                      style={{ 
                        fontFamily: "var(--font-galak-regular)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "3.5rem"
                      }}
                    >
                      {anunt.titlu}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {anunt.tags.map((tag, tagIndex) => {
                        const Icon = getTagIcon(tag);
                        return (
                          <span
                            key={`${anunt.id}-tag-${tagIndex}`}
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
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full hover:opacity-80 items-center justify-center text-foreground transition-opacity shadow-lg z-10"
                style={{
                  background: isDark ? "rgba(35, 35, 48, 0.6)" : "rgba(255, 255, 255, 0.7)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.5)",
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
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full hover:opacity-80 items-center justify-center text-foreground transition-opacity shadow-lg z-10"
                style={{
                  background: isDark ? "rgba(35, 35, 48, 0.6)" : "rgba(255, 255, 255, 0.7)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.5)",
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
          
          {/* Link sub carduri */}
          <div className="mt-4 mb-6 px-4">
            <Link
              href={selectedType === "vanzare" ? "/vanzare" : "/inchiriere"}
              className="flex items-center justify-center text-sm md:text-base text-[#C25A2B] font-medium hover:opacity-80 transition-opacity"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Vezi toate anunțurile
              <MdOutlineKeyboardArrowRight size={18} className="ml-1" />
            </Link>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
