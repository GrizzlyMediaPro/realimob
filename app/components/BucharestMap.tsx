"use client";

import { useMemo, useState } from "react";
import Map, { Marker, Popup, ViewState } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

type MarkerItem = {
  id: string;
  titlu: string;
  lat: number;
  lng: number;
  descriere?: string;
};

export default function BucharestMap({
  markers,
  initialSelectedId,
}: {
  markers: MarkerItem[];
  initialSelectedId?: string | null;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  const bucharestCenter = useMemo(
    () => ({ longitude: 26.1025, latitude: 44.4268 }),
    []
  );

  const [viewState, setViewState] = useState<ViewState>({
    longitude: bucharestCenter.longitude,
    latitude: bucharestCenter.latitude,
    zoom: 12.5,
  });

  const [selected, setSelected] = useState<MarkerItem | null>(
    markers.find((m) => m.id === initialSelectedId) ?? null
  );

  return (
    <div className="w-full h-[560px] rounded-2xl overflow-hidden border border-[#d5dae0] dark:border-[#2b2b33] bg-white dark:bg-[#0b0b10]">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={token}
        maxZoom={19}
        minZoom={11}
      >
        {markers.map((m) => (
          <Marker key={m.id} longitude={m.lng} latitude={m.lat} anchor="bottom">
            <button
              type="button"
              onClick={() => setSelected(m)}
              className="w-6 h-6 rounded-full bg-[#C25A2B] border-2 border-white shadow"
              aria-label={m.titlu}
            />
          </Marker>
        ))}

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            onClose={() => setSelected(null)}
            closeOnClick={false}
            anchor="top"
          >
            <div className="font-semibold text-sm mb-1">{selected.titlu}</div>
            {selected.descriere && (
              <div className="text-xs text-gray-600">{selected.descriere}</div>
            )}
          </Popup>
        )}
      </Map>
    </div>
  );
}

