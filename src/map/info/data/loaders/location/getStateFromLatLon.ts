import { STATE_BOUNDS } from "../../../utils/stateBounds";

export function getStateFromLatLon(
  lat: number,
  lon: number
): string | null {
  for (const [code, b] of Object.entries(STATE_BOUNDS)) {
    if (
      lat >= b.minLat && lat <= b.maxLat &&
      lon >= b.minLon && lon <= b.maxLon
    ) {
      return code;
    }
  }
  return null;
}