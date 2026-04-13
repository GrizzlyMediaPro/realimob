"use client";

import { useState, useEffect, useMemo, useCallback, type CSSProperties } from "react";
import Link from "next/link";
import {
  MdAnalytics,
  MdHome,
  MdTrendingUp,
  MdPending,
  MdCheckCircle,
  MdCancel,
  MdPeople,
  MdBusiness,
  MdLocationOn,
  MdAttachMoney,
  MdBarChart,
  MdPerson,
  MdDonutLarge,
  MdShowChart,
} from "react-icons/md";

type AnalyticsPayload = {
  meta?: {
    filtered: boolean;
    from: string | null;
    to: string | null;
    timezone?: string;
  };
  listings: {
    approved: number;
    denied: number;
    pending: number;
    total: number;
    approvalRatePercent: number;
  };
  agents: { total: number; active: number };
  users: { total: number; newLast30Days: number };
  listingsByTransaction: { transactionType: string; count: number }[];
  listingsByPropertyType: { propertyType: string; count: number }[];
  topSectors: { sector: string; count: number }[];
  priceByCurrencyApproved: {
    currency: string;
    avgPrice: number;
    count: number;
  }[];
  newListings: { last7Days: number; last30Days: number };
  monthlyCreated: { key?: string; label: string; count: number }[];
  dailyCreatedLast7: { key: string; label: string; count: number }[];
  topAgents: { id: string; name: string; listings: number }[];
};

const EMPTY: AnalyticsPayload = {
  listings: {
    approved: 0,
    denied: 0,
    pending: 0,
    total: 0,
    approvalRatePercent: 0,
  },
  agents: { total: 0, active: 0 },
  users: { total: 0, newLast30Days: 0 },
  listingsByTransaction: [],
  listingsByPropertyType: [],
  topSectors: [],
  priceByCurrencyApproved: [],
  newListings: { last7Days: 0, last30Days: 0 },
  monthlyCreated: [],
  dailyCreatedLast7: [],
  topAgents: [],
};

function conicFromSegments(
  segments: { color: string; fraction: number }[]
): string {
  let deg = 0;
  const parts: string[] = [];
  for (const s of segments) {
    if (s.fraction <= 0) continue;
    const sweep = Math.max(0.0001, s.fraction) * 360;
    const start = deg;
    deg += sweep;
    parts.push(`${s.color} ${start}deg ${deg}deg`);
  }
  if (parts.length === 0) return "transparent 0deg 360deg";
  return `conic-gradient(from 0deg, ${parts.join(", ")})`;
}

function glassOuterStyle(isDark: boolean): CSSProperties {
  return {
    fontFamily: "var(--font-galak-regular)",
    background: isDark ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.6)",
    border: isDark
      ? "1px solid rgba(255, 255, 255, 0.12)"
      : "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: isDark
      ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      : "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(80px) saturate(1.6)",
    WebkitBackdropFilter: "blur(80px) saturate(1.6)",
  };
}

