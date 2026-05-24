import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import HeroFilter from "./components/HeroFilter";
import Categorii from "./components/Categorii";
import CategoriiPopulare from "./components/CategoriiPopulare";
import AnunturiNoi from "./components/AnunturiNoi";
import ColaboratoriSection from "./components/ColaboratoriSection";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import JsonLd from "./components/JsonLd";
import { SITE_TAGLINE, buildPageMetadata, getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Imobiliare București — apartamente de vânzare și închiriat",
  description:
    "Găsește apartamente, case și spații comerciale în București. Anunțuri imobiliare verificate, hartă interactivă și agenți Realimob. " +
    SITE_TAGLINE,
  path: "/",
});

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Realimob",
  url: getSiteUrl(),
  description:
    "Platformă imobiliară din București pentru vânzare și închiriere — apartamente, case, spații comerciale.",
  inLanguage: "ro-RO",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${getSiteUrl()}/anunturi?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen text-foreground">
      <JsonLd data={websiteJsonLd} />
      <Navbar />
      <HeroSection />
      {/* HeroFilter pe mobil */}
      <div className="md:hidden py-6">
        <HeroFilter />
      </div>
      <Categorii />
      <CategoriiPopulare />
      <AnunturiNoi />
      <ColaboratoriSection />
      <Newsletter />
      <Footer />
    </div>
  );
}
