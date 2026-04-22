"use client";

import type { PoiFilters } from "./BucharestMap";

export type { PoiFilters } from "./BucharestMap";

export const DEFAULT_MAP_POI_FILTERS: PoiFilters = {
  mode: "all",
  transportMetrou: true,
  transportTramvai: true,
  transportAutobuz: true,
  scoli: true,
  restaurante: true,
  magazine: true,
};

type Props = {
  value: PoiFilters;
  onChange: (next: PoiFilters) => void;
  className?: string;
  /** Varianta compactă pentru overlay pe hartă îngustă */
  dense?: boolean;
  /** Fără chenar „glass” — pentru antetul unui modal pe fundal solid */
  bare?: boolean;
};

export default function MapPoiFiltersPanel({
  value,
  onChange,
  className = "",
  dense,
  bare,
}: Props) {
  const patch = (partial: Partial<PoiFilters>) => onChange({ ...value, ...partial });

  const labelRow = dense ? "text-[10px] sm:text-xs" : "text-[11px] sm:text-xs";
  const chip = dense
    ? "text-[10px] sm:text-[11px] px-2 py-1 sm:px-2.5 sm:py-1.5"
    : "text-[11px] sm:text-xs px-2.5 py-1.5";

  const shell = bare
    ? `flex flex-col gap-2 ${className}`
    : `flex flex-col gap-2 backdrop-blur-md bg-white/90 dark:bg-[#1B1B21]/90 border border-white/20 dark:border-[#2b2b33]/50 rounded-xl px-2.5 py-2 shadow-lg ${className}`;

  return (
    <div className={shell} style={{ fontFamily: "var(--font-galak-regular)" }}>
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <h3 className={`font-semibold text-foreground ${dense ? "text-xs" : "text-xs sm:text-sm"}`}>
          Puncte de interes
        </h3>
        <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 sm:gap-x-3 ${labelRow}`}>
          <label className="inline-flex cursor-pointer items-center gap-1.5">
            <input
              type="radio"
              className="accent-[#C25A2B]"
              checked={value.mode === "all"}
              onChange={() => patch({ mode: "all" })}
            />
            <span>Hartă completă</span>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1.5">
            <input
              type="radio"
              className="accent-[#C25A2B]"
              checked={value.mode === "custom"}
              onChange={() => patch({ mode: "custom" })}
            />
            <span>Selectez manual</span>
          </label>
        </div>
      </div>

      {value.mode === "custom" && (
        <div
          className={`flex max-h-[min(30dvh,200px)] flex-col gap-2 overflow-y-auto overscroll-contain sm:max-h-none sm:overflow-visible ${dense ? "pt-0.5" : ""}`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Transport în comun
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["Metrou", "transportMetrou" as const],
                ["Tramvai", "transportTramvai" as const],
                ["Autobuz", "transportAutobuz" as const],
              ] as const
            ).map(([label, key]) => (
              <label
                key={key}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/40 bg-white/70 dark:border-[#2b2b33]/60 dark:bg-[#111118]/70 ${chip}`}
              >
                <input
                  type="checkbox"
                  className="accent-[#C25A2B]"
                  checked={value[key]}
                  onChange={(e) => patch({ [key]: e.target.checked })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["Școli", "scoli" as const],
                ["Restaurante", "restaurante" as const],
                ["Magazine alimentare", "magazine" as const],
              ] as const
            ).map(([label, key]) => (
              <label
                key={key}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/40 bg-white/70 dark:border-[#2b2b33]/60 dark:bg-[#111118]/70 ${chip}`}
              >
                <input
                  type="checkbox"
                  className="accent-[#C25A2B]"
                  checked={value[key]}
                  onChange={(e) => patch({ [key]: e.target.checked })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
