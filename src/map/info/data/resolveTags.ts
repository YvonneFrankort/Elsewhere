import type { Feature } from "geojson";

export function resolveTags(feature: Feature): Feature {
  feature.properties = feature.properties || {};
  feature.properties.tags = feature.properties.tags || {};

  const tags = feature.properties.tags;

  let category: string = "unknown";
  let subcategory: string | null = null;

  // -------------------------
  // NATURE (OSM)
  // -------------------------
  if (tags.natural) {
  category = "nature";

  if (tags.natural === "water") subcategory = "water";
  if (tags.natural === "wood") subcategory = "forests";
  if (tags.natural === "peak") subcategory = "mountain-peaks";
  if (tags.natural === "beach") subcategory = "beaches";
  if (tags.natural === "cave_entrance") subcategory = "caves";
}

  // -------------------------
  // TOURISM (OSM)
  // -------------------------
  if (tags.tourism) {
  category = "attractions";

  if (tags.tourism === "viewpoint") subcategory = "viewpoints";
  if (tags.tourism === "museum") subcategory = "museums";
  if (tags.tourism === "gallery") subcategory = "galleries";
  if (tags.tourism === "attraction") subcategory = "attractions";
}

  // -------------------------
  // LEISURE (OSM)
  // -------------------------
  if (tags.leisure) {
  category = "nature";

  if (tags.leisure === "park") subcategory = "urban-parks";
  if (tags.leisure === "nature_reserve") subcategory = "nature-reserves";
  if (tags.leisure === "playground") subcategory = "urban-parks";
}

  // -------------------------
  // GEOAPIFY
  // -------------------------
  if (feature.properties.source === "geoapify") {
    category = feature.properties.category || category;
    subcategory = feature.properties.subcategory || subcategory;
  }

  // -------------------------
  // NPS (National Parks)
  // -------------------------
  if (feature.properties.source === "nps") {
  category = "nature";
  subcategory = "national-parks";
}

  // -------------------------
  // WEATHER
  // -------------------------
  if (feature.properties.source === "weather") {
    category = "weather";
    subcategory = null;
  }

  feature.properties.category = category;
  feature.properties.subcategory = subcategory;

  return feature;
}
