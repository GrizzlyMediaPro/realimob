"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { CiFilter } from "react-icons/ci";
import { MdEdit } from "react-icons/md";
import {
  MdAttachMoney,
  MdAutoAwesome,
  MdBalcony,
  MdBuild,
  MdDeck,
  MdHome,
  MdHomeWork,
  MdLocationOn,
  MdOutlineKeyboardArrowRight,
  MdSquareFoot,
  MdStairs,
  MdStar,
  MdSwapVert,
  MdViewQuilt,
} from "react-icons/md";
import type { IconType } from "react-icons";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ListingCard from "../components/ListingCard";
import ListingFiltersModal from "../components/ListingFiltersModal";
import {
  getAllAnunturi,
  getImageCount,
  parsePretToNumber,
  type Anunt,
  type SortOption,
} from "../../lib/anunturiData";
import { transformListingToAnunt as listingFromDb } from "../../lib/listingToAnunt";

const BucharestMap = dynamic(() => import("../components/BucharestMap"), {
  ssr: false,
});

const getTagIcon = (tag: string): IconType | null => {
  const lowerTag = tag.toLowerCase();

  if (lowerTag.includes("€") || lowerTag.includes("pret") || lowerTag.includes("de la")) return MdAttachMoney;
  if (lowerTag.includes("m²") || lowerTag.includes("suprafata")) return MdSquareFoot;
  if (lowerTag.includes("centru") || lowerTag.includes("sector") || lowerTag.includes("locatie")) return MdLocationOn;
  if (lowerTag.includes("etaj") || lowerTag.includes("parter")) return MdStairs;
  if (lowerTag.includes("mobilat") || lowerTag.includes("mobila")) return MdHome;
  if (lowerTag.includes("balcon")) return MdBalcony;
  if (lowerTag.includes("renovat") || lowerTag.includes("renovare")) return MdBuild;
  if (lowerTag.includes("duplex")) return MdHomeWork;
  if (lowerTag.includes("lux") || lowerTag.includes("premium")) return MdStar;
  if (lowerTag.includes("terasa") || lowerTag.includes("terasă")) return MdDeck;
  if (lowerTag.includes("compartimentare") || lowerTag.includes("decomandat")) return MdViewQuilt;
  if (lowerTag.includes("modern")) return MdAutoAwesome;

  return null;
};

const getSortLabel = (sort: SortOption) => {
  switch (sort) {
    case "relevanta":
      return "Relevanță";
    case "noi":
      return "Cele mai noi";
    case "pret_crescator":
      return "Preț crescător";
    case "pret_descrescator":
      return "Preț descrescător";
  }
};

const primaryCtaStyle = {
  background:
    "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  boxShadow:
    "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
} as const;

// Funcție helper pentru a formata prețul ca "X €/lună"
// Convertește prețul de vânzare într-un preț rezonabil de chirie
const formatPretLuna = (pret: string): string => {
  // Extragem numărul din preț (ex: "85.000 €" -> "85000")
  const pretVanzare = parsePretToNumber(pret);
  // Convertim prețul de vânzare în chirie: împărțim la ~100-150 pentru a obține o chirie rezonabilă
  // Folosim un factor variabil bazat pe preț pentru a avea chiriile mai rezonabile
  let factor = 120; // factor default
  if (pretVanzare < 50000) factor = 100; // pentru proprietăți mai mici
  if (pretVanzare > 150000) factor = 150; // pentru proprietăți premium
  
  const chirie = Math.round(pretVanzare / factor);
  // Asigurăm că chiriile sunt într-un interval rezonabil (300-2000 €/lună)
  const chirieFinala = Math.max(300, Math.min(2000, chirie));
  
  return `${chirieFinala.toLocaleString("ro-RO")} €/lună`;
};

function getDbListingImageCount(images: any): number {
  if (!Array.isArray(images)) return 0;
  return images.reduce((count: number, group: any) => {
    const urls = Array.isArray(group?.urls) ? group.urls.length : 0;
    return count + urls;
  }, 0);
}

function transformListingToAnunt(listing: any): Anunt & { realImageCount?: number } {
  return {
    ...listingFromDb(listing),
    realImageCount: getDbListingImageCount(listing.images),
  };
}

