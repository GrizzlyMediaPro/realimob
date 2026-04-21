import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import {
  MdArrowBack,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdStar,
  MdCalendarToday,
  MdHome,
  MdVisibility,
  MdAssignment,
  MdArticle,
} from "react-icons/md";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { prisma } from "@/lib/prisma";

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

type PageProps = {
  params: Promise<{ id: string }>;
};

function listingStatusLabel(status: string): string {
  switch (status) {
    case "approved":
      return "Aprobat";
    case "pending":
      return "În așteptare";
    case "denied":
      return "Respins";
    case "sold":
      return "Vândut";
    default:
      return status;
  }
}

export default async function AdminAgentProfilePage({ params }: PageProps) {
  const { id } = await params;
  if (!OBJECT_ID_RE.test(id)) {
    notFound();
  }

  const agent = await prisma.agent.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      sectors: true,
      rating: true,
      googleCalendarEmail: true,
      listings: {
        orderBy: { updatedAt: "desc" },
        take: 25,
        select: {
          id: true,
          title: true,
          status: true,
          transactionType: true,
          sector: true,
        },
      },
      _count: {
        select: {
          listings: true,
          viewingRequests: true,
          viewingQuestionnaires: true,
        },
      },
    },
  });

  if (!agent) {
    notFound();
  }

  const googleConnected = Boolean(
    await prisma.agent.findFirst({
      where: { id, googleRefreshToken: { not: null } },
      select: { id: true },
    }),
  );

  let clerkAgentStatus: string | null = null;
  const emailNorm = agent.email?.trim().toLowerCase();
  if (emailNorm) {
    try {
      const client = await clerkClient();
      const list = await client.users.getUserList({
        emailAddress: [emailNorm],
        limit: 1,
      });
      const u = list.data[0];
      if (u) {
        const meta = (u.publicMetadata ?? {}) as { agentStatus?: string };
        clerkAgentStatus = meta.agentStatus ?? null;
      }
    } catch {
      // ignoră erori Clerk (rate limit etc.)
    }
  }

  return (
    <div className="min-h-screen text-foreground">
      <Navbar />
      <main className="pt-20 md:pt-24 px-4 md:px-0 pb-12">
        <div
          className="w-full max-w-[900px] mx-auto"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          <nav
            className="text-sm text-gray-600 dark:text-gray-400 mb-3"
            aria-label="Breadcrumb"
          >
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
            <span className="mx-2">/</span>
            <Link href="/admin/anunturi" className="hover:underline">
              Anunțuri
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">Agent</span>
          </nav>

          <Link
            href="/admin/anunturi"
            className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors mb-6"
          >
            <MdArrowBack size={20} />
            <span>Înapoi la anunțuri</span>
          </Link>

          <div
            className="rounded-2xl md:rounded-3xl overflow-hidden relative p-6 md:p-8 bg-white/60 dark:bg-[rgba(35,35,48,0.5)] border border-white/50 dark:border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-[80px] backdrop-saturate-[1.6]"
          >
            <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
              <div className="shrink-0">
                {agent.avatar ? (
                  <Image
                    src={agent.avatar}
                    alt=""
                    width={112}
                    height={112}
                    className="rounded-2xl object-cover border border-black/10 dark:border-white/15"
                    unoptimized={agent.avatar.startsWith("data:")}
                  />
                ) : (
                  <div
                    className="w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
                    style={{ background: "#C25A2B" }}
                    aria-hidden
                  >
                    {agent.name.trim().charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {agent.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Profil agent (vizualizare administrator)
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{
                      background: "rgba(194, 90, 43, 0.12)",
                      color: "#C25A2B",
                    }}
                  >
                    <MdStar size={16} aria-hidden />
                    Rating {agent.rating.toFixed(1)} / 5
                  </span>
                  {clerkAgentStatus && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/[0.06] dark:bg-white/10 text-foreground break-words">
                      <MdAssignment size={16} aria-hidden />
                      Status cont: {clerkAgentStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 items-start">
                <MdEmail className="text-gray-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Email</dt>
                  <dd className="font-medium break-all">
                    {agent.email ?? "—"}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <MdPhone className="text-gray-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Telefon</dt>
                  <dd className="font-medium">{agent.phone ?? "—"}</dd>
                </div>
              </div>
              <div className="flex gap-3 items-start sm:col-span-2">
                <MdLocationOn className="text-gray-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Sectoare</dt>
                  <dd className="font-medium">
                    {agent.sectors.length > 0 ? agent.sectors.join(", ") : "—"}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <MdCalendarToday className="text-gray-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Înregistrat în platformă
                  </dt>
                  <dd className="font-medium">
                    {new Date(agent.createdAt).toLocaleString("ro-RO", {
                      timeZone: "Europe/Bucharest",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <MdVisibility className="text-gray-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Calendar Google
                  </dt>
                  <dd className="font-medium">
                    {googleConnected
                      ? agent.googleCalendarEmail ?? "Conectat"
                      : "Neconectat"}
                  </dd>
                </div>
              </div>
            </dl>

            {agent.bio?.trim() ? (
              <div className="mt-8 flex gap-3 items-start rounded-xl border border-black/10 dark:border-white/10 p-4">
                <MdArticle className="text-gray-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Descriere publică
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{agent.bio.trim()}</p>
                </div>
              </div>
            ) : null}

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                <MdHome className="mx-auto mb-1 text-[#C25A2B]" size={22} />
                <p className="text-2xl font-bold">{agent._count.listings}</p>
                <p className="text-xs text-gray-500">Anunțuri</p>
              </div>
              <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                <MdCalendarToday className="mx-auto mb-1 text-[#C25A2B]" size={22} />
                <p className="text-2xl font-bold">{agent._count.viewingRequests}</p>
                <p className="text-xs text-gray-500">Cereri vizionare</p>
              </div>
              <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                <MdAssignment className="mx-auto mb-1 text-[#C25A2B]" size={22} />
                <p className="text-2xl font-bold">{agent._count.viewingQuestionnaires}</p>
                <p className="text-xs text-gray-500">Chestionare</p>
              </div>
            </div>

            <section className="mt-10">
              <h2 className="text-lg font-bold mb-3">Anunțuri recente</h2>
              {agent.listings.length === 0 ? (
                <p className="text-sm text-gray-500">Niciun anunț atribuit.</p>
              ) : (
                <ul className="space-y-2">
                  {agent.listings.map((l) => (
                    <li
                      key={l.id}
                      className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/anunturi/preview/${l.id}`}
                          className="text-[#C25A2B] font-medium hover:underline line-clamp-2"
                        >
                          {l.title}
                        </Link>
                        <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mt-0.5 break-all">
                          ID: {l.id}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {listingStatusLabel(l.status)} · {l.transactionType}
                        {l.sector ? ` · ${l.sector}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
