"use client";

import { useState } from "react";
import { MdClose, MdMyLocation } from "react-icons/md";
import Map, { Marker, ViewState } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

type ListingMapModalProps = {
  id: string;
  titlu: string;
  lat?: number;
  lng?: number;
  open?: boolean;
  onClose?: () => void;
  showButton?: boolean;
};

export default function ListingMapModal({
  id,
  titlu,
  lat,
  lng,
  open: controlledOpen,
  onClose: controlledOnClose,
  showButton = true,
}: ListingMapModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Folosim controlled state dacă este furnizat, altfel folosim internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpen = () => {
    if (controlledOpen === undefined) {
      setInternalOpen(true);
    }
  };
  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
  };

  // Dacă nu avem coordonate valide, nu afișăm deloc butonul.
  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  const initialView: ViewState = {
    longitude: lng,
    latitude: lat,
    zoom: 14.5,
  };

  const [viewState, setViewState] = useState<ViewState>(initialView);

  const handleZoom = (delta: number) => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.min(18, Math.max(12, prev.zoom + delta)),
    }));
  };

  const handleRecenter = () => {
    setViewState(initialView);
  };

  return (
    <>
      {showButton && (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[#C25A2B] font-medium underline-offset-4 hover:underline"
          onClick={handleOpen}
        >
          Vezi pe hartă
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Conținut modal */}
          <div className="relative w-full max-w-[960px] h-[520px] bg-white dark:bg-[#0b0b10] rounded-2xl border border-[#d5dae0] dark:border-[#2b2b33] shadow-2xl overflow-hidden">
            {/* Buton închidere (dreapta sus) */}
            <div className="absolute top-3 right-3 z-10 flex items-center justify-center">
              <button
                type="button"
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow hover:opacity-90 transition-opacity"
                aria-label="Închide harta"
              >
                <MdClose size={20} />
              </button>
            </div>

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
                aria-label="Recentrează harta pe proprietate"
              >
                <MdMyLocation size={18} />
              </button>
            </div>

            <div className="absolute top-3 left-4 z-10 max-w-[70%] bg-white/90 dark:bg-black/70 rounded-lg px-3 py-2">
              <div className="text-sm font-semibold text-foreground">
                Locația proprietății
              </div>
            </div>

            <Map
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              mapStyle="mapbox://styles/mapbox/streets-v11"
              mapboxAccessToken={token}
              maxBounds={[
                [25.7, 44.2], // sud-vest (Ilfov)
                [26.6, 44.7], // nord-est
              ]}
              maxZoom={18}
              minZoom={12}
            >
              <Marker longitude={lng} latitude={lat} anchor="bottom">
                <div className="flex flex-col items-center gap-1">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    className="drop-shadow-xl"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 2C8.686 2 6 4.686 6 8c0 4.418 4.5 9.5 5.658 10.793.18.202.504.202.684 0C13.5 17.5 18 12.418 18 8c0-3.314-2.686-6-6-6z"
                      fill="#C25A2B"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <circle cx="12" cy="8.25" r="2.4" fill="white" />
                  </svg>
                </div>
              </Marker>
            </Map>
          </div>
        </div>
      )}
    </>
  );
}

