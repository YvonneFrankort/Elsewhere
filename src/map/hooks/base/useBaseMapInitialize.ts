import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../../../lib/mapbox";
import { StyleManager } from "../../core/style/StyleManager";

export function useBaseMapInitialize(
  mapContainer: React.RefObject<HTMLDivElement | null>,
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  styleManagerRef: React.MutableRefObject<StyleManager | null>,
  style: string
) {
  const didInit = useRef(false);

  useEffect(() => {
    // Prevent double initialization (React StrictMode)
    if (didInit.current) return;
    didInit.current = true;

    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // --- MAP CREATION --------------------------------------------------------
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style,
      center: [23.7610, 61.4981], // fallback: Oulu
      zoom: 9.8,
      pitch: 65,
      bearing: 12,
      dragRotate: true,
      touchZoomRotate: true,
      attributionControl: false,
      interactive: true,
      locale: {},
    });

    mapRef.current = map;

    // --- CONTROL REMOVAL -----------------------------------------------------
    const removeControls = () => {
      setTimeout(() => {
        document
          .querySelectorAll(
            ".mapboxgl-ctrl-top-right, .mapboxgl-ctrl-bottom-right"
          )
          .forEach((el) => el.remove());
      }, 50);
    };

    // --- MAP LOAD ------------------------------------------------------------
    map.on("load", () => {
      try {
        map.touchZoomRotate.enableRotation();
      } catch {}

      try {
        map.addControl(new mapboxgl.ScaleControl(), "bottom-left");
      } catch {}

      removeControls();
      setTimeout(() => map.resize(), 100);
    });

    // --- STYLE LOAD ----------------------------------------------------------
    map.on("style.load", () => {
      removeControls();

      if (!styleManagerRef.current) {
        try {
          styleManagerRef.current = new StyleManager(map, style);
        } catch (err) {
          console.error("Failed to init StyleManager:", err);
        }
      }
    });

    // --- CLEANUP -------------------------------------------------------------
    // IMPORTANT: do NOT remove the map in dev mode (StrictMode double mount)
    return () => {
      if (!import.meta.env.DEV) {
        if (mapRef.current === map) {
          map.remove();
          mapRef.current = null;
        }
      }
    };
  }, [mapContainer, mapRef, styleManagerRef, style]);
}
