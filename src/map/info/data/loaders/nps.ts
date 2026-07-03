

// This loader will later fetch:
// - US National Parks
// - National Monuments
// - Historic Sites
// - Park alerts
// - Park events
// - Entrance fees
// - Visitor centers
// - Campgrounds
// from the US National Park Service API

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

