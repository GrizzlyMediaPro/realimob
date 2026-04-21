"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { useTheme } from "../hooks/useTheme";

export default function Footer() {
  const [language, setLanguage] = useState("Română");
  const { theme, changeTheme, mounted } = useTheme();
  const [isDark, setIsDark] = useState(false);

  // Detectare dark mode fără hydration mismatch
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
  
  const getAppearanceLabel = () => {
    if (!mounted) return "Mod sistem";
    if (theme === "system") return "Mod sistem";
    if (theme === "light") return "Luminos";
    return "Întunecat";
  };
  
  const handleAppearanceChange = (value: string) => {
    if (value === "Mod sistem") changeTheme("system");
    else if (value === "Luminos") changeTheme("light");
    else if (value === "Întunecat") changeTheme("dark");
  };

  const selectStyle: React.CSSProperties = {
    fontFamily: "var(--font-galak-regular)",
    background: isDark ? "rgba(35, 35, 48, 0.45)" : "rgba(255, 255, 255, 0.55)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.45)",
    backdropFilter: "blur(60px) saturate(1.6)",
    WebkitBackdropFilter: "blur(60px) saturate(1.6)",
    boxShadow: isDark
      ? "0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
      : "0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
  };

  return (
    <footer 
      className="w-full py-12 mt-6 md:mt-16 relative"
      style={{
        background: isDark 
          ? "rgba(35, 35, 48, 0.5)" 
          : "rgba(255, 255, 255, 0.6)",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(80px) saturate(1.6)",
        WebkitBackdropFilter: "blur(80px) saturate(1.6)",
        boxShadow: isDark
          ? "0 -4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          : "0 -4px 20px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
      }}
    >
      <div className="w-full max-w-[1250px] mx-auto px-8 relative z-1">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Stânga - Social media și setări */}
          <div className="flex flex-col gap-8">
            {/* Social media icons */}
            <div className="flex gap-4">
              <a href="#" className={`transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-400 hover:text-gray-700"}`}>
                <FaFacebook size={22} />
              </a>
              <a href="#" className={`transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-400 hover:text-gray-700"}`}>
                <FaYoutube size={22} />
              </a>
              <a href="#" className={`transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-400 hover:text-gray-700"}`}>
                <FaInstagram size={22} />
              </a>
              <a href="#" className={`transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-400 hover:text-gray-700"}`}>
                <FaTiktok size={22} />
              </a>
              <a href="#" className={`transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-400 hover:text-gray-700"}`}>
                <FaLinkedin size={22} />
              </a>
            </div>

            {/* Language selector */}
            <div>
              <label 
                className={`block font-bold mb-2 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`} 
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Limbă
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C25A2B] appearance-none ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                  style={selectStyle}
                >
                  <option>Română</option>
                  <option>English</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className={`w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Appearance selector */}
            <div>
              <label 
                className={`block font-bold mb-2 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`} 
                style={{ fontFamily: "var(--font-galak-regular)" }}
              >
                Aspect
              </label>
              <div className="relative">
                <select
                  value={getAppearanceLabel()}
                  onChange={(e) => handleAppearanceChange(e.target.value)}
                  className={`w-full px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C25A2B] appearance-none ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                  style={selectStyle}
                >
                  <option>Mod sistem</option>
                  <option>Luminos</option>
                  <option>Întunecat</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className={`w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Dreapta - Coloane de linkuri */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Companie */}
            <div>
              <h3 className={`font-bold mb-4 text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`} style={{ fontFamily: "var(--font-galak-regular)" }}>
                Companie
              </h3>
              <ul className="space-y-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Despre noi</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Știri</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Cariere</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Publicitate</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Contact</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Declarație accesibilitate</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className={`font-bold mb-4 text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`} style={{ fontFamily: "var(--font-galak-regular)" }}>
                Legal
              </h3>
              <ul className="space-y-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Impressum</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Termeni și condiții</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Politica de confidențialitate</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Setări confidențialitate</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Raportează vulnerabilitate</a></li>
              </ul>
            </div>

            {/* Parteneri */}
            <div>
              <h3 className={`font-bold mb-4 text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`} style={{ fontFamily: "var(--font-galak-regular)" }}>
                Parteneri
              </h3>
              <ul className="space-y-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Conectare</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Înregistrare</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Oferta noastră</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Termeni și condiții</a></li>
              </ul>
            </div>

            {/* Popular */}
            <div>
              <h3 className={`font-bold mb-4 text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`} style={{ fontFamily: "var(--font-galak-regular)" }}>
                Popular
              </h3>
              <ul className="space-y-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Aplicație iOS</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Aplicație Android</a></li>
                <li><a href="#" className={`text-sm transition-colors ${isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}>Harta site-ului</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div 
          className={`mt-12 pt-8 text-center text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}
          style={{
            fontFamily: "var(--font-galak-regular)",
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderTopColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
          }}
        >
          <p>© {new Date().getFullYear()} Realimob. Toate drepturile rezervate.</p>
          <p className="mt-2">
            Facut cu <span aria-label="inima rosie">❤️</span> de{" "}
            <a
              href="https://www.grizzlymediapro.ro/"
              target="_blank"
              rel="noopener noreferrer"
              className={`underline transition-colors ${
                isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Grizzly Media Pro
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
