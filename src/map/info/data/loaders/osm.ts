import type { InfoPlace } from "../../types/InfoPlace";
import type { LoaderParams } from "../useInfoData";

// This loader will later fetch:
// - hiking trails
// - walking routes
// - cycling routes
// - surfaces
// - difficulty (sac_scale)
// - elevation gain (computed later)
// - trailheads
// from OSM Overpass API

export async function load(params: LoaderParams): Promise<InfoPlace[]> {
  // Placeholder: return empty array for now
  return [];
}
