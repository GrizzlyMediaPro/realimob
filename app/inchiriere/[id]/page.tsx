import Link from "next/link";
import { MdLocationOn, MdBed, MdBathroom, MdSquareFoot, MdLayers, MdCalendarToday, MdAttachMoney, MdAccessTime, MdVisibility, MdFavorite, MdDirectionsWalk, MdDirectionsTransit, MdDirectionsBike, MdSchool, MdHistory } from "react-icons/md";


import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ListingMapModal from "../../components/ListingMapModal";
import SmallMapPreview from "../../components/SmallMapPreview";
import { GlassSpecCard, GlassStatsCard, GlassDivider } from "../../components/LiquidGlassCards";
import AnuntDetailsExpanded from "../../components/AnuntDetailsExpanded";
import AnuntOffersModal from "../../components/AnuntOffersModal";
import ListingFavoriteButton from "../../components/ListingFavoriteButton";
import { AgentMobileBar } from "../../components/AgentContactCard";
import SimilarListingsCarousel from "../../components/SimilarListingsCarousel";
import AgentContactCard from "../../components/AgentContactCard";
import PropertyDetailsSection from "../../components/PropertyDetailsSection";
import {
  getAnuntById,
  getRoomImages,
  inferCurrencyFromPret,
  parsePretToNumber,
  type Anunt,
  type RoomImage,
} from "../../../lib/anunturiData";
import { estimateMonthlyRentFromSaleAmount } from "../../../lib/estimateMonthlyRent";
import {
  transformListingToAnunt,
  transformImagesToRoomImages,
} from "../../../lib/listingToAnunt";
import RoomGallery from "../../components/RoomGallery";
import ConvertedListingPrice from "../../components/ConvertedListingPrice";
import ListingDescriptionDisplay from "../../components/ListingDescriptionDisplay";
import { prisma } from "../../../lib/prisma";

type AnuntPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Funcție helper pentru a formata prețul ca "X €/lună"
const formatPretLuna = (pret: string): string => {
  const pretVanzare = parsePretToNumber(pret);
  let factor = 120;
  if (pretVanzare < 50000) factor = 100;
  if (pretVanzare > 150000) factor = 150;
  
  const chirie = Math.round(pretVanzare / factor);
  const chirieFinala = Math.max(300, Math.min(2000, chirie));
  
  return `${chirieFinala.toLocaleString("ro-RO")} €/lună`;
};

