"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { MdArrowBack, MdAnalytics, MdDescription } from "react-icons/md";
import { AdminAnaliticaPanel } from "../_components/AdminAnaliticaPanel";
import { AdminRapoartePanel } from "../_components/AdminRapoartePanel";

export default function StatisticiPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab =
    searchParams.get("tab") === "rapoarte" ? "rapoarte" : "statistici";

  const setTab = (t: "statistici" | "rapoarte") => {
    router.replace(
      t === "rapoarte"
        ? "/admin/statistici?tab=rapoarte"
        : "/admin/statistici",
      { scroll: false }
    );
  };

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen text-foreground pt-20">
      <Navbar />
      <div className="w-full px-4 md:px-8 py-8 md:py-12">
        <div className="w-full max-w-[1250px] mx-auto space-y-8 md:space-y-12">
          <div>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors mb-4"
            >
              <MdArrowBack size={20} />
              <span className="text-sm">Înapoi la panou</span>
            </Link>
            <h1
              className="text-3xl md:text-5xl font-bold text-foreground mb-2"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Statistici și rapoarte
            </h1>
            <p
              className="text-gray-500 dark:text-gray-400 max-w-2xl"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Grafice și indicatori în tab-ul Statistici; export CSV/PDF și
              tabele sumare în tab-ul Rapoarte.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "statistici" as const, label: "Statistici", Icon: MdAnalytics },
                { id: "rapoarte" as const, label: "Rapoarte", Icon: MdDescription },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  fontFamily: "var(--font-galak-regular)",
                  background:
                    tab === id
                      ? "rgba(194, 90, 43, 0.2)"
                      : isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                  border:
                    tab === id
                      ? "1px solid rgba(194, 90, 43, 0.45)"
                      : isDark
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.08)",
                  color: tab === id ? "#C25A2B" : "inherit",
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          {tab === "statistici" ? (
            <AdminAnaliticaPanel />
          ) : (
            <AdminRapoartePanel />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