function InchirierePageContent() {
  const [visibleCount, setVisibleCount] = useState(20);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("relevanta");
  const [isMapView, setIsMapView] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<number[][] | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dbListings, setDbListings] = useState<Anunt[]>([]);
  const sortRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const categorieParam = searchParams.get("categorie");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("/api/listings");
        if (response.ok) {
          const data = await response.json();
          const inchiriereListings = data.listings.filter(
            (l: any) => l.transactionType === "Închiriere" || l.transactionType === "Inchiriere"
          );
          const transformed = inchiriereListings.map(transformListingToAnunt);
          setDbListings(transformed);
        }
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      }
    };
    fetchListings();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDarkMode =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const allAnunturi = useMemo<Anunt[]>(() => {
    const mockAnunturi = getAllAnunturi();
    const dbIds = new Set(dbListings.map((a) => a.id));
    const uniqueMock = mockAnunturi.filter((a) => !dbIds.has(a.id));
    return [...dbListings, ...uniqueMock];
  }, [dbListings]);

  const filterByCategorie = (anunturi: Anunt[], categorie: string | null) => {
    if (!categorie) return anunturi;

    switch (categorie) {
      case "garsoniere":
        return anunturi.filter((a) => (a.dormitoare ?? 0) === 1);
      case "case":
        return anunturi.filter(
          (a) => (a.suprafataUtil ?? 0) >= 100 || (a.dormitoare ?? 0) >= 4,
        );
      case "apartamente":
        return anunturi.filter(
          (a) => (a.dormitoare ?? 0) >= 2 && (a.dormitoare ?? 0) <= 3,
        );
      case "spatii-comerciale":
        // momentan nu avem un flag dedicat pentru spații comerciale în datasetul demo,
        // așa că lăsăm lista completă pentru această categorie
        return anunturi;
      default:
        return anunturi;
    }
  };

  // Funcție pentru a verifica dacă un punct este în interiorul unui poligon
  const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const sortedAnunturi = useMemo(() => {
    let copy = filterByCategorie(allAnunturi, categorieParam);
    
    // Filtrează pe baza poligonului desenat
    if (drawnPolygon && drawnPolygon.length >= 3) {
      copy = copy.filter((a) => {
        if (typeof a.lat === "number" && typeof a.lng === "number") {
          return pointInPolygon([a.lng, a.lat], drawnPolygon);
        }
        return false;
      });
    }
    
    if (sortOption === "pret_crescator") {
      copy.sort((a, b) => parsePretToNumber(a.pret) - parsePretToNumber(b.pret));
    } else if (sortOption === "pret_descrescator") {
      copy.sort((a, b) => parsePretToNumber(b.pret) - parsePretToNumber(a.pret));
    } else if (sortOption === "noi") {
      copy.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return copy;
  }, [allAnunturi, sortOption, drawnPolygon, categorieParam]);

  const visibleAnunturi = useMemo(
    () => sortedAnunturi.slice(0, visibleCount),
    [sortedAnunturi, visibleCount]
  );

  const hasMore = visibleCount < sortedAnunturi.length;

  const mapMarkers = useMemo(
    () =>
      sortedAnunturi
        .filter((a) => typeof a.lat === "number" && typeof a.lng === "number")
        .map((a) => ({
          id: a.id,
          titlu: a.titlu,
          lat: a.lat as number,
          lng: a.lng as number,
          descriere: a.tags.join(" • "),
          pret: formatPretLuna(a.pret),
          image: a.image,
          routePath: `/inchiriere/${a.id}`,
        })),
    [sortedAnunturi]
  );

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (sortRef.current && !sortRef.current.contains(target)) {
        setIsSortOpen(false);
      }
    };

    if (isSortOpen) document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isSortOpen]);

  return (
    <div className={`${isMapView ? 'h-screen overflow-hidden' : 'min-h-screen'} text-foreground`}>
      <Navbar fullWidthContent={isMapView} />

      <div className={isMapView ? 'flex flex-col pt-20 md:pt-24' : ''} style={isMapView ? { height: '100vh' } : undefined}>
        {/* Breadcrumbs + filters bar - fixe deasupra hărții în map view */}
        {isMapView && (
          <div className="shrink-0 px-3 sm:px-4 md:px-6 pt-2 sm:pt-3 pb-1 sm:pb-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
            <div className="mb-1 sm:mb-2">
              <nav className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2" aria-label="Breadcrumb">
                <a href="/" className="hover:underline">Acasă</a>
                <span className="mx-1.5 sm:mx-2">/</span>
                <span className="text-foreground font-medium">Închiriere</span>
              </nav>
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <div className="text-xs sm:text-base text-gray-600 dark:text-gray-400">{sortedAnunturi.length} rezultate</div>
                <div className="flex items-stretch flex-wrap gap-1.5 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex flex-1 sm:flex-none items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 h-10 sm:h-auto rounded-lg text-xs sm:text-base text-foreground hover:opacity-90 transition-opacity"
                    style={{
                      background: isDarkMode ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.55)",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.45)",
                      boxShadow: isDarkMode
                        ? "0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                        : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                      backdropFilter: "blur(60px) saturate(1.6)",
                      WebkitBackdropFilter: "blur(60px) saturate(1.6)",
                    }}
                    aria-haspopup="dialog"
                    aria-expanded={isFilterOpen}
                  >
                    <CiFilter size={16} className="sm:w-5 sm:h-5" />
                    Filtre
                  </button>

                  <div className="relative" ref={sortRef}>
                    <button
                      onClick={() => setIsSortOpen((v) => !v)}
                      className="flex flex-1 sm:flex-none items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 h-10 sm:h-auto rounded-lg text-xs sm:text-base text-foreground hover:opacity-90 transition-opacity"
                      style={{
                        background: isDarkMode ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.55)",
                        border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.45)",
                        boxShadow: isDarkMode
                          ? "0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                          : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                        backdropFilter: "blur(60px) saturate(1.6)",
                        WebkitBackdropFilter: "blur(60px) saturate(1.6)",
                      }}
                      aria-haspopup="menu"
                      aria-expanded={isSortOpen}
                    >
                      <MdSwapVert size={16} className="sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Sortează:</span> {getSortLabel(sortOption)}
                      <span className="ml-0.5 sm:ml-1 text-gray-500 dark:text-gray-400">▾</span>
                    </button>

                    {isSortOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 mt-2 w-56 sm:w-64 rounded-xl overflow-hidden z-50"
                        style={{
                          background: isDarkMode ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.6)",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.5)",
                          boxShadow: isDarkMode
                            ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                            : "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
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
                            height: "40%",
                            background: isDarkMode
                              ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
                              : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
                            borderRadius: "inherit",
                            pointerEvents: "none",
                            zIndex: 0,
                          }}
                        />
                        {(
                          [
                            ["relevanta", "Relevanță"],
                            ["noi", "Cele mai noi"],
                            ["pret_crescator", "Preț crescător"],
                            ["pret_descrescator", "Preț descrescător"],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            role="menuitem"
                            onClick={() => {
                              setSortOption(value);
                              setIsSortOpen(false);
                              setVisibleCount(20);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                              sortOption === value ? "text-[#C25A2B] font-semibold" : "text-foreground"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
 
                  <button
                    onClick={() => {
                      setSelectedMapId(null);
                      setIsMapView((v) => !v);
                    }}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1 sm:gap-1.5 px-4 sm:px-8 py-1.5 sm:py-3 h-10 sm:h-auto rounded-3xl text-white text-xs sm:text-base font-medium hover:opacity-90 transition-all duration-300 backdrop-blur-xl whitespace-nowrap"
                    style={primaryCtaStyle}
                    aria-label={isMapView ? "Vezi lista" : "Vezi pe hartă"}
                  >
                    <MdLocationOn size={14} className="shrink-0 sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden xs:inline">
                      {isMapView ? "Vezi lista" : "Vezi pe hartă"}
                    </span>
                    <span className="xs:hidden text-xs">
                      {isMapView ? "Listă" : "Hartă"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Containerul hartă + listings */}
        <div className={isMapView ? 'flex flex-col md:flex-row flex-1 min-h-0' : ''}>
          {/* Panoul cu harta - vizibil doar în map view, sus pe mobile / stânga pe desktop */}
          {isMapView && (
            <div className="w-full md:w-1/2 h-[45vh] md:h-full relative pb-2 md:pb-4 px-2 md:pl-2 md:pr-0 shrink-0">
              <div className="h-full relative rounded-2xl overflow-hidden">
                <BucharestMap 
                  markers={mapMarkers} 
                  initialSelectedId={selectedMapId}
                  isDrawingMode={isDrawingMode}
                  onPolygonComplete={(polygon) => {
                    setDrawnPolygon(polygon);
                    setIsDrawingMode(false);
                  }}
                  drawnPolygon={drawnPolygon}
                  onClearPolygon={() => setDrawnPolygon(null)}
                  fillContainer
                />
                {/* Buton Pen pentru desenare */}
                <button
                  onClick={() => {
                    if (isDrawingMode && drawnPolygon) {
                      setDrawnPolygon(null);
                      setIsDrawingMode(false);
                    } else {
                      setIsDrawingMode(!isDrawingMode);
                    }
                  }}
                  className={`absolute top-4 right-16 z-10 flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md border shadow-lg hover:opacity-90 transition-opacity ${
                    isDrawingMode || drawnPolygon
                      ? "bg-[#C25A2B]/90 border-[#C25A2B] text-white"
                      : "bg-white/90 dark:bg-[#1B1B21]/90 border-white/20 dark:border-[#2b2b33]/50 text-foreground"
                  }`}
                  aria-label={drawnPolygon ? "Șterge zonă desenată" : isDrawingMode ? "Oprește desenarea" : "Desenează zonă"}
                  title={drawnPolygon ? "Șterge zonă desenată" : isDrawingMode ? "Oprește desenarea" : "Desenează zonă"}
                >
                  <MdEdit size={18} />
                </button>
                {/* Indicator mod desenare */}
                {isDrawingMode && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-lg backdrop-blur-md bg-[#C25A2B]/90 text-white shadow-lg pointer-events-none">
                    <p className="text-sm font-medium" style={{ fontFamily: "var(--font-galak-regular)" }}>
                      Click pe hartă pentru a desena zona. Click pe primul punct sau Enter pentru a închide.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panoul drept cu conținut (scrollabil în map view) — jos pe mobile / dreapta pe desktop */}
          <div className={isMapView ? 'w-full md:w-1/2 flex-1 min-h-0 overflow-y-auto' : ''}>
            <main className={isMapView ? 'px-4 md:px-6' : 'pt-20 md:pt-24 px-4 md:px-0'}>
              <div className={isMapView ? '' : 'w-full max-w-[1250px] mx-auto'}>
                <div className={isMapView ? 'pt-2' : 'rounded-none md:rounded-2xl pt-4 md:py-6 md:px-0'} style={{ fontFamily: "var(--font-galak-regular)" }}>
                  {/* Breadcrumbs + results + filters/sort — doar în modul normal (fără hartă) */}
                  {!isMapView && (
                  <div className="mb-4 md:mb-6">
                  <nav className="text-sm text-gray-600 dark:text-gray-400 mb-3" aria-label="Breadcrumb">
                    <a href="/" className="hover:underline">Acasă</a>
                    <span className="mx-2">/</span>
                    <span className="text-foreground font-medium">Închiriere</span>
                  </nav>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{sortedAnunturi.length} rezultate</div>

                    <div className="flex items-stretch gap-2 sm:gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex flex-1 sm:flex-none items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 h-10 sm:h-auto rounded-lg text-sm sm:text-base text-foreground hover:opacity-90 transition-opacity"
                        style={{
                          background: isDarkMode ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.55)",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.45)",
                          boxShadow: isDarkMode
                            ? "0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                            : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                          backdropFilter: "blur(60px) saturate(1.6)",
                          WebkitBackdropFilter: "blur(60px) saturate(1.6)",
                        }}
                        aria-haspopup="dialog"
                        aria-expanded={isFilterOpen}
                      >
                        <CiFilter size={20} />
                        Filtre
                      </button>

                      <div className="relative" ref={sortRef}>
                        <button
                          onClick={() => setIsSortOpen((v) => !v)}
                          className="flex flex-1 sm:flex-none items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 h-10 sm:h-auto rounded-lg text-sm sm:text-base text-foreground hover:opacity-90 transition-opacity"
                          style={{
                            background: isDarkMode ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.55)",
                            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.45)",
                            boxShadow: isDarkMode
                              ? "0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                              : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                            backdropFilter: "blur(60px) saturate(1.6)",
                            WebkitBackdropFilter: "blur(60px) saturate(1.6)",
                          }}
                          aria-haspopup="menu"
                          aria-expanded={isSortOpen}
                        >
                          <MdSwapVert size={20} />
                          <span className="hidden sm:inline">Sortează:</span> {getSortLabel(sortOption)}
                          <span className="ml-1 text-gray-500 dark:text-gray-400">▾</span>
                        </button>

                        {isSortOpen && (
                          <div
                            role="menu"
                            className="absolute right-0 mt-2 w-64 rounded-xl overflow-hidden z-50"
                            style={{
                              background: isDarkMode ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.6)",
                              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.5)",
                              boxShadow: isDarkMode
                                ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                                : "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
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
                                height: "40%",
                                background: isDarkMode
                                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
                                  : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
                                borderRadius: "inherit",
                                pointerEvents: "none",
                                zIndex: 0,
                              }}
                            />
                            {(
                              [
                                ["relevanta", "Relevanță"],
                                ["noi", "Cele mai noi"],
                                ["pret_crescator", "Preț crescător"],
                                ["pret_descrescator", "Preț descrescător"],
                              ] as const
                            ).map(([value, label]) => (
                              <button
                                key={value}
                                role="menuitem"
                                onClick={() => {
                                  setSortOption(value);
                                  setIsSortOpen(false);
                                  setVisibleCount(20);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                  sortOption === value ? "text-[#C25A2B] font-semibold" : "text-foreground"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
 
                      <button
                        onClick={() => {
                          setSelectedMapId(null);
                          setIsMapView((v) => !v);
                        }}
                        className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-8 py-3 h-10 sm:h-auto rounded-3xl text-white font-medium hover:opacity-90 transition-all duration-300 backdrop-blur-xl whitespace-nowrap"
                        style={primaryCtaStyle}
                        aria-label={isMapView ? "Vezi lista" : "Vezi pe hartă"}
                      >
                        <MdLocationOn size={18} className="shrink-0" />
                        <span className="hidden xs:inline">
                          {isMapView ? "Vezi lista" : "Vezi pe hartă"}
                        </span>
                        <span className="xs:hidden text-sm">
                          {isMapView ? "Listă" : "Hartă"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                  )}

                <div className={`flex flex-col ${isMapView ? 'gap-2' : 'gap-4'}`}>
                  {visibleAnunturi.map((anunt) => (
                    <ListingCard
                      key={anunt.id}
                      id={anunt.id}
                      titlu={anunt.titlu}
                      image={anunt.image}
                      pret={formatPretLuna(anunt.pret)}
                      tags={anunt.tags}
                      locationText={anunt.tags.find((t) => t.includes("Sector")) ?? "Zona centrală"}
                      imageCount={(anunt as any).realImageCount ?? getImageCount(anunt.id)}
                      getTagIcon={getTagIcon}
                      href={`/inchiriere/${anunt.id}`}
                      compact={isMapView && isMobile}
                    />
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  {hasMore ? (
                    <button
                      onClick={() => setVisibleCount((c) => Math.min(c + 20, sortedAnunturi.length))}
                      className="px-5 py-2 text-sm sm:px-8 sm:py-3 sm:text-base rounded-3xl text-white font-medium hover:opacity-90 transition-all duration-300 backdrop-blur-xl flex items-center"
                      style={primaryCtaStyle}
                    >
                      Vezi mai multe
                      <MdOutlineKeyboardArrowRight size={18} className="ml-2 inline-block" />
                    </button>
                  ) : (
                    <div className="text-gray-600 dark:text-gray-400">Ai ajuns la final.</div>
                  )}
                </div>
              </div>
            </div>
          </main>
          {isMapView && <Footer />}
        </div>
        </div>
      </div>

      {!isMapView && <Footer />}

      {/* Modal Filtre */}
      <ListingFiltersModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={() => setVisibleCount(20)}
      />
    </div>
  );
}

export default function InchirierePage() {
  return (
    <Suspense fallback={null}>
      <InchirierePageContent />
    </Suspense>
  );
}
