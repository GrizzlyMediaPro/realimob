"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import {
  MdDescription,
  MdPictureAsPdf,
  MdTableChart,
  MdRefresh,
  MdAnalytics,
} from "react-icons/md";
import {
  downloadAnalyticsCsv,
  downloadAnalyticsPdf,
  type ReportAnalyticsPayload,
} from "@/lib/adminReportExport";

const EMPTY: ReportAnalyticsPayload = {
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

export function AdminRapoartePanel({
  analyticsFetchUrl,
}: {
  analyticsFetchUrl: string | null;
}) {
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState<ReportAnalyticsPayload>(EMPTY);
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
        throw new Error(payload?.error || "Nu am putut încărca datele pentru raport.");
      }
      setData(payload as ReportAnalyticsPayload);
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
  const formatScore = (n: number | null) =>
    n == null ? "—" : (Math.round(n * 10) / 10).toLocaleString("ro-RO");

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

          <section
            className="rounded-none md:rounded-3xl overflow-hidden relative"
            style={glassOuterStyle(isDark)}
          >
            <GlassReflection isDark={isDark} />
            <div className="relative z-[1] px-4 md:px-8 py-6 md:py-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h2
                    className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    <MdDescription className="text-[#C25A2B]" size={26} />
                    Raport analitic platformă
                  </h2>
                  <p
                    className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    Aceleași agregări ca în tab-ul Statistici: anunțuri, agenți,
                    utilizatori, distribuții și evoluții recente.
                    {data.meta?.filtered && data.meta.from && data.meta.to ? (
                      <>
                        {" "}
                        <span className="text-foreground/80">
                          Perioadă activă (UTC): {data.meta.from.slice(0, 10)} —{" "}
                          {data.meta.to.slice(0, 10)}.
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void load()}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50"
                    style={{
                      fontFamily: "var(--font-galak-regular)",
                      borderColor: isDark
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(0,0,0,0.1)",
                      background: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.5)",
                    }}
                  >
                    <MdRefresh size={18} />
                    Reîncarcă datele
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadAnalyticsCsv(data)}
                    disabled={
                      loading || !!error || analyticsFetchUrl === null
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#C25A2B] hover:bg-[#a84d24] transition-colors disabled:opacity-50"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    <MdTableChart size={18} />
                    Descarcă CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadAnalyticsPdf(data)}
                    disabled={
                      loading || !!error || analyticsFetchUrl === null
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-[#C25A2B] text-[#C25A2B] hover:bg-[#C25A2B]/10 transition-colors disabled:opacity-50"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    <MdPictureAsPdf size={18} />
                    Descarcă PDF
                  </button>
                </div>
              </div>

              {analyticsFetchUrl === null ? (
                <p
                  className="text-gray-500 dark:text-gray-400"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Aplică un interval personalizat (ambele date) pentru a genera
                  raportul, sau comută la un alt preset.
                </p>
              ) : loading ? (
                <p
                  className="text-gray-500 dark:text-gray-400"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Se încarcă datele pentru raport…
                </p>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total anunțuri", value: formatNumber(data.listings.total) },
                      { label: "Aprobate", value: formatNumber(data.listings.approved) },
                      {
                        label: "Rată aprobare",
                        value: `${data.listings.approvalRatePercent.toLocaleString("ro-RO", { maximumFractionDigits: 1 })}%`,
                      },
                      {
                        label: "Utilizatori",
                        value: formatNumber(data.users.total),
                      },
                    ].map((k) => (
                      <div
                        key={k.label}
                        className="rounded-xl px-4 py-3"
                        style={{
                          background: isDark
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(0,0,0,0.03)",
                          border: isDark
                            ? "1px solid rgba(255,255,255,0.08)"
                            : "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <div
                          className="text-xs text-gray-500 dark:text-gray-400 mb-1"
                          style={{ fontFamily: "var(--font-galak-regular)" }}
                        >
                          {k.label}
                        </div>
                        <div
                          className="text-lg font-semibold tabular-nums"
                          style={{ fontFamily: "var(--font-galak-regular)" }}
                        >
                          {k.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3
                        className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"
                        style={{ fontFamily: "var(--font-galak-regular)" }}
                      >
                        <MdAnalytics className="text-[#C25A2B]" size={18} />
                        După tip tranzacție
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/10">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-black/[0.03] dark:bg-white/[0.06]">
                              <th
                                className="text-left px-3 py-2 font-medium"
                                style={{ fontFamily: "var(--font-galak-regular)" }}
                              >
                                Tip
                              </th>
                              <th
                                className="text-right px-3 py-2 font-medium"
                                style={{ fontFamily: "var(--font-galak-regular)" }}
                              >
                                Număr
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.listingsByTransaction.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={2}
                                  className="px-3 py-4 text-gray-500 text-center"
                                  style={{ fontFamily: "var(--font-galak-regular)" }}
                                >
                                  Nu există date.
                                </td>
                              </tr>
                            ) : (
                              data.listingsByTransaction.map((r) => (
                                <tr
                                  key={r.transactionType}
                                  className="border-t border-black/5 dark:border-white/10"
                                >
                                  <td
                                    className="px-3 py-2"
                                    style={{ fontFamily: "var(--font-galak-regular)" }}
                                  >
                                    {r.transactionType}
                                  </td>
                                  <td
                                    className="px-3 py-2 text-right tabular-nums"
                                    style={{ fontFamily: "var(--font-galak-regular)" }}
                                  >
                                    {formatNumber(r.count)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3
                        className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"
                        style={{ fontFamily: "var(--font-galak-regular)" }}
                      >
                        <MdAnalytics className="text-[#C25A2B]" size={18} />
                        Top agenți
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/10">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-black/[0.03] dark:bg-white/[0.06]">
                              <th
                                className="text-left px-3 py-2 font-medium"
                                style={{ fontFamily: "var(--font-galak-regular)" }}
                              >
                                Agent
                              </th>
                              <th
                                className="text-right px-3 py-2 font-medium"
                                style={{ fontFamily: "var(--font-galak-regular)" }}
                              >
                                Anunțuri
                              </th>
                              <th
                                className="text-right px-3 py-2 font-medium"
                                style={{ fontFamily: "var(--font-galak-regular)" }}
                              >
                                Scor vânzări
                              </th>
                              <th
                                className="text-right px-3 py-2 font-medium"
                                style={{ fontFamily: "var(--font-galak-regular)" }}
                              >
                                Scor închirieri
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.topAgents.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-3 py-4 text-gray-500 text-center"
                                  style={{ fontFamily: "var(--font-galak-regular)" }}
                                >
                                  Nu există date.
                                </td>
                              </tr>
                            ) : (
                              data.topAgents.map((r) => (
                                <tr
                                  key={r.id}
                                  className="border-t border-black/5 dark:border-white/10"
                                >
                                  <td
                                    className="px-3 py-2"
                                    style={{ fontFamily: "var(--font-galak-regular)" }}
                                  >
                                    {r.name}
                                  </td>
                                  <td
                                    className="px-3 py-2 text-right tabular-nums"
                                    style={{ fontFamily: "var(--font-galak-regular)" }}
                                  >
                                    {formatNumber(r.listings)}
                                  </td>
                                  <td
                                    className="px-3 py-2 text-right tabular-nums"
                                    style={{ fontFamily: "var(--font-galak-regular)" }}
                                  >
                                    {formatScore(r.scorVanzari)}
                                  </td>
                                  <td
                                    className="px-3 py-2 text-right tabular-nums"
                                    style={{ fontFamily: "var(--font-galak-regular)" }}
                                  >
                                    {formatScore(r.scorInchirieri)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <p
                    className="text-xs text-gray-500 dark:text-gray-400"
                    style={{ fontFamily: "var(--font-galak-regular)" }}
                  >
                    Fișierele exportate includ și tabelele complete: tip proprietate,
                    sectoare, prețuri medii pe monedă, evoluție lunară și zilnică —
                    aceleași secțiuni ca în exportul CSV/PDF.
                  </p>

                </div>
              )}
            </div>
          </section>
    </div>
  );
}
