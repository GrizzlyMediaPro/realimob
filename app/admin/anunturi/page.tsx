"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdminListingCard from "../../components/AdminListingCard";
import {
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdArrowBack,
  MdClose,
  MdFilterList,
  MdAssignmentInd,
  MdAutorenew,
  MdVisibility,
  MdSwapHoriz,
  MdInfoOutline,
} from "react-icons/md";
import { CiFilter, CiImageOn } from "react-icons/ci";
import Link from "next/link";
import {
  formatListingPriceDisplay,
  getFirstListingImageUrl,
  countListingImages,
} from "@/lib/listingToAnunt";
import AdminChestionareVizionariPanel from "./AdminChestionareVizionariPanel";
import AdminListingSalesPanel from "./AdminListingSalesPanel";

type AnuntStatus = "active" | "inactive" | "pending";
type DeactivationReason =
  | "A trecut prea mult timp"
  | "Vandut"
  | "Dezactivat utilizator"
  | "Dezactivat admin";

interface AdminAnuntCardItem {
  id: string;
  titlu: string;
  image: string;
  pret: string;
  priceNumber: number;
  tags: string[];
  locationText: string;
  imageCount: number;
  status: AnuntStatus;
  deactivationReason?: DeactivationReason;
  suprafataUtil?: number;
  dormitoare?: number;
  bai?: number;
  etaj?: number | string;
  anConstructie?: number;
}

// ── Tipuri pentru anunțurile din baza de date ──
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
  sector?: string | null;
  status: string;
  agentId?: string | null;
  agent?: DBAgent | null;
  createdAt: string;
  images?: unknown;
  details?: unknown;
};

/** Aliniat la `lib/listingToAnunt.ts` — câmpuri pentru filtre în lista admin. */
function cardFieldsFromListingDetails(details: unknown): {
  suprafataUtil?: number;
  dormitoare?: number;
  bai?: number;
  etaj?: number | string;
  anConstructie?: number;
} {
  if (!details || typeof details !== "object") return {};
  const d = details as Record<string, unknown>;
  let dormitoare: number | undefined;
  if (d.camere !== undefined && d.camere !== null) {
    if (d.camere === "Studio") dormitoare = 1;
    else {
      const n = Number(d.camere);
      if (!Number.isNaN(n)) dormitoare = n;
    }
  }
  if (dormitoare === undefined && d.nrDormitoareCasa != null) {
    const n = Number(d.nrDormitoareCasa);
    if (!Number.isNaN(n)) dormitoare = n;
  }
  if (dormitoare === undefined && d.nrCamere != null) {
    const n = Number(d.nrCamere);
    if (!Number.isNaN(n)) dormitoare = n;
  }
  const supRaw = d.suprafataUtila;
  const sup =
    supRaw != null && String(supRaw).trim() !== ""
      ? Number(supRaw)
      : undefined;
  const baiRaw = d.nrBai;
  const baiNum =
    baiRaw != null && String(baiRaw).trim() !== "" ? Number(baiRaw) : undefined;
  const anRaw =
    d.anConstructie != null && String(d.anConstructie).trim() !== ""
      ? Number(d.anConstructie)
      : undefined;

  return {
    suprafataUtil:
      sup !== undefined && !Number.isNaN(sup) ? sup : undefined,
    dormitoare,
    bai: baiNum !== undefined && !Number.isNaN(baiNum) ? baiNum : undefined,
    etaj:
      d.etaj !== undefined && d.etaj !== ""
        ? (d.etaj as number | string)
        : undefined,
    anConstructie:
      anRaw !== undefined && !Number.isNaN(anRaw) ? anRaw : undefined,
  };
}


