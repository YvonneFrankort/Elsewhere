import type { InfoPlace } from "../../types/InfoPlace";
import type { LoaderParams } from "../useInfoData";

// This loader will later fetch:
// - current weather
// - hourly forecast
// - daily forecast
// - weather codes
// - alerts
// - sunrise/sunset
// from the Open-Meteo API

export async function load(params: LoaderParams): Promise<InfoPlace[]> {
  // Placeholder: return empty array for now
  return [];
}
