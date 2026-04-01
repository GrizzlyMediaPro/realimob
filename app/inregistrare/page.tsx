 "use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CiUser, CiHome } from "react-icons/ci";
import { MdBusinessCenter } from "react-icons/md";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type RolUtilizator = "utilizator" | "agent";

function InregistrarePageInner() {
  const [rolSelectat, setRolSelectat] = useState<RolUtilizator>("utilizator");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registrationsEnabled, setRegistrationsEnabled] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings/public", { cache: "no-store" });
        const data = await res.json();
        setRegistrationsEnabled(data.registrationsEnabled !== false);
      } catch {
        setRegistrationsEnabled(true);
      } finally {
        setSettingsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 flex items-center justify-center">
        <div className="w-full max-w-[480px] mx-auto pt-24 pb-10">
          <div
            className="bg-white dark:bg-[#1B1B21] border border-[#d5dae0] dark:border-[#2b2b33] rounded-2xl shadow-sm px-6 py-7 md:px-8 md:py-9"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            <div className="flex items-center justify-center mb-6">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#F3E9F3] dark:bg-[#2A1F2A] text-[#3B1F3A] dark:text-white mr-2">
                <CiUser size={24} />
              </span>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold leading-tight">
                  Creează-ți cont pe{" "}
                  <span style={{ fontFamily: "var(--font-kursk-medium)" }}>
                    real<span style={{ color: "#C25A2B" }}>i</span>mob
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Alege tipul de cont cu care vrei să continui.
                </p>
              </div>
            </div>

            {!settingsLoading && !registrationsEnabled && (
              <div
                className="mb-4 rounded-xl px-4 py-3 text-sm border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100"
                role="alert"
              >
                Înregistrările noi sunt temporar închise. Încearcă mai târziu sau
                contactează suportul dacă ai nevoie de un cont.
              </div>
            )}

            <div className="space-y-3 mb-6">
              <button
                type="button"
                disabled={!registrationsEnabled || settingsLoading}
                onClick={() => setRolSelectat("utilizator")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  rolSelectat === "utilizator"
                    ? "border-[#3B1F3A] bg-[#F9F5F9] dark:bg-[#241626]"
                    : "border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] hover:border-[#3B1F3A]/70"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-full ${
                    rolSelectat === "utilizator"
                      ? "bg-[#3B1F3A] text-white"
                      : "bg-gray-100 dark:bg-[#262633] text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <CiHome size={20} />
                </span>
                <div>
                  <div className="text-sm md:text-base font-semibold">
                    Sunt utilizator
                  </div>
                  <div className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
                    Caut o locuință sau vreau să urmăresc anunțuri favorite.
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={!registrationsEnabled || settingsLoading}
                onClick={() => setRolSelectat("agent")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  rolSelectat === "agent"
                    ? "border-[#C25A2B] bg-[#FFF4EE] dark:bg-[#291C17]"
                    : "border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#1B1B21] hover:border-[#C25A2B]/70"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-full ${
                    rolSelectat === "agent"
                      ? "bg-[#C25A2B] text-white"
                      : "bg-gray-100 dark:bg-[#262633] text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <MdBusinessCenter size={20} />
                </span>
                <div>
                  <div className="text-sm md:text-base font-semibold">
                    Sunt agent imobiliar
                  </div>
                  <div className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
                    Vreau să public anunțuri și să gestionez portofoliul meu.
                  </div>
                </div>
              </button>
            </div>

            <div className="mb-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
              În pasul următor vei completa datele de bază pentru contul{" "}
              <span className="font-semibold">
                {rolSelectat === "utilizator"
                  ? "de utilizator"
                  : "de agent imobiliar"}
                .
              </span>
            </div>

            <button
              type="button"
              disabled={!registrationsEnabled || settingsLoading}
              onClick={() => {
                const q = new URLSearchParams();
                q.set("role", rolSelectat === "agent" ? "agent" : "client");
                const back = searchParams.get("redirect_url");
                if (
                  typeof back === "string" &&
                  back.startsWith("/") &&
                  !back.startsWith("//")
                ) {
                  q.set("redirect_url", back);
                }
                router.push(`/sign-up?${q.toString()}`);
              }}
              className="w-full mt-4 px-4 py-2.5 rounded-lg text-white font-medium text-sm md:text-base hover:opacity-90 transition-opacity disabled:opacity-45 disabled:cursor-not-allowed"
              style={{
                backgroundColor:
                  rolSelectat === "utilizator" ? "#3B1F3A" : "#C25A2B",
              }}
            >
              {settingsLoading ? "Se încarcă…" : "Continuă"}
            </button>

            <div className="mt-6 pt-4 border-t border-[#d5dae0] dark:border-[#2b2b33] text-center">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                Ai deja cont?{" "}
                <Link
                  href="/sign-in"
                  className="font-semibold text-[#1F2D44] dark:text-[#7AA2FF] hover:underline"
                >
                  Intră în cont
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function InregistrarePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pt-24 text-sm text-gray-500">
          Se încarcă…
        </div>
      }
    >
      <InregistrarePageInner />
    </Suspense>
  );
}

