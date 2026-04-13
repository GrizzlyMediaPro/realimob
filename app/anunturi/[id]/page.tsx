import Link from "next/link";
import { MdLocationOn, MdBed, MdBathroom, MdSquareFoot, MdLayers, MdCalendarToday, MdAttachMoney, MdAccessTime, MdVisibility, MdFavorite, MdDirectionsWalk, MdDirectionsTransit, MdDirectionsBike, MdSchool, MdDescription, MdInfo } from "react-icons/md";


import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ListingMapModal from "../../components/ListingMapModal";
import SmallMapPreview from "../../components/SmallMapPreview";
import { GlassSpecCard, GlassStatsCard, GlassDivider } from "../../components/LiquidGlassCards";
import AnuntDetailsExpanded from "../../components/AnuntDetailsExpanded";
import AnuntOffersModal from "../../components/AnuntOffersModal";
import { AgentMobileBar } from "../../components/AgentContactCard";
import SimilarListingsCarousel from "../../components/SimilarListingsCarousel";
import AgentContactCard from "../../components/AgentContactCard";
import { getAnuntById, getRoomImages, parsePretToNumber, type Anunt, type RoomImage } from "../../../lib/anunturiData";
import {
  transformListingToAnunt,
  transformImagesToRoomImages,
} from "../../../lib/listingToAnunt";
import RoomGallery from "../../components/RoomGallery";
import { prisma } from "../../../lib/prisma";

type AnuntPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AnuntPage({ params }: AnuntPageProps) {
  const { id } = await params;
  let anunt: Anunt | undefined = getAnuntById(id);
  let roomImages: RoomImage[] = [];

  if (!anunt) {
    try {
      const listing = await prisma.listing.findUnique({
        where: { id },
        include: { agent: true },
      });
      if (listing && listing.status === "approved") {
        anunt = transformListingToAnunt(listing);
        const dbImages = listing.images as any[];
        if (dbImages && Array.isArray(dbImages)) {
          roomImages = transformImagesToRoomImages(dbImages);
        }
      }
    } catch (error) {
      console.error("Failed to fetch listing from DB:", error);
    }
  }

  if (anunt && roomImages.length === 0) {
    roomImages = getRoomImages(anunt.id, anunt.image);
  }

  if (!anunt) {
    return (
      <div className="min-h-screen text-foreground">
        <Navbar />
        <main className="pt-20 md:pt-24 px-4 md:px-0">
          <div className="w-full max-w-[1250px] mx-auto">
            <div
              className="rounded-none md:rounded-2xl pt-4 md:py-6 md:px-0"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              <nav
                className="text-sm text-gray-600 dark:text-gray-400 mb-3"
                aria-label="Breadcrumb"
              >
                <Link href="/" className="hover:underline">
                  Acasă
                </Link>
                <span className="mx-2">/</span>
                <Link href="/anunturi" className="hover:underline">
                  Anunțuri
                </Link>
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">
                  Anunț indisponibil
                </span>
              </nav>

              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                Anunțul nu a fost găsit
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Anunțul pe care încerci să îl accesezi nu mai este disponibil
                sau ID-ul nu este valid. Te rugăm să revii la lista de
                anunțuri.
              </p>
              <Link
                href="/anunturi"
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#C25A2B" }}
              >
                Înapoi la anunțuri
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const locationText =
    anunt.tags.find((t) => t.includes("Sector")) ??
    anunt.tags.find((t) => t.toLowerCase().includes("centru")) ??
    "București";
  const formatHistoryDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("ro-RO") : "N/A";
  const priceHistory = [
    {
      date: formatHistoryDate(anunt.createdAt),
      event: "Listat pentru vânzare",
      price: anunt.pret,
      pricePerMp:
        anunt.suprafataUtil !== undefined && anunt.pret
          ? `${Math.round(parsePretToNumber(anunt.pret) / anunt.suprafataUtil).toLocaleString("ro-RO")} €/m²`
          : undefined,
    },
  ];
  if (anunt.updatedAt && anunt.updatedAt !== anunt.createdAt) {
    priceHistory.push({
      date: formatHistoryDate(anunt.updatedAt),
      event: "Actualizare anunț",
      price: anunt.pret,
      pricePerMp:
        anunt.suprafataUtil !== undefined && anunt.pret
          ? `${Math.round(parsePretToNumber(anunt.pret) / anunt.suprafataUtil).toLocaleString("ro-RO")} €/m²`
          : undefined,
    });
  }

  return (
    <div className="min-h-screen text-foreground">
      <Navbar />

      <main className="pt-20 md:pt-24 px-4 md:px-0 pb-6 md:pb-0">
        <div className="w-full max-w-[1250px] mx-auto">
          <div
            className="rounded-none md:rounded-2xl pt-4 md:py-6 md:px-0"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            {/* Breadcrumbs */}
            <nav
              className="text-sm text-gray-600 dark:text-gray-400 mb-3"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:underline">
                Acasă
              </Link>
              <span className="mx-2">/</span>
              <Link href="/anunturi" className="hover:underline">
                Anunțuri
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">
                {anunt.titlu}
              </span>
            </nav>

            {/* Titlu + locație */}
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                {anunt.titlu}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                <div className="flex items-center gap-1.5">
                  <MdLocationOn size={18} />
                  <span>{locationText}</span>
                </div>
                <span className="hidden md:inline-block text-gray-400">•</span>
                <ListingMapModal
                  id={anunt.id}
                  titlu={anunt.titlu}
                  lat={anunt.lat}
                  lng={anunt.lng}
                />
              </div>
            </div>

            {/* Galerie imagini cu filtrare pe camere */}
            <RoomGallery
              images={roomImages}
              titlu={anunt.titlu}
              anuntId={anunt.id}
            />

            {/* Conținut principal: preț + specificații + descriere */}
            <section className="space-y-6 md:space-y-8 mb-0">
              {/* Preț + Oferte primite */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-2xl md:text-3xl font-bold">
                  {anunt.pret}
                </div>
                <AnuntOffersModal anuntId={anunt.id} />
              </div>

              {/* Carduri cu detalii + Contact card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 md:items-stretch">
                {/* Carduri cu detalii */}
                <div className="md:col-span-2 flex flex-col gap-6 md:h-full">
                  {(anunt.dormitoare !== undefined || anunt.bai !== undefined || anunt.suprafataUtil !== undefined) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                      {anunt.dormitoare !== undefined && (
                        <GlassSpecCard
                          icon={<MdBed className="text-[#C25A2B] text-xl md:text-2xl mb-2" />}
                          value={anunt.dormitoare}
                          label="Dormitoare"
                        />
                      )}
                      {anunt.bai !== undefined && (
                        <GlassSpecCard
                          icon={<MdBathroom className="text-[#C25A2B] text-xl md:text-2xl mb-2" />}
                          value={anunt.bai}
                          label="Băi"
                        />
                      )}
                      {anunt.suprafataUtil !== undefined && (
                        <GlassSpecCard
                          icon={<MdSquareFoot className="text-[#C25A2B] text-xl md:text-2xl mb-2" />}
                          value={`${anunt.suprafataUtil} m²`}
                          label="Suprafață utilă"
                        />
                      )}
                      {anunt.etaj !== undefined && (
                        <GlassSpecCard
                          icon={<MdLayers className="text-[#C25A2B] text-xl md:text-2xl mb-2" />}
                          value={typeof anunt.etaj === 'number' ? `Etaj ${anunt.etaj}` : anunt.etaj}
                          label="Etaj"
                        />
                      )}
                      {anunt.anConstructie !== undefined && (
                        <GlassSpecCard
                          icon={<MdCalendarToday className="text-[#C25A2B] text-xl md:text-2xl mb-2" />}
                          value={anunt.anConstructie}
                          label="An construcție"
                        />
                      )}
                      {anunt.suprafataUtil !== undefined && anunt.pret && (
                        <GlassSpecCard
                          icon={<MdAttachMoney className="text-[#C25A2B] text-xl md:text-2xl mb-2" />}
                          value={`${Math.round(parsePretToNumber(anunt.pret) / anunt.suprafataUtil).toLocaleString("ro-RO")} €/m²`}
                          label="Preț pe m²"
                        />
                      )}
                    </div>
                  )}

                  <GlassStatsCard className="flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col space-y-6 md:space-y-8">
                      {/* Descriere completă */}
                      <div>
                        <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold mb-2">
                          <MdDescription className="text-[#C25A2B]" />
                          Descriere
                        </h2>
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          Acest anunț este un exemplu realist pentru prezentarea
                          proprietăților în București. Poți folosi această secțiune
                          pentru a evidenția avantajele principale ale locuinței:
                          compartimentare, lumină naturală, finisaje, acces la
                          transport, magazine și zone verzi. Poți extinde ulterior
                          descrierea cu informații despre anul construcției, tipul de
                          încălzire, costurile lunare estimate și orice alte detalii
                          relevante pentru chiriași sau cumpărători.
                        </p>
                      </div>

                      {/* Detalii și caracteristici */}
                      <div>
                        <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold mb-4">
                          <MdInfo className="text-[#C25A2B]" />
                          Detalii și caracteristici
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-sm">
                          {/* Coloana stânga */}
                          <div className="space-y-3">
                            <div className="flex items-baseline justify-between border-t border-gray-200/40 dark:border-gray-700/60 pt-2 first:pt-0 first:border-t-0">
                              <span className="text-gray-600 dark:text-gray-400">
                                Suprafață utilă totală
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {anunt.suprafataUtil ? `${anunt.suprafataUtil} m²` : "-"}
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between border-t border-gray-200/40 dark:border-gray-700/60 pt-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                Nr. băi
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {anunt.bai ?? "-"}
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between border-t border-gray-200/40 dark:border-gray-700/60 pt-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                Tip imobil
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                Bloc de apartamente
                              </span>
                            </div>
                          </div>

                          {/* Coloana dreapta */}
                          <div className="space-y-3">
                            <div className="flex items-baseline justify-between border-t border-gray-200/40 dark:border-gray-700/60 pt-2 first:pt-0 first:border-t-0">
                              <span className="text-gray-600 dark:text-gray-400">
                                Suprafață construită
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {anunt.suprafataUtil ? `${anunt.suprafataUtil + 10} m²` : "-"}
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between border-t border-gray-200/40 dark:border-gray-700/60 pt-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                Structură rezistență
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                Beton
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between border-t border-gray-200/40 dark:border-gray-700/60 pt-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                Regim înălțime
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                P+10E
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassStatsCard>

                  {/* Component expandabil pentru Istoric prețuri, Calitate transport și Școli */}
                  <AnuntDetailsExpanded 
                    anunt={anunt} 
                    pretPerMp={anunt.suprafataUtil !== undefined && anunt.pret ? `${Math.round(parsePretToNumber(anunt.pret) / anunt.suprafataUtil).toLocaleString("ro-RO")} €/m²` : undefined}
                    priceHistory={priceHistory}
                  />
                </div>

                {/* Col dreapta: Contact card - doar pe desktop */}
                <aside className="flex flex-col md:flex-col">
                  <div className="hidden md:block mb-4">
                    <AgentContactCard anunt={anunt} />
                  </div>

                  {/* Harta mică - pe mobile apare primul */}
                  {anunt.lat !== undefined && anunt.lng !== undefined && (
                    <div className="order-1 md:order-2 mb-4">
                      <SmallMapPreview
                        id={anunt.id}
                        titlu={anunt.titlu}
                        lat={anunt.lat}
                        lng={anunt.lng}
                      />
                    </div>
                  )}

                  {/* Cardul cu statistici - pe mobile apare al doilea */}
                  <div className="order-2 md:order-1 md:mb-4">
                    <GlassStatsCard>
                      {anunt.zilePostat !== undefined && (
                        <div className="relative z-2 flex items-center gap-3">
                          <MdAccessTime className="text-gray-500 dark:text-gray-400 text-lg shrink-0" />
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Postat acum {anunt.zilePostat} {anunt.zilePostat === 1 ? 'zi' : 'zile'}
                          </div>
                        </div>
                      )}
                      {anunt.zilePostat !== undefined && (anunt.vizualizari !== undefined || anunt.favorite !== undefined) && (
                        <GlassDivider />
                      )}
                      {anunt.vizualizari !== undefined && (
                        <div className="relative z-2 flex items-center gap-3">
                          <MdVisibility className="text-gray-500 dark:text-gray-400 text-lg shrink-0" />
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {anunt.vizualizari.toLocaleString("ro-RO")} vizualizări
                          </div>
                        </div>
                      )}
                      {anunt.vizualizari !== undefined && anunt.favorite !== undefined && (
                        <GlassDivider />
                      )}
                      {anunt.favorite !== undefined && (
                        <div className="relative z-2 flex items-center gap-3">
                          <MdFavorite className="text-gray-500 dark:text-gray-400 text-lg shrink-0" />
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {anunt.favorite} favorite
                          </div>
                        </div>
                      )}
                    </GlassStatsCard>
                  </div>
                </aside>
              </div>
            </section>
            
          </div>
        </div>
      </main>

      {/* Anunțuri similare – full width pe mobile */}
      <SimilarListingsCarousel anunt={anunt} basePath="/anunturi" />

      <Footer />

      {/* Bara fixă pentru mobile cu info agent */}
      <AgentMobileBar anunt={anunt} />
    </div>
  );
}
