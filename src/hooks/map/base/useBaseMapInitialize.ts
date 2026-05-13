import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../../../lib/mapbox";
import { StyleManager } from "../../../map/style/StyleManager";

export function useBaseMapInitialize(
  mapContainer: React.RefObject<HTMLDivElement | null>,
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  styleManagerRef: React.MutableRefObject<StyleManager | null>,
  style: string
) {
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style,
      center: [24.9384, 60.1699],
      zoom: 10.8,
      pitch: 58,
      bearing: 12,
    });

    mapRef.current = map;

    // ⭐ Controls + resize only
    map.on("load", () => {
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 120, unit: "metric" }),
        "bottom-left"
      );

      setTimeout(() => map.resize(), 100);
    });

    // ⭐ Create StyleManager ONLY when the style is fully loaded
    map.on("style.load", () => {
  console.log("STYLE LOAD FIRED");

  if (!styleManagerRef.current) {
    styleManagerRef.current = new StyleManager(map, style);
    console.log("StyleManager created");
  }
});


    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
}
