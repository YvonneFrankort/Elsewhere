import type { Feature, Point } from "geojson";
import type { LoaderParams } from "../types";

// Placeholder search loader (returns nothing for now)
export async function load(params: LoaderParams): Promise<Feature<Point>[]> {
  return [];
}
