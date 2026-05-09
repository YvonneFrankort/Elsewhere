import { useState, useRef } from "react";
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

export default function InfoMapControls({
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

  async function handleSearch() {
    if (!mapRef.current || !query) return;

    const parts = query.split(/[\s,]+/).map((p) => p.trim());

    if (parts.length === 2 && !isNaN(+parts[0]) && !isNaN(+parts[1])) {
      flyTo([+parts[0], +parts[1]], 12, 60);
      return;
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.features?.length) {
      const [lng, lat] = data.features[0].center;
      flyTo([lng, lat], 12, 60);
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

        easeTo([longitude, latitude], 16, 30);

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
    <div className="map-ui">
      <div className="map-search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search place or coordinates"
        />
        <button onClick={handleSearch}>🔍</button>
      </div>

      <div className="map-style">
        <CustomDropdown
          value={style}
          onChange={(v) => setStyle(v)}
          options={[
            { label: "Streets", value: "mapbox://styles/mapbox/streets-v12" },
            { label: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v12" },
            { label: "Dark", value: "mapbox://styles/mapbox/dark-v11" },
            { label: "Satellite", value: "mapbox://styles/mapbox/satellite-streets-v12" },
          ]}
        />
      </div>

      <button className="map-fab" onClick={handleLocateMe}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill="white" />
          <path
            d="M12 2v3M12 19v3M4 12H2M22 12h-3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}
