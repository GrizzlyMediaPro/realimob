"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdInfoOutline, MdStar, MdAccessTime, MdThumbUp, MdClose } from "react-icons/md";
import { FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { GlassContactCard, GlassCTAButton } from "./LiquidGlassCards";
import ViewingBookingModal from "./ViewingBookingModal";
import type { Anunt } from "../../lib/anunturiData";

/* ── Tipuri & date agenți demo ── */
type MockAgent = {
  id: number;
  name: string;
  role: string;
  deals: number;
  rating: number;
  responseTime: string;
  linkedin?: string;
};

const AGENTS: MockAgent[] = [
  {
    id: 1,
    name: "Andrei Ionescu",
    role: "Senior Real Estate Advisor",
    deals: 184,
    rating: 4.9,
    responseTime: "< 30 min",
    linkedin: "#",
  },
  {
    id: 2,
    name: "Ioana Marinescu",
    role: "Consultant imobiliar",
    deals: 132,
    rating: 4.8,
    responseTime: "< 1 oră",
    linkedin: "#",
  },
  {
    id: 3,
    name: "Mihai Pop",
    role: "Expert rezidențial",
    deals: 96,
    rating: 4.7,
    responseTime: "< 45 min",
    linkedin: "#",
  },
];

export function pickAgentForAnunt(anunt: Anunt): MockAgent {
  const numericId =
    typeof anunt.id === "string"
      ? parseInt(anunt.id.replace(/\D/g, "") || "0", 10)
      : anunt.id;
  const index = Math.abs(numericId) % AGENTS.length;
  return AGENTS[index];
}

type DisplayAgent = {
  id: string;
  name: string;
  role: string;
  deals: number;
  rating: number;
  responseTime: string;
  linkedin?: string;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  isAssigned: boolean;
};

type AgentPerformancePair = {
  scorVanzari: number | null;
  scorInchirieri: number | null;
};

function resolveDisplayAgent(anunt: Anunt): DisplayAgent {
  const a = anunt.assignedAgent;
  if (a) {
    return {
      id: a.id,
      name: a.name,
      role: "Agent imobiliar RealImob",
      deals: 0,
      rating: a.rating,
      responseTime: "< 24 h",
      linkedin: undefined,
      phone: a.phone ?? null,
      avatar: a.avatar ?? null,
      bio: a.bio?.trim() ? a.bio.trim() : null,
      isAssigned: true,
    };
  }
  const mock = pickAgentForAnunt(anunt);
  return {
    id: String(mock.id),
    name: mock.name,
    role: mock.role,
    deals: mock.deals,
    rating: mock.rating,
    responseTime: mock.responseTime,
    linkedin: mock.linkedin,
    phone: null,
    avatar: null,
    bio: null,
    isAssigned: false,
  };
}

function fmtPerfScore(value: number | null | undefined): string {
  return typeof value === "number"
    ? (Math.round(value * 10) / 10).toLocaleString("ro-RO")
    : "—";
}

function isMongoListingId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

function normalizePhoneForWhatsApp(phone: string): string | null {
  const d = phone.replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("40")) return d;
  if (d.startsWith("0")) return `40${d.slice(1)}`;
  if (d.length === 9) return `40${d}`;
  return d;
}

function resolveWhatsAppPhone(agent: DisplayAgent): string | null {
  const raw = agent.phone?.trim();
  if (raw) {
    const digits = normalizePhoneForWhatsApp(raw);
    if (digits) return digits;
  }
  const fallback = (process.env.NEXT_PUBLIC_WHATSAPP_FALLBACK || "").trim();
  if (!fallback) return null;
  return normalizePhoneForWhatsApp(fallback);
}

