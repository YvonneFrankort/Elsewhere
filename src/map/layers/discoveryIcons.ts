// src/map/layers/discoveryIcons.ts
import mapboxgl from "mapbox-gl";
import { loadInfoIcon } from "../icons/loadInfoIcon";

export const discoveryIcons = {
  categories: ["city", "info-park", "trail", "info-museum", "info-attraction", "event"],

  async add(map: mapboxgl.Map) {
    const sourceId = "info-places-source";

    // Load icons
    await Promise.all(this.categories.map((cat) => loadInfoIcon(map, cat)));

    // Icon layer
    if (!map.getLayer("info-places-layer")) {
      map.addLayer({
        id: "info-places-layer",
        type: "symbol",
        source: sourceId,
        layout: {
          "icon-image": ["get", "category"],
          "icon-size": [
            "interpolate", ["linear"], ["zoom"],
            8, 0.9,
            14, 1.2
          ],
          "icon-anchor": "center",
          "icon-allow-overlap": true
        }
      });
    }
  }
};
