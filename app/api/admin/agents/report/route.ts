import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import type { AgentApplicationMetadata } from "@/lib/agent-application";
import {
  buildAgentPerformanceCsv,
  buildAgentPerformancePdf,
  extractSuprafataUtila,
  isInchiriereTransactionType,
  isVanzareTransactionType,
  safeAverage,
  type AgentPerformanceRow,
} from "@/lib/agentPerformanceReport";

type ClerkAgentUser = {
  id: string;
  nume: string;
  email: string;
  telefon: string;
};

function isClerkAgentUser(user: {
  unsafeMetadata?: unknown;
  publicMetadata?: unknown;
}): boolean {
  const requestedRole = (user.unsafeMetadata as { requestedRole?: string } | undefined)
    ?.requestedRole;
  const publicMetadata = user.publicMetadata as { isAgent?: boolean } | undefined;
  return requestedRole === "agent" || Boolean(publicMetadata?.isAgent);
}

async function fetchAllClerkAgentUsers(): Promise<ClerkAgentUser[]> {
  const client = await clerkClient();
  const out: ClerkAgentUser[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const res = await client.users.getUserList({
      orderBy: "-created_at",
      limit,
      offset,
    });
    if (res.data.length === 0) break;
    for (const user of res.data) {
      if (!isClerkAgentUser(user)) continue;
      const app = (user.publicMetadata as { agentApplication?: AgentApplicationMetadata } | undefined)
        ?.agentApplication ?? {};
      const nume =
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
        user.username ||
        user.emailAddresses[0]?.emailAddress ||
        "Agent";
      out.push({
        id: user.id,
        nume,
        email: user.emailAddresses[0]?.emailAddress ?? "-",
        telefon:
          (app.telefon && app.telefon.trim()) ||
          user.phoneNumbers[0]?.phoneNumber ||
          "-",
      });
    }
    offset += res.data.length;
    if (offset > 5000) break;
  }
  return out;
}

type Agg = {
  vanzari: number;
  inchirieri: number;
  pretVanzari: number[];
  pretInchirieri: number[];
  supVanzari: number[];
  supInchirieri: number[];
  zileToate: number[];
  zileVanzari: number[];
  zileInchirieri: number[];
};

function emptyAgg(): Agg {
  return {
    vanzari: 0,
    inchirieri: 0,
    pretVanzari: [],
    pretInchirieri: [],
    supVanzari: [],
    supInchirieri: [],
    zileToate: [],
    zileVanzari: [],
    zileInchirieri: [],
  };
}

function bumpCount(m: Map<string, number>, id: string, delta = 1) {
  m.set(id, (m.get(id) ?? 0) + delta);
}

function parseRange(searchParams: URLSearchParams): { from: Date; to: Date } | null {
  const fromRaw = searchParams.get("from")?.trim();
  const toRaw = searchParams.get("to")?.trim();
  if (!fromRaw || !toRaw) return null;
  const from = new Date(fromRaw);
  const to = new Date(toRaw);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  if (from.getTime() > to.getTime()) return null;
  return { from, to };
}

function periodLabelRo(from: Date, to: Date): string {
  const a = from.toLocaleDateString("ro-RO");
  const b = to.toLocaleDateString("ro-RO");
  return `${a} — ${b}`;
}

function filenameSafe(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
}

