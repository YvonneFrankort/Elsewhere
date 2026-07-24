import type { Feature, Point } from "geojson";

function distanceMeters(a: number[], b: number[]): number {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;

  const R = 6371000; // Earth radius
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const x = dLon * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
  const y = dLat;

  return Math.sqrt(x * x + y * y) * R;
}

function similarName(a: string, b: string): boolean {
  if (!a || !b) return false;
  a = a.toLowerCase();
  b = b.toLowerCase();
  return a.includes(b) || b.includes(a);
}

export function dedupe(features: Feature<Point>[]): Feature<Point>[] {
  const result: Feature<Point>[] = [];

  for (const f of features) {
    const existing = result.find(r => {
      const d = distanceMeters(
        r.geometry.coordinates,
        f.geometry.coordinates
      );

      const nameMatch = similarName(
        r.properties?.name ?? "",
        f.properties?.name ?? ""
      );

      return d < 30 || nameMatch;
    });

    if (!existing) {
      result.push(f);
    }
  }

  return result;
}
