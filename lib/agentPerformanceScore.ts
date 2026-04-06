import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreatePlatformSettings } from "@/lib/platformSettings";
import {
  correctLatLngIfSwappedForRomania,
  parseListingCoord,
} from "@/lib/listingToAnunt";
import {
  extractSuprafataUtila,
  isInchiriereTransactionType,
  isVanzareTransactionType,
  safeAverage,
} from "@/lib/agentPerformanceReport";

const SCOR_WINDOW_ZILE = 90;
const WINDOW_MS = SCOR_WINDOW_ZILE * 24 * 60 * 60 * 1000;
const TARGET_VANZARE_ZILE = 30;
const TARGET_INCHIRIERE_ZILE = 7;
const PENALIZARE_PER_ANUNT = 50;

/** București — Piața Universității (fallback) */
const DEFAULT_CITY_CENTER_LAT = 44.4358;
const DEFAULT_CITY_CENTER_LNG = 26.1025;

export type AgentListingScoreBreakdown = {
  listingId: string;
  title: string;
  transactionType: string;
  total: number;
  viteza: number;
  pret: number;
  vizionari: number;
  stareMobilare: number;
  locatie: number;
  suprafata: number;
};

export type AgentPerformanceScoreResult = {
  periodZile: typeof SCOR_WINDOW_ZILE;
  deLa: string;
  panaLa: string;
  /** Medie după penalizări; null dacă nu există anunțuri finalizate pe segment */
  scorVanzari: number | null;
  scorInchirieri: number | null;
  medieBrutaVanzari: number | null;
  medieBrutaInchirieri: number | null;
  /** Număr anunțuri închise fără tranzacție (status „denied”, actualizate în fereastră) — proxy pentru expirare/respingere administrativă */
  penalizariVanzari: number;
  penalizariInchirieri: number;
  puncteScazuteVanzari: number;
  puncteScazuteInchirieri: number;
  anunturiFinalizateVanzari: number;
  anunturiFinalizateInchirieri: number;
  detaliiVanzari: AgentListingScoreBreakdown[];
  detaliiInchirieri: AgentListingScoreBreakdown[];
};

function segmentKey(
  transactionType: string,
  propertyType: string,
  commercialSubtype: string | null | undefined,
): string {
  const tt = String(transactionType ?? "");
  const seg = isVanzareTransactionType(tt)
    ? "V"
    : isInchiriereTransactionType(tt)
      ? "I"
      : "X";
  return `${seg}|${propertyType}|${commercialSubtype ?? ""}`;
}

