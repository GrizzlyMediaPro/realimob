"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { UploadButton, UploadDropzone } from "../components/Uploadthing";
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
  MdLock,
  MdDownload,
  MdUploadFile,
  MdDescription,
  MdLocalOffer,
  MdWarning,
} from "react-icons/md";
import {
  type Anunt,
} from "../../lib/anunturiData";
import { formatListingPriceDisplay } from "../../lib/listingToAnunt";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import MarkListingSoldModal from "../components/MarkListingSoldModal";

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
  href?: string | null;
};

type PendingClientOffer = {
  id: string;
  amount: number;
  currency: string;
  note: string | null;
  createdAt: string;
  listing: { id: string; title: string };
  viewingRequest: {
    id: string;
    clientName: string;
    clientEmail: string;
  } | null;
};

type AgentListing = Anunt & {
  imageCount: number;
  listingStatus: "approved" | "sold";
  transactionTypeLabel: string;
  salePendingReview: boolean;
  saleRejected: boolean;
  saleRejectionNote: string | null;
};

type AgentProfile = {
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  createdAt: string | null;
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

type ViewingRequestRow = {
  id: string;
  status: string;
  startAt: string;
  endAt: string;
  listingTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  message: string | null;
};

function bucharestDateKey(iso: string): string {
  return new Date(iso).toLocaleDateString("sv-SE", {
    timeZone: "Europe/Bucharest",
  });
}

function viewingRowToProgramare(r: ViewingRequestRow): Programare {
  const start = new Date(r.startAt);
  const ora = start.toLocaleTimeString("ro-RO", {
    timeZone: "Europe/Bucharest",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  let status: ProgramareStatus = "in_asteptare";
  if (r.status === "approved") status = "confirmata";
  else if (r.status === "rejected") status = "anulata";
  return {
    id: r.id,
    data: bucharestDateKey(r.startAt),
    ora,
    numeClient: r.clientName,
    tip: "vizionare",
    imobil: r.listingTitle,
    status,
  };
}

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
      className="rounded-2xl md:rounded-3xl overflow-hidden relative w-full lg:flex-1 lg:min-h-0 lg:flex lg:flex-col"
      style={glassCard(isDark)}
    >
      <GlassShine isDark={isDark} />
      <div className="p-5 md:p-6 relative z-1 lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
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
        <div className="grid grid-cols-7 gap-1 mb-1 shrink-0">
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
        <div className="grid grid-cols-7 gap-1 shrink-0">
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
        <div className="hidden lg:block flex-1 min-h-0" aria-hidden />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

export default function AgentDashboardPage() {
  const { isSignedIn } = useUser();
  const isDark = useDarkMode();
  const [allListingsData, setAllListingsData] = useState<AgentListing[]>([]);

  const activeListings = useMemo(
    () => allListingsData.filter((l) => l.listingStatus !== "sold"),
    [allListingsData],
  );
  const soldListings = useMemo(
    () => allListingsData.filter((l) => l.listingStatus === "sold"),
    [allListingsData],
  );

  const [viewingRows, setViewingRows] = useState<ViewingRequestRow[]>([]);
  const [viewingLoadError, setViewingLoadError] = useState<string | null>(null);
  const [viewingActionId, setViewingActionId] = useState<string | null>(null);

  const programari = useMemo(() => {
    return viewingRows
      .filter((r) => r.status !== "rejected")
      .map(viewingRowToProgramare);
  }, [viewingRows]);

  const pendingViewingRows = useMemo(
    () => viewingRows.filter((r) => r.status === "pending"),
    [viewingRows],
  );

  const refreshViewingRequests = useCallback(async () => {
    try {
      const r = await fetch("/api/agent/viewing-requests", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) {
        setViewingLoadError(j?.error ?? "Nu am putut încărca cererile.");
        return;
      }
      setViewingLoadError(null);
      setViewingRows(j.requests ?? []);
    } catch {
      setViewingLoadError("Eroare la încărcarea cererilor.");
    }
  }, []);

  const [agentStatus, setAgentStatus] = useState<
    "none" | "pending" | "approved" | "rejected" | "suspended"
  >("none");
  const [questionnaireCompliance, setQuestionnaireCompliance] = useState<{
    gracePeriodWarning: boolean;
    pendingInGraceCount: number;
    nextDeadlineIso: string | null;
    hoursRemainingApprox: number | null;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    role: "",
    location: "",
  });
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState<string | null>(null);
  const [formaOrganizare, setFormaOrganizare] = useState("");
  const [cui, setCui] = useState("");
  const [buletinUrl, setBuletinUrl] = useState("");
  const [applicationPhone, setApplicationPhone] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [signedContractUrlDraft, setSignedContractUrlDraft] = useState("");
  const [signedContractDraftName, setSignedContractDraftName] = useState("");
  const [signedContractLoading, setSignedContractLoading] = useState(false);
  const [contractTemplateUrl, setContractTemplateUrl] = useState<string | null>(null);
  const [contractTemplateFileName, setContractTemplateFileName] = useState<string | null>(null);
  const [signedContractUrl, setSignedContractUrl] = useState<string | null>(null);
  const [signedContractFileName, setSignedContractFileName] = useState<string | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [googleCalendarEmail, setGoogleCalendarEmail] = useState<string | null>(null);
  const [googleCalendarMessage, setGoogleCalendarMessage] = useState<string | null>(null);
  const [googleDisconnectLoading, setGoogleDisconnectLoading] = useState(false);
  const [googleTestEventLoading, setGoogleTestEventLoading] = useState(false);

  const [notificari, setNotificari] = useState<Notificare[]>([]);
  const [pendingClientOffers, setPendingClientOffers] = useState<
    PendingClientOffer[]
  >([]);
  const [offersLoadError, setOffersLoadError] = useState<string | null>(null);
  const [offerActionId, setOfferActionId] = useState<string | null>(null);
  /** Scor performanță 90 zile: undefined = neîncărcat, null = eroare */
  const [perfScores90d, setPerfScores90d] = useState<{
    scorVanzari: number | null;
    scorInchirieri: number | null;
  } | null | undefined>(undefined);

  const refreshNotifications = useCallback(async () => {
    try {
      const r = await fetch("/api/notifications", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) return;
      const list = (j.notifications ?? []) as {
        id: string;
        createdAt: string;
        readAt: string | null;
        title: string;
        body: string;
        href: string | null;
      }[];
      setNotificari(
        list.map((n) => ({
          id: n.id,
          mesaj: `${n.title}: ${n.body}`,
          data: n.createdAt,
          tip: "programare" as const,
          citita: Boolean(n.readAt),
          href: n.href,
        })),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const refreshPendingOffers = useCallback(async () => {
    try {
      setOffersLoadError(null);
      const r = await fetch("/api/agent/listing-offers", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) {
        setOffersLoadError(j?.error ?? "Nu am putut încărca ofertele.");
        return;
      }
      setPendingClientOffers(j.offers ?? []);
    } catch {
      setOffersLoadError("Eroare la încărcarea ofertelor.");
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn || agentStatus !== "approved") return;
    refreshViewingRequests();
  }, [isSignedIn, agentStatus, refreshViewingRequests]);

  useEffect(() => {
    if (!isSignedIn || agentStatus !== "approved") {
      setPerfScores90d(undefined);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch("/api/agent/performance-score", {
          cache: "no-store",
        });
        const d = await r.json();
        if (cancelled) return;
        if (!r.ok || d?.error) {
          setPerfScores90d(null);
          return;
        }
        setPerfScores90d({
          scorVanzari:
            typeof d.scorVanzari === "number" ? d.scorVanzari : null,
          scorInchirieri:
            typeof d.scorInchirieri === "number" ? d.scorInchirieri : null,
        });
      } catch {
        if (!cancelled) setPerfScores90d(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, agentStatus]);

  useEffect(() => {
    if (!isSignedIn) return;
    if (agentStatus === "approved") {
      void refreshNotifications();
      void refreshPendingOffers();
      return;
    }
    if (agentStatus === "suspended") {
      void refreshNotifications();
    }
  }, [isSignedIn, agentStatus, refreshNotifications, refreshPendingOffers]);

  useEffect(() => {
    const fetchAgentProfile = async () => {
      if (!isSignedIn) {
        setProfileLoading(false);
        setProfileError("Trebuie să fii autentificat pentru a accesa pagina de agent.");
        return;
      }

      try {
        setProfileLoading(true);
        setProfileError(null);

        const response = await fetch("/api/agent/profile", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Nu am putut încărca profilul de agent.");
        }

        const status = payload.agentStatus as
          | "none"
          | "pending"
          | "approved"
          | "rejected"
          | "suspended";
        setAgentStatus(status);
        setQuestionnaireCompliance(
          payload.questionnaireCompliance ?? null,
        );
        setAgentProfile({
          name: payload?.name ?? "Agent",
          email: payload?.email ?? "",
          phone: payload?.agentProfile?.phone ?? payload?.phone ?? "",
          role: payload?.agentProfile?.role ?? "Agent imobiliar",
          location: payload?.agentProfile?.location ?? "Bucuresti",
          createdAt: payload?.createdAt ?? null,
        });
        setProfileForm({
          name: payload?.name ?? "Agent",
          phone: payload?.agentProfile?.phone ?? payload?.phone ?? "",
          role: payload?.agentProfile?.role ?? "Agent imobiliar",
          location: payload?.agentProfile?.location ?? "Bucuresti",
        });
        {
          const fo = (payload?.agentApplication?.formaOrganizare ?? "")
            .trim()
            .toUpperCase();
          setFormaOrganizare(fo === "PFA" || fo === "SRL" ? fo : "");
        }
        setCui(payload?.agentApplication?.cui ?? "");
        setBuletinUrl(payload?.agentApplication?.buletinUrl ?? "");
        setApplicationPhone(payload?.agentApplication?.telefon ?? "");
        setContractTemplateUrl(payload?.agentApplication?.contractTemplateUrl ?? null);
        setContractTemplateFileName(
          payload?.agentApplication?.contractTemplateFileName ?? null
        );
        setSignedContractUrl(payload?.agentApplication?.signedContractUrl ?? null);
        setSignedContractFileName(payload?.agentApplication?.signedContractFileName ?? null);
        setRejectionMessage(payload?.agentApplication?.rejectionMessage ?? null);
        setGoogleCalendarConnected(Boolean(payload?.googleCalendar?.connected));
        setGoogleCalendarEmail(payload?.googleCalendar?.googleCalendarEmail ?? null);
      } catch (error) {
        setProfileError(
          error instanceof Error ? error.message : "Nu am putut încărca profilul de agent."
        );
      } finally {
        setProfileLoading(false);
      }
    };

    fetchAgentProfile();
  }, [isSignedIn]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const gc = params.get("google_calendar");
    if (!gc) return;

    const messages: Record<string, string> = {
      connected: "Google Calendar a fost conectat.",
      denied: "Autorizarea Google a fost anulată.",
      invalid_state: "Sesiune OAuth invalidă. Încearcă din nou.",
      no_session: "Trebuie să fii autentificat.",
      agent_suspended:
        "Contul de agent este suspendat. Completează chestionarele din notificări înainte de a conecta Google Calendar.",
      no_clerk_email: "Contul nu are email. Adaugă un email în Clerk.",
      no_agent:
        "Nu există un rând Agent în baza de date cu emailul contului tău. Contactează administratorul.",
      no_refresh_token:
        "Nu s-a primit token de reînnoire. Încearcă din nou (revocă accesul aplicației din contul Google sau folosește alt cont).",
      no_code: "Lipsește codul OAuth.",
      error: "A apărut o eroare la conectarea Google.",
    };
    setGoogleCalendarMessage(messages[gc] ?? `Status: ${gc}`);
    window.history.replaceState({}, "", "/agent");

    if (gc === "connected") {
      fetch("/api/agent/profile", { cache: "no-store" })
        .then((r) => r.json())
        .then((p) => {
          if (p?.googleCalendar) {
            setGoogleCalendarConnected(Boolean(p.googleCalendar.connected));
            setGoogleCalendarEmail(p.googleCalendar.googleCalendarEmail ?? null);
          }
        })
        .catch(() => {});
    }
  }, []);

  const refreshAgentListings = useCallback(async () => {
    try {
      const response = await fetch("/api/agent/listings", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        return;
      }

      const mapped: AgentListing[] = (payload.listings ?? []).map(
          (listing: {
            id: string;
            title: string;
            price: number;
            currency: string;
            sector?: string | null;
            location: string;
            images?: unknown;
            createdAt: string;
            status?: string;
            transactionType?: string;
            saleSubmittedAt?: string | null;
            saleVerifiedAt?: string | null;
            saleRejectedAt?: string | null;
            saleRejectionNote?: string | null;
            details?: {
              suprafataUtila?: number;
              etaj?: number | string;
            } | null;
          }) => {
            const imageArray = Array.isArray(listing.images)
              ? listing.images
              : [];
            const firstImage = imageArray[0];
            const imageUrl =
              firstImage && typeof firstImage === "object" && "url" in firstImage
                ? String((firstImage as { url?: string }).url ?? "")
                : "/ap2.jpg";
            const suprafata = listing.details?.suprafataUtila
              ? `${listing.details.suprafataUtila} m²`
              : undefined;
            const etaj =
              listing.details?.etaj !== undefined
                ? `Etaj ${listing.details.etaj}`
                : undefined;

            const listingStatus: "approved" | "sold" =
              listing.status === "sold" ? "sold" : "approved";
            const salePendingReview =
              listingStatus === "approved" &&
              Boolean(listing.saleSubmittedAt) &&
              !listing.saleVerifiedAt &&
              !listing.saleRejectedAt;
            const saleRejected =
              listingStatus === "approved" &&
              Boolean(listing.saleRejectedAt) &&
              !listing.saleSubmittedAt;

            return {
              id: listing.id,
              titlu: listing.title,
              image: imageUrl || "/ap2.jpg",
              pret: formatListingPriceDisplay(
                Number(listing.price ?? 0),
                listing.currency ?? "EUR",
                (listing.details ?? null) as Record<string, unknown> | null,
              ),
              tags: [
                suprafata,
                listing.sector ?? listing.location,
                etaj,
              ].filter(Boolean) as string[],
              createdAt: listing.createdAt,
              imageCount: imageArray.length,
              listingStatus,
              transactionTypeLabel: listing.transactionType ?? "",
              salePendingReview,
              saleRejected,
              saleRejectionNote: listing.saleRejectionNote ?? null,
            };
          }
        );

      setAllListingsData(mapped);
    } catch {
      setAllListingsData([]);
    }
  }, []);

  useEffect(() => {
    if (agentStatus === "approved") {
      void refreshAgentListings();
    }
  }, [agentStatus, refreshAgentListings]);

  const submitAgentApplication = async () => {
    if (!formaOrganizare || !cui || !buletinUrl || !applicationPhone.trim()) {
      setSubmitMessage("Completează toate câmpurile, telefonul și încarcă buletinul.");
      return;
    }
    if (!gdprConsent) {
      setSubmitMessage("Bifează acordul GDPR pentru a trimite cererea.");
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitMessage(null);

      const response = await fetch("/api/agent/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formaOrganizare,
          cui,
          buletinUrl,
          telefon: applicationPhone.trim(),
          gdprAccepted: true,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Nu am putut trimite cererea.");
      }

      setAgentStatus("pending");
      setRejectionMessage(null);
      setContractTemplateUrl(null);
      setContractTemplateFileName(null);
      setSignedContractUrl(null);
      setSignedContractFileName(null);
      setSignedContractDraftName("");
      setSubmitMessage(
        "Cererea a fost trimisă. După validarea datelor vei primi contractul pentru semnare în această pagină."
      );
      setGdprConsent(false);
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "A apărut o eroare.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const submitSignedContract = async () => {
    if (!signedContractUrlDraft.trim()) {
      setSubmitMessage("Încarcă mai întâi fișierul semnat.");
      return;
    }
    try {
      setSignedContractLoading(true);
      setSubmitMessage(null);
      const response = await fetch("/api/agent/signed-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedContractUrl: signedContractUrlDraft.trim(),
          signedContractFileName: signedContractDraftName.trim() || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Nu am putut salva documentul.");
      }
      setSignedContractUrl(signedContractUrlDraft.trim());
      setSignedContractFileName(signedContractDraftName.trim() || null);
      setSignedContractUrlDraft("");
      setSignedContractDraftName("");
      setSubmitMessage(
        "Contractul semnat a fost încărcat. Administratorul îl verifică; vei fi notificat după decizie."
      );
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Eroare la încărcare.");
    } finally {
      setSignedContractLoading(false);
    }
  };

  const saveAgentProfile = async () => {
    if (!profileForm.name || !profileForm.phone || !profileForm.role || !profileForm.location) {
      setProfileSaveMessage("Completeaza toate campurile profilului.");
      return;
    }

    try {
      setProfileSaveLoading(true);
      setProfileSaveMessage(null);

      const response = await fetch("/api/agent/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Nu am putut salva profilul.");
      }

      setAgentProfile((current) => ({
        name: payload?.profile?.name ?? profileForm.name,
        email: current?.email ?? "",
        phone: payload?.profile?.phone ?? profileForm.phone,
        role: payload?.profile?.role ?? profileForm.role,
        location: payload?.profile?.location ?? profileForm.location,
        createdAt: current?.createdAt ?? null,
      }));
      setIsEditingProfile(false);
      setProfileSaveMessage("Profilul a fost actualizat.");
    } catch (error) {
      setProfileSaveMessage(
        error instanceof Error ? error.message : "A aparut o eroare la salvarea profilului."
      );
    } finally {
      setProfileSaveLoading(false);
    }
  };

  const approveViewing = async (id: string) => {
    setViewingActionId(id);
    try {
      const r = await fetch(`/api/agent/viewing-requests/${id}/approve`, {
        method: "POST",
      });
      const j = await r.json();
      if (!r.ok) {
        setViewingLoadError(j?.error ?? "Nu am putut aproba cererea.");
        return;
      }
      setViewingLoadError(null);
      await refreshViewingRequests();
    } finally {
      setViewingActionId(null);
    }
  };

  const rejectViewing = async (id: string) => {
    setViewingActionId(id);
    try {
      const r = await fetch(`/api/agent/viewing-requests/${id}/reject`, {
        method: "POST",
      });
      const j = await r.json();
      if (!r.ok) {
        setViewingLoadError(j?.error ?? "Nu am putut respinge cererea.");
        return;
      }
      setViewingLoadError(null);
      await refreshViewingRequests();
    } finally {
      setViewingActionId(null);
    }
  };

  const resolveClientOffer = async (offerId: string, action: "confirm" | "decline") => {
    setOfferActionId(offerId);
    try {
      const r = await fetch(`/api/agent/listing-offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const j = await r.json();
      if (!r.ok) {
        setOffersLoadError(j?.error ?? "Acțiunea a eșuat.");
        return;
      }
      await refreshPendingOffers();
    } finally {
      setOfferActionId(null);
    }
  };

  const todayISO = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Bucharest",
  });
  const todayAppointments = programari.filter((p) => p.data === todayISO);
  const upcomingAppointments = programari.filter((p) => p.data > todayISO);

  const displayProfile = useMemo(() => {
    if (!agentProfile) {
      return {
        name: "Agent",
        firstName: "Agent",
        initials: "AG",
        email: "",
        phone: "-",
        role: "Agent imobiliar",
        location: "Bucuresti",
        monthsOnPlatform: 0,
      };
    }

    const parts = agentProfile.name.trim().split(" ").filter(Boolean);
    const initials = (parts[0]?.[0] ?? "A") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "G");
    const createdAtDate = agentProfile.createdAt ? new Date(agentProfile.createdAt) : null;
    const monthsOnPlatform = createdAtDate
      ? Math.max(
          0,
          (new Date().getFullYear() - createdAtDate.getFullYear()) * 12 +
            (new Date().getMonth() - createdAtDate.getMonth())
        )
      : 0;

    return {
      name: agentProfile.name,
      firstName: parts[0] ?? "Agent",
      initials: initials.toUpperCase(),
      email: agentProfile.email,
      phone: agentProfile.phone || "-",
      role: agentProfile.role,
      location: agentProfile.location,
      monthsOnPlatform,
    };
  }, [agentProfile]);

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
  const [markSoldListingId, setMarkSoldListingId] = useState<string | null>(null);

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

  const fmtPerf = (n: number | null) =>
    n == null ? "—" : `${Math.round(n * 10) / 10}`;

  const stats = useMemo(
    () => [
      {
        titlu: "Anunțuri Active",
        valoare: String(activeListings.length),
        icon: MdHome,
        culoare: "#10B981",
        trend: "+2 luna aceasta",
      },
      {
        titlu: "Proprietăți Vândute",
        valoare: String(soldListings.length),
        icon: MdCheckCircle,
        culoare: "#3B82F6",
        trend: "+3 luna aceasta",
      },
      {
        titlu: "Scor vânzări (90 zile)",
        valoare:
          perfScores90d === undefined
            ? "…"
            : perfScores90d === null
              ? "—"
              : fmtPerf(perfScores90d.scorVanzari),
        icon: MdTrendingUp,
        culoare: "#F59E0B",
        trend: "Medie pe anunțuri finalizate",
      },
      {
        titlu: "Scor închirieri (90 zile)",
        valoare:
          perfScores90d === undefined
            ? "…"
            : perfScores90d === null
              ? "—"
              : fmtPerf(perfScores90d.scorInchirieri),
        icon: MdStar,
        culoare: "#D97706",
        trend: "Medie pe anunțuri finalizate",
      },
      {
        titlu: "Vizualizări / Lună",
        valoare: "0",
        icon: MdVisibility,
        culoare: "#C25A2B",
        trend: "Date indisponibile momentan",
      },
    ],
    [activeListings.length, soldListings.length, perfScores90d],
  );

  const markSoldTarget = useMemo(
    () => activeListings.find((l) => l.id === markSoldListingId) ?? null,
    [activeListings, markSoldListingId],
  );
  const markSoldModalLabel = useMemo(() => {
    if (!markSoldTarget) return "Marchează ca vândut";
    const t = markSoldTarget.transactionTypeLabel.toLowerCase();
    return t.includes("închirier") || t.includes("inchiri")
      ? "Marchează ca închiriat"
      : "Marchează ca vândut";
  }, [markSoldTarget]);

  if (profileLoading) {
    return (
      <div className="min-h-screen text-foreground pt-20">
        <Navbar />
        <div className="w-full max-w-[1250px] mx-auto px-4 md:px-8 py-10">
          Se încarcă profilul de agent...
        </div>
        <Footer />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen text-foreground pt-20">
        <Navbar />
        <div className="w-full max-w-[1250px] mx-auto px-4 md:px-8 py-10 text-red-500">
          {profileError}
        </div>
        <Footer />
      </div>
    );
  }

  if (agentStatus === "suspended") {
    return (
      <div className="min-h-screen text-foreground pt-20">
        <Navbar />
        <div className="w-full max-w-[720px] mx-auto px-4 md:px-8 py-10 space-y-6">
          <div
            className="rounded-2xl p-5 md:p-6 border border-amber-500/35 bg-amber-500/10 text-amber-950 dark:text-amber-100"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <MdWarning className="text-amber-600 shrink-0" size={28} />
              Cont de agent suspendat
            </h1>
            <p className="text-sm mt-3 opacity-95 leading-relaxed">
              Nu ai completat în termen (3 zile de la vizionare) chestionarele obligatorii după una sau mai
              multe vizionări. Funcțiile de agent (programări, anunțuri, oferte, calendar) sunt dezactivate
              până rezolvi situația.
            </p>
            <p className="text-sm mt-3 opacity-90">
              Deschide fiecare notificare de mai jos și completează chestionarul. După ce toate
              chestionarele restante sunt trimise, contul poate fi reactivat automat.
            </p>
          </div>

          <div
            className="rounded-2xl p-5 md:p-6 relative overflow-hidden"
            style={glassCard(isDark)}
          >
            <GlassShine isDark={isDark} />
            <h2 className="text-lg font-semibold relative z-1 flex items-center gap-2 mb-4">
              <MdNotifications className="text-[#C25A2B]" size={20} />
              Notificări — chestionare de completat
            </h2>
            {notificari.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 relative z-1">
                Dacă nu vezi notificări aici, reîmprospătează pagina sau verifică că folosești același email
                ca în contul de agent.
              </p>
            ) : (
              <ul className="space-y-2 relative z-1">
                {notificari.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-xl px-3 py-2.5 text-sm border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5"
                  >
                    <p className="text-foreground">{n.mesaj}</p>
                    {n.href ? (
                      <Link
                        href={n.href}
                        className="inline-block mt-2 text-xs font-semibold text-[#C25A2B] hover:underline"
                      >
                        Deschide chestionarul
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Pentru clarificări suplimentare, contactează administratorul platformei.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (agentStatus !== "approved") {
    const onboardingEditable = agentStatus === "none" || agentStatus === "rejected";
    const isPending = agentStatus === "pending";

    const lockedTiles = [
      { titlu: "Anunțuri și proprietăți", desc: "După aprobare vei putea gestiona anunțurile tale." },
      { titlu: "Calendar & programări", desc: "Vizionările și integrarea Google Calendar devin disponibile aici." },
      { titlu: "Statistici", desc: "Indicatorii de performanță se activează pentru conturi aprobate." },
      { titlu: "Notificări operaționale", desc: "Alertele pentru cereri noi apar după validarea completă." },
    ];

    return (
      <div className="min-h-screen text-foreground pt-20">
        <Navbar />
        <div className="w-full px-4 md:px-8 py-8 md:py-12">
          <div className="w-full max-w-[1250px] mx-auto space-y-8">
            <div>
              <h1
                className="text-2xl md:text-4xl font-bold text-foreground mb-2"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Panou agent
              </h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-3xl">
                {onboardingEditable ? (
                  <>
                    Completează datele de verificare. După ce administratorul validează informațiile, vei primi
                    un contract în această pagină: îl descarci, îl semnezi și îl încarci înapoi. Abia după
                    verificarea contractului semnat contul devine complet activ.
                  </>
                ) : (
                  <>
                    Contul tău este în curs de verificare. Poți vedea datele trimise mai jos; restul funcțiilor
                    se deblochează după aprobare.
                  </>
                )}
              </p>
            </div>

            {agentStatus === "rejected" && rejectionMessage && (
              <div
                className="rounded-2xl p-4 md:p-5 text-sm border border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-100"
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                <p className="font-semibold mb-1">Cererea a fost respinsă</p>
                <p className="opacity-95">{rejectionMessage}</p>
                <p className="mt-3 text-xs opacity-80">
                  Corectează datele de mai jos și trimite din nou cererea.
                </p>
              </div>
            )}

            {agentProfile && (
              <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 relative" style={glassCard(isDark)}>
                <GlassShine isDark={isDark} />
                <div className="relative z-1">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MdPerson className="text-[#C25A2B]" size={22} />
                    Datele contului tău
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Nume</span>
                      <p className="font-medium">{agentProfile.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Email</span>
                      <p className="font-medium break-all">{agentProfile.email || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Telefon (din cerere)</span>
                      <p className="font-medium">{applicationPhone || agentProfile.phone || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isPending && (
              <>
                <div className="rounded-xl px-4 py-3 text-sm text-[#F59E0B] bg-[#F59E0B]/10">
                  Cererea este în așteptare. După validarea datelor vei primi contractul pentru semnare aici.
                </div>

                <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 relative" style={glassCard(isDark)}>
                  <GlassShine isDark={isDark} />
                  <div className="relative z-1 space-y-4">
                    <h2 className="text-lg font-semibold">Date trimise spre verificare</h2>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Formă organizare</span>
                        <p>{formaOrganizare || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">CUI</span>
                        <p>{cui || "—"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">Buletin</span>
                        <p>
                          {buletinUrl ? (
                            <a
                              href={buletinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#C25A2B] underline"
                            >
                              vezi document
                            </a>
                          ) : (
                            "—"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 relative" style={glassCard(isDark)}>
                  <GlassShine isDark={isDark} />
                  <div className="relative z-1 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <MdDescription size={22} className="text-[#C25A2B]" />
                      Contract
                    </h2>
                    {contractTemplateUrl ? (
                      <>
                        <div
                          className="rounded-xl px-4 py-3 text-sm bg-[#C25A2B]/10 text-foreground border border-[#C25A2B]/25"
                          role="status"
                        >
                          Ai primit contractul pentru semnare. Folosește „Descarcă contractul” pentru a salva
                          fișierul pe dispozitiv, completează-l și semnează-l, apoi încarcă varianta finală mai jos.
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Fișier:{" "}
                          <span className="font-medium text-foreground">
                            {contractTemplateFileName ?? "contract-realimob.pdf"}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2 items-center">
                          <a
                            href="/api/agent/contract-files?kind=template"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium bg-[#C25A2B] hover:opacity-90"
                          >
                            <MdDownload size={20} />
                            Descarcă contractul
                          </a>
                          <a
                            href={contractTemplateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-gray-500 underline"
                          >
                            Deschide în browser (previzualizare)
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        După ce administratorul validează datele, contractul va apărea aici pentru descărcare.
                      </p>
                    )}

                    {contractTemplateUrl && !signedContractUrl && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <MdUploadFile className="text-[#C25A2B]" />
                          Încarcă contractul semnat
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Trage PDF-ul / imaginea aici sau folosește butonul. După încărcare, apasă „Trimite
                          contractul semnat”.
                        </p>
                        <div
                          className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-4"
                          data-testid="agent-signed-contract-upload"
                        >
                          <UploadDropzone
                            endpoint="documentUploader"
                            onClientUploadComplete={(res) => {
                              const f = res?.[0];
                              if (f?.url) {
                                setSignedContractUrlDraft(f.url);
                                setSignedContractDraftName(f.name ?? "");
                              }
                            }}
                            onUploadError={(error: Error) => setSubmitMessage(error.message)}
                            appearance={{
                              container: "border-0 bg-transparent p-0",
                              uploadIcon: "text-[#C25A2B]",
                            }}
                            content={{
                              label: "Trage contractul semnat aici",
                              allowedContent: "PDF sau imagine",
                            }}
                          />
                          <div className="flex justify-center my-2">
                            <span className="text-xs text-gray-400">sau</span>
                          </div>
                          <UploadButton
                            endpoint="documentUploader"
                            onClientUploadComplete={(res) => {
                              const f = res?.[0];
                              if (f?.url) {
                                setSignedContractUrlDraft(f.url);
                                setSignedContractDraftName(f.name ?? "");
                              }
                            }}
                            onUploadError={(error: Error) => setSubmitMessage(error.message)}
                            content={{
                              button: "Alege fișier",
                              allowedContent: "PDF / imagine",
                            }}
                          />
                        </div>
                        {signedContractUrlDraft ? (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            Gata de trimitere:{" "}
                            <strong>{signedContractDraftName || "document"}</strong>
                          </p>
                        ) : null}
                        <button
                          type="button"
                          onClick={submitSignedContract}
                          disabled={signedContractLoading || !signedContractUrlDraft}
                          className="px-5 py-2.5 rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-45"
                          style={{ background: "#1F2D44" }}
                        >
                          {signedContractLoading ? "Se trimite…" : "Trimite contractul semnat"}
                        </button>
                      </div>
                    )}

                    {signedContractUrl && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Contractul semnat a fost încărcat ({signedContractFileName ?? "document"}).
                          Așteaptă verificarea finală din partea administratorului.
                        </p>
                        <a
                          href="/api/agent/contract-files?kind=signed"
                          className="inline-flex items-center gap-2 text-sm text-[#C25A2B] font-medium underline"
                        >
                          <MdDownload size={18} />
                          Descarcă copia ta
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-400">
                    Disponibil după aprobare
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {lockedTiles.map((tile) => (
                      <div
                        key={tile.titlu}
                        className="rounded-2xl p-5 relative overflow-hidden opacity-60 pointer-events-none select-none"
                        style={glassCard(isDark)}
                      >
                        <div className="absolute top-3 right-3 text-gray-400">
                          <MdLock size={22} />
                        </div>
                        <h3 className="font-semibold text-foreground pr-8">{tile.titlu}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{tile.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {onboardingEditable && (
              <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 relative" style={glassCard(isDark)}>
                <GlassShine isDark={isDark} />
                <div className="relative z-1 space-y-5">
                  <h2 className="text-lg font-semibold">Cerere de înregistrare</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Completează datele de mai jos. Telefonul este obligatoriu și este folosit pentru contact
                    operațional; include prefix (ex. +40…).
                  </p>

                  <div>
                    <label className="block text-sm mb-2">
                      Telefon <span className="text-red-600 dark:text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      value={applicationPhone}
                      onChange={(e) => setApplicationPhone(e.target.value)}
                      placeholder="Ex: +40722111222"
                      className="w-full px-4 py-3 rounded-xl border bg-white/70 dark:bg-black/20"
                    />
                  </div>

                  <fieldset className="space-y-4 border-0 p-0 m-0">
                    <legend className="block text-sm md:text-base font-semibold">
                      Forma de organizare <span className="text-red-600 dark:text-red-400">*</span>
                    </legend>
                    <div className="flex flex-wrap items-center pb-10 pt-3 gap-8 sm:gap-12 md:gap-16">
                      <label className="inline-flex items-center gap-2.5 cursor-pointer rounded-xl border border-gray-200 dark:border-white/15 px-4 py-3 sm:px-5 sm:py-3.5 bg-white/50 dark:bg-white/5 text-lg sm:text-xl font-semibold tracking-tight has-[:checked]:border-[#C25A2B] has-[:checked]:bg-[#C25A2B]/10 dark:has-[:checked]:bg-[#C25A2B]/15">
                        <input
                          type="radio"
                          name="formaOrganizare"
                          value="PFA"
                          checked={formaOrganizare === "PFA"}
                          onChange={() => setFormaOrganizare("PFA")}
                          className="h-5 w-5 shrink-0 accent-[#C25A2B]"
                        />
                        PFA
                      </label>
                      <label className="inline-flex items-center gap-2.5 cursor-pointer rounded-xl border border-gray-200 dark:border-white/15 px-4 py-3 sm:px-5 sm:py-3.5 bg-white/50 dark:bg-white/5 text-lg sm:text-xl font-semibold tracking-tight has-[:checked]:border-[#C25A2B] has-[:checked]:bg-[#C25A2B]/10 dark:has-[:checked]:bg-[#C25A2B]/15">
                        <input
                          type="radio"
                          name="formaOrganizare"
                          value="SRL"
                          checked={formaOrganizare === "SRL"}
                          onChange={() => setFormaOrganizare("SRL")}
                          className="h-5 w-5 shrink-0 accent-[#C25A2B]"
                        />
                        SRL
                      </label>
                    </div>
                  </fieldset>

                  <div>
                    <label className="block text-sm mb-2">
                      CUI <span className="text-red-600 dark:text-red-400">*</span>
                    </label>
                    <input
                      value={cui}
                      onChange={(e) => setCui(e.target.value)}
                      placeholder="Ex: RO12345678"
                      className="w-full px-4 py-3 rounded-xl border bg-white/70 dark:bg-black/20"
                    />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={gdprConsent}
                      onChange={(e) => setGdprConsent(e.target.checked)}
                      className="mt-1 accent-[#C25A2B] shrink-0"
                    />
                    <span>
                      Sunt de acord ca datele mele (inclusiv numărul de telefon și documentele încărcate) să
                      fie prelucrate de Realimob în scopul evaluării cererii de înregistrare ca agent
                      imobiliar, conform Regulamentului (UE) 2016/679 (GDPR).{" "}
                      <span className="text-red-600 dark:text-red-400">*</span>
                    </span>
                  </label>

                  <div>
                    <label className="block text-sm mb-2">Buletin (PDF, JPG, PNG)</label>
                    {buletinUrl ? (
                      <div className="text-sm mb-3">
                        Document încărcat:{" "}
                        <a
                          href={buletinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#C25A2B] underline"
                        >
                          vezi fișier
                        </a>
                      </div>
                    ) : null}
                    <UploadButton
                      endpoint="documentUploader"
                      onClientUploadComplete={(res) => {
                        const uploadedUrl = res?.[0]?.url;
                        if (uploadedUrl) setBuletinUrl(uploadedUrl);
                      }}
                      onUploadError={(error: Error) => setSubmitMessage(error.message)}
                    />
                  </div>

                  {submitMessage && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">{submitMessage}</div>
                  )}

                  <button
                    type="button"
                    onClick={submitAgentApplication}
                    disabled={submitLoading}
                    className="px-5 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ background: "#C25A2B" }}
                  >
                    {submitLoading ? "Se trimite..." : "Trimite cererea pentru aprobare"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground pt-20">
      <Navbar />

      <div className="w-full px-4 md:px-8 py-8 md:py-12">
        <div className="w-full max-w-[1250px] mx-auto space-y-8 md:space-y-10">
          {questionnaireCompliance?.gracePeriodWarning && (
            <div
              className="rounded-2xl px-4 py-3 md:px-5 md:py-4 border border-amber-500/40 bg-amber-500/10 text-sm text-amber-950 dark:text-amber-50"
              style={{ fontFamily: "var(--font-galak-regular)" }}
              role="alert"
            >
              <p className="font-semibold flex items-center gap-2">
                <MdWarning className="text-amber-600 shrink-0" size={20} />
                Chestionare după vizionare — termen limită
              </p>
              <p className="mt-2 opacity-95">
                Ai {questionnaireCompliance.pendingInGraceCount} chestionar
                {questionnaireCompliance.pendingInGraceCount === 1 ? "" : "e"} de completat în legătură cu
                vizionări recente. Ai la dispoziție 3 zile de la încheierea vizionării; după aceea contul
                poate fi suspendat automat.
              </p>
              {questionnaireCompliance.hoursRemainingApprox != null &&
                questionnaireCompliance.nextDeadlineIso && (
                  <p className="mt-2 text-xs opacity-90">
                    Primul termen expiră în aproximativ{" "}
                    <strong>{questionnaireCompliance.hoursRemainingApprox} ore</strong> (
                    {new Date(questionnaireCompliance.nextDeadlineIso).toLocaleString("ro-RO", {
                      timeZone: "Europe/Bucharest",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    ).
                  </p>
                )}
              <p className="mt-2 text-xs opacity-90">
                Deschide notificările sau completează direct din linkurile primite.
              </p>
            </div>
          )}

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
                Bună, {displayProfile.firstName}
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
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-0">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:items-stretch">
            {/* Profile card */}
            <div className="lg:col-span-1 flex flex-col lg:h-full lg:min-h-0 min-h-0">
              <div
                className="rounded-2xl md:rounded-3xl overflow-hidden relative flex-1 flex flex-col min-h-0 h-full lg:min-h-0"
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
              <div className="p-6 md:p-7 relative z-1 flex flex-col flex-1 min-h-0 overflow-y-auto">
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
                    {displayProfile.initials}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-foreground truncate">
                      {displayProfile.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {displayProfile.role}
                    </p>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <MdEmail size={16} className="text-gray-400 shrink-0" />
                    <span className="text-foreground truncate">
                      {displayProfile.email || "Email indisponibil"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MdPhone size={16} className="text-gray-400 shrink-0" />
                    <span className="text-foreground">{displayProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MdLocationOn size={16} className="text-gray-400 shrink-0" />
                    <span className="text-foreground">
                      {displayProfile.location} · {displayProfile.monthsOnPlatform} luni in platforma
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
                            i < 5
                              ? "text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">
                      5.0
                    </span>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      profil verificat
                    </p>
                  </div>
                </div>

                {/* Edit button */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileSaveMessage(null);
                    setIsEditingProfile((value) => !value);
                  }}
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

                {isEditingProfile && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((current) => ({ ...current, name: e.target.value }))
                      }
                      placeholder="Nume complet"
                      className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white/80 dark:bg-black/30"
                    />
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((current) => ({ ...current, phone: e.target.value }))
                      }
                      placeholder="Telefon"
                      className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white/80 dark:bg-black/30"
                    />
                    <input
                      type="text"
                      value={profileForm.role}
                      onChange={(e) =>
                        setProfileForm((current) => ({ ...current, role: e.target.value }))
                      }
                      placeholder="Rol"
                      className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white/80 dark:bg-black/30"
                    />
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) =>
                        setProfileForm((current) => ({ ...current, location: e.target.value }))
                      }
                      placeholder="Locatie"
                      className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white/80 dark:bg-black/30"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveAgentProfile}
                        disabled={profileSaveLoading}
                        className="flex-1 px-3 py-2.5 rounded-lg text-white text-sm font-medium"
                        style={{ background: "#C25A2B" }}
                      >
                        {profileSaveLoading ? "Se salveaza..." : "Salveaza"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-2.5 rounded-lg text-sm border"
                      >
                        Renunta
                      </button>
                    </div>
                    {profileSaveMessage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{profileSaveMessage}</p>
                    )}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200/40 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MdCalendarToday size={18} className="text-[#4285F4]" />
                    <span className="text-sm font-semibold text-foreground">
                      Google Calendar
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Clienții văd intervalele tale libere (L–V, 9–18) din acest calendar.
                    După ce aprobi o cerere, se creează evenimentul în Google Calendar.
                    Dacă ai conectat calendarul înainte de această funcție, reconectează-te
                    o dată pentru permisiunea de citire (free/busy).
                  </p>
                  {googleCalendarMessage && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                      {googleCalendarMessage}
                    </p>
                  )}
                  {googleCalendarConnected ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Conectat ca:{" "}
                        <span className="font-medium text-foreground">
                          {googleCalendarEmail ?? "—"}
                        </span>
                      </p>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setGoogleTestEventLoading(true);
                            setGoogleCalendarMessage(null);
                            try {
                              const r = await fetch("/api/agent/google-calendar/test-event", {
                                method: "POST",
                              });
                              const j = await r.json();
                              if (!r.ok) throw new Error(j.error);
                              setGoogleCalendarMessage(
                                "Eveniment de test creat. Verifică în Google Calendar."
                              );
                            } catch (e) {
                              setGoogleCalendarMessage(
                                e instanceof Error ? e.message : "Eroare"
                              );
                            } finally {
                              setGoogleTestEventLoading(false);
                            }
                          }}
                          disabled={googleTestEventLoading}
                          className="w-full px-3 py-2 rounded-lg text-xs border text-foreground disabled:opacity-50"
                        >
                          {googleTestEventLoading
                            ? "Se creează..."
                            : "Creează eveniment de test (30 min)"}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            setGoogleDisconnectLoading(true);
                            setGoogleCalendarMessage(null);
                            try {
                              const r = await fetch("/api/agent/google-calendar/disconnect", {
                                method: "POST",
                              });
                              const j = await r.json();
                              if (!r.ok) throw new Error(j.error);
                              setGoogleCalendarConnected(false);
                              setGoogleCalendarEmail(null);
                              setGoogleCalendarMessage("Google Calendar a fost deconectat.");
                            } catch (e) {
                              setGoogleCalendarMessage(
                                e instanceof Error ? e.message : "Eroare"
                              );
                            } finally {
                              setGoogleDisconnectLoading(false);
                            }
                          }}
                          disabled={googleDisconnectLoading}
                          className="w-full px-3 py-2 rounded-lg text-xs text-red-600 dark:text-red-400 border border-red-500/30 disabled:opacity-50"
                        >
                          {googleDisconnectLoading ? "Se deconectează..." : "Deconectează Google"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/api/agent/google-calendar/connect";
                      }}
                      className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white"
                      style={{ background: "#4285F4" }}
                    >
                      Conectează Google Calendar
                    </button>
                  )}
                </div>
              </div>
              </div>
            </div>

            {/* Programări azi + viitoare */}
            <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8 lg:h-full lg:min-h-0 min-h-0">
              {viewingLoadError && (
                <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-500/10 rounded-xl px-4 py-2">
                  {viewingLoadError}
                </p>
              )}

              {pendingViewingRows.length > 0 && (
                <div
                  className="rounded-2xl md:rounded-3xl overflow-hidden relative border border-amber-500/25"
                  style={glassCard(isDark)}
                >
                  <GlassShine isDark={isDark} />
                  <div className="p-5 md:p-6 relative z-1 space-y-3">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <MdSchedule size={20} className="text-amber-500" />
                      Cereri de vizionare (așteaptă aprobare)
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Aprobă pentru a crea evenimentul în Google Calendar și a trimite invitație la client.
                      Respinge dacă intervalul nu mai convine.
                    </p>
                    <ul className="space-y-3">
                      {pendingViewingRows.map((row) => {
                        const start = new Date(row.startAt);
                        const label = start.toLocaleString("ro-RO", {
                          timeZone: "Europe/Bucharest",
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                        const busy = viewingActionId === row.id;
                        return (
                          <li
                            key={row.id}
                            className="rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
                            style={{
                              background: isDark
                                ? "rgba(27, 27, 33, 0.6)"
                                : "rgba(255, 255, 255, 0.75)",
                            }}
                          >
                            <div className="flex-1 min-w-0 text-sm">
                              <p className="font-medium text-foreground truncate">
                                {row.listingTitle}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {label} · {row.clientName} · {row.clientEmail}
                              </p>
                              {row.message && (
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                  {row.message}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                type="button"
                                disabled={busy || !googleCalendarConnected}
                                onClick={() => approveViewing(row.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45"
                              >
                                Aprobă
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => rejectViewing(row.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-white/20"
                              >
                                Respinge
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    {!googleCalendarConnected && (
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        Conectează Google Calendar mai sus pentru a putea aproba cereri.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(offersLoadError || pendingClientOffers.length > 0) && (
                <div
                  className="rounded-2xl md:rounded-3xl overflow-hidden relative border border-[#C25A2B]/25"
                  style={glassCard(isDark)}
                >
                  <GlassShine isDark={isDark} />
                  <div className="p-5 md:p-6 relative z-1 space-y-3">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <MdLocalOffer size={20} className="text-[#C25A2B]" />
                      Oferte clienți (în așteptare)
                    </h2>
                    {offersLoadError && (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {offersLoadError}
                      </p>
                    )}
                    {pendingClientOffers.length > 0 && (
                      <ul className="space-y-3">
                        {pendingClientOffers.map((o) => {
                          const busy = offerActionId === o.id;
                          return (
                            <li
                              key={o.id}
                              className="rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
                              style={{
                                background: isDark
                                  ? "rgba(27, 27, 33, 0.6)"
                                  : "rgba(255, 255, 255, 0.75)",
                              }}
                            >
                              <div className="flex-1 min-w-0 text-sm">
                                <p className="font-medium text-foreground">
                                  {Number(o.amount).toLocaleString("ro-RO")}{" "}
                                  {o.currency} · {o.listing.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {o.viewingRequest?.clientName ?? "Client"} ·{" "}
                                  {o.viewingRequest?.clientEmail ?? "—"}
                                </p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => resolveClientOffer(o.id, "confirm")}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45"
                                >
                                  Confirmă
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => resolveClientOffer(o.id, "decline")}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-white/20"
                                >
                                  Respinge
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6 md:gap-8 min-h-0 lg:flex-1 lg:min-h-0">
                {/* Today's appointments */}
                <div
                  className="rounded-2xl md:rounded-3xl overflow-hidden relative flex flex-col min-h-0 lg:flex-1"
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
                  <div className="p-5 md:p-6 relative z-1 flex flex-col flex-1 min-h-0">
                    <div className="flex items-center justify-between mb-5 shrink-0">
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

                    <div className="flex-1 min-h-0 overflow-y-auto pr-1 hide-scrollbar">
                      {todayAppointments.length === 0 ? (
                        <div className="py-6 text-center lg:h-full lg:flex lg:flex-col lg:items-center lg:justify-center lg:min-h-0">
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
                </div>

                {/* Upcoming appointments */}
                {upcomingAppointments.length > 0 && (
                  <div
                    className="rounded-2xl md:rounded-3xl overflow-hidden relative flex flex-col min-h-0 lg:flex-1"
                    style={glassCard(isDark)}
                  >
                    <GlassShine isDark={isDark} />
                    <div className="p-5 md:p-6 relative z-1 flex flex-col flex-1 min-h-0">
                      <div className="flex items-center justify-between mb-5 shrink-0">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <MdAccessTime size={20} className="text-[#C25A2B]" />
                          Programări viitoare
                        </h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {upcomingAppointments.length} programăr
                          {upcomingAppointments.length === 1 ? "e" : "i"}
                        </span>
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto pr-1 hide-scrollbar space-y-2">
                        {upcomingAppointments.map((p) => {
                          const cfg = getProgramareStatusConfig(p.status);
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
          </div>

          {/* ──────────────── CALENDAR + NOTIFICĂRI ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:items-stretch">
            {/* Calendar */}
            <div className="lg:col-span-1 lg:h-full lg:min-h-0 flex flex-col min-h-0">
              <MonthCalendar isDark={isDark} programari={programari} />
            </div>

            {/* Notificări */}
            <div className="lg:col-span-2 lg:h-full lg:min-h-0 flex flex-col min-h-0">
              <div
                className="rounded-2xl md:rounded-3xl overflow-hidden relative flex-1 flex flex-col min-h-0 h-full lg:min-h-0"
                style={glassCard(isDark)}
              >
                <GlassShine isDark={isDark} />
                <div className="p-5 md:p-6 relative z-1 flex flex-col flex-1 min-h-0 gap-4">
                  <div className="flex items-center justify-between shrink-0">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 lg:flex-1 lg:flex lg:items-center lg:min-h-0">
                      Nu ai notificări în acest moment.
                    </p>
                  ) : (
                    <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1 hide-scrollbar">
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
                              {n.href ? (
                                <Link
                                  href={n.href}
                                  className="inline-block mt-2 text-xs font-semibold text-[#C25A2B] hover:underline"
                                >
                                  Deschide chestionarul
                                </Link>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              aria-label={
                                isUnread
                                  ? "Marchează ca citit"
                                  : "Marchează ca necitit"
                              }
                              onClick={async () => {
                                const willBeRead = isUnread;
                                try {
                                  await fetch(
                                    `/api/notifications/${n.id}/${willBeRead ? "read" : "unread"}`,
                                    { method: "POST" },
                                  );
                                } catch {
                                  return;
                                }
                                setNotificari((cur) =>
                                  cur.map((item) =>
                                    item.id === n.id
                                      ? { ...item, citita: !item.citita }
                                      : item,
                                  ),
                                );
                              }}
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

            {/* Search + sector: mereu vizibile ca să poți schimba filtrul și când nu există rezultate */}
            <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paginatedActive.map((anunt) => {
                    const markLabel =
                      anunt.transactionTypeLabel.toLowerCase().includes("închirier") ||
                      anunt.transactionTypeLabel.toLowerCase().includes("inchiri")
                        ? "Marchează ca închiriat"
                        : "Marchează ca vândut";
                    return (
                      <div key={anunt.id} className="space-y-2">
                        <AdminListingCard
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
                          href={`/anunturi/${anunt.id}`}
                          status="active"
                        />
                        <div className="flex flex-col gap-2 px-1">
                          {anunt.salePendingReview && (
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-1 rounded-lg w-fit">
                              Contract în verificare la administrator
                            </span>
                          )}
                          {anunt.saleRejected && anunt.saleRejectionNote && (
                            <span className="text-xs text-red-700 dark:text-red-300 bg-red-500/10 px-2 py-1 rounded-lg">
                              Respingere: {anunt.saleRejectionNote}
                            </span>
                          )}
                          <button
                            type="button"
                            disabled={anunt.salePendingReview}
                            onClick={() => setMarkSoldListingId(anunt.id)}
                            className="w-full sm:w-auto text-left px-3 py-2 rounded-xl text-xs font-semibold border border-[#C25A2B]/50 text-[#C25A2B] hover:bg-[#C25A2B]/10 disabled:opacity-45 disabled:cursor-not-allowed"
                          >
                            {markLabel} — încarcă contractul
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                      imageCount={anunt.imageCount}
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
        </div>
      </div>

      <MarkListingSoldModal
        isOpen={Boolean(markSoldListingId && markSoldTarget)}
        listingId={markSoldListingId ?? ""}
        listingTitle={markSoldTarget?.titlu ?? ""}
        markLabel={markSoldModalLabel}
        isDark={isDark}
        onClose={() => setMarkSoldListingId(null)}
        onSubmitted={() => void refreshAgentListings()}
      />

      <Footer />
    </div>
  );
}
