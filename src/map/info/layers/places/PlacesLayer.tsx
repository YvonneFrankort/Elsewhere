import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import type { FeatureCollection, Point } from "geojson";
import { loadIcon } from "../../services/iconService";

export function usePlacesLayer(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  places: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    category: string;
  }>
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = "places-source";
    const layerId = "places-layer";

    // If no places → remove layer + source
    if (!places || places.length === 0) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      return;
    }

    // Build GeoJSON
    const geojson: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: places.map((p) => ({
        type: "Feature",
        properties: {
          id: p.id,
          name: p.name,
          category: p.category
        },
        geometry: {
          type: "Point",
          coordinates: [p.longitude, p.latitude]
        }
      }))
    };

    async function setup() {
      if (!map) return;

      // Load icons for all categories
      const categories = new Set(places.map((p) => p.category));
      for (const cat of categories) {
        await loadIcon(map, cat);
      }

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
            "icon-image": ["get", "category"],
            "icon-size": [
              "interpolate", ["linear"], ["zoom"],
              8, 0.8,
              14, 1.2
            ],
            "icon-anchor": "center",
            "icon-allow-overlap": true
          }
        });
      }
    }

    setup();

    // Cleanup when places change
    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [mapRef, places]);
}