export default function AdminAnunturiPage() {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [showPending, setShowPending] = useState(false);
  const [anunturiSubTab, setAnunturiSubTab] = useState<
    "anunturi" | "chestionare" | "vanzari"
  >("anunturi");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filtre
  const [pretMinim, setPretMinim] = useState("");
  const [pretMaxim, setPretMaxim] = useState("");
  const [sector, setSector] = useState("");
  const [suprafataMinima, setSuprafataMinima] = useState("");
  const [suprafataMaxima, setSuprafataMaxima] = useState("");
  const [dormitoare, setDormitoare] = useState("");
  const [bai, setBai] = useState("");
  const [etaj, setEtaj] = useState("");
  const [anConstructieMin, setAnConstructieMin] = useState("");
  const [anConstructieMax, setAnConstructieMax] = useState("");
  const [motivDezactivare, setMotivDezactivare] = useState<DeactivationReason | "">("");

  // ── State pentru anunțuri pending din DB ──
  const [dbPendingListings, setDbPendingListings] = useState<DBListing[]>([]);
  const [dbPendingLoading, setDbPendingLoading] = useState(false);
  const [dbPendingError, setDbPendingError] = useState<string | null>(null);
  const [dbAgents, setDbAgents] = useState<DBAgent[]>([]);
  const [assigningListingId, setAssigningListingId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [changingAgentListingId, setChangingAgentListingId] = useState<string | null>(null);
  const [scoredAgents, setScoredAgents] = useState<ScoredAgent[]>([]);
  const [scoredLoading, setScoredLoading] = useState(false);
  const [scoreInfoAgentId, setScoreInfoAgentId] = useState<string | null>(null);
  const [dbApprovedListings, setDbApprovedListings] = useState<DBListing[]>([]);
  const [dbDeniedListings, setDbDeniedListings] = useState<DBListing[]>([]);
  const [dbListingsLoading, setDbListingsLoading] = useState(false);
  const [dbListingsError, setDbListingsError] = useState<string | null>(null);

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

  // ── Fetch pending listings din DB ──
  const fetchPendingListings = useCallback(async () => {
    setDbPendingLoading(true);
    setDbPendingError(null);
    try {
      const res = await fetch("/api/admin/listings?status=pending&limit=100");
      if (!res.ok) throw new Error("Eroare la încărcarea anunțurilor pending");
      const data = await res.json();
      setDbPendingListings(data.listings || []);
    } catch (err: any) {
      setDbPendingError(err.message || "Eroare la încărcarea anunțurilor.");
    } finally {
      setDbPendingLoading(false);
    }
  }, []);

  const fetchListingsByStatus = useCallback(async () => {
    setDbListingsLoading(true);
    setDbListingsError(null);
    try {
      const [approvedRes, deniedRes] = await Promise.all([
        fetch("/api/admin/listings?status=approved&limit=100"),
        fetch("/api/admin/listings?status=denied&limit=100"),
      ]);

      if (!approvedRes.ok || !deniedRes.ok) {
        throw new Error("Eroare la încărcarea anunțurilor active/inactive");
      }

      const [approvedData, deniedData] = await Promise.all([
        approvedRes.json(),
        deniedRes.json(),
      ]);

      setDbApprovedListings(approvedData.listings || []);
      setDbDeniedListings(deniedData.listings || []);
    } catch (error: any) {
      setDbListingsError(error.message || "Eroare la încărcarea anunțurilor.");
    } finally {
      setDbListingsLoading(false);
    }
  }, []);

  // ── Fetch agenți ──
  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/agents");
      if (!res.ok) throw new Error("Eroare la încărcarea agenților");
      const data = await res.json();
      setDbAgents(data.agents || []);
    } catch (err: any) {
      console.error("Failed to fetch agents:", err);
    }
  }, []);

  // ── Fetch agenți cu scoring pentru un listing specific ──
  const fetchScoredAgents = useCallback(async (listingId: string) => {
    setScoredLoading(true);
    try {
      const res = await fetch(`/api/admin/agents?listingId=${listingId}`);
      if (!res.ok) throw new Error("Eroare");
      const data = await res.json();
      setScoredAgents(data.agents || []);
    } catch {
      setScoredAgents([]);
    } finally {
      setScoredLoading(false);
    }
  }, []);

  // Încarcă pending count la mount, și detalii complete când se selectează tab-ul
  useEffect(() => {
    fetchPendingListings(); // Încarcă mereu pentru count
    fetchListingsByStatus();
  }, [fetchPendingListings, fetchListingsByStatus]);

  useEffect(() => {
    if (showPending) {
      fetchPendingListings();
      fetchAgents();
    }
  }, [showPending, fetchPendingListings, fetchAgents]);

  // ── Acțiuni admin pentru pending listings ──
  const handleApprove = async (listingId: string, agentId?: string) => {
    setActionLoading(listingId);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, action: "approve", agentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Eroare la aprobare");
      }
      await fetchPendingListings();
    } catch (err: any) {
      setDbPendingError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (listingId: string) => {
    setActionLoading(listingId);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, action: "deny" }),
      });
      if (!res.ok) throw new Error("Eroare la respingere");
      await fetchPendingListings();
    } catch (err: any) {
      setDbPendingError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignAgent = async (listingId: string, agentId: string) => {
    setActionLoading(listingId);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, action: "assign_agent", agentId }),
      });
      if (!res.ok) throw new Error("Eroare la atribuirea agentului");
      setAssigningListingId(null);
      setSelectedAgentId(null);
      await fetchPendingListings();
    } catch (err: any) {
      setDbPendingError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutoAssign = async (listingId: string) => {
    setActionLoading(listingId);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, action: "auto_assign" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Eroare la atribuirea automată");
      }
      await fetchPendingListings();
    } catch (err: any) {
      setDbPendingError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const allAnunturi = useMemo<AdminAnuntCardItem[]>(() => {
    const approved = dbApprovedListings.map((listing) => {
      return {
        id: listing.id,
        titlu: listing.title,
        image: getFirstListingImageUrl(listing.images),
        pret: formatListingPriceDisplay(
          listing.price,
          listing.currency,
          listing.details as Record<string, unknown> | null,
        ),
        priceNumber: listing.price,
        tags: [listing.propertyType, listing.transactionType, listing.sector || listing.location].filter(Boolean),
        locationText: listing.sector || listing.location || "Zona centrală",
        imageCount: countListingImages(listing.images),
        status: "active" as AnuntStatus,
        ...cardFieldsFromListingDetails(listing.details),
      };
    });

    const denied = dbDeniedListings.map((listing) => {
      return {
        id: listing.id,
        titlu: listing.title,
        image: getFirstListingImageUrl(listing.images),
        pret: formatListingPriceDisplay(
          listing.price,
          listing.currency,
          listing.details as Record<string, unknown> | null,
        ),
        priceNumber: listing.price,
        tags: [listing.propertyType, listing.transactionType, listing.sector || listing.location].filter(Boolean),
        locationText: listing.sector || listing.location || "Zona centrală",
        imageCount: countListingImages(listing.images),
        status: "inactive" as AnuntStatus,
        deactivationReason: "Dezactivat admin" as DeactivationReason,
        ...cardFieldsFromListingDetails(listing.details),
      };
    });

    return [...approved, ...denied];
  }, [dbApprovedListings, dbDeniedListings]);

  const filteredAnunturi = useMemo(() => {
    let filtered = allAnunturi;
    
    // Filtrare după status — pending vine acum din DB, nu din mock
    if (showPending) {
      return []; // Pending se afișează separat din DB
    } else {
      filtered = filtered.filter((a) => a.status === activeTab);
    }
    
    // Filtrare după preț
    if (pretMinim) {
      const pretMin = Number(pretMinim);
      filtered = filtered.filter((a) => a.priceNumber >= pretMin);
    }
    if (pretMaxim) {
      const pretMax = Number(pretMaxim);
      filtered = filtered.filter((a) => a.priceNumber <= pretMax);
    }
    
    // Filtrare după sector
    if (sector) {
      filtered = filtered.filter((a) =>
        a.tags.some((tag) => tag.toLowerCase().includes(sector.toLowerCase()))
      );
    }
    
    // Filtrare după suprafață
    if (suprafataMinima) {
      const supMin = Number(suprafataMinima);
      filtered = filtered.filter(
        (a) => a.suprafataUtil && a.suprafataUtil >= supMin
      );
    }
    if (suprafataMaxima) {
      const supMax = Number(suprafataMaxima);
      filtered = filtered.filter(
        (a) => a.suprafataUtil && a.suprafataUtil <= supMax
      );
    }
    
    // Filtrare după dormitoare
    if (dormitoare) {
      const dorm = Number(dormitoare);
      filtered = filtered.filter(
        (a) => a.dormitoare && a.dormitoare === dorm
      );
    }
    
    // Filtrare după băi
    if (bai) {
      const baiCount = Number(bai);
      filtered = filtered.filter((a) => a.bai && a.bai === baiCount);
    }
    
    // Filtrare după etaj
    if (etaj) {
      const etajValue = etaj.toLowerCase();
      filtered = filtered.filter((a) => {
        if (typeof a.etaj === "number") {
          return a.etaj === Number(etaj);
        } else if (typeof a.etaj === "string") {
          return a.etaj.toLowerCase().includes(etajValue);
        }
        return false;
      });
    }
    
    // Filtrare după an construcție
    if (anConstructieMin) {
      const anMin = Number(anConstructieMin);
      filtered = filtered.filter(
        (a) => a.anConstructie && a.anConstructie >= anMin
      );
    }
    if (anConstructieMax) {
      const anMax = Number(anConstructieMax);
      filtered = filtered.filter(
        (a) => a.anConstructie && a.anConstructie <= anMax
      );
    }
    
    // Filtrare după motiv dezactivare (doar pentru inactive)
    if (motivDezactivare && (showPending ? false : activeTab === "inactive")) {
      filtered = filtered.filter(
        (a) => a.deactivationReason === motivDezactivare
      );
    }
    
    return filtered;
  }, [
    allAnunturi,
    activeTab,
    showPending,
    pretMinim,
    pretMaxim,
    sector,
    suprafataMinima,
    suprafataMaxima,
    dormitoare,
    bai,
    etaj,
    anConstructieMin,
    anConstructieMax,
    motivDezactivare,
  ]);
  
  const hasActiveFilters = useMemo(() => {
    return !!(
      pretMinim ||
      pretMaxim ||
      sector ||
      suprafataMinima ||
      suprafataMaxima ||
      dormitoare ||
      bai ||
      etaj ||
      anConstructieMin ||
      anConstructieMax ||
      motivDezactivare
    );
  }, [
    pretMinim,
    pretMaxim,
    sector,
    suprafataMinima,
    suprafataMaxima,
    dormitoare,
    bai,
    etaj,
    anConstructieMin,
    anConstructieMax,
    motivDezactivare,
  ]);
  
  const clearFilters = () => {
    setPretMinim("");
    setPretMaxim("");
    setSector("");
    setSuprafataMinima("");
    setSuprafataMaxima("");
    setDormitoare("");
    setBai("");
    setEtaj("");
    setAnConstructieMin("");
    setAnConstructieMax("");
    setMotivDezactivare("");
  };

  const getAnuntHref = (anunt: AdminAnuntCardItem): string =>
    `/admin/anunturi/preview/${anunt.id}`;

  const pendingCount = dbPendingListings.length;
  const activeCount = useMemo(
    () => dbApprovedListings.length,
    [dbApprovedListings.length]
  );
  const inactiveCount = useMemo(
    () => dbDeniedListings.length,
    [dbDeniedListings.length]
  );

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
                Gestionează Anunțuri
              </h1>
              <p
                className="text-gray-500 dark:text-gray-400"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Administrează toate anunțurile platformei
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-black/10 dark:border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setAnunturiSubTab("anunturi")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                anunturiSubTab === "anunturi"
                  ? "bg-[#C25A2B] text-white"
                  : "bg-black/5 dark:bg-white/10 text-foreground hover:opacity-90"
              }`}
            >
              Anunțuri
            </button>
            <button
              type="button"
              onClick={() => setAnunturiSubTab("chestionare")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                anunturiSubTab === "chestionare"
                  ? "bg-[#C25A2B] text-white"
                  : "bg-black/5 dark:bg-white/10 text-foreground hover:opacity-90"
              }`}
            >
              Chestionare vizionări
            </button>
            <button
              type="button"
              onClick={() => setAnunturiSubTab("vanzari")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                anunturiSubTab === "vanzari"
                  ? "bg-[#C25A2B] text-white"
                  : "bg-black/5 dark:bg-white/10 text-foreground hover:opacity-90"
              }`}
            >
              Vânzări
            </button>
          </div>

          {anunturiSubTab === "chestionare" ? (
            <AdminChestionareVizionariPanel isDark={isDark} />
          ) : anunturiSubTab === "vanzari" ? (
            <AdminListingSalesPanel isDark={isDark} />
          ) : (
            <>
          {/* Selector Status */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </label>
            <div className="relative">
              <select
                value={showPending ? "pending" : activeTab}
                onChange={(e) => {
                  if (e.target.value === "pending") {
                    setShowPending(true);
                    setActiveTab("active");
                  } else {
                    setShowPending(false);
                    setActiveTab(e.target.value as "active" | "inactive");
                  }
                }}
                className="px-4 py-2 rounded-lg border backdrop-blur-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none pr-10"
                style={{
                  background: isDark
                    ? "rgba(35, 35, 48, 0.45)"
                    : "rgba(255, 255, 255, 0.55)",
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.45)",
                  boxShadow: isDark
                    ? "0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                    : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                  backdropFilter: "blur(60px) saturate(1.6)",
                  WebkitBackdropFilter: "blur(60px) saturate(1.6)",
                }}
              >
                <option value="active">
                  Anunțuri Active ({activeCount})
                </option>
                <option value="inactive">
                  Anunțuri Inactive ({inactiveCount})
                </option>
                <option value="pending">
                  Pending Listings ({pendingCount})
                </option>
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

          {/* Secțiune Listings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl md:text-4xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                {showPending
                  ? "Anunțuri în Așteptare"
                  : activeTab === "active"
                  ? "Anunțuri Active"
                  : "Anunțuri Inactive"}
              </h2>
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
                <CiFilter size={20} />
                <span>Filtre</span>
                {hasActiveFilters && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-white/20 text-white">
                    {[
                      pretMinim,
                      pretMaxim,
                      sector,
                      suprafataMinima,
                      suprafataMaxima,
                      dormitoare,
                      bai,
                      etaj,
                      anConstructieMin,
                      anConstructieMax,
                      motivDezactivare,
                    ].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
            
            {/* Panou Filtre */}
            {isFilterOpen && (
              <div
                className="rounded-none md:rounded-3xl overflow-hidden relative mb-6"
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
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-xl font-bold text-foreground"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      Filtrează Anunțuri
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Preț minim */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preț minim (€)
                      </label>
                      <input
                        type="text"
                        value={pretMinim}
                        onChange={(e) => setPretMinim(e.target.value)}
                        placeholder="ex: 50000"
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
                    
                    {/* Preț maxim */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preț maxim (€)
                      </label>
                      <input
                        type="text"
                        value={pretMaxim}
                        onChange={(e) => setPretMaxim(e.target.value)}
                        placeholder="ex: 200000"
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
                    
                    {/* Sector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sector / Locație
                      </label>
                      <input
                        type="text"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        placeholder="ex: Sector 1"
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
                    
                    {/* Suprafață minimă */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Suprafață minimă (m²)
                      </label>
                      <input
                        type="number"
                        value={suprafataMinima}
                        onChange={(e) => setSuprafataMinima(e.target.value)}
                        placeholder="ex: 50"
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
                    
                    {/* Suprafață maximă */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Suprafață maximă (m²)
                      </label>
                      <input
                        type="number"
                        value={suprafataMaxima}
                        onChange={(e) => setSuprafataMaxima(e.target.value)}
                        placeholder="ex: 150"
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
                    
                    {/* Dormitoare */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Număr dormitoare
                      </label>
                      <input
                        type="number"
                        value={dormitoare}
                        onChange={(e) => setDormitoare(e.target.value)}
                        placeholder="ex: 2"
                        min="1"
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
                    
                    {/* Băi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Număr băi
                      </label>
                      <input
                        type="number"
                        value={bai}
                        onChange={(e) => setBai(e.target.value)}
                        placeholder="ex: 1"
                        min="1"
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
                    
                    {/* Etaj */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Etaj
                      </label>
                      <input
                        type="text"
                        value={etaj}
                        onChange={(e) => setEtaj(e.target.value)}
                        placeholder="ex: 3 sau Parter"
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
                    
                    {/* An construcție minim */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        An construcție minim
                      </label>
                      <input
                        type="number"
                        value={anConstructieMin}
                        onChange={(e) => setAnConstructieMin(e.target.value)}
                        placeholder="ex: 2010"
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
                    
                    {/* An construcție maxim */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        An construcție maxim
                      </label>
                      <input
                        type="number"
                        value={anConstructieMax}
                        onChange={(e) => setAnConstructieMax(e.target.value)}
                        placeholder="ex: 2024"
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
                    
                    {/* Motiv dezactivare - doar pentru anunțuri inactive */}
                    {!showPending && activeTab === "inactive" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Motiv dezactivare
                        </label>
                        <div className="relative">
                          <select
                            value={motivDezactivare}
                            onChange={(e) =>
                              setMotivDezactivare(
                                e.target.value as DeactivationReason | ""
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
                            <option value="">Toate</option>
                            <option value="A trecut prea mult timp">
                              A trecut prea mult timp
                            </option>
                            <option value="Vandut">Vandut</option>
                            <option value="Dezactivat utilizator">
                              Dezactivat utilizator
                            </option>
                            <option value="Dezactivat admin">
                              Dezactivat admin
                            </option>
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
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Pending din DB ── */}
            {showPending ? (
              <>
                {dbPendingLoading && (
                  <div
                    className="rounded-none md:rounded-3xl p-12 text-center"
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
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      Se încarcă anunțurile...
                    </p>
                  </div>
                )}
                {dbPendingError && (
                  <div className="rounded-xl p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 text-sm">{dbPendingError}</p>
                  </div>
                )}
                {!dbPendingLoading && dbPendingListings.length === 0 && (
                  <div
                    className="rounded-none md:rounded-3xl p-12 text-center"
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
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      Nu există anunțuri în așteptare.
                    </p>
                  </div>
                )}
                {!dbPendingLoading && dbPendingListings.length > 0 && (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {dbPendingListings.length} anunț{dbPendingListings.length === 1 ? "" : "uri"} în așteptare
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {dbPendingListings.map((listing) => {
                        const isActioning = actionLoading === listing.id;
                        const thumb = getFirstListingImageUrl(listing.images);
                        const imgCount = countListingImages(listing.images);
                        const hasRealThumb = thumb !== "/ap2.jpg";

                        return (
                          <div
                            key={listing.id}
                            className="rounded-xl overflow-hidden relative"
                            style={{
                              background: isDark
                                ? "rgba(35, 35, 48, 0.5)"
                                : "rgba(255, 255, 255, 0.6)",
                              border: isDark
                                ? "1px solid rgba(255, 255, 255, 0.12)"
                                : "1px solid rgba(255, 255, 255, 0.5)",
                              boxShadow: isDark
                                ? "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                                : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                              backdropFilter: "blur(60px) saturate(1.6)",
                              WebkitBackdropFilter: "blur(60px) saturate(1.6)",
                              opacity: isActioning ? 0.6 : 1,
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div className="p-4">
                              {/* Informații anunț */}
                              <div className="flex items-start gap-4 mb-3">
                                <div className="w-20 h-20 shrink-0 relative overflow-hidden rounded-lg border border-black/5 dark:border-white/10">
                                  {hasRealThumb ? (
                                    <Image
                                      src={thumb}
                                      alt={listing.title}
                                      fill
                                      className="object-cover object-center"
                                      sizes="80px"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                      <CiImageOn
                                        className="text-gray-400 dark:text-gray-500"
                                        size={28}
                                        aria-hidden
                                      />
                                    </div>
                                  )}
                                  {imgCount > 0 && (
                                    <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs flex items-center gap-1 backdrop-blur-sm">
                                      <CiImageOn size={12} aria-hidden />
                                      <span>{imgCount}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3
                                    className="text-base font-semibold text-foreground mb-1"
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {listing.title}
                                  </h3>
                                  <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <span className="font-bold text-foreground text-base">
                                      {formatListingPriceDisplay(
                                        listing.price,
                                        listing.currency,
                                        listing.details as Record<string, unknown> | null,
                                      )}
                                    </span>
                                    {listing.sector && (
                                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                        {listing.sector}
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                      {listing.propertyType}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                      {listing.transactionType}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 dark:text-gray-500">
                                    Creat la: {new Date(listing.createdAt).toLocaleDateString("ro-RO")}
                                  </p>
                                </div>

                                {/* Agent info */}
                                <div className="shrink-0 text-right">
                                  {listing.agent ? (
                                    <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
                                      <MdAssignmentInd size={16} />
                                      {listing.agent.name} ({listing.agent.rating}⭐)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-sm text-amber-500 dark:text-amber-400">
                                      <MdPending size={16} />
                                      Fără agent
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Butoane acțiuni */}
                              <div className="flex items-center gap-2 flex-wrap pt-3 border-t"
                                style={{
                                  borderColor: isDark
                                    ? "rgba(255, 255, 255, 0.08)"
                                    : "rgba(0, 0, 0, 0.06)",
                                }}
                              >
                                <button
                                  onClick={() => handleApprove(listing.id)}
                                  disabled={isActioning}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                                  style={{ backgroundColor: "#10B981" }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#059669"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#10B981"; }}
                                >
                                  <MdCheckCircle size={16} />
                                  Aprobă
                                </button>
                                <button
                                  onClick={() => handleDeny(listing.id)}
                                  disabled={isActioning}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                                  style={{ backgroundColor: "#EF4444" }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#DC2626"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#EF4444"; }}
                                >
                                  <MdCancel size={16} />
                                  Respinge
                                </button>

                                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

                                {/* Agent atribuit → afișare agent + buton Schimbă */}
                                {listing.agent && changingAgentListingId !== listing.id ? (
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                      <MdAssignmentInd size={16} />
                                      {listing.agent.name} ({listing.agent.rating}⭐)
                                    </span>
                                    <button
                                      onClick={() => {
                                        setChangingAgentListingId(listing.id);
                                        setAssigningListingId(null);
                                        setScoredAgents([]);
                                      }}
                                      disabled={isActioning}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                      style={{
                                        backgroundColor: isDark
                                          ? "rgba(255, 255, 255, 0.08)"
                                          : "rgba(0, 0, 0, 0.05)",
                                        color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                                      }}
                                    >
                                      <MdSwapHoriz size={14} />
                                      Schimbă
                                    </button>
                                  </div>
                                ) : (
                                  /* Fără agent sau în modul Schimbă → butoane de atribuire */
                                  <>
                                    <button
                                      onClick={() => {
                                        if (assigningListingId === listing.id) {
                                          setAssigningListingId(null);
                                          setScoredAgents([]);
                                        } else {
                                          setAssigningListingId(listing.id);
                                          setSelectedAgentId(null);
                                          setScoreInfoAgentId(null);
                                          fetchScoredAgents(listing.id);
                                        }
                                      }}
                                      disabled={isActioning}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                      style={{
                                        backgroundColor: assigningListingId === listing.id
                                          ? (isDark ? "rgba(59, 130, 246, 0.35)" : "rgba(59, 130, 246, 0.2)")
                                          : (isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)"),
                                        color: "#3B82F6",
                                      }}
                                    >
                                      <MdAssignmentInd size={16} />
                                      Atribuie Agent
                                    </button>
                                    <button
                                      onClick={() => handleAutoAssign(listing.id)}
                                      disabled={isActioning}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                      style={{
                                        backgroundColor: isDark
                                          ? "rgba(168, 85, 247, 0.2)"
                                          : "rgba(168, 85, 247, 0.1)",
                                        color: "#A855F7",
                                      }}
                                    >
                                      <MdAutorenew size={16} />
                                      Atribuire Automată
                                    </button>
                                    {changingAgentListingId === listing.id && (
                                      <button
                                        onClick={() => {
                                          setChangingAgentListingId(null);
                                          setAssigningListingId(null);
                                          setScoredAgents([]);
                                        }}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                        style={{
                                          backgroundColor: isDark
                                            ? "rgba(255, 255, 255, 0.08)"
                                            : "rgba(0, 0, 0, 0.05)",
                                          color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
                                        }}
                                      >
                                        <MdClose size={14} />
                                        Anulează
                                      </button>
                                    )}
                                  </>
                                )}

                                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

                                <Link
                                  href={`/admin/anunturi/preview/${listing.id}`}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                  style={{
                                    backgroundColor: isDark
                                      ? "rgba(194, 90, 43, 0.2)"
                                      : "rgba(194, 90, 43, 0.1)",
                                    color: "#C25A2B",
                                  }}
                                >
                                  <MdVisibility size={16} />
                                  Vezi ca utilizator
                                </Link>
                              </div>

                              {/* Panel selectare agent cu scoring */}
                              {assigningListingId === listing.id && (
                                <div
                                  className="mt-3 pt-3 border-t"
                                  style={{
                                    borderColor: isDark
                                      ? "rgba(255, 255, 255, 0.08)"
                                      : "rgba(0, 0, 0, 0.06)",
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                      Selectează agent — ordonat după potrivire
                                    </p>
                                    <button
                                      onClick={() => {
                                        setAssigningListingId(null);
                                        setSelectedAgentId(null);
                                        setScoredAgents([]);
                                        setScoreInfoAgentId(null);
                                        if (changingAgentListingId === listing.id) {
                                          setChangingAgentListingId(null);
                                        }
                                      }}
                                      className="text-xs text-gray-400 hover:text-foreground transition-colors"
                                    >
                                      Închide
                                    </button>
                                  </div>

                                  {scoredLoading ? (
                                    <p className="text-sm text-gray-400 py-3 text-center">Se calculează scorurile...</p>
                                  ) : (
                                    <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                                      {scoredAgents.map((agent, idx) => {
                                        const score = agent.scoring?.total ?? 0;
                                        const isSelected = selectedAgentId === agent.id;
                                        const isInfoOpen = scoreInfoAgentId === agent.id;
                                        const scoreColor = score >= 70 ? "#10B981" : score >= 45 ? "#F59E0B" : "#EF4444";

                                        return (
                                          <div key={agent.id}>
                                            <div
                                              className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all"
                                              onClick={() => setSelectedAgentId(isSelected ? null : agent.id)}
                                              style={{
                                                background: isSelected
                                                  ? (isDark ? "rgba(194, 90, 43, 0.15)" : "rgba(194, 90, 43, 0.08)")
                                                  : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"),
                                                border: isSelected
                                                  ? "1px solid rgba(194, 90, 43, 0.3)"
                                                  : isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)",
                                              }}
                                            >
                                              {/* Rang */}
                                              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-5 text-center shrink-0">
                                                {idx + 1}
                                              </span>

                                              {/* Scor bar */}
                                              <div className="w-12 shrink-0">
                                                <div className="text-xs font-bold text-center mb-0.5" style={{ color: scoreColor }}>
                                                  {score}
                                                </div>
                                                <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                  <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${score}%`, backgroundColor: scoreColor }}
                                                  />
                                                </div>
                                              </div>

                                              {/* Info agent */}
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm font-medium text-foreground truncate">
                                                    {agent.name}
                                                  </span>
                                                  <span className="text-xs text-gray-400 shrink-0">{agent.rating}⭐</span>
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                  {agent.sectors.join(", ")} · {agent._count?.listings || 0} anunțuri
                                                </div>
                                              </div>

                                              {/* Buton info scoring */}
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setScoreInfoAgentId(isInfoOpen ? null : agent.id);
                                                }}
                                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                                                style={{
                                                  backgroundColor: isInfoOpen
                                                    ? (isDark ? "rgba(194, 90, 43, 0.2)" : "rgba(194, 90, 43, 0.1)")
                                                    : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                                                  color: isInfoOpen ? "#C25A2B" : (isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"),
                                                }}
                                                title="Detalii scor"
                                              >
                                                <MdInfoOutline size={14} />
                                              </button>

                                              {/* Buton selectare */}
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleAssignAgent(listing.id, agent.id);
                                                }}
                                                disabled={isActioning}
                                                className="px-3 py-1 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 shrink-0"
                                                style={{ backgroundColor: "#C25A2B" }}
                                              >
                                                Atribuie
                                              </button>
                                            </div>

                                            {/* Popup detalii scor */}
                                            {isInfoOpen && agent.scoring && (
                                              <div
                                                className="ml-8 mt-1 mb-1 p-3 rounded-lg text-xs space-y-2"
                                                style={{
                                                  background: isDark
                                                    ? "rgba(27, 27, 33, 0.8)"
                                                    : "rgba(245, 245, 248, 0.9)",
                                                  border: isDark
                                                    ? "1px solid rgba(255,255,255,0.08)"
                                                    : "1px solid rgba(0,0,0,0.06)",
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
                                                    <span className="font-bold shrink-0" style={{
                                                      color: item.score >= item.max * 0.7 ? "#10B981" : item.score >= item.max * 0.4 ? "#F59E0B" : "#EF4444",
                                                    }}>
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* ── Active / Inactive din date mock ── */
              <>
                {dbListingsLoading ? (
                  <div
                    className="rounded-none md:rounded-3xl p-12 text-center"
                    style={{
                      fontFamily: "var(--font-galak-regular)",
                      background: isDark
                        ? "rgba(35, 35, 48, 0.5)"
                        : "rgba(255, 255, 255, 0.6)",
                      border: isDark
                        ? "1px solid rgba(255, 255, 255, 0.12)"
                        : "1px solid rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      Se încarcă anunțurile reale...
                    </p>
                  </div>
                ) : dbListingsError ? (
                  <div className="rounded-xl p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 text-sm">{dbListingsError}</p>
                  </div>
                ) : filteredAnunturi.length === 0 ? (
                  <div
                    className="rounded-none md:rounded-3xl p-12 text-center"
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
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {hasActiveFilters
                        ? "Nu există anunțuri care să corespundă filtrelor selectate."
                        : "Nu există anunțuri în această categorie."}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {filteredAnunturi.length} anunț{filteredAnunturi.length === 1 ? "" : "uri"} găsit{filteredAnunturi.length === 1 ? "" : "e"}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredAnunturi.map((anunt) => (
                        <AdminListingCard
                          key={anunt.id}
                          id={anunt.id}
                          titlu={anunt.titlu}
                          image={anunt.image}
                          pret={anunt.pret}
                          tags={anunt.tags}
                          locationText={
                            anunt.tags.find((t) => t.includes("Sector")) ??
                            "Zona centrală"
                          }
                          imageCount={anunt.imageCount}
                          href={getAnuntHref(anunt)}
                          status={anunt.status}
                          deactivationReason={anunt.deactivationReason}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
