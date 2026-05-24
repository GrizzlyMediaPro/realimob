import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TermsContent from "./TermsContent";

import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Termeni și condiții",
  description:
    "Termeni și condiții generale de utilizare a platformei Realimob — drepturi, obligații și reguli pentru utilizatori și agenți imobiliari.",
  path: "/termeni-si-conditii",
});

export default function TermeniSiConditiiPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-[980px] px-4 pt-28 pb-12 md:px-8">
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          Termeni și condiții
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Data ultimei actualizări: 21 mai 2026
        </p>

        <TermsContent />
      </main>
      <Footer />
    </div>
  );
}
