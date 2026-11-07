import { usePlacesStore } from "./usePlacesStore";
import { useInfoMapUI } from "./useInfoMapUI";
import type { Feature, FeatureCollection } from "geojson";
import { useCategoryState } from "./useCategoryState";
import { resolveCategory } from "../data/resolveCategory";
import { resolveTags } from "../data/resolveTags";

// Loaders
import { load as loadGeoapify } from "../data/loaders/geoapify";
import * as OSMLoader from "../data/loaders/osm";
import { loadParks } from "../data/loaders/nps/parks";
import { loadVisitorCenters } from "../data/loaders/nps/visitorCenters";
import { loadAlerts } from "../data/loaders/nps/alerts";
import { loadEvents } from "../data/loaders/nps/events";
import { loadTrails } from "../data/loaders/nps/trails";
import { loadCurated } from "../data/loaders/curated";
import { loadLocalEvents } from "../data/loaders/events/loadLocalEvents"
import { loadTours } from "../data/loaders/nps/tours";

import type { NPSEvent } from "../data/loaders/nps/events";
import type { NPSAlert } from "../data/loaders/nps/alerts";
import type { NPSTour } from "../data/loaders/nps/tours";

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
/*     if (resolution.nps) {
      promises.push(loadParks(params));
      promises.push(loadVisitorCenters(params));
      promises.push(loadAlerts(params));
      promises.push(loadEvents(params));
      promises.push(loadTrails(params));
    } */

// NPS PARK CATEGORIES
const npsParkCategories = [
  "national_park",
  "national_monument",
  "national_preserve",
  "national_historic_site",
  "national_recreation_area",
  "national_seashore",
  "national_river",
  "national_lakeshore"
];

const showNPSParks = activeCategories.some(id =>
  npsParkCategories.includes(id)
);

// Load parks and related information together
if (showNPSParks) {
  const [parks, events, alerts, tours] = await Promise.all([
    loadParks(params),
    loadEvents(params),
    loadAlerts(params),
    loadTours(params),
  ]);

  // Group events by parkCode
  const eventsByPark = new Map<string, NPSEvent[]>();

  events.forEach(event => {
    const code = event.parkCode;

    if (!eventsByPark.has(code)) {
      eventsByPark.set(code, []);
    }

    eventsByPark.get(code)!.push(event);
  });

  // Group alerts by parkCode
  const alertsByPark = new Map<string, NPSAlert[]>();

  alerts.forEach(alert => {
    const code = alert.parkCode;

    if (!alertsByPark.has(code)) {
      alertsByPark.set(code, []);
    }

    alertsByPark.get(code)!.push(alert);
  });

    // Group tours by parkCode
  const toursByPark = new Map<string, NPSTour[]>();

  tours.forEach(tour => {
    const code = tour.park?.parkCode;
    if (!code) return;

    if (!toursByPark.has(code)) toursByPark.set(code, []);
    toursByPark.get(code)!.push(tour);
  });

  // Attach events and alerts to their parks
  const parksWithDetails = parks.map(park => {
    const parkCode = park.properties?.parkCode;

    return {
      ...park,
      properties: {
        ...park.properties,
        events: parkCode
          ? eventsByPark.get(parkCode) ?? []
          : [],
        alerts: parkCode
          ? alertsByPark.get(parkCode) ?? []
          : [],
        tours: parkCode
          ? toursByPark.get(parkCode) ?? []
          : [],  
      }
    };
  });

  console.log("🎟️ NPS tours:", tours.length);
  console.log("TOUR PARK:", tours[0]?.park);
console.log(
  "TOUR PARK CODES:",
  tours.map(t => ({
    title: t.title,
    parkCode: t.park?.parkCode,
    parkName: t.park?.fullName
  }))
);
  console.log("FIRST NPS TOUR:", tours[0]);

  promises.push(Promise.resolve(parksWithDetails));
}

// Load visitor centers only when Visitor Centers is selected
if (activeCategories.includes("visitor_center")) {
  promises.push(loadVisitorCenters(params));
}

// Load trails only when Trails is selected
if (activeCategories.includes("trails")) {
  promises.push(loadTrails(params));
}

    // WEATHER
    if (resolution.weather) {
      promises.push(OpenMeteoLoader.load(params));
    }

    const results = await Promise.all(promises);

    console.log("📦 Loader results:", results.map(r => r.length));

/* const merged: Feature[] = results
  .flat()
  .map(resolveTags); */

  const merged: Feature[] = results
  .flat()
  .map(resolveTags)
  .map((feature, index) => ({
    ...feature,
    properties: {
      ...feature.properties,
      id:
        feature.properties?.id ??
        `${feature.properties?.name}-${index}`
    }
  }));

    console.log("🧩 Total merged features:", merged.length);

    // TODO:
// Curated currently loads alongside Geoapify.
// Not user-visible.
// Causes extra merged features.
// Revisit after category system is stable.


console.log(
  "[Merged First]",
  merged[0]?.properties?.name,
  merged[0]?.properties?.source,
  merged[0]?.properties?.category,
  merged[0]?.properties?.subcategory
);

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
