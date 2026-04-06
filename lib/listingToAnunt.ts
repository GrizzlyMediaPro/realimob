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

  const firstImage =
    images.length > 0 && images[0].urls && images[0].urls.length > 0
      ? images[0].urls[0]
      : "/ap2.jpg";

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
    lat: fixedLat,
    lng: fixedLng,
    dormitoare: details.camere
      ? details.camere === "Studio"
        ? 1
        : Number(details.camere)
      : undefined,
    bai: details.nrBai ? Number(details.nrBai) : undefined,
    suprafataUtil: details.suprafataUtila
      ? Number(details.suprafataUtila)
      : undefined,
    etaj: details.etaj || undefined,
    anConstructie: details.anConstructie
      ? Number(details.anConstructie)
      : undefined,
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
