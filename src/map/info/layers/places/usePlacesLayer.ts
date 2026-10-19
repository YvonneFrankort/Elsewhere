import { useEffect } from "react";
import type { Feature, FeatureCollection } from "geojson";
import mapboxgl from "mapbox-gl";
import { applyMarkerStyle } from "../../../shared/markers";


export function usePlacesLayer(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  places: Feature[],
  selectPlace: (place: Feature) => void
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.isStyleLoaded()) {
      map.once("load", () => updateSource(map));
      return;
    }

    updateSource(map);

    function updateSource(map: mapboxgl.Map) {

      console.log(
  "[PlacesLayer] Places Count",
  places.length
);

      const geojson: FeatureCollection = {
        type: "FeatureCollection",
        features: (places ?? []).map(applyMarkerStyle),
      };

      console.log(
  "[PlacesLayer] GeoJSON Count",
  geojson.features.length
);

if (geojson.features.length > 0) {
  console.log(
    "[PlacesLayer] First Feature",
    geojson.features[0].properties
  );
}

      const src = map.getSource("info-places") as mapboxgl.GeoJSONSource;
      if (src) {

console.log(
  "[Markers] First Feature",
  geojson.features[0]
);

console.log(
  "[Markers] Feature Count",
  geojson.features.length
);

        src.setData(geojson);
      }
    }
  }, [mapRef, places]);
}
