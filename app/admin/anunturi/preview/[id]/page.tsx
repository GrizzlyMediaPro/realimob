"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MdArrowBack,
  MdCheckCircle,
  MdCancel,
  MdAssignmentInd,
  MdAutorenew,
  MdLocationOn,
  MdBed,
  MdBathroom,
  MdSquareFoot,
  MdLayers,
  MdCalendarToday,
  MdAttachMoney,
  MdDescription,
  MdInfo,
  MdPending,
  MdSwapHoriz,
  MdInfoOutline,
  MdClose,
  MdDelete,
} from "react-icons/md";
import PropertyDetailsSection from "../../../../components/PropertyDetailsSection";
import ListingDescriptionDisplay from "../../../../components/ListingDescriptionDisplay";

type DBAgent = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  rating: number;
  sectors: string[];
  _count?: { listings: number };
};

type ScoringBreakdownItem = {
  score: number;
  max: number;
  match?: boolean;
  detail: string;
};

type ScoredAgent = DBAgent & {
  scoring?: {
    total: number;
    breakdown: {
      sector: ScoringBreakdownItem;
      priceRating: ScoringBreakdownItem;
      load: ScoringBreakdownItem;
      ratingBonus: ScoringBreakdownItem;
    };
  };
};

type DBListing = {
  id: string;
  title: string;
  description: string;
  transactionType: string;
  propertyType: string;
  price: number;
  currency: string;
  location: string;
  address?: string | null;
  sector?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  agentId?: string | null;
  agent?: DBAgent | null;
  createdAt: string;
  images?: any[] | null;
  details?: any | null;
};

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export default function AdminPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isDark = useDarkMode();

  const [listing, setListing] = useState<DBListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<DBAgent[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [assigningAgent, setAssigningAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [changingAgent, setChangingAgent] = useState(false);
  const [scoredAgents, setScoredAgents] = useState<ScoredAgent[]>([]);
  const [scoredLoading, setScoredLoading] = useState(false);
  const [scoreInfoAgentId, setScoreInfoAgentId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchListing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${id}`);
      if (!res.ok) throw new Error("Anunțul nu a fost găsit");
      const data = await res.json();
      setListing(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/agents");
      if (!res.ok) return;
      const data = await res.json();
      setAgents(data.agents || []);
    } catch {}
  }, []);

  const fetchScoredAgents = useCallback(async () => {
    setScoredLoading(true);
    try {
      const res = await fetch(`/api/admin/agents?listingId=${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setScoredAgents(data.agents || []);
    } catch {}
    finally { setScoredLoading(false); }
  }, [id]);

  useEffect(() => {
    fetchListing();
    fetchAgents();
  }, [fetchListing, fetchAgents]);

  const handleApprove = async (agentId?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id, action: "approve", agentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Eroare la aprobare");
      }
      router.push("/admin/anunturi");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id, action: "deny" }),
      });
      if (!res.ok) throw new Error("Eroare la respingere");
      router.push("/admin/anunturi");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id, action: "assign_agent", agentId }),
      });
      if (!res.ok) throw new Error("Eroare la atribuirea agentului");
      setAssigningAgent(false);
      setSelectedAgentId(null);
      setChangingAgent(false);
      setScoredAgents([]);
      setScoreInfoAgentId(null);
      await fetchListing();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id, action: "auto_assign" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Eroare la atribuirea automată");
      }
      setAssigningAgent(false);
      setChangingAgent(false);
      setScoredAgents([]);
      setScoreInfoAgentId(null);
      await fetchListing();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminDelete = async () => {
    const r = deleteReason.trim();
    if (!r) {
      setDeleteError("Scrie motivul ștergerii (vizibil pentru creator).");
      return;
    }
    setDeleteError(null);
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: id,
          action: "delete",
          reason: r,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Eroare la ștergerea anunțului");
      }
      setDeleteModalOpen(false);
      setDeleteReason("");
      router.push("/admin/anunturi");
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Eroare la ștergere");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <p className="text-lg text-gray-500">Se încarcă previzualizarea...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-foreground gap-4">
        <p className="text-lg text-red-500">{error || "Anunțul nu a fost găsit"}</p>
        <Link
          href="/admin/anunturi"
          className="inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#C25A2B" }}
        >
          Înapoi la anunțuri
        </Link>
      </div>
    );
  }

  const details = listing.details || {};
  const allImages: string[] = [];
  if (Array.isArray(listing.images)) {
    listing.images.forEach((camera: any) => {
      if (camera.urls && Array.isArray(camera.urls)) {
        camera.urls.forEach((url: string) => allImages.push(url));
      }
    });
  }
  if (allImages.length === 0) allImages.push("/ap2.jpg");

  const suprafataUtila = details.suprafataUtila
    ? Number(details.suprafataUtila)
    : undefined;
  const camere = details.camere
    ? details.camere === "Studio"
      ? 1
      : Number(details.camere)
    : undefined;
  const nrBai = details.nrBai ? Number(details.nrBai) : undefined;
  const etaj = details.etaj || undefined;
  const anConstructie = details.anConstructie
    ? Number(details.anConstructie)
    : undefined;
  const pretPerMp =
    suprafataUtila && listing.price
      ? Math.round(listing.price / suprafataUtila).toLocaleString("ro-RO")
      : undefined;

  const locationText = listing.sector || listing.location || "București";

  const modStatus = (listing.status || "pending").toLowerCase();
  const isPendingModeration = modStatus === "pending";
  const isApprovedListing =
    modStatus === "approved" || modStatus === "sold";
  const isDeniedListing = modStatus === "denied";
  const hasAssignedAgent = Boolean(listing.agentId || listing.agent);

  return (
    <div className="min-h-screen text-foreground">
      {/* Bara admin fixă */}
      <div
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: isDark
            ? "rgba(20, 20, 28, 0.92)"
            : "rgba(255, 255, 255, 0.92)",
          borderBottom: isDark
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        }}
      >
        <div className="w-full max-w-[1250px] mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Stânga: Back + badge */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin/anunturi"
                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors text-sm"
              >
                <MdArrowBack size={18} />
                <span>Înapoi</span>
              </Link>
              {isPendingModeration && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#F59E0B",
                  }}
                >
                  <MdPending size={14} />
                  Previzualizare — În așteptarea aprobării
                </span>
              )}
              {isApprovedListing && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10B981",
                  }}
                >
                  <MdCheckCircle size={14} />
                  {modStatus === "sold"
                    ? "Previzualizare — Marcat vândut"
                    : hasAssignedAgent
                      ? "Previzualizare — Aprobat, cu agent"
                      : "Previzualizare — Aprobat (fără agent)"}
                </span>
              )}
              {isDeniedListing && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#EF4444",
                  }}
                >
                  <MdCancel size={14} />
                  Previzualizare — Respins
                </span>
              )}
            </div>

            {/* Dreapta: Butoane acțiuni */}
            <div className="flex items-center gap-2 flex-wrap">
              {isPendingModeration && (
                <>
                  <button
                    onClick={() => handleApprove()}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#10B981" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#059669"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#10B981"; }}
                  >
                    <MdCheckCircle size={16} />
                    Aprobă
                  </button>
                  <button
                    onClick={handleDeny}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#EF4444" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#DC2626"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#EF4444"; }}
                  >
                    <MdCancel size={16} />
                    Respinge
                  </button>
                  <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
                </>
              )}

              {(isApprovedListing || isPendingModeration) && (listing.agent && !changingAgent ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                    <MdAssignmentInd size={16} />
                    {listing.agent.name} ({listing.agent.rating}⭐)
                  </span>
                  <button
                    onClick={() => { setChangingAgent(true); setAssigningAgent(false); setScoredAgents([]); }}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                      color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                    }}
                  >
                    <MdSwapHoriz size={14} />
                    Schimbă
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (assigningAgent) {
                        setAssigningAgent(false);
                        setScoredAgents([]);
                      } else {
                        setAssigningAgent(true);
                        setSelectedAgentId(null);
                        setScoreInfoAgentId(null);
                        fetchScoredAgents();
                      }
                    }}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: assigningAgent
                        ? (isDark ? "rgba(59, 130, 246, 0.35)" : "rgba(59, 130, 246, 0.2)")
                        : (isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)"),
                      color: "#3B82F6",
                    }}
                  >
                    <MdAssignmentInd size={16} />
                    Atribuie Agent
                  </button>
                  <button
                    onClick={handleAutoAssign}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: isDark ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.1)",
                      color: "#A855F7",
                    }}
                  >
                    <MdAutorenew size={16} />
                    Atribuire Automată
                  </button>
                  {changingAgent && (
                    <button
                      onClick={() => { setChangingAgent(false); setAssigningAgent(false); setScoredAgents([]); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                        color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
                      }}
                    >
                      <MdClose size={14} />
                      Anulează
                    </button>
                  )}
                </>
              ))}
              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteModalOpen(true);
                }}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#991B1B" }}
                title="Șterge definitiv din baza de date"
              >
                <MdDelete size={16} />
                Șterge anunț
              </button>
            </div>
          </div>

          {/* Panel selectare agent cu scoring */}
          {assigningAgent && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Selectează agent — ordonat după potrivire
                </p>
                <button
                  onClick={() => { setAssigningAgent(false); setScoredAgents([]); setScoreInfoAgentId(null); if (changingAgent) setChangingAgent(false); }}
                  className="text-xs text-gray-400 hover:text-foreground transition-colors"
                >Închide</button>
              </div>
              {scoredLoading ? (
                <p className="text-sm text-gray-400 py-3 text-center">Se calculează scorurile...</p>
              ) : (
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {scoredAgents.map((agent, idx) => {
                    const score = agent.scoring?.total ?? 0;
                    const isInfoOpen = scoreInfoAgentId === agent.id;
                    const scoreColor = score >= 70 ? "#10B981" : score >= 45 ? "#F59E0B" : "#EF4444";
                    return (
                      <div key={agent.id}>
                        <div className="flex items-center gap-3 p-2.5 rounded-lg transition-all"
                          style={{
                            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                            border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)",
                          }}
                        >
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-5 text-center shrink-0">{idx + 1}</span>
                          <div className="w-12 shrink-0">
                            <div className="text-xs font-bold text-center mb-0.5" style={{ color: scoreColor }}>{score}</div>
                            <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: scoreColor }} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground truncate">{agent.name}</span>
                              <span className="text-xs text-gray-400 shrink-0">{agent.rating}⭐</span>
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{agent.sectors.join(", ")} · {agent._count?.listings || 0} anunțuri</div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setScoreInfoAgentId(isInfoOpen ? null : agent.id); }}
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                            style={{
                              backgroundColor: isInfoOpen ? (isDark ? "rgba(194,90,43,0.2)" : "rgba(194,90,43,0.1)") : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                              color: isInfoOpen ? "#C25A2B" : (isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"),
                            }}
                            title="Detalii scor"
                          ><MdInfoOutline size={14} /></button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAssignAgent(agent.id); }}
                            disabled={actionLoading}
                            className="px-3 py-1 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 shrink-0"
                            style={{ backgroundColor: "#C25A2B" }}
                          >Atribuie</button>
                        </div>
                        {isInfoOpen && agent.scoring && (
                          <div className="ml-8 mt-1 mb-1 p-3 rounded-lg text-xs space-y-2"
                            style={{
                              background: isDark ? "rgba(27,27,33,0.8)" : "rgba(245,245,248,0.9)",
                              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                            }}
                          >
                            <p className="font-semibold text-foreground mb-1.5">De ce scorul {score}/100?</p>
                            {[
                              { label: "Sector", ...agent.scoring.breakdown.sector },
                              { label: "Preț ↔ Rating", ...agent.scoring.breakdown.priceRating },
                              { label: "Distribuție egală", ...agent.scoring.breakdown.load },
                              { label: "Bonus rating", ...agent.scoring.breakdown.ratingBonus },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <span className="font-medium text-gray-600 dark:text-gray-300 shrink-0">{item.label}:</span>
                                  <span className="text-gray-400 dark:text-gray-500 truncate">{item.detail}</span>
                                </div>
                                <span className="font-bold shrink-0" style={{ color: item.score >= item.max * 0.7 ? "#10B981" : item.score >= item.max * 0.4 ? "#F59E0B" : "#EF4444" }}>
                                  +{item.score}/{item.max}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Conținut pagină — vizualizare ca utilizator */}
      <main
        className="px-4 md:px-0 pb-12"
        style={{ paddingTop: assigningAgent ? "360px" : "80px" }}
      >
        <div className="w-full max-w-[1250px] mx-auto">
          <div
            className="rounded-none md:rounded-2xl pt-4 md:py-6 md:px-0"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            {/* Breadcrumbs (ca user) */}
            <nav
              className="text-sm text-gray-600 dark:text-gray-400 mb-3"
              aria-label="Breadcrumb"
            >
              <span className="hover:underline cursor-default">Acasă</span>
              <span className="mx-2">/</span>
              <span className="hover:underline cursor-default">
                {listing.transactionType === "inchiriere"
                  ? "Închiriere"
                  : "Vânzare"}
              </span>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">
                {listing.title}
              </span>
            </nav>

            {/* Titlu + locație */}
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                {listing.title}
              </h1>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all mb-2">
                ID anunț: {listing.id}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                <div className="flex items-center gap-1.5">
                  <MdLocationOn size={18} />
                  <span>{locationText}</span>
                </div>
              </div>
            </div>

            {/* Galerie imagini */}
            <div className="mb-6 md:mb-8">
              {/* Imaginea principală */}
              <div className="relative w-full aspect-video md:aspect-2/1 rounded-xl overflow-hidden mb-3">
                <Image
                  src={allImages[activeImageIndex]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1250px"
                  priority
                />
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className="relative w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden shrink-0 transition-all"
                      style={{
                        border:
                          idx === activeImageIndex
                            ? "2px solid #C25A2B"
                            : isDark
                            ? "2px solid rgba(255,255,255,0.1)"
                            : "2px solid rgba(0,0,0,0.08)",
                        opacity: idx === activeImageIndex ? 1 : 0.7,
                      }}
                    >
                      <Image
                        src={img}
                        alt={`Imagine ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Conținut principal */}
            <section className="space-y-6 md:space-y-8">
              {/* Preț */}
              <div className="text-2xl md:text-3xl font-bold">
                {listing.price.toLocaleString("ro-RO")} {listing.currency}
              </div>

              {/* Carduri detalii */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {camere !== undefined && (
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
                    }}
                  >
                    <MdBed className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                    <div className="text-xl font-bold">{camere}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Dormitoare
                    </div>
                  </div>
                )}
                {nrBai !== undefined && (
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
                    }}
                  >
                    <MdBathroom className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                    <div className="text-xl font-bold">{nrBai}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Băi
                    </div>
                  </div>
                )}
                {suprafataUtila !== undefined && (
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
                    }}
                  >
                    <MdSquareFoot className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                    <div className="text-xl font-bold">
                      {suprafataUtila} m²
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Suprafață utilă
                    </div>
                  </div>
                )}
                {etaj !== undefined && (
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
                    }}
                  >
                    <MdLayers className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                    <div className="text-xl font-bold">
                      {typeof etaj === "number" ? `Etaj ${etaj}` : etaj}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Etaj
                    </div>
                  </div>
                )}
                {anConstructie !== undefined && (
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
                    }}
                  >
                    <MdCalendarToday className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                    <div className="text-xl font-bold">{anConstructie}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      An construcție
                    </div>
                  </div>
                )}
                {pretPerMp && (
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
                    }}
                  >
                    <MdAttachMoney className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                    <div className="text-xl font-bold">{pretPerMp} €/m²</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Preț pe m²
                    </div>
                  </div>
                )}
              </div>

              {/* Descriere */}
              <div
                className="rounded-2xl p-5 md:p-6 relative overflow-hidden"
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
                }}
              >
                <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold mb-3">
                  <MdDescription className="text-[#C25A2B]" />
                  Descriere
                </h2>
                <ListingDescriptionDisplay
                  html={listing.description}
                  fallback="Fără descriere."
                />
              </div>

              {/* Detalii proprietate din DB */}
              {details && <PropertyDetailsSection details={details} />}
            </section>
          </div>
        </div>
      </main>

      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-delete-listing-title"
        >
          <div
            className="w-full max-w-md rounded-2xl p-5 md:p-6 shadow-xl"
            style={{
              background: isDark ? "rgba(28,28,36,0.98)" : "rgba(255,255,255,0.98)",
              border: isDark
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <h2
              id="admin-delete-listing-title"
              className="text-lg font-semibold text-foreground mb-2"
            >
              Ștergi acest anunț?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Anunțul va fi eliminat definitiv. Creatorul primește o notificare în
              cont și trebuie să vezi motivul pe care îl scrii mai jos.
            </p>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Motiv (obligatoriu)
            </label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-gray-400 resize-y min-h-[100px]"
              placeholder="Ex.: Conținut care încalcă regulamentul platformei…"
            />
            {deleteError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">{deleteError}</p>
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-4">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteReason("");
                  setDeleteError(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                }}
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={() => void handleAdminDelete()}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#991B1B" }}
              >
                {actionLoading ? "Se șterge…" : "Șterge definitiv"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
