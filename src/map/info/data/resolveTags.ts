import type { Feature } from "geojson";

export function resolveTags(feature: Feature): Feature {
  feature.properties = feature.properties || {};
  feature.properties.tags = feature.properties.tags || {};

  const tags = feature.properties.tags;

  let category: string = "unknown";
  let subcategory: string | null = null;

  // -------------------------
  // GEOAPIFY (food + transport)
  // -------------------------
  if (feature.properties.source === "geoapify") {
    category = feature.properties.category || "unknown";
    subcategory = feature.properties.subcategory || null;

    feature.properties.category = category;
    feature.properties.subcategory = subcategory;
    return feature;
  }

  // -------------------------
  // NPS (parks + trails + alerts + events + visitor centers)
  // -------------------------
  if (feature.properties.source === "nps") {
    const npsCategory = feature.properties.category;

    // --- Trails ---
    if (npsCategory === "trails") {
      category = "nature";
      subcategory = "trails";
    }

    // --- Protected Areas (NPS parks) ---
    const npsParks = [
      "national_park",
      "national_monument",
      "national_preserve",
      "national_historic_site",
      "national_recreation_area",
      "national_seashore",
      "national_river",
      "national_lakeshore"
    ];

    if (npsParks.includes(npsCategory)) {
      category = "nature";
      subcategory = npsCategory;
    }

    // --- Visitor Centers ---
    if (npsCategory === "visitor_center") {
      category = "nature";
      subcategory = "visitor-centers";
    }

    // --- Events ---
    if (npsCategory === "event") {
      category = "nature";
      subcategory = "events";
    }

    // --- Alerts ---
    if (npsCategory === "alert") {
      category = "nature";
      subcategory = "alerts";
    }

    feature.properties.category = category;
    feature.properties.subcategory = subcategory;
    return feature;
  }

  // -------------------------
  // WEATHER
  // -------------------------
  if (feature.properties.source === "weather") {
    category = "weather";
    subcategory = null;

    if (tags.weather_alert === true) {
      category = "weather-alerts";
    }

    feature.properties.category = category;
    feature.properties.subcategory = subcategory;
    return feature;
  }

  // -------------------------
  // CURATED (viewpoints, waterfalls, arches, etc.)
  // -------------------------
  if (feature.properties.source === "curated") {
    category = feature.properties.category || "unknown";
    subcategory = feature.properties.subcategory || null;

    // Remove old mountain/mountain-peaks if they appear
    if (subcategory === "mountain" || subcategory === "mountain-peaks") {
      category = "unknown";
      subcategory = null;
    }

    feature.properties.category = category;
    feature.properties.subcategory = subcategory;
    return feature;
  }

  // -------------------------
  // DEFAULT
  // -------------------------
  feature.properties.category = category;
  feature.properties.subcategory = subcategory;
  return feature;
}
