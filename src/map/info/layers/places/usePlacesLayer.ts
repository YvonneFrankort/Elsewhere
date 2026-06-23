import { useEffect } from "react";
import type { Feature, FeatureCollection } from "geojson";
import mapboxgl from "mapbox-gl";

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
      const geojson: FeatureCollection = {
        type: "FeatureCollection",
        features: places ?? [],
      };

      const src = map.getSource("info-places") as mapboxgl.GeoJSONSource;
      if (src) {
        src.setData(geojson);
      }
    }
  }, [mapRef, places, selectPlace]);
}
