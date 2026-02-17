"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CiFilter, CiSettings } from "react-icons/ci";

export default function HeroFilter() {
  const [activeTab, setActiveTab] = useState("Filtrare");
  const [filtrareAvansata, setFiltrareAvansata] = useState(false);
  const router = useRouter();

  return (
    <div className="md:absolute md:left-0 md:right-0 flex justify-center z-10 px-0 md:px-8 md:mt-0" style={{ top: 'calc(100% - 48px)' }}>
      <div className="w-full md:max-w-[1250px]">
        <div 
          className="bg-white dark:bg-[#1B1B21] rounded-none md:rounded-2xl border-0 md:border border-[#d5dae0] dark:border-[#2b2b33] shadow-lg overflow-hidden"
          style={{ fontFamily: "var(--font-galak-regular)" }}
        >
          {/* Tab-uri */}
          <div className="flex gap-2 px-6 pt-4 pb-0" style={{ fontFamily: "var(--font-galak-regular)" }}>
            <button
              onClick={() => {
                setActiveTab("Filtrare");
                setFiltrareAvansata(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === "Filtrare" && !filtrareAvansata
                  ? "text-white"
                  : "text-black dark:text-foreground"
              }`}
              style={activeTab === "Filtrare" && !filtrareAvansata ? { backgroundColor: "#3B1F3A" } : {}}
            >
              <CiFilter size={20} />
              Filtrare
            </button>
            <button
              onClick={() => {
                setFiltrareAvansata(!filtrareAvansata);
                if (!filtrareAvansata) {
                  setActiveTab("");
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                filtrareAvansata
                  ? "text-white"
                  : "text-black dark:text-foreground"
              }`}
              style={filtrareAvansata ? { backgroundColor: "#3B1F3A" } : {}}
            >
              <CiSettings size={20} />
              Filtrare Avansată
            </button>
          </div>

          <div className="p-6 pt-4">
            <div className="flex flex-col gap-4">
              {/* Filtre de bază */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Tip proprietate */}
                <div className="relative">
                  <select className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B] appearance-none">
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
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]"
                />

                {/* Tip proprietate (apartament, casă, etc.) */}
                <div className="relative">
                  <select className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B] appearance-none">
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

                {/* Preț */}
                <input
                  type="text"
                  placeholder={filtrareAvansata ? "Preț maxim" : "Preț maxim"}
                  className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]"
                />

                {/* Buton căutare */}
                <button
                  onClick={() => router.push("/anunturi")}
                  className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#C25A2B" }}
                >
                  Caută
                </button>
              </div>

              {/* Filtre avansate */}
              {filtrareAvansata && (
                <div className="flex flex-col gap-4 pt-4 border-t border-[#d5dae0] dark:border-[#2b2b33]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Stadiu construcție */}
                    <div className="relative">
                      <select className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B] appearance-none">
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
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]"
                    />

                    {/* An maxim imobil */}
                    <input
                      type="number"
                      placeholder="An maxim imobil"
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]"
                    />

                    {/* Preț minim */}
                    <input
                      type="text"
                      placeholder="Preț minim"
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]"
                    />

                    {/* Preț maxim */}
                    <input
                      type="text"
                      placeholder="Preț maxim"
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]"
                    />

                    {/* Compartimentare */}
                    <div className="relative">
                      <select className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C25A2B] appearance-none">
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
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]"
                    />

                    {/* Etaj minim */}
                    <input
                      type="number"
                      placeholder="Etaj minim"
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]"
                    />

                    {/* Etaj maxim */}
                    <input
                      type="number"
                      placeholder="Etaj maxim"
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1B1B21] text-black dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C25A2B]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
