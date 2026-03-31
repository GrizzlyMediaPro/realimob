import type { Anunt, AssignedAgentPublic, RoomImage } from "./anunturiData";

function mapDbAgentToPublic(agent: {
  id: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  rating: number;
  calendlyUrl?: string | null;
}): AssignedAgentPublic {
  return {
    id: agent.id,
    name: agent.name,
    phone: agent.phone ?? undefined,
    avatar: agent.avatar ?? undefined,
    rating: agent.rating,
    calendlyUrl: agent.calendlyUrl ?? undefined,
  };
}

/** Transformă un listing Prisma (cu `agent` opțional inclus) în `Anunt`. */
export function transformListingToAnunt(
  listing: any,
): Anunt & { description?: string; dbDetails?: any } {
  const details = listing.details || {};
  const images = listing.images || [];

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
    pret: `${listing.price.toLocaleString("ro-RO")} ${listing.currency}`,
    tags,
    createdAt: listing.createdAt,
    lat: details.lat || undefined,
    lng: details.lng || undefined,
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
