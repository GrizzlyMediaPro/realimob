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
  MdPending,
  MdEdit,
  MdDelete,
  MdDescription,
  MdOpenInNew,
  MdDownload,
} from "react-icons/md";
import Link from "next/link";
import { UploadButton, UploadDropzone } from "../../components/Uploadthing";

type AgentStatus = "activ" | "inactiv" | "suspendat" | "pending" | "respins";

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
  buletinUrl?: string | null;
  cui?: string | null;
  submittedAt?: string | null;
  rejectionMessage?: string | null;
  contractTemplateUrl?: string | null;
  contractTemplateFileName?: string | null;
  contractSentAt?: string | null;
  signedContractUrl?: string | null;
  signedContractFileName?: string | null;
  signedUploadedAt?: string | null;
}

type AgentApiItem = {
  id: string;
  nume?: string;
  email?: string;
  telefon?: string;
  status?: "pending" | "approved" | "rejected";
  dataInregistrare?: string;
  formaOrganizare?: string | null;
  buletinUrl?: string | null;
  cui?: string | null;
  submittedAt?: string | null;
  rejectionMessage?: string | null;
  contractTemplateUrl?: string | null;
  contractTemplateFileName?: string | null;
  contractSentAt?: string | null;
  signedContractUrl?: string | null;
  signedContractFileName?: string | null;
  signedUploadedAt?: string | null;
};

