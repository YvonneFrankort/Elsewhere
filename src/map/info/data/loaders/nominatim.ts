import type { InfoPlace } from "../../types/InfoPlace";
import type { LoaderParams } from "../useInfoData";

// This loader will later fetch:
// - city names
// - reverse geocoding results
// - addresses
// - administrative areas
// - place names
// from the Nominatim API (OpenStreetMap)

export async function load(params: LoaderParams): Promise<InfoPlace[]> {
  // Placeholder: return empty array for now
  return [];
}
