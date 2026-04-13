"use client";

import { useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MdDateRange } from "react-icons/md";

type Tab = "statistici" | "rapoarte";

const PRESETS = [
  { id: "all", label: "Tot timpul" },
  { id: "luna", label: "Luna curentă (UTC)" },
  { id: "l3", label: "Ultimele 3 luni" },
  { id: "l6", label: "Ultimele 6 luni" },
  { id: "l12", label: "Ultimele 12 luni" },
  { id: "custom", label: "Interval personalizat" },
] as const;

export function AdminAnalyticsTimeFilter({
  isDark,
  tab,
}: {
  isDark: boolean;
  tab: Tab;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const interval = sp.get("interval") ?? "all";
  const urlFrom = sp.get("from") ?? "";
  const urlTo = sp.get("to") ?? "";

  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const navigate = useCallback(
    (patch: Record<string, string | null | undefined>) => {
      const p = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === null || v === "") p.delete(k);
        else p.set(k, v);
      }
      if (tab === "rapoarte") p.set("tab", "rapoarte");
      else p.delete("tab");
      const qs = p.toString();
      router.replace(qs ? `/admin/statistici?${qs}` : "/admin/statistici", {
        scroll: false,
      });
    },
    [router, sp, tab]
  );

  const applyCustom = () => {
    const f = fromRef.current?.value?.trim() ?? "";
    const t = toRef.current?.value?.trim() ?? "";
    navigate({
      interval: "custom",
      from: f || null,
      to: t || null,
    });
  };

  return (
    <div
      className="rounded-none md:rounded-3xl overflow-hidden relative px-4 md:px-6 py-4 md:py-5"
      style={{
        fontFamily: "var(--font-galak-regular)",
        background: isDark ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.55)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <MdDateRange className="text-[#C25A2B]" size={22} />
        <span
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          Perioadă analiză (UTC)
        </span>
      </div>
      <p
        className="text-xs text-gray-500 dark:text-gray-400 mb-3"
        style={{ fontFamily: "var(--font-galak-regular)" }}
      >
        Anunțurile și distribuțiile se filtrează după data creării. Total
        utilizatori (Clerk) rămâne global; „utilizatori noi” respectă intervalul
        când e filtrat.
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (id === "custom") {
                navigate({
                  interval: "custom",
                  from: null,
                  to: null,
                });
                return;
              }
              navigate({
                interval: id === "all" ? null : id,
                from: null,
                to: null,
              });
            }}
            className="inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors"
            style={{
              fontFamily: "var(--font-galak-regular)",
              background:
                interval === id
                  ? "rgba(194, 90, 43, 0.22)"
                  : isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
              border:
                interval === id
                  ? "1px solid rgba(194, 90, 43, 0.45)"
                  : isDark
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid rgba(0,0,0,0.08)",
              color: interval === id ? "#C25A2B" : "inherit",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {interval === "custom" && (
        <div className="mt-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
            De la (YYYY-MM-DD)
            <input
              key={`df-${urlFrom}-${urlTo}`}
              ref={fromRef}
              type="date"
              defaultValue={urlFrom}
              className="rounded-xl border px-3 py-2 text-sm text-foreground bg-background/80 border-black/10 dark:border-white/15"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
            Până la (YYYY-MM-DD)
            <input
              key={`dt-${urlFrom}-${urlTo}`}
              ref={toRef}
              type="date"
              defaultValue={urlTo}
              className="rounded-xl border px-3 py-2 text-sm text-foreground bg-background/80 border-black/10 dark:border-white/15"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            />
          </label>
          <button
            type="button"
            onClick={applyCustom}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#C25A2B] hover:bg-[#a84d24] transition-colors sm:self-end"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            Aplică interval
          </button>
        </div>
      )}
    </div>
  );
}
