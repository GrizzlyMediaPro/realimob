import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import HeroFilter from "./components/HeroFilter";
import CategoriiPopulare from "./components/CategoriiPopulare";
import AnunturiNoi from "./components/AnunturiNoi";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      {/* HeroFilter pe mobil */}
      <div className="md:hidden py-6">
        <HeroFilter />
      </div>
      <CategoriiPopulare />
      <AnunturiNoi />
      <main className="px-8 py-10">{/* Conținutul paginii va veni ulterior */}</main>
      <Footer />
    </div>
  );
}
