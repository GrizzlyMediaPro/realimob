"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MdClose } from "react-icons/md";

const BucharestMap = dynamic(() => import("./BucharestMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-white/80 text-sm text-gray-600 dark:bg-[#0b0b10]/80 dark:text-gray-300">
      Se încarcă harta…
    </div>
  ),
});

type ListingMapModalProps = {
  id: string;
  titlu: string;
  lat?: number;
  lng?: number;
  /** Preț afișat pe marker (ex. chirie „X €/lună” sau preț vânzare). */
  pret?: string;
  image?: string;
  descriere?: string;
  routePath?: string;
  open?: boolean;
  onClose?: () => void;
  showButton?: boolean;
};

export default function ListingMapModal({
  id,
  titlu,
  lat,
  lng,
  pret,
  image,
  descriere,
  routePath,
  open: controlledOpen,
  onClose: controlledOnClose,
  showButton = true,
}: ListingMapModalProps) {
  const coordsValid = typeof lat === "number" && typeof lng === "number";

  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpen = () => {
    if (controlledOpen === undefined) {
      setInternalOpen(true);
    }
  };
  const handleClose = useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
  }, [controlledOnClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  const [poiMode, setPoiMode] = useState<"all" | "custom">("all");
  const [showTransportMetrou, setShowTransportMetrou] = useState(true);
  const [showTransportTramvai, setShowTransportTramvai] = useState(true);
  const [showTransportAutobuz, setShowTransportAutobuz] = useState(true);
  const [showScoli, setShowScoli] = useState(true);
  const [showRestaurante, setShowRestaurante] = useState(true);
  const [showMagazine, setShowMagazine] = useState(true);

  const markers = useMemo(() => {
    if (!coordsValid) return [];
    return [
      {
        id,
        titlu,
        lat: lat as number,
        lng: lng as number,
        pret,
        image,
        descriere,
        routePath,
      },
    ];
  }, [coordsValid, id, titlu, lat, lng, pret, image, descriere, routePath]);

  const poiFilters = useMemo(
    () => ({
      mode: poiMode,
      transportMetrou: showTransportMetrou,
      transportTramvai: showTransportTramvai,
      transportAutobuz: showTransportAutobuz,
      scoli: showScoli,
      restaurante: showRestaurante,
      magazine: showMagazine,
    }),
    [
      poiMode,
      showTransportMetrou,
      showTransportTramvai,
      showTransportAutobuz,
      showScoli,
      showRestaurante,
      showMagazine,
    ],
  );

  if (!coordsValid) {
    return null;
  }

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
        <div
          className="fixed inset-0 z-[300] flex max-sm:items-stretch sm:items-center sm:justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="listing-map-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
            aria-hidden="true"
          />

          <div
            className="relative flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden border-0 bg-white shadow-2xl dark:bg-[#0b0b10] sm:max-h-[min(86dvh,720px)] sm:max-w-[960px] sm:rounded-2xl sm:border sm:border-[#d5dae0] dark:sm:border-[#2b2b33]"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[#d5dae0] px-3 py-2.5 pt-[max(0.5rem,env(safe-area-inset-top,0px))] dark:border-[#2b2b33] sm:px-4 sm:py-3">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Locația proprietății
                </p>
                <h2
                  id="listing-map-modal-title"
                  className="line-clamp-2 text-sm font-semibold text-foreground sm:text-base"
                >
                  {titlu}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 shadow hover:opacity-90 dark:bg-black/70"
                aria-label="Închide harta"
              >
                <MdClose size={20} />
              </button>
            </div>

            <div className="shrink-0 border-b border-[#d5dae0] px-2 py-2 dark:border-[#2b2b33] sm:px-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <h3 className="text-xs font-semibold text-foreground sm:text-sm">
                  Puncte de interes
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      className="accent-[#C25A2B]"
                      checked={poiMode === "all"}
                      onChange={() => setPoiMode("all")}
                    />
                    <span>Hartă completă</span>
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      className="accent-[#C25A2B]"
                      checked={poiMode === "custom"}
                      onChange={() => setPoiMode("custom")}
                    />
                    <span>Selectez manual</span>
                  </label>
                </div>
              </div>

              {poiMode === "custom" && (
                <div className="mt-2 flex max-h-[min(36dvh,220px)] flex-col gap-2 overflow-y-auto overscroll-contain sm:max-h-none sm:overflow-visible">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Transport în comun
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ["Metrou", showTransportMetrou, setShowTransportMetrou] as const,
                        ["Tramvai", showTransportTramvai, setShowTransportTramvai] as const,
                        ["Autobuz", showTransportAutobuz, setShowTransportAutobuz] as const,
                      ] as const
                    ).map(([label, checked, set]) => (
                      <label
                        key={label}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/40 bg-white/70 px-2.5 py-1.5 text-[11px] dark:border-[#2b2b33]/60 dark:bg-[#111118]/70 sm:text-xs"
                      >
                        <input
                          type="checkbox"
                          className="accent-[#C25A2B]"
                          checked={checked}
                          onChange={(e) => set(e.target.checked)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ["Școli", showScoli, setShowScoli] as const,
                        ["Restaurante", showRestaurante, setShowRestaurante] as const,
                        ["Magazine alimentare", showMagazine, setShowMagazine] as const,
                      ] as const
                    ).map(([label, checked, set]) => (
                      <label
                        key={label}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/40 bg-white/70 px-2.5 py-1.5 text-[11px] dark:border-[#2b2b33]/60 dark:bg-[#111118]/70 sm:text-xs"
                      >
                        <input
                          type="checkbox"
                          className="accent-[#C25A2B]"
                          checked={checked}
                          onChange={(e) => set(e.target.checked)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative min-h-0 flex-1 w-full pb-[env(safe-area-inset-bottom,0px)]">
              <BucharestMap
                key={id}
                markers={markers}
                initialSelectedId={null}
                showControls
                fullscreen={false}
                fillContainer
                focusLngLat={{ lng, lat, zoom: 14.5 }}
                poiFilters={poiFilters}
                showFullscreenButton={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
