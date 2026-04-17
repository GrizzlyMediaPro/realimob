"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { CiFilter } from "react-icons/ci";
import { MdClose, MdEdit } from "react-icons/md";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllAnunturi, type Anunt } from "../../lib/anunturiData";
import { transformListingToAnunt } from "../../lib/listingToAnunt";

const BucharestMap = dynamic(() => import("../components/BucharestMap"), {
  ssr: false,
});

function HartaContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<number[][] | null>(null);
  const [zona, setZona] = useState("");
  const [tipProprietate, setTipProprietate] = useState("Vânzare");

  // Stare aplicată pe hartă pentru puncte de interes
  const [poiMode, setPoiMode] = useState<"all" | "custom">("all");
  const [showTransportMetrou, setShowTransportMetrou] = useState(true);
  const [showTransportTramvai, setShowTransportTramvai] = useState(true);
  const [showTransportAutobuz, setShowTransportAutobuz] = useState(true);
  const [showScoli, setShowScoli] = useState(true);
  const [showRestaurante, setShowRestaurante] = useState(true);
  const [showMagazine, setShowMagazine] = useState(true);

  // Stare de editare în panoul "Puncte de interes"
  const [pendingPoiMode, setPendingPoiMode] = useState<"all" | "custom">("all");
  const [pendingShowTransportMetrou, setPendingShowTransportMetrou] = useState(true);
  const [pendingShowTransportTramvai, setPendingShowTransportTramvai] = useState(true);
  const [pendingShowTransportAutobuz, setPendingShowTransportAutobuz] = useState(true);
  const [pendingShowScoli, setPendingShowScoli] = useState(true);
  const [pendingShowRestaurante, setPendingShowRestaurante] = useState(true);
  const [pendingShowMagazine, setPendingShowMagazine] = useState(true);
  const [isPoiCustomPanelOpen, setIsPoiCustomPanelOpen] = useState(false);
  const poiPanelRef = useRef<HTMLDivElement | null>(null);

  const [dbListingsForMap, setDbListingsForMap] = useState<Anunt[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/listings?limit=100");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const list = Array.isArray(data.listings) ? data.listings : [];
        const transformed = list.map((l: any) => transformListingToAnunt(l));
        if (!cancelled) setDbListingsForMap(transformed);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isPoiCustomPanelOpen) return;

    const handlePointerDownOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (poiPanelRef.current && !poiPanelRef.current.contains(target)) {
        setIsPoiCustomPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDownOutside);
    return () => document.removeEventListener("mousedown", handlePointerDownOutside);
  }, [isPoiCustomPanelOpen]);

  const [pretMinim, setPretMinim] = useState("");
  const [pretMaxim, setPretMaxim] = useState("");
  const [nrDormitoare, setNrDormitoare] = useState("");
  const [tipImobil, setTipImobil] = useState("");

  const allAnunturi = useMemo(() => getAllAnunturi(), []);

  const toMapMarker = (a: Anunt) => ({
    id: a.id,
    titlu: a.titlu,
    lat: a.lat as number,
    lng: a.lng as number,
    descriere: a.tags.join(" • "),
    pret: a.pret,
    image: a.image,
    routePath: `/anunturi/${a.id}`,
  });

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

  const mapMarkers = useMemo(() => {
    const demoMarkers = allAnunturi
      .filter((a) => typeof a.lat === "number" && typeof a.lng === "number")
      .map(toMapMarker);

    const dbMarkers = dbListingsForMap
      .filter((a) => typeof a.lat === "number" && typeof a.lng === "number")
      .map(toMapMarker);

    const byId = new globalThis.Map<string, ReturnType<typeof toMapMarker>>();
    for (const m of demoMarkers) byId.set(m.id, m);
    for (const m of dbMarkers) byId.set(m.id, m);

    let markers = [...byId.values()];

    if (drawnPolygon && drawnPolygon.length >= 3) {
      markers = markers.filter((marker) =>
        pointInPolygon([marker.lng, marker.lat], drawnPolygon),
      );
    }

    return markers;
  }, [allAnunturi, dbListingsForMap, drawnPolygon]);

  return (
    <main className="w-full relative flex flex-col">
      {/* O înălțime viewport pe hartă (ca vechiul h-screen); footer-ul rămâne dedesubt, scroll pe pagină */}
      <div className="h-dvh w-full min-h-0 relative">
        <BucharestMap
          markers={mapMarkers}
          initialSelectedId={selectedId}
          showControls={true}
          fullscreen={true}
          isDrawingMode={isDrawingMode}
          onPolygonComplete={(polygon) => {
            setDrawnPolygon(polygon);
            setIsDrawingMode(false);
          }}
          drawnPolygon={drawnPolygon}
          onClearPolygon={() => setDrawnPolygon(null)}
          poiFilters={{
            mode: poiMode,
            transportMetrou: showTransportMetrou,
            transportTramvai: showTransportTramvai,
            transportAutobuz: showTransportAutobuz,
            scoli: showScoli,
            restaurante: showRestaurante,
            magazine: showMagazine,
          }}
        />
      </div>

      {/* Puncte de interes – separat de filtrarea anunțurilor */}
      <div className="absolute top-[calc(env(safe-area-inset-top,0px)+5.75rem)] sm:top-24 left-1/2 -translate-x-1/2 z-20 px-2 sm:px-4 w-[calc(100%-1rem)] max-w-lg sm:max-w-none sm:w-auto">
        <div
          ref={poiPanelRef}
          className="inline-flex flex-col gap-2 backdrop-blur-md bg-white/90 dark:bg-[#1B1B21]/90 border border-white/20 dark:border-[#2b2b33]/50 rounded-xl px-3 py-2 shadow-lg max-h-[min(52dvh,calc(100dvh-12rem))] overflow-y-auto overscroll-contain w-full sm:w-auto sm:max-h-none sm:overflow-visible"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground whitespace-nowrap">
              Puncte de interes
            </h3>
            <div className="flex flex-col md:flex-row gap-1.5 md:gap-3 text-[11px] md:text-xs">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  className="accent-[#C25A2B]"
                  checked={pendingPoiMode === "all"}
                  onChange={() => {
                    setPendingPoiMode("all");
                    setIsPoiCustomPanelOpen(false);
                  }}
                />
                <span>Hartă completă</span>
              </label>
              <label
                className="inline-flex items-center gap-1.5 cursor-pointer"
                onClick={() => {
                  setPendingPoiMode("custom");
                  setIsPoiCustomPanelOpen(true);
                }}
              >
                <input
                  type="radio"
                  className="accent-[#C25A2B]"
                  checked={pendingPoiMode === "custom"}
                  onChange={() => {
                    setPendingPoiMode("custom");
                    setIsPoiCustomPanelOpen(true);
                  }}
                />
                <span>Selectez manual</span>
              </label>
            </div>
          </div>

          {pendingPoiMode === "custom" && isPoiCustomPanelOpen && (
            <div className="flex flex-col gap-2 mt-1 w-full max-w-[min(100vw-2rem,520px)]">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 px-0.5">
                  Transport în comun
                </span>
                <div className="flex flex-wrap gap-1.5 md:gap-2 items-center">
                  <label className="inline-flex items-center gap-1.5 text-[11px] md:text-xs cursor-pointer bg-white/70 dark:bg-[#111118]/70 px-2.5 py-1.5 rounded-full border border-white/40 dark:border-[#2b2b33]/60">
                    <input
                      type="checkbox"
                      className="accent-[#C25A2B]"
                      checked={pendingShowTransportMetrou}
                      onChange={(e) => setPendingShowTransportMetrou(e.target.checked)}
                    />
                    <span>Metrou</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] md:text-xs cursor-pointer bg-white/70 dark:bg-[#111118]/70 px-2.5 py-1.5 rounded-full border border-white/40 dark:border-[#2b2b33]/60">
                    <input
                      type="checkbox"
                      className="accent-[#C25A2B]"
                      checked={pendingShowTransportTramvai}
                      onChange={(e) => setPendingShowTransportTramvai(e.target.checked)}
                    />
                    <span>Tramvai</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] md:text-xs cursor-pointer bg-white/70 dark:bg-[#111118]/70 px-2.5 py-1.5 rounded-full border border-white/40 dark:border-[#2b2b33]/60">
                    <input
                      type="checkbox"
                      className="accent-[#C25A2B]"
                      checked={pendingShowTransportAutobuz}
                      onChange={(e) => setPendingShowTransportAutobuz(e.target.checked)}
                    />
                    <span>Autobuz</span>
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 md:gap-2 items-center">
              <label className="inline-flex items-center gap-1.5 text-[11px] md:text-xs cursor-pointer bg-white/70 dark:bg-[#111118]/70 px-2.5 py-1.5 rounded-full border border-white/40 dark:border-[#2b2b33]/60">
                <input
                  type="checkbox"
                  className="accent-[#C25A2B]"
                  checked={pendingShowScoli}
                  onChange={(e) => setPendingShowScoli(e.target.checked)}
                />
                <span>Școli</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-[11px] md:text-xs cursor-pointer bg-white/70 dark:bg-[#111118]/70 px-2.5 py-1.5 rounded-full border border-white/40 dark:border-[#2b2b33]/60">
                <input
                  type="checkbox"
                  className="accent-[#C25A2B]"
                  checked={pendingShowRestaurante}
                  onChange={(e) => setPendingShowRestaurante(e.target.checked)}
                />
                <span>Restaurante</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-[11px] md:text-xs cursor-pointer bg-white/70 dark:bg-[#111118]/70 px-2.5 py-1.5 rounded-full border border-white/40 dark:border-[#2b2b33]/60">
                <input
                  type="checkbox"
                  className="accent-[#C25A2B]"
                  checked={pendingShowMagazine}
                  onChange={(e) => setPendingShowMagazine(e.target.checked)}
                />
                <span>Magazine alimentare</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setPoiMode(pendingPoiMode);
                  setShowTransportMetrou(pendingShowTransportMetrou);
                  setShowTransportTramvai(pendingShowTransportTramvai);
                  setShowTransportAutobuz(pendingShowTransportAutobuz);
                  setShowScoli(pendingShowScoli);
                  setShowRestaurante(pendingShowRestaurante);
                  setShowMagazine(pendingShowMagazine);
                  setIsPoiCustomPanelOpen(false);
                }}
                className="ml-auto px-3 py-1.5 rounded-full text-[11px] md:text-xs font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#C25A2B" }}
              >
                Aplică filtre
              </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Butoane Filtre și Pen în colțul stânga sus */}
      <div
        className={`absolute top-[calc(env(safe-area-inset-top,0px)+5.75rem)] sm:top-24 left-2 sm:left-8 z-10 flex flex-col gap-2 transition-all duration-300 ease-in-out ${
          isFiltersOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        <button
          onClick={() => setIsFiltersOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg backdrop-blur-md bg-white/90 dark:bg-[#1B1B21]/90 border border-white/20 dark:border-[#2b2b33]/50 shadow-lg hover:opacity-90 transition-opacity touch-manipulation"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          <CiFilter size={20} />
          <span className="font-medium text-sm sm:text-base">Filtre</span>
        </button>
        <button
          onClick={() => {
            if (isDrawingMode && drawnPolygon) {
              // Dacă modul de desenare este activ și există un poligon, șterge-l
              setDrawnPolygon(null);
              setIsDrawingMode(false);
            } else {
              // Altfel, comută modul de desenare
              setIsDrawingMode(!isDrawingMode);
            }
          }}
          className={`flex items-center justify-center w-12 h-12 rounded-lg backdrop-blur-md border shadow-lg hover:opacity-90 transition-opacity ${
            isDrawingMode || drawnPolygon
              ? "bg-[#C25A2B]/90 border-[#C25A2B] text-white"
              : "bg-white/90 dark:bg-[#1B1B21]/90 border-white/20 dark:border-[#2b2b33]/50 text-foreground"
          }`}
          aria-label={drawnPolygon ? "Șterge zonă desenată" : isDrawingMode ? "Oprește desenarea" : "Desenează zonă"}
          title={drawnPolygon ? "Șterge zonă desenată" : isDrawingMode ? "Oprește desenarea" : "Desenează zonă"}
        >
          <MdEdit size={20} />
        </button>
      </div>

      {/* Indicator mod desenare */}
      {isDrawingMode && (
        <div className="absolute top-[calc(env(safe-area-inset-top,0px)+8.5rem)] sm:top-36 left-1/2 -translate-x-1/2 z-20 max-w-[min(calc(100vw-1.5rem),28rem)] px-3 sm:px-4 py-2 rounded-lg backdrop-blur-md bg-[#C25A2B]/90 text-white shadow-lg pointer-events-none">
          <p className="text-xs sm:text-sm font-medium text-center leading-snug" style={{ fontFamily: "var(--font-galak-regular)" }}>
            Click pe hartă pentru a desena zona. Click pe primul punct pentru a închide poligonul.
          </p>
        </div>
      )}

      {/* Filtre overlay transparente peste hartă */}
      <div
        className={`absolute top-[calc(env(safe-area-inset-top,0px)+5.75rem)] sm:top-24 left-0 right-0 z-10 px-2 sm:px-8 transition-all duration-300 ease-in-out ${
          isFiltersOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="w-full max-h-[min(72dvh,calc(100dvh-6rem))] overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-3 backdrop-blur-md bg-white/90 dark:bg-[#1B1B21]/90 border border-white/20 dark:border-[#2b2b33]/50 rounded-xl p-3 shadow-lg transform transition-transform duration-300" style={{ fontFamily: "var(--font-galak-regular)" }}>
              {/* Header cu buton închidere */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">Filtre</h3>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 dark:hover:bg-gray-800/50 transition-colors"
                  aria-label="Închide filtre"
                >
                  <MdClose size={18} />
                </button>
              </div>

              {/* Filtre */}
              <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
                {/* Searchbar Zona */}
                <input
                  type="text"
                  placeholder="Zona"
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-white/30 dark:border-[#2b2b33]/50 bg-white/80 dark:bg-[#1B1B21]/80 text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B] backdrop-blur-sm"
                />

                {/* Dropdown Vânzare/Închiriere */}
                <div className="relative shrink-0">
                  <select 
                    value={tipProprietate}
                    onChange={(e) => setTipProprietate(e.target.value)}
                    className="w-full md:w-40 px-3 py-2 text-sm pr-10 rounded-lg border border-white/30 dark:border-[#2b2b33]/50 bg-white/80 dark:bg-[#1B1B21]/80 text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B] appearance-none backdrop-blur-sm"
                  >
                    <option>Vânzare</option>
                    <option>Închiriere</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Preț minim */}
                <input
                  type="text"
                  placeholder="Preț minim"
                  value={pretMinim}
                  onChange={(e) => setPretMinim(e.target.value)}
                  className="flex-1 md:flex-none md:w-32 px-3 py-2 text-sm rounded-lg border border-white/30 dark:border-[#2b2b33]/50 bg-white/80 dark:bg-[#1B1B21]/80 text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B] backdrop-blur-sm"
                />

                {/* Preț maxim */}
                <input
                  type="text"
                  placeholder="Preț maxim"
                  value={pretMaxim}
                  onChange={(e) => setPretMaxim(e.target.value)}
                  className="flex-1 md:flex-none md:w-32 px-3 py-2 text-sm rounded-lg border border-white/30 dark:border-[#2b2b33]/50 bg-white/80 dark:bg-[#1B1B21]/80 text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B] backdrop-blur-sm"
                />

                {/* Dropdown Număr dormitoare */}
                <div className="relative shrink-0">
                  <select 
                    value={nrDormitoare}
                    onChange={(e) => setNrDormitoare(e.target.value)}
                    className="w-full md:w-40 px-3 py-2 text-sm pr-10 rounded-lg border border-white/30 dark:border-[#2b2b33]/50 bg-white/80 dark:bg-[#1B1B21]/80 text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B] appearance-none backdrop-blur-sm"
                  >
                    <option value="">Nr. dormitoare</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5+</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Dropdown Tip proprietate */}
                <div className="relative shrink-0">
                  <select 
                    value={tipImobil}
                    onChange={(e) => setTipImobil(e.target.value)}
                    className="w-full md:w-40 px-3 py-2 text-sm pr-10 rounded-lg border border-white/30 dark:border-[#2b2b33]/50 bg-white/80 dark:bg-[#1B1B21]/80 text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B] appearance-none backdrop-blur-sm"
                  >
                    <option value="">Tip proprietate</option>
                    <option>Apartament</option>
                    <option>Casă</option>
                    <option>Teren</option>
                    <option>Comercial</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Buton Filtrare avansată */}
                <button
                  className="px-4 py-2 text-sm rounded-lg border border-white/30 dark:border-[#2b2b33]/50 bg-white/80 dark:bg-[#1B1B21]/80 text-foreground hover:opacity-90 transition-opacity font-medium backdrop-blur-sm whitespace-nowrap"
                >
                  Filtrare avansată
                </button>

                {/* Buton Aplică filtre */}
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg text-white font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                  style={{ backgroundColor: "#C25A2B" }}
                >
                  Aplică filtre
                </button>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}

export default function HartaPage() {
  return (
    <div className="min-h-dvh text-foreground flex flex-col">
      <Navbar fullWidthContent />
      <Suspense fallback={<div className="h-dvh w-full flex items-center justify-center px-4 text-sm text-muted-foreground">Se încarcă harta…</div>}>
        <HartaContent />
      </Suspense>
      <div className="footer-no-margin">
        <Footer />
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .footer-no-margin footer {
          margin-top: 0 !important;
        }
      `}} />
    </div>
  );
}
