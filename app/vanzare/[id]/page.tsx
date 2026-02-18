import Image from "next/image";
import Link from "next/link";
import { MdLocationOn, MdBed, MdBathroom, MdSquareFoot, MdLayers, MdCalendarToday, MdAttachMoney, MdAccessTime, MdVisibility, MdFavorite } from "react-icons/md";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ListingMapModal from "../../components/ListingMapModal";
import SmallMapPreview from "../../components/SmallMapPreview";
import { getAnuntById, getImageCount, parsePretToNumber } from "../../../lib/anunturiData";

type AnuntPageProps = {
  // În Next.js 16 `params` este o Promise și trebuie „await”-uită.
  params: Promise<{
    id: string;
  }>;
};

const getGalleryImages = (image: string, count: number) => {
  // momentan folosim aceeași imagine replicată pentru layout
  return Array.from({ length: count }, () => image);
};

export default async function VanzareAnuntPage({ params }: AnuntPageProps) {
  const { id } = await params;
  const anunt = getAnuntById(id);

  if (!anunt) {
    return (
      <div className="min-h-screen bg-background text-foreground">
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
                <Link href="/vanzare" className="hover:underline">
                  Vânzare
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
                href="/vanzare"
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-20 md:pt-24 px-4 md:px-0">
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
              <Link href="/vanzare" className="hover:underline">
                Vânzare
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

            {/* Galerie imagini - layout inspirat din screenshot */}
            <section className="mb-6 md:mb-8">
              {/* Imagine mare */}
              <div className="w-full max-w-[1250px] mx-auto aspect-[16/9] md:rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 relative">
                <Image
                  src={galleryImages[0]}
                  alt={anunt.titlu}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1250px"
                />
              </div>

              {/* Thumbnails */}
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
            <section className="space-y-6 md:space-y-8">
              {/* Preț - full width */}
              <div className="text-2xl md:text-3xl font-bold">
                {anunt.pret}
              </div>

              {/* Carduri cu detalii + Contact card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Carduri cu detalii */}
                <div className="md:col-span-2 space-y-6">
                  {(anunt.dormitoare !== undefined || anunt.bai !== undefined || anunt.suprafataUtil !== undefined) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                      {anunt.dormitoare !== undefined && (
                        <div className="rounded-xl border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] px-3 py-3 flex flex-col items-center text-center">
                          <MdBed className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                          <div className="font-semibold text-foreground text-sm md:text-base">
                            {anunt.dormitoare}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Dormitoare
                          </div>
                        </div>
                      )}
                      {anunt.bai !== undefined && (
                        <div className="rounded-xl border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] px-3 py-3 flex flex-col items-center text-center">
                          <MdBathroom className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                          <div className="font-semibold text-foreground text-sm md:text-base">
                            {anunt.bai}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Băi
                          </div>
                        </div>
                      )}
                      {anunt.suprafataUtil !== undefined && (
                        <div className="rounded-xl border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] px-3 py-3 flex flex-col items-center text-center">
                          <MdSquareFoot className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                          <div className="font-semibold text-foreground text-sm md:text-base">
                            {anunt.suprafataUtil} m²
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Suprafață utilă
                          </div>
                        </div>
                      )}
                      {anunt.etaj !== undefined && (
                        <div className="rounded-xl border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] px-3 py-3 flex flex-col items-center text-center">
                          <MdLayers className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                          <div className="font-semibold text-foreground text-sm md:text-base">
                            {typeof anunt.etaj === 'number' ? `Etaj ${anunt.etaj}` : anunt.etaj}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Etaj
                          </div>
                        </div>
                      )}
                      {anunt.anConstructie !== undefined && (
                        <div className="rounded-xl border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] px-3 py-3 flex flex-col items-center text-center">
                          <MdCalendarToday className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                          <div className="font-semibold text-foreground text-sm md:text-base">
                            {anunt.anConstructie}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            An construcție
                          </div>
                        </div>
                      )}
                      {anunt.suprafataUtil !== undefined && anunt.pret && (
                        <div className="rounded-xl border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] px-3 py-3 flex flex-col items-center text-center">
                          <MdAttachMoney className="text-[#C25A2B] text-xl md:text-2xl mb-2" />
                          <div className="font-semibold text-foreground text-sm md:text-base">
                            {Math.round(parsePretToNumber(anunt.pret) / anunt.suprafataUtil).toLocaleString("ro-RO")} €/m²
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Preț pe m²
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Descriere completă */}
                  <div className="mt-4 md:mt-6">
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
                </div>

                {/* Col dreapta: Contact card */}
                <aside className="space-y-4">
                  <div className="rounded-2xl border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] p-4 space-y-3">
                    <div className="text-sm text-gray-500">Contact agent</div>
                    <div className="text-lg font-semibold">
                      Programare vizionare
                    </div>
                    <button
                      type="button"
                      className="w-full mt-2 px-4 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#C25A2B" }}
                    >
                      Sună acum
                    </button>
                    <button
                      type="button"
                      className="w-full px-4 py-2.5 rounded-lg border border-[#d5dae0] dark:border-[#2b2b33] hover:opacity-90 transition-opacity text-sm"
                    >
                      Trimite mesaj
                    </button>
                  </div>

                  <div className="rounded-2xl border border-dashed border-gray-400 dark:border-[#2b2b33] bg-background p-4 space-y-3">
                    {anunt.zilePostat !== undefined && (
                      <div className="flex items-center gap-3">
                        <MdAccessTime className="text-gray-500 dark:text-gray-400 text-lg shrink-0" />
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Postat acum {anunt.zilePostat} {anunt.zilePostat === 1 ? 'zi' : 'zile'}
                        </div>
                      </div>
                    )}
                    {anunt.zilePostat !== undefined && (anunt.vizualizari !== undefined || anunt.favorite !== undefined) && (
                      <div className="border-t border-gray-300 dark:border-gray-600"></div>
                    )}
                    {anunt.vizualizari !== undefined && (
                      <div className="flex items-center gap-3">
                        <MdVisibility className="text-gray-500 dark:text-gray-400 text-lg shrink-0" />
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {anunt.vizualizari.toLocaleString("ro-RO")} vizualizări
                        </div>
                      </div>
                    )}
                    {anunt.vizualizari !== undefined && anunt.favorite !== undefined && (
                      <div className="border-t border-gray-300 dark:border-gray-600"></div>
                    )}
                    {anunt.favorite !== undefined && (
                      <div className="flex items-center gap-3">
                        <MdFavorite className="text-gray-500 dark:text-gray-400 text-lg shrink-0" />
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {anunt.favorite} favorite
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Harta mică */}
                  {anunt.lat !== undefined && anunt.lng !== undefined && (
                    <SmallMapPreview
                      id={anunt.id}
                      titlu={anunt.titlu}
                      lat={anunt.lat}
                      lng={anunt.lng}
                    />
                  )}
                </aside>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
