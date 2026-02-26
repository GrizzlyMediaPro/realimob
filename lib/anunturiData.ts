export type Anunt = {
  id: string;
  titlu: string;
  image: string;
  pret: string;
  tags: string[];
  createdAt: string;
  lat?: number;
  lng?: number;
  dormitoare?: number;
  bai?: number;
  suprafataUtil?: number; // în m²
  etaj?: number | string; // poate fi număr sau "Parter", "Demisol", etc.
  anConstructie?: number;
  zilePostat?: number;
  vizualizari?: number;
  favorite?: number;
};

export type SortOption =
  | "relevanta"
  | "noi"
  | "pret_crescator"
  | "pret_descrescator";

export const parsePretToNumber = (pret: string) => {
  const digitsOnly = pret.replace(/[^\d]/g, "");
  const value = Number(digitsOnly);
  return Number.isFinite(value) ? value : 0;
};

const baseAnunturi = [
  {
    titlu:
      "Apartament luminos, 2 camere — renovat recent, lângă Parcul Floreasca",
    image: "/ap2.jpg",
    pret: "85.000 €",
    tags: ["65 m²", "Sector 1", "Etaj 3", "Renovat"],
    lat: 44.4685,
    lng: 26.1025,
    dormitoare: 2,
    bai: 1,
    suprafataUtil: 65,
    etaj: 3,
    anConstructie: 2015,
  },
  {
    titlu: "Apartament modern 3 camere cu balcon mare și vedere către oraș",
    image: "/ap3.jpg",
    pret: "120.000 €",
    tags: ["85 m²", "Sector 2", "Etaj 5", "Balcon"],
    lat: 44.448,
    lng: 26.152,
    dormitoare: 3,
    bai: 2,
    suprafataUtil: 85,
    etaj: 5,
    anConstructie: 2018,
  },
  {
    titlu: "Penthouse spațios 4 camere cu terasă privată și finisaje premium",
    image: "/ap4.jpg",
    pret: "180.000 €",
    tags: ["120 m²", "Sector 3", "Etaj 2", "Duplex"],
    lat: 44.414,
    lng: 26.13,
    dormitoare: 4,
    bai: 2,
    suprafataUtil: 120,
    etaj: "Duplex",
    anConstructie: 2020,
  },
  {
    titlu:
      "Studio cochet în zona centrală — perfect pentru investiție sau închirieri",
    image: "/studio.jpg",
    pret: "45.000 €",
    tags: ["35 m²", "Centru", "Parter", "Mobilat"],
    lat: 44.435,
    lng: 26.097,
    dormitoare: 1,
    bai: 1,
    suprafataUtil: 35,
    etaj: 0,
    anConstructie: 2012,
  },
  {
    titlu: "Apartament 2 camere, bloc modern — ideal pentru tineri profesioniști",
    image: "/ap2.jpg",
    pret: "75.000 €",
    tags: ["60 m²", "Sector 4", "Etaj 1", "Modern"],
    lat: 44.39,
    lng: 26.118,
    dormitoare: 2,
    bai: 1,
    suprafataUtil: 60,
    etaj: 1,
    anConstructie: 2019,
  },
  {
    titlu:
      "Apartament 3 camere decomandat, balcon mare, aproape de magazine și transport",
    image: "/ap3.jpg",
    pret: "110.000 €",
    tags: ["80 m²", "Sector 5", "Etaj 4", "Decomandat"],
    lat: 44.385,
    lng: 26.045,
    dormitoare: 3,
    bai: 2,
    suprafataUtil: 80,
    etaj: 4,
    anConstructie: 2017,
  },
];

export const generateAnunturi = (total = 80): Anunt[] => {
  return Array.from({ length: total }, (_, i) => {
    const b = baseAnunturi[i % baseAnunturi.length];
    const basePret = parsePretToNumber(b.pret);
    const delta = (i % 10) * 2500; // mică variație ca să aibă sens sortarea
    const pret = `${(basePret + delta).toLocaleString("ro-RO")} €`;

    const createdAt = new Date(
      Date.now() - i * 36 * 60 * 60 * 1000,
    ).toISOString(); // ~1.5 zile între anunțuri

    const zilePostat = Math.floor(i * 1.5);
    const vizualizari = Math.floor(Math.random() * 500) + 50 + (i * 10);
    const favorite = Math.floor(Math.random() * 30) + 5 + (i % 10);

    return {
      id: `anunt-${i + 1}`,
      titlu: `${b.titlu}`,
      image: b.image,
      pret,
      tags: b.tags,
      createdAt,
      lat: b.lat,
      lng: b.lng,
      dormitoare: b.dormitoare,
      bai: b.bai,
      suprafataUtil: b.suprafataUtil,
      etaj: b.etaj,
      anConstructie: b.anConstructie,
      zilePostat,
      vizualizari,
      favorite,
    };
  });
};

