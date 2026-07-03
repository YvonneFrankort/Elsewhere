import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../../../lib/mapbox";
import { StyleManager } from "../../core/style/StyleManager";
import { initializeGlobalTiles } from "./useGlobalTiles";

export function useGlobalMapInitialize(
  mapContainer: React.RefObject<HTMLDivElement | null>,
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  styleManagerRef: React.MutableRefObject<StyleManager | null>,
  style: string
) {

  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // --- MAP CREATION --------------------------------------------------------
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style,
      center: [23.7610, 61.4981],
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
      initializeGlobalTiles(map);


      // --- GLOBAL SOURCES ----------------------------------------------------

      if (!map.getSource("info-places")) {
        map.addSource("info-places", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: []
          }
        });
      }

      // --- GLOBAL LAYERS -----------------------------------------------------
      if (!map.getLayer("osm-lines")) {
        map.addLayer({
          id: "osm-lines",
          type: "line",
          source: "info-places",
          filter: ["==", ["geometry-type"], "LineString"],
          paint: {
            "line-color": "#ff00ff",
            "line-width": 2
          }
        });
      }

      if (!map.getLayer("osm-polygons")) {
        map.addLayer({
          id: "osm-polygons",
          type: "fill",
          source: "info-places",
          filter: ["==", ["geometry-type"], "Polygon"],
          paint: {
            "fill-color": "rgba(0, 150, 255, 0.3)",
            "fill-outline-color": "#004466"
          }
        });
      }

      if (!map.getLayer("osm-points")) {
        map.addLayer({
          id: "osm-points",
          type: "circle",
          source: "info-places",
          filter: ["==", ["geometry-type"], "Point"],
          paint: {
            "circle-color": "#ff0000",
            "circle-radius": 5
          }
        });
      }
    });

    // --- CLEANUP -------------------------------------------------------------
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
