import { usePlacesStore } from "./usePlacesStore";
import { useInfoMapUI } from "./useInfoMapUI";
import type { Feature, FeatureCollection } from "geojson";
import { useCategoryState } from "./useCategoryState";

// NEW loaders
import { load as loadGeoapify } from "../data/loaders/geoapify";
import * as OSMLoader from "../data/loaders/osm";
import * as NPSLoader from "../data/loaders/nps";
import * as EventbriteLoader from "../data/loaders/eventbrite";
import * as NominatimLoader from "../data/loaders/nominatim";
import * as OpenMeteoLoader from "../data/loaders/openmeteo";

// ---------------------------------------------
// State bounding boxes (static, stable data)
// ---------------------------------------------
const STATE_BOUNDS = {
  ga: { minLat: 30.3, maxLat: 35.0, minLon: -85.6, maxLon: -80.8 },
  ky: { minLat: 36.5, maxLat: 39.1, minLon: -89.6, maxLon: -81.9 },
  nc: { minLat: 33.8, maxLat: 36.6, minLon: -84.3, maxLon: -75.4 },
  sc: { minLat: 32.0, maxLat: 35.2, minLon: -83.4, maxLon: -78.5 },
  tn: { minLat: 34.9, maxLat: 36.7, minLon: -90.3, maxLon: -81.6 },
  va: { minLat: 36.5, maxLat: 39.5, minLon: -83.7, maxLon: -75.2 },
  wv: { minLat: 37.2, maxLat: 40.6, minLon: -82.7, maxLon: -77.7 }
};

// ---------------------------------------------
// Compute which states intersect the search radius
function getStatesIntersectingRadius(
  center: { lat: number; lng: number },
  radiusKm: number
) {

  const lat = center.lat;
  const lon = center.lng;

  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / 85;

  const searchBox = {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta
  };

  return Object.entries(STATE_BOUNDS)
    .filter(([_, b]) =>
      !(
        searchBox.maxLat < b.minLat ||
        searchBox.minLat > b.maxLat ||
        searchBox.maxLon < b.minLon ||
        searchBox.minLon > b.maxLon
      )
    )
    .map(([state]) => state);
}

export function useInfoMapData() {
  const setPlaces = usePlacesStore((s) => s.setPlaces);
  const setLoading = useInfoMapUI((s) => s.setLoading);

  // ⭐ Multi-category state
  const activeCategories = useCategoryState((s) => s.activeCategories);

  async function loadPlacesForItem(map: mapboxgl.Map) {
    setLoading(true);

    const center = map.getCenter();
    const lat = center.lat;
    const lon = center.lng;

    const params = {
      latitude: lat,
      longitude: lon,
      radiusKm: 50
    };

    console.log("🔵 Loading categories:", activeCategories);
    console.log("📍 Map center:", { lat, lon });

    // ⭐ Determine which states intersect the search area
    const statesToLoad = getStatesIntersectingRadius(center, params.radiusKm);

    // ⭐ Load all selected categories across all states
    const results = await Promise.all([
      loadGeoapify(params, activeCategories),
      ...statesToLoad.map((st) =>
        OSMLoader.load(params, st, activeCategories)
      ),
      NPSLoader.load(params),
      EventbriteLoader.load(params),
      NominatimLoader.load(params),
      OpenMeteoLoader.load(params)
    ]);

    console.log("📦 Loader results:", {
      geoapify: results[0]?.length,
      osm: results.slice(1, 1 + statesToLoad.length).flat().length,
      nps: results[1 + statesToLoad.length]?.length,
      eventbrite: results[2 + statesToLoad.length]?.length,
      nominatim: results[3 + statesToLoad.length]?.length,
      openmeteo: results[4 + statesToLoad.length]?.length
    });

    const merged: Feature[] = results.flat();

    console.log("🧩 Total merged features:", merged.length);

    setPlaces(merged);

    const source = map.getSource("info-places") as mapboxgl.GeoJSONSource;
    if (source) {
      const geojson: FeatureCollection = {
        type: "FeatureCollection",
        features: merged
      };
      source.setData(geojson);
    }

    setLoading(false);
  }

  return { loadPlacesForItem };
}
