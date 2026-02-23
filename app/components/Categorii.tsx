"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MdApartment,
  MdMeetingRoom,
  MdHouse,
  MdStorefront,
} from "react-icons/md";
import type { IconType } from "react-icons";

interface CategorieItem {
  titlu: string;
  descriere: string;
  icon: IconType;
  href: string;
  count: string;
}

const categorii: CategorieItem[] = [
  {
    titlu: "Apartamente",
    descriere: "2, 3 sau 4+ camere",
    icon: MdApartment,
    href: "/anunturi?tip=apartament",
    count: "120+ anunțuri",
  },
  {
    titlu: "Garsoniere",
    descriere: "Studio & garsoniere",
    icon: MdMeetingRoom,
    href: "/anunturi?tip=garsoniera",
    count: "85+ anunțuri",
  },
  {
    titlu: "Case",
    descriere: "Case & vile",
    icon: MdHouse,
    href: "/anunturi?tip=casa",
    count: "60+ anunțuri",
  },
  {
    titlu: "Spații Comerciale",
    descriere: "Birouri & comercial",
    icon: MdStorefront,
    href: "/anunturi?tip=comercial",
    count: "40+ anunțuri",
  },
];

export default function Categorii() {
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

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
    <section className="w-full pt-0 md:pt-32 pb-6 md:pb-12 px-0 md:px-8">
      <div className="w-full md:max-w-[1250px] md:mx-auto">
        <div
          className="rounded-none md:rounded-3xl overflow-hidden relative"
          style={{
            fontFamily: "var(--font-galak-regular)",
            background: isDark
              ? "rgba(35, 35, 48, 0.5)"
              : "rgba(255, 255, 255, 0.6)",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.12)"
              : "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              : "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(80px) saturate(1.6)",
            WebkitBackdropFilter: "blur(80px) saturate(1.6)",
          }}
        >
          {/* Reflexie mată subtilă */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "40%",
              background: isDark
                ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
                : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
              borderRadius: "inherit",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div
            className="p-4 md:p-6 relative z-1"
            style={{ background: "transparent" }}
          >
            <h2
              className="text-2xl md:text-5xl font-bold mb-4 md:mb-8 text-foreground"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Categorii
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categorii.map((categorie, index) => {
                const Icon = categorie.icon;
                return (
                  <div
                    key={index}
                    onClick={() => router.push(categorie.href)}
                    className="group rounded-2xl overflow-hidden relative cursor-pointer p-5 md:p-6 flex flex-col items-center text-center transition-all duration-300"
                    style={{
                      background: isDark
                        ? "rgba(35, 35, 48, 0.45)"
                        : "rgba(255, 255, 255, 0.55)",
                      border: isDark
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "1px solid rgba(255, 255, 255, 0.45)",
                      boxShadow: isDark
                        ? "0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                        : "0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                      backdropFilter: "blur(60px) saturate(1.6)",
                      WebkitBackdropFilter: "blur(60px) saturate(1.6)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = isDark
                        ? "0 8px 30px rgba(194, 90, 43, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
                        : "0 8px 30px rgba(194, 90, 43, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)";
                      e.currentTarget.style.borderColor = isDark
                        ? "rgba(194, 90, 43, 0.4)"
                        : "rgba(194, 90, 43, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = isDark
                        ? "0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                        : "0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)";
                      e.currentTarget.style.borderColor = isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.45)";
                    }}
                  >
                    {/* Reflexie mată pe card */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "50%",
                        background: isDark
                          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 100%)"
                          : "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)",
                        borderRadius: "inherit",
                        pointerEvents: "none",
                        zIndex: 0,
                      }}
                    />

                    {/* Icon container */}
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-3 md:mb-4 relative z-1 transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: isDark
                          ? "rgba(194, 90, 43, 0.15)"
                          : "rgba(194, 90, 43, 0.1)",
                        border: isDark
                          ? "1px solid rgba(194, 90, 43, 0.3)"
                          : "1px solid rgba(194, 90, 43, 0.2)",
                      }}
                    >
                      <Icon
                        size={28}
                        className="md:hidden text-[#C25A2B]"
                      />
                      <Icon
                        size={32}
                        className="hidden md:block text-[#C25A2B]"
                      />
                    </div>

                    {/* Titlu */}
                    <h3
                      className="text-base md:text-lg font-bold text-foreground mb-1 relative z-1"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      {categorie.titlu}
                    </h3>

                    {/* Descriere */}
                    <p
                      className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-3 relative z-1"
                      style={{ fontFamily: "var(--font-galak-regular)" }}
                    >
                      {categorie.descriere}
                    </p>

                    {/* Count badge */}
                    <span
                      className="text-xs px-3 py-1 rounded-full relative z-1"
                      style={{
                        background: isDark
                          ? "rgba(194, 90, 43, 0.12)"
                          : "rgba(194, 90, 43, 0.08)",
                        color: "#C25A2B",
                        fontFamily: "var(--font-galak-regular)",
                      }}
                    >
                      {categorie.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
