
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../../../lib/mapbox";
import { StyleManager } from "../../core/style/StyleManager";

export function useGlobalMapInitialize(
  mapContainer: React.RefObject<HTMLDivElement | null>,
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  styleManagerRef: React.MutableRefObject<StyleManager | null>,
  style: string,
  onMapReady?: (map: mapboxgl.Map) => void
) {
  const didInit = useRef(false);
  const initialStyle = useRef(style);

  useEffect(() => {
    if (didInit.current || !mapContainer.current) return;

    didInit.current = true;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialStyle.current,
      center: [-85.0269, 35.9489],
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

    const scale = new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: "metric",
    });

    map.addControl(scale, "bottom-left");

    const removeControls = () => {
      document
        .querySelectorAll(
          ".mapboxgl-ctrl-top-right, .mapboxgl-ctrl-bottom-right"
        )
        .forEach((el) => el.remove());
    };

    const handleStyleLoad = () => {
      removeControls();

      if (!styleManagerRef.current) {
        try {
          styleManagerRef.current = new StyleManager(
            map,
            initialStyle.current
          );
        } catch (err) {
          console.error("Failed to init StyleManager:", err);
        }
      }

      if (!map.getSource("info-places")) {
        map.addSource("info-places", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });
      }

      if (!map.getLayer("osm-lines")) {
        map.addLayer({
          id: "osm-lines",
          type: "line",
          source: "info-places",
          filter: ["==", ["geometry-type"], "LineString"],
          paint: {
            "line-color": "#ff00ff",
            "line-width": 2,
          },
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
            "fill-outline-color": "#004466",
          },
        });
      }

      onMapReady?.(map);
    };

    map.on("style.load", handleStyleLoad);

    return () => {
      // Keep the map and listener through React's development
      // Strict Mode effect replay.
      if (!import.meta.env.DEV && mapRef.current === map) {
        map.off("style.load", handleStyleLoad);
        map.remove();
        mapRef.current = null;
      }
    };
  }, [mapContainer, mapRef, styleManagerRef, onMapReady]);
}
