import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { LeftPanel } from "../components/LeftPanel/LeftPanel";
import React from "react";

import { useBaseMapInitialize } from "../hooks/map/base/useBaseMapInitialize";
import { useBaseMapStyle } from "../hooks/map/base/useBaseMapStyle";
import { useBaseMapCamera } from "../hooks/map/base/useBaseMapCamera";
import { useBaseMapEvents } from "../hooks/map/base/useBaseMapEvents";

import InfoMapControls from "../components/ui/info/InfoMapControls";

import { useInfoMapDiscovery } from "../hooks/map/info/useInfoMapDiscovery";
import { StyleManager } from "../map/style/StyleManager";

function InfoMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleManagerRef = useRef<StyleManager | null>(null);

  const [style, setStyle] = useState("mapbox://styles/mapbox/streets-v12");
  const [query, setQuery] = useState("");

  // page-level body class (same as before)
  useEffect(() => {
    document.body.classList.add("map-page");
    document.documentElement.classList.add("map-page");
    return () => {
      document.body.classList.remove("map-page");
      document.documentElement.classList.remove("map-page");
    };
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
      </div>

      <LeftPanel />

      <InfoMapControls
        flyTo={flyTo}
        easeTo={easeTo}
        style={style}
        setStyle={setStyle}
        query={query}
        setQuery={setQuery}
        mapRef={mapRef}
      />
    </>
  );
}

export default React.memo(InfoMapPage);
