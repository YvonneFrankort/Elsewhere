import { useMemo, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import type { FeatureCollection, Feature, Point } from "geojson";

export function useInfoMapDiscovery(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) {
  const places = useMemo(
    () => [
      {
        id: "1",
        name: "Test City",
        category: "city",
        latitude: 60.1699,
        longitude: 24.9384,
      },
      {
        id: "2",
        name: "Test National Park",
        category: "info-park",
        latitude: 61.25,
        longitude: 25.0,
      },
      {
        id: "3",
        name: "Test Trail",
        category: "trail",
        latitude: 61.5,
        longitude: 24.5,
      },
      {
        id: "4",
        name: "Test Museum",
        category: "info-museum",
        latitude: 60.20,
        longitude: 24.95
      },
      {
        id: "5",
        name: "Test Attraction",
        category: "info-attraction",
        latitude: 60.25,
        longitude: 24.95
      },
      {
        id: "6",
        name: "Test Event",
        category: "event",
        latitude: 60.30,
        longitude: 24.95
      },
      {
        id: "7",
        name: "Test Museum 2",
        category: "info-museum",
        latitude: 60.1699,
        longitude: 24.9384
      },
      {
        id: "8",
        name: "Test Attraction 2",
        category: "info-attraction",
        latitude: 60.1699,
        longitude: 24.9384
      },
      {
        id: "9",
        name: "Test Park 2",
        category: "info-park",
        latitude: 60.1699,
        longitude: 24.9384
      }
    ],
    []
  );

  const geojson: FeatureCollection = {
    type: "FeatureCollection",
    features: places.map((p): Feature<Point> => ({
      type: "Feature",
      properties: {
        id: p.id,
        name: p.name,
        category: p.category,
      },
      geometry: {
        type: "Point",
        coordinates: [p.longitude, p.latitude],
      },
    })),
  };

  async function loadIcon(map: mapboxgl.Map, name: string) {
    const url = `/icons/info/${name}.png`;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);

      if (!map.hasImage(name)) {
        map.addImage(name, bitmap, { pixelRatio: 1 });
      }
    } catch (err) {
      console.error("Failed to load icon:", name, err);
    }
  }

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = "info-places-source";
    const layerId = "info-places-layer";

    map.on("load", async () => {
      // Add or update source
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: geojson,
        });
      } else {
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
      }

      const categories = ["city", "info-park", "trail", "info-museum", "info-attraction", "event"];

      // Wait for icons
      await Promise.all(categories.map((cat) => loadIcon(map, cat)));

      // ⭐ Outer ring (zoom scaling)
      if (!map.getLayer("info-ring-outer")) {
        map.addLayer({
          id: "info-ring-outer",
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              8, 12,
              14, 20
            ],
            "circle-color": [
              "match",
              ["get", "category"],
              "city", "#2563eb",
              "info-park", "#16a34a",
              "trail", "#ea580c",
              "info-museum", "#7c3aed",
              "info-attraction", "#dc2626",
              "event", "#ca8a04",
              "#000000"
            ],
            "circle-stroke-color": "white",
            "circle-stroke-width": 3
          }
        });
      }

      // ⭐ Inner white circle (zoom scaling)
      if (!map.getLayer("info-ring-inner")) {
        map.addLayer({
          id: "info-ring-inner",
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              8, 8,
              14, 14
            ],
            "circle-color": "white"
          }
        });
      }

      // ⭐ Icon layer (zoom scaling)
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "symbol",
          source: sourceId,
          layout: {
            "icon-image": ["get", "category"],
            "icon-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              8, 0.9,
              14, 1.2
            ],
            "icon-anchor": "center",
            "icon-allow-overlap": true
          }
        });
      }
    });

    return () => {
      const map = mapRef.current;
      if (!map) return;

      if (map.isStyleLoaded()) {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      }
    };
  }, []);

  return { places };
}
