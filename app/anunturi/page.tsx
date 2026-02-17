"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { CiFilter, CiImageOn, CiHeart } from "react-icons/ci";
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

const BucharestMap = dynamic(() => import("../components/BucharestMap"), {
  ssr: false,
});

type Anunt = {
  id: string;
  titlu: string;
  image: string;
  pret: string;
  tags: string[];
  createdAt: string;
  lat?: number;
  lng?: number;
};

type SortOption = "relevanta" | "noi" | "pret_crescator" | "pret_descrescator";

const parsePretToNumber = (pret: string) => {
  const digitsOnly = pret.replace(/[^\d]/g, "");
  const value = Number(digitsOnly);
  return Number.isFinite(value) ? value : 0;
};

const getImageCount = (id: string) => {
  // deterministic small pseudo-random count based on id
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 1000;
  }
  return (h % 8) + 1; // 1..8 images
};

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

  const allAnunturi = useMemo<Anunt[]>(() => {
    const base = [
      {
        titlu: "Apartament luminos, 2 camere — renovat recent, lângă Parcul Floreasca",
        image: "/ap2.jpg",
        pret: "85.000 €",
        tags: ["65 m²", "Sector 1", "Etaj 3", "Renovat"],
        lat: 44.4685,
        lng: 26.1025,
      },
      {
        titlu: "Apartament modern 3 camere cu balcon mare și vedere către oraș",
        image: "/ap3.jpg",
        pret: "120.000 €",
        tags: ["85 m²", "Sector 2", "Etaj 5", "Balcon"],
        lat: 44.448,
        lng: 26.152,
      },
      {
        titlu: "Penthouse spațios 4 camere cu terasă privată și finisaje premium",
        image: "/ap4.jpg",
        pret: "180.000 €",
        tags: ["120 m²", "Sector 3", "Etaj 2", "Duplex"],
        lat: 44.414,
        lng: 26.13,
      },
      {
        titlu: "Studio cochet în zona centrală — perfect pentru investiție sau închirieri",
        image: "/studio.jpg",
        pret: "45.000 €",
        tags: ["35 m²", "Centru", "Parter", "Mobilat"],
        lat: 44.435,
        lng: 26.097,
      },
      {
        titlu: "Apartament 2 camere, bloc modern — ideal pentru tineri profesioniști",
        image: "/ap2.jpg",
        pret: "75.000 €",
        tags: ["60 m²", "Sector 4", "Etaj 1", "Modern"],
        lat: 44.39,
        lng: 26.118,
      },
      {
        titlu: "Apartament 3 camere decomandat, balcon mare, aproape de magazine și transport",
        image: "/ap3.jpg",
        pret: "110.000 €",
        tags: ["80 m²", "Sector 5", "Etaj 4", "Decomandat"],
        lat: 44.385,
        lng: 26.045,
      },
    ];

    const total = 80;
    return Array.from({ length: total }, (_, i) => {
      const b = base[i % base.length];
      const basePret = parsePretToNumber(b.pret);
      const delta = (i % 10) * 2500; // mică variație ca să aibă sens sortarea
      const pret = `${(basePret + delta).toLocaleString("ro-RO")} €`;

      const createdAt = new Date(Date.now() - i * 36 * 60 * 60 * 1000).toISOString(); // ~1.5 zile între anunțuri

      return {
        id: `anunt-${i + 1}`,
        titlu: `${b.titlu}`,
        image: b.image,
        pret,
        tags: b.tags,
        createdAt,
        lat: b.lat,
        lng: b.lng,
      };
    });
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
                <span className="text-foreground font-medium">Anunțuri</span>
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

            {/* Hartă București sau lista de anunțuri */}
            {isMapView ? (
              <div className="mt-4">
                <BucharestMap
                  markers={mapMarkers}
                  initialSelectedId={selectedMapId}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {visibleAnunturi.map((anunt) => (
                  <div
                    key={anunt.id}
                    className="bg-white dark:bg-[#1B1B21] border border-[#d5dae0] dark:border-[#2b2b33] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer sm:h-64 md:h-72"
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
                            <button className="hidden sm:flex w-9 h-9 rounded-full bg-[#3B1F3A] items-center justify-center text-white hover:opacity-90 transition-opacity ml-3 shrink-0">
                              <CiHeart size={18} />
                            </button>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <MdLocationOn size={16} />
                            <span>Floreasca, Sector 1</span>
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
                            {anunt.pret}
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="w-9 h-9 rounded-full bg-[#1F2D44] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                              <MdPhone size={18} />
                            </button>
                            <button className="w-9 h-9 rounded-full bg-[#3B1F3A] flex items-center justify-center text-white hover:opacity-90 transition-opacity sm:hidden">
                              <CiHeart size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

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