export default function AdminAgentiPage() {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AgentStatus | "toate">("toate");
  const [companieFilter, setCompanieFilter] = useState("");
  const [showPending, setShowPending] = useState(false);
  const [allAgenti, setAllAgenti] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [detailAgent, setDetailAgent] = useState<Agent | null>(null);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [editForm, setEditForm] = useState({
    nume: "",
    telefon: "",
    formaOrganizare: "",
    cui: "",
  });
  const [rejectAgentId, setRejectAgentId] = useState<string | null>(null);
  const [rejectMessage, setRejectMessage] = useState("");
  const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [contractUrlDraft, setContractUrlDraft] = useState("");
  const [contractFileNameDraft, setContractFileNameDraft] = useState("");

  const fetchAgenti = async () => {
    try {
      setIsLoadingAgents(true);
      setAgentsError(null);

      const response = await fetch("/api/admin/agent-requests", {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Nu am putut încărca agenții.");
      }

      const mappedAgents: Agent[] = (payload.agents ?? []).map((agent: AgentApiItem) => {
        const status: AgentStatus =
          agent.status === "pending"
            ? "pending"
            : agent.status === "rejected"
            ? "respins"
            : "activ";

        return {
          id: agent.id,
          nume: agent.nume ?? "Agent fără nume",
          email: agent.email ?? "-",
          telefon: agent.telefon ?? "-",
          companie: agent.formaOrganizare ?? undefined,
          anunturiActive: 0,
          anunturiTotal: 0,
          status,
          dataInregistrare: agent.dataInregistrare ?? new Date().toISOString(),
          buletinUrl: agent.buletinUrl ?? null,
          cui: agent.cui ?? null,
          submittedAt: agent.submittedAt ?? null,
          rejectionMessage: agent.rejectionMessage ?? null,
          contractTemplateUrl: agent.contractTemplateUrl ?? null,
          contractTemplateFileName: agent.contractTemplateFileName ?? null,
          contractSentAt: agent.contractSentAt ?? null,
          signedContractUrl: agent.signedContractUrl ?? null,
          signedContractFileName: agent.signedContractFileName ?? null,
          signedUploadedAt: agent.signedUploadedAt ?? null,
        };
      });

      setAllAgenti(mappedAgents);
    } catch (error) {
      setAgentsError(
        error instanceof Error ? error.message : "Nu am putut încărca agenții."
      );
    } finally {
      setIsLoadingAgents(false);
    }
  };

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
    fetchAgenti();
  }, []);

  useEffect(() => {
    setDetailAgent((prev) => {
      if (!prev) return null;
      const fresh = allAgenti.find((a) => a.id === prev.id);
      return fresh ?? prev;
    });
  }, [allAgenti]);

  const patchAgentRequest = async (body: Record<string, unknown>) => {
    const response = await fetch("/api/admin/agent-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Operațiune eșuată.");
    }
  };

  const approveAgent = async (targetUserId: string) => {
    try {
      setActionLoading(true);
      setAgentsError(null);
      await patchAgentRequest({ targetUserId, action: "approve" });
      setDetailAgent(null);
      await fetchAgenti();
    } catch (error) {
      setAgentsError(
        error instanceof Error ? error.message : "Nu am putut aproba cererea."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const submitReject = async () => {
    if (!rejectAgentId || !rejectMessage.trim()) {
      setAgentsError("Scrie un mesaj pentru agent înainte de respingere.");
      return;
    }
    try {
      setActionLoading(true);
      setAgentsError(null);
      await patchAgentRequest({
        targetUserId: rejectAgentId,
        action: "reject",
        message: rejectMessage.trim(),
      });
      setRejectAgentId(null);
      setRejectMessage("");
      setDetailAgent(null);
      await fetchAgenti();
    } catch (error) {
      setAgentsError(
        error instanceof Error ? error.message : "Nu am putut respinge cererea."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const sendContractForAgent = async (
    targetUserId: string,
    url: string,
    fileName?: string
  ) => {
    if (!url.trim()) {
      setAgentsError("Încarcă mai întâi fișierul contractului (PDF sau imagine).");
      return;
    }
    try {
      setActionLoading(true);
      setAgentsError(null);
      await patchAgentRequest({
        targetUserId,
        action: "send_contract",
        contractTemplateUrl: url.trim(),
        contractTemplateFileName: fileName?.trim(),
      });
      setContractUrlDraft("");
      setContractFileNameDraft("");
      await fetchAgenti();
      setDetailAgent((prev) =>
        prev && prev.id === targetUserId
          ? {
              ...prev,
              contractTemplateUrl: url.trim(),
              contractTemplateFileName: fileName?.trim() ?? prev.contractTemplateFileName,
              contractSentAt: new Date().toISOString(),
            }
          : prev
      );
    } catch (error) {
      setAgentsError(
        error instanceof Error ? error.message : "Nu am putut trimite contractul."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const saveEditAgent = async () => {
    if (!editAgent) return;
    try {
      setActionLoading(true);
      setAgentsError(null);
      await patchAgentRequest({
        targetUserId: editAgent.id,
        action: "update",
        updates: {
          nume: editForm.nume.trim() || undefined,
          telefon: editForm.telefon.trim() || undefined,
          formaOrganizare: editForm.formaOrganizare.trim() || undefined,
          cui: editForm.cui.trim() || undefined,
        },
      });
      setEditAgent(null);
      await fetchAgenti();
    } catch (error) {
      setAgentsError(
        error instanceof Error ? error.message : "Nu am putut salva modificările."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAgent = async () => {
    if (!deleteAgentId) return;
    try {
      setActionLoading(true);
      setAgentsError(null);
      const response = await fetch("/api/admin/agent-requests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: deleteAgentId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Ștergerea a eșuat.");
      }
      setDeleteAgentId(null);
      setDetailAgent(null);
      setEditAgent(null);
      await fetchAgenti();
    } catch (error) {
      setAgentsError(
        error instanceof Error ? error.message : "Nu am putut șterge înregistrarea."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (agent: Agent) => {
    setEditAgent(agent);
    setEditForm({
      nume: agent.nume,
      telefon: agent.telefon === "-" ? "" : agent.telefon,
      formaOrganizare: agent.companie ?? "",
      cui: agent.cui ?? "",
    });
  };

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
      case "respins":
        return {
          background: "rgba(239, 68, 68, 0.15)",
          color: "#EF4444",
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
      case "respins":
        return "Respins";
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
                  {isLoadingAgents ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        Se încarcă agenții reali...
                      </td>
                    </tr>
                  ) : agentsError ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-red-500"
                      >
                        {agentsError}
                      </td>
                    </tr>
                  ) : filteredAgenti.length === 0 ? (
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
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <MdBusiness
                                    size={16}
                                    className="text-gray-400"
                                  />
                                  <span className="text-sm text-foreground">
                                    {agent.companie}
                                  </span>
                                </div>
                                {agent.cui && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    CUI: {agent.cui}
                                  </div>
                                )}
                                {agent.buletinUrl && (
                                  <a
                                    href={agent.buletinUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-[#C25A2B] underline"
                                  >
                                    Vezi buletin
                                  </a>
                                )}
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
                            <div className="flex justify-end flex-wrap gap-1.5">
                              <button
                                type="button"
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Detalii agent"
                                title="Detalii"
                                onClick={() => {
                                  setContractUrlDraft("");
                                  setContractFileNameDraft("");
                                  setDetailAgent(agent);
                                }}
                              >
                                <MdDescription
                                  size={20}
                                  className="text-gray-500 dark:text-gray-400"
                                />
                              </button>
                              <button
                                type="button"
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Editează"
                                title="Editează"
                                onClick={() => openEdit(agent)}
                              >
                                <MdEdit
                                  size={20}
                                  className="text-gray-500 dark:text-gray-400"
                                />
                              </button>
                              <button
                                type="button"
                                className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                aria-label="Șterge din agenți"
                                title="Șterge"
                                onClick={() => setDeleteAgentId(agent.id)}
                              >
                                <MdDelete
                                  size={20}
                                  className="text-red-500 dark:text-red-400"
                                />
                              </button>
                              {agent.status === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#10B981] hover:opacity-90 transition-opacity disabled:opacity-50"
                                    disabled={actionLoading || !agent.signedContractUrl}
                                    title={
                                      agent.signedContractUrl
                                        ? "Aprobă după verificarea contractului"
                                        : "Necesită contract semnat încărcat de agent"
                                    }
                                    onClick={() => approveAgent(agent.id)}
                                  >
                                    Aprobă
                                  </button>
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#EF4444] hover:opacity-90 transition-opacity disabled:opacity-50"
                                    disabled={actionLoading}
                                    onClick={() => setRejectAgentId(agent.id)}
                                  >
                                    Respinge
                                  </button>
                                </>
                              )}
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

      {/* Modal detalii + contract */}
      {detailAgent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-agent-title"
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl text-foreground"
            style={{
              fontFamily: "var(--font-galak-regular)",
              background: isDark ? "rgba(35, 35, 48, 0.98)" : "rgba(255, 255, 255, 0.98)",
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.12)"
                : "1px solid rgba(0, 0, 0, 0.08)",
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 id="detail-agent-title" className="text-xl font-bold">
                Detalii cerere
              </h2>
              <button
                type="button"
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setDetailAgent(null)}
                aria-label="Închide"
              >
                <MdClose size={22} />
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Nume</dt>
                <dd>{detailAgent.nume}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                <dd>{detailAgent.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Telefon</dt>
                <dd>{detailAgent.telefon}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Formă organizare</dt>
                <dd>{detailAgent.companie ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">CUI</dt>
                <dd>{detailAgent.cui ?? "—"}</dd>
              </div>
              {detailAgent.buletinUrl && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Buletin</dt>
                  <dd>
                    <a
                      href={detailAgent.buletinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#C25A2B] underline"
                    >
                      Deschide <MdOpenInNew size={14} />
                    </a>
                  </dd>
                </div>
              )}
              {detailAgent.submittedAt && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Trimis la</dt>
                  <dd>{new Date(detailAgent.submittedAt).toLocaleString("ro-RO")}</dd>
                </div>
              )}
              {detailAgent.rejectionMessage && (
                <div className="rounded-lg p-3 bg-red-500/10 text-red-700 dark:text-red-300">
                  <dt className="font-medium mb-1">Mesaj respingere</dt>
                  <dd>{detailAgent.rejectionMessage}</dd>
                </div>
              )}
            </dl>

            {detailAgent.status === "pending" && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-semibold text-sm">Contract de trimis agentului</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  1) Încarcă PDF-ul (sau imaginea) contractului. 2) Apasă „Trimite contractul agentului” — agentul îl
                  poate descărca din panoul său ca fișier atașat.
                </p>
                {detailAgent.contractTemplateUrl ? (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Fișier curent: {detailAgent.contractTemplateFileName ?? "contract"}
                    </span>
                    <a
                      href={`/api/admin/agent-contract-file?targetUserId=${encodeURIComponent(
                        detailAgent.id
                      )}&kind=template`}
                      className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg text-white bg-[#C25A2B] hover:opacity-90"
                    >
                      <MdDownload size={16} />
                      Descarcă contractul
                    </a>
                    <a
                      href={detailAgent.contractTemplateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-500 underline"
                    >
                      Deschide în tab nou <MdOpenInNew size={14} />
                    </a>
                  </div>
                ) : null}

                <div
                  className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 space-y-3"
                  data-testid="admin-contract-upload"
                >
                  <p className="text-xs font-medium text-foreground">Încărcare fișier</p>
                  <UploadDropzone
                    endpoint="documentUploader"
                    onClientUploadComplete={(res) => {
                      const f = res?.[0];
                      if (f?.url) {
                        setContractUrlDraft(f.url);
                        setContractFileNameDraft(f.name ?? "");
                      }
                    }}
                    onUploadError={(e: Error) => setAgentsError(e.message)}
                    appearance={{
                      container: "border-0 bg-transparent p-0",
                      uploadIcon: "text-[#C25A2B]",
                    }}
                    content={{
                      label: "Trage fișierul aici sau click pentru a alege",
                      allowedContent: "PDF sau imagine (max. 8 MB pentru PDF)",
                    }}
                  />
                  <div className="flex justify-center">
                    <span className="text-xs text-gray-400">sau</span>
                  </div>
                  <UploadButton
                    endpoint="documentUploader"
                    onClientUploadComplete={(res) => {
                      const f = res?.[0];
                      if (f?.url) {
                        setContractUrlDraft(f.url);
                        setContractFileNameDraft(f.name ?? "");
                      }
                    }}
                    onUploadError={(e: Error) => setAgentsError(e.message)}
                    content={{
                      button: "Încarcă din buton",
                      allowedContent: "PDF / imagine",
                    }}
                  />
                </div>

                {contractUrlDraft ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Pregătit pentru trimitere:{" "}
                    <strong>{contractFileNameDraft || "document"}</strong>
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={actionLoading || !contractUrlDraft}
                  onClick={() =>
                    sendContractForAgent(
                      detailAgent.id,
                      contractUrlDraft,
                      contractFileNameDraft
                    )
                  }
                  className="w-full py-2.5 rounded-xl text-white text-sm font-medium bg-[#C25A2B] hover:opacity-90 disabled:opacity-45"
                >
                  Trimite contractul agentului
                </button>
                {detailAgent.signedContractUrl ? (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Contract semnat (agent)</h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {detailAgent.signedContractFileName ?? "document încărcat"}
                    </p>
                    <a
                      href={`/api/admin/agent-contract-file?targetUserId=${encodeURIComponent(
                        detailAgent.id
                      )}&kind=signed`}
                      className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg text-white bg-[#1F2D44] hover:opacity-90 mr-2"
                    >
                      <MdDownload size={16} />
                      Descarcă semnat
                    </a>
                    <a
                      href={detailAgent.signedContractUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[#C25A2B] underline"
                    >
                      Deschide în tab <MdOpenInNew size={14} />
                    </a>
                    {detailAgent.signedUploadedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Încărcat:{" "}
                        {new Date(detailAgent.signedUploadedAt).toLocaleString("ro-RO")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Agentul nu a încărcat încă varianta semnată.</p>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    disabled={actionLoading || !detailAgent.signedContractUrl}
                    onClick={() => approveAgent(detailAgent.id)}
                    className="flex-1 min-w-[120px] py-2 rounded-xl text-white text-sm font-medium bg-[#10B981] hover:opacity-90 disabled:opacity-45"
                  >
                    Aprobă (final)
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setRejectAgentId(detailAgent.id)}
                    className="flex-1 min-w-[120px] py-2 rounded-xl text-white text-sm font-medium bg-[#EF4444] hover:opacity-90 disabled:opacity-45"
                  >
                    Respinge
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal editare */}
      {editAgent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-xl text-foreground space-y-4"
            style={{
              fontFamily: "var(--font-galak-regular)",
              background: isDark ? "rgba(35, 35, 48, 0.98)" : "rgba(255, 255, 255, 0.98)",
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.12)"
                : "1px solid rgba(0, 0, 0, 0.08)",
            }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Editează agent</h2>
              <button
                type="button"
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setEditAgent(null)}
              >
                <MdClose size={22} />
              </button>
            </div>
            <label className="block text-sm">
              <span className="text-gray-500 dark:text-gray-400">Nume</span>
              <input
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent"
                value={editForm.nume}
                onChange={(e) => setEditForm((f) => ({ ...f, nume: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              <span className="text-gray-500 dark:text-gray-400">Telefon</span>
              <input
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent"
                value={editForm.telefon}
                onChange={(e) => setEditForm((f) => ({ ...f, telefon: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              <span className="text-gray-500 dark:text-gray-400">Formă organizare</span>
              <input
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent"
                value={editForm.formaOrganizare}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, formaOrganizare: e.target.value }))
                }
              />
            </label>
            <label className="block text-sm">
              <span className="text-gray-500 dark:text-gray-400">CUI</span>
              <input
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent"
                value={editForm.cui}
                onChange={(e) => setEditForm((f) => ({ ...f, cui: e.target.value }))}
              />
            </label>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600"
                onClick={() => setEditAgent(null)}
              >
                Anulează
              </button>
              <button
                type="button"
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-white bg-[#C25A2B] hover:opacity-90 disabled:opacity-45"
                onClick={saveEditAgent}
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal respingere */}
      {rejectAgentId && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-xl text-foreground space-y-4"
            style={{
              fontFamily: "var(--font-galak-regular)",
              background: isDark ? "rgba(35, 35, 48, 0.98)" : "rgba(255, 255, 255, 0.98)",
            }}
          >
            <h2 className="text-lg font-bold">Respinge cererea</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Explică agentului ce trebuie să corecteze sau să trimită pentru a fi aprobat.
            </p>
            <textarea
              className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent text-sm"
              placeholder="Mesaj pentru agent…"
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600"
                onClick={() => {
                  setRejectAgentId(null);
                  setRejectMessage("");
                }}
              >
                Anulează
              </button>
              <button
                type="button"
                disabled={actionLoading || !rejectMessage.trim()}
                className="flex-1 py-2.5 rounded-xl text-white bg-[#EF4444] hover:opacity-90 disabled:opacity-45"
                onClick={submitReject}
              >
                Trimite respingerea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmare ștergere */}
      {deleteAgentId && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-xl text-foreground space-y-4"
            style={{
              fontFamily: "var(--font-galak-regular)",
              background: isDark ? "rgba(35, 35, 48, 0.98)" : "rgba(255, 255, 255, 0.98)",
            }}
          >
            <h2 className="text-lg font-bold">Ștergi înregistrarea?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contul Clerk rămâne, dar rolul de agent și datele cererii sunt eliminate. Anunțurile
              atribuite acestui agent sunt detașate.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600"
                onClick={() => setDeleteAgentId(null)}
              >
                Anulează
              </button>
              <button
                type="button"
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-white bg-red-600 hover:opacity-90 disabled:opacity-45"
                onClick={deleteAgent}
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
