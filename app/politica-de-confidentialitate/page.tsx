import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Politica de Confidentialitate | Real Imob",
};

export default function PoliticaConfidentialitatePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-[980px] px-4 pt-28 pb-12 md:px-8">
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          Politica de confidentialitate Real Imob
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Data ultimei actualizari: 24 aprilie 2026
        </p>

        <section className="space-y-5 text-sm md:text-base leading-7">
          <p>
            Real Imob prelucreaza date personale pentru furnizarea serviciilor
            platformei: creare cont, publicare anunturi, comunicare intre utilizatori
            si suport tehnic.
          </p>
          <p>
            Datele colectate pot include nume, email, telefon, date de autentificare,
            date de utilizare a platformei si informatii transmise in formulare.
          </p>
          <p>
            Prelucrarea se face in baza executarii contractului, interesului legitim
            si, unde este necesar, pe baza consimtamantului utilizatorului.
          </p>
          <p>
            Utilizatorii au dreptul de acces, rectificare, stergere, restrictionare,
            opozitie si portabilitate, in conditiile legii. Cererile se trimit la
            adresa de contact publicata in platforma Real Imob.
          </p>
          <p>
            Real Imob aplica masuri tehnice si organizatorice pentru securitatea
            datelor si nu vinde datele personale catre terte parti.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
