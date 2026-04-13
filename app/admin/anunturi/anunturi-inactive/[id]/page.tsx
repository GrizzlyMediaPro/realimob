import Link from "next/link";
import { MdLocationOn, MdBed, MdBathroom, MdSquareFoot, MdLayers, MdCalendarToday, MdAttachMoney, MdArrowBack, MdCancel } from "react-icons/md";

import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { getAnuntById, getRoomImages, parsePretToNumber } from "../../../../../lib/anunturiData";
import RoomGallery from "../../../../components/RoomGallery";

type AnuntPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type DeactivationReason =
  | "A trecut prea mult timp"
  | "Vandut"
  | "Dezactivat utilizator"
  | "Dezactivat admin";

// Simulăm motivul dezactivării pentru anunțuri inactive
const getDeactivationReason = (id: string): DeactivationReason => {
  const reasons: DeactivationReason[] = [
    "A trecut prea mult timp",
    "Vandut",
    "Dezactivat utilizator",
    "Dezactivat admin",
  ];
  const index = parseInt(id.replace("anunt-", "")) || 0;
  return reasons[index % 4];
};

const getDeactivationReasonColor = (reason: DeactivationReason): {
  background: string;
  color: string;
} => {
  switch (reason) {
    case "A trecut prea mult timp":
      return {
        background: "rgba(245, 158, 11, 0.15)",
        color: "#F59E0B",
      };
    case "Vandut":
      return {
        background: "rgba(16, 185, 129, 0.15)",
        color: "#10B981",
      };
    case "Dezactivat utilizator":
      return {
        background: "rgba(59, 130, 246, 0.15)",
        color: "#3B82F6",
      };
    case "Dezactivat admin":
      return {
        background: "rgba(239, 68, 68, 0.15)",
        color: "#EF4444",
      };
    default:
      return {
        background: "rgba(239, 68, 68, 0.15)",
        color: "#EF4444",
      };
  }
};

export default async function AdminAnuntInactivePage({
  params,
}: AnuntPageProps) {
  const { id } = await params;
  const anunt = getAnuntById(id);

  if (!anunt) {
    return (
      <div className="min-h-screen text-foreground">
        <Navbar />
        <main className="pt-20 md:pt-24 px-4 md:px-0">
          <div className="w-full max-w-[1250px] mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Anunțul nu a fost găsit
            </h1>
            <Link
              href="/admin/anunturi"
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#C25A2B" }}
            >
              Înapoi la anunțuri
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const roomImages = getRoomImages(anunt.id, anunt.image);
  const locationText =
    anunt.tags.find((t) => t.includes("Sector")) ??
    anunt.tags.find((t) => t.toLowerCase().includes("centru")) ??
    "București";
  const deactivationReason = getDeactivationReason(anunt.id);
  const reasonColor = getDeactivationReasonColor(deactivationReason);

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
              <Link href="/admin" className="hover:underline">
                Admin
              </Link>
              <span className="mx-2">/</span>
              <Link href="/admin/anunturi" className="hover:underline">
                Anunțuri
              </Link>
              <span className="mx-2">/</span>
              <Link href="/admin/anunturi" className="hover:underline">
                Inactive
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">
                {anunt.titlu}
              </span>
            </nav>

            {/* Back button */}
            <Link
              href="/admin/anunturi"
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors mb-4"
            >
              <MdArrowBack size={20} />
              <span>Înapoi la anunțuri</span>
            </Link>

            {/* Status badge */}
            <div className="mb-4 flex items-center gap-3">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#EF4444",
                }}
              >
                <MdCancel size={18} />
                Anunț Inactiv
              </span>
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium"
                style={reasonColor}
              >
                {deactivationReason}
              </span>
            </div>

            {/* Titlu + locație */}
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                {anunt.titlu}
              </h1>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all mb-2">
                ID anunț: {anunt.id}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                <div className="flex items-center gap-1.5">
                  <MdLocationOn size={18} />
                  <span>{locationText}</span>
                </div>
              </div>
            </div>

            {/* Galerie imagini cu filtrare pe camere */}
            <RoomGallery
              images={roomImages}
              titlu={anunt.titlu}
              anuntId={anunt.id}
            />

            {/* Conținut principal */}
            <section className="space-y-6 md:space-y-8 mb-0">
              {/* Preț */}
              <div className="text-2xl md:text-3xl font-bold">
                {anunt.pret}
              </div>

              {/* Detalii rapide */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {anunt.dormitoare !== undefined && (
                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                    <MdBed className="text-[#C25A2B] text-2xl mb-2 mx-auto" />
                    <div className="text-xl font-bold">{anunt.dormitoare}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Dormitoare
                    </div>
                  </div>
                )}
                {anunt.bai !== undefined && (
                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                    <MdBathroom className="text-[#C25A2B] text-2xl mb-2 mx-auto" />
                    <div className="text-xl font-bold">{anunt.bai}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Băi
                    </div>
                  </div>
                )}
                {anunt.suprafataUtil !== undefined && (
                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                    <MdSquareFoot className="text-[#C25A2B] text-2xl mb-2 mx-auto" />
                    <div className="text-xl font-bold">
                      {anunt.suprafataUtil} m²
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Suprafață utilă
                    </div>
                  </div>
                )}
                {anunt.etaj !== undefined && (
                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                    <MdLayers className="text-[#C25A2B] text-2xl mb-2 mx-auto" />
                    <div className="text-xl font-bold">
                      {typeof anunt.etaj === "number"
                        ? `Etaj ${anunt.etaj}`
                        : anunt.etaj}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Etaj
                    </div>
                  </div>
                )}
                {anunt.anConstructie !== undefined && (
                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                    <MdCalendarToday className="text-[#C25A2B] text-2xl mb-2 mx-auto" />
                    <div className="text-xl font-bold">
                      {anunt.anConstructie}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      An construcție
                    </div>
                  </div>
                )}
                {anunt.suprafataUtil !== undefined && anunt.pret && (
                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                    <MdAttachMoney className="text-[#C25A2B] text-2xl mb-2 mx-auto" />
                    <div className="text-xl font-bold">
                      {Math.round(
                        parsePretToNumber(anunt.pret) / anunt.suprafataUtil
                      ).toLocaleString("ro-RO")}{" "}
                      €/m²
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Preț pe m²
                    </div>
                  </div>
                )}
              </div>

              {/* Descriere completă */} 
              <div className="space-y-3">
                <h2 className="text-lg md:text-xl font-semibold">
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

              {/* Detalii și caracteristici suplimentare */}
              <div className="space-y-4">
                <h2 className="text-lg md:text-xl font-semibold">
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
                        {anunt.suprafataUtil
                          ? `${anunt.suprafataUtil} m²`
                          : "-"}
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
                        {anunt.suprafataUtil
                          ? `${anunt.suprafataUtil + 10} m²`
                          : "-"}
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

              {/* Informații admin */}
              <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <h3 className="text-lg font-semibold mb-2">Informații Admin</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      ID Anunț:
                    </span>
                    <span className="font-medium">{anunt.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      Inactiv
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Motiv dezactivare:
                    </span>
                    <span className="font-medium" style={{ color: reasonColor.color }}>
                      {deactivationReason}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Data creării:
                    </span>
                    <span className="font-medium">
                      {new Date(anunt.createdAt).toLocaleDateString("ro-RO")}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
