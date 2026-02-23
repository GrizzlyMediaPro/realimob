import Image from "next/image";
import Link from "next/link";
import { MdLocationOn, MdBed, MdBathroom, MdSquareFoot, MdLayers, MdCalendarToday, MdAttachMoney, MdAccessTime, MdVisibility, MdFavorite, MdDirectionsWalk, MdDirectionsTransit, MdDirectionsBike, MdSchool, MdHistory } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ListingMapModal from "../../components/ListingMapModal";
import SmallMapPreview from "../../components/SmallMapPreview";
import { GlassSpecCard, GlassContactCard, GlassCTAButton, GlassStatsCard, GlassDivider } from "../../components/LiquidGlassCards";
import AnuntDetailsExpanded from "../../components/AnuntDetailsExpanded";
import { getAnuntById, getImageCount, parsePretToNumber } from "../../../lib/anunturiData";

type AnuntPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const getGalleryImages = (image: string, count: number) => {
  return Array.from({ length: count }, () => image);
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
  const anunt = getAnuntById(id);

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

  const totalImages = getImageCount(anunt.id);
  const galleryImages = getGalleryImages(anunt.image, Math.max(totalImages, 4));

  const locationText =
    anunt.tags.find((t) => t.includes("Sector")) ??
    anunt.tags.find((t) => t.toLowerCase().includes("centru")) ??
    "București";

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
                />
              </div>
            </div>

            {/* Galerie imagini */}
            <section className="mb-6 md:mb-8">
              <div className="w-full max-w-[1250px] mx-auto aspect-video md:rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 relative">
                <Image
                  src={galleryImages[0]}
                  alt={anunt.titlu}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1250px"
                />
              </div>

              <div className="mt-3 md:mt-4 flex gap-2 md:gap-3 overflow-x-auto pb-1 hide-scrollbar">
                {galleryImages.map((src, index) => (
                  <div
                    key={`${anunt.id}-thumb-${index}`}
                    className="relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0 w-20 h-16 md:w-28 md:h-20 cursor-pointer"
                  >
                    <Image
                      src={src}
                      alt={`${anunt.titlu} imagine ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Conținut principal: specificații + descriere */}
            <section className="space-y-6 md:space-y-8 mb-0">
              {/* Preț */}
              <div className="text-2xl md:text-3xl font-bold">
                {formatPretLuna(anunt.pret)}
              </div>

              {/* Carduri cu detalii + Contact card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Carduri cu detalii */}
                <div className="md:col-span-2 space-y-6">
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
                          value={`${(() => {
                            const pretVanzare = parsePretToNumber(anunt.pret);
                            let factor = 120;
                            if (pretVanzare < 50000) factor = 100;
                            if (pretVanzare > 150000) factor = 150;
                            const chirie = Math.round(pretVanzare / factor);
                            const chirieFinala = Math.max(300, Math.min(2000, chirie));
                            return Math.round(chirieFinala / anunt.suprafataUtil).toLocaleString("ro-RO");
                          })()} €/m²`}
                          label="Preț pe m²"
                        />
                      )}
                    </div>
                  )}

                  <GlassStatsCard>
                    <div className="space-y-6 md:space-y-8">
                      {/* Descriere completă */}
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold mb-2">
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
                        <h2 className="text-lg md:text-xl font-semibold mb-4">
                          Detalii și caracteristici
                        </h2>
                        
                        {/* Interior */}
                        <div className="mb-4">
                      <h3 className="text-base md:text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                        Interior
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Coloana stânga */}
                        <div className="space-y-4">
                          {/* Dormitoare și băi */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Dormitoare și băi
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              {anunt.dormitoare !== undefined && (
                                <div>Dormitoare: {anunt.dormitoare}</div>
                              )}
                              {anunt.bai !== undefined && (
                                <div>Băi: {anunt.bai}</div>
                              )}
                            </div>
                          </div>

                          {/* Încălzire */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Încălzire
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Centrală termică
                            </div>
                          </div>

                          {/* Echipament */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Echipament inclus
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Mașină de spălat, frigider, cuptor, plită
                            </div>
                          </div>
                        </div>

                        {/* Coloana dreapta */}
                        <div className="space-y-4">
                          {/* Caracteristici */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Caracteristici
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <div>Balcon: Da</div>
                              <div>Izolație termică: Da</div>
                              <div>Geamuri termopan: Da</div>
                            </div>
                          </div>

                          {/* Suprafață */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Suprafață
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              {anunt.suprafataUtil !== undefined && (
                                <div>Suprafață utilă: {anunt.suprafataUtil} m²</div>
                              )}
                              <div>Suprafață totală: {anunt.suprafataUtil ? anunt.suprafataUtil + 10 : 'N/A'} m²</div>
                            </div>
                          </div>

                          {/* Stare */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Stare
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Finisat, locuibil
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exterior */}
                    <div className="mt-4">
                      <h3 className="text-base md:text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                        Exterior
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div>Tip clădire: Bloc de locuințe</div>
                          {anunt.etaj !== undefined && (
                            <div>Etaj: {typeof anunt.etaj === 'number' ? `Etaj ${anunt.etaj}` : anunt.etaj}</div>
                          )}
                          {anunt.anConstructie !== undefined && (
                            <div>An construcție: {anunt.anConstructie}</div>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div>Parcare: Disponibilă</div>
                          <div>Lift: Da</div>
                          <div>Acces controlat: Da</div>
                        </div>
                      </div>
                    </div>
                      </div>
                    </div>
                  </GlassStatsCard>

                  {/* Component expandabil pentru Istoric prețuri, Calitate transport și Școli */}
                  <AnuntDetailsExpanded 
                    anunt={anunt} 
                    pretPerMp={anunt.suprafataUtil !== undefined && anunt.pret ? `${Math.round((() => {
                      const pretVanzare = parsePretToNumber(anunt.pret);
                      let factor = 120;
                      if (pretVanzare < 50000) factor = 100;
                      if (pretVanzare > 150000) factor = 150;
                      const chirie = Math.round(pretVanzare / factor);
                      const chirieFinala = Math.max(300, Math.min(2000, chirie));
                      return chirieFinala / anunt.suprafataUtil;
                    })()).toLocaleString("ro-RO")} €/m²` : undefined}
                    isInchiriere={true}
                  />
                </div>

                {/* Col dreapta: Contact card - doar pe desktop */}
                <aside className="flex flex-col md:flex-col">
                  <div className="hidden md:block mb-4">
                    <GlassContactCard>
                      <div className="relative z-2 text-sm text-gray-500 dark:text-gray-400">Contact agent</div>
                      <div className="relative z-2 text-lg font-semibold">
                        Programare vizionare
                      </div>
                      <GlassCTAButton primary>Programează-te acum</GlassCTAButton>
                      <GlassCTAButton>
                        <div className="flex items-center justify-center gap-2">
                          <FaWhatsapp className="text-lg" />
                          <span>Contactează pe WhatsApp</span>
                        </div>
                      </GlassCTAButton>
                    </GlassContactCard>
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

      <Footer />

      {/* Bara fixă pentru mobile cu butoanele de contact */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 p-4 bg-background border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-[1250px] mx-auto space-y-2">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">Contact agent</div>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 px-4 py-3 rounded-2xl text-white font-medium text-sm transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              }}
            >
              Programează-te acum
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                background: "rgba(50, 50, 65, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(30px) saturate(1.5)",
                WebkitBackdropFilter: "blur(30px) saturate(1.5)",
              }}
            >
              <FaWhatsapp className="text-lg text-[#25D366]" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
