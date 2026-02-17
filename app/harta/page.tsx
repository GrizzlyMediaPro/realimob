"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllAnunturi } from "../../lib/anunturiData";

const BucharestMap = dynamic(() => import("../components/BucharestMap"), {
  ssr: false,
});

function HartaContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const allAnunturi = useMemo(() => {
    return getAllAnunturi();
  }, []);

  const mapMarkers = useMemo(
    () =>
      allAnunturi
        .filter((a) => typeof a.lat === "number" && typeof a.lng === "number")
        .map((a) => ({
          id: a.id,
          titlu: a.titlu,
          lat: a.lat as number,
          lng: a.lng as number,
          descriere: a.tags.join(" • "),
          pret: a.pret,
        })),
    [allAnunturi]
  );

  return (
    <main className="flex-1 w-full min-h-0 flex flex-col">
      <div className="w-full px-4 md:px-8 pt-20 md:pt-24 pb-2">
        <div className="w-full max-w-[1250px] mx-auto">
          <nav className="text-sm text-gray-600 dark:text-gray-400" aria-label="Breadcrumb" style={{ fontFamily: "var(--font-galak-regular)" }}>
            <a href="/" className="hover:underline">Acasă</a>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">Hartă</span>
          </nav>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        <BucharestMap
          markers={mapMarkers}
          initialSelectedId={selectedId}
          showControls={true}
          fullscreen={true}
        />
      </div>
    </main>
  );
}

export default function HartaPage() {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Se încarcă harta...</div>}>
        <HartaContent />
      </Suspense>
      <Footer />
    </div>
  );
}
