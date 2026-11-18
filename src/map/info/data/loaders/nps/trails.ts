
import type { Feature } from "geojson";

export interface TrailBounds {
  west: number;
  south: number;
  east: number;
  north: number;
  zoom: number;
}

const NPS_TRAILS_URL =
  "https://mapservices.nps.gov/arcgis/rest/services/NationalDatasets/NPS_Public_Trails/FeatureServer/0/query";

// Calculate approximate trail length from its actual geometry.
function haversine(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  const R = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateLengthKm(geometry: any): number | null {
  if (!geometry) return null;

  const lines =
    geometry.type === "LineString"
      ? [geometry.coordinates]
      : geometry.type === "MultiLineString"
        ? geometry.coordinates
        : [];

  if (!lines.length) return null;

  let total = 0;

  for (const line of lines) {
    for (let i = 1; i < line.length; i++) {
      const [lon1, lat1] = line[i - 1];
      const [lon2, lat2] = line[i];

      total += haversine(lon1, lat1, lon2, lat2);
    }
  }

  return total > 0 ? Number(total.toFixed(2)) : null;
}

export async function loadTrails(
  bounds: TrailBounds
): Promise<Feature[]> {
  // Avoid requesting detailed trail geometry when zoomed too far out.
  if (bounds.zoom < 8.5) {
    console.log("🥾 Trail loading skipped: zoom in closer.");
    return [];
  }

  const url = new URL(NPS_TRAILS_URL);

  const query = {
    where: "1=1",
    geometry: [
      bounds.west,
      bounds.south,
      bounds.east,
      bounds.north
    ].join(","),
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: [
      "OBJECTID",
      "TRLNAME",
      "TRLALTNAME",
      "TRLSTATUS",
      "TRLSURFACE",
      "TRLTYPE",
      "TRLCLASS",
      "TRLUSE",
      "UNITCODE",
      "UNITNAME",
      "SEASONAL",
      "SEASDESC"
    ].join(","),
    returnGeometry: "true",
    outSR: "4326",
    returnZ: "false",
    returnM: "false",
    geometryPrecision: "5",
    resultRecordCount: "2000",
    f: "geojson"
  };

  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  try {
    console.log("🥾 Loading NPS trails for visible map bounds:", bounds);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`NPS Trails request failed: ${response.status}`);
    }

    const json = await response.json();

    if (!Array.isArray(json.features)) {
      console.warn("NPS Trails returned no valid feature collection:", json);
      return [];
    }

    if (json.exceededTransferLimit) {
      console.warn(
        "NPS trail result reached 2,000 features. Zoom in for a smaller area."
      );
    }

    const trails: Feature[] = json.features
      .filter((feature: any) =>
        feature.geometry &&
        ["LineString", "MultiLineString"].includes(feature.geometry.type)
      )
      .map((feature: any, index: number) => {
        const p = feature.properties || {};

        return {
          type: "Feature",
          geometry: feature.geometry,
          properties: {
            id: `nps-trail-${p.OBJECTID ?? index}`,
            name:
              p.TRLNAME ||
              p.TRLALTNAME ||
              "NPS Trail",
            category: "trails",
            source: "nps",
            parkName: p.UNITNAME || null,
            unitCode: p.UNITCODE || null,
            status: p.TRLSTATUS || null,
            surface: p.TRLSURFACE || null,
            trailType: p.TRLTYPE || null,
            trailClass: p.TRLCLASS || null,
            trailUse: p.TRLUSE || null,
            seasonal: p.SEASONAL || null,
            seasonalDescription: p.SEASDESC || null,
            length_km: calculateLengthKm(feature.geometry)
          }
        };
      });

    console.log("🥾 NPS trail lines loaded:", trails.length);

    return trails;
  } catch (error) {
    console.error("Failed to load NPS trails:", error);
    return [];
  }
}
