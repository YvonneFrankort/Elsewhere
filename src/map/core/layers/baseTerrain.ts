// src/map/layers/baseTerrain.ts
import mapboxgl from "mapbox-gl";

export const baseTerrain = {
  add(map: mapboxgl.Map) {
    // Add DEM source if missing
    if (!map.getSource("mapbox-dem")) {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.terrain-rgb",
        tileSize: 512,
        maxzoom: 14
      });
    }

    // Enable terrain
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
  }
};
