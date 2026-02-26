"use client";

import { useState } from "react";
import { GlassStatsCard, GlassCTAButton } from "./LiquidGlassCards";
import { MdHistory, MdDirectionsTransit, MdSchool } from "react-icons/md";

type AnuntDetailsExpandedProps = {
  anunt: {
    pret: string;
    suprafataUtil?: number;
  };
  pretPerMp?: string;
  isInchiriere?: boolean;
};

export default function AnuntDetailsExpanded({ anunt, pretPerMp, isInchiriere }: AnuntDetailsExpandedProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <div>
        <GlassCTAButton onClick={() => setIsExpanded(true)}>
          Vezi mai multe
        </GlassCTAButton>
      </div>
    );
  }

  return (
    <>
      <div>
        <GlassCTAButton onClick={() => setIsExpanded(false)}>
          Ascunde detalii
        </GlassCTAButton>
      </div>

      {/* Istoric prețuri */}
      <GlassStatsCard>
        <div>
          <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold mb-4">
            <MdHistory className="text-[#C25A2B]" />
            Istoric prețuri
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Dată</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Eveniment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Preț</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-800/50">
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">15 Ian 2024</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {isInchiriere ? "Listat pentru închiriere" : "Listat pentru vânzare"}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {isInchiriere ? (
                      <>
                        <div className="font-semibold text-gray-900 dark:text-white">1.200 €/lună</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">12 €/m²</div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-gray-900 dark:text-white">125.000 €</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">1.250 €/m²</div>
                      </>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800/50">
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">20 Feb 2024</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Modificare preț</td>
                  <td className="py-3 px-4 text-sm">
                    {isInchiriere ? (
                      <>
                        <div className="font-semibold text-gray-900 dark:text-white">1.100 €/lună</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">11 €/m²</div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-gray-900 dark:text-white">120.000 €</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">1.200 €/m²</div>
                      </>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">10 Mar 2024</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">Modificare preț</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {anunt.pret}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {pretPerMp || 'N/A'}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </GlassStatsCard>

      {/* Calitate transport și Școli în apropiere */}
      <GlassStatsCard>
        <div className="space-y-6 md:space-y-8">
          {/* Calitate transport */}
          <div>
            <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold mb-4">
              <MdDirectionsTransit className="text-[#C25A2B]" />
              Calitate transport
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Walk Score - mers pe jos */}
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  21/100
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Mers pe jos
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Zonă în care ai nevoie în principal de mașină
                </div>
              </div>

              {/* Transit Score - transport public */}
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  28/100
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Transport public
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Transport public disponibil, dar nu în toate direcțiile
                </div>
              </div>

              {/* Bike Score - bicicletă */}
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  44/100
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Bicicletă
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Zonă parțial prietenoasă cu bicicliștii
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">Cel mai apropiat metrou:</span> Universitate, 0.8 km
              </div>
            </div>
          </div>

          {/* Școli în apropiere */}
          <div>
            <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold mb-4">
              <MdSchool className="text-[#C25A2B]" />
              Școli în apropiere
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Școală primară */}
              <div className="space-y-1">
                <div className="font-semibold text-gray-900 dark:text-white">
                  Școală primară
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Clase: 0–4
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Distanță: 0,3 km
                </div>
              </div>

              {/* Școală gimnazială */}
              <div className="space-y-1">
                <div className="font-semibold text-gray-900 dark:text-white">
                  Școală gimnazială
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Clase: 5–8
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Distanță: 1,1 km
                </div>
              </div>

              {/* Liceu */}
              <div className="space-y-1">
                <div className="font-semibold text-gray-900 dark:text-white">
                  Liceu
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Clase: 9–12
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Distanță: 3,5 km
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassStatsCard>
    </>
  );
}
