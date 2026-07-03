import type { Feature, FeatureCollection } from "geojson";
import { usePlacesStore } from "../state/usePlacesStore";
import { useInfoMapUI } from "../state/useInfoMapUI";

// Loaders
import { load as loadGeoapify } from "../data/loaders/geoapify";
import { load as loadOSM } from "../data/loaders/osm";
import { load as loadNPS } from "../data/loaders/nps";
import { load as loadEventbrite } from "../data/loaders/eventbrite";
import { load as loadNominatim } from "../data/loaders/nominatim";
import { load as loadOpenMeteo } from "../data/loaders/openmeteo";

// Filters + resolver
import { resolveCategory } from "./resolveCategory";

// Marker
import { getMarkerStyle } from "../markers/getMarkerStyle";

// ---------------------------------------------
// State bounding boxes (static, stable data)
// ---------------------------------------------
const STATE_BOUNDS: Record<
  string,
  { minLat: number; maxLat: number; minLon: number; maxLon: number }
> = {
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
// ---------------------------------------------
function getStatesIntersectingRadius(
  center: { lat: number; lng: number },
  radiusKm: number
): string[] {
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

  async function loadPlacesForItem(map: mapboxgl.Map, itemId: string) {
    setLoading(true);

    const center = map.getCenter();
    const params = {
      latitude: center.lat,
      longitude: center.lng,
      radiusKm: 50
    };

    // 1️⃣ Ask resolver which APIs to use
    const resolution = resolveCategory(itemId);

    const promises: Promise<Feature[]>[] = [];

    // 2️⃣ GEOAPIFY (urban scenic, food, entertainment, services)
    if (resolution.geoapify) {
      promises.push(loadGeoapify(params, [itemId]));
    }

    // 3️⃣ OSM (nature scenic, trails, protected areas, wildlife)
    if (resolution.osm) {
      const statesToLoad = getStatesIntersectingRadius(center, params.radiusKm);
      for (const st of statesToLoad) {
        promises.push(loadOSM(params, st, [itemId]));
      }
    }

    // 4️⃣ NPS (US national parks only)
    if (resolution.nps) {
      promises.push(loadNPS(params));
    }

    // 5️⃣ Eventbrite (events only)
    if (resolution.eventbrite) {
      promises.push(loadEventbrite(params));
    }

    // 6️⃣ Nominatim (search only)
    if (resolution.nominatim) {
      promises.push(loadNominatim(params));
    }

    // 7️⃣ Weather (Open-Meteo)
    if (resolution.weather) {
      promises.push(loadOpenMeteo(params));
    }

    // 8️⃣ Run all selected loaders
    const results = await Promise.all(promises);
    const merged: Feature[] = results.flat();

    // Apply marker styles safely
    for (const feature of merged) {
      if (!feature.properties) feature.properties = {};
      if (!feature.properties.tags) feature.properties.tags = {};

      const style = getMarkerStyle(feature);

      feature.properties.icon = style.icon;
      feature.properties.color = style.color;
      feature.properties.size = style.size;
      feature.properties.category = style.category;
      feature.properties.subcategory = style.subcategory;
    }

    // Store in Zustand
    setPlaces(merged);

    // Update Mapbox source
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
