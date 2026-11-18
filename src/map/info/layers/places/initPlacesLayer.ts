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

console.log("🥾 Trail line layer exists:", !!m.getLayer("osm-lines"));
console.log("🥾 Trail source exists:", !!m.getSource("info-places"));

  
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


// NPS trail line selection
m.on("click", "osm-lines", (e) => {
  const feature = e.features?.[0];

  if (!feature) return;

  // Only handle NPS trail features
  if (
    feature.properties?.source !== "nps" ||
    (
      feature.properties?.category !== "trails" &&
      feature.properties?.subcategory !== "trails"
    )
  ) {
    return;
  }

  console.log("🥾 Selected NPS trail:", feature.properties);

  selectPlace(feature);
});

// Show a pointer when hovering over NPS trails
m.on("mouseenter", "osm-lines", () => {
  m.getCanvas().style.cursor = "pointer";
});

m.on("mouseleave", "osm-lines", () => {
  m.getCanvas().style.cursor = "";
});

}


    if (!map.isStyleLoaded()) {
      map.once("load", setup);
    } else {
      setup();
    }
  }, [mapRef]);
}