function GlassReflection({ isDark }: { isDark: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "40%",
        background: isDark
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
          : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
        borderRadius: "inherit",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export function AdminAnaliticaPanel({
  analyticsFetchUrl,
}: {
  analyticsFetchUrl: string | null;
}) {
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<AnalyticsPayload>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const load = useCallback(async () => {
    if (analyticsFetchUrl === null) {
      setData(EMPTY);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(analyticsFetchUrl, { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Nu am putut încărca analiticele.");
      }
      setData(payload as AnalyticsPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare necunoscută.");
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [analyticsFetchUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatNumber = (n: number) => n.toLocaleString("ro-RO");
  const formatPrice = (n: number, currency: string) =>
    `${Math.round(n).toLocaleString("ro-RO")} ${currency}`;

  const maxTransaction = useMemo(
    () =>
      data.listingsByTransaction.reduce((m, x) => Math.max(m, x.count), 0) || 1,
    [data.listingsByTransaction]
  );
  const maxProperty = useMemo(
    () =>
      data.listingsByPropertyType.reduce((m, x) => Math.max(m, x.count), 0) || 1,
    [data.listingsByPropertyType]
  );
  const maxSector = useMemo(
    () => data.topSectors.reduce((m, x) => Math.max(m, x.count), 0) || 1,
    [data.topSectors]
  );
  /** Deduplicare după key (dacă răspunsul e corupt) și sumă count */
  const monthlyBars = useMemo(() => {
    const map = new Map<
      string,
      { key: string; label: string; count: number }
    >();
    for (const m of data.monthlyCreated) {
      const k = m.key ?? `k-${m.label}`;
      const cur = map.get(k);
      if (!cur) {
        map.set(k, {
          key: k,
          label: m.label,
          count: m.count,
        });
      } else {
        map.set(k, { ...cur, count: cur.count + m.count });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [data.monthlyCreated]);

  const maxMonthly = useMemo(
    () => monthlyBars.reduce((m, x) => Math.max(m, x.count), 0) || 1,
    [monthlyBars]
  );

  const maxDaily = useMemo(
    () =>
      data.dailyCreatedLast7.reduce((m, x) => Math.max(m, x.count), 0) || 1,
    [data.dailyCreatedLast7]
  );

  const moderationDonut = useMemo(() => {
    const { approved, pending, denied } = data.listings;
    const t = approved + pending + denied;
    if (t <= 0) return null;
    return {
      total: t,
      gradient: conicFromSegments([
        { color: "#10B981", fraction: approved / t },
        { color: "#F59E0B", fraction: pending / t },
        { color: "#EF4444", fraction: denied / t },
      ]),
      approved,
      pending,
      denied,
    };
  }, [data.listings]);

  const transactionDonut = useMemo(() => {
    const rows = [...data.listingsByTransaction].sort(
      (a, b) => b.count - a.count
    );
    const t = rows.reduce((s, x) => s + x.count, 0);
    if (t <= 0) return null;
    const colors = [
      "#C25A2B",
      "#E8956A",
      "#3B82F6",
      "#8B5CF6",
      "#14B8A6",
      "#F59E0B",
      "#64748B",
    ];
    const segments = rows.map((r, i) => ({
      ...r,
      color: colors[i % colors.length],
      fraction: r.count / t,
    }));
    return {
      total: t,
      gradient: conicFromSegments(
        segments.map((s) => ({ color: s.color, fraction: s.fraction }))
      ),
      segments,
    };
  }, [data.listingsByTransaction]);

  const propertyDonut = useMemo(() => {
    const rows = [...data.listingsByPropertyType].sort(
      (a, b) => b.count - a.count
    );
    const t = rows.reduce((s, x) => s + x.count, 0);
    if (t <= 0) return null;
    const colors = [
      "#3B82F6",
      "#93C5FD",
      "#6366F1",
      "#A855F7",
      "#EC4899",
      "#0EA5E9",
      "#64748B",
    ];
    const segments = rows.map((r, i) => ({
      ...r,
      color: colors[i % colors.length],
      fraction: r.count / t,
    }));
    return {
      total: t,
      gradient: conicFromSegments(
        segments.map((s) => ({ color: s.color, fraction: s.fraction }))
      ),
      segments,
    };
  }, [data.listingsByPropertyType]);
  const maxAgentListings = useMemo(
    () => data.topAgents.reduce((m, x) => Math.max(m, x.listings), 0) || 1,
    [data.topAgents]
  );

  const isFiltered = data.meta?.filtered === true;
  const nDailyBars = data.dailyCreatedLast7.length;
  const nMonthlyBars = monthlyBars.length;

  const primaryKpis = [
    {
      titlu: isFiltered ? "Total anunțuri (perioadă)" : "Total anunțuri",
      valoare: formatNumber(data.listings.total),
      icon: MdHome,
      culoare: "#3B82F6",
    },
    {
      titlu: isFiltered ? "Aprobate (perioadă)" : "Aprobate",
      valoare: formatNumber(data.listings.approved),
      icon: MdCheckCircle,
      culoare: "#10B981",
    },
    {
      titlu: isFiltered ? "În așteptare (perioadă)" : "În așteptare",
      valoare: formatNumber(data.listings.pending),
      icon: MdPending,
      culoare: "#F59E0B",
    },
    {
      titlu: isFiltered ? "Rată aprobare (perioadă)" : "Rată aprobare",
      valoare: `${data.listings.approvalRatePercent.toLocaleString("ro-RO", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })}%`,
      icon: MdTrendingUp,
      culoare: "#C25A2B",
    },
  ];

  const secondaryKpis = [
    {
      titlu: isFiltered
        ? "Anunțuri noi (7 zile, până la final interval)"
        : "Anunțuri noi (7 zile)",
      valoare: formatNumber(data.newListings.last7Days),
      icon: MdAnalytics,
      culoare: "#8B5CF6",
    },
    {
      titlu: isFiltered
        ? "Anunțuri noi (30 zile, până la final interval)"
        : "Anunțuri noi (30 zile)",
      valoare: formatNumber(data.newListings.last30Days),
      icon: MdBarChart,
      culoare: "#6366F1",
    },
    {
      titlu: "Utilizatori (Clerk)",
      valoare: formatNumber(data.users.total),
      icon: MdPeople,
      culoare: "#0EA5E9",
    },
    {
      titlu: isFiltered
        ? "Utilizatori noi în perioadă"
        : "Utilizatori noi (30 zile)",
      valoare: formatNumber(data.users.newLast30Days),
      icon: MdPeople,
      culoare: "#14B8A6",
    },
    {
      titlu: "Agenți total",
      valoare: formatNumber(data.agents.total),
      icon: MdBusiness,
      culoare: "#C25A2B",
    },
    {
      titlu: isFiltered ? "Agenți cu anunțuri (perioadă)" : "Agenți cu anunțuri",
      valoare: formatNumber(data.agents.active),
      icon: MdPerson,
      culoare: "#D97706",
    },
  ];

  return (
    <div className="space-y-8 md:space-y-12">
          {error && (
            <div
              className="rounded-2xl px-4 py-3 text-sm"
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                color: "#B91C1C",
              }}
            >
              {error}
            </div>
          )}

          {analyticsFetchUrl === null ? (
            <p
              className="text-gray-500 dark:text-gray-400"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Selectează și aplică un interval personalizat pentru a vedea
              statisticile, sau alege un alt preset de mai sus.
            </p>
          ) : loading ? (
            <p
              className="text-gray-500 dark:text-gray-400"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Se încarcă statisticile…
            </p>
          ) : (
            <>
              {/* KPI principal */}
              <section>
                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                  <h2
                    className="text-2xl md:text-4xl font-bold text-foreground"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    Anunțuri și moderare
                  </h2>
                  <Link
                    href="/admin/anunturi"
                    className="text-sm font-medium text-[#C25A2B] hover:underline"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    Gestionează anunțurile →
                  </Link>
                </div>
                <div
                  className="rounded-none md:rounded-3xl overflow-hidden relative"
                  style={glassOuterStyle(isDark)}
                >
                  <GlassReflection isDark={isDark} />
                  <div className="px-4 md:px-8 py-6 md:py-8 relative z-1">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
                      {primaryKpis.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={stat.titlu}
                            className="relative flex items-center gap-4 md:gap-5 px-4 md:px-6 py-4"
                          >
                            {index > 0 && (
                              <div
                                className="absolute left-0 top-[20%] bottom-[20%] hidden lg:block"
                                style={{
                                  width: "1px",
                                  background: isDark
                                    ? "rgba(255, 255, 255, 0.08)"
                                    : "rgba(0, 0, 0, 0.06)",
                                }}
                              />
                            )}
                            {index % 2 === 1 && (
                              <div
                                className="absolute left-0 top-[20%] bottom-[20%] lg:hidden"
                                style={{
                                  width: "1px",
                                  background: isDark
                                    ? "rgba(255, 255, 255, 0.08)"
                                    : "rgba(0, 0, 0, 0.06)",
                                }}
                              />
                            )}
                            <div
                              className="w-1 self-stretch rounded-full shrink-0"
                              style={{ background: stat.culoare }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon
                                  size={16}
                                  style={{ color: stat.culoare }}
                                  className="shrink-0"
                                />
                                <span
                                  className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate"
                                  style={{ fontFamily: "var(--font-galak-regular)" }}
                                >
                                  {stat.titlu}
                                </span>
                              </div>
                              <span
                                className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-none"
                                style={{ fontFamily: "var(--font-galak-regular)" }}
                              >
                                {stat.valoare}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div
                      className="lg:hidden mx-4"
                      style={{
                        position: "absolute",
                        left: "5%",
                        right: "5%",
                        top: "50%",
                        height: "1px",
                        background: isDark
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.06)",
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* KPI secundar */}
              <section>
                <h2
                  className="text-2xl md:text-4xl font-bold mb-6 text-foreground"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Activitate recentă și comunitate
                </h2>
                <div
                  className="rounded-none md:rounded-3xl overflow-hidden relative"
                  style={glassOuterStyle(isDark)}
                >
                  <GlassReflection isDark={isDark} />
                  <div className="p-4 md:p-8 relative z-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      {secondaryKpis.map((stat) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={stat.titlu}
                            className="rounded-2xl p-4 md:p-5"
                            style={{
                              background: isDark
                                ? "rgba(35, 35, 48, 0.45)"
                                : "rgba(255, 255, 255, 0.55)",
                              border: isDark
                                ? "1px solid rgba(255, 255, 255, 0.1)"
                                : "1px solid rgba(255, 255, 255, 0.45)",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Icon size={18} style={{ color: stat.culoare }} />
                              <span
                                className="text-xs md:text-sm text-gray-500 dark:text-gray-400"
                                style={{ fontFamily: "var(--font-galak-regular)" }}
                              >
                                {stat.titlu}
                              </span>
                            </div>
                            <p
                              className="text-2xl md:text-3xl font-bold text-foreground"
                              style={{ fontFamily: "var(--font-galak-regular)" }}
                            >
                              {stat.valoare}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* Grafice: moderare, 7 zile, donut-uri */}
              <section>
                <h2
                  className="text-2xl md:text-4xl font-bold mb-6 text-foreground"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Vizualizări
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                  <div
                    className="rounded-none md:rounded-3xl overflow-hidden relative"
                    style={glassOuterStyle(isDark)}
                  >
                    <GlassReflection isDark={isDark} />
                    <div className="p-4 md:p-8 relative z-1">
                      <div className="flex items-center gap-2 mb-6">
                        <MdDonutLarge className="text-[#C25A2B]" size={24} />
                        <h3
                          className="text-lg md:text-xl font-bold text-foreground"
                          style={{ fontFamily: "var(--font-galak-regular)" }}
                        >
                          Stare anunțuri
                          {isFiltered ? " (în perioadă)" : " (total)"}
                        </h3>
                      </div>
                      {!moderationDonut ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Nu există anunțuri în baza de date.
                        </p>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                          <div className="relative w-44 h-44 shrink-0">
                            <div
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: moderationDonut.gradient,
                              }}
                            />
                            <div
                              className="absolute inset-[20%] rounded-full flex items-center justify-center"
                              style={{
                                background: isDark
                                  ? "rgba(35, 35, 48, 0.95)"
                                  : "rgba(255, 255, 255, 0.95)",
                                boxShadow: isDark
                                  ? "inset 0 0 0 1px rgba(255,255,255,0.08)"
                                  : "inset 0 0 0 1px rgba(0,0,0,0.06)",
                              }}
                            >
                              <span
                                className="text-center text-sm font-bold text-foreground px-2"
                                style={{
                                  fontFamily: "var(--font-galak-regular)",
                                }}
                              >
                                {formatNumber(moderationDonut.total)}
                                <br />
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                  total
                                </span>
                              </span>
                            </div>
                          </div>
                          <ul className="flex-1 space-y-3 text-sm w-full max-w-sm">
                            <li className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ background: "#10B981" }}
                                />
                                Aprobate
                              </span>
                              <span className="font-semibold tabular-nums">
                                {formatNumber(moderationDonut.approved)} (
                                {((moderationDonut.approved / moderationDonut.total) * 100).toFixed(1)}%)
                              </span>
                            </li>
                            <li className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ background: "#F59E0B" }}
                                />
                                În așteptare
                              </span>
                              <span className="font-semibold tabular-nums">
                                {formatNumber(moderationDonut.pending)} (
                                {((moderationDonut.pending / moderationDonut.total) * 100).toFixed(1)}%)
                              </span>
                            </li>
                            <li className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ background: "#EF4444" }}
                                />
                                Respinse
                              </span>
                              <span className="font-semibold tabular-nums">
                                {formatNumber(moderationDonut.denied)} (
                                {((moderationDonut.denied / moderationDonut.total) * 100).toFixed(1)}%)
                              </span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="rounded-none md:rounded-3xl overflow-hidden relative"
                    style={glassOuterStyle(isDark)}
                  >
                    <GlassReflection isDark={isDark} />
                    <div className="p-4 md:p-8 relative z-1">
                      <div className="flex items-center gap-2 mb-6">
                        <MdShowChart className="text-[#6366F1]" size={24} />
                        <h3
                          className="text-lg md:text-xl font-bold text-foreground"
                          style={{ fontFamily: "var(--font-galak-regular)" }}
                        >
                          Anunțuri create pe zi ({nDailyBars}{" "}
                          {nDailyBars === 1 ? "zi" : "zile"}, UTC)
                        </h3>
                      </div>
                      {data.dailyCreatedLast7.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Nu există date.
                        </p>
                      ) : (
                        <div className="flex items-end justify-between gap-1 sm:gap-2 min-h-[140px] px-0 pt-4">
                          {data.dailyCreatedLast7.map((d) => {
                            const barPx = Math.round(
                              maxDaily
                                ? Math.max(4, (d.count / maxDaily) * 100)
                                : 0
                            );
                            return (
                              <div
                                key={d.key}
                                className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0"
                              >
                                <span
                                  className="text-[10px] sm:text-xs font-semibold text-foreground tabular-nums"
                                  style={{
                                    fontFamily: "var(--font-galak-regular)",
                                  }}
                                >
                                  {d.count}
                                </span>
                                <div
                                  className="w-full max-w-[40px] mx-auto rounded-t-md shrink-0"
                                  style={{
                                    height: `${barPx}px`,
                                    minHeight: d.count > 0 ? 6 : 2,
                                    background:
                                      "linear-gradient(180deg, #6366F1, rgba(99,102,241,0.35))",
                                  }}
                                />
                                <span
                                  className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight"
                                  style={{
                                    fontFamily: "var(--font-galak-regular)",
                                  }}
                                >
                                  {d.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  <div
                    className="rounded-none md:rounded-3xl overflow-hidden relative"
                    style={glassOuterStyle(isDark)}
                  >
                    <GlassReflection isDark={isDark} />
                    <div className="p-4 md:p-8 relative z-1">
                      <h3
                        className="text-lg md:text-xl font-bold text-foreground mb-6"
                        style={{ fontFamily: "var(--font-galak-regular)" }}
                      >
                        Tip tranzacție (grafic circular)
                      </h3>
                      {!transactionDonut ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Nu există date încă.
                        </p>
                      ) : (
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          <div className="relative w-40 h-40 shrink-0">
                            <div
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: transactionDonut.gradient,
                              }}
                            />
                            <div
                              className="absolute inset-[20%] rounded-full"
                              style={{
                                background: isDark
                                  ? "rgba(35, 35, 48, 0.95)"
                                  : "rgba(255, 255, 255, 0.95)",
                              }}
                            />
                          </div>
                          <ul className="flex-1 space-y-2 text-xs sm:text-sm max-h-48 overflow-y-auto pr-1 w-full">
                            {transactionDonut.segments.map((s, i) => (
                              <li
                                key={`txd-${i}-${s.transactionType}`}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ background: s.color }}
                                  />
                                  <span className="truncate">
                                    {s.transactionType}
                                  </span>
                                </span>
                                <span className="tabular-nums shrink-0">
                                  {formatNumber(s.count)} (
                                  {(s.fraction * 100).toFixed(1)}%)
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="rounded-none md:rounded-3xl overflow-hidden relative"
                    style={glassOuterStyle(isDark)}
                  >
                    <GlassReflection isDark={isDark} />
                    <div className="p-4 md:p-8 relative z-1">
                      <h3
                        className="text-lg md:text-xl font-bold text-foreground mb-6"
                        style={{ fontFamily: "var(--font-galak-regular)" }}
                      >
                        Tip proprietate (grafic circular)
                      </h3>
                      {!propertyDonut ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Nu există date încă.
                        </p>
                      ) : (
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          <div className="relative w-40 h-40 shrink-0">
                            <div
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: propertyDonut.gradient,
                              }}
                            />
                            <div
                              className="absolute inset-[20%] rounded-full"
                              style={{
                                background: isDark
                                  ? "rgba(35, 35, 48, 0.95)"
                                  : "rgba(255, 255, 255, 0.95)",
                              }}
                            />
                          </div>
                          <ul className="flex-1 space-y-2 text-xs sm:text-sm max-h-48 overflow-y-auto pr-1 w-full">
                            {propertyDonut.segments.map((s, i) => (
                              <li
                                key={`ptd-${i}-${s.propertyType}`}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ background: s.color }}
                                  />
                                  <span className="truncate">
                                    {s.propertyType}
                                  </span>
                                </span>
                                <span className="tabular-nums shrink-0">
                                  {formatNumber(s.count)} (
                                  {(s.fraction * 100).toFixed(1)}%)
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Tip tranzacție */}
                <section
                  className="rounded-none md:rounded-3xl overflow-hidden relative"
                  style={glassOuterStyle(isDark)}
                >
                  <GlassReflection isDark={isDark} />
                  <div className="p-4 md:p-8 relative z-1">
                    <h3
                      className="text-lg md:text-xl font-bold text-foreground mb-6"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Distribuție după tip tranzacție (bare)
                    </h3>
                    {data.listingsByTransaction.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nu există date încă.
                      </p>
                    ) : (
                      <ul className="space-y-4">
                        {data.listingsByTransaction
                          .slice()
                          .sort((a, b) => b.count - a.count)
                          .map((row, idx) => (
                            <li
                              key={`tx-${idx}-${String(row.transactionType)}`}
                            >
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-foreground font-medium truncate pr-2">
                                  {row.transactionType}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 shrink-0">
                                  {formatNumber(row.count)}
                                </span>
                              </div>
                              <div
                                className="h-2 rounded-full overflow-hidden"
                                style={{
                                  background: isDark
                                    ? "rgba(255,255,255,0.08)"
                                    : "rgba(0,0,0,0.06)",
                                }}
                              >
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${(row.count / maxTransaction) * 100}%`,
                                    background:
                                      "linear-gradient(90deg, #C25A2B, #E8956A)",
                                  }}
                                />
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </section>

                {/* Tip proprietate */}
                <section
                  className="rounded-none md:rounded-3xl overflow-hidden relative"
                  style={glassOuterStyle(isDark)}
                >
                  <GlassReflection isDark={isDark} />
                  <div className="p-4 md:p-8 relative z-1">
                    <h3
                      className="text-lg md:text-xl font-bold text-foreground mb-6"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Distribuție după tip proprietate (bare)
                    </h3>
                    {data.listingsByPropertyType.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nu există date încă.
                      </p>
                    ) : (
                      <ul className="space-y-4">
                        {data.listingsByPropertyType
                          .slice()
                          .sort((a, b) => b.count - a.count)
                          .map((row, idx) => (
                            <li
                              key={`pt-${idx}-${String(row.propertyType)}`}
                            >
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-foreground font-medium truncate pr-2">
                                  {row.propertyType}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 shrink-0">
                                  {formatNumber(row.count)}
                                </span>
                              </div>
                              <div
                                className="h-2 rounded-full overflow-hidden"
                                style={{
                                  background: isDark
                                    ? "rgba(255,255,255,0.08)"
                                    : "rgba(0,0,0,0.06)",
                                }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${(row.count / maxProperty) * 100}%`,
                                    background:
                                      "linear-gradient(90deg, #3B82F6, #93C5FD)",
                                  }}
                                />
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </section>
              </div>

              {/* Sectoare + prețuri */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <section
                  className="rounded-none md:rounded-3xl overflow-hidden relative"
                  style={glassOuterStyle(isDark)}
                >
                  <GlassReflection isDark={isDark} />
                  <div className="p-4 md:p-8 relative z-1">
                    <div className="flex items-center gap-2 mb-6">
                      <MdLocationOn className="text-[#C25A2B]" size={22} />
                      <h3
                        className="text-lg md:text-xl font-bold text-foreground"
                        style={{ fontFamily: "var(--font-galak-regular)" }}
                      >
                        Top zone / sectoare
                      </h3>
                    </div>
                    {data.topSectors.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Completează câmpul sector la anunțuri pentru statistici
                        geografice.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {data.topSectors.map((row, i) => (
                          <li
                            key={`sec-${i}-${String(row.sector)}`}
                            className="flex items-center gap-3 text-sm"
                          >
                            <span
                              className="w-6 text-gray-500 dark:text-gray-400 tabular-nums"
                              style={{ fontFamily: "var(--font-galak-regular)" }}
                            >
                              {i + 1}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between gap-2 mb-1">
                                <span className="font-medium text-foreground truncate">
                                  {row.sector}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 shrink-0">
                                  {formatNumber(row.count)}
                                </span>
                              </div>
                              <div
                                className="h-1.5 rounded-full overflow-hidden"
                                style={{
                                  background: isDark
                                    ? "rgba(255,255,255,0.08)"
                                    : "rgba(0,0,0,0.06)",
                                }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${(row.count / maxSector) * 100}%`,
                                    background: "#C25A2B",
                                  }}
                                />
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>

                <section
                  className="rounded-none md:rounded-3xl overflow-hidden relative"
                  style={glassOuterStyle(isDark)}
                >
                  <GlassReflection isDark={isDark} />
                  <div className="p-4 md:p-8 relative z-1">
                    <div className="flex items-center gap-2 mb-6">
                      <MdAttachMoney className="text-[#10B981]" size={22} />
                      <h3
                        className="text-lg md:text-xl font-bold text-foreground"
                        style={{ fontFamily: "var(--font-galak-regular)" }}
                      >
                        Preț mediu (anunțuri aprobate)
                      </h3>
                    </div>
                    {data.priceByCurrencyApproved.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nu există anunțuri aprobate cu preț.
                      </p>
                    ) : (
                      <ul className="space-y-4">
                        {data.priceByCurrencyApproved.map((row, idx) => (
                          <li
                            key={`cur-${idx}-${String(row.currency)}`}
                            className="rounded-xl p-4"
                            style={{
                              background: isDark
                                ? "rgba(16, 185, 129, 0.08)"
                                : "rgba(16, 185, 129, 0.06)",
                              border: "1px solid rgba(16, 185, 129, 0.2)",
                            }}
                          >
                            <p
                              className="text-xs text-gray-500 dark:text-gray-400 mb-1"
                              style={{ fontFamily: "var(--font-galak-regular)" }}
                            >
                              Monedă: {row.currency}
                            </p>
                            <p
                              className="text-2xl font-bold text-foreground"
                              style={{ fontFamily: "var(--font-galak-regular)" }}
                            >
                              {formatPrice(row.avgPrice, row.currency)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              pe baza a {formatNumber(row.count)} anunț
                              {row.count === 1 ? "" : "uri"}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              </div>

              {/* Evoluție 6 luni + agenți */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <section
                  className="rounded-none md:rounded-3xl overflow-hidden relative"
                  style={glassOuterStyle(isDark)}
                >
                  <GlassReflection isDark={isDark} />
                  <div className="p-4 md:p-8 relative z-1">
                    <h3
                      className="text-lg md:text-xl font-bold text-foreground mb-6"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Anunțuri create pe lună ({nMonthlyBars}{" "}
                      {nMonthlyBars === 1 ? "lună" : "luni"}, UTC)
                    </h3>
                    {monthlyBars.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nu există încă suficient istoric.
                      </p>
                    ) : (
                      <div className="flex items-end justify-between gap-2 min-h-[160px] px-1 pt-6">
                        {monthlyBars.map((m, idx) => {
                          const barPx = Math.round(
                            maxMonthly
                              ? Math.max(6, (m.count / maxMonthly) * 120)
                              : 0
                          );
                          return (
                            <div
                              key={`mo-${idx}-${m.key ?? m.label}`}
                              className="flex-1 flex flex-col items-center justify-end gap-2 min-w-0"
                            >
                              <span
                                className="text-xs font-semibold text-foreground tabular-nums"
                                style={{ fontFamily: "var(--font-galak-regular)" }}
                              >
                                {m.count}
                              </span>
                              <div
                                className="w-full max-w-[48px] mx-auto rounded-t-md transition-all shrink-0"
                                style={{
                                  height: `${barPx}px`,
                                  background:
                                    "linear-gradient(180deg, #C25A2B, rgba(194,90,43,0.35))",
                                }}
                              />
                              <span
                                className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 text-center leading-tight px-0.5"
                                style={{
                                  fontFamily: "var(--font-galak-regular)",
                                }}
                              >
                                {m.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>

                <section
                  className="rounded-none md:rounded-3xl overflow-hidden relative"
                  style={glassOuterStyle(isDark)}
                >
                  <GlassReflection isDark={isDark} />
                  <div className="p-4 md:p-8 relative z-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                      <h3
                        className="text-lg md:text-xl font-bold text-foreground"
                        style={{ fontFamily: "var(--font-galak-regular)" }}
                      >
                        Top agenți după număr de anunțuri
                      </h3>
                      <Link
                        href="/admin/agenti"
                        className="text-sm font-medium text-[#C25A2B] hover:underline"
                        style={{ fontFamily: "var(--font-galak-regular)" }}
                      >
                        Agenți →
                      </Link>
                    </div>
                    {data.topAgents.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nu există agenți cu anunțuri încă.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {data.topAgents.map((a, i) => (
                          <li
                            key={a.id ? `ag-${a.id}` : `ag-${i}`}
                            className="flex items-center gap-3"
                          >
                            <span className="text-gray-500 dark:text-gray-400 w-6 text-sm">
                              {i + 1}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between gap-2 text-sm mb-1">
                                <span className="font-medium text-foreground truncate">
                                  {a.name}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 shrink-0">
                                  {formatNumber(a.listings)} anunț
                                  {a.listings === 1 ? "" : "uri"}
                                </span>
                              </div>
                              <div
                                className="h-1.5 rounded-full overflow-hidden"
                                style={{
                                  background: isDark
                                    ? "rgba(255,255,255,0.08)"
                                    : "rgba(0,0,0,0.06)",
                                }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${(a.listings / maxAgentListings) * 100}%`,
                                    background:
                                      "linear-gradient(90deg, #D97706, #FBBF24)",
                                  }}
                                />
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              </div>

              {/* Rezumat moderare */}
              <section
                className="rounded-none md:rounded-3xl overflow-hidden relative"
                style={glassOuterStyle(isDark)}
              >
                <GlassReflection isDark={isDark} />
                <div className="p-4 md:p-8 relative z-1">
                  <h3
                    className="text-lg md:text-xl font-bold text-foreground mb-4"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    Pipeline moderare
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div
                      className="rounded-xl p-4 flex items-center gap-3"
                      style={{
                        background: isDark
                          ? "rgba(245, 158, 11, 0.12)"
                          : "rgba(245, 158, 11, 0.1)",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                      }}
                    >
                      <MdPending className="text-amber-500 shrink-0" size={28} />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          În așteptare
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {formatNumber(data.listings.pending)}
                        </p>
                      </div>
                    </div>
                    <div
                      className="rounded-xl p-4 flex items-center gap-3"
                      style={{
                        background: isDark
                          ? "rgba(16, 185, 129, 0.12)"
                          : "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                      }}
                    >
                      <MdCheckCircle
                        className="text-emerald-500 shrink-0"
                        size={28}
                      />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Aprobate
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {formatNumber(data.listings.approved)}
                        </p>
                      </div>
                    </div>
                    <div
                      className="rounded-xl p-4 flex items-center gap-3"
                      style={{
                        background: isDark
                          ? "rgba(239, 68, 68, 0.12)"
                          : "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                      }}
                    >
                      <MdCancel className="text-red-500 shrink-0" size={28} />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Respinse
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {formatNumber(data.listings.denied)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
    </div>
  );
}
