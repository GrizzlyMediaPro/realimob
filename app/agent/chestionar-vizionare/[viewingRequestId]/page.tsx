"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ViewingQuestionnaireForm from "@/app/components/ViewingQuestionnaireForm";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AgentChestionarVizionarePage() {
  const params = useParams();
  const viewingRequestId = String(params.viewingRequestId ?? "");

  return (
    <div className="min-h-screen text-foreground pt-20">
      <Navbar />
      <main className="w-full max-w-xl mx-auto px-4 py-10 md:py-14">
        <Link
          href="/agent"
          className="text-sm text-[#C25A2B] hover:underline mb-6 inline-block"
        >
          ← Înapoi la panoul agent
        </Link>
        <h1
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          Chestionar după vizionare
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Completează evaluarea vizionării; poți înregistra și o ofertă din partea ta
          (va apărea direct ca ofertă confirmată pe anunț).
        </p>
        <ViewingQuestionnaireForm
          viewingRequestId={viewingRequestId}
          backHref="/agent"
          backLabel="Înapoi la panoul agent"
        />
      </main>
      <Footer />
    </div>
  );
}
