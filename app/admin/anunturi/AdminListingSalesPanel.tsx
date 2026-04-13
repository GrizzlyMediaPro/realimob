"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type AgentS = { id: string; name: string; email: string | null };
type Row = {
  id: string;
  title: string;
  transactionType: string;
  price: number;
  currency: string;
  status: string;
  saleContractUrl: string | null;
  saleContractFileName: string | null;
  saleSubmittedAt: string | null;
  saleVerifiedAt: string | null;
  saleRejectedAt: string | null;
  saleRejectionNote: string | null;
  agent: AgentS | null;
};

export default function AdminListingSalesPanel({ isDark }: { isDark: boolean }) {
  const [tab, setTab] = useState<"pending" | "istoric">("pending");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = tab === "pending" ? "status=pending" : "status=istoric";
      const r = await fetch(`/api/admin/listing-sales?${q}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Eroare");
      const list = (j.listings ?? []) as Record<string, unknown>[];
      setRows(
        list.map((l) => ({
          id: String(l.id),
          title: String(l.title ?? ""),
          transactionType: String(l.transactionType ?? ""),
          price: Number(l.price ?? 0),
          currency: String(l.currency ?? "RON"),
          status: String(l.status ?? ""),
          saleContractUrl: (l.saleContractUrl as string) ?? null,
          saleContractFileName: (l.saleContractFileName as string) ?? null,
          saleSubmittedAt: l.saleSubmittedAt
            ? new Date(l.saleSubmittedAt as string).toISOString()
            : null,
          saleVerifiedAt: l.saleVerifiedAt
            ? new Date(l.saleVerifiedAt as string).toISOString()
            : null,
          saleRejectedAt: l.saleRejectedAt
            ? new Date(l.saleRejectedAt as string).toISOString()
            : null,
          saleRejectionNote: (l.saleRejectionNote as string) ?? null,
          agent: l.agent
            ? {
                id: String((l.agent as AgentS).id),
                name: String((l.agent as AgentS).name),
                email: (l.agent as AgentS).email ?? null,
              }
            : null,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (listingId: string, action: "approve" | "reject") => {
    setActionId(listingId);
    setError(null);
    try {
      const r = await fetch("/api/admin/listing-sales", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          action,
          note: action === "reject" ? rejectNote[listingId] ?? "" : undefined,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Eroare");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setActionId(null);
    }
  };

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
            Verificare vânzări
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                tab === "pending"
                  ? "bg-[#C25A2B] text-white"
                  : "border border-black/10 dark:border-white/15"
              }`}
            >
              În așteptare
            </button>
            <button
              type="button"
              onClick={() => setTab("istoric")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                tab === "istoric"
                  ? "bg-[#C25A2B] text-white"
                  : "border border-black/10 dark:border-white/15"
              }`}
            >
              Istoric
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="px-3 py-1.5 rounded-lg text-sm border border-black/10 dark:border-white/15"
            >
              Reîncarcă
            </button>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-500 py-8 text-center">Se încarcă…</p>}
        {error && <p className="text-sm text-red-600 dark:text-red-400 py-2">{error}</p>}
        {!loading && rows.length === 0 && (
          <p className="text-sm text-gray-500 py-8 text-center">
            {tab === "pending"
              ? "Nu există contracte în așteptare."
              : "Nu există înregistrări recente."}
          </p>
        )}
        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto -mx-2 space-y-4">
            {rows.map((row) => (
              <div
                key={`${row.id}-${row.saleSubmittedAt ?? ""}-${row.saleVerifiedAt ?? ""}-${row.saleRejectedAt ?? ""}`}
                className="rounded-xl border border-black/10 dark:border-white/10 p-4 text-sm"
              >
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{row.title}</p>
                    <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mt-0.5 break-all">
                      ID anunț: {row.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {row.transactionType} · {row.price.toLocaleString("ro-RO")}{" "}
                      {row.currency}
                    </p>
                    <p className="text-xs text-gray-500">
                      Agent: {row.agent?.name ?? "—"}{" "}
                      {row.agent?.email ? `(${row.agent.email})` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/admin/anunturi/preview/${row.id}`}
                    className="text-xs text-[#C25A2B] hover:underline shrink-0"
                  >
                    Preview anunț
                  </Link>
                </div>
                {tab === "pending" && row.saleContractUrl && (
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <a
                      href={row.saleContractUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-[#C25A2B] underline"
                    >
                      Deschide contractul
                    </a>
                    <span className="text-xs text-gray-500">
                      {row.saleContractFileName ?? ""} · trimis{" "}
                      {row.saleSubmittedAt
                        ? new Date(row.saleSubmittedAt).toLocaleString("ro-RO", {
                            timeZone: "Europe/Bucharest",
                          })
                        : "—"}
                    </span>
                  </div>
                )}
                {tab === "istoric" && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 space-y-1">
                    {row.saleContractUrl && row.status === "sold" && (
                      <p>
                        <a
                          href={row.saleContractUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-[#C25A2B] underline"
                        >
                          Contract depus
                        </a>
                        {row.saleContractFileName ? ` · ${row.saleContractFileName}` : ""}
                      </p>
                    )}
                    {row.saleVerifiedAt && (
                      <p className="text-emerald-600 dark:text-emerald-400">
                        Aprobat · anunț inactiv (vândut) ·{" "}
                        {new Date(row.saleVerifiedAt).toLocaleString("ro-RO", {
                          timeZone: "Europe/Bucharest",
                        })}
                      </p>
                    )}
                    {row.saleRejectedAt && (
                      <p className="text-amber-700 dark:text-amber-300">
                        Respins ·{" "}
                        {new Date(row.saleRejectedAt).toLocaleString("ro-RO", {
                          timeZone: "Europe/Bucharest",
                        })}
                        {row.saleRejectionNote ? ` — ${row.saleRejectionNote}` : ""}
                      </p>
                    )}
                  </div>
                )}
                {tab === "pending" && (
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs text-gray-500 block mb-1">
                        Motiv respingere (opțional)
                      </label>
                      <input
                        type="text"
                        value={rejectNote[row.id] ?? ""}
                        onChange={(e) =>
                          setRejectNote((m) => ({ ...m, [row.id]: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/15 bg-white/50 dark:bg-black/20 text-sm"
                        placeholder="Ex.: document ilizibil"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={actionId === row.id}
                        onClick={() => patch(row.id, "approve")}
                        className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 disabled:opacity-50"
                      >
                        Aprobă (marchează vândut)
                      </button>
                      <button
                        type="button"
                        disabled={actionId === row.id}
                        onClick={() => patch(row.id, "reject")}
                        className="px-3 py-2 rounded-lg text-sm font-semibold border border-red-500/40 text-red-600 dark:text-red-400 disabled:opacity-50"
                      >
                        Respinge
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
