import type { Anunt, AssignedAgentPublic, RoomImage } from "./anunturiData";

/** Afișare preț cu mențiune TVA (din `details.tvaInclus`). */
export function formatListingPriceDisplay(
  price: number,
  currency: string,
  details?: Record<string, unknown> | null,
): string {
  const base = `${Number(price).toLocaleString("ro-RO")} ${currency}`;
  if (!details || typeof details !== "object") return base;
  const tva = details.tvaInclus;
  if (tva === true) return `${base} (TVA inclus)`;
  if (tva === false) return `${base} (TVA neinclus)`;
  return base;
}

/** Coordonate din Mongo/JSON pot fi număr, string, Decimal BSON sau obiect Prisma. */
export function parseListingCoord(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const t = value.trim().replace(",", ".");
    if (!t) return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    if (typeof o.$numberDouble === "string") {
      const n = Number(o.$numberDouble);
      return Number.isFinite(n) ? n : undefined;
    }
    if (typeof o.$numberDecimal === "string") {
      const n = Number(o.$numberDecimal);
      return Number.isFinite(n) ? n : undefined;
    }
    const toNum = (value as { toNumber?: () => number }).toNumber;
    if (typeof toNum === "function") {
      const n = toNum.call(value);
      return typeof n === "number" && Number.isFinite(n) ? n : undefined;
    }
  }
  return undefined;
}

/** Unele salvări inversează lat/lng; pentru România corectăm dacă perechea e tipic inversată. */
export function correctLatLngIfSwappedForRomania(
  lat: number,
  lng: number,
): { lat: number; lng: number } {
  const latOk = lat >= 43.35 && lat <= 48.35;
  const lngOk = lng >= 19.8 && lng <= 30.2;
  if (latOk && lngOk) return { lat, lng };
  const swappedOk =
    lng >= 43.35 && lng <= 48.35 && lat >= 19.8 && lat <= 30.2;
  if (swappedOk) return { lat: lng, lng: lat };
  return { lat, lng };
}

function mapDbAgentToPublic(agent: {
  id: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  rating: number;
}): AssignedAgentPublic {
  return {
    id: agent.id,
    name: agent.name,
    phone: agent.phone ?? undefined,
    avatar: agent.avatar ?? undefined,
    rating: agent.rating,
  };
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const str = String(value).trim();
  if (!str) return undefined;
  const n = Number(str);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Prima imagine folosibilă din `listing.images` (Prisma Json):
 * - camere `{ urls: string[] }` (format adăugare anunț),
 * - sau URL-uri string în array,
 * - sau obiecte `{ url: string }`.
 */
export function getFirstListingImageUrl(
  images: unknown,
  fallback = "/ap2.jpg",
): string {
  if (!Array.isArray(images) || images.length === 0) return fallback;
  for (const item of images) {
    if (item && typeof item === "object" && item !== null && "urls" in item) {
      const urls = (item as { urls?: unknown }).urls;
      if (Array.isArray(urls)) {
        for (const u of urls) {
          if (typeof u === "string" && u.trim()) return u.trim();
        }
      }
    }
    if (typeof item === "string" && item.trim()) return item.trim();
    if (item && typeof item === "object" && item !== null && "url" in item) {
      const u = (item as { url?: string }).url;
      if (typeof u === "string" && u.trim()) return u.trim();
    }
  }
  return fallback;
}

/** Număr total de URL-uri imagine (camere cu `urls`, string-uri sau `{ url }`). */
export function countListingImages(images: unknown): number {
  if (!Array.isArray(images)) return 0;
  let n = 0;
  for (const item of images) {
    if (item && typeof item === "object" && item !== null && "urls" in item) {
      const urls = (item as { urls?: unknown }).urls;
      if (Array.isArray(urls)) {
        for (const u of urls) {
          if (typeof u === "string" && u.trim()) n += 1;
        }
      }
    } else if (typeof item === "string" && item.trim()) {
      n += 1;
    } else if (item && typeof item === "object" && item !== null && "url" in item) {
      const u = (item as { url?: string }).url;
      if (typeof u === "string" && u.trim()) n += 1;
    }
  }
  return n;
}

/** Transformă un listing Prisma (cu `agent` opțional inclus) în `Anunt`. */
export function transformListingToAnunt(
  listing: any,
): Anunt & { description?: string; dbDetails?: any } {
  const details = listing.details || {};
  const images = listing.images || [];

  const latFromRoot = parseListingCoord(listing.latitude);
  const lngFromRoot = parseListingCoord(listing.longitude);
  const latFromDetails =
    parseListingCoord(details.lat) ??
    parseListingCoord(details.latitude) ??
    parseListingCoord(details.mapLat);
  const lngFromDetails =
    parseListingCoord(details.lng) ??
    parseListingCoord(details.longitude) ??
    parseListingCoord(details.mapLng);

  const rawLat = latFromRoot ?? latFromDetails;
  const rawLng = lngFromRoot ?? lngFromDetails;
  const { lat: fixedLat, lng: fixedLng } =
    rawLat != null && rawLng != null
      ? correctLatLngIfSwappedForRomania(rawLat, rawLng)
      : { lat: rawLat, lng: rawLng };

  const firstImage = getFirstListingImageUrl(images);

  const tags: string[] = [];
  if (details.suprafataUtila) tags.push(`${details.suprafataUtila} m²`);
  if (listing.sector) tags.push(listing.sector);
  if (details.etaj !== undefined && details.etaj !== "") {
    tags.push(`Etaj ${details.etaj}`);
  }
  if (details.stare) tags.push(details.stare);
  if (details.mobilare) tags.push(details.mobilare);

  const createdAt = new Date(listing.createdAt);
  const now = new Date();
  const zilePostat = Math.floor(
    Math.abs(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  const assignedAgent = listing.agent
    ? mapDbAgentToPublic(listing.agent)
    : undefined;
  const dormitoareApartament =
    details.camere === "Studio"
      ? 1
      : toOptionalNumber(details.camere);
  const dormitoareCasa = toOptionalNumber(details.nrDormitoareCasa);
  const dormitoareCasaFallback = toOptionalNumber(details.nrCamere);
  const dormitoare =
    dormitoareApartament ?? dormitoareCasa ?? dormitoareCasaFallback;

  return {
    id: listing.id,
    titlu: listing.title,
    image: firstImage,
    pret: formatListingPriceDisplay(
      listing.price,
      listing.currency,
      listing.details as Record<string, unknown> | null,
    ),
    tags,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    lat: fixedLat,
    lng: fixedLng,
    dormitoare,
    bai: toOptionalNumber(details.nrBai),
    suprafataUtil: toOptionalNumber(details.suprafataUtila),
    etaj: details.etaj || undefined,
    anConstructie: toOptionalNumber(details.anConstructie),
    zilePostat,
    vizualizari: 0,
    favorite: 0,
    description: listing.description || undefined,
    dbDetails: details || undefined,
    ...(assignedAgent ? { assignedAgent } : {}),
  };
}

export function transformImagesToRoomImages(images: any[]): RoomImage[] {
  const result: RoomImage[] = [];
  images.forEach((camera) => {
    if (camera.urls && Array.isArray(camera.urls)) {
      camera.urls.forEach((url: string) => {
        result.push({
          url,
          roomName: camera.cameraName || "Cameră",
        });
      });
    }
  });
  return result;
}
