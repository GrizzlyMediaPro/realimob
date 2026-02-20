"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MdMyLocation, MdFullscreen, MdArrowBack, MdClose } from "react-icons/md";
import Map, { Marker, Popup, ViewState, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { getAnuntById } from "../../lib/anunturiData";

type MarkerItem = {
  id: string;
  titlu: string;
  lat: number;
  lng: number;
  descriere?: string;
  pret?: string;
  image?: string;
  routePath?: string;
};

export default function BucharestMap({
  markers,
  initialSelectedId,
  showControls = true,
  fullscreen = false,
  isDrawingMode = false,
  onPolygonComplete,
  drawnPolygon,
  onClearPolygon,
}: {
  markers: MarkerItem[];
  initialSelectedId?: string | null;
  showControls?: boolean;
  fullscreen?: boolean;
  isDrawingMode?: boolean;
  onPolygonComplete?: (polygon: number[][]) => void;
  drawnPolygon?: number[][] | null;
  onClearPolygon?: () => void;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
  const router = useRouter();
  const POPUP_W = 320;
  const POPUP_H = 320;
  const POPUP_MARGIN = 16;

  const bucharestCenter = useMemo(
    () => ({ longitude: 26.1025, latitude: 44.4268 }),
    []
  );

  const initialViewState: ViewState = {
    longitude: bucharestCenter.longitude,
    latitude: bucharestCenter.latitude,
    zoom: 12.5,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  };

  const [viewState, setViewState] = useState<ViewState>(initialViewState);
  const [selected, setSelected] = useState<MarkerItem | null>(
    markers.find((m) => m.id === initialSelectedId) ?? null
  );
  const [drawingPoints, setDrawingPoints] = useState<number[][]>([]);
  const [pendingPolygon, setPendingPolygon] = useState<number[][] | null>(null);
  const mapRef = useRef<any>(null);
  
  // Obține anunțul complet pentru popup
  const selectedAnunt = useMemo(() => {
    if (!selected) return null;
    return getAnuntById(selected.id);
  }, [selected]);

  // Evită warning-ul React: nu facem setState în părinte în timpul update-ului intern al hărții.
  useEffect(() => {
    if (!pendingPolygon) return;
    onPolygonComplete?.(pendingPolygon);
    setPendingPolygon(null);
  }, [pendingPolygon, onPolygonComplete]);

  const handleZoom = (delta: number) => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.min(19, Math.max(11, prev.zoom + delta)),
    }));
  };

  const handleRecenter = () => {
    setViewState(initialViewState);
  };

  const handleFullscreen = () => {
    if (fullscreen) {
      router.back();
    } else {
      router.push("/harta");
    }
  };

  const handleMapClick = (event: any) => {
    if (!isDrawingMode) return;
    
    const { lng, lat } = event.lngLat;
    const newPoint = [lng, lat];
    
    setDrawingPoints((prev) => {
      // Dacă avem cel puțin 3 puncte, verificăm dacă click-ul este aproape de primul punct
      if (prev.length >= 3) {
        const firstPoint = prev[0];
        const distance = Math.sqrt(
          Math.pow(lng - firstPoint[0], 2) + Math.pow(lat - firstPoint[1], 2)
        );
        // Dacă distanța este mică (aproximativ 0.002 grade, ~200m), închidem poligonul
        if (distance < 0.002) {
          setPendingPolygon(prev);
          return [];
        }
      }
      
      // Adăugăm noul punct
      const updated = [...prev, newPoint];
      
      // Dacă avem cel puțin 3 puncte, putem închide poligonul automat
      if (updated.length >= 3 && event.originalEvent?.detail === 2) {
        // Dublu-click închide poligonul
        setPendingPolygon(updated);
        return [];
      }
      
      return updated;
    });
  };

  // Permite închiderea poligonului cu Enter
  useEffect(() => {
    if (!isDrawingMode) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && drawingPoints.length >= 3) {
        setPendingPolygon(drawingPoints);
        setDrawingPoints([]);
      }
      if (e.key === "Escape") {
        setDrawingPoints([]);
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isDrawingMode, fullscreen, drawingPoints, onPolygonComplete]);

  // Anchor: default sub punct (top). Dacă nu încape jos -> sus (bottom). Dacă nu încape nici sus -> pe lateral.
  const popupAnchor = useMemo(() => {
    if (!selected) return "top";
    const map = mapRef.current?.getMap?.() ?? mapRef.current;
    if (!map?.project || !map?.getContainer) return "top";

    const { x, y } = map.project([selected.lng, selected.lat]);
    const container = map.getContainer();
    const w = container.clientWidth;
    const h = container.clientHeight;

    const spaceBelow = h - y - POPUP_MARGIN;
    const spaceAbove = y - POPUP_MARGIN;
    const spaceRight = w - x - POPUP_MARGIN;
    const spaceLeft = x - POPUP_MARGIN;

    // 1) Prefer sub marker dacă încape
    if (spaceBelow >= POPUP_H) return "top";
    // 2) Altfel deasupra markerului dacă încape
    if (spaceAbove >= POPUP_H) return "bottom";

    // 3) Altfel, pe lateral (alegem partea cu mai mult spațiu)
    if (spaceRight >= POPUP_W || spaceRight >= spaceLeft) return "right";
    return "left";
  }, [selected?.lng, selected?.lat, viewState.longitude, viewState.latitude, viewState.zoom]);

  const handleClearDrawing = () => {
    setDrawingPoints([]);
    if (onClearPolygon) {
      onClearPolygon();
    }
  };

  // Pregătește datele GeoJSON pentru poligonul desenat
  const polygonGeoJson = useMemo(() => {
    if (!drawnPolygon || drawnPolygon.length < 3) return null;
    
    // Închide poligonul conectând ultimul punct cu primul
    const closedPolygon = [...drawnPolygon, drawnPolygon[0]];
    
    return {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [closedPolygon],
      },
      properties: {},
    };
  }, [drawnPolygon]);

  // Pregătește datele GeoJSON pentru punctele în curs de desenare
  const drawingLineGeoJson = useMemo(() => {
    if (drawingPoints.length < 2) return null;
    
    return {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: drawingPoints,
      },
      properties: {},
    };
  }, [drawingPoints]);

  return (
    <>
      <style jsx global>{`
        .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          overflow: hidden !important;
          width: 320px !important;
          max-width: 320px !important;
        }
        .mapboxgl-popup-close-button {
          width: 32px !important;
          height: 32px !important;
          font-size: 18px !important;
          color: #1f2937 !important;
          background-color: rgba(255, 255, 255, 0.95) !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          margin: 8px 8px 0 0 !important;
          z-index: 20 !important;
          transition: all 0.2s !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          font-weight: bold !important;
          line-height: 1 !important;
        }
        .mapboxgl-popup-close-button:hover {
          background-color: rgba(255, 255, 255, 1) !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15) !important;
        }
        .dark .mapboxgl-popup-close-button {
          color: rgba(255, 255, 255, 0.95) !important;
          background-color: rgba(27, 27, 33, 0.92) !important;
          border-color: rgba(255, 255, 255, 0.18) !important;
        }
        .dark .mapboxgl-popup-close-button:hover {
          background-color: rgba(27, 27, 33, 1) !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: white !important;
        }

        /* Evită clipping-ul popup-ului pe hărțile mici (unde înainte aveam overflow-hidden).
           Păstrăm colțurile rotunjite aplicând border-radius pe canvas/map. */
        .realimob-map--rounded .mapboxgl-map,
        .realimob-map--rounded .mapboxgl-canvas,
        .realimob-map--rounded .mapboxgl-canvas-container {
          border-radius: 1rem !important;
        }
      `}</style>
      <div className={`realimob-map--rounded w-full ${fullscreen ? 'h-screen' : 'h-[560px]'} ${fullscreen ? 'overflow-visible' : 'rounded-2xl overflow-visible border border-[#d5dae0] dark:border-[#2b2b33]'} bg-white dark:bg-[#0b0b10] relative`}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={token}
        cursor={isDrawingMode ? "crosshair" : "default"}
        // Limităm harta astfel încât utilizatorul să nu poată ieși
        // din zona București + Ilfov.
        //
        // Coordonatele sunt un bounding box aproximativ pentru
        // București și împrejurimi (Ilfov).
        maxBounds={[
          [25.7, 44.2], // sud‑vest
          [26.6, 44.7], // nord‑est
        ]}
        maxZoom={19}
        minZoom={11}
      >
        {markers.map((m) => (
          <Marker key={m.id} longitude={m.lng} latitude={m.lat} anchor="bottom">
            <button
              type="button"
              onClick={() => setSelected(m)}
              className="relative group cursor-pointer hover:scale-105 transition-transform"
              aria-label={m.titlu}
            >
              {/* Tooltip portocaliu cu preț */}
              <div className="relative">
                <div className="bg-[#C25A2B] text-white px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap font-medium text-sm" style={{ fontFamily: "var(--font-galak-regular)" }}>
                  {m.pret || "N/A"}
                </div>
                {/* Capăt ascuțit care indică locația */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-8 border-transparent border-t-[#C25A2B]"></div>
              </div>
            </button>
          </Marker>
        ))}

        {selected && selectedAnunt && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            onClose={() => setSelected(null)}
            closeOnClick={false}
            anchor={popupAnchor as any}
            offset={18}
            closeButton={false}
            className="mapboxgl-popup-custom"
          >
            <div
              className="cursor-pointer hover:opacity-95 transition-opacity w-full relative"
              onClick={() => {
                router.push(selected.routePath || `/anunturi/${selected.id}`);
              }}
            >
              {/* X (custom, centrat + dark theme) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(null);
                }}
                className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full flex items-center justify-center border shadow-md transition-transform hover:scale-105 bg-white/95 text-gray-900 border-black/10 dark:bg-[#1B1B21]/95 dark:text-white dark:border-white/15"
                aria-label="Închide"
              >
                <MdClose size={18} />
              </button>

              {/* Imagine */}
              <div className="relative w-full h-48 overflow-hidden bg-gray-200">
                <img
                  src={selectedAnunt.image}
                  alt={selected.titlu}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Conținut */}
              <div className="w-full px-4 py-3 bg-white dark:bg-[#1B1B21]">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight" style={{ fontFamily: "var(--font-galak-regular)" }}>
                  {selected.titlu}
                </h3>
                {selected.descriere && (
                  <p className="text-xs text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                    {selected.descriere}
                  </p>
                )}
                <div className="text-xl font-bold text-[#C25A2B]">
                  {selected.pret || "N/A"}
                </div>
              </div>
            </div>
          </Popup>
        )}

        {/* Poligon desenat */}
        {polygonGeoJson && (
          <Source id="drawn-polygon" type="geojson" data={polygonGeoJson}>
            <Layer
              id="drawn-polygon-fill"
              type="fill"
              paint={{
                "fill-color": "#C25A2B",
                "fill-opacity": 0.2,
              }}
            />
            <Layer
              id="drawn-polygon-stroke"
              type="line"
              paint={{
                "line-color": "#C25A2B",
                "line-width": 2,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        )}

        {/* Linie în curs de desenare */}
        {drawingLineGeoJson && (
          <Source id="drawing-line" type="geojson" data={drawingLineGeoJson}>
            <Layer
              id="drawing-line-layer"
              type="line"
              paint={{
                "line-color": "#C25A2B",
                "line-width": 2,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        )}

        {/* Puncte de desenare */}
        {drawingPoints.map((point, index) => (
          <Marker key={`drawing-point-${index}`} longitude={point[0]} latitude={point[1]}>
            <div className="w-3 h-3 rounded-full bg-[#C25A2B] border-2 border-white shadow-lg" />
          </Marker>
        ))}
      </Map>

      {/* Butoane de control */}
      {showControls && (
        <>
          {/* Butoane zoom + recentrare (stânga jos) */}
          <div className="absolute left-4 bottom-4 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleZoom(0.75)}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:opacity-90 transition-opacity text-lg font-semibold"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.75)}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:opacity-90 transition-opacity text-lg font-semibold"
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              onClick={handleRecenter}
              className="mt-1 w-10 h-10 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:opacity-90 transition-opacity"
              aria-label="Recentrează harta"
            >
              <MdMyLocation size={18} />
            </button>
          </div>

          {/* Buton Fullscreen dreapta sus - doar pe hărțile mici (nu fullscreen) */}
          {!fullscreen && (
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleFullscreen}
                className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:opacity-90 transition-opacity"
                aria-label="Fullscreen"
              >
                <MdFullscreen size={20} />
              </button>
              
              {/* Buton șterge poligon pe hărțile mici */}
              {drawnPolygon && (
                <button
                  type="button"
                  onClick={handleClearDrawing}
                  className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:opacity-90 transition-opacity"
                  aria-label="Șterge zonă desenată"
                  title="Șterge zonă desenată"
                >
                  <MdClose size={18} />
                </button>
              )}
            </div>
          )}

          {/* Buton Back dreapta sus - doar în modul fullscreen, simetric cu butonul Filtre */}
          {fullscreen && (
            <>
              <button
                type="button"
                onClick={() => router.back()}
                className="absolute top-24 md:top-24 right-4 md:right-8 z-10 w-10 h-10 rounded-full backdrop-blur-md bg-white/90 dark:bg-[#1B1B21]/90 border border-white/20 dark:border-[#2b2b33]/50 shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center text-foreground"
                aria-label="Înapoi"
              >
                <MdArrowBack size={20} />
              </button>
              
              {/* Buton șterge poligon */}
              {drawnPolygon && (
                <button
                  type="button"
                  onClick={handleClearDrawing}
                  className="absolute top-32 md:top-36 right-4 md:right-8 z-10 w-10 h-10 rounded-full backdrop-blur-md bg-white/90 dark:bg-[#1B1B21]/90 border border-white/20 dark:border-[#2b2b33]/50 shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center text-foreground"
                  aria-label="Șterge zonă desenată"
                  title="Șterge zonă desenată"
                >
                  <MdClose size={18} />
                </button>
              )}
            </>
          )}
        </>
      )}
      </div>
    </>
  );
}

