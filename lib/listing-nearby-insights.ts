import { unstable_cache } from "next/cache";
import { correctLatLngIfSwappedForRomania } from "./listingToAnunt";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
] as const;

/** Scoruri euristice (0–100) derivate din densitatea POI OSM; nu sunt Walk Score® oficiale. */
export type ListingNearbyInsights = {
  walkScore: { value: number; description: string };
  transitScore: { value: number; description: string };
  bikeScore: { value: number; description: string };
  nearestMetro: { name: string; distanceKm: number } | null;
  /** Număr stații (autobuz / tramvai / platformă) în ~800 m */
  transitStopsNearby: number;
  schools: {
    primary: { name: string; distanceKm: number } | null;
    gymnasium: { name: string; distanceKm: number } | null;
    highSchool: { name: string; distanceKm: number } | null;
  };
  attribution: string;
};

type OsmElement = {
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function elCoord(el: OsmElement): { lat: number; lon: number } | null {
  if (el.lat != null && el.lon != null)
    return { lat: el.lat, lon: el.lon };
  if (el.center?.lat != null && el.center?.lon != null)
    return { lat: el.center.lat, lon: el.center.lon };
  return null;
}

function isMetroStation(tags: Record<string, string> | undefined): boolean {
  if (!tags) return false;
  if (tags.station === "subway" || tags.subway === "yes") return true;
  const net = (tags.network || "").toLowerCase();
  const op = (tags.operator || "").toLowerCase();
  if (net.includes("metro") || op.includes("metrorex")) return true;
  if (tags.railway === "station" && tags.light_rail === "yes") return true;
  return false;
}

function schoolBucket(
  tags: Record<string, string> | undefined,
): "primary" | "gymnasium" | "high" | null {
  if (!tags) return null;
  if (tags.amenity === "kindergarten") return "primary";
  const school = tags.school;
  if (school === "primary" || school === "kinder_garten") return "primary";
  if (school === "middle") return "gymnasium";
  if (school === "secondary" || school === "high_school") return "high";
  if (tags.amenity === "college") return "high";
  const isced = tags["isced:level"];
  if (isced === "0" || isced === "1" || isced === "2") return "primary";
  if (isced === "3") return "gymnasium";
  if (isced === "4") return "high";
  if (tags.amenity === "school") {
    const n = `${tags.name || ""} ${tags["name:ro"] || ""}`.toLowerCase();
    if (/(liceu|colegiu|technologic|tehnologic)/i.test(n)) return "high";
    if (/(gimnaz|generală 5|generala 5|clasa a v)/i.test(n)) return "gymnasium";
    if (/(primar|învățământ primar|invatamant primar)/i.test(n)) return "primary";
  }
  return null;
}

function roundScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

async function fetchOverpass(lat: number, lng: number): Promise<OsmElement[]> {
  const q = `
[out:json][timeout:55];
(
  node["station"="subway"](around:3500,${lat},${lng});
  node["subway"="yes"]["railway"="station"](around:3500,${lat},${lng});
  node["railway"="station"]["operator"="Metrorex"](around:3500,${lat},${lng});
  node["railway"="station"]["network"="Metrorex"](around:3500,${lat},${lng});
  node["highway"="bus_stop"](around:900,${lat},${lng});
  node["railway"="tram_stop"](around:900,${lat},${lng});
  node["railway"="halt"]["tram"="yes"](around:900,${lat},${lng});
  node["public_transport"="platform"](around:750,${lat},${lng});
  node["public_transport"="stop_position"](around:750,${lat},${lng});
  node["amenity"="school"](around:3200,${lat},${lng});
  way["amenity"="school"](around:3200,${lat},${lng});
  node["amenity"="kindergarten"](around:3200,${lat},${lng});
  way["amenity"="kindergarten"](around:3200,${lat},${lng});
  node["amenity"="college"](around:3200,${lat},${lng});
  way["amenity"="college"](around:3200,${lat},${lng});
  node["shop"="supermarket"](around:550,${lat},${lng});
  node["shop"="convenience"](around:550,${lat},${lng});
  node["amenity"="cafe"](around:550,${lat},${lng});
  node["amenity"="restaurant"](around:550,${lat},${lng});
  way["highway"="cycleway"](around:700,${lat},${lng});
);
out center tags;
`.trim();

  const body = `data=${encodeURIComponent(q)}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "User-Agent": "Realimob/1.0 (listing nearby POI; +https://github.com/)",
  } as const;

  let lastError: Error | null = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { ...headers },
          body,
          signal: AbortSignal.timeout(60_000),
        });
        if (!res.ok) {
          lastError = new Error(`Overpass HTTP ${res.status}`);
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }
        const json = (await res.json()) as { elements?: OsmElement[] };
        return json.elements ?? [];
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }
  throw lastError ?? new Error("Overpass indisponibil");
}

function dedupeKey(lat: number, lon: number, kind: string): string {
  return `${kind}:${lat.toFixed(5)},${lon.toFixed(5)}`;
}

function emptyInsights(): ListingNearbyInsights {
  return {
    walkScore: {
      value: 22,
      description:
        "Puține puncte mapate în OpenStreetMap în jurul adresei; poate fi zonă mai puțin cartografiată.",
    },
    transitScore: {
      value: 18,
      description:
        "Nu s-au găsit stații evidente în raza interogării; verifică pe hartă.",
    },
    bikeScore: {
      value: 25,
      description: "Date cicliste limitate în OpenStreetMap pentru această zonă.",
    },
    nearestMetro: null,
    transitStopsNearby: 0,
    schools: { primary: null, gymnasium: null, highSchool: null },
    attribution: "© Contribuitori OpenStreetMap (date aproximative)",
  };
}

async function computeInsights(
  lat: number,
  lng: number,
): Promise<ListingNearbyInsights | null> {
  let elements: OsmElement[];
  try {
    elements = await fetchOverpass(lat, lng);
  } catch {
    return null;
  }
  if (elements.length === 0) return emptyInsights();

  const seenTransit = new Set<string>();
  let metroBest: { name: string; d: number } | null = null;
  let minStopM = Infinity;

  const walkPois = new Set<string>();
  let cyclewayCount = 0;

  const schoolCandidates: {
    bucket: "primary" | "gymnasium" | "high";
    name: string;
    d: number;
  }[] = [];

  for (const el of elements) {
    const c = elCoord(el);
    if (!c) continue;
    const d = haversineKm(lat, lng, c.lat, c.lon);
    const t = el.tags || {};
    const hw = t.highway;
    const pt = t.public_transport;
    const rw = t.railway;

    if (el.type === "way" && hw === "cycleway") {
      cyclewayCount += 1;
      continue;
    }

    if (isMetroStation(t)) {
      if (hw === "bus_stop" || rw === "tram_stop") continue;
      const name =
        t.name || t["name:ro"] || t["official_name"] || "Stație metrou";
      if (!metroBest || d < metroBest.d) metroBest = { name, d };
      continue;
    }

    if (
      hw === "bus_stop" ||
      rw === "tram_stop" ||
      (rw === "halt" && t.tram === "yes") ||
      pt === "platform" ||
      pt === "stop_position"
    ) {
      if (isMetroStation(t)) continue;
      const key = dedupeKey(c.lat, c.lon, "t");
      if (!seenTransit.has(key)) {
        seenTransit.add(key);
        if (d < minStopM) minStopM = d;
      }
      continue;
    }

    if (
      t.shop === "supermarket" ||
      t.shop === "convenience" ||
      t.amenity === "cafe" ||
      t.amenity === "restaurant"
    ) {
      walkPois.add(dedupeKey(c.lat, c.lon, "w"));
      continue;
    }

    if (
      t.amenity === "school" ||
      t.amenity === "kindergarten" ||
      t.amenity === "college"
    ) {
      const name = t.name || t["name:ro"] || "Unitate de învățământ";
      const bucket = schoolBucket(t) ?? (t.amenity === "college" ? "high" : null);
      if (bucket) schoolCandidates.push({ bucket, name, d });
      else if (t.amenity === "school")
        schoolCandidates.push({ bucket: "gymnasium", name, d });
    }
  }

  const transitStopsNearby = seenTransit.size;

  let transitScore =
    12 +
    Math.min(38, transitStopsNearby * 7) +
    (metroBest ? (metroBest.d < 0.4 ? 35 : metroBest.d < 0.9 ? 28 : metroBest.d < 1.6 ? 18 : 10) : 0);
  if (minStopM < Infinity) {
    if (minStopM < 0.15) transitScore += 12;
    else if (minStopM < 0.35) transitScore += 8;
    else if (minStopM < 0.55) transitScore += 4;
  }
  transitScore = roundScore(transitScore);

  let walkScore =
    18 +
    Math.min(45, walkPois.size * 6) +
    (minStopM < 0.5 ? 15 : minStopM < 1 ? 8 : 0) +
    (metroBest && metroBest.d < 1.2 ? 10 : 0);
  walkScore = roundScore(walkScore);

  let bikeScore = 28 + Math.min(45, cyclewayCount * 12) + (walkPois.size > 2 ? 8 : 0);
  bikeScore = roundScore(bikeScore);

  const transitDesc =
    transitScore >= 70
      ? "Acces bun la transport în comun în zonă"
      : transitScore >= 45
        ? "Transport public rezonabil în apropiere"
        : "Transport public limitat; verifică rutele locale";

  const walkDesc =
    walkScore >= 65
      ? "Multe destinații utile la distanță de mers pe jos"
      : walkScore >= 40
        ? "Zonă mixtă: unele servicii la pași"
        : "Puține puncte de interes imediate; mașina poate fi necesară";

  const bikeDesc =
    bikeScore >= 55
      ? "Prezență observată de piste / artere pentru biciclete în OSM"
      : bikeScore >= 38
        ? "Bicicletă posibilă; infrastructură ciclistă moderată"
        : "Infrastructură ciclistă slab reprezentată în datele OSM";

  const best = (bucket: "primary" | "gymnasium" | "high") => {
    const list = schoolCandidates.filter((s) => s.bucket === bucket);
    if (list.length === 0) return null;
    list.sort((a, b) => a.d - b.d);
    const x = list[0];
    return { name: x.name, distanceKm: Math.round(x.d * 10) / 10 };
  };

  return {
    walkScore: { value: walkScore, description: walkDesc },
    transitScore: { value: transitScore, description: transitDesc },
    bikeScore: { value: bikeScore, description: bikeDesc },
    nearestMetro: metroBest
      ? {
          name: metroBest.name,
          distanceKm: Math.round(metroBest.d * 10) / 10,
        }
      : null,
    transitStopsNearby,
    schools: {
      primary: best("primary"),
      gymnasium: best("gymnasium"),
      highSchool: best("high"),
    },
    attribution: "© Contribuitori OpenStreetMap (date aproximative)",
  };
}

export async function getListingNearbyInsights(
  lat: number,
  lng: number,
): Promise<ListingNearbyInsights | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const { lat: la, lng: ln } = correctLatLngIfSwappedForRomania(lat, lng);

  const cacheKey = ["listing-nearby-insights-v2", la.toFixed(5), ln.toFixed(5)];
  const runCached = unstable_cache(
    async () => {
      const result = await computeInsights(la, ln);
      if (result === null) throw new Error("overpass-no-data");
      return result;
    },
    cacheKey,
    { revalidate: 86_400 },
  );

  try {
    return await runCached();
  } catch {
    return await computeInsights(la, ln);
  }
}
