import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../../../lib/mapbox";
import { StyleManager } from "../../core/style/StyleManager";

export function useBaseMapInitialize(
  mapContainer: React.RefObject<HTMLDivElement | null>,
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  styleManagerRef: React.MutableRefObject<StyleManager | null>,
  style: string,
  setUserLocation: (loc: { lat: number; lng: number }) => void
) {
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

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
    (window as any).debugMap = map;

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
      map.touchZoomRotate.enableRotation();
      map.addControl(new mapboxgl.ScaleControl(), "bottom-left");

      removeControls();
      setTimeout(() => map.resize(), 100);
    });

    // --- STYLE LOAD ----------------------------------------------------------
    map.on("style.load", () => {
      removeControls();

      if (!styleManagerRef.current) {
        styleManagerRef.current = new StyleManager(map, style);
      }
    });

    // --- CLEANUP -------------------------------------------------------------
    return () => {
      if (mapRef.current === map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, []);
}
