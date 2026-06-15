import type { InfoPlace } from "../../types/InfoPlace";
import type { LoaderParams } from "../useInfoData";

// This loader will later fetch:
// - events
// - markets
// - fairs
// - festivals
// - workshops
// - concerts
// - seasonal events
// from the Eventbrite API

export async function load(params: LoaderParams): Promise<InfoPlace[]> {
  // Placeholder: return empty array for now
  return [];
}
