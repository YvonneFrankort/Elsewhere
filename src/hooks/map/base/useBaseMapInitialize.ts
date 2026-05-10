import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../../../lib/mapbox";

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

export function useBaseMapInitialize(
  mapContainer: React.RefObject<HTMLDivElement | null>,
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  style: string
)
 {
  useEffect(() => {
    if (!mapContainer.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapContainer.current!,
          style,
          center: [25.47, 65.01],
          zoom: 11,
          pitch: 20,
          bearing: 0,
        });

        mapRef.current = map;

        map.on("load", () => {
          applyCustomLayers(map);

          map.addControl(new mapboxgl.NavigationControl(), "top-right");
          map.addControl(
            new mapboxgl.ScaleControl({ maxWidth: 120, unit: "metric" }),
            "bottom-left"
          );

          setTimeout(() => map.resize(), 100);
        });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
}
