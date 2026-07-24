// loaders/nominatim.ts
import type { Feature, Point } from "geojson";

// ⭐ Local radius helper (same logic as Geoapify)
function computeRadiusLocal(radiusKm: number): number {
  if (radiusKm <= 2) {
    return radiusKm * 1000;   // exact meters
  }
  return radiusKm * 1200;     // 20% boost
}

export async function loadFromNominatim(
  keyword: string,
  params: { latitude: number; longitude: number; radiusKm: number }
): Promise<Feature<Point>[]> {

  const { latitude, longitude, radiusKm } = params;

  // ⭐ Convert tuned radius (meters → km → degrees)
  const tunedKm = computeRadiusLocal(radiusKm) / 1000;
  const delta = tunedKm / 111;

  const left = longitude - delta;
  const right = longitude + delta;
  const top = latitude + delta;
  const bottom = latitude - delta;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", keyword);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "50");
  url.searchParams.set("viewbox", `${left},${top},${right},${bottom}`);
  url.searchParams.set("bounded", "1");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "InfoMap/1.0" }
  });

  if (!res.ok) return [];

  const data = await res.json();

  return data.map((item: any) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
    },
    properties: {
      id: item.place_id,
      name: item.display_name,
      source: "nominatim",
      sourcePriority: 3
    }
  }));
}
