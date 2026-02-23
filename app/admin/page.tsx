"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  MdHome,
  MdPerson,
  MdDescription,
  MdSettings,
  MdAnalytics,
  MdNotifications,
  MdSecurity,
  MdTrendingUp,
  MdTrendingDown,
  MdCheckCircle,
  MdCancel,
  MdPeople,
  MdBusiness,
} from "react-icons/md";

interface StatisticItem {
  titlu: string;
  valoare: string;
  icon: typeof MdHome;
  trend?: {
    valoare: string;
    pozitiv: boolean;
  };
  culoare: string;
}

interface MenuItem {
  titlu: string;
  descriere: string;
  icon: typeof MdHome;
  href: string;
  badge?: string;
}

const statistici: StatisticItem[] = [
  {
    titlu: "Anunțuri Active",
    valoare: "342",
    icon: MdCheckCircle,
    trend: {
      valoare: "+12%",
      pozitiv: true,
    },
    culoare: "#10B981",
  },
  {
    titlu: "Anunțuri Inactive",
    valoare: "28",
    icon: MdCancel,
    trend: {
      valoare: "-5%",
      pozitiv: true,
    },
    culoare: "#EF4444",
  },
  {
    titlu: "Utilizatori Noi",
    valoare: "156",
    icon: MdPeople,
    trend: {
      valoare: "+23%",
      pozitiv: true,
    },
    culoare: "#3B82F6",
  },
  {
    titlu: "Agenti Activi",
    valoare: "89",
    icon: MdBusiness,
    trend: {
      valoare: "+8%",
      pozitiv: true,
    },
    culoare: "#C25A2B",
  },
];

const menuItems: MenuItem[] = [
  {
    titlu: "Anunțuri",
    descriere: "Gestionează toate anunțurile",
    icon: MdDescription,
    href: "/admin/anunturi",
    badge: "342",
  },
  {
    titlu: "Agenti",
    descriere: "Administrează agenții imobiliari",
    icon: MdPerson,
    href: "/admin/agenti",
    badge: "89",
  },
  {
    titlu: "Utilizatori",
    descriere: "Gestionează utilizatorii platformei",
    icon: MdPeople,
    href: "/admin/utilizatori",
    badge: "1,234",
  },
  {
    titlu: "Analitica",
    descriere: "Statistici și rapoarte detaliate",
    icon: MdAnalytics,
    href: "/admin/analitica",
  },
  {
    titlu: "Notificări",
    descriere: "Sistem de notificări și alerte",
    icon: MdNotifications,
    href: "/admin/notificari",
    badge: "12",
  },
  {
    titlu: "Setări",
    descriere: "Configurare platformă",
    icon: MdSettings,
    href: "/admin/setari",
  },
  {
    titlu: "Securitate",
    descriere: "Gestionare securitate și permisiuni",
    icon: MdSecurity,
    href: "/admin/securitate",
  },
  {
    titlu: "Rapoarte",
    descriere: "Generare rapoarte și export date",
    icon: MdTrendingUp,
    href: "/admin/rapoarte",
  },
];

export default function AdminPage() {
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
          {/* Header */}
          <div>
            <h1
              className="text-3xl md:text-5xl font-bold text-foreground mb-2"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Panou de administrare
            </h1>
            <p
              className="text-gray-500 dark:text-gray-400"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Gestionează toate aspectele platformei
            </p>
          </div>

          {/* Secțiune Statistici */}
          <section>
            <h2
              className="text-2xl md:text-4xl font-bold mb-6 text-foreground"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Statistici
            </h2>
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

              <div className="px-4 md:px-8 py-6 md:py-8 relative z-1">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
                  {statistici.map((stat, index) => {
                    const Icon = stat.icon;
                    const isLast = index === statistici.length - 1;
                    return (
                      <div
                        key={index}
                        className="relative flex items-center gap-4 md:gap-5 px-4 md:px-6 py-4"
                      >
                        {/* Divider vertical între carduri — doar pe desktop */}
                        {index > 0 && (
                          <div
                            className="absolute left-0 top-[20%] bottom-[20%] hidden lg:block"
                            style={{
                              width: "1px",
                              background: isDark
                                ? "rgba(255, 255, 255, 0.08)"
                                : "rgba(0, 0, 0, 0.06)",
                            }}
                          />
                        )}
                        {/* Divider vertical pe mobil — între col 1 și 2 */}
                        {index % 2 === 1 && (
                          <div
                            className="absolute left-0 top-[20%] bottom-[20%] lg:hidden"
                            style={{
                              width: "1px",
                              background: isDark
                                ? "rgba(255, 255, 255, 0.08)"
                                : "rgba(0, 0, 0, 0.06)",
                            }}
                          />
                        )}

                        {/* Accent bar */}
                        <div
                          className="w-1 self-stretch rounded-full shrink-0"
                          style={{ background: stat.culoare }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon
                              size={16}
                              style={{ color: stat.culoare }}
                              className="shrink-0"
                            />
                            <span
                              className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate"
                              style={{ fontFamily: "var(--font-galak-regular)" }}
                            >
                              {stat.titlu}
                            </span>
                          </div>
                          <div className="flex items-end gap-2 md:gap-3">
                            <span
                              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-none"
                              style={{ fontFamily: "var(--font-galak-regular)" }}
                            >
                              {stat.valoare}
                            </span>
                            {stat.trend && (
                              <span
                                className="flex items-center gap-0.5 text-xs font-medium mb-1"
                                style={{
                                  color: stat.trend.pozitiv
                                    ? "#10B981"
                                    : "#EF4444",
                                }}
                              >
                                {stat.trend.pozitiv ? (
                                  <MdTrendingUp size={14} />
                                ) : (
                                  <MdTrendingDown size={14} />
                                )}
                                {stat.trend.valoare}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Divider orizontal pe mobil — între rândul 1 și 2 */}
                <div
                  className="lg:hidden mx-4"
                  style={{
                    position: "absolute",
                    left: "5%",
                    right: "5%",
                    top: "50%",
                    height: "1px",
                    background: isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.06)",
                  }}
                />
              </div>
            </div>
          </section>

          {/* Secțiune Meniu */}
          <section>
            <h2
              className="text-2xl md:text-4xl font-bold mb-6 text-foreground"
              style={{ fontFamily: "var(--font-galak-regular)" }}
            >
              Meniu Administrare
            </h2>
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

              <div className="p-4 md:p-6 relative z-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={index}
                        href={item.href}
                        className="group rounded-2xl p-5 md:p-6 relative overflow-hidden cursor-pointer flex flex-col transition-all duration-300"
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
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = isDark
                            ? "0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                            : "0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)";
                          e.currentTarget.style.borderColor = isDark
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(255, 255, 255, 0.45)";
                          e.currentTarget.style.transform = "translateY(0)";
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

                        <div className="relative z-1 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
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
                                className="text-[#C25A2B]"
                              />
                            </div>
                            {item.badge && (
                              <span
                                className="px-2.5 py-1 rounded-full text-xs font-medium"
                                style={{
                                  background: isDark
                                    ? "rgba(194, 90, 43, 0.2)"
                                    : "rgba(194, 90, 43, 0.15)",
                                  color: "#C25A2B",
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <h3
                            className="text-lg md:text-xl font-bold text-foreground mb-2"
                            style={{ fontFamily: "var(--font-galak-regular)" }}
                          >
                            {item.titlu}
                          </h3>
                          <p
                            className="text-sm text-gray-500 dark:text-gray-400 flex-1"
                            style={{ fontFamily: "var(--font-galak-regular)" }}
                          >
                            {item.descriere}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
