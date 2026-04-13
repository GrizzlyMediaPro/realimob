"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  MdCheckCircle,
  MdCancel,
  MdMoreVert,
  MdContentCopy,
  MdBlock,
  MdLockOpen,
} from "react-icons/md";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

type UserStatus = "activ" | "inactiv" | "suspendat";

interface User {
  id: string;
  nume: string;
  email: string;
  telefon?: string;
  anunturiFavorite: number;
  anunturiVizualizate: number;
  status: UserStatus;
  dataInregistrare: string;
}

export default function AdminUtilizatoriPage() {
  const { userId: currentClerkUserId } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<UserStatus | "toate">("toate");
  const [allUtilizatori, setAllUtilizatori] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<{
    user: User;
    top: number;
    left: number;
  } | null>(null);
  const [actingUserId, setActingUserId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

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

  const fetchUtilizatori = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) {
        setIsLoadingUsers(true);
      }
      setUsersError(null);

      const response = await fetch("/api/admin/users", {
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Nu am putut încărca utilizatorii.");
      }

      setAllUtilizatori(payload.users ?? []);
    } catch (error) {
      setUsersError(
        error instanceof Error
          ? error.message
          : "Nu am putut încărca utilizatorii."
      );
    } finally {
      if (!opts?.silent) {
        setIsLoadingUsers(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchUtilizatori();
  }, [fetchUtilizatori]);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 4500);
    return () => window.clearTimeout(t);
  }, [banner]);

  useEffect(() => {
    if (!actionMenu) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = actionMenuRef.current;
      if (el && !el.contains(e.target as Node)) {
        setActionMenu(null);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActionMenu(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [actionMenu]);

  const showBanner = (type: "success" | "error", message: string) => {
    setBanner({ type, message });
  };

  const copyUserEmail = async (user: User) => {
    try {
      if (user.email && user.email !== "-") {
        await navigator.clipboard.writeText(user.email);
        showBanner("success", "Adresa de email a fost copiată în clipboard.");
      } else {
        showBanner("error", "Acest utilizator nu are un email copiabil.");
      }
    } catch {
      showBanner("error", "Nu am putut copia emailul. Încearcă din nou.");
    }
    setActionMenu(null);
  };

  const patchUserBan = async (user: User, action: "ban" | "unban") => {
    if (
      action === "ban" &&
      !window.confirm(
        `Sigur vrei să suspendezi contul lui ${user.nume}? Utilizatorul nu se va mai putea autentifica până la reactivare.`
      )
    ) {
      return;
    }
    if (
      action === "unban" &&
      !window.confirm(
        `Sigur vrei să reactivezi contul lui ${user.nume}?`
      )
    ) {
      return;
    }

    try {
      setActingUserId(user.id);
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Acțiunea a eșuat.");
      }
      showBanner(
        "success",
        action === "ban"
          ? "Contul a fost suspendat."
          : "Contul a fost reactivat."
      );
      setActionMenu(null);
      await fetchUtilizatori({ silent: true });
    } catch (e) {
      showBanner(
        "error",
        e instanceof Error ? e.message : "Acțiunea a eșuat."
      );
    } finally {
      setActingUserId(null);
    }
  };

  const filteredUtilizatori = useMemo(() => {
    let filtered = allUtilizatori;

    // Filtrare după status
    if (statusFilter !== "toate") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Filtrare după search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.nume.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.telefon?.includes(query)
      );
    }

    return filtered;
  }, [allUtilizatori, searchQuery, statusFilter]);

  const hasActiveFilters = useMemo(() => {
    return statusFilter !== "toate";
  }, [statusFilter]);

  const clearFilters = () => {
    setStatusFilter("toate");
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "activ":
        return {
          background: "rgba(16, 185, 129, 0.15)",
          color: "#10B981",
        };
      case "inactiv":
        return {
          background: "rgba(239, 68, 68, 0.15)",
          color: "#EF4444",
        };
      case "suspendat":
        return {
          background: "rgba(245, 158, 11, 0.15)",
          color: "#F59E0B",
        };
    }
  };

  const getStatusLabel = (status: UserStatus) => {
    switch (status) {
      case "activ":
        return "Activ";
      case "inactiv":
        return "Inactiv";
      case "suspendat":
        return "Suspendat";
    }
  };

  return (
    <div className="min-h-screen text-foreground pt-20">
      <Navbar />
      <div className="w-full px-4 md:px-8 py-8 md:py-12">
        <div className="w-full max-w-[1250px] mx-auto space-y-8 md:space-y-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin"
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors mb-4"
              >
                <MdArrowBack size={20} />
                <span className="text-sm">Înapoi la panou</span>
              </Link>
              <h1
                className="text-3xl md:text-5xl font-bold text-foreground mb-2"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Gestionează Utilizatori
              </h1>
              <p
                className="text-gray-500 dark:text-gray-400"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Administrează toți utilizatorii platformei
              </p>
            </div>
          </div>

          {banner && (
            <div
              role="status"
              className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{
                fontFamily: "var(--font-galak-regular)",
                background:
                  banner.type === "success"
                    ? isDark
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(16, 185, 129, 0.12)"
                    : isDark
                    ? "rgba(239, 68, 68, 0.15)"
                    : "rgba(239, 68, 68, 0.1)",
                color: banner.type === "success" ? "#10B981" : "#EF4444",
                border:
                  banner.type === "success"
                    ? "1px solid rgba(16, 185, 129, 0.35)"
                    : "1px solid rgba(239, 68, 68, 0.35)",
              }}
            >
              {banner.message}
            </div>
          )}

          {/* Search și Filtre */}
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
              {/* Search Bar */}
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
                    placeholder="Caută după nume, email sau telefon..."
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

              {/* Buton Filtre */}
              <div className="flex items-center justify-between">
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
                  <span>Filtre</span>
                  {hasActiveFilters && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 text-white">
                      1
                    </span>
                  )}
                </button>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredUtilizatori.length} utilizator{filteredUtilizatori.length === 1 ? "" : "i"} găsit{filteredUtilizatori.length === 1 ? "" : "i"}
                </div>
              </div>

              {/* Panou Filtre */}
              {isFilterOpen && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-lg font-bold text-foreground"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Filtrează Utilizatori
                    </h3>
                    <div className="flex items-center gap-2">
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors"
                        >
                          Șterge toate
                        </button>
                      )}
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <MdClose size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          value={statusFilter}
                          onChange={(e) =>
                            setStatusFilter(
                              e.target.value as UserStatus | "toate"
                            )
                          }
                          className="w-full px-4 py-2.5 rounded-lg border backdrop-blur-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none pr-10"
                          style={{
                            background: isDark
                              ? "rgba(27, 27, 33, 0.6)"
                              : "rgba(255, 255, 255, 0.6)",
                            borderColor: isDark
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(255, 255, 255, 0.4)",
                          }}
                        >
                          <option value="toate">Toate</option>
                          <option value="activ">Activ</option>
                          <option value="inactiv">Inactiv</option>
                          <option value="suspendat">Suspendat</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabel Utilizatori */}
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
              <table className="w-full">
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
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Activitate
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Data înregistrare
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingUsers ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        Se încarcă utilizatorii reali...
                      </td>
                    </tr>
                  ) : usersError ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-red-500"
                      >
                        {usersError}
                      </td>
                    </tr>
                  ) : filteredUtilizatori.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        Nu s-au găsit utilizatori care să corespundă criteriilor.
                      </td>
                    </tr>
                  ) : (
                    filteredUtilizatori.map((user) => {
                      const statusColor = getStatusColor(user.status);
                      return (
                        <tr
                          key={user.id}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          style={{
                            borderColor: isDark
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{
                                  background: isDark
                                    ? "rgba(59, 130, 246, 0.2)"
                                    : "rgba(59, 130, 246, 0.1)",
                                }}
                              >
                                <MdPerson
                                  size={20}
                                  className="text-[#3B82F6]"
                                />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {user.nume}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {user.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <MdEmail
                                  size={14}
                                  className="text-gray-400"
                                />
                                <span className="text-foreground">
                                  {user.email}
                                </span>
                              </div>
                              {user.telefon && (
                                <div className="flex items-center gap-2 text-sm">
                                  <MdPhone
                                    size={14}
                                    className="text-gray-400"
                                  />
                                  <span className="text-foreground">
                                    {user.telefon}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="font-medium text-foreground">
                                  {user.anunturiFavorite}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {" "}
                                  favorite
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-foreground">
                                  {user.anunturiVizualizate}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {" "}
                                  vizualizări
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                              style={statusColor}
                            >
                              {user.status === "activ" ? (
                                <MdCheckCircle size={14} />
                              ) : (
                                <MdCancel size={14} />
                              )}
                              {getStatusLabel(user.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-foreground">
                              {new Date(
                                user.dataInregistrare
                              ).toLocaleDateString("ro-RO")}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                aria-label="Acțiuni utilizator"
                                aria-expanded={
                                  actionMenu?.user.id === user.id
                                }
                                disabled={actingUserId === user.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect =
                                    e.currentTarget.getBoundingClientRect();
                                  const width = 220;
                                  const left = Math.max(
                                    8,
                                    Math.min(
                                      rect.right - width,
                                      window.innerWidth - width - 8
                                    )
                                  );
                                  setActionMenu((prev) =>
                                    prev?.user.id === user.id
                                      ? null
                                      : {
                                          user,
                                          top: rect.bottom + 6,
                                          left,
                                        }
                                  );
                                }}
                              >
                                <MdMoreVert
                                  size={20}
                                  className="text-gray-500 dark:text-gray-400"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {actionMenu && (
        <div
          ref={actionMenuRef}
          className="fixed z-[200] w-[min(220px,calc(100vw-16px))] rounded-xl py-1 text-left shadow-xl"
          style={{
            top: actionMenu.top,
            left: actionMenu.left,
            fontFamily: "var(--font-galak-regular)",
            background: isDark
              ? "rgba(30, 30, 40, 0.98)"
              : "rgba(255, 255, 255, 0.98)",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.12)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200/80 dark:border-white/10 truncate">
            {actionMenu.user.nume}
          </p>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
            disabled={Boolean(actingUserId)}
            onClick={() => void copyUserEmail(actionMenu.user)}
          >
            <MdContentCopy size={18} className="shrink-0 text-gray-500" />
            Copiază email
          </button>
          {actionMenu.user.status === "suspendat" ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
              disabled={Boolean(actingUserId)}
              onClick={() => void patchUserBan(actionMenu.user, "unban")}
            >
              <MdLockOpen size={18} className="shrink-0 text-emerald-600" />
              Reactivează contul
            </button>
          ) : (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
              disabled={
                Boolean(actingUserId) ||
                actionMenu.user.id === currentClerkUserId
              }
              title={
                actionMenu.user.id === currentClerkUserId
                  ? "Nu poți suspenda propriul cont din aici."
                  : undefined
              }
              onClick={() => void patchUserBan(actionMenu.user, "ban")}
            >
              <MdBlock size={18} className="shrink-0 text-amber-600" />
              Suspendă contul
            </button>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
