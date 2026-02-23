"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdminListingCard from "../../components/AdminListingCard";
import {
  getAllAnunturi,
  getImageCount,
  type Anunt,
} from "../../../lib/anunturiData";
import {
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdArrowBack,
  MdClose,
  MdFilterList,
} from "react-icons/md";
import { CiFilter } from "react-icons/ci";
import Link from "next/link";
import { parsePretToNumber } from "../../../lib/anunturiData";

type AnuntStatus = "active" | "inactive" | "pending";
type DeactivationReason =
  | "A trecut prea mult timp"
  | "Vandut"
  | "Dezactivat utilizator"
  | "Dezactivat admin";

interface AnuntWithStatus extends Anunt {
  status: AnuntStatus;
  deactivationReason?: DeactivationReason;
}

// Simulăm statusurile și motivele pentru anunțuri
const addStatusToAnunturi = (anunturi: Anunt[]): AnuntWithStatus[] => {
  const deactivationReasons: DeactivationReason[] = [
    "A trecut prea mult timp",
    "Vandut",
    "Dezactivat utilizator",
    "Dezactivat admin",
  ];

  return anunturi.map((anunt, index) => {
    // Distribuim statusurile: 60% active, 30% inactive, 10% pending
    let status: AnuntStatus = "active";
    let deactivationReason: DeactivationReason | undefined = undefined;
    const mod = index % 10;
    if (mod >= 6 && mod < 9) {
      status = "inactive";
      // Distribuim motivele pentru anunțurile inactive
      const reasonIndex = (index % 4);
      deactivationReason = deactivationReasons[reasonIndex];
    } else if (mod === 9) {
      status = "pending";
    }
    return { ...anunt, status, deactivationReason };
  });
};

export default function AdminAnunturiPage() {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [showPending, setShowPending] = useState(false);
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

  const allAnunturi = useMemo(() => {
    return addStatusToAnunturi(getAllAnunturi());
  }, []);

  const filteredAnunturi = useMemo(() => {
    let filtered = allAnunturi;
    
    // Filtrare după status
    if (showPending) {
      filtered = filtered.filter((a) => a.status === "pending");
    } else {
      filtered = filtered.filter((a) => a.status === activeTab);
    }
    
    // Filtrare după preț
    if (pretMinim) {
      const pretMin = parsePretToNumber(pretMinim);
      filtered = filtered.filter((a) => parsePretToNumber(a.pret) >= pretMin);
    }
    if (pretMaxim) {
      const pretMax = parsePretToNumber(pretMaxim);
      filtered = filtered.filter((a) => parsePretToNumber(a.pret) <= pretMax);
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

  const getAnuntHref = (anunt: AnuntWithStatus): string => {
    if (anunt.status === "inactive") {
      return `/admin/anunturi/anunturi-inactive/${anunt.id}`;
    } else if (anunt.status === "pending") {
      return `/admin/anunturi/anunturi-pending/${anunt.id}`;
    } else {
      return `/admin/anunturi/anunturi-active/${anunt.id}`;
    }
  };

  const pendingCount = useMemo(
    () => allAnunturi.filter((a) => a.status === "pending").length,
    [allAnunturi]
  );
  const activeCount = useMemo(
    () => allAnunturi.filter((a) => a.status === "active").length,
    [allAnunturi]
  );
  const inactiveCount = useMemo(
    () => allAnunturi.filter((a) => a.status === "inactive").length,
    [allAnunturi]
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

            {filteredAnunturi.length === 0 ? (
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
                    imageCount={getImageCount(anunt.id)}
                    href={getAnuntHref(anunt)}
                    status={anunt.status}
                    deactivationReason={anunt.deactivationReason}
                  />
                ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
