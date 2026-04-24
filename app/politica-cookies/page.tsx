import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Politica Cookies | Real Imob",
};

export default function PoliticaCookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-[980px] px-4 pt-28 pb-12 md:px-8">
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          Politica cookies Real Imob
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Data ultimei actualizari: 24 aprilie 2026
        </p>

        <section className="space-y-5 text-sm md:text-base leading-7">
          <p>
            Real Imob foloseste cookies si tehnologii similare pentru functionarea
            corecta a platformei, analiza traficului si imbunatatirea experientei.
          </p>
          <p>
            Cookies esentiale sunt necesare pentru autentificare, securitate si
            functionalitati de baza. Fara acestea, platforma poate functiona limitat.
          </p>
          <p>
            Cookies de analiza ne ajuta sa intelegem modul de folosire a platformei,
            iar cookies de marketing pot fi folosite doar cu acordul explicit al
            utilizatorului, unde este aplicabil.
          </p>
          <p>
            Utilizatorii isi pot modifica preferintele cookies din setarile browserului
            sau din mecanismele de consimtamant afisate in platforma.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
