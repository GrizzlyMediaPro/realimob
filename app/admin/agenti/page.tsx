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
  MdBusiness,
  MdCheckCircle,
  MdCancel,
  MdMoreVert,
  MdPending,
} from "react-icons/md";
import Link from "next/link";

type AgentStatus = "activ" | "inactiv" | "suspendat" | "pending";

interface Agent {
  id: string;
  nume: string;
  email: string;
  telefon: string;
  companie?: string;
  anunturiActive: number;
  anunturiTotal: number;
  status: AgentStatus;
  dataInregistrare: string;
}

// Funcție deterministă pentru a genera valori pseudo-aleatoare bazate pe index
const deterministicValue = (index: number, seed: number, max: number) => {
  return ((index * seed + seed * 7) % max);
};

// Date dummy pentru agenți
const generateAgenti = (): Agent[] => {
  const nume = [
    "Ion Popescu",
    "Maria Ionescu",
    "Alexandru Georgescu",
    "Elena Radu",
    "Mihai Stan",
    "Ana Dumitrescu",
    "Cristian Nistor",
    "Andreea Munteanu",
    "Bogdan Vasile",
    "Ioana Constantinescu",
    "Radu Petrescu",
    "Diana Gheorghe",
    "Florin Marin",
    "Simona Toma",
    "Adrian Popa",
  ];

  const companii = [
    "Imobiliare Premium",
    "Casa Perfectă",
    "Real Estate Pro",
    "Luxury Properties",
    "Smart Living",
    undefined,
    undefined,
  ];

  const statusuri: AgentStatus[] = ["activ", "activ", "activ", "inactiv", "suspendat", "pending"];

  const telefonBase = [
    "0793193877",
    "0718593727",
    "0723456789",
    "0734567890",
    "0745678901",
    "0756789012",
    "0767890123",
    "0778901234",
    "0789012345",
    "0790123456",
    "0711234567",
    "0722345678",
    "0733456789",
    "0744567890",
    "0755678901",
  ];

  return nume.map((n, index) => {
    const numeParts = n.split(" ");
    const email = `${numeParts[0].toLowerCase()}.${numeParts[1].toLowerCase()}@realimob.ro`;
    const telefon = telefonBase[index % telefonBase.length];
    const status = statusuri[index % statusuri.length];
    const anunturiActive = deterministicValue(index, 17, 50) + 5;
    const anunturiTotal = anunturiActive + deterministicValue(index, 23, 20);
    const daysAgo = deterministicValue(index, 31, 365);
    const dataInregistrare = new Date(
      Date.now() - daysAgo * 24 * 60 * 60 * 1000
    ).toISOString();

    return {
      id: `agent-${index + 1}`,
      nume: n,
      email,
      telefon,
      companie: companii[index % companii.length],
      anunturiActive,
      anunturiTotal,
      status,
      dataInregistrare,
    };
  });
};