export async function GET(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format")?.toLowerCase() ?? "csv";
  if (format !== "csv" && format !== "pdf") {
    return NextResponse.json({ error: "format trebuie să fie csv sau pdf." }, { status: 400 });
  }

  const range = parseRange(searchParams);
  if (!range) {
    return NextResponse.json(
      { error: "Parametrii from și to (ISO) sunt obligatorii; from ≤ to." },
      { status: 400 },
    );
  }

  const { from, to } = range;

  const [
    clerkAgents,
    prismaAgents,
    soldInPeriod,
    newListingsInPeriod,
    activeGrouped,
    totalGrouped,
    viewingsInPeriod,
    offersInPeriod,
  ] = await Promise.all([
    fetchAllClerkAgentUsers(),
    prisma.agent.findMany({ select: { id: true, email: true } }),
    prisma.listing.findMany({
      where: {
        status: "sold",
        agentId: { not: null },
        saleVerifiedAt: { gte: from, lte: to },
      },
      select: {
        agentId: true,
        transactionType: true,
        price: true,
        createdAt: true,
        saleVerifiedAt: true,
        details: true,
      },
    }),
    prisma.listing.findMany({
      where: {
        agentId: { not: null },
        createdAt: { gte: from, lte: to },
      },
      select: { agentId: true },
    }),
    prisma.listing.groupBy({
      by: ["agentId"],
      where: { status: "approved", agentId: { not: null } },
      _count: { _all: true },
    }),
    prisma.listing.groupBy({
      by: ["agentId"],
      where: { agentId: { not: null } },
      _count: { _all: true },
    }),
    prisma.viewingBookingRequest.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { agentId: true },
    }),
    prisma.listingOffer.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        proposedBy: "client",
        listing: { agentId: { not: null } },
      },
      select: { listing: { select: { agentId: true } } },
    }),
  ]);

  const emailToPrismaId = new Map<string, string>();
  for (const a of prismaAgents) {
    if (a.email) emailToPrismaId.set(a.email.trim().toLowerCase(), a.id);
  }

  const aggByPrismaId = new Map<string, Agg>();
  function aggFor(agentId: string): Agg {
    let g = aggByPrismaId.get(agentId);
    if (!g) {
      g = emptyAgg();
      aggByPrismaId.set(agentId, g);
    }
    return g;
  }

  for (const l of soldInPeriod) {
    const aid = l.agentId;
    if (!aid || !l.saleVerifiedAt) continue;
    const g = aggFor(aid);
    const days =
      (l.saleVerifiedAt.getTime() - l.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (Number.isFinite(days) && days >= 0 && days < 3650) {
      g.zileToate.push(days);
    }

    const tt = String(l.transactionType ?? "");
    if (isVanzareTransactionType(tt)) {
      g.vanzari += 1;
      g.pretVanzari.push(l.price);
      const sup = extractSuprafataUtila(l.details);
      if (sup != null) g.supVanzari.push(sup);
      if (Number.isFinite(days) && days >= 0 && days < 3650) g.zileVanzari.push(days);
    } else if (isInchiriereTransactionType(tt)) {
      g.inchirieri += 1;
      g.pretInchirieri.push(l.price);
      const sup = extractSuprafataUtila(l.details);
      if (sup != null) g.supInchirieri.push(sup);
      if (Number.isFinite(days) && days >= 0 && days < 3650) g.zileInchirieri.push(days);
    }
  }

  const anunturiNoiMap = new Map<string, number>();
  for (const l of newListingsInPeriod) {
    if (l.agentId) bumpCount(anunturiNoiMap, l.agentId);
  }

  const activeMap = new Map<string, number>();
  for (const row of activeGrouped) {
    if (row.agentId) activeMap.set(row.agentId, row._count._all);
  }

  const totalMap = new Map<string, number>();
  for (const row of totalGrouped) {
    if (row.agentId) totalMap.set(row.agentId, row._count._all);
  }

  const vizMap = new Map<string, number>();
  for (const v of viewingsInPeriod) {
    bumpCount(vizMap, v.agentId);
  }

  const oferteMap = new Map<string, number>();
  for (const o of offersInPeriod) {
    const aid = o.listing.agentId;
    if (aid) bumpCount(oferteMap, aid);
  }

  const label = periodLabelRo(from, to);

  const rows: AgentPerformanceRow[] = clerkAgents.map((u) => {
    const pid = emailToPrismaId.get(u.email.trim().toLowerCase()) ?? null;
    const g = pid ? (aggByPrismaId.get(pid) ?? emptyAgg()) : emptyAgg();
    return {
      nume: u.nume,
      email: u.email,
      telefon: u.telefon,
      vanzariInPerioada: pid ? g.vanzari : 0,
      inchirieriInPerioada: pid ? g.inchirieri : 0,
      anunturiNoiInPerioada: pid ? (anunturiNoiMap.get(pid) ?? 0) : 0,
      anunturiActiveAcum: pid ? (activeMap.get(pid) ?? 0) : 0,
      anunturiTotalAtribuite: pid ? (totalMap.get(pid) ?? 0) : 0,
      vizionariInPerioada: pid ? (vizMap.get(pid) ?? 0) : 0,
      ofertePrimiteInPerioada: pid ? (oferteMap.get(pid) ?? 0) : 0,
      pretMediuVanzari: pid ? safeAverage(g.pretVanzari) : null,
      pretMediuInchirieri: pid ? safeAverage(g.pretInchirieri) : null,
      suprafataMedieVanzariMp: pid ? safeAverage(g.supVanzari) : null,
      suprafataMedieInchirieriMp: pid ? safeAverage(g.supInchirieri) : null,
      medieZileCrearePanaLaTranzactie: pid ? safeAverage(g.zileToate) : null,
      medieZileVanzari: pid ? safeAverage(g.zileVanzari) : null,
      medieZileInchirieri: pid ? safeAverage(g.zileInchirieri) : null,
    };
  });

  rows.sort((a, b) => a.nume.localeCompare(b.nume, "ro"));

  const stamp = `${from.toISOString().slice(0, 10)}_${to.toISOString().slice(0, 10)}`;
  const baseName = filenameSafe(`raport-agenti_${stamp}`);

  if (format === "csv") {
    const csv = buildAgentPerformanceCsv(rows, label);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${baseName}.csv"`,
      },
    });
  }

  const pdfBytes = buildAgentPerformancePdf(rows, label);
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
    },
  });
}
