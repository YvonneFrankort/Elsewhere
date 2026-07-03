// This loader will later fetch:
// - city names
// - reverse geocoding results
// - addresses
// - administrative areas
// - place names
// from the Nominatim API (OpenStreetMap)

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
