import { useState, useRef } from "react";
import React from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../../../lib/mapbox";
import CustomDropdown from "../../CustomDropdown";

interface Props {
  flyTo: (center: [number, number], zoom?: number, pitch?: number, bearing?: number) => void;
  easeTo: (center: [number, number], zoom?: number, pitch?: number, bearing?: number) => void;
  style: string;
  setStyle: (s: string) => void;
  query: string;
  setQuery: (s: string) => void;
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

function InfoMapControls({
  flyTo,
  easeTo,
  style,
  setStyle,
  query,
  setQuery,
  mapRef
}: Props) {
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [locating, setLocating] = useState(false);
  const [layout, setLayout] = useState("info");

  async function handleSearch() {
    if (!mapRef.current || !query) return;

    const parts = query.split(/[\s,]+/).map((p) => p.trim());

    if (parts.length === 2 && !isNaN(+parts[0]) && !isNaN(+parts[1])) {
      flyTo([+parts[0], +parts[1]], 60);
      return;
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.features?.length) {
      const [lng, lat] = data.features[0].center;
      flyTo([lng, lat], 12);
      setQuery("");
    }
  }

  function handleLocateMe() {
    if (!mapRef.current?.loaded()) return;
    if (locating) return;

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;

        if (userMarkerRef.current) userMarkerRef.current.remove();

        const el = document.createElement("div");
        el.className = "location-dot";

        userMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current!);

        easeTo([longitude, latitude], 16);

        setLocating(false);
      },
      (err) => {
        alert(err.message);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  return (
    <>
      {/* TOPBAR */}
      <div className="map-topbar">

        {/* LEFT ZONE */}
        <div className="topbar-left">
          <CustomDropdown
            label="Layout"
            value={layout}
            onChange={(v) => setLayout(v)}
            options={[
              { label: "Info Map", value: "info" },
              { label: "Memory Map", value: "memory" },
              { label: "Planner", value: "planner" },
            ]}
          />

          <CustomDropdown
            label="Map Style"
            value={style}
            onChange={(v) => setStyle(v)}
            options={[
              { label: "Streets", value: "mapbox://styles/mapbox/streets-v12" },
              { label: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v12" },
              { label: "Satellite", value: "mapbox://styles/mapbox/satellite-streets-v12" },
            ]}
          />
        </div>

        {/* CENTER ZONE */}
        <div className="topbar-center">
          <div className="map-search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search place or coordinates"
            />
            <button onClick={handleSearch}>🔍</button>
          </div>
        </div>

        {/* RIGHT ZONE */}
        <div className="topbar-right" />

      </div>

      {/* FAB MOVED OUTSIDE TOPBAR */}
      <button className="map-fab" onClick={handleLocateMe}>
        📍
      </button>
    </>
  );
}

export default React.memo(InfoMapControls);
