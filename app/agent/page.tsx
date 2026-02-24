"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminListingCard from "../components/AdminListingCard";
import {
  MdPerson,
  MdStar,
  MdCheckCircle,
  MdSchedule,
  MdCalendarToday,
  MdHome,
  MdEmail,
  MdPhone,
  MdTrendingUp,
  MdVisibility,
  MdEdit,
  MdChevronLeft,
  MdChevronRight,
  MdAccessTime,
  MdLocationOn,
  MdNotifications,
  MdDone,
} from "react-icons/md";
import {
  getAllAnunturi,
  getImageCount,
  type Anunt,
} from "../../lib/anunturiData";
import Link from "next/link";

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

const useDarkMode = () => {
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
};

/** Glass-card style factory */
const glassCard = (isDark: boolean): React.CSSProperties => ({
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
});

/** Matte reflection overlay */
const GlassShine = ({ isDark }: { isDark: boolean }) => (
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

/* ═══════════════════════════════════════════
   Types & Mock Data
   ═══════════════════════════════════════════ */

type ProgramareStatus = "confirmata" | "in_asteptare" | "anulata";

type Programare = {
  id: string;
  data: string; // YYYY-MM-DD
  ora: string;
  numeClient: string;
  tip: "vizionare" | "consultanta";
  imobil: string;
  status: ProgramareStatus;
};

type Notificare = {
  id: string;
  mesaj: string;
  data: string; // ISO
  tip: "anunt" | "programare" | "general";
  citita: boolean;
};

const getProgramareStatusConfig = (status: ProgramareStatus) => {
  switch (status) {
    case "confirmata":
      return { label: "Confirmată", color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" };
    case "in_asteptare":
      return { label: "În așteptare", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" };
    case "anulata":
      return { label: "Anulată", color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)" };
  }
};

/** Deterministic date helper — returns YYYY-MM-DD for today + offsetDays */
const dateOffset = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

const useAgentData = () => {
  const allAnunturi = useMemo(() => getAllAnunturi(), []);

  // Agent's active listings (first 5)
  const activeListings: Anunt[] = allAnunturi.slice(0, 5);
  // Agent's sold listings (next 3)
  const soldListings: Anunt[] = allAnunturi.slice(5, 8);

  const programari: Programare[] = useMemo(
    () => [
      {
        id: "p1",
        data: dateOffset(0),
        ora: "10:00",
        numeClient: "Andreea Pop",
        tip: "vizionare" as const,
        imobil: activeListings[0]?.titlu ?? "Apartament 3 camere",
        status: "confirmata" as const,
      },
      {
        id: "p2",
        data: dateOffset(0),
        ora: "14:30",
        numeClient: "Mihai Istrate",
        tip: "consultanta" as const,
        imobil: activeListings[1]?.titlu ?? "Garsonieră centrală",
        status: "in_asteptare" as const,
      },
      {
        id: "p3",
        data: dateOffset(0),
        ora: "17:00",
        numeClient: "Cristina Enache",
        tip: "vizionare" as const,
        imobil: activeListings[2]?.titlu ?? "Studio Floreasca",
        status: "confirmata" as const,
      },
      {
        id: "p4",
        data: dateOffset(1),
        ora: "11:00",
        numeClient: "Ion Marinescu",
        tip: "vizionare" as const,
        imobil: activeListings[3]?.titlu ?? "Penthouse Sector 3",
        status: "confirmata" as const,
      },
      {
        id: "p5",
        data: dateOffset(2),
        ora: "09:30",
        numeClient: "Ioana Dima",
        tip: "vizionare" as const,
        imobil: activeListings[0]?.titlu ?? "Apartament 2 camere",
        status: "confirmata" as const,
      },
      {
        id: "p6",
        data: dateOffset(2),
        ora: "16:00",
        numeClient: "Radu Petrescu",
        tip: "consultanta" as const,
        imobil: activeListings[4]?.titlu ?? "Garsonieră modernă",
        status: "in_asteptare" as const,
      },
      {
        id: "p7",
        data: dateOffset(4),
        ora: "12:00",
        numeClient: "Elena Stoica",
        tip: "vizionare" as const,
        imobil: activeListings[1]?.titlu ?? "Apartament modern",
        status: "confirmata" as const,
      },
      {
        id: "p8",
        data: dateOffset(5),
        ora: "10:30",
        numeClient: "Bogdan Vasile",
        tip: "vizionare" as const,
        imobil: activeListings[2]?.titlu ?? "Duplex premium",
        status: "in_asteptare" as const,
      },
      {
        id: "p9",
        data: dateOffset(8),
        ora: "14:00",
        numeClient: "Maria Ionescu",
        tip: "consultanta" as const,
        imobil: activeListings[0]?.titlu ?? "Apartament 2 camere",
        status: "confirmata" as const,
      },
      {
        id: "p10",
        data: dateOffset(12),
        ora: "11:30",
        numeClient: "Dan Gheorghe",
        tip: "vizionare" as const,
        imobil: activeListings[3]?.titlu ?? "Penthouse",
        status: "confirmata" as const,
      },
    ],
    [activeListings]
  );

  const notificariInitiale: Notificare[] = [
    {
      id: "n1",
      mesaj: "Ți-a fost atribuit un nou anunț în Sector 1.",
      data: dateOffset(0),
      tip: "anunt",
      citita: false,
    },
    {
      id: "n2",
      mesaj: "X a făcut o programare de vizionare pentru mâine la ora 11:00.",
      data: dateOffset(0),
      tip: "programare",
      citita: false,
    },
    {
      id: "n3",
      mesaj:
        "Unul dintre anunțurile tale a depășit 30 de zile. Verifică actualitatea.",
      data: dateOffset(-1),
      tip: "general",
      citita: false,
    },
    {
      id: "n4",
      mesaj: "Clientul Andreea Pop a confirmat vizionarea de astăzi.",
      data: dateOffset(-1),
      tip: "programare",
      citita: true,
    },
  ];

  return {
    activeListings,
    soldListings,
    programari,
    notificariInitiale,
    agent: {
      nume: "Ion Popescu",
      initiala: "IP",
      rol: "Agent imobiliar senior",
      email: "ion.popescu@realimob.ro",
      telefon: "0712 345 678",
      scor: 4.8,
      reviews: 47,
      tranzactiiInchise: 12,
      vizualizariLuna: 1243,
      programariLuna: 10,
      vechimeLuni: 18,
      locatie: "București",
    },
  };
};

/* ═══════════════════════════════════════════
   Calendar component – full month
   ═══════════════════════════════════════════ */

function MonthCalendar({
  isDark,
  programari,
}: {
  isDark: boolean;
  programari: Programare[];
}) {
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  // Monday = 0 … Sunday = 6
  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];

  // Build a set of dates that have appointments
  const datesWithAppointments = useMemo(() => {
    const s = new Set<string>();
    programari.forEach((p) => s.add(p.data));
    return s;
  }, [programari]);

  const prevMonth = useCallback(() => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const dayNames = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];
  const monthName = viewDate.toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // fill remaining to complete row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div
      className="rounded-2xl md:rounded-3xl overflow-hidden relative"
      style={glassCard(isDark)}
    >
      <GlassShine isDark={isDark} />
      <div className="p-5 md:p-6 relative z-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MdCalendarToday size={20} className="text-[#C25A2B]" />
            Calendar
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <MdChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-foreground capitalize min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((dn) => (
            <div
              key={dn}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
            >
              {dn}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }
            const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(
              day
            ).padStart(2, "0")}`;
            const isToday = iso === todayISO;
            const hasAppt = datesWithAppointments.has(iso);
            const count = programari.filter((p) => p.data === iso).length;

            return (
              <div
                key={iso}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all cursor-default ${
                  isToday
                    ? "bg-[#C25A2B] text-white font-bold shadow-lg"
                    : hasAppt
                    ? isDark
                      ? "bg-white/5 text-foreground"
                      : "bg-gray-100/80 text-foreground"
                    : "text-foreground"
                }`}
                style={
                  isToday
                    ? { boxShadow: "0 4px 14px rgba(194, 90, 43, 0.35)" }
                    : undefined
                }
              >
                <span className="text-sm leading-none">{day}</span>
                {hasAppt && (
                  <span
                    className={`text-[9px] mt-0.5 leading-none font-medium ${
                      isToday ? "text-white/80" : "text-[#C25A2B]"
                    }`}
                  >
                    {count} prog.
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

export default function AgentDashboardPage() {
  const isDark = useDarkMode();
  const { activeListings, soldListings, programari, notificariInitiale, agent } =
    useAgentData();

  const [notificari, setNotificari] =
    useState<Notificare[]>(notificariInitiale);

  const todayISO = new Date().toISOString().split("T")[0];
  const todayAppointments = programari.filter((p) => p.data === todayISO);
  const upcomingAppointments = programari.filter((p) => p.data > todayISO);

  // State: filtre & search pentru anunțuri active
  const [activeSearch, setActiveSearch] = useState("");
  const [activeSector, setActiveSector] = useState("");

  // State: filtre & search pentru proprietăți vândute
  const [soldSearch, setSoldSearch] = useState("");
  const [soldSector, setSoldSector] = useState("");

  // Pagination pentru anunțuri active
  const ACTIVE_PAGE_SIZE = 4;
  const [activePage, setActivePage] = useState(0);

  // Pagination pentru proprietăți vândute
  const SOLD_PAGE_SIZE = 3;
  const [soldPage, setSoldPage] = useState(0);

  // Filtrare anunțuri active
  const filteredActive = useMemo(() => {
    return activeListings.filter((a) => {
      const matchesSearch =
        !activeSearch ||
        a.titlu.toLowerCase().includes(activeSearch.toLowerCase()) ||
        a.tags.some((t) =>
          t.toLowerCase().includes(activeSearch.toLowerCase())
        );
      const matchesSector =
        !activeSector ||
        a.tags.some((t) =>
          t.toLowerCase().includes(activeSector.toLowerCase())
        );
      return matchesSearch && matchesSector;
    });
  }, [activeListings, activeSearch, activeSector]);

  const activeTotalPages = Math.max(
    1,
    Math.ceil(filteredActive.length / ACTIVE_PAGE_SIZE)
  );
  const paginatedActive = filteredActive.slice(
    activePage * ACTIVE_PAGE_SIZE,
    activePage * ACTIVE_PAGE_SIZE + ACTIVE_PAGE_SIZE
  );

  // Filtrare proprietăți vândute
  const filteredSold = useMemo(() => {
    return soldListings.filter((a) => {
      const matchesSearch =
        !soldSearch ||
        a.titlu.toLowerCase().includes(soldSearch.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(soldSearch.toLowerCase()));
      const matchesSector =
        !soldSector ||
        a.tags.some((t) => t.toLowerCase().includes(soldSector.toLowerCase()));
      return matchesSearch && matchesSector;
    });
  }, [soldListings, soldSearch, soldSector]);

  const soldTotalPages = Math.max(
    1,
    Math.ceil(filteredSold.length / SOLD_PAGE_SIZE)
  );
  const paginatedSold = filteredSold.slice(
    soldPage * SOLD_PAGE_SIZE,
    soldPage * SOLD_PAGE_SIZE + SOLD_PAGE_SIZE
  );

  // Reset paginare dacă numărul de elemente se schimbă
  useEffect(() => {
    if (activePage >= activeTotalPages) {
      setActivePage(0);
    }
  }, [activePage, activeTotalPages]);

  useEffect(() => {
    if (soldPage >= soldTotalPages) {
      setSoldPage(0);
    }
  }, [soldPage, soldTotalPages]);

  // Stats
  const stats = [
    {
      titlu: "Anunțuri Active",
      valoare: String(activeListings.length),
      icon: MdHome,
      culoare: "#10B981",
      trend: "+2 luna aceasta",
    },
    {
      titlu: "Proprietăți Vândute",
      valoare: String(agent.tranzactiiInchise),
      icon: MdCheckCircle,
      culoare: "#3B82F6",
      trend: "+3 luna aceasta",
    },
    {
      titlu: "Scor Agent",
      valoare: agent.scor.toFixed(1),
      icon: MdStar,
      culoare: "#F59E0B",
      trend: `${agent.reviews} recenzii`,
    },
    {
      titlu: "Vizualizări / Lună",
      valoare: agent.vizualizariLuna.toLocaleString("ro-RO"),
      icon: MdVisibility,
      culoare: "#C25A2B",
      trend: "+18% față de luna trecută",
    },
  ];

  return (
    <div className="min-h-screen text-foreground pt-20">
      <Navbar />

      <div className="w-full px-4 md:px-8 py-8 md:py-12">
        <div className="w-full max-w-[1250px] mx-auto space-y-8 md:space-y-10">
          {/* ──────────────── HEADER ──────────────── */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p
                className="text-sm text-gray-500 dark:text-gray-400 mb-1"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                {new Date().toLocaleDateString("ro-RO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <h1
                className="text-3xl md:text-5xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Bună, {agent.nume.split(" ")[0]}
              </h1>
              <p
                className="text-gray-500 dark:text-gray-400 mt-1"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Ai {todayAppointments.length} programăr
                {todayAppointments.length === 1 ? "e" : "i"} astăzi și{" "}
                {activeListings.length} anunțuri active.
              </p>
            </div>
            <Link
              href="/agent/adauga"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition-opacity self-start md:self-auto"
              style={{
                background: "#C25A2B",
                boxShadow: "0 4px 14px rgba(194, 90, 43, 0.35)",
                fontFamily: "var(--font-galak-regular)",
              }}
            >
              <MdEdit size={18} />
              Adaugă anunț
            </Link>
          </div>

          {/* ──────────────── STATS ROW ──────────────── */}
          <div
            className="rounded-2xl md:rounded-3xl overflow-hidden relative"
            style={glassCard(isDark)}
          >
            <GlassShine isDark={isDark} />
            <div className="px-4 md:px-8 py-6 md:py-8 relative z-1">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="relative flex items-center gap-4 md:gap-5 px-4 md:px-6 py-4"
                    >
                      {/* Vertical divider – desktop */}
                      {index > 0 && (
                        <div
                          className="absolute left-0 top-[20%] bottom-[20%] hidden lg:block"
                          style={{
                            width: "1px",
                            background: isDark
                              ? "rgba(255, 255, 255, 0.08)"
                              : "rgba(0, 0, 0, 0.06)",
                          }}
                        />
                      )}
                      {/* Vertical divider – mobile between cols */}
                      {index % 2 === 1 && (
                        <div
                          className="absolute left-0 top-[20%] bottom-[20%] lg:hidden"
                          style={{
                            width: "1px",
                            background: isDark
                              ? "rgba(255, 255, 255, 0.08)"
                              : "rgba(0, 0, 0, 0.06)",
                          }}
                        />
                      )}

                      {/* Accent bar */}
                      <div
                        className="w-1 self-stretch rounded-full shrink-0"
                        style={{ background: stat.culoare }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            size={16}
                            style={{ color: stat.culoare }}
                            className="shrink-0"
                          />
                          <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                            {stat.titlu}
                          </span>
                        </div>
                        <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-none block">
                          {stat.valoare}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                          <MdTrendingUp size={13} className="text-emerald-500" />
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Horizontal divider on mobile between row 1 and 2 */}
              <div
                className="lg:hidden"
                style={{
                  position: "absolute",
                  left: "5%",
                  right: "5%",
                  top: "50%",
                  height: "1px",
                  background: isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.06)",
                }}
              />
            </div>
          </div>

          {/* ──────────────── PROFILE + CALENDAR / TODAY ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Profile card */}
            <div
              className="rounded-2xl md:rounded-3xl overflow-hidden relative lg:col-span-1"
              style={glassCard(isDark)}
            >
              <GlassShine isDark={isDark} />
              {/* Accent gradient */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: isDark
                    ? "radial-gradient(circle at top left, rgba(194, 90, 43, 0.18), transparent 60%)"
                    : "radial-gradient(circle at top left, rgba(194, 90, 43, 0.14), transparent 60%)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              <div className="p-6 md:p-7 relative z-1">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #C25A2B 0%, #8B3A1A 100%)",
                      boxShadow: "0 6px 20px rgba(194, 90, 43, 0.35)",
                    }}
                  >
                    {agent.initiala}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-foreground truncate">
                      {agent.nume}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {agent.rol}
                    </p>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <MdEmail size={16} className="text-gray-400 shrink-0" />
                    <span className="text-foreground truncate">
                      {agent.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MdPhone size={16} className="text-gray-400 shrink-0" />
                    <span className="text-foreground">{agent.telefon}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MdLocationOn size={16} className="text-gray-400 shrink-0" />
                    <span className="text-foreground">
                      {agent.locatie} · {agent.vechimeLuni} luni în platformă
                    </span>
                  </div>
                </div>

                {/* Score badge */}
                <div
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{
                    background: isDark
                      ? "rgba(27, 27, 33, 0.8)"
                      : "rgba(255, 255, 255, 0.85)",
                    boxShadow: isDark
                      ? "0 4px 16px rgba(0,0,0,0.3)"
                      : "0 4px 16px rgba(0,0,0,0.06)",
                  }}
                >
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Scor performanță
                    </p>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <MdStar
                          key={i}
                          size={16}
                          className={
                            i < Math.round(agent.scor)
                              ? "text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">
                      {agent.scor.toFixed(1)}
                    </span>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {agent.reviews} recenzii
                    </p>
                  </div>
                </div>

                {/* Edit button */}
                <button
                  className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <MdEdit size={16} />
                  Editează profilul
                </button>
              </div>
            </div>

            {/* Programări azi + viitoare */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Today's appointments */}
              <div
                className="rounded-2xl md:rounded-3xl overflow-hidden relative"
                style={glassCard(isDark)}
              >
                <GlassShine isDark={isDark} />
                {/* Accent */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: isDark
                      ? "radial-gradient(circle at bottom right, rgba(80, 120, 190, 0.2), transparent 65%)"
                      : "radial-gradient(circle at bottom right, rgba(80, 120, 190, 0.16), transparent 65%)",
                    pointerEvents: "none",
                  }}
                />
                <div className="p-5 md:p-6 relative z-1">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <MdSchedule size={20} className="text-[#3B82F6]" />
                      Programări astăzi
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {new Date().toLocaleDateString("ro-RO", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>

                  {todayAppointments.length === 0 ? (
                    <div className="py-6 text-center">
                      <MdSchedule
                        size={36}
                        className="text-gray-300 dark:text-gray-600 mx-auto mb-2"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nu ai programări astăzi. Bucură-te de o zi liberă!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayAppointments.map((p, i) => {
                        const cfg = getProgramareStatusConfig(p.status);
                        return (
                          <div
                            key={p.id}
                            className="flex items-start gap-4 rounded-xl px-4 py-3.5 transition-colors"
                            style={{
                              background: isDark
                                ? "rgba(27, 27, 33, 0.6)"
                                : "rgba(255, 255, 255, 0.7)",
                              borderLeft: `3px solid ${cfg.color}`,
                            }}
                          >
                            {/* Time */}
                            <div className="shrink-0 text-center pt-0.5">
                              <span className="text-lg font-bold text-foreground leading-none block">
                                {p.ora.split(":")[0]}
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                  :{p.ora.split(":")[1]}
                                </span>
                              </span>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-foreground">
                                  {p.tip === "vizionare"
                                    ? "Vizionare"
                                    : "Consultație"}
                                </span>
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                                  style={{
                                    backgroundColor: cfg.bg,
                                    color: cfg.color,
                                  }}
                                >
                                  {cfg.label}
                                </span>
                              </div>
                              <p
                                className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate"
                                title={p.imobil}
                              >
                                {p.imobil}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                <MdPerson
                                  size={12}
                                  className="inline mr-1 -mt-0.5"
                                />
                                {p.numeClient}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming appointments */}
              {upcomingAppointments.length > 0 && (
                <div
                  className="rounded-2xl md:rounded-3xl overflow-hidden relative"
                  style={glassCard(isDark)}
                >
                  <GlassShine isDark={isDark} />
                  <div className="p-5 md:p-6 relative z-1">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <MdAccessTime size={20} className="text-[#C25A2B]" />
                        Programări viitoare
                      </h2>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {upcomingAppointments.length} programăr
                        {upcomingAppointments.length === 1 ? "e" : "i"}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 hide-scrollbar">
                      {upcomingAppointments.map((p) => {
                        const cfg = getProgramareStatusConfig(p.status);
                        const dateLabel = new Date(
                          p.data
                        ).toLocaleDateString("ro-RO", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        });
                        return (
                          <div
                            key={p.id}
                            className="flex items-center gap-4 rounded-xl px-4 py-3 transition-colors"
                            style={{
                              background: isDark
                                ? "rgba(27, 27, 33, 0.5)"
                                : "rgba(255, 255, 255, 0.6)",
                            }}
                          >
                            {/* Date chip */}
                            <div
                              className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                              style={{
                                background: isDark
                                  ? "rgba(194, 90, 43, 0.12)"
                                  : "rgba(194, 90, 43, 0.08)",
                              }}
                            >
                              <span className="text-lg font-bold text-foreground leading-none">
                                {new Date(p.data).getDate()}
                              </span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                                {new Date(p.data).toLocaleDateString("ro-RO", {
                                  month: "short",
                                })}
                              </span>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {p.tip === "vizionare"
                                    ? "Vizionare"
                                    : "Consultație"}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {p.ora}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                {p.imobil}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {p.numeClient}
                              </p>
                            </div>

                            {/* Status */}
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0"
                              style={{
                                backgroundColor: cfg.bg,
                                color: cfg.color,
                              }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ──────────────── CALENDAR + NOTIFICĂRI ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Calendar */}
            <div className="lg:col-span-1">
              <MonthCalendar isDark={isDark} programari={programari} />
            </div>

            {/* Notificări */}
            <div className="lg:col-span-2">
              <div
                className="rounded-2xl md:rounded-3xl overflow-hidden relative"
                style={glassCard(isDark)}
              >
                <GlassShine isDark={isDark} />
                <div className="p-5 md:p-6 relative z-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MdNotifications
                        size={20}
                        className="text-[#C25A2B]"
                      />
                      <h2 className="text-lg font-semibold text-foreground">
                        Notificări
                      </h2>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notificari.filter((n) => !n.citita).length} necitite
                    </span>
                  </div>

                  {notificari.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nu ai notificări în acest moment.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 hide-scrollbar">
                      {notificari.map((n) => {
                        const isUnread = !n.citita;
                        const dateLabel = new Date(
                          n.data
                        ).toLocaleDateString("ro-RO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });
                        return (
                          <div
                            key={n.id}
                            className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
                              isUnread
                                ? "bg-white/80 dark:bg-black/40"
                                : "bg-white/60 dark:bg-black/20"
                            }`}
                          >
                            <div className="mt-1">
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  isUnread
                                    ? "bg-[#C25A2B]"
                                    : "bg-gray-300 dark:bg-gray-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground">{n.mesaj}</p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                {dateLabel}
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label={
                                isUnread
                                  ? "Marchează ca citit"
                                  : "Marchează ca necitit"
                              }
                              onClick={() =>
                                setNotificari((cur) =>
                                  cur.map((item) =>
                                    item.id === n.id
                                      ? { ...item, citita: !item.citita }
                                      : item
                                  )
                                )
                              }
                              className="mt-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-300"
                            >
                              {isUnread ? (
                                <MdDone size={16} />
                              ) : (
                                <MdNotifications size={16} />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ──────────────── ACTIVE LISTINGS (MUTATE DEDESUBT) ──────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                <MdHome size={22} className="text-[#10B981]" />
                Anunțuri active
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {activeListings.length} proprietăți
              </span>
            </div>

            {filteredActive.length === 0 ? (
              <div
                className="rounded-2xl md:rounded-3xl p-8 text-center"
                style={glassCard(isDark)}
              >
                <MdHome
                  size={40}
                  className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nu există anunțuri care să corespundă criteriilor selectate.
                </p>
              </div>
            ) : (
              <>
                {/* Search + filtrare sector */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <input
                    type="text"
                    value={activeSearch}
                    onChange={(e) => {
                      setActiveSearch(e.target.value);
                      setActivePage(0);
                    }}
                    placeholder="Caută după titlu, descriere sau zonă..."
                    className="w-full md:max-w-md px-3 py-2.5 rounded-lg border text-sm backdrop-blur-xl text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/40"
                    style={{
                      background: isDark
                        ? "rgba(27, 27, 33, 0.7)"
                        : "rgba(255, 255, 255, 0.8)",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <select
                    value={activeSector}
                    onChange={(e) => {
                      setActiveSector(e.target.value);
                      setActivePage(0);
                    }}
                    className="w-full md:w-48 px-3 py-2.5 rounded-lg border text-sm backdrop-blur-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/40"
                    style={{
                      background: isDark
                        ? "rgba(27, 27, 33, 0.7)"
                        : "rgba(255, 255, 255, 0.8)",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <option value="">Toate sectoarele</option>
                    <option value="Sector 1">Sector 1</option>
                    <option value="Sector 2">Sector 2</option>
                    <option value="Sector 3">Sector 3</option>
                    <option value="Sector 4">Sector 4</option>
                    <option value="Sector 5">Sector 5</option>
                    <option value="Sector 6">Sector 6</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paginatedActive.map((anunt) => (
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
                      href={`/anunturi/${anunt.id}`}
                      status="active"
                    />
                  ))}
                </div>

                {/* Paginare tip bară + buline, în stilul imaginii trimise */}
                {activeTotalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {Array.from({ length: activeTotalPages }).map((_, i) => {
                      const isCurrent = i === activePage;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActivePage(i)}
                          className="flex items-center justify-center"
                        >
                          <span
                            className={
                              isCurrent
                                ? "h-2 w-10 rounded-full bg-[#F97316]"
                                : "h-2 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ──────────────── SOLD LISTINGS ──────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                <MdCheckCircle size={22} className="text-emerald-500" />
                Proprietăți vândute
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {soldListings.length} tranzacții finalizate
              </span>
            </div>

            {filteredSold.length === 0 ? (
              <div
                className="rounded-2xl md:rounded-3xl p-8 text-center"
                style={glassCard(isDark)}
              >
                <MdCheckCircle
                  size={40}
                  className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nu există tranzacții care să corespundă criteriilor selectate.
                </p>
              </div>
            ) : (
              <>
                {/* Search + filtrare sector pentru vândute */}
                <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <input
                    type="text"
                    value={soldSearch}
                    onChange={(e) => {
                      setSoldSearch(e.target.value);
                      setSoldPage(0);
                    }}
                    placeholder="Caută în proprietățile vândute..."
                    className="w-full md:max-w-md px-3 py-2.5 rounded-lg border text-sm backdrop-blur-xl text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/40"
                    style={{
                      background: isDark
                        ? "rgba(27, 27, 33, 0.7)"
                        : "rgba(255, 255, 255, 0.8)",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <select
                    value={soldSector}
                    onChange={(e) => {
                      setSoldSector(e.target.value);
                      setSoldPage(0);
                    }}
                    className="w-full md:w-48 px-3 py-2.5 rounded-lg border text-sm backdrop-blur-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/40"
                    style={{
                      background: isDark
                        ? "rgba(27, 27, 33, 0.7)"
                        : "rgba(255, 255, 255, 0.8)",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <option value="">Toate sectoarele</option>
                    <option value="Sector 1">Sector 1</option>
                    <option value="Sector 2">Sector 2</option>
                    <option value="Sector 3">Sector 3</option>
                    <option value="Sector 4">Sector 4</option>
                    <option value="Sector 5">Sector 5</option>
                    <option value="Sector 6">Sector 6</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginatedSold.map((anunt) => (
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
                      href={`/anunturi/${anunt.id}`}
                      status="inactive"
                      deactivationReason="Vandut"
                    />
                  ))}
                </div>

                {/* Navigare cu „dots” pentru proprietăți vândute */}
                {soldTotalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {Array.from({ length: soldTotalPages }).map((_, i) => {
                      const isCurrent = i === soldPage;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSoldPage(i)}
                          className="flex items-center justify-center"
                        >
                          <span
                            className={
                              isCurrent
                                ? "h-2 w-10 rounded-full bg-[#F97316]"
                                : "h-2 w-2.5 rounded_full bg-gray-300 dark:bg-gray-600"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
