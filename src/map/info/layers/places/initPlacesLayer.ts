import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { registerIcons } from "../../../shared/markers";

export function useInitPlacesLayer(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    

async function setup() {
  console.log("[Markers] Setup running");
  
  const m = mapRef.current;
  if (!m) return;

console.log(
"[Markers] Source exists?",
!!m.getSource("info-places")
);

  //if (m.getSource("info-places")) return;

  await registerIcons(m);

  
console.log(
  "[Markers] Has water icon:",
  m.hasImage("water")
);

console.log(
  "[Markers] Has scenic icon:",
  m.hasImage("scenic")
);

  m.addSource("info-places", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  });

  m.addLayer({
    id: "info-places-layer",
    type: "symbol",
    source: "info-places",
layout: {
  "icon-image": ["get", "icon"],
  "icon-size": ["get", "size"],
  "icon-allow-overlap": true
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
