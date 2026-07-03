
// This loader will later fetch:
// - events
// - markets
// - fairs
// - festivals
// - workshops
// - concerts
// - seasonal events
// from the Eventbrite API

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

