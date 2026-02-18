"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CiFilter, CiImageOn, CiHeart } from "react-icons/ci";
import { MdEdit } from "react-icons/md";
import {
  MdAttachMoney,
  MdAutoAwesome,
  MdBalcony,
  MdBuild,
  MdClose,
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
  MdPhone,
} from "react-icons/md";
import type { IconType } from "react-icons";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getAllAnunturi,
  getImageCount,
  parsePretToNumber,
  type Anunt,
  type SortOption,
} from "../../lib/anunturiData";

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

export default function InchirierePage() {
  const [visibleCount, setVisibleCount] = useState(20);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("relevanta");
  const [isMapView, setIsMapView] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<number[][] | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const allAnunturi = useMemo<Anunt[]>(() => {
    return getAllAnunturi();
  }, []);

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
    let copy = [...allAnunturi];
    
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
  }, [allAnunturi, sortOption, drawnPolygon]);

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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-20 md:pt-24 px-4 md:px-0">
        <div className="w-full max-w-[1250px] mx-auto">
          <div className="rounded-none md:rounded-2xl pt-4 md:py-6 md:px-0" style={{ fontFamily: "var(--font-galak-regular)" }}>
            {/* Breadcrumbs + results + filters/sort */}
            <div className="mb-4 md:mb-6">
              <nav className="text-sm text-gray-600 dark:text-gray-400 mb-3" aria-label="Breadcrumb">
                <a href="/" className="hover:underline">Acasă</a>
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">Închiriere</span>
              </nav>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-gray-600 dark:text-gray-400">{sortedAnunturi.length} rezultate</div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] text-foreground hover:opacity-90 transition-opacity"
                    aria-haspopup="dialog"
                    aria-expanded={isFilterOpen}
                  >
                    <CiFilter size={20} />
                    Filtre
                  </button>

                  <div className="relative" ref={sortRef}>
                    <button
                      onClick={() => setIsSortOpen((v) => !v)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] text-foreground hover:opacity-90 transition-opacity"
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
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1B1B21] border border-[#d5dae0] dark:border-[#2b2b33] rounded-xl shadow-xl overflow-hidden z-50"
                      >
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
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                    style={{ backgroundColor: "#C25A2B" }}
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

            {/* Hartă București + lista de anunțuri (lista rămâne vizibilă și în map view) */}
            {isMapView && (
              <div className="mt-4 relative">
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
            )}

            <div className={`flex flex-col gap-4 ${isMapView ? "mt-4" : ""}`}>
              {visibleAnunturi.map((anunt) => (
                <Link
                  key={anunt.id}
                  href={`/inchiriere/${anunt.id}`}
                  className="block bg-white dark:bg-[#1B1B21] border border-[#d5dae0] dark:border-[#2b2b33] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer sm:h-64 md:h-72"
                >
                    <div className="flex flex-col sm:flex-row items-stretch h-full">
                      <div className="w-full sm:w-88 md:w-96 h-40 sm:h-full relative shrink-0 overflow-hidden rounded-l-lg">
                        <Image
                          src={anunt.image}
                          alt={anunt.titlu}
                          fill
                          className="object-cover object-center"
                        />
                        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-md bg-black/70 text-white text-sm flex items-center gap-2">
                          <CiImageOn size={18} />
                          <span className="font-medium">{getImageCount(anunt.id)}</span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between rounded-r-lg h-full">
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
                              {anunt.titlu}
                            </h3>
                            <button
                              type="button"
                              className="hidden sm:flex w-9 h-9 rounded-full bg-[#3B1F3A] items-center justify-center text-white hover:opacity-90 transition-opacity ml-3 shrink-0"
                              onClick={(e) => e.preventDefault()}
                            >
                              <CiHeart size={18} />
                            </button>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <MdLocationOn size={16} />
                            <span>București, {anunt.tags.find((t) => t.includes("Sector")) ?? "Zona centrală"}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-sm">
                            {anunt.tags.map((tag, idx) => {
                              const Icon = getTagIcon(tag);
                              return (
                                <span
                                  key={`${anunt.id}-tag-${idx}`}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
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
                            {formatPretLuna(anunt.pret)}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="w-9 h-9 rounded-full bg-[#1F2D44] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                              onClick={(e) => e.preventDefault()}
                            >
                              <MdPhone size={18} />
                            </button>
                            <button
                              type="button"
                              className="w-9 h-9 rounded-full bg-[#3B1F3A] flex items-center justify-center text-white hover:opacity-90 transition-opacity sm:hidden"
                              onClick={(e) => e.preventDefault()}
                            >
                              <CiHeart size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              {hasMore ? (
                <button
                  onClick={() => setVisibleCount((c) => Math.min(c + 20, sortedAnunturi.length))}
                  className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#C25A2B" }}
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

      {/* Modal Filtre (placeholder, pregătit pentru integrare reală) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="relative w-full max-w-[720px] bg-white dark:bg-[#1B1B21] rounded-2xl border border-[#d5dae0] dark:border-[#2b2b33] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#d5dae0] dark:border-[#2b2b33]">
              <div className="text-xl font-bold" style={{ fontFamily: "var(--font-galak-regular)" }}>
                Filtre
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Închide"
              >
                <MdClose size={22} />
              </button>
            </div>

            <div className="p-5" style={{ fontFamily: "var(--font-galak-regular)" }}>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Butonul de filtre e gata vizual; aici poți lega ulterior aceleași câmpuri ca în HeroFilter.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#d5dae0] dark:border-[#2b2b33] bg-background hover:opacity-90 transition-opacity"
                >
                  Închide
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#3B1F3A" }}
                >
                  Aplică
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
