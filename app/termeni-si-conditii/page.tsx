import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Termeni si Conditii | Real Imob",
};

export default function TermeniSiConditiiPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-[980px] px-4 pt-28 pb-12 md:px-8">
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          Termeni si conditii Real Imob
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Data ultimei actualizari: 24 aprilie 2026
        </p>

        <section className="space-y-5 text-sm md:text-base leading-7">
          <p>
            Acest document stabileste conditiile in care platforma Real Imob poate
            fi utilizata de catre persoane fizice si juridice pentru cautarea,
            publicarea si administrarea anunturilor imobiliare.
          </p>
          <p>
            Prin accesarea platformei, utilizatorul confirma ca a citit, a inteles
            si accepta acesti termeni, impreuna cu Politica de confidentialitate si
            Politica cookies.
          </p>
          <p>
            Utilizatorul este responsabil pentru corectitudinea continutului
            publicat. Real Imob isi rezerva dreptul de a modifica, suspenda sau
            elimina continut care incalca legea, drepturile tertilor sau regulile
            platformei.
          </p>
          <p>
            Real Imob nu este parte in tranzactiile dintre utilizatori, proprietari,
            agenti sau alti colaboratori. Platforma ofera exclusiv infrastructura
            tehnica pentru listare si comunicare.
          </p>
          <p>
            Ne rezervam dreptul de a actualiza acesti termeni oricand. Modificarile
            devin aplicabile de la publicarea lor pe aceasta pagina.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