export default function AdminAgentiPage() {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AgentStatus | "toate">("toate");
  const [companieFilter, setCompanieFilter] = useState("");
  const [showPending, setShowPending] = useState(false);

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

  const allAgenti = useMemo(() => generateAgenti(), []);

  const filteredAgenti = useMemo(() => {
    let filtered = allAgenti;

    // Filtrare după pending
    if (showPending) {
      filtered = filtered.filter((agent) => agent.status === "pending");
    } else {
      // Filtrare după status (doar dacă nu e pending)
      if (statusFilter !== "toate") {
        filtered = filtered.filter((agent) => agent.status === statusFilter);
      }
    }

    // Filtrare după search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.nume.toLowerCase().includes(query) ||
          agent.email.toLowerCase().includes(query) ||
          agent.telefon.includes(query) ||
          agent.companie?.toLowerCase().includes(query)
      );
    }

    // Filtrare după companie
    if (companieFilter) {
      filtered = filtered.filter(
        (agent) =>
          agent.companie?.toLowerCase().includes(companieFilter.toLowerCase())
      );
    }

    return filtered;
  }, [allAgenti, searchQuery, statusFilter, companieFilter, showPending]);

  const hasActiveFilters = useMemo(() => {
    return (statusFilter !== "toate" && !showPending) || !!companieFilter;
  }, [statusFilter, companieFilter, showPending]);

  const pendingCount = useMemo(
    () => allAgenti.filter((a) => a.status === "pending").length,
    [allAgenti]
  );

  const clearFilters = () => {
    setStatusFilter("toate");
    setCompanieFilter("");
    setShowPending(false);
  };

  const getStatusColor = (status: AgentStatus) => {
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
      case "pending":
        return {
          background: "rgba(245, 158, 11, 0.15)",
          color: "#F59E0B",
        };
    }
  };

  const getStatusLabel = (status: AgentStatus) => {
    switch (status) {
      case "activ":
        return "Activ";
      case "inactiv":
        return "Inactiv";
      case "suspendat":
        return "Suspendat";
      case "pending":
        return "În Așteptare";
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
                Gestionează Agenți
              </h1>
              <p
                className="text-gray-500 dark:text-gray-400"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Administrează toți agenții imobiliari
              </p>
            </div>
          </div>

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
                    placeholder="Caută după nume, email, telefon sau companie..."
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

              {/* Buton Filtre și Pending */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
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
                        {[statusFilter !== "toate" && !showPending && statusFilter, companieFilter]
                          .filter(Boolean).length}
                      </span>
                    )}
                  </button>

                  {/* Buton Pending Agents */}
                  <button
                    onClick={() => {
                      setShowPending(!showPending);
                      if (!showPending) {
                        setStatusFilter("toate");
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      showPending
                        ? "text-white"
                        : "text-foreground hover:opacity-90"
                    }`}
                    style={{
                      backgroundColor: showPending ? "#F59E0B" : "transparent",
                      border: showPending
                        ? "none"
                        : isDark
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "1px solid rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <MdPending size={20} />
                    <span>Pending Agents</span>
                    {pendingCount > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          showPending
                            ? "bg-white/20 text-white"
                            : "bg-[#F59E0B] text-white"
                        }`}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredAgenti.length} agent{filteredAgenti.length === 1 ? "" : "i"} găsit{filteredAgenti.length === 1 ? "" : "i"}
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
                      Filtrează Agenți
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
                              e.target.value as AgentStatus | "toate"
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
                          <option value="pending">În Așteptare</option>
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

                    {/* Companie Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Companie
                      </label>
                      <input
                        type="text"
                        value={companieFilter}
                        onChange={(e) => setCompanieFilter(e.target.value)}
                        placeholder="Caută după companie..."
                        className="w-full px-4 py-2.5 rounded-lg border backdrop-blur-xl text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all"
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
                </div>
              )}
            </div>
          </div>

          {/* Tabel Agenți */}
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
                      Agent
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Companie
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Anunțuri
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
                  {filteredAgenti.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        Nu s-au găsit agenți care să corespundă criteriilor.
                      </td>
                    </tr>
                  ) : (
                    filteredAgenti.map((agent) => {
                      const statusColor = getStatusColor(agent.status);
                      return (
                        <tr
                          key={agent.id}
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
                                    ? "rgba(194, 90, 43, 0.2)"
                                    : "rgba(194, 90, 43, 0.1)",
                                }}
                              >
                                <MdPerson
                                  size={20}
                                  className="text-[#C25A2B]"
                                />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {agent.nume}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {agent.id}
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
                                  {agent.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MdPhone
                                  size={14}
                                  className="text-gray-400"
                                />
                                <span className="text-foreground">
                                  {agent.telefon}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {agent.companie ? (
                              <div className="flex items-center gap-2">
                                <MdBusiness
                                  size={16}
                                  className="text-gray-400"
                                />
                                <span className="text-sm text-foreground">
                                  {agent.companie}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Independent
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              <span className="font-medium text-foreground">
                                {agent.anunturiActive}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {" "}
                                / {agent.anunturiTotal}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Active / Total
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                              style={statusColor}
                            >
                              {agent.status === "activ" ? (
                                <MdCheckCircle size={14} />
                              ) : (
                                <MdCancel size={14} />
                              )}
                              {getStatusLabel(agent.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-foreground">
                              {new Date(
                                agent.dataInregistrare
                              ).toLocaleDateString("ro-RO")}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end">
                              <button
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Mai multe opțiuni"
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
      <Footer />
    </div>
  );
}
