import { useEffect } from "react";
import mapboxgl from "mapbox-gl";

export function useInitPlacesLayer(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

function setup() {
  const m = mapRef.current;
  if (!m) return;

  if (m.getSource("info-places")) return;

  m.addSource("info-places", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

  m.addLayer({
    id: "info-places-layer",
    type: "circle",
    source: "info-places",
    paint: {
      "circle-radius": 6,
      "circle-color": "#ff4d4d",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff"
    }
  });
}


    if (!map.isStyleLoaded()) {
      map.once("load", setup);
    } else {
      setup();
    }
  }, [mapRef]);
}
