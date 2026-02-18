"use client";

import { useState } from "react";
import { MdLocationOn } from "react-icons/md";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import ListingMapModal from "./ListingMapModal";

type SmallMapPreviewProps = {
  id: string;
  titlu: string;
  lat?: number;
  lng?: number;
};

export default function SmallMapPreview({
  id,
  titlu,
  lat,
  lng,
}: SmallMapPreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dacă nu avem coordonate valide, nu afișăm deloc.
  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#0b0b10] h-[200px]">
        {/* Harta mică */}
        <Map
          longitude={lng}
          latitude={lat}
          zoom={13}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={token}
          interactive={false}
          maxBounds={[
            [25.7, 44.2],
            [26.6, 44.7],
          ]}
        >
          <Marker longitude={lng} latitude={lat} anchor="bottom">
            <div className="flex flex-col items-center gap-1">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                className="drop-shadow-xl"
                aria-hidden="true"
              >
                <path
                  d="M12 2C8.686 2 6 4.686 6 8c0 4.418 4.5 9.5 5.658 10.793.18.202.504.202.684 0C13.5 17.5 18 12.418 18 8c0-3.314-2.686-6-6-6z"
                  fill="#C25A2B"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <circle cx="12" cy="8.25" r="2.4" fill="white" />
              </svg>
            </div>
          </Marker>
        </Map>

        {/* Blur filter deasupra */}
        <div className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-sm pointer-events-none"></div>

        {/* Buton "Vezi pe hartă" */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
            style={{ backgroundColor: "#C25A2B" }}
          >
            <MdLocationOn size={18} />
            Vezi pe hartă
          </button>
        </div>
      </div>

      {/* Modal - folosim același component dar controlăm starea */}
      <ListingMapModal
        id={id}
        titlu={titlu}
        lat={lat}
        lng={lng}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showButton={false}
      />
    </>
  );
}
