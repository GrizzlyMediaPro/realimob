"use client";

import { useState } from "react";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { useTheme } from "../hooks/useTheme";

export default function Footer() {
  const [language, setLanguage] = useState("Română");
  const { theme, changeTheme, mounted } = useTheme();
  
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

  return (
    <footer className="w-full bg-[#1B1B21] dark:bg-[#1B1B21] text-gray-300 py-12 mt-16">
      <div className="w-full max-w-[1250px] mx-auto px-8">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Stânga - Social media și setări */}
          <div className="flex flex-col gap-8">
            {/* Social media icons */}
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaYoutube size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaTiktok size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin size={24} />
              </a>
            </div>

            {/* Language selector */}
            <div>
              <label className="block font-bold mb-2 text-white" style={{ fontFamily: "var(--font-galak-regular)" }}>
                Limbă
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-600 bg-[#1B1B21] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C25A2B] appearance-none"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  <option>Română</option>
                  <option>English</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Appearance selector */}
            <div>
              <label className="block font-bold mb-2 text-white" style={{ fontFamily: "var(--font-galak-regular)" }}>
                Aspect
              </label>
              <div className="relative">
                <select
                  value={getAppearanceLabel()}
                  onChange={(e) => handleAppearanceChange(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-600 bg-[#1B1B21] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C25A2B] appearance-none"
                  style={{ fontFamily: "var(--font-galak-regular)" }}
                >
                  <option>Mod sistem</option>
                  <option>Luminos</option>
                  <option>Întunecat</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <h3 className="font-bold mb-4 text-white" style={{ fontFamily: "var(--font-galak-regular)" }}>
                Companie
              </h3>
              <ul className="space-y-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Despre noi</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Știri</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cariere</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Publicitate</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Declarație accesibilitate</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold mb-4 text-white" style={{ fontFamily: "var(--font-galak-regular)" }}>
                Legal
              </h3>
              <ul className="space-y-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Impressum</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termeni și condiții</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Politica de confidențialitate</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Setări confidențialitate</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Raportează vulnerabilitate</a></li>
              </ul>
            </div>

            {/* Parteneri */}
            <div>
              <h3 className="font-bold mb-4 text-white" style={{ fontFamily: "var(--font-galak-regular)" }}>
                Parteneri
              </h3>
              <ul className="space-y-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Conectare</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Înregistrare</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Oferta noastră</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termeni și condiții</a></li>
              </ul>
            </div>

            {/* Popular */}
            <div>
              <h3 className="font-bold mb-4 text-white" style={{ fontFamily: "var(--font-galak-regular)" }}>
                Popular
              </h3>
              <ul className="space-y-2" style={{ fontFamily: "var(--font-galak-regular)" }}>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Aplicație iOS</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Aplicație Android</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Harta site-ului</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-[#d5dae0] dark:border-[#2b2b33] text-center text-gray-500 text-sm" style={{ fontFamily: "var(--font-galak-regular)" }}>
          <p>© {new Date().getFullYear()} Realimob. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}
