// src/map/layers/base3D.ts
import mapboxgl from "mapbox-gl";

export const base3D = {
  add(map: mapboxgl.Map) {
    // 3D buildings layer
    if (!map.getLayer("3d-buildings")) {
      map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 14,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.6
          }
        },
        "waterway-label" // place under labels
      );
    }
  }
};
