export interface CategoryResolution {
  geoapify: boolean;
  nps: boolean;
  weather: boolean;
}

export function resolveCategory(id: string): CategoryResolution {

  // -------------------------
  // NPS-only categories
  // -------------------------
  const npsOnly = [
    "trails",            // NPS trails loader
    "alert",             // NPS alerts loader
    "event",             // NPS events loader
    "visitor_center"     // NPS visitor centers loader
  ];

  if (npsOnly.includes(id)) {
    return { geoapify: false, nps: true, weather: false };
  }

  // -------------------------
  // NPS park categories
  // -------------------------
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

  if (npsParks.includes(id)) {
    return { geoapify: false, nps: true, weather: false };
  }

  // -------------------------
  // Weather
  // -------------------------
  if (id === "weather" || id === "weather-alerts") {
    return { geoapify: false, nps: false, weather: true };
  }

  // -------------------------
  // Geoapify-only categories
  // -------------------------
  const geoapifyOnly = [
    "restaurants",
    "italian",
    "mexican",
    "bbq",
    "steakhouse",
    "asian",
    "seafood",
    "breakfast",
    "fine-dining",
    "casual-dining",
    "family-style",
    "buffet",
    "food-trucks",
    "cafes",
    "bakeries",
    "ice-cream",
    "donuts",
    "fast-food",
    "pizza",
    "burger",
    "sandwich",
    "breweries",
    "wineries",
    "distilleries"
  ];

  if (geoapifyOnly.includes(id)) {
    return { geoapify: true, nps: false, weather: false };
  }

  // -------------------------
  // Curated categories (local GeoJSON)
  // -------------------------
  const curated = [
    // Nature POIs
    "waterfalls",
    "caves",
    "arches",
    "natural-bridges",
    "rockhouses",
    "ridges",
    "peaks",
    "gorges",
    "river-overlooks",
    "viewpoints",
    "scenic-roads",

    // Trails (local)
    "trailheads",

    // Travel (local)
    "parking-garages",
    "trail-parking",

    // Urban leisure
    "botanical-gardens",
    "museums",
    "galleries",
    "urban-parks",
    "zoos",
    "aquariums",
    "amusement-parks",
    "water-parks",
    "roller-coaster-parks",
    "family-parks",
    "cinemas",
    "theatres",
    "escape-rooms",
    "bowling",
    "mini-golf"
  ];

  if (curated.includes(id)) {
    return { geoapify: false, nps: false, weather: false };
  }

  // -------------------------
  // Default
  // -------------------------
  return { geoapify: false, nps: false, weather: false };
}
