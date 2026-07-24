import { usePlacesStore } from "./usePlacesStore";
import { useInfoMapUI } from "./useInfoMapUI";
import type { Feature, FeatureCollection } from "geojson";
import { useCategoryState } from "./useCategoryState";
import { resolveCategory } from "../data/resolveCategory";

// Loaders
import { load as loadGeoapify } from "../data/loaders/geoapify";
import * as OSMLoader from "../data/loaders/osm";
import { loadParks } from "../data/loaders/nps/parks";
import { loadVisitorCenters } from "../data/loaders/nps/visitorCenters";
import { loadAlerts } from "../data/loaders/nps/alerts";
import { loadEvents } from "../data/loaders/nps/events";
import { loadTrails } from "../data/loaders/nps/trails";
import { loadCurated } from "../data/loaders/curated";

import * as OpenMeteoLoader from "../data/loaders/openmeteo";

import {
  STATE_BOUNDS,
  getStatesIntersectingRadius,
  isInsideBorderBuffer
} from "../utils/stateBounds";

// ---------------------------------------------
// Multi-category resolver
// ---------------------------------------------
function resolveMulti(activeCategories: string[]) {
  const flags = {
    geoapify: false,
    osm: false,
    nps: false,
    weather: false 
  };

  for (const id of activeCategories) {
    const r = resolveCategory(id);

    flags.geoapify ||= r.geoapify;
    flags.nps ||= r.nps;
    flags.weather ||= r.weather;  
  }

  return flags;
}

// ---------------------------------------------
// Main hook
// ---------------------------------------------
export function useInfoMapData() {
  const setPlaces = usePlacesStore((s) => s.setPlaces);
  const setLoading = useInfoMapUI((s) => s.setLoading);
  const activeCategories = useCategoryState((s) => s.activeCategories);

  async function loadPlacesForItem(map: mapboxgl.Map) {
    setLoading(true);

    const center = map.getCenter();
    const params = {
      latitude: center.lat,
      longitude: center.lng,
      radiusKm: 50
    };

    console.log("🔵 Loading categories:", activeCategories);
    console.log("📍 Map center:", { lat: params.latitude, lon: params.longitude });

    const statesToLoad = getStatesIntersectingRadius(center, params.radiusKm);
    const resolution = resolveMulti(activeCategories);

    const promises: Promise<Feature[]>[] = [];

   // GEOAPIFY (global fallback)
if (resolution.geoapify || statesToLoad.length === 0) {
  promises.push(loadGeoapify(params, activeCategories));
}

// CURATED NATURE (local GeoJSON)
for (const st of statesToLoad) {
  promises.push(loadCurated(params, st, activeCategories));
}

    // NPS
    if (resolution.nps) {
      promises.push(loadParks(params));
      promises.push(loadVisitorCenters(params));
      promises.push(loadAlerts(params));
      promises.push(loadEvents(params));
      promises.push(loadTrails(params));
    }

    // WEATHER
    if (resolution.weather) {
      promises.push(OpenMeteoLoader.load(params));
    }

    const results = await Promise.all(promises);

    console.log("📦 Loader results:", results.map(r => r.length));

    const merged: Feature[] = results.flat();

    console.log("🧩 Total merged features:", merged.length);

    setPlaces(merged);

  /*   const source = map.getSource("info-places") as mapboxgl.GeoJSONSource;
    if (source) {
      const geojson: FeatureCollection = {
        type: "FeatureCollection",
        features: merged
      };
      source.setData(geojson);
    } */

    setLoading(false);
  }

  return { loadPlacesForItem };
}
