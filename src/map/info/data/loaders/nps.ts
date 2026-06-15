import type { InfoPlace } from "../../types/InfoPlace";
import type { LoaderParams } from "../useInfoData";

// This loader will later fetch:
// - US National Parks
// - National Monuments
// - Historic Sites
// - Park alerts (closures, wildlife, weather)
// - Park events
// - Entrance fees
// - Visitor centers
// - Campgrounds
// from the US National Park Service API

export async function load(params: LoaderParams): Promise<InfoPlace[]> {
  // Placeholder: return empty array for now
  return [];
}
