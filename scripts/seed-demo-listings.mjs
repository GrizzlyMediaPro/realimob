/**
 * Seed: 10 anunțuri demo (vânzare + închiriere, apartament/studio/casă/teren/comercial).
 *
 * Rulare (din rădăcina proiectului):
 *   node --env-file=.env scripts/seed-demo-listings.mjs
 *
 * Imagini: căi relative la site (/nume-fisier.ext) — servite din /public, compatibile cu next/image.
 *
 * Utilizatori: se iau ID-uri Clerk distincte din anunțurile existente; dacă nu există,
 * setează SEED_CLERK_USER_IDS=id1,id2,id3 în .env (ID-uri reale din Clerk Dashboard).
 *
 * La fiecare rulare: șterge anunțurile mock anterioare (titluri vechi + details.seedDemo),
 * apoi inserează un set nou de 10. Nu duplică la re-run.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Titluri din prima serie de seed (înainte de marcaj seedDemo) */
const LEGACY_MOCK_TITLES = [
  "Studio luminos, Aviatorilor — finisaje premium",
  "Apartament 2 camere de închiriat — Dorobanți",
  "Apartament 3 camere, Pantelimon — etaj intermediar",
  "Casă individuală P+1+M, curte generoasă — Voluntari",
  "Casă de închiriat — birou + locuință, Pipera",
  "Teren intravilan pentru construcție — Chitila",
  "Teren agricol de închiriere — sud Ilfov",
  "Spațiu comercial stradal — vitrină mare",
  "Birouri open-space de închiriere — clasa B",
  "Hală logistică cu rampă și curte — acces TIR",
];

function markSeedDemo(details) {
  return { ...details, seedDemo: true };
}

/** Normalizează titlul ca să prindă diferențe — / – față de - */
function normalizeTitle(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[—–]/g, "-");
}

function hasSeedDemoFlag(details) {
  if (details == null || typeof details !== "object") return false;
  const v = /** @type {Record<string, unknown>} */ (details).seedDemo;
  return v === true || v === "true" || v === 1;
}

/**
 * Seed-ul pune doar URL-uri relative (/fisier.jpg). Utilizatorii reali tind să aibă UploadThing (https).
 */
