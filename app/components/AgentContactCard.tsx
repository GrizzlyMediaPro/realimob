"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdInfoOutline, MdStar, MdAccessTime, MdThumbUp, MdClose } from "react-icons/md";
import { FaLinkedin, FaWhatsapp } from "react-icons/fa";

import { GlassContactCard, GlassCTAButton } from "./LiquidGlassCards";
import type { Anunt } from "../../lib/anunturiData";

/* ── Tipuri & date agenți ── */
type Agent = {
  id: number;
  name: string;
  role: string;
  deals: number;
  rating: number;
  responseTime: string;
  linkedin?: string;
};

const AGENTS: Agent[] = [
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

export function pickAgentForAnunt(anunt: Anunt): Agent {
  const numericId =
    typeof anunt.id === "string"
      ? parseInt(anunt.id.replace(/\D/g, "") || "0", 10)
      : anunt.id;
  const index = Math.abs(numericId) % AGENTS.length;
  return AGENTS[index];
}

/* ── Tooltip Portal: se randează pe body, nu în card ── */
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
        : rect.top - 8; // va fi compensat cu translateY(-100%)

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

/* ── Modal agent (portal pe body) ── */
function AgentModal({
  agent,
  agentInitials,
  locationTag,
  onClose,
}: {
  agent: Agent;
  agentInitials: string;
  locationTag: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

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
              <div className="w-10 h-10 rounded-full bg-[#C25A2B]/15 flex items-center justify-center text-sm font-semibold text-[#C25A2B]">
                {agentInitials}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {agent.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
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
                {agent.deals}+ finalize
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

          <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Agentul tău este specializat pe zona{" "}
            <span className="font-semibold">{locationTag}</span> și pe
            proprietăți similare cu acest anunț. Sistemul nostru recomandă
            automat agentul cu cea mai bună potrivire între tipul
            proprietății, buget și istoricul de performanță.
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0A66C2] hover:underline"
              onClick={() => {
                if (agent.linkedin) {
                  window.open(agent.linkedin, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <FaLinkedin size={14} />
              Vezi profilul LinkedIn
            </button>

            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <MdInfoOutline size={12} />
              <span>Scor și statistici interne RealImob</span>
            </div>
          </div>
        </div>
      </div>
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

  const nameRef = useRef<HTMLButtonElement>(null);
  const infoRef = useRef<HTMLButtonElement>(null);

  const agent = useMemo(() => pickAgentForAnunt(anunt), [anunt]);

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

  return (
    <>
      <GlassContactCard>
        {/* Header: Agent + info icon */}
        <div className="relative z-2 flex items-center justify-between gap-2 mb-1">
          <button
            ref={nameRef}
            type="button"
            className="flex items-center gap-2 group"
            onMouseEnter={() => setShowNameTooltip(true)}
            onMouseLeave={() => setShowNameTooltip(false)}
            onClick={() => setIsModalOpen(true)}
          >
            <div className="w-8 h-8 rounded-full bg-[#C25A2B]/10 flex items-center justify-center text-xs font-semibold text-[#C25A2B]">
              {agentInitials}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Contact agent
              </span>
              <span className="text-[15px] font-semibold text-foreground group-hover:underline">
                {agent.name}
              </span>
            </div>
          </button>

          <button
            ref={infoRef}
            type="button"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/40 bg-white/40 dark:bg-zinc-900/60 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/70 hover:dark:bg-zinc-900/80 transition-colors"
            onMouseEnter={() => setShowInfoTooltip(true)}
            onMouseLeave={() => setShowInfoTooltip(false)}
            onClick={() => setShowInfoTooltip((v) => !v)}
            aria-label="Cum este ales agentul pentru acest anunț"
          >
            <MdInfoOutline size={16} />
          </button>
        </div>

        {/* Subtitlu */}
        <div className="relative z-2 text-sm text-gray-500 dark:text-gray-400">
          Programare vizionare
        </div>

        <GlassCTAButton primary>Programează-te acum</GlassCTAButton>
        <GlassCTAButton>
          <div className="flex items-center justify-center gap-2">
            <FaWhatsapp className="text-lg text-[#25D366]" />
            <span className="text-sm">Contactează pe WhatsApp</span>
          </div>
        </GlassCTAButton>
      </GlassContactCard>

      {/* Tooltip-uri: randate ca portal pe body, fără restricții de stacking context */}
      <TooltipPortal anchorRef={nameRef} show={showNameTooltip} align="left">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-[14px]">{agent.name}</span>
          <span className="flex items-center gap-1">
            <MdStar className="text-yellow-400" size={14} />
            <span className="text-[12px]">{agent.rating.toFixed(1)}</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-200">
          <span>
            {agent.deals}+ tranzacții în {locationTag}
          </span>
          <span className="flex items-center gap-1">
            <MdAccessTime size={12} />
            {agent.responseTime}
          </span>
        </div>
      </TooltipPortal>

      <TooltipPortal anchorRef={infoRef} show={showInfoTooltip} align="right">
        <p className="leading-relaxed text-[11px]">
          Pentru fiecare anunț selectăm un agent printr-un algoritm intern, pe
          baza zonei, relevanței, performanței agentului și a prețului
          proprietății.
        </p>
      </TooltipPortal>

      {/* Modal agent */}
      {isModalOpen && (
        <AgentModal
          agent={agent}
          agentInitials={agentInitials}
          locationTag={locationTag}
          onClose={closeModal}
        />
      )}
    </>
  );
}

/* ── Bara mobilă cu agent (înlocuiește vechea bară fixă de contact) ── */
export function AgentMobileBar({ anunt }: { anunt: Anunt }) {
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const infoRef = useRef<HTMLButtonElement>(null);

  const agent = useMemo(() => pickAgentForAnunt(anunt), [anunt]);

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

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-background border-t border-gray-200 dark:border-gray-800"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="px-4 pt-2.5 pb-2.5">
          <div className="max-w-[1250px] mx-auto space-y-4">
            {/* Agent row */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex items-center gap-2"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="w-7 h-7 rounded-full bg-[#C25A2B]/10 flex items-center justify-center text-[10px] font-semibold text-[#C25A2B]">
                  {agentInitials}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Contact agent
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {agent.name}
                  </span>
                </div>
              </button>

              <button
                ref={infoRef}
                type="button"
                className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-gray-300/60 dark:border-white/10 bg-gray-100/60 dark:bg-zinc-900/60 text-gray-600 dark:text-gray-300"
                onClick={() => setShowInfoTooltip((v) => !v)}
                aria-label="Cum este ales agentul"
              >
                <MdInfoOutline size={14} />
              </button>
            </div>

            {/* Butoane */}
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-2xl text-white font-medium text-xs transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow:
                    "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                }}
              >
                Programează-te acum
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-2xl font-medium text-xs transition-all duration-300 flex items-center justify-center gap-2 text-foreground"
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

      {/* Info tooltip - portal */}
      <TooltipPortal anchorRef={infoRef} show={showInfoTooltip} align="right" placement="top">
        <p className="leading-relaxed text-[11px]">
          Pentru fiecare anunț selectăm un agent printr-un algoritm intern, pe
          baza zonei, relevanței, performanței agentului și a prețului
          proprietății.
        </p>
      </TooltipPortal>

      {/* Modal agent */}
      {isModalOpen && (
        <AgentModal
          agent={agent}
          agentInitials={agentInitials}
          locationTag={locationTag}
          onClose={closeModal}
        />
      )}
    </>
  );
}
