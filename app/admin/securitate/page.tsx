"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  MdArrowBack,
  MdSearch,
  MdFilterList,
  MdClose,
  MdPerson,
  MdEmail,
  MdPhone,
  MdSecurity,
  MdAdminPanelSettings,
  MdBusiness,
  MdPeople,
  MdBlock,
} from "react-icons/md";
import Link from "next/link";

type SecurityUser = {
  id: string;
  nume: string;
  email: string;
  telefon?: string;
  esteAdministrator: boolean;
  esteAgent: boolean;
  statusAgent: string;
  rolAfisat: string;
  permisiuni: string[];
  contSuspendat: boolean;
  dataInregistrare: string;
};

type Statistici = {
  total: number;
  administratori: number;
  agenti: number;
  agentiAprobati: number;
  agentiInAsteptare: number;
  clienti: number;
  conturiSuspendate: number;
};

type RolFilter = "toate" | "administrator" | "agent" | "client";

export default function AdminSecuritatePage() {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [rolFilter, setRolFilter] = useState<RolFilter>("toate");
  const [users, setUsers] = useState<SecurityUser[]>([]);
  const [statistici, setStatistici] = useState<Statistici | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/admin/security", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload?.error || "Nu am putut încărca datele.");
        }
        setUsers(payload.users ?? []);
        setStatistici(payload.statistici ?? null);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Nu am putut încărca datele."
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (rolFilter === "administrator") {
      list = list.filter((u) => u.esteAdministrator);
    } else if (rolFilter === "agent") {
      list = list.filter((u) => u.esteAgent);
    } else if (rolFilter === "client") {
      list = list.filter((u) => !u.esteAdministrator && !u.esteAgent);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.nume.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q) ||
          u.telefon?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, rolFilter, searchQuery]);

  const hasActiveFilters = rolFilter !== "toate";

  const rolBadgeStyle = (u: SecurityUser) => {
    if (u.esteAdministrator) {
      return { bg: "rgba(168, 85, 247, 0.15)", color: "#A855F7" };
    }
    if (u.esteAgent) {
      return { bg: "rgba(59, 130, 246, 0.15)", color: "#3B82F6" };
    }
    return { bg: "rgba(107, 114, 128, 0.15)", color: "#6B7280" };
  };

  const formatNum = (n: number) => n.toLocaleString("ro-RO");

  return (
    <div className="min-h-screen text-foreground pt-20">
      <Navbar />
      <div className="w-full px-4 md:px-8 py-8 md:py-12">
        <div className="w-full max-w-[1250px] mx-auto space-y-8 md:space-y-10">
          <div>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors mb-4"
            >
              <MdArrowBack size={20} />
              <span className="text-sm">Înapoi la panou</span>
            </Link>
            <div className="flex items-start gap-3">
              <div
                className="mt-1 p-2 rounded-xl"
                style={{
                  background: isDark
                    ? "rgba(194, 90, 43, 0.15)"
                    : "rgba(194, 90, 43, 0.1)",
                }}
              >
                <MdSecurity className="text-[#C25A2B]" size={28} />
              </div>
              <div>
                <h1
                  className="text-3xl md:text-5xl font-bold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Securitate &amp; roluri
                </h1>
                <p
                  className="text-gray-500 dark:text-gray-400 max-w-2xl"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  Vizualizare utilizatori, administratori și agenți, cu permisiuni
                  efective și indicatori rapizi.
                </p>
              </div>
            </div>
          </div>

          {/* Statistici scurte */}
          {statistici && (
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              {[
                {
                  label: "Total",
                  val: statistici.total,
                  icon: MdPeople,
                  culoare: "#64748B",
                },
                {
                  label: "Admini",
                  val: statistici.administratori,
                  icon: MdAdminPanelSettings,
                  culoare: "#A855F7",
                },
                {
                  label: "Agenți",
                  val: statistici.agenti,
                  icon: MdBusiness,
                  culoare: "#3B82F6",
                },
                {
                  label: "Agenți aprobați",
                  val: statistici.agentiAprobati,
                  icon: MdBusiness,
                  culoare: "#10B981",
                },
                {
                  label: "În așteptare",
                  val: statistici.agentiInAsteptare,
                  icon: MdBusiness,
                  culoare: "#F59E0B",
                },
                {
                  label: "Clienți",
                  val: statistici.clienti,
                  icon: MdPerson,
                  culoare: "#94A3B8",
                },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="rounded-2xl px-4 py-3 relative overflow-hidden"
                    style={{
                      background: isDark
                        ? "rgba(35, 35, 48, 0.5)"
                        : "rgba(255, 255, 255, 0.65)",
                      border: isDark
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "1px solid rgba(255, 255, 255, 0.5)",
                      boxShadow: isDark
                        ? "0 4px 24px rgba(0,0,0,0.2)"
                        : "0 4px 24px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={14} style={{ color: s.culoare }} />
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {s.label}
                      </span>
                    </div>
                    <div
                      className="text-2xl font-bold text-foreground tabular-nums"
                      style={{ color: s.culoare }}
                    >
                      {formatNum(s.val)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {statistici && statistici.conturiSuspendate > 0 && (
            <div
              className="flex items-center gap-2 text-sm rounded-xl px-4 py-2"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#EF4444",
                fontFamily: "var(--font-galak-regular)",
              }}
            >
              <MdBlock size={18} />
              <span>
                {formatNum(statistici.conturiSuspendate)} cont(uri) suspendat(e)
                în listă (Clerk).
              </span>
            </div>
          )}

          <div
            className="rounded-none md:rounded-3xl overflow-hidden relative"
            style={{
              fontFamily: "var(--font-galak-regular)",
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
            }}
          >
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
            <div className="p-4 md:p-6 relative z-1">
              <div className="mb-4">
                <div className="relative">
                  <MdSearch
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Caută după nume, email, ID..."
                    className="w-full pl-12 pr-4 py-3 rounded-lg border backdrop-blur-xl text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all"
                    style={{
                      background: isDark
                        ? "rgba(27, 27, 33, 0.6)"
                        : "rgba(255, 255, 255, 0.6)",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.4)",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    isFilterOpen || hasActiveFilters
                      ? "text-white"
                      : "text-foreground hover:opacity-90"
                  }`}
                  style={{
                    backgroundColor:
                      isFilterOpen || hasActiveFilters ? "#C25A2B" : "transparent",
                    border:
                      isFilterOpen || hasActiveFilters
                        ? "none"
                        : isDark
                          ? "1px solid rgba(255, 255, 255, 0.1)"
                          : "1px solid rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <MdFilterList size={20} />
                  <span>Rol</span>
                  {hasActiveFilters && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 text-white">
                      1
                    </span>
                  )}
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filtered.length} utilizator{filtered.length === 1 ? "" : "i"}
                </div>
              </div>

              {isFilterOpen && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      Filtrează după rol
                    </h3>
                    <div className="flex items-center gap-2">
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={() => setRolFilter("toate")}
                          className="text-sm text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors"
                        >
                          Resetează
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <MdClose size={20} />
                      </button>
                    </div>
                  </div>
                  <select
                    value={rolFilter}
                    onChange={(e) =>
                      setRolFilter(e.target.value as RolFilter)
                    }
                    className="w-full max-w-md px-4 py-2.5 rounded-lg border backdrop-blur-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50"
                    style={{
                      background: isDark
                        ? "rgba(27, 27, 33, 0.6)"
                        : "rgba(255, 255, 255, 0.6)",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    <option value="toate">Toate rolurile</option>
                    <option value="administrator">Doar administratori</option>
                    <option value="agent">Doar agenți</option>
                    <option value="client">Doar clienți</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Tabel */}
          <div
            className="rounded-none md:rounded-3xl overflow-hidden relative"
            style={{
              fontFamily: "var(--font-galak-regular)",
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
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Utilizator
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Permisiuni
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Cont
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Înregistrat
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        Se încarcă…
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        Niciun rezultat pentru filtrele curente.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => {
                      const badge = rolBadgeStyle(user);
                      return (
                        <tr
                          key={user.id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors align-top"
                          style={{
                            borderColor: isDark
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-start gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: badge.bg }}
                              >
                                <MdPerson size={20} style={{ color: badge.color }} />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-foreground truncate max-w-[200px] md:max-w-xs">
                                  {user.nume}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[220px]">
                                  {user.id}
                                </div>
                                <div className="mt-1 space-y-0.5 text-sm">
                                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                    <MdEmail size={12} className="shrink-0 opacity-70" />
                                    <span className="truncate">{user.email}</span>
                                  </div>
                                  {user.telefon && (
                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                      <MdPhone size={12} className="shrink-0 opacity-70" />
                                      <span>{user.telefon}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{
                                background: badge.bg,
                                color: badge.color,
                              }}
                            >
                              {user.rolAfisat}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                              {user.permisiuni.map((p) => (
                                <span
                                  key={p}
                                  className="text-xs px-2 py-0.5 rounded-md"
                                  style={{
                                    background: isDark
                                      ? "rgba(255,255,255,0.06)"
                                      : "rgba(0,0,0,0.05)",
                                    color: "inherit",
                                  }}
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {user.contSuspendat ? (
                              <span
                                className="text-xs font-medium px-2 py-1 rounded-md"
                                style={{
                                  background: "rgba(239, 68, 68, 0.15)",
                                  color: "#EF4444",
                                }}
                              >
                                Suspendat
                              </span>
                            ) : (
                              <span
                                className="text-xs font-medium px-2 py-1 rounded-md"
                                style={{
                                  background: "rgba(16, 185, 129, 0.15)",
                                  color: "#10B981",
                                }}
                              >
                                Activ
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-foreground whitespace-nowrap">
                            {new Date(user.dataInregistrare).toLocaleDateString(
                              "ro-RO"
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p
            className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            Lista reflectă până la 100 de utilizatori (limită Clerk), în ordinea
            creării contului. Permisiunile sunt derivate din rolurile din Clerk
            (metadata publică).
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
