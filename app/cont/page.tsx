"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  MdPerson,
  MdHome,
  MdSchedule,
  MdArrowForward,
  MdRefresh,
  MdWork,
  MdCheckCircle,
  MdHourglassEmpty,
  MdCancel,
} from "react-icons/md";

type AccountListing = {
  id: string;
  title: string;
  status: string;
  transactionType: string;
  price: number;
  currency: string;
  createdAt: string;
  location: string;
  images: unknown;
};

type AccountViewing = {
  id: string;
  status: string;
  startAt: string;
  endAt: string;
  clientName: string;
  listing: { id: string; title: string };
  agent: { name: string };
};

type AccountPayload = {
  user: {
    name: string | null;
    email: string | null;
    imageUrl: string | null;
  };
  role: {
    isAdmin: boolean;
    isAgent: boolean;
    agentStatus: string;
    requestedRole: string;
  };
  listings: AccountListing[];
  viewingRequests: AccountViewing[];
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

function listingStatusLabel(status: string) {
  switch (status) {
    case "approved":
      return { label: "Publicat", color: "#10B981" };
    case "pending":
      return { label: "În moderare", color: "#F59E0B" };
    case "denied":
      return { label: "Respins", color: "#EF4444" };
    default:
      return { label: status, color: "#6B7280" };
  }
}

function viewingStatusLabel(status: string) {
  switch (status) {
    case "approved":
      return { label: "Confirmată", Icon: MdCheckCircle, color: "#10B981" };
    case "pending":
      return { label: "În așteptare", Icon: MdHourglassEmpty, color: "#F59E0B" };
    case "rejected":
      return { label: "Respinsă", Icon: MdCancel, color: "#EF4444" };
    default:
      return { label: status, Icon: MdSchedule, color: "#6B7280" };
  }
}

function firstListingImage(images: unknown): string {
  if (!Array.isArray(images) || images.length === 0) return "/ap2.jpg";
  const first = images[0];
  if (first && typeof first === "object" && first !== null && "url" in first) {
    const u = (first as { url?: string }).url;
    if (typeof u === "string" && u) return u;
  }
  return "/ap2.jpg";
}

export default function ContPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const isDark = useDarkMode();
  const [data, setData] = useState<AccountPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentRequestLoading, setAgentRequestLoading] = useState(false);
  const [agentRequestMessage, setAgentRequestMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace(
        `/sign-in?redirect_url=${encodeURIComponent("/cont")}`,
      );
    }
  }, [isLoaded, isSignedIn, router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const r = await fetch("/api/account", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) {
        throw new Error(j?.error || "Nu am putut încărca contul.");
      }
      setData(j as AccountPayload);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) load();
  }, [isSignedIn, load]);

  const requestAgent = async () => {
    try {
      setAgentRequestLoading(true);
      setAgentRequestMessage(null);
      const r = await fetch("/api/account/request-agent", { method: "POST" });
      const j = await r.json();
      if (!r.ok) {
        if (j?.code === "already_approved") {
          setAgentRequestMessage(j.error);
        } else {
          throw new Error(j?.error || "Eroare");
        }
        return;
      }
      setAgentRequestMessage(
        j.alreadyRequested
          ? "Poți continua în zona Agent."
          : "Am activat pașii pentru agent. Deschide pagina Agent pentru a trimite documentele.",
      );
      await load();
      await user?.reload();
    } catch (e) {
      setAgentRequestMessage(
        e instanceof Error ? e.message : "Nu am putut procesa cererea.",
      );
    } finally {
      setAgentRequestLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen text-foreground">
        <Navbar />
        <main
          className="pt-28 px-4 text-center text-sm text-gray-500"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          Se încarcă…
        </main>
        <Footer />
      </div>
    );
  }

  const agentApproved = data?.role.agentStatus === "approved";
  const agentPending = data?.role.agentStatus === "pending";
  const agentRejected = data?.role.agentStatus === "rejected";
  const hasAgentIntent =
    Boolean(data?.role.isAgent) || data?.role.requestedRole === "agent";

  const showAgentSection =
    data != null && !data.role.isAdmin && !agentApproved;

  const showApplyAgentButton =
    data != null &&
    !data.role.isAdmin &&
    !agentApproved &&
    !agentPending &&
    !hasAgentIntent;

  const agentLinkVisible =
    data != null &&
    (hasAgentIntent || agentApproved || agentPending || agentRejected);

  return (
    <div className="min-h-screen text-foreground">
      <Navbar />
      <main
        className="pt-20 md:pt-24 px-4 pb-16"
        style={{ fontFamily: "var(--font-galak-regular)" }}
      >
        <div className="w-full max-w-[900px] mx-auto">
          <nav
            className="text-sm text-gray-600 dark:text-gray-400 mb-4 mt-4"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:underline">
              Acasă
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">Contul meu</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Contul meu</h1>
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm text-[#C25A2B] hover:underline disabled:opacity-50"
            >
              <MdRefresh size={18} />
              Reîmprospătează
            </button>
          </div>

          {loadError && (
            <div
              className="rounded-xl px-4 py-3 mb-6 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900"
              role="alert"
            >
              {loadError}
            </div>
          )}

          {loading && !data ? (
            <p className="text-sm text-gray-500">Se încarcă datele…</p>
          ) : data ? (
            <div className="space-y-6">
              {/* Profil */}
              <section
                className="rounded-2xl p-5 md:p-6 relative overflow-hidden"
                style={glassCard(isDark)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                    {data.user.imageUrl ? (
                      <Image
                        src={data.user.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MdPerson size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <MdPerson className="text-[#C25A2B]" size={20} />
                      {data.user.name || "Utilizator"}
                    </h2>
                    {data.user.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {data.user.email}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {data.role.isAdmin && (
                        <Link
                          href="/admin"
                          className="text-xs font-medium px-3 py-1 rounded-full bg-[#C25A2B]/15 text-[#C25A2B]"
                        >
                          Panou admin
                        </Link>
                      )}
                      {agentLinkVisible && (
                        <Link
                          href="/agent"
                          className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        >
                          Zonă agent
                          <MdArrowForward size={14} />
                        </Link>
                      )}
                      <Link
                        href="/adauga-anunt"
                        className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-gray-500/10 text-foreground"
                      >
                        <MdHome size={14} />
                        Adaugă anunț
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              {/* Devino agent */}
              {showAgentSection && (
                <section
                  className="rounded-2xl p-5 md:p-6 relative overflow-hidden"
                  style={glassCard(isDark)}
                >
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <MdWork className="text-[#C25A2B]" size={20} />
                    {agentPending
                      ? "Cerere agent în analiză"
                      : agentRejected
                        ? "Cerere agent"
                        : "Vrei să devii agent?"}
                  </h2>
                  {agentPending ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Cererea ta este în curs de verificare. Poți urmări statusul și
                      mesajele în zona Agent.
                    </p>
                  ) : agentRejected ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Verifică feedback-ul în zona Agent sau contactează echipa dacă
                      ai nevoie de clarificări.
                    </p>
                  ) : hasAgentIntent && !agentRejected ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Continuă completarea documentelor și pașii din pagina Agent.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Activezi fluxul de înregistrare: completezi datele și
                      documentele în pagina dedicată, iar echipa te validează.
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    {showApplyAgentButton && (
                      <button
                        type="button"
                        onClick={requestAgent}
                        disabled={agentRequestLoading}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white bg-[#C25A2B] hover:opacity-90 disabled:opacity-50 transition-opacity"
                      >
                        {agentRequestLoading
                          ? "Se procesează…"
                          : "Aplică drept agent"}
                        <MdArrowForward size={18} />
                      </button>
                    )}
                    {agentLinkVisible && (
                      <Link
                        href="/agent"
                        className="inline-flex items-center gap-1 text-sm text-[#C25A2B] hover:underline"
                      >
                        Deschide pagina Agent
                        <MdArrowForward size={16} />
                      </Link>
                    )}
                  </div>
                  {agentRequestMessage && (
                    <p className="text-sm mt-3 text-gray-700 dark:text-gray-300">
                      {agentRequestMessage}
                    </p>
                  )}
                </section>
              )}

              {/* Anunțuri */}
              <section
                className="rounded-2xl p-5 md:p-6 relative overflow-hidden"
                style={glassCard(isDark)}
              >
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <MdHome className="text-[#C25A2B]" size={20} />
                  Anunțurile mele
                </h2>
                {data.listings.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Nu ai încă anunțuri publicate din acest cont.{" "}
                    <Link href="/adauga-anunt" className="text-[#C25A2B] hover:underline">
                      Adaugă un anunț
                    </Link>
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {data.listings.map((l) => {
                      const st = listingStatusLabel(l.status);
                      const img = firstListingImage(l.images);
                      return (
                        <li
                          key={l.id}
                          className="flex gap-3 p-3 rounded-xl border border-black/5 dark:border-white/10 bg-white/30 dark:bg-white/5"
                        >
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-800">
                            <Image
                              src={img}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-2">
                              {l.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {l.transactionType} ·{" "}
                              {Number(l.price).toLocaleString("ro-RO")}{" "}
                              {l.currency}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span
                                className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                                style={{
                                  color: st.color,
                                  background: `${st.color}18`,
                                }}
                              >
                                {st.label}
                              </span>
                              {l.status === "approved" && (
                                <Link
                                  href={`/anunturi/${l.id}`}
                                  className="text-xs text-[#C25A2B] hover:underline"
                                >
                                  Vezi anunțul
                                </Link>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Programări vizionări */}
              <section
                className="rounded-2xl p-5 md:p-6 relative overflow-hidden"
                style={glassCard(isDark)}
              >
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <MdSchedule className="text-[#C25A2B]" size={20} />
                  Programări pentru vizionări
                </h2>
                {!data.user.email ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Adaugă un email la cont pentru a vedea cererile făcute cu
                    adresa ta.
                  </p>
                ) : data.viewingRequests.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nu ai cereri de vizionare asociate acestui email.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {data.viewingRequests.map((v) => {
                      const vs = viewingStatusLabel(v.status);
                      const Icon = vs.Icon;
                      const start = new Date(v.startAt);
                      const when = start.toLocaleString("ro-RO", {
                        timeZone: "Europe/Bucharest",
                        dateStyle: "medium",
                        timeStyle: "short",
                      });
                      return (
                        <li
                          key={v.id}
                          className="p-3 rounded-xl border border-black/5 dark:border-white/10 bg-white/30 dark:bg-white/5 text-sm"
                        >
                          <div className="flex items-start gap-2">
                            <Icon
                              className="shrink-0 mt-0.5"
                              size={18}
                              style={{ color: vs.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{v.listing.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {when} · Agent: {v.agent.name}
                              </p>
                              <span
                                className="inline-block text-[10px] font-semibold uppercase mt-2 px-2 py-0.5 rounded-full"
                                style={{
                                  color: vs.color,
                                  background: `${vs.color}18`,
                                }}
                              >
                                {vs.label}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
