"use client";

import { useState, useCallback } from "react";
import Map, { Marker, ViewState } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

type LocationPickerMapProps = {
  lat: number | null;
  lng: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
};

export default function LocationPickerMap({
  lat,
  lng,
  onLocationSelect,
}: LocationPickerMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  const [viewState, setViewState] = useState<ViewState>({
    longitude: lng ?? 26.1025,
    latitude: lat ?? 44.4268,
    zoom: 12.5,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const handleMapClick = useCallback(
    (evt: any) => {
      const { lng: clickLng, lat: clickLat } = evt.lngLat;
      onLocationSelect(clickLat, clickLng);
    },
    [onLocationSelect]
  );

  return (
    <div className="h-[350px] w-full relative">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={token}
        cursor="crosshair"
        maxBounds={[
          [25.7, 44.2],
          [26.6, 44.7],
        ]}
        maxZoom={18}
        minZoom={11}
      >
        {lat !== null && lng !== null && (
          <Marker longitude={lng} latitude={lat} anchor="bottom">
            <div className="flex flex-col items-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                className="drop-shadow-xl animate-bounce"
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
        )}
      </Map>

      {/* Instrucțiune overlay */}
      {lat === null && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm text-gray-700 dark:text-gray-300 pointer-events-none">
          Click pe hartă pentru a selecta locația
        </div>
      )}
    </div>
  );
}
