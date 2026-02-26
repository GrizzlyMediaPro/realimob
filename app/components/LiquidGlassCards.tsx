"use client";

import { useState, useEffect, type ReactNode } from "react";

/* ── Hook detectare dark mode ── */
function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/* ── Spec Card individual ── */
export function GlassSpecCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
}) {
  const isDark = useDarkMode();

  return (
    <div
      className="rounded-2xl px-3 py-4 flex flex-col items-center text-center relative overflow-hidden"
      style={{
        background: isDark
          ? "rgba(35, 35, 48, 0.45)"
          : "rgba(255, 255, 255, 0.55)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(255, 255, 255, 0.45)",
        boxShadow: isDark
          ? "0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
          : "0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(60px) saturate(1.6)",
        WebkitBackdropFilter: "blur(60px) saturate(1.6)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Subtilă reflexie mată pe top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: isDark
            ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div className="relative z-2">{icon}</div>
      <div className="relative z-2 font-semibold text-foreground text-sm md:text-base">
        {value}
      </div>
      <div className="relative z-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </div>
    </div>
  );
}

/* ── Contact Card cu liquid glass ── */
export function GlassContactCard({ children }: { children: ReactNode }) {
  const isDark = useDarkMode();

  return (
    <div
      className="rounded-2xl p-5 space-y-4 relative overflow-visible"
      style={{
        background: isDark
          ? "rgba(35, 35, 48, 0.5)"
          : "rgba(255, 255, 255, 0.6)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.12)"
          : "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: isDark
          ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          : "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(80px) saturate(1.6)",
        WebkitBackdropFilter: "blur(80px) saturate(1.6)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Reflexie mată subtilă */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "45%",
          background: isDark
            ? "linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)",
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      {children}
    </div>
  );
}

/* ── Buton liquid glass CTA ── */
export function GlassCTAButton({ children, primary = false, onClick }: { children: ReactNode; primary?: boolean; onClick?: () => void }) {
  const isDark = useDarkMode();

  if (primary) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="relative z-2 w-full mt-2 px-4 py-2.5 rounded-xl text-white font-medium hover:brightness-110 transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-2 w-full px-4 py-2.5 rounded-xl hover:brightness-105 transition-all duration-300 text-sm font-medium text-foreground"
      style={{
        background: isDark
          ? "rgba(50, 50, 65, 0.4)"
          : "rgba(255, 255, 255, 0.5)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(255, 255, 255, 0.45)",
        boxShadow: isDark
          ? "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)"
          : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(30px) saturate(1.5)",
        WebkitBackdropFilter: "blur(30px) saturate(1.5)",
      }}
    >
      {children}
    </button>
  );
}

/* ── Stats Card cu liquid glass ── */
export function GlassStatsCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const isDark = useDarkMode();

  return (
    <div
      className={`rounded-2xl p-4 space-y-3 relative overflow-hidden ${className}`}
      style={{
        background: isDark
          ? "rgba(35, 35, 48, 0.45)"
          : "rgba(255, 255, 255, 0.55)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(255, 255, 255, 0.45)",
        boxShadow: isDark
          ? "0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
          : "0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(60px) saturate(1.6)",
        WebkitBackdropFilter: "blur(60px) saturate(1.6)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Reflexie mată subtilă */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: isDark
            ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      {children}
    </div>
  );
}

/* ── Separator pentru stats card ── */
export function GlassDivider() {
  const isDark = useDarkMode();
  return (
    <div
      className="relative z-2"
      style={{
        borderTop: isDark
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid rgba(0, 0, 0, 0.06)",
      }}
    />
  );
}
