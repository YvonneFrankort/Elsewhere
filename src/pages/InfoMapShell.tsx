import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import React from "react";
import "../map-ui.css";
import "../styles/map-location-ping.css";

import { useBaseMapInitialize } from "../map/hooks/base/useBaseMapInitialize";
import { useBaseMapStyle } from "../map/hooks/base/useBaseMapStyle";
import { useBaseMapCamera } from "../map/hooks/base/useBaseMapCamera";
import { useBaseMapEvents } from "../map/hooks/base/useBaseMapEvents";

import { useInfoMapDiscovery } from "../map/hooks/info/useInfoMapDiscovery";

import { StyleManager } from "../map/core/style/StyleManager";
import "../styles/map-location-ping.css";

import InfoMapControls from "../map/info/ui/desktop/MapDesktopControls";
// NEW DESKTOP UI — enabled
//import InfoMapDesktop from "./InfoMapDesktop";
import InfoMapMobile from "../map/info/ui/mobile/MapMobileMenu";

function InfoMapShell() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleManagerRef = useRef<StyleManager | null>(null);

  const [style, setStyle] = useState("mapbox://styles/mapbox/streets-v12");
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.body.classList.add("map-page");
    document.documentElement.classList.add("map-page");
    return () => {
      document.body.classList.remove("map-page");
      document.documentElement.classList.remove("map-page");
    };
  }, []);

  useBaseMapInitialize(mapContainer, mapRef, styleManagerRef, style);
  useBaseMapStyle(mapRef, styleManagerRef, style);

  const { flyTo, easeTo } = useBaseMapCamera(mapRef);

  useBaseMapEvents(mapRef);
  useInfoMapDiscovery(mapRef);

  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  function handleLocateMe() {
    if (!mapRef.current || !mapRef.current.loaded()) return;

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;

        // Remove old marker
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        // Create pulsing dot
        const el = document.createElement("div");
        el.className = "pulse-marker";

        userMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current!);

        // Smooth zoom + center
        mapRef.current!.easeTo({
          center: [longitude, latitude],
          zoom: 16,
          pitch: 50,
          duration: 800,
        });
      },
      (err) => {
        console.error("GEO ERROR", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  return (
    <div className="map-wrapper">
      <div ref={mapContainer} className="map-container" />

      <InfoMapControls
        flyTo={flyTo}
        easeTo={easeTo}
        mapRef={mapRef}
        style={style}
        setStyle={setStyle}
        query={query}
        setQuery={setQuery}
      />
      <InfoMapMobile />

      <button className="map-fab" onClick={handleLocateMe}>
        <img src="/icons/location.svg" alt="Locate me" />
      </button>

    </div>
  );
}

export default React.memo(InfoMapShell);
