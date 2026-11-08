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
import { useRef } from "react";

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
  const requestIdRef = useRef(0);

  async function loadPlacesForItem(map: mapboxgl.Map) {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    const center = map.getCenter();
    const params = {
      latitude: center.lat,
      longitude: center.lng,
      radiusKm: 50
    };

    console.log("🔵 Loading categories:", activeCategories);
    console.log("📍 Map center:", { lat: params.latitude, lon: params.longitude });

// Main map / curated data: 50 km
const statesToLoad = getStatesIntersectingRadius(center, params.radiusKm);

// NPS: wider 150 km search area
const npsStates = getStatesIntersectingRadius(center, 150);

console.log("📍 Actual map centre:", center);
console.log("📍 NPS search radius:", 150);

const npsParams = {
  ...params,
  radiusKm: 150,
  state: npsStates.join(",")
};

console.log("🗺️ NPS states:", npsStates);

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
console.log("🌲 Active categories:", activeCategories);
console.log("🌲 showNPSParks:", showNPSParks);

if (showNPSParks) {
const [
  parksResult,
  eventsResult,
  alertsResult,
  toursResult
] = await Promise.allSettled([
  loadParks(npsParams),
  loadEvents(npsParams),
  loadAlerts(npsParams),
  loadTours(npsParams),
]);

const parks = parksResult.status === "fulfilled" ? parksResult.value : [];
const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];
const alerts = alertsResult.status === "fulfilled" ? alertsResult.value : [];
const tours = toursResult.status === "fulfilled" ? toursResult.value : [];

if (parksResult.status === "rejected") {
  console.error("NPS parks failed:", parksResult.reason);
}
if (eventsResult.status === "rejected") {
  console.error("NPS events failed:", eventsResult.reason);
}
if (alertsResult.status === "rejected") {
  console.error("NPS alerts failed:", alertsResult.reason);
}
if (toursResult.status === "rejected") {
  console.error("NPS tours failed:", toursResult.reason);
}

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


// Keep only the NPS park categories currently selected
const selectedParks = parks.filter(park =>
  activeCategories.includes(String(park.properties?.category))
);

// Attach events, alerts and tours to the selected parks
const parksWithDetails = selectedParks.map(park => {
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

  console.log("🌲 NPS parks after classification:", parks.map(p => ({
  name: p.properties?.name,
  category: p.properties?.category,
  designation: p.properties?.designation
})));

  promises.push(Promise.resolve(parksWithDetails));

  console.log("🌲 NPS features added to promises:", parksWithDetails.length);
console.log("🌲 First NPS feature:", parksWithDetails[0]);
}

// Load visitor centers only when Visitor Centers is selected
if (activeCategories.includes("visitor_center")) {
  promises.push(loadVisitorCenters(npsParams));
}

// Load trails only when Trails is selected
if (activeCategories.includes("trails")) {
  promises.push(loadTrails(npsParams));
}

    // WEATHER
    if (resolution.weather) {
      promises.push(OpenMeteoLoader.load(params));
    }

    const settledResults = await Promise.allSettled(promises);

const results: Feature[][] = settledResults.flatMap((result) => {
  if (result.status === "fulfilled") {
    return [result.value];
  }

  console.error("A map data loader failed:", result.reason);
  return [];
});

// Ignore results from an older request.
if (requestId !== requestIdRef.current) {
  console.log("⏭️ Ignoring outdated map request:", requestId);
  return;
}

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

    if (requestId === requestIdRef.current) {
  setLoading(false);
}
  }

  return { loadPlacesForItem };
}
