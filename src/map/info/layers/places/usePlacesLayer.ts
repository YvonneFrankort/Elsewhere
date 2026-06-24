import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import type { PlaceItemData } from "../../state/usePlacesStore";

export function usePlacesLayer(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  places: PlaceItemData[],
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
      const geojson = {
        type: "FeatureCollection" as const,
        features: places.map((p) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [p.longitude, p.latitude],
          },
          properties: {
            id: p.id,
            name: p.name,
            category: p.category,
          },
        })),
      };

      const src = map.getSource("info-places") as mapboxgl.GeoJSONSource;
      if (src) {
        src.setData(geojson);
      }
    }
  }, [mapRef, places]);
}
