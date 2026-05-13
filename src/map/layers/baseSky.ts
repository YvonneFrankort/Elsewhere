// src/map/layers/baseSky.ts
import mapboxgl from "mapbox-gl";

export const baseSky = {
  add(map: mapboxgl.Map) {
    if (!map.getLayer("sky")) {
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 90.0],
          "sky-atmosphere-sun-intensity": 15
        }
      });
    }

    // Default pitch + bearing for horizon effect
    map.setPitch(45);
    map.setBearing(-17.6);
  }
};
