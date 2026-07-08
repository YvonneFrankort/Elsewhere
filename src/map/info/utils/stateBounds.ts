// ---------------------------------------------
// State bounding boxes (static, stable data)
// ---------------------------------------------
export const STATE_BOUNDS = {
  ga: { minLat: 30.3, maxLat: 35.0, minLon: -85.6, maxLon: -80.8 },
  ky: { minLat: 36.5, maxLat: 39.1, minLon: -89.6, maxLon: -81.9 },
  nc: { minLat: 33.8, maxLat: 36.6, minLon: -84.3, maxLon: -75.4 },
  sc: { minLat: 32.0, maxLat: 35.2, minLon: -83.4, maxLon: -78.5 },
  tn: { minLat: 34.9, maxLat: 36.7, minLon: -90.3, maxLon: -81.6 },
  va: { minLat: 36.5, maxLat: 39.5, minLon: -83.7, maxLon: -75.2 },
  wv: { minLat: 37.2, maxLat: 40.6, minLon: -82.7, maxLon: -77.7 }
};

// ---------------------------------------------
// Compute which states intersect the search radius
// ---------------------------------------------
export function getStatesIntersectingRadius(
  center: { lat: number; lng: number },
  radiusKm: number
): string[] {
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / 85;

  const searchBox = {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLon: center.lng - lonDelta,
    maxLon: center.lng + lonDelta
  };

  return Object.entries(STATE_BOUNDS)
    .filter(([_, b]) =>
      !(
        searchBox.maxLat < b.minLat ||
        searchBox.minLat > b.maxLat ||
        searchBox.maxLon < b.minLon ||
        searchBox.minLon > b.maxLon
      )
    )
    .map(([state]) => state);
}

// ---------------------------------------------
// Border buffer detection
// ---------------------------------------------
export function isInsideBorderBuffer(
  center: { lat: number; lng: number },
  bufferKm: number
): boolean {
  const latDelta = bufferKm / 111;
  const lonDelta = bufferKm / 85;

  const box = {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLon: center.lng - lonDelta,
    maxLon: center.lng + lonDelta
  };

  return Object.values(STATE_BOUNDS).some((b) => {
    return !(
      box.maxLat < b.minLat ||
      box.minLat > b.maxLat ||
      box.maxLon < b.minLon ||
      box.minLon > b.maxLon
    );
  });
}
