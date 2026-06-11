import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../../../lib/mapbox";
import { StyleManager } from "../../core/style/StyleManager";

export function useBaseMapInitialize(
  mapContainer: React.RefObject<HTMLDivElement | null>,
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  styleManagerRef: React.MutableRefObject<StyleManager | null>,
  style: string
) {
  useEffect(() => {
    console.log("🔥 useBaseMapInitialize is running");

    if (!mapContainer.current) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style,
      center: [24.9384, 60.1699],
      zoom: 9.8,
      pitch: 65,
      bearing: 12,
      dragRotate: true,
      touchZoomRotate: true,
      attributionControl: false,
      interactive: true,
      locale: {},
    });

    console.log("MAP INSTANCE CREATED");
    (window as any).debugMap = map;
    mapRef.current = map;

    // ⭐ NEW: shared removal function
    function removeControls() {
      setTimeout(() => {
        document
          .querySelectorAll(
            ".mapboxgl-ctrl-top-right, .mapboxgl-ctrl-bottom-right"
          )
          .forEach((el) => el.remove());
      }, 50);
    }

    map.on("load", () => {
      map.touchZoomRotate.enableRotation();
      map.addControl(new mapboxgl.ScaleControl(), "bottom-left");

      removeControls();          // ⭐ remove on load
      setTimeout(() => map.resize(), 100);
    });

    map.on("style.load", () => {
      console.log("STYLE LOAD FIRED");

      removeControls();          // ⭐ remove AGAIN on style reload

      if (!styleManagerRef.current) {
        styleManagerRef.current = new StyleManager(map, style);
        console.log("StyleManager created");
      }
    });

    return () => {
      if (mapRef.current === map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, []);
}
