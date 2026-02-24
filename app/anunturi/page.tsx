"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CiFilter } from "react-icons/ci";
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
import ListingCard from "../components/ListingCard";
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

export default function AnunturiPage() {
  const [visibleCount, setVisibleCount] = useState(20);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("relevanta");
  const [isMapView, setIsMapView] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const isDarkMode =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const allAnunturi = useMemo<Anunt[]>(() => {
    return getAllAnunturi();
  }, []);

  const sortedAnunturi = useMemo(() => {
    const copy = [...allAnunturi];
    if (sortOption === "pret_crescator") {
      copy.sort((a, b) => parsePretToNumber(a.pret) - parsePretToNumber(b.pret));
    } else if (sortOption === "pret_descrescator") {
      copy.sort((a, b) => parsePretToNumber(b.pret) - parsePretToNumber(a.pret));
    } else if (sortOption === "noi") {
      copy.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return copy;
  }, [allAnunturi, sortOption]);

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
          pret: a.pret,
          image: a.image,
          routePath: `/anunturi/${a.id}`,
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

    if (typeof document !== "undefined" && isSortOpen) {
      document.addEventListener("mousedown", onMouseDown);
    }
    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("mousedown", onMouseDown);
      }
    };
  }, [isSortOpen]);

  return (
    <div className="min-h-screen text-foreground">
      <Navbar />

      <main className="pt-20 md:pt-24 px-4 md:px-0">
        <div className="w-full max-w-[1250px] mx-auto">
          <div className="rounded-none md:rounded-2xl pt-4 md:py-6 md:px-0" style={{ fontFamily: "var(--font-galak-regular)" }}>
            {/* Breadcrumbs + results + filters/sort */}
            <div className="mb-4 md:mb-6">
              <nav className="text-sm text-gray-600 dark:text-gray-400 mb-3" aria-label="Breadcrumb">
                <a href="/" className="hover:underline">Acasă</a>
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">Anunțuri</span>
              </nav>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-gray-600 dark:text-gray-400">{sortedAnunturi.length} rezultate</div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-foreground hover:opacity-90 transition-opacity"
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
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-foreground hover:opacity-90 transition-opacity"
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
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#C25A2B" }}
                    aria-label="Vezi pe hartă"
                  >
                    <MdLocationOn size={20} />
                    {isMapView ? "Vezi lista" : "Vezi pe hartă"}
                  </button>
                </div>
              </div>
            </div>

            {/* Hartă București + lista de anunțuri (lista rămâne vizibilă și în map view) */}
            {isMapView && (
              <div className="mt-4">
                <BucharestMap markers={mapMarkers} initialSelectedId={selectedMapId} />
              </div>
            )}

            <div className={`flex flex-col gap-4 ${isMapView ? "mt-4" : ""}`}>
              {visibleAnunturi.map((anunt) => (
                <ListingCard
                  key={anunt.id}
                  id={anunt.id}
                  titlu={anunt.titlu}
                  image={anunt.image}
                  pret={anunt.pret}
                  tags={anunt.tags}
                  locationText={anunt.tags.find((t) => t.includes("Sector")) ?? "Zona centrală"}
                  imageCount={getImageCount(anunt.id)}
                  getTagIcon={getTagIcon}
                  href={`/anunturi/${anunt.id}`}
                />
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
        <div className="fixed inset-0 z-300 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          />
          <div 
            className="relative w-full max-w-[720px] rounded-2xl overflow-hidden"
            style={{
              background: isDarkMode ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.6)",
              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: isDarkMode
                ? "0 16px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                : "0 16px 64px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(100px) saturate(1.6)",
              WebkitBackdropFilter: "blur(100px) saturate(1.6)",
            }}
          >
            {/* Reflexie mată */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "30%",
                background: isDarkMode
                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
                  : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
                borderRadius: "inherit",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
            <div 
              className="flex items-center justify-between px-5 py-4 relative z-1"
              style={{
                borderBottom: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
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

            <div className="p-5 relative z-1" style={{ fontFamily: "var(--font-galak-regular)" }}>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Butonul de filtre e gata vizual; aici poți lega ulterior aceleași câmpuri ca în HeroFilter.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  style={{
                    background: isDarkMode ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.55)",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.45)",
                    boxShadow: isDarkMode
                      ? "0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                      : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                    backdropFilter: "blur(60px) saturate(1.6)",
                    WebkitBackdropFilter: "blur(60px) saturate(1.6)",
                  }}
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

