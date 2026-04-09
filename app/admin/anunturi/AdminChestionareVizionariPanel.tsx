"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  formatAgentQuestionnaireForDisplay,
  formatClientQuestionnaireForDisplay,
} from "@/lib/viewing-questionnaire-display";

type Row = {
  id: string;
  createdAt: string;
  clientEmail: string;
  agentSubmittedAt: string | null;
  clientSubmittedAt: string | null;
  agentAnswers: unknown;
  clientAnswers: unknown;
  listing: { id: string; title: string; transactionType: string };
  agent: { id: string; name: string; email: string | null };
  viewingRequest: {
    id: string;
    startAt: string;
    endAt: string;
    clientName: string;
    clientEmail: string;
    status: string;
  };
};

export default function AdminChestionareVizionariPanel({
  isDark,
}: {
  isDark: boolean;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/viewing-questionnaires", {
        cache: "no-store",
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Eroare");
      setRows(j.questionnaires ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div
      className="rounded-2xl md:rounded-3xl overflow-hidden relative"
      style={{
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
      }}
    >
      <div className="p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2
            className="text-xl md:text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            Chestionare vizionări
          </h2>
          <button
            type="button"
            onClick={() => void load()}
            className="text-sm px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/15 hover:opacity-90"
          >
            Reîncarcă
          </button>
        </div>
        {loading && (
          <p className="text-sm text-gray-500 py-8 text-center">Se încarcă…</p>
        )}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 py-4">{error}</p>
        )}
        {!loading && !error && rows.length === 0 && (
          <p className="text-sm text-gray-500 py-8 text-center">
            Nu există încă chestionare generate (după vizionări încheiate).
          </p>
        )}
        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto -mx-2">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-3 font-medium">Anunț</th>
                  <th className="py-2 pr-3 font-medium">Agent</th>
                  <th className="py-2 pr-3 font-medium">Client</th>
                  <th className="py-2 pr-3 font-medium">Vizionare</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium">Detalii</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-black/5 dark:border-white/5 align-top"
                  >
                    <td className="py-3 pr-3 max-w-[200px]">
                      <Link
                        href={`/admin/anunturi/preview/${r.listing.id}`}
                        className="text-[#C25A2B] hover:underline font-medium line-clamp-2"
                      >
                        {r.listing.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.listing.transactionType}
                      </p>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-medium">{r.agent.name}</p>
                      <p className="text-xs text-gray-500 break-all">
                        {r.agent.email ?? "—"}
                      </p>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-medium">{r.viewingRequest.clientName}</p>
                      <p className="text-xs text-gray-500 break-all">
                        {r.viewingRequest.clientEmail}
                      </p>
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                      {new Date(r.viewingRequest.startAt).toLocaleString("ro-RO", {
                        timeZone: "Europe/Bucharest",
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-3 pr-3 text-xs">
                      <span
                        className={
                          r.agentSubmittedAt && r.clientSubmittedAt
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        }
                      >
                        Agent: {r.agentSubmittedAt ? "✓" : "—"} · Client:{" "}
                        {r.clientSubmittedAt ? "✓" : "—"}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-700 dark:text-gray-300 max-w-[min(100vw-2rem,380px)]">
                      <details>
                        <summary className="cursor-pointer text-[#C25A2B] font-sans font-medium">
                          Vezi răspunsuri
                        </summary>
                        <div className="mt-2 space-y-3 max-h-72 overflow-y-auto pr-1">
                          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] p-2.5">
                            <p className="font-sans text-[11px] font-semibold text-foreground mb-2">
                              Agent
                            </p>
                            <dl className="space-y-1.5">
                              {formatAgentQuestionnaireForDisplay(r.agentAnswers).map(
                                ({ label, value }) => (
                                  <div key={label}>
                                    <dt className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                      {label}
                                    </dt>
                                    <dd className="text-[11px] whitespace-pre-wrap break-words mt-0.5">
                                      {value || "—"}
                                    </dd>
                                  </div>
                                ),
                              )}
                            </dl>
                          </div>
                          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] p-2.5">
                            <p className="font-sans text-[11px] font-semibold text-foreground mb-2">
                              Client
                            </p>
                            <dl className="space-y-1.5">
                              {formatClientQuestionnaireForDisplay(r.clientAnswers).map(
                                ({ label, value }) => (
                                  <div key={label}>
                                    <dt className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                      {label}
                                    </dt>
                                    <dd className="text-[11px] whitespace-pre-wrap break-words mt-0.5">
                                      {value || "—"}
                                    </dd>
                                  </div>
                                ),
                              )}
                            </dl>
                          </div>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
