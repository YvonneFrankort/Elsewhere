import { useState } from "react";
import React from "react";
import CustomDropdown from "../../../shared/ui/CustomDropdown";

interface Props {
  flyTo: (center: [number, number], zoom?: number, pitch?: number, bearing?: number) => void;
  easeTo: (center: [number, number], zoom?: number, pitch?: number, bearing?: number) => void;
  style: string;
  setStyle: (s: string) => void;
  query: string;
  setQuery: (s: string) => void;
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  handleSearch: () => void;
}

function InfoMapControls({
  flyTo,
  easeTo,
  style,
  setStyle,
  query,
  setQuery,
  mapRef,
  handleSearch
}: Props) {
  const [layout, setLayout] = useState("info");

  return (
    <div className="map-ui-section">
      <div className="map-topbar">
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

        <div className="topbar-right" />
      </div>

      <div className="desktop-zoom">
        <button onClick={() => mapRef.current?.zoomIn()}>＋</button>
        <button onClick={() => mapRef.current?.zoomOut()}>−</button>
      </div>
    </div>
  );
}

export default React.memo(InfoMapControls);
