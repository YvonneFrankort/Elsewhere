import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { loadIcon } from "../../services/iconService"; 
import type { FeatureCollection, Point } from "geojson";

export function useSearchLayer(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  searchResult: {
    id?: string;
    name?: string;
    latitude: number;
    longitude: number;
  } | null
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = "search-source";
    const layerId = "search-layer";

    // If search is cleared → remove everything
    if (!searchResult) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      return;
    }

    // Build GeoJSON for the single search marker
    const geojson: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: searchResult.id ?? "search",
            category: "search",
            name: searchResult.name ?? "Search Result"
          },
          geometry: {
            type: "Point",
            coordinates: [searchResult.longitude, searchResult.latitude]
          }
        }
      ]
    };

    async function setup() {
      if (!map) return;

      // Load icon for search category
      await loadIcon(map, "search");

      // Add or update source
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: geojson
        });
      } else {
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
      }

      // Add layer if missing
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "symbol",
          source: sourceId,
          layout: {
            "icon-image": "search",
            "icon-size": [
              "interpolate", ["linear"], ["zoom"],
              8, 0.9,
              14, 1.2
            ],
            "icon-anchor": "center",
            "icon-allow-overlap": true
          }
        });
      }
    }

    setup();

    // Cleanup when component unmounts or search changes
    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [mapRef, searchResult]);
}
