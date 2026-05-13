import { useEffect } from "react";
import mapboxgl from "mapbox-gl";

function applyCustomLayers(map: mapboxgl.Map) {
  if (!map.getSource("mapbox-dem")) {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });
  }

  map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });

  if (!map.getLayer("sky")) {
    map.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-sun": [0.0, 0.0],
        "sky-atmosphere-sun-intensity": 15,
      },
    });
  }

  if (!map.getLayer("3d-buildings")) {
    map.addLayer({
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#aaa",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": ["get", "min_height"],
        "fill-extrusion-opacity": 0.6,
      },
    });
  }
}

export function useBaseMapStyle(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  style: string
) {
useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  // Only switch style if map is fully loaded
  if (!map.isStyleLoaded()) {
    console.warn("Map not ready for style switch yet");
    return;
  }

  map.setStyle(style, { diff: true } as any);

  const onStyleLoad = () => {
    applyCustomLayers(map);
  };

  map.on("style.load", onStyleLoad);

  return () => {
    map.off("style.load", onStyleLoad);
  };
}, [mapRef, style]);

}
