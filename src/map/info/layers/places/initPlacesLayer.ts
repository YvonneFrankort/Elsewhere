import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { registerIcons } from "../../../shared/markers";

export function useInitPlacesLayer(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  selectPlace: (place: any) => void
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    

async function setup() {
  console.log("SETUP RUNNING TEST");
  
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

/* console.log("BEFORE ADD SOURCE");

  m.addSource("info-places", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
  }); */

  //console.log("AFTER ADD SOURCE");

/*   m.addLayer({
    id: "info-places-layer",
    type: "symbol",
    source: "info-places",
layout: {
  "icon-image": ["get", "icon"],
  "icon-size": ["get", "size"],
  "icon-allow-overlap": true
}
  }); */

/*    console.log(
  "[Markers] Layer exists?",
  !!m.getLayer("info-places-layer")
); */

m.on("click", "info-places-layer", (e) => {
  const feature = e.features?.[0];

  if (!feature) return;

  selectPlace(feature);
});

}


    if (!map.isStyleLoaded()) {
      map.once("load", setup);
    } else {
      setup();
    }
  }, [mapRef]);
}