function imagesAreOnlyLocalPublicPaths(images) {
  if (!Array.isArray(images) || images.length === 0) return false;
  let n = 0;
  for (const item of images) {
    if (!item || typeof item !== "object") continue;
    const urls = item.urls;
    if (!Array.isArray(urls)) continue;
    for (const u of urls) {
      if (typeof u !== "string" || !u.trim()) continue;
      n += 1;
      const t = u.trim();
      if (/^https?:\/\//i.test(t)) return false;
      if (!t.startsWith("/")) return false;
    }
  }
  return n > 0;
}

/**
 * Șterge toate mock-urile: titluri din script (serie veche + serie curentă), details.seedDemo,
 * sau imagini exclusiv ca fișiere locale /public (fără https).
 */
async function deleteAllMockListings(demoListings) {
  const titleNormSet = new Set(
    [...LEGACY_MOCK_TITLES, ...demoListings.map((l) => l.title)].map((t) =>
      normalizeTitle(t),
    ),
  );

  const rows = await prisma.listing.findMany({
    select: { id: true, title: true, details: true, images: true },
  });

  const ids = new Set();
  for (const row of rows) {
    if (titleNormSet.has(normalizeTitle(row.title))) {
      ids.add(row.id);
      continue;
    }
    if (hasSeedDemoFlag(row.details)) {
      ids.add(row.id);
      continue;
    }
    if (imagesAreOnlyLocalPublicPaths(row.images)) {
      ids.add(row.id);
      continue;
    }
  }

  const idArr = [...ids];
  if (idArr.length === 0) return 0;
  const res = await prisma.listing.deleteMany({ where: { id: { in: idArr } } });
  return res.count;
}

/** Cale în public → URL relativ (ex: /living.jpg) pentru next/image */
function pub(rel) {
  const clean = rel.startsWith("/") ? rel.slice(1) : rel;
  return `/${clean.split("/").map(encodeURIComponent).join("/")}`;
}

function emptyDetails() {
  return {
    tipProprietate: "",
    subtipComercial: "",
    tipTranzactie: "",
    camere: "",
    suprafataUtila: "",
    suprafataConstruita: "",
    etaj: "",
    etajTotal: "",
    compartimentare: "",
    anConstructie: "",
    stare: "",
    mobilare: "",
    confort: "",
    lift: null,
    balcon: null,
    nrBalcoane: "",
    incalzire: "",
    locParcare: null,
    tipParcare: "",
    boxa: null,
    orientare: [],
    tipCladire: "",
    suprafataTeren: "",
    nrCamere: "",
    nrDormitoareCasa: "",
    nrBai: "",
    regimInaltime: "",
    tipCasa: "",
    incalzireCasa: "",
    utilitati: [],
    garaj: null,
    materialCasa: "",
    acoperis: "",
    deschidereStrada: "",
    drumAcces: "",
    suprafata: "",
    intravilan: "",
    destinatieTeren: "",
    deschidere: "",
    utilitatiTeren: [],
    puzPud: "",
    tipAccesTeren: "",
    tipTeren: "",
    inApropriere: [],
    traficPietonal: "",
    compartimentareComercial: "",
    grupSanitar: null,
    inaltimeLibera: "",
    putereElectrica: "",
    ventilatie: null,
    terasa: null,
    locuriParcare: "",
    accesMarfa: null,
    clasaCladire: "",
    nrBirouri: "",
    locuriParcareBirouri: "",
    liftBirouri: null,
    receptie: null,
    securitate: null,
    acCentralizat: null,
    suprafataCurte: "",
    inaltimeHala: "",
    accesTir: null,
    nrRampe: "",
    sarcinaPardoseala: "",
    putereElectricaHala: "",
    incalzireHala: null,
    birouriIncluse: null,
    mpBirouri: "",
    tvaInclus: true,
  };
}

function apartamentDetails(overrides) {
  return {
    ...emptyDetails(),
    tipProprietate: "Apartament",
    tipTranzactie: overrides.tipTranzactie,
    camere: overrides.camere,
    suprafataUtila: overrides.suprafataUtila,
    suprafataConstruita: overrides.suprafataConstruita,
    etaj: overrides.etaj,
    etajTotal: overrides.etajTotal,
    compartimentare: overrides.compartimentare || "Decomandat",
    anConstructie: overrides.anConstructie || "2019",
    stare: overrides.stare || "Renovat",
    mobilare: overrides.mobilare || "Complet mobilat",
    confort: "Confort I",
    lift: overrides.lift ?? true,
    balcon: overrides.balcon ?? true,
    nrBalcoane: overrides.balcon ? overrides.nrBalcoane || "1" : "",
    incalzire: "Centrală proprie",
    locParcare: overrides.locParcare ?? true,
    tipParcare: "Subteran",
    boxa: overrides.boxa ?? false,
    orientare: overrides.orientare ?? ["S", "E"],
    tipCladire: overrides.tipCladire ?? "Bloc",
    tvaInclus: overrides.tvaInclus ?? true,
  };
}

function casaDetails(tipTranzactie) {
  return {
    ...emptyDetails(),
    tipProprietate: "Casă/Vilă",
    tipTranzactie,
    suprafataUtila: "185",
    suprafataTeren: "420",
    nrCamere: "6",
    nrDormitoareCasa: "4",
    nrBai: "3",
    regimInaltime: "P+1+M",
    stare: "Nou",
    tipCasa: "Individuală",
    anConstructie: "2021",
    incalzireCasa: "Pompă de căldură",
    utilitati: ["Apă", "Canal", "Gaz", "Curent"],
    garaj: true,
    materialCasa: "Cărămidă",
    acoperis: "Țiglă",
    deschidereStrada: "18",
    drumAcces: "Asfalt",
    tvaInclus: true,
  };
}

function terenDetails(tipTranzactie) {
  return {
    ...emptyDetails(),
    tipProprietate: "Teren",
    tipTranzactie,
    suprafata: "850",
    intravilan: "Intravilan",
    destinatieTeren: "Construcții",
    deschidere: "28",
    utilitatiTeren: ["Curent", "Gaz", "Apă"],
    puzPud: "Da",
    tipAccesTeren: "Asfalt",
    tipTeren: "Plat",
    inApropriere: ["Parc"],
    tvaInclus: false,
  };
}

function comercialStradal(tipTranzactie) {
  return {
    ...emptyDetails(),
    tipProprietate: "Comercial",
    subtipComercial: "Stradal/Retail",
    tipTranzactie,
    suprafataUtila: "95",
    traficPietonal: "Mare",
    compartimentareComercial: "Open space",
    grupSanitar: true,
    inaltimeLibera: "3.4",
    putereElectrica: "45",
    ventilatie: true,
    terasa: false,
    locuriParcare: "3",
    accesMarfa: true,
    tvaInclus: true,
  };
}

function comercialBirouri(tipTranzactie) {
  return {
    ...emptyDetails(),
    tipProprietate: "Comercial",
    subtipComercial: "Birouri",
    tipTranzactie,
    suprafataUtila: "220",
    clasaCladire: "B",
    nrBirouri: "6",
    locuriParcareBirouri: "12",
    liftBirouri: true,
    receptie: true,
    securitate: true,
    acCentralizat: true,
    anConstructie: "2017",
    tvaInclus: true,
  };
}

function comercialDepozit(tipTranzactie) {
  return {
    ...emptyDetails(),
    tipProprietate: "Comercial",
    subtipComercial: "Depozit/Hala",
    tipTranzactie,
    suprafataUtila: "480",
    suprafataCurte: "1200",
    inaltimeHala: "9",
    accesTir: true,
    nrRampe: "4",
    sarcinaPardoseala: "5",
    putereElectricaHala: "120",
    incalzireHala: false,
    birouriIncluse: true,
    mpBirouri: "45",
    tvaInclus: true,
  };
}

/** Coordonate în jurul centrului Bucureștiului */
function coords(i) {
  const lat = 44.4268 + (i % 5) * 0.012 - 0.02;
  const lng = 26.1025 + (i % 7) * 0.015 - 0.03;
  return { latitude: lat, longitude: lng };
}

const DEMO_LISTINGS = [
  {
    title: "Apartament 4+ camere decomandat — Titan, vedere liberă",
    description:
      "Apartament generos, două grupuri sanitare, dressing. Bloc cu pază, zonă cu magazine și școli în proximitate.",
    transactionType: "Vânzare",
    propertyType: "Apartament",
    commercialSubtype: null,
    price: 198000,
    currency: "RON",
    location: "Titan",
    address: "Bd. 1 Decembrie 1918 nr. 88",
    sector: "Sector 3",
    details: markSeedDemo(
      apartamentDetails({
        tipTranzactie: "Vânzare",
        camere: "4+",
        suprafataUtila: "112",
        suprafataConstruita: "125",
        etaj: "7",
        etajTotal: "10",
        compartimentare: "Decomandat",
        anConstructie: "2016",
        stare: "Renovat",
        mobilare: "Nemobilat",
        balcon: true,
        nrBalcoane: "2",
        tipCladire: "Bloc",
      }),
    ),
    images: [
      {
        cameraId: "v2-liv-a",
        cameraName: "Living",
        urls: [pub("/living1.jpeg"), pub("/hol.jpeg")],
      },
      {
        cameraId: "v2-dorm-a",
        cameraName: "Dormitor",
        urls: [pub("/dormitor.jpeg"), pub("/dormitor.webp")],
      },
      { cameraId: "v2-baie-a", cameraName: "Baie", urls: [pub("/baie2.jpg")] },
    ],
  },
  {
    title: "Studio modern de închiriat — Politehnica / Grozăvești",
    description:
      "Garsonieră eficientă, ideală pentru student sau tânăr profesionist. Mobilier nou, contract minim 12 luni.",
    transactionType: "Închiriere",
    propertyType: "Apartament",
    commercialSubtype: null,
    price: 480,
    currency: "€",
    location: "Grozăvești",
    address: "Spl. Independenței nr. 210",
    sector: "Sector 6",
    details: markSeedDemo(
      apartamentDetails({
        tipTranzactie: "Închiriere",
        camere: "Studio",
        suprafataUtila: "34",
        suprafataConstruita: "38",
        etaj: "2",
        etajTotal: "11",
        compartimentare: "Semidecomandat",
        mobilare: "Complet mobilat",
        lift: true,
        balcon: false,
        locParcare: false,
        tipParcare: "",
        tvaInclus: false,
      }),
    ),
    images: [
      { cameraId: "v2-stud", cameraName: "Living", urls: [pub("/living.jpg")] },
      {
        cameraId: "v2-stud-b",
        cameraName: "Bucătărie",
        urls: [pub("/bucatarie.webp")],
      },
    ],
  },
  {
    title: "Apartament 1 cameră — Drumul Taberei, parter înalt",
    description:
      "Compartimentare circulară, ideal pentru investiție. Aproape de parc și stație STB.",
    transactionType: "Vânzare",
    propertyType: "Apartament",
    commercialSubtype: null,
    price: 89500,
    currency: "RON",
    location: "Drumul Taberei",
    address: "Str. Brașov nr. 15",
    sector: "Sector 6",
    details: markSeedDemo(
      apartamentDetails({
        tipTranzactie: "Vânzare",
        camere: "1",
        suprafataUtila: "42",
        suprafataConstruita: "48",
        etaj: "Parter",
        etajTotal: "4",
        compartimentare: "Circular",
        anConstructie: "1982",
        stare: "De renovat",
        mobilare: "Nemobilat",
        tipCladire: "Vilă",
        balcon: true,
        nrBalcoane: "1",
      }),
    ),
    images: [
      {
        cameraId: "v2-1cam",
        cameraName: "Cameră",
        urls: [pub("/dormitor.webp"), pub("/balcon.webp")],
      },
    ],
  },
  {
    title: "Duplex nou, curte proprie — Otopeni",
    description:
      "Duplex P+1, finisaje la alegere în curs. Grădină 180 mp, ideal familie.",
    transactionType: "Vânzare",
    propertyType: "Casă/Vilă",
    commercialSubtype: null,
    price: 265000,
    currency: "€",
    location: "Otopeni",
    address: "Str. Zborului nr. 44",
    sector: "Ilfov",
    details: markSeedDemo({
      ...casaDetails("Vânzare"),
      suprafataUtila: "140",
      suprafataTeren: "280",
      nrCamere: "5",
      nrDormitoareCasa: "3",
      nrBai: "2",
      regimInaltime: "P+1",
      tipCasa: "Duplex",
      anConstructie: "2024",
      stare: "Nou",
      incalzireCasa: "Centrală termică",
      garaj: true,
    }),
    images: [
      {
        cameraId: "v2-dup-l",
        cameraName: "Living",
        urls: [pub("/terasa.jpeg"), pub("/living.jpg")],
      },
      {
        cameraId: "v2-dup-b",
        cameraName: "Bucătărie",
        urls: [pub("/bucatarie.webp")],
      },
    ],
  },
  {
    title: "Casă înșiruită de închiriat — Popești-Leordeni",
    description:
      "P+1+M, curte comună mică, acces rapid la centură. Chirie pentru familie.",
    transactionType: "Închiriere",
    propertyType: "Casă/Vilă",
    commercialSubtype: null,
    price: 1100,
    currency: "€",
    location: "Popești-Leordeni",
    address: "Str. Trandafirilor nr. 6",
    sector: "Ilfov",
    details: markSeedDemo({
      ...casaDetails("Închiriere"),
      suprafataUtila: "130",
      suprafataTeren: "150",
      nrCamere: "5",
      nrDormitoareCasa: "3",
      nrBai: "2",
      regimInaltime: "P+1+M",
      tipCasa: "Înșiruită",
      stare: "Renovat",
      anConstructie: "2015",
      garaj: false,
      drumAcces: "Pietruit",
    }),
    images: [
      {
        cameraId: "v2-cins",
        cameraName: "Living",
        urls: [pub("/living1.jpeg")],
      },
      {
        cameraId: "v2-cins-d",
        cameraName: "Dormitor",
        urls: [pub("/dormitor.jpeg")],
      },
      { cameraId: "v2-cins-b", cameraName: "Baie", urls: [pub("/baie1.webp")] },
    ],
  },
  {
    title: "Teren livadă — extravilan Corbeanca",
    description:
      "Suprafață agricolă cu pomi fructiferi maturi. Acces pietruit, curent la limita proprietății.",
    transactionType: "Vânzare",
    propertyType: "Teren",
    commercialSubtype: null,
    price: 42000,
    currency: "€",
    location: "Corbeanca",
    address: "Zona extravilan (tras GPS la fața locului)",
    sector: "Ilfov",
    details: markSeedDemo({
      ...terenDetails("Vânzare"),
      suprafata: "12000",
      intravilan: "Extravilan",
      destinatieTeren: "Livadă",
      deschidere: "40",
      utilitatiTeren: ["Curent"],
      tipAccesTeren: "Pietruit",
      tipTeren: "În pantă",
      inApropriere: ["Lac", "Pădure"],
      puzPud: "Nu",
    }),
    images: [
      {
        cameraId: "v2-livad",
        cameraName: "Teren",
        urls: [pub("/terasa.jpeg")],
      },
    ],
  },
  {
    title: "Teren intravilan de închiriere — șantier / depozit temporar",
    description:
      "Parcelă dreaptă, gard împrejmuitor parțial. Disponibil 6–18 luni pentru proiecte.",
    transactionType: "Închiriere",
    propertyType: "Teren",
    commercialSubtype: null,
    price: 800,
    currency: "€",
    location: "Fundeni",
    address: "Zona industrială ușoară",
    sector: "Sector 2",
    details: markSeedDemo({
      ...terenDetails("Închiriere"),
      suprafata: "2200",
      intravilan: "Intravilan",
      destinatieTeren: "Construcții",
      deschidere: "35",
      utilitatiTeren: ["Curent", "Apă"],
      puzPud: "În lucru",
      tipAccesTeren: "Asfalt",
      tipTeren: "Plat",
      inApropriere: ["Parc"],
      tvaInclus: false,
    }),
    images: [
      { cameraId: "v2-terr", cameraName: "Parcelă", urls: [pub("/hol.jpeg")] },
    ],
  },
  {
    title: "Spațiu comercial de închiriat — Calea Victoriei",
    description:
      "Vitrină la stradă, trafic constant. Potrivit showroom, farmacie sau servicii.",
    transactionType: "Închiriere",
    propertyType: "Comercial",
    commercialSubtype: "Stradal/Retail",
    price: 2900,
    currency: "€",
    location: "Calea Victoriei",
    address: "Calea Victoriei nr. 155",
    sector: "Sector 1",
    details: markSeedDemo({
      ...comercialStradal("Închiriere"),
      suprafataUtila: "72",
      traficPietonal: "Mare",
      compartimentareComercial: "Compartimentat",
      putereElectrica: "32",
      locuriParcare: "0",
      ventilatie: false,
      terasa: true,
      tvaInclus: false,
    }),
    images: [
      {
        cameraId: "v2-ret",
        cameraName: "Vitrină",
        urls: [pub("/spatiu1.jpg"), pub("/spatiu 2.jpg")],
      },
    ],
  },
  {
    title: "Etaj birouri de vânzare — clasa A, zona Floreasca",
    description:
      "Investiție: etaj complet 320 mp, chiriași existenți opțional. Acte la zi.",
    transactionType: "Vânzare",
    propertyType: "Comercial",
    commercialSubtype: "Birouri",
    price: 920000,
    currency: "€",
    location: "Floreasca",
    address: "Str. Barbu Văcărescu nr. 120",
    sector: "Sector 2",
    details: markSeedDemo({
      ...comercialBirouri("Vânzare"),
      suprafataUtila: "320",
      clasaCladire: "A",
      nrBirouri: "12",
      locuriParcareBirouri: "24",
      anConstructie: "2019",
      liftBirouri: true,
      receptie: true,
      securitate: true,
      acCentralizat: true,
    }),
    images: [
      {
        cameraId: "v2-bir-v",
        cameraName: "Birouri",
        urls: [pub("/birou.webp"), pub("/hol.jpeg")],
      },
      {
        cameraId: "v2-bir-v2",
        cameraName: "Recepție",
        urls: [pub("/living1.jpeg")],
      },
    ],
  },
  {
    title: "Hală logistică de închiriere — Ștefănești, ILFOV",
    description:
      "Hala frigorifică opțională deconectată, rampă nivel doc, curte pentru manevre.",
    transactionType: "Închiriere",
    propertyType: "Comercial",
    commercialSubtype: "Depozit/Hala",
    price: 6500,
    currency: "€",
    location: "Ștefănești",
    address: "Parc industrial (acces la vizionare)",
    sector: "Ilfov",
    details: markSeedDemo({
      ...comercialDepozit("Închiriere"),
      suprafataUtila: "620",
      suprafataCurte: "900",
      inaltimeHala: "10",
      accesTir: true,
      nrRampe: "6",
      sarcinaPardoseala: "6",
      putereElectricaHala: "200",
      incalzireHala: true,
      birouriIncluse: false,
      mpBirouri: "",
      tvaInclus: false,
    }),
    images: [
      {
        cameraId: "v2-hala-i",
        cameraName: "Hală",
        urls: [pub("/spatiu1.jpg")],
      },
      {
        cameraId: "v2-hala-i2",
        cameraName: "Rampă",
        urls: [pub("/spatiu 2.jpg")],
      },
    ],
  },
];

async function resolveSubmitterIds() {
  const envIds =
    process.env.SEED_CLERK_USER_IDS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const rows = await prisma.listing.findMany({
    where: { submittedByUserId: { not: null } },
    select: { submittedByUserId: true },
  });
  const fromDb = [...new Set(rows.map((r) => r.submittedByUserId).filter(Boolean))];

  /** Env primele (ordinea ta), apoi restul din DB, fără duplicate */
  const merged = [...new Set([...envIds, ...fromDb])];
  if (merged.length) return merged;

  console.warn(
    "[seed] Nu există submittedByUserId în DB și lipsește SEED_CLERK_USER_IDS. " +
      "Se folosesc ID-uri fictive (nu sunt conturi Clerk reale).",
  );
  return [
    "user_seed_demo_1",
    "user_seed_demo_2",
    "user_seed_demo_3",
    "user_seed_demo_4",
    "user_seed_demo_5",
  ];
}

async function main() {
  const deleteOnly = process.argv.includes("--delete-only");

  const removed = await deleteAllMockListings(DEMO_LISTINGS);
  console.log(
    `[seed] Șterse ${removed} anunțuri mock (titluri cunoscute, seedDemo sau galerie doar /fișiere locale).`,
  );

  if (deleteOnly) {
    console.log("\nMod --delete-only: nu se inserează anunțuri noi.");
    return;
  }

  console.log("");

  const submitters = await resolveSubmitterIds();

  let created = 0;
  for (let i = 0; i < DEMO_LISTINGS.length; i++) {
    const row = DEMO_LISTINGS[i];
    const { latitude, longitude } = coords(i);
    const submittedByUserId = submitters[i % submitters.length];

    await prisma.listing.create({
      data: {
        title: row.title,
        description: row.description,
        transactionType: row.transactionType,
        propertyType: row.propertyType,
        commercialSubtype: row.commercialSubtype,
        price: row.price,
        currency: row.currency,
        location: row.location,
        address: row.address,
        sector: row.sector,
        latitude,
        longitude,
        status: "approved",
        submittedByUserId,
        details: row.details,
        images: row.images,
      },
    });
    created++;
    console.log(`✓ [${created}/10] ${row.title.slice(0, 50)}… → ${submittedByUserId}`);
  }

  console.log(`\nGata: ${created} anunțuri aprobate (imagini din /public, căi relative).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
