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
  const categories = feature.properties.categories || [];

  // Drinks
  if (
    categories.some((c: string) =>
      c.includes("bar") ||
      c.includes("pub") ||
      c.includes("wine") ||
      c.includes("beer")
    )
  ) {
    feature.properties.category = "food";
    feature.properties.subcategory = "drinks";
    return feature;
  }

  // Cafes & Sweets
  if (
    categories.some((c: string) =>
      c.includes("cafe") ||
      c.includes("coffee") ||
      c.includes("ice_cream") ||
      c.includes("dessert") ||
      c.includes("bakery")
    )
  ) {
    feature.properties.category = "food";
    feature.properties.subcategory = "cafes-sweets";
    return feature;
  }

  // Fast Casual
  if (
    categories.some((c: string) =>
      c.includes("fast_food") ||
      c.includes("burger")
    )
  ) {
    feature.properties.category = "food";
    feature.properties.subcategory = "fast-casual";
    return feature;
  }

  // Restaurants (fallback)
  if (
    categories.some((c: string) =>
      c.startsWith("catering.restaurant")
    )
  ) {
    feature.properties.category = "food";
    feature.properties.subcategory = "restaurants";
    return feature;
  }

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
      subcategory = "visitor-center";
    }

    // --- Events ---
    if (npsCategory === "event") {
      category = "nature";
      subcategory = "event";
    }

    // --- Alerts ---
    if (npsCategory === "alert") {
      category = "nature";
      subcategory = "alert";
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
// NOMINATIM
// -------------------------
if (feature.properties.source === "nominatim") {

  const type = feature.properties.type;

  // Urban Scenic
  if (
    [
      "museum",
      "gallery",
      "viewpoint",
      "attraction",
      "park",
      "garden"
    ].includes(type)
  ) {
    feature.properties.category = "attractions";
    feature.properties.subcategory = "urban-scenic";
    return feature;
  }

  // Wildlife & Marine
  if (
    [
      "zoo",
      "aquarium"
    ].includes(type)
  ) {
    feature.properties.category = "attractions";
    feature.properties.subcategory = "wildlife-marine";
    return feature;
  }

  // Theme Parks
  if (
    [
      "theme_park",
      "amusement_park",
      "water_park"
    ].includes(type)
  ) {
    feature.properties.category = "attractions";
    feature.properties.subcategory = "theme-parks";
    return feature;
  }

  // Entertainment
  if (
    [
      "cinema",
      "theatre",
      "bowling_alley",
      "miniature_golf"
    ].includes(type)
  ) {
    feature.properties.category = "attractions";
    feature.properties.subcategory = "entertainment";
    return feature;
  }
}

// -------------------------
// CURATED
// -------------------------
if (feature.properties.source === "curated") {

  // Already normalized -> trust it
  if (
    feature.properties.category &&
    feature.properties.subcategory
  ) {
    return feature;
  }

  const raw = feature.properties.category as string;

  // -------------------------
// CURATED ATTRACTIONS
// -------------------------
if (
  raw === "scenic-overlooks" ||
  raw === "observation-towers"
) {
  feature.properties.category = "attractions";
  feature.properties.subcategory = "urban-scenic";
  return feature;
}

// -------------------------
// CURATED TRAVEL
// -------------------------
if (
  raw === "parking-garages" ||
  raw === "trail-parking"
) {
  feature.properties.category = "travel";
  feature.properties.subcategory = "parking";
  return feature;
}

  const natureMappings: Record<string, string> = {
    // nature
    caves: "caves",
    waterfalls: "waterfalls",
    viewpoints: "viewpoints",
    trails: "trails",
    trailheads: "trailheads",
    arches: "arches",
    "natural-bridges": "natural-bridges",
    rockhouses: "rockhouses",
    ridges: "ridges",
    peaks: "peaks",
    gorges: "gorges",
    "river-overlooks": "river-overlooks",
    "state-parks": "state-parks",
    "nature-preserves": "nature-preserves",
    "nature-reserves": "nature-reserves",
    "national-parks": "national_park",
    "scenic-roads": "scenic-roads",

    // historic
    "battlefields": "battlefields",
    "historic-sites": "historic-sites",
    "monuments": "monuments",

    // food 
    "restaurants" : "restaurants",
    "cafes-sweets" : "cafes-sweets",
    "fast-casual" : "fast-casual",
    "drinks" : "drinks",

    // attractions
    "urban-scenic" : "urban-scenic", 
    "wildlife-marine" : "wildlife-marine",
    "theme-parks" : "theme-parks",
    "entertainment" : "entertainment",
  };

  if (raw && natureMappings[raw]) {
    feature.properties.category = "nature";
    feature.properties.subcategory = natureMappings[raw];
  }

  return feature;
}

  // -------------------------
  // DEFAULT
  // -------------------------
  feature.properties.category = category;
  feature.properties.subcategory = subcategory;
  return feature;
}
