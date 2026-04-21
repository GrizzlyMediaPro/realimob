"use client";

import { useState } from "react";
import { GlassStatsCard, GlassCTAButton } from "./LiquidGlassCards";
import { MdHistory, MdDirectionsTransit, MdSchool, MdDirectionsWalk, MdDirectionsBike } from "react-icons/md";
import type { ListingNearbyInsights } from "../../lib/listing-nearby-insights";
import ConvertedListingPrice from "./ConvertedListingPrice";

type PriceHistoryRow = {
  date: string;
  event: string;
  price: string;
  pricePerMp?: string;
  priceAmount?: number;
  priceCurrency?: string;
  pricePerMpAmount?: number;
  priceDetails?: Record<string, unknown> | null;
};

type AnuntDetailsExpandedProps = {
  anunt: {
    pret: string;
    suprafataUtil?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  pretPerMp?: string;
  isInchiriere?: boolean;
  priceHistory?: PriceHistoryRow[];
  /** `undefined` = secțiunea clasică (mock); `null` = fără date (lipsă coordonate sau eroare); obiect = date OSM. */
  nearbyInsights?: ListingNearbyInsights | null;
};

export default function AnuntDetailsExpanded({
  anunt,
  pretPerMp,
  isInchiriere,
  priceHistory,
  nearbyInsights,
}: AnuntDetailsExpandedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fallbackHistory: PriceHistoryRow[] = [
    {
      date: anunt.createdAt
        ? new Date(anunt.createdAt).toLocaleDateString("ro-RO")
        : "N/A",
      event: isInchiriere ? "Listat pentru închiriere" : "Listat pentru vânzare",
      price: anunt.pret,
      pricePerMp: pretPerMp,
    },
  ];
  const historyRows: PriceHistoryRow[] =
    priceHistory && priceHistory.length > 0 ? priceHistory : fallbackHistory;

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
                {historyRows.map((row: PriceHistoryRow, index) => (
                  <tr
                    key={`${row.date}-${row.event}-${index}`}
                    className={index < historyRows.length - 1 ? "border-b border-gray-100 dark:border-gray-800/50" : ""}
                  >
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{row.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{row.event}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {row.priceAmount != null &&
                        row.priceCurrency?.trim() &&
                        Number.isFinite(row.priceAmount) ? (
                          <ConvertedListingPrice
                            amount={row.priceAmount}
                            fromCurrency={row.priceCurrency}
                            fallback={row.price}
                            priceDetails={row.priceDetails}
                            suffix={isInchiriere ? " / lună" : ""}
                          />
                        ) : (
                          row.price
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {row.pricePerMpAmount != null &&
                        row.priceCurrency?.trim() &&
                        Number.isFinite(row.pricePerMpAmount) ? (
                          <ConvertedListingPrice
                            amount={row.pricePerMpAmount}
                            fromCurrency={row.priceCurrency}
                            fallback={row.pricePerMp ?? "N/A"}
                            suffix="/m²"
                          />
                        ) : (
                          row.pricePerMp || "N/A"
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </GlassStatsCard>

      {/* Calitate transport și Școli în apropiere */}
      <GlassStatsCard>
        <div className="space-y-6 md:space-y-8">
          {nearbyInsights === null ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nu putem afișa transportul și școlile din hartă: lipsește pin-ul pe hartă pentru
              acest anunț sau serviciul de date nu răspunde. Reîncearcă mai târziu.
            </p>
          ) : nearbyInsights ? (
            <>
              <div>
                <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold mb-4">
                  <MdDirectionsTransit className="text-[#C25A2B]" />
                  Calitate transport
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Scoruri estimate din OpenStreetMap în jurul punctului anunțului (nu sunt indici
                  comerciali Walk Score®).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      <MdDirectionsWalk className="text-base" />
                      Mers pe jos
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {nearbyInsights.walkScore.value}/100
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {nearbyInsights.walkScore.description}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      <MdDirectionsTransit className="text-base" />
                      Transport public
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {nearbyInsights.transitScore.value}/100
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {nearbyInsights.transitScore.description}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      <MdDirectionsBike className="text-base" />
                      Bicicletă
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {nearbyInsights.bikeScore.value}/100
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {nearbyInsights.bikeScore.description}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Cel mai apropiat metrou:
                    </span>{" "}
                    {nearbyInsights.nearestMetro ? (
                      <>
                        {nearbyInsights.nearestMetro.name},{" "}
                        {nearbyInsights.nearestMetro.distanceKm.toLocaleString("ro-RO")} km
                      </>
                    ) : (
                      "Nu apare stație de metrou în OpenStreetMap în raza folosită"
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Stații transport în comun (~800 m):
                    </span>{" "}
                    {nearbyInsights.transitStopsNearby}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold mb-4">
                  <MdSchool className="text-[#C25A2B]" />
                  Școli în apropiere
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Unități mapate în OpenStreetMap; tipul (primar / gimnaziu / liceu) depinde de
                  etichetele disponibile.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Școală primară / grădiniță
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Clase: 0–4 (aprox.)
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {nearbyInsights.schools.primary ? (
                        <>
                          {nearbyInsights.schools.primary.name} —{" "}
                          {nearbyInsights.schools.primary.distanceKm.toLocaleString("ro-RO")} km
                        </>
                      ) : (
                        "Nu s-a găsit o unitate clasificată astfel în zonă"
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Școală gimnazială
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Clase: 5–8 (aprox.)
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {nearbyInsights.schools.gymnasium ? (
                        <>
                          {nearbyInsights.schools.gymnasium.name} —{" "}
                          {nearbyInsights.schools.gymnasium.distanceKm.toLocaleString("ro-RO")} km
                        </>
                      ) : (
                        "Nu s-a găsit o unitate clasificată astfel în zonă"
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Liceu / colegiu
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Clase: 9–12 (aprox.)
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {nearbyInsights.schools.highSchool ? (
                        <>
                          {nearbyInsights.schools.highSchool.name} —{" "}
                          {nearbyInsights.schools.highSchool.distanceKm.toLocaleString("ro-RO")} km
                        </>
                      ) : (
                        "Nu s-a găsit o unitate clasificată astfel în zonă"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                {nearbyInsights.attribution}
              </p>
            </>
          ) : (
            <>
              <div>
                <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold mb-4">
                  <MdDirectionsTransit className="text-[#C25A2B]" />
                  Calitate transport
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Cel mai apropiat metrou:
                    </span>{" "}
                    Universitate, 0.8 km
                  </div>
                </div>
              </div>

              <div>
                <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold mb-4">
                  <MdSchool className="text-[#C25A2B]" />
                  Școli în apropiere
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            </>
          )}
        </div>
      </GlassStatsCard>
    </>
  );
}
