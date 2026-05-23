// src/map/layers/discoveryRings.ts
import mapboxgl from "mapbox-gl";

export const discoveryRings = {
  add(map: mapboxgl.Map) {
    const sourceId = "info-places-source";

    // Outer ring
    if (!map.getLayer("info-ring-outer")) {
      map.addLayer({
        id: "info-ring-outer",
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            8, 12,
            14, 20
          ],
          "circle-color": [
            "match", ["get", "category"],
            "city", "#2563eb",
            "info-park", "#16a34a",
            "trail", "#ea580c",
            "info-museum", "#7c3aed",
            "info-attraction", "#dc2626",
            "event", "#ca8a04",
            "#000000"
          ],
          "circle-stroke-color": "white",
          "circle-stroke-width": 3
        }
      });
    }

    // Inner ring
    if (!map.getLayer("info-ring-inner")) {
      map.addLayer({
        id: "info-ring-inner",
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            8, 8,
            14, 14
          ],
          "circle-color": "white"
        }
      });
    }
  }
};
