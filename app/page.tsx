import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import HeroFilter from "./components/HeroFilter";
import CategoriiPopulare from "./components/CategoriiPopulare";
import AnunturiNoi from "./components/AnunturiNoi";
import Newsletter from "./components/Newsletter";
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
      <Newsletter />
      <Footer />
    </div>
  );
}