export default async function InchiriereAnuntPage({ params }: AnuntPageProps) {
  const { id } = await params;
  let anunt: (Anunt & { description?: string; dbDetails?: any }) | null =
    getAnuntById(id) ?? null;
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
                <Link href="/inchiriere" className="hover:underline">
                  Închiriere
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
                href="/inchiriere"
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
  const saleAmount =
    anunt.priceAmount ?? parsePretToNumber(anunt.pret);
  const saleCurrency =
    anunt.priceCurrency ?? inferCurrencyFromPret(anunt.pret);
  const rentAmount = estimateMonthlyRentFromSaleAmount(saleAmount);
  const pretLuna = formatPretLuna(anunt.pret);
  const rentPerMpAmount =
    anunt.suprafataUtil !== undefined && anunt.suprafataUtil > 0
      ? Math.round(rentAmount / anunt.suprafataUtil)
      : undefined;
  const pretPerMpLuna =
    rentPerMpAmount !== undefined
      ? `${rentPerMpAmount.toLocaleString("ro-RO")} ${saleCurrency === "EUR" ? "€" : saleCurrency}/m²`
      : undefined;
  const formatHistoryDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("ro-RO") : "N/A";
  const priceHistory = [
    {
      date: formatHistoryDate(anunt.createdAt),
      event: "Listat pentru închiriere",
      price: pretLuna,
      pricePerMp: pretPerMpLuna,
      priceAmount: rentAmount,
      priceCurrency: saleCurrency,
      pricePerMpAmount: rentPerMpAmount,
    },
  ];
  if (anunt.updatedAt && anunt.updatedAt !== anunt.createdAt) {
    priceHistory.push({
      date: formatHistoryDate(anunt.updatedAt),
      event: "Actualizare anunț",
      price: pretLuna,
      pricePerMp: pretPerMpLuna,
      priceAmount: rentAmount,
      priceCurrency: saleCurrency,
      pricePerMpAmount: rentPerMpAmount,
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
              <Link href="/inchiriere" className="hover:underline">
                Închiriere
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
                  pret={pretLuna}
                  image={anunt.image}
                  descriere={
                    anunt.tags.length > 0
                      ? anunt.tags.join(" • ")
                      : locationText
                  }
                  routePath={`/inchiriere/${anunt.id}`}
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
              {/* Preț + favorite (mobile) / preț + favorite + oferte (md+) */}
              <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_auto] gap-3 items-center">
                <div className="text-2xl md:text-3xl font-bold min-w-0 row-start-1 col-start-1">
                  <ConvertedListingPrice
                    amount={rentAmount}
                    fromCurrency={saleCurrency}
                    fallback={pretLuna}
                    suffix=" / lună"
                  />
                </div>
                <ListingFavoriteButton
                  anuntId={anunt.id}
                  className="row-start-1 col-start-2 justify-self-end md:justify-self-start"
                />
                <div className="row-start-2 col-span-2 md:row-start-1 md:col-span-1 md:col-start-3 w-full min-w-0 md:flex md:justify-end">
                  <AnuntOffersModal anuntId={anunt.id} />
                </div>
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
                      {anunt.suprafataUtil !== undefined &&
                        anunt.pret &&
                        rentPerMpAmount !== undefined && (
                        <GlassSpecCard
                          icon={<MdAttachMoney className="text-[#C25A2B] text-xl md:text-2xl mb-2" />}
                          value={
                            <ConvertedListingPrice
                              amount={rentPerMpAmount}
                              fromCurrency={saleCurrency}
                              fallback={pretPerMpLuna ?? "—"}
                              suffix="/m²"
                            />
                          }
                          label="Preț pe m²"
                        />
                      )}
                    </div>
                  )}

                  <GlassStatsCard className="flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col space-y-6 md:space-y-8">
                      {/* Descriere completă */}
                        <div>
                          <h2 className="text-lg md:text-xl font-semibold mb-2">
                            Descriere
                          </h2>
                          <ListingDescriptionDisplay
                            html={(anunt as any).description}
                            fallback="Acest anunț este un exemplu realist pentru prezentarea proprietăților în București. Poți folosi această secțiune pentru a evidenția avantajele principale ale locuinței: compartimentare, lumină naturală, finisaje, acces la transport, magazine și zone verzi."
                          />
                        </div>
                      </div>
                  </GlassStatsCard>

                  {/* Detalii proprietate din DB */}
                  {(anunt as any).dbDetails ? (
                    <PropertyDetailsSection details={(anunt as any).dbDetails} />
                  ) : (
                    <PropertyDetailsSection details={{
                      tipProprietate: "Apartament",
                      suprafataUtila: anunt.suprafataUtil,
                      camere: anunt.dormitoare,
                      nrBai: anunt.bai,
                      etaj: anunt.etaj,
                      anConstructie: anunt.anConstructie,
                    }} />
                  )}

                  {/* Component expandabil pentru Istoric prețuri, Calitate transport și Școli */}
                  <AnuntDetailsExpanded 
                    anunt={anunt} 
                    pretPerMp={pretPerMpLuna}
                    isInchiriere={true}
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
                        pret={pretLuna}
                        image={anunt.image}
                        descriere={
                          anunt.tags.length > 0
                            ? anunt.tags.join(" • ")
                            : locationText
                        }
                        routePath={`/inchiriere/${anunt.id}`}
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
      <SimilarListingsCarousel anunt={anunt} isInchiriere basePath="/inchiriere" />

      <Footer />

      {/* Bara fixă pentru mobile cu info agent */}
      <AgentMobileBar anunt={anunt} />
    </div>
  );
}
