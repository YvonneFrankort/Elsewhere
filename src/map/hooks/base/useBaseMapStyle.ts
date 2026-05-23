import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { StyleManager } from "../../../map/core/style/StyleManager";

export function useBaseMapStyle(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  styleManagerRef: React.MutableRefObject<StyleManager | null>,
  style: string
) {
  useEffect(() => {
    const map = mapRef.current;
    const manager = styleManagerRef.current;
    if (!map || !manager) return;

    // ⭐ Use StyleManager instead of map.setStyle
    manager.setStyle(style);

  }, [mapRef, styleManagerRef, style]);
}
