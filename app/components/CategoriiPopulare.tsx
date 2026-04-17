"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { parsePretToNumber } from "../../lib/anunturiData";

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

// Funcție helper pentru a formata prețul ca chirie lunară (similar cu AnunturiNoi)
const formatPretLuna = (pret: string): string => {
  const pretVanzare = parsePretToNumber(pret);
  let factor = 120;
  if (pretVanzare < 50000) factor = 100;
  if (pretVanzare > 150000) factor = 150;

  const chirie = Math.round(pretVanzare / factor);
  const chirieFinala = Math.max(300, Math.min(2000, chirie));

  return `${chirieFinala.toLocaleString("ro-RO")} €/lună`;
};

const categorii = [
  {
    titlu: "Studio",
    image: "/studio.jpg",
    tags: ["de la 25.000 €", "20-30 m²", "Centru", "Mobilat"],
    filters: {
      categorie: "garsoniere",
      roomsMin: 1,
      roomsMax: 1,
      surfaceMin: 20,
      surfaceMax: 40,
      tag: "centru,mobilat",
    },
  },
  {
    titlu: "2 Camere",
    image: "/ap2.jpg",
    tags: ["de la 45.000 €", "40-60 m²", "Balcon", "Parter"],
    filters: {
      categorie: "apartamente",
      roomsMin: 2,
      roomsMax: 2,
      surfaceMin: 40,
      surfaceMax: 70,
      tag: "balcon,parter",
    },
  },
  {
    titlu: "3 Camere",
    image: "/ap3.jpg",
    tags: ["de la 75.000 €", "70-90 m²", "Etaj 2-5", "Renovat"],
    filters: {
      categorie: "apartamente",
      roomsMin: 3,
      roomsMax: 3,
      surfaceMin: 70,
      surfaceMax: 95,
      tag: "renovat,etaj",
    },
  },
  {
    titlu: "4+ Camere",
    image: "/ap4.jpg",
    tags: ["de la 120.000 €", "100+ m²", "Duplex", "Lux"],
    filters: {
      roomsMin: 4,
      surfaceMin: 100,
      tag: "duplex,lux",
    },
  },
  {
    titlu: "Penthouse",
    image: "/ap4.jpg",
    tags: ["de la 200.000 €", "150+ m²", "Ultimul etaj", "Terasa"],
    filters: {
      roomsMin: 4,
      surfaceMin: 140,
      tag: "terasa,ultimul etaj,penthouse",
    },
  },
  {
    titlu: "Decomandat",
    image: "/ap3.jpg",
    tags: ["de la 50.000 €", "50-80 m²", "Compartimentare", "Modern"],
    filters: {
      categorie: "apartamente",
      roomsMin: 2,
      surfaceMin: 50,
      surfaceMax: 90,
      tag: "decomandat,modern",
    },
  },
];

export default function CategoriiPopulare() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [selectedType, setSelectedType] = useState<"vanzare" | "inchiriere">("vanzare");
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

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
      // Check scroll position after a short delay
      setTimeout(checkScroll, 100);
    }
  };

  const goToCategorie = (categorie: (typeof categorii)[number]) => {
    const params = new URLSearchParams();
    const { filters } = categorie;

    if (filters.categorie) params.set("categorie", filters.categorie);
    if (filters.roomsMin) params.set("roomsMin", String(filters.roomsMin));
    if (filters.roomsMax) params.set("roomsMax", String(filters.roomsMax));
    if (filters.surfaceMin) params.set("surfaceMin", String(filters.surfaceMin));
    if (filters.surfaceMax) params.set("surfaceMax", String(filters.surfaceMax));
    if (filters.tag) params.set("tag", filters.tag);

    const basePath =
      selectedType === "vanzare" ? "/vanzare" : "/inchiriere";

    router.push(`${basePath}?${params.toString()}`);
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
            {/* Heading + tab-uri Vanzare / Inchiriere pe aceeași linie (stânga/dreapta) */}
            <div className="flex items-center justify-between gap-2 md:gap-3 flex-wrap mb-3 md:mb-8">
              <h2
                className="home-section-title text-2xl md:text-5xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Categorii populare
              </h2>
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
              {categorii.map((categorie, index) => {
                // Adaptăm primul tag de preț în funcție de tipul selectat
                const displayTags = categorie.tags.map((tag, tagIndex) => {
                  if (tagIndex === 0) {
                    // Tag de forma "de la 25.000 €"
                    const basePriceNumber = parsePretToNumber(tag);
                    if (selectedType === "inchiriere") {
                      const chirie = formatPretLuna(`${basePriceNumber.toLocaleString("ro-RO")} €`);
                      return `de la ${chirie}`;
                    }
                    // pentru vânzare păstrăm tag-ul original
                    return tag;
                  }
                  return tag;
                });

                return (
                  <div
                    key={index}
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
                    onClick={() => {
                      goToCategorie(categorie);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        goToCategorie(categorie);
                      }
                    }}
                    aria-label={`Vezi ${categorie.titlu} pe ${selectedType}`}
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
                    {/* Imagine */}
                    <div className="w-full h-[200px] relative">
                      <Image
                        src={categorie.image}
                        alt={categorie.titlu}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="p-4 relative z-1">
                      <h3
                        className="text-xl font-bold mb-3 text-foreground"
                        style={{ fontFamily: "var(--font-galak-regular)" }}
                      >
                        {categorie.titlu}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2">
                        {displayTags.map((tag, tagIndex) => {
                          const Icon = getTagIcon(tag);
                          return (
                            <span
                              key={tagIndex}
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
                  </div>
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
                  onClick={() => scroll("right")}
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
          </div>
        </div>
      </div>
    </section>
  );
}