/* ── Tooltip Portal ── */
function TooltipPortal({
  anchorRef,
  show,
  align = "left",
  placement = "bottom",
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  show: boolean;
  align?: "left" | "right";
  placement?: "top" | "bottom";
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!show || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();

    const top =
      placement === "bottom"
        ? rect.bottom + 8
        : rect.top - 8;

    setPos({
      top,
      left: align === "left" ? rect.left : rect.right,
    });
  }, [show, anchorRef, align, placement]);

  if (!mounted || !show) return null;

  return createPortal(
    <div
      className="fixed w-72 max-w-[90vw] rounded-2xl bg-black/92 text-white text-xs px-4 py-3 shadow-2xl border border-white/15"
      style={{
        zIndex: 99999,
        top: pos.top,
        left: align === "left" ? pos.left : undefined,
        right: align === "right" ? window.innerWidth - pos.left : undefined,
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        pointerEvents: "none",
        transform: placement === "top" ? "translateY(-100%)" : "none",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

/* ── Modal agent ── */
function AgentModal({
  agent,
  perfScores,
  agentInitials,
  locationTag,
  isAssigned,
  onClose,
}: {
  agent: DisplayAgent;
  perfScores: AgentPerformancePair | null;
  agentInitials: string;
  locationTag: string;
  isAssigned: boolean;
  onClose: () => void;
}) {
  const [isAvatarZoomOpen, setIsAvatarZoomOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isAvatarZoomOpen) {
        setIsAvatarZoomOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isAvatarZoomOpen, onClose]);

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center px-4 py-6"
      style={{ zIndex: 99999, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 shadow-2xl border border-white/20 dark:border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/60 to-transparent dark:from-white/10" />
        </div>

        <div className="relative z-10 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {agent.avatar ? (
                <button
                  type="button"
                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/60"
                  onClick={() => setIsAvatarZoomOpen(true)}
                  aria-label="Vezi imaginea de profil mărită"
                  title="Vezi imaginea mărită"
                >
                  <img
                    src={agent.avatar}
                    alt={`Profil ${agent.name}`}
                    className="w-14 h-14 rounded-full object-cover border border-white/20 cursor-zoom-in"
                  />
                </button>
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#C25A2B]/15 flex items-center justify-center text-base font-semibold text-[#C25A2B]">
                  {agentInitials}
                </div>
              )}
              <div>
                <div className="text-base font-semibold text-foreground">
                  {agent.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {agent.role}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={onClose}
            >
              <MdClose size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {agent.bio ? (
            <div className="rounded-xl bg-gray-50/80 dark:bg-zinc-900/70 px-3.5 py-3 text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {agent.bio}
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex flex-col gap-1 rounded-xl bg-gray-50/80 dark:bg-zinc-900/70 px-3 py-2">
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <MdStar className="text-yellow-400" size={14} />
                Scor RealImob
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {agent.rating.toFixed(1)}/5
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-gray-50/80 dark:bg-zinc-900/70 px-3 py-2">
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <MdThumbUp size={14} />
                Tranzacții
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {agent.deals > 0 ? `${agent.deals}+ finalize` : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-gray-50/80 dark:bg-zinc-900/70 px-3 py-2">
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <MdAccessTime size={14} />
                Răspuns
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {agent.responseTime}
              </span>
            </div>
          </div>

          {perfScores && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-gray-50/80 dark:bg-zinc-900/70 px-3 py-2">
                <span className="text-gray-500 dark:text-gray-400">Scor vânzări</span>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {fmtPerfScore(perfScores.scorVanzari)}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50/80 dark:bg-zinc-900/70 px-3 py-2">
                <span className="text-gray-500 dark:text-gray-400">Scor închirieri</span>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {fmtPerfScore(perfScores.scorInchirieri)}
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {isAssigned ? (
              <>
                <span className="font-semibold">{agent.name}</span> este agentul
                atribuit acestui anunț și te poate ajuta cu vizionarea și
                detaliile despre proprietate în zona{" "}
                <span className="font-semibold">{locationTag}</span>.
              </>
            ) : (
              <>
                Agentul afișat este un exemplu pentru anunțurile demo. Pentru
                proprietăți reale din platformă, vei vedea agentul atribuit
                de echipa RealImob, specializat pe zona{" "}
                <span className="font-semibold">{locationTag}</span>.
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            {agent.linkedin && agent.linkedin !== "#" ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0A66C2] hover:underline"
                onClick={() => {
                  window.open(agent.linkedin, "_blank", "noopener,noreferrer");
                }}
              >
                <FaLinkedin size={14} />
                Vezi profilul LinkedIn
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <MdInfoOutline size={12} />
              <span>Scor și statistici interne RealImob</span>
            </div>
          </div>
        </div>
      </div>
      {isAvatarZoomOpen && agent.avatar ? (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.78)" }}
          onClick={() => setIsAvatarZoomOpen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/35 text-white hover:bg-black/55 transition-colors"
            onClick={() => setIsAvatarZoomOpen(false)}
            aria-label="Închide imaginea mărită"
          >
            <MdClose size={20} />
          </button>
          <img
            src={agent.avatar}
            alt={`Profil ${agent.name}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>,
    document.body,
  );
}

/* ── Card principal desktop ── */
type AgentContactCardProps = {
  anunt: Anunt;
};

export default function AgentContactCard({ anunt }: AgentContactCardProps) {
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOpen, setViewingOpen] = useState(false);
  const [perfScores, setPerfScores] = useState<AgentPerformancePair | null>(null);

  const nameRef = useRef<HTMLButtonElement>(null);
  const infoRef = useRef<HTMLButtonElement>(null);

  const agent = useMemo(() => resolveDisplayAgent(anunt), [anunt]);
  const canSchedule =
    agent.isAssigned && isMongoListingId(String(anunt.id));
  const waDigits = useMemo(() => resolveWhatsAppPhone(agent), [agent]);
  const canWhatsApp = Boolean(waDigits);

  const agentInitials = agent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const locationTag =
    anunt.tags.find((t) => t.includes("Sector")) ??
    anunt.tags.find((t) => t.toLowerCase().includes("centru")) ??
    "București";

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    if (!agent.isAssigned) return;
    let cancelled = false;
    void (async () => {
      try {
        const params = new URLSearchParams({ agentId: agent.id });
        const res = await fetch(`/api/agents/public-performance-score?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled || !res.ok) return;
        setPerfScores({
          scorVanzari: typeof data?.scorVanzari === "number" ? data.scorVanzari : null,
          scorInchirieri:
            typeof data?.scorInchirieri === "number" ? data.scorInchirieri : null,
        });
      } catch {
        if (!cancelled) setPerfScores(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [agent.id, agent.isAssigned]);
  const visiblePerfScores = agent.isAssigned ? perfScores : null;

  const openWhatsApp = useCallback(() => {
    if (!waDigits) return;
    const text = `Bună, sunt interesat de anunțul: ${anunt.titlu}. Link: ${window.location.href}`;
    window.open(
      `https://wa.me/${waDigits}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [waDigits, anunt.titlu]);

  const onScheduleClick = useCallback(() => {
    if (canSchedule) setViewingOpen(true);
  }, [canSchedule]);

  return (
    <>
      <GlassContactCard>
        <div className="relative z-2 flex items-center justify-between gap-2 mb-1">
          <button
            ref={nameRef}
            type="button"
            className="flex items-center gap-2 group text-left min-w-0"
            onMouseEnter={() => setShowNameTooltip(true)}
            onMouseLeave={() => setShowNameTooltip(false)}
            onClick={() => setIsModalOpen(true)}
          >
            {agent.avatar ? (
              <img
                src={agent.avatar}
                alt=""
                className="w-18 h-18 rounded-full object-cover shrink-0 border border-white/30"
              />
            ) : (
              <div className="w-18 h-18 rounded-full bg-[#C25A2B]/10 flex items-center justify-center text-base font-semibold text-[#C25A2B] shrink-0">
                {agentInitials}
              </div>
            )}
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {agent.isAssigned ? "Agent atribuit" : "Contact agent"}
              </span>
              <span className="text-[15px] font-semibold text-foreground group-hover:underline truncate max-w-[200px]">
                {agent.name}
              </span>
            </div>
          </button>

          <button
            ref={infoRef}
            type="button"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/40 bg-white/40 dark:bg-zinc-900/60 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/70 hover:dark:bg-zinc-900/80 transition-colors shrink-0"
            onMouseEnter={() => setShowInfoTooltip(true)}
            onMouseLeave={() => setShowInfoTooltip(false)}
            onClick={() => setShowInfoTooltip((v) => !v)}
            aria-label="Informații despre agentul acestui anunț"
          >
            <MdInfoOutline size={16} />
          </button>
        </div>

        <div className="relative z-2 text-sm text-gray-500 dark:text-gray-400">
          Programare vizionare
        </div>

        <GlassCTAButton
          primary
          onClick={onScheduleClick}
          disabled={!canSchedule}
        >
          Programează o vizionare
        </GlassCTAButton>
        {!canSchedule && (
          <p className="relative z-2 text-[11px] text-amber-700/90 dark:text-amber-400/90 mt-1">
            {agent.isAssigned
              ? "Programarea online necesită un anunț din platformă și un agent cu Google Calendar conectat."
              : "Pentru acest anunț nu este încă atribuit un agent — folosește WhatsApp sau contactul din descriere."}
          </p>
        )}

        <GlassCTAButton onClick={openWhatsApp} disabled={!canWhatsApp}>
          <div className="flex items-center justify-center gap-2">
            <FaWhatsapp className="text-lg text-[#25D366]" />
            <span className="text-sm">Mesaj WhatsApp</span>
          </div>
        </GlassCTAButton>
        {!canWhatsApp && (
          <p className="relative z-2 text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Adaugă număr de telefon la agent sau setează{" "}
            <code className="text-[10px]">NEXT_PUBLIC_WHATSAPP_FALLBACK</code>{" "}
            pentru anunțuri demo.
          </p>
        )}
      </GlassContactCard>

      <TooltipPortal anchorRef={nameRef} show={showNameTooltip} align="left">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-[14px]">{agent.name}</span>
          <span className="flex items-center gap-1">
            <MdStar className="text-yellow-400" size={14} />
            <span className="text-[12px]">{agent.rating.toFixed(1)}</span>
          </span>
        </div>
        {visiblePerfScores && (
          <div className="text-[11px] text-gray-200 mb-1">
            Vânzări: {fmtPerfScore(visiblePerfScores.scorVanzari)} · Închirieri:{" "}
            {fmtPerfScore(visiblePerfScores.scorInchirieri)}
          </div>
        )}
        <div className="flex items-center justify-between text-[11px] text-gray-200">
          <span>
            {agent.isAssigned
              ? "Agent dedicat acestui anunț"
              : `${agent.deals}+ tranzacții în ${locationTag}`}
          </span>
          <span className="flex items-center gap-1">
            <MdAccessTime size={12} />
            {agent.responseTime}
          </span>
        </div>
      </TooltipPortal>

      <TooltipPortal anchorRef={infoRef} show={showInfoTooltip} align="right">
        <p className="leading-relaxed text-[11px]">
          {agent.isAssigned
            ? "Agentul este atribuit explicit acestui anunț în platforma RealImob."
            : "Pentru anunțurile demo afișăm un agent exemplu. Pe anunțurile reale vezi agentul atribuit de echipă."}
        </p>
      </TooltipPortal>

      {isModalOpen && (
        <AgentModal
          agent={agent}
          perfScores={visiblePerfScores}
          agentInitials={agentInitials}
          locationTag={locationTag}
          isAssigned={agent.isAssigned}
          onClose={closeModal}
        />
      )}

      <ViewingBookingModal
        open={viewingOpen}
        onClose={() => setViewingOpen(false)}
        listingId={String(anunt.id)}
        listingTitle={anunt.titlu}
      />
    </>
  );
}

/* ── Bara mobilă ── */
export function AgentMobileBar({ anunt }: { anunt: Anunt }) {
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOpen, setViewingOpen] = useState(false);
  const [perfScores, setPerfScores] = useState<AgentPerformancePair | null>(null);

  const infoRef = useRef<HTMLButtonElement>(null);

  const agent = useMemo(() => resolveDisplayAgent(anunt), [anunt]);
  const canSchedule =
    agent.isAssigned && isMongoListingId(String(anunt.id));
  const waDigits = useMemo(() => resolveWhatsAppPhone(agent), [agent]);
  const canWhatsApp = Boolean(waDigits);

  const agentInitials = agent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const locationTag =
    anunt.tags.find((t) => t.includes("Sector")) ??
    anunt.tags.find((t) => t.toLowerCase().includes("centru")) ??
    "București";

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    if (!agent.isAssigned) return;
    let cancelled = false;
    void (async () => {
      try {
        const params = new URLSearchParams({ agentId: agent.id });
        const res = await fetch(`/api/agents/public-performance-score?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled || !res.ok) return;
        setPerfScores({
          scorVanzari: typeof data?.scorVanzari === "number" ? data.scorVanzari : null,
          scorInchirieri:
            typeof data?.scorInchirieri === "number" ? data.scorInchirieri : null,
        });
      } catch {
        if (!cancelled) setPerfScores(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [agent.id, agent.isAssigned]);
  const visiblePerfScores = agent.isAssigned ? perfScores : null;

  const openWhatsApp = useCallback(() => {
    if (!waDigits) return;
    const text = `Bună, sunt interesat de anunțul: ${anunt.titlu}. Link: ${window.location.href}`;
    window.open(
      `https://wa.me/${waDigits}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [waDigits, anunt.titlu]);

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-background border-t border-gray-200 dark:border-gray-800"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="px-4 pt-2.5 pb-2.5">
          <div className="max-w-[1250px] mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex items-center gap-2 min-w-0 text-left"
                onClick={() => setIsModalOpen(true)}
              >
                {agent.avatar ? (
                  <img
                    src={agent.avatar}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#C25A2B]/10 flex items-center justify-center text-[10px] font-semibold text-[#C25A2B] shrink-0">
                    {agentInitials}
                  </div>
                )}
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {agent.isAssigned ? "Agent atribuit" : "Contact agent"}
                  </span>
                  <span className="text-sm font-semibold text-foreground truncate max-w-[180px]">
                    {agent.name}
                  </span>
                </div>
              </button>

              <button
                ref={infoRef}
                type="button"
                className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-gray-300/60 dark:border-white/10 bg-gray-100/60 dark:bg-zinc-900/60 text-gray-600 dark:text-gray-300 shrink-0"
                onClick={() => setShowInfoTooltip((v) => !v)}
                aria-label="Informații despre agent"
              >
                <MdInfoOutline size={14} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={!canSchedule}
                onClick={() => canSchedule && setViewingOpen(true)}
                className="flex-1 px-4 py-3 rounded-2xl text-white font-medium text-xs transition-all duration-300 disabled:opacity-45 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow:
                    "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                }}
              >
                Vizionare
              </button>
              <button
                type="button"
                disabled={!canWhatsApp}
                onClick={openWhatsApp}
                className="flex-1 px-4 py-3 rounded-2xl font-medium text-xs transition-all duration-300 flex items-center justify-center gap-2 text-foreground disabled:opacity-45 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(50, 50, 65, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow:
                    "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
                  backdropFilter: "blur(30px) saturate(1.5)",
                  WebkitBackdropFilter: "blur(30px) saturate(1.5)",
                }}
              >
                <FaWhatsapp className="text-lg text-[#25D366]" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <TooltipPortal anchorRef={infoRef} show={showInfoTooltip} align="right" placement="top">
        <p className="leading-relaxed text-[11px]">
          {agent.isAssigned
            ? "Agentul este atribuit explicit acestui anunț în platforma RealImob."
            : "Pentru anunțurile demo afișăm un agent exemplu. Pe anunțurile reale vezi agentul atribuit de echipă."}
        </p>
      </TooltipPortal>

      {isModalOpen && (
        <AgentModal
          agent={agent}
          perfScores={visiblePerfScores}
          agentInitials={agentInitials}
          locationTag={locationTag}
          isAssigned={agent.isAssigned}
          onClose={closeModal}
        />
      )}

      <ViewingBookingModal
        open={viewingOpen}
        onClose={() => setViewingOpen(false)}
        listingId={String(anunt.id)}
        listingTitle={anunt.titlu}
      />
    </>
  );
}
