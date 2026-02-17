"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MdMyLocation, MdFullscreen } from "react-icons/md";
import Map, { Marker, Popup, ViewState } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

type MarkerItem = {
  id: string;
  titlu: string;
  lat: number;
  lng: number;
  descriere?: string;
  pret?: string;
};

export default function BucharestMap({
  markers,
  initialSelectedId,
  showControls = true,
  fullscreen = false,
}: {
  markers: MarkerItem[];
  initialSelectedId?: string | null;
  showControls?: boolean;
  fullscreen?: boolean;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
  const router = useRouter();

  const bucharestCenter = useMemo(
    () => ({ longitude: 26.1025, latitude: 44.4268 }),
    []
  );

  const initialViewState: ViewState = {
    longitude: bucharestCenter.longitude,
    latitude: bucharestCenter.latitude,
    zoom: 12.5,
  };

  const [viewState, setViewState] = useState<ViewState>(initialViewState);

  const [selected, setSelected] = useState<MarkerItem | null>(
    markers.find((m) => m.id === initialSelectedId) ?? null
  );

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

  return (
    <div className={`w-full ${fullscreen ? 'h-full' : 'h-[560px]'} ${fullscreen ? '' : 'rounded-2xl overflow-hidden border border-[#d5dae0] dark:border-[#2b2b33]'} bg-white dark:bg-[#0b0b10] relative`}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={token}
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

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            onClose={() => setSelected(null)}
            closeOnClick={false}
            anchor="top"
          >
            <div className="font-semibold text-sm mb-1">{selected.titlu}</div>
            {selected.descriere && (
              <div className="text-xs text-gray-600">{selected.descriere}</div>
            )}
          </Popup>
        )}
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

          {/* Buton fullscreen (dreapta sus) */}
          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              onClick={handleFullscreen}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:opacity-90 transition-opacity"
              aria-label={fullscreen ? "Ieșire din fullscreen" : "Fullscreen"}
            >
              <MdFullscreen size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