function parseEnvFloat(name: string): number | undefined {
  const v = process.env[name]?.trim();
  if (!v) return undefined;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

async function resolveCityCenter(): Promise<{ lat: number; lng: number }> {
  const s = await getOrCreatePlatformSettings();
  const lat =
    s.cityCenterLatitude ??
    parseEnvFloat("CITY_CENTER_LATITUDE") ??
    parseEnvFloat("CITY_CENTER_LAT") ??
    DEFAULT_CITY_CENTER_LAT;
  const lng =
    s.cityCenterLongitude ??
    parseEnvFloat("CITY_CENTER_LONGITUDE") ??
    parseEnvFloat("CITY_CENTER_LNG") ??
    DEFAULT_CITY_CENTER_LNG;
  return { lat, lng };
}

/** Distanță în km între două puncte WGS84 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function listingLatLng(listing: {
  latitude: number | null;
  longitude: number | null;
  details: unknown;
}): { lat: number; lng: number } | null {
  const details =
    listing.details && typeof listing.details === "object"
      ? (listing.details as Record<string, unknown>)
      : {};
  const latRaw =
    parseListingCoord(listing.latitude) ??
    parseListingCoord(details.lat) ??
    parseListingCoord(details.latitude) ??
    parseListingCoord(details.mapLat);
  const lngRaw =
    parseListingCoord(listing.longitude) ??
    parseListingCoord(details.lng) ??
    parseListingCoord(details.longitude) ??
    parseListingCoord(details.mapLng);
  if (latRaw == null || lngRaw == null) return null;
  const { lat, lng } = correctLatLngIfSwappedForRomania(latRaw, lngRaw);
  return { lat, lng };
}

function scoreLocatieDificultateKm(distanceKm: number | null): number {
  if (distanceKm == null) return 35;
  if (distanceKm < 5) return 20;
  if (distanceKm <= 15) return 45;
  return 70;
}

function scoreMobilareDificultate(details: unknown): number {
  if (!details || typeof details !== "object") return 20;
  const d = details as Record<string, unknown>;
  const raw = String(d.mobilare ?? d.stare ?? "").toLowerCase();
  if (raw.includes("nemobilat") && !raw.includes("par")) return 40;
  if (raw.includes("parțial") || raw.includes("partial") || raw.includes("semimobilat"))
    return 20;
  if (
    raw.includes("complet") ||
    raw.includes("lux") ||
    raw.includes("mobilat")
  )
    return 10;
  return 20;
}

function scoreViteza(zile: number, targetZile: number): number {
  const z = Math.max(1, zile);
  return Math.min(150, 150 * (targetZile / z));
}

function scorePret(listingPrice: number, maxPretSegment: number): number {
  if (!Number.isFinite(listingPrice) || listingPrice <= 0) return 0;
  if (!Number.isFinite(maxPretSegment) || maxPretSegment <= 0) return 40;
  return Math.min(80, (80 * listingPrice) / maxPretSegment);
}

function scoreVizionari(numApproved: number): number {
  return Math.min(100, numApproved * 10);
}

function scoreSuprafata(sup: number | null, medieSegment: number | null): number {
  if (sup == null || sup <= 0) return 30;
  if (medieSegment == null || medieSegment <= 0) return 30;
  return Math.min(60, (60 * sup) / medieSegment);
}

type SegmentAgg = { maxPret: number; suprafete: number[] };

function bumpSegmentAgg(
  map: Map<string, SegmentAgg>,
  key: string,
  price: number,
  sup: number | null,
) {
  let a = map.get(key);
  if (!a) {
    a = { maxPret: 0, suprafete: [] };
    map.set(key, a);
  }
  if (Number.isFinite(price) && price > a.maxPret) a.maxPret = price;
  if (sup != null && sup > 0) a.suprafete.push(sup);
}

function medieSup(a: SegmentAgg): number | null {
  return safeAverage(a.suprafete);
}

/**
 * Scor performanță agent: medie pe anunțuri vândute/închiriate (verificate) în ultimele 90 zile,
 * separat vânzări / închirieri, cu penalizări pentru anunțuri închise fără tranzacție (status denied).
 */
export async function calculateAgentPerformance(
  agentId: string,
): Promise<AgentPerformanceScoreResult> {
  const now = new Date();
  const from = new Date(now.getTime() - WINDOW_MS);

  const [cityCenter, allSoldWindow, agentSold, deniedWindow] = await Promise.all([
    resolveCityCenter(),
    prisma.listing.findMany({
      where: {
        status: "sold",
        saleVerifiedAt: { gte: from, lte: now },
      },
      select: {
        transactionType: true,
        propertyType: true,
        commercialSubtype: true,
        price: true,
        details: true,
      },
    }),
    prisma.listing.findMany({
      where: {
        agentId,
        status: "sold",
        saleVerifiedAt: { gte: from, lte: now },
      },
      select: {
        id: true,
        title: true,
        transactionType: true,
        propertyType: true,
        commercialSubtype: true,
        price: true,
        createdAt: true,
        saleVerifiedAt: true,
        details: true,
        latitude: true,
        longitude: true,
      },
    }),
    prisma.listing.findMany({
      where: {
        agentId,
        status: "denied",
        updatedAt: { gte: from, lte: now },
      },
      select: { transactionType: true },
    }),
  ]);

  const soldIds = agentSold.map((l) => l.id);
  const viewingByListing = new Map<string, number>();
  if (soldIds.length > 0) {
    const viewingGroups = await prisma.viewingBookingRequest.groupBy({
      by: ["listingId"],
      where: {
        status: "approved",
        listingId: { in: soldIds },
      },
      _count: { _all: true },
    });
    for (const row of viewingGroups) {
      viewingByListing.set(row.listingId, row._count._all);
    }
  }

  const segmentStats = new Map<string, SegmentAgg>();
  for (const l of allSoldWindow) {
    const key = segmentKey(
      l.transactionType,
      l.propertyType,
      l.commercialSubtype,
    );
    if (key.startsWith("X|")) continue;
    bumpSegmentAgg(
      segmentStats,
      key,
      l.price,
      extractSuprafataUtila(l.details),
    );
  }

  let penalizariVanzari = 0;
  let penalizariInchirieri = 0;
  for (const d of deniedWindow) {
    const tt = String(d.transactionType ?? "");
    if (isVanzareTransactionType(tt)) penalizariVanzari += 1;
    else if (isInchiriereTransactionType(tt)) penalizariInchirieri += 1;
  }

  const detaliiVanzari: AgentListingScoreBreakdown[] = [];
  const detaliiInchirieri: AgentListingScoreBreakdown[] = [];

  for (const l of agentSold) {
    const tt = String(l.transactionType ?? "");
    const isV = isVanzareTransactionType(tt);
    const isI = isInchiriereTransactionType(tt);
    if (!isV && !isI) continue;

    if (!l.saleVerifiedAt) continue;

    const key = segmentKey(l.transactionType, l.propertyType, l.commercialSubtype);
    const agg = segmentStats.get(key);
    const maxPret = agg?.maxPret ?? l.price;
    const medieSupSeg = agg ? medieSup(agg) : null;

    const zile =
      (l.saleVerifiedAt.getTime() - l.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const zileClamped = Number.isFinite(zile) && zile >= 0 ? Math.max(1 / 24, zile) : 1;

    const target = isV ? TARGET_VANZARE_ZILE : TARGET_INCHIRIERE_ZILE;
    const viteza = scoreViteza(zileClamped, target);
    const pret = scorePret(l.price, maxPret);
    const nViz = viewingByListing.get(l.id) ?? 0;
    const vizionari = scoreVizionari(nViz);
    const stareMobilare = scoreMobilareDificultate(l.details);
    const ll = listingLatLng(l);
    const distKm =
      ll != null
        ? haversineDistanceKm(ll.lat, ll.lng, cityCenter.lat, cityCenter.lng)
        : null;
    const locatie = scoreLocatieDificultateKm(distKm);
    const sup = extractSuprafataUtila(l.details);
    const suprafata = scoreSuprafata(sup, medieSupSeg);

    const total =
      viteza + pret + vizionari + stareMobilare + locatie + suprafata;

    const row: AgentListingScoreBreakdown = {
      listingId: l.id,
      title: l.title,
      transactionType: l.transactionType,
      total,
      viteza,
      pret,
      vizionari,
      stareMobilare,
      locatie,
      suprafata,
    };

    if (isV) detaliiVanzari.push(row);
    else detaliiInchirieri.push(row);
  }

  const medieBrutaVanzari =
    detaliiVanzari.length > 0
      ? detaliiVanzari.reduce((s, x) => s + x.total, 0) / detaliiVanzari.length
      : null;
  const medieBrutaInchirieri =
    detaliiInchirieri.length > 0
      ? detaliiInchirieri.reduce((s, x) => s + x.total, 0) /
        detaliiInchirieri.length
      : null;

  const puncteScazuteVanzari = penalizariVanzari * PENALIZARE_PER_ANUNT;
  const puncteScazuteInchirieri = penalizariInchirieri * PENALIZARE_PER_ANUNT;

  const scorVanzari =
    medieBrutaVanzari != null
      ? medieBrutaVanzari - puncteScazuteVanzari
      : null;
  const scorInchirieri =
    medieBrutaInchirieri != null
      ? medieBrutaInchirieri - puncteScazuteInchirieri
      : null;

  return {
    periodZile: SCOR_WINDOW_ZILE,
    deLa: from.toISOString(),
    panaLa: now.toISOString(),
    scorVanzari,
    scorInchirieri,
    medieBrutaVanzari,
    medieBrutaInchirieri,
    penalizariVanzari,
    penalizariInchirieri,
    puncteScazuteVanzari,
    puncteScazuteInchirieri,
    anunturiFinalizateVanzari: detaliiVanzari.length,
    anunturiFinalizateInchirieri: detaliiInchirieri.length,
    detaliiVanzari,
    detaliiInchirieri,
  };
}

/** Cache ~15 min — scorurile se schimbă rar; invalidare implicită la revalidare periodică */
export function getCachedAgentPerformanceScore(
  agentId: string,
): Promise<AgentPerformanceScoreResult> {
  const runner = unstable_cache(
    () => calculateAgentPerformance(agentId),
    ["agent-performance-score", "v1", agentId],
    {
      revalidate: 900,
      tags: [`agent-performance-score-${agentId}`],
    },
  );
  return runner();
}

/** După vânzare verificată sau închidere anunț — invalidează cache-ul scorului pentru agent */
export function revalidateAgentPerformanceScoreCache(
  agentId: string | null | undefined,
) {
  if (!agentId) return;
  revalidateTag(`agent-performance-score-${agentId}`, "max");
}
