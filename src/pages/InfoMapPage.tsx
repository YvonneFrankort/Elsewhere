import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
//import { LeftPanel } from "../components/LeftPanel/LeftPanel";
import React from "react";
import { createPortal } from "react-dom";


import { useBaseMapInitialize } from "../hooks/map/base/useBaseMapInitialize";
import { useBaseMapStyle } from "../hooks/map/base/useBaseMapStyle";
import { useBaseMapCamera } from "../hooks/map/base/useBaseMapCamera";
import { useBaseMapEvents } from "../hooks/map/base/useBaseMapEvents";

import InfoMapControls from "../components/ui/info/InfoMapControls";

import { useInfoMapDiscovery } from "../hooks/map/info/useInfoMapDiscovery";
import { StyleManager } from "../map/style/StyleManager";
import CustomDropdown from "../components/CustomDropdown";

function InfoMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleManagerRef = useRef<StyleManager | null>(null);

  const [style, setStyle] = useState("mapbox://styles/mapbox/streets-v12");
  const [query, setQuery] = useState("");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // page-level body class (same as before)
  useEffect(() => {
    document.body.classList.add("map-page");
    document.documentElement.classList.add("map-page");
    return () => {
      document.body.classList.remove("map-page");
      document.documentElement.classList.remove("map-page");
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      console.log("CLICKED ELEMENT:", e.target);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // IMPORTANT: these hooks must run only once per map instance
  useBaseMapInitialize(mapContainer, mapRef, styleManagerRef, style);
  useBaseMapStyle(mapRef, styleManagerRef, style);

  const { flyTo, easeTo } = useBaseMapCamera(mapRef);

  useBaseMapEvents(mapRef);

  useInfoMapDiscovery(mapRef);

  return (
    <>
      <div className="map-wrapper">
        <div ref={mapContainer} className="map-container" />

        <div className="map-ui">

          <button
            className="menu-button"
            onClick={() => setIsMenuOpen(v => !v)}
          >
            ☰
          </button>

          <div className={`menu-panel ${isMenuOpen ? "menu-panel--open" : ""}`}>
            <h3>Map Options</h3>

            <div className="menu-section">
              <CustomDropdown
                label="Map Style"
                value={style}
                onChange={setStyle}
                options={[
                  { label: "Streets", value: "mapbox://styles/mapbox/streets-v12" },
                  { label: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v12" },
                  { label: "Satellite", value: "mapbox://styles/mapbox/satellite-streets-v12" },
                ]}
              />
            </div>


            <div className="menu-section">
              <h4>Layout</h4>
            </div>

            <div className="menu-section">
              <h4>Categories</h4>
            </div>
          </div>

          <InfoMapControls
            flyTo={flyTo}
            easeTo={easeTo}
            mapRef={mapRef}
            style={style}
            setStyle={setStyle}
            query={query}
            setQuery={setQuery}
          />

        </div>
      </div>
    </>
  );
}

export default React.memo(InfoMapPage);
