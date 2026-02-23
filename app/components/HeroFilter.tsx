"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CiSettings } from "react-icons/ci";
import { MdArrowBack } from "react-icons/md";

export default function HeroFilter() {
  const [filtrareAvansata, setFiltrareAvansata] = useState(false);
  const [tipProprietate, setTipProprietate] = useState("Vânzare");
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

  const inputStyle = {
    background: isDark ? "rgba(27, 27, 33, 0.6)" : "rgba(255, 255, 255, 0.6)",
    borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.4)",
    boxShadow: isDark 
      ? "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
  };

  const selectStyle = {
    background: isDark ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.55)",
    borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.45)",
    boxShadow: isDark 
      ? "0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
      : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(60px) saturate(1.6)",
    WebkitBackdropFilter: "blur(60px) saturate(1.6)",
  };

  return (
    <div className="md:absolute md:left-0 md:right-0 flex justify-center z-10 px-0 md:px-8 md:mt-0" style={{ top: 'calc(100% - 48px)' }}>
      <div className="w-full md:max-w-[1250px]">
        <div 
          className="rounded-none md:rounded-3xl overflow-hidden relative"
          style={{ 
            fontFamily: "var(--font-galak-regular)",
            background: isDark ? "rgba(35, 35, 48, 0.5)" : "rgba(255, 255, 255, 0.6)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.5)",
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
          {/* Control unic: Filtrare avansată / Înapoi la filtrare standard (fără background de buton) */}
          <div
            className="flex justify-start px-6 pt-4 pb-0"
            style={{ fontFamily: "var(--font-galak-regular)" }}
          >
            <button
              onClick={() => setFiltrareAvansata((prev) => !prev)}
              className="flex items-center gap-2 text-sm md:text-base text-black dark:text-foreground hover:opacity-80 transition-opacity"
              style={{ background: "transparent", border: "none" }}
            >
              {filtrareAvansata ? (
                <>
                  <MdArrowBack size={18} />
                  <span>Înapoi la filtrare standard</span>
                </>
              ) : (
                <>
                  <CiSettings size={18} />
                  <span>Filtrare avansată</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 pt-4 relative z-1">
            <div className="flex flex-col gap-4">
              {!filtrareAvansata ? (
                /* Filtre standard - doar când filtrarea avansată e închisă */
                <>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Tip proprietate */}
                    <div className="relative">
                      <select 
                        value={tipProprietate}
                        onChange={(e) => setTipProprietate(e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl border backdrop-blur-xl text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none transition-all duration-300"
                        style={selectStyle}
                      >
                        <option>Vânzare</option>
                        <option>Închiriere</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Locație */}
                    <input
                      type="text"
                      placeholder="Locație"
                      className="flex-1 px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                      style={inputStyle}
                    />

                    {/* Tip proprietate (apartament, casă, etc.) */}
                    <div className="relative">
                      <select className="w-full px-4 py-3 pr-12 rounded-xl border backdrop-blur-xl text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none transition-all duration-300"
                        style={selectStyle}
                      >
                        <option>Tip proprietate</option>
                        <option>Apartament</option>
                        <option>Casă</option>
                        <option>Teren</option>
                        <option>Comercial</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Preț maxim */}
                    <input
                      type="text"
                      placeholder="Preț maxim"
                      className="px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                      style={inputStyle}
                    />

                    {/* Buton căutare */}
                    <button
                      onClick={() => {
                        const route = tipProprietate === "Închiriere" ? "/inchiriere" : "/vanzare";
                        router.push(route);
                      }}
                      className="px-6 py-3 rounded-3xl text-white font-medium hover:opacity-90 transition-all duration-300 backdrop-blur-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        boxShadow: "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                      }}
                    >
                      Caută
                    </button>
                  </div>
                </>
              ) : (
                /* Filtre avansate - toate filtrele împreună, butonul Caută la final */
                <>
                  {/* Filtre de bază */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Tip proprietate */}
                    <div className="relative">
                      <select 
                        value={tipProprietate}
                        onChange={(e) => setTipProprietate(e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl border backdrop-blur-xl text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none transition-all duration-300"
                        style={selectStyle}
                      >
                        <option>Vânzare</option>
                        <option>Închiriere</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Locație */}
                    <input
                      type="text"
                      placeholder="Locație"
                      className="flex-1 px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                      style={inputStyle}
                    />

                    {/* Tip proprietate (apartament, casă, etc.) */}
                    <div className="relative">
                      <select className="w-full px-4 py-3 pr-12 rounded-xl border backdrop-blur-xl text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none transition-all duration-300"
                        style={selectStyle}
                      >
                        <option>Tip proprietate</option>
                        <option>Apartament</option>
                        <option>Casă</option>
                        <option>Teren</option>
                        <option>Comercial</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Filtre avansate */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Stadiu construcție */}
                    <div className="relative">
                      <select className="w-full px-4 py-3 pr-12 rounded-xl border backdrop-blur-xl text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none transition-all duration-300"
                        style={inputStyle}
                      >
                        <option>Stadiu construcție</option>
                        <option>Finalizat</option>
                        <option>În construcție</option>
                        <option>Proiect</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* An minim imobil */}
                    <input
                      type="number"
                      placeholder="An minim imobil"
                      className="px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                      style={inputStyle}
                    />

                    {/* An maxim imobil */}
                    <input
                      type="number"
                      placeholder="An maxim imobil"
                      className="px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                      style={inputStyle}
                    />

                    {/* Preț minim */}
                    <input
                      type="text"
                      placeholder="Preț minim"
                      className="px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                      style={inputStyle}
                    />

                    {/* Preț maxim */}
                    <input
                      type="text"
                      placeholder="Preț maxim"
                      className="px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                      style={inputStyle}
                    />

                    {/* Compartimentare */}
                    <div className="relative">
                      <select className="w-full px-4 py-3 pr-12 rounded-xl border backdrop-blur-xl text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 appearance-none transition-all duration-300"
                        style={inputStyle}
                      >
                        <option>Compartimentare</option>
                        <option>Decomandat</option>
                        <option>Semidecomandat</option>
                        <option>Nedecomandat</option>
                        <option>Open space</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Număr minim băi */}
                    <input
                      type="number"
                      placeholder="Număr minim băi"
                      className="px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                      style={inputStyle}
                    />

                    {/* Etaj minim */}
                    <input
                      type="number"
                      placeholder="Etaj minim"
                      className="px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                      style={inputStyle}
                    />

                    {/* Etaj maxim */}
                    <input
                      type="number"
                      placeholder="Etaj maxim"
                      className="px-4 py-3 rounded-xl border backdrop-blur-xl text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]/50 transition-all duration-300"
                      style={inputStyle}
                    />
                  </div>

                  {/* Buton căutare - la final după toate filtrele */}
                  <div className="flex justify-center md:justify-end">
                    <button
                      onClick={() => {
                        const route = tipProprietate === "Închiriere" ? "/inchiriere" : "/vanzare";
                        router.push(route);
                      }}
                      className="px-8 py-3 rounded-3xl text-white font-medium hover:opacity-90 transition-all duration-300 backdrop-blur-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(194, 90, 43, 0.95) 0%, rgba(180, 75, 35, 0.9) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        boxShadow: "0 4px 16px rgba(194, 90, 43, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                      }}
                    >
                      Caută
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
