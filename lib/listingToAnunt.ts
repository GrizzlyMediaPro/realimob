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

  const latFromRoot =
    listing.latitude != null && Number.isFinite(Number(listing.latitude))
      ? Number(listing.latitude)
      : undefined;
  const lngFromRoot =
    listing.longitude != null && Number.isFinite(Number(listing.longitude))
      ? Number(listing.longitude)
      : undefined;
  const latFromDetails =
    details.lat != null && Number.isFinite(Number(details.lat))
      ? Number(details.lat)
      : undefined;
  const lngFromDetails =
    details.lng != null && Number.isFinite(Number(details.lng))
      ? Number(details.lng)
      : undefined;

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
    lat: latFromRoot ?? latFromDetails,
    lng: lngFromRoot ?? lngFromDetails,
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
