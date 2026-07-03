

// This loader will later fetch:
// - current weather
// - hourly forecast
// - daily forecast
// - weather codes
// - alerts
// - sunrise/sunset
// from the Open-Meteo API

import type { Feature, Point } from "geojson";
import type { LoaderParams } from "./types";

// Placeholder normalization
function normalizeToGeoJSON(): Feature<Point> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [0, 0]
    },
    properties: {
      id: "placeholder",
      name: "Placeholder",
      categories: []
    }
  };
}

export async function load(params: LoaderParams): Promise<Feature<Point>[]> {
  // No API key yet → return empty array
  return [];
}