export const getAllAnunturi = () => generateAnunturi();

// Helper intern pentru a extrage "zona" (Sector / Centru) din tag-uri
const getAreaTag = (anunt: Anunt): string | null => {
  const areaTag =
    anunt.tags.find((t) => t.includes("Sector")) ??
    anunt.tags.find((t) => t.toLowerCase().includes("centru"));
  return areaTag ?? null;
};

export const getAnuntById = (
  id: string | undefined | null,
): Anunt | undefined => {
  if (!id) return undefined;

  // Recombinăm anunțul direct din baza de template-uri, folosind indexul din ID,
  // ca să fim 100% aliniați cu link-urile de forma /anunturi/anunt-1
  if (id.startsWith("anunt-")) {
    const n = Number(id.replace("anunt-", ""));
    if (Number.isFinite(n) && n >= 1) {
      const index = n - 1;
      const b = baseAnunturi[index % baseAnunturi.length];
      const basePret = parsePretToNumber(b.pret);
      const delta = (index % 10) * 2500;
      const pret = `${(basePret + delta).toLocaleString("ro-RO")} €`;
      const createdAt = new Date(
        Date.now() - index * 36 * 60 * 60 * 1000,
      ).toISOString();

      const zilePostat = Math.floor(index * 1.5);
      const vizualizari = Math.floor(Math.random() * 500) + 50 + (index * 10);
      const favorite = Math.floor(Math.random() * 30) + 5 + (index % 10);

      return {
        id,
        titlu: `${b.titlu}`,
        image: b.image,
        pret,
        tags: b.tags,
        createdAt,
        lat: b.lat,
        lng: b.lng,
        dormitoare: b.dormitoare,
        bai: b.bai,
        suprafataUtil: b.suprafataUtil,
        etaj: b.etaj,
        anConstructie: b.anConstructie,
        zilePostat,
        vizualizari,
        favorite,
      };
    }
  }

  const all = getAllAnunturi();
  return all.find((a) => a.id === id);
};

// Returnează anunțuri similare, cu prioritate:
// 1) aceeași zonă + același nr. de dormitoare
// 2) același nr. de dormitoare
// 3) aceeași zonă
// 4) restul anunțurilor
export const getSimilarAnunturi = (
  current: Anunt,
  count = 8,
): Anunt[] => {
  const all = getAllAnunturi();
  const others = all.filter((a) => a.id !== current.id);

  const currentArea = getAreaTag(current);
  const currentRooms = current.dormitoare ?? null;

  const byArea = (a: Anunt) =>
    !!currentArea &&
    a.tags.some(
      (t) =>
        t === currentArea ||
        t.toLowerCase().includes(currentArea.toLowerCase()),
    );

  const byRooms = (a: Anunt) =>
    currentRooms !== null && a.dormitoare === currentRooms;

  const sortByCreatedAtDesc = (arr: Anunt[]) =>
    arr.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const result: Anunt[] = [];
  const pushFrom = (candidates: Anunt[]) => {
    for (const a of candidates) {
      if (result.length >= count) break;
      if (!result.some((r) => r.id === a.id)) {
        result.push(a);
      }
    }
  };

  // 1) Aceeași zonă + același nr. de dormitoare
  if (currentArea && currentRooms !== null) {
    const both = sortByCreatedAtDesc(
      others.filter((a) => byArea(a) && byRooms(a)),
    );
    pushFrom(both);
  }

  // 2) Același nr. de dormitoare
  if (result.length < count && currentRooms !== null) {
    const sameRooms = sortByCreatedAtDesc(
      others.filter((a) => byRooms(a)),
    );
    pushFrom(sameRooms);
  }

  // 3) Aceeași zonă
  if (result.length < count && currentArea) {
    const sameArea = sortByCreatedAtDesc(
      others.filter((a) => byArea(a)),
    );
    pushFrom(sameArea);
  }

  // 4) Restul
  if (result.length < count) {
    const rest = sortByCreatedAtDesc(
      others.filter((a) => !result.some((r) => r.id === a.id)),
    );
    pushFrom(rest);
  }

  return result.slice(0, count);
};

export const getHighlightedAnunturi = (count = 6): Anunt[] => {
  return getAllAnunturi().slice(0, count);
};

export const getImageCount = (id: string) => {
  // deterministic small pseudo-random count based on id
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 1000;
  }
  return (h % 8) + 1; // 1..8 images
};

