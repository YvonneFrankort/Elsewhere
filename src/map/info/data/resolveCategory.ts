export interface CategoryResolution {
  geoapify: boolean;
  osm: boolean;
  nps: boolean;
  weather: boolean;
}

export function resolveCategory(id: string): CategoryResolution {

  if (id === "mountains") {
    id = "mountain-peaks";
  }

  // 🌲 NATURE — OSM only
  const osmOnly = [
    "lakes",
    "rivers",
    "waterfalls",
    "beaches",
    "canyons",
    "mountain-peaks",
    "forests",
    "desert",
    "caves",
    "islands",
    "hiking",
    "ski",
    "trailheads",
    "climbing-areas",
    "wildlife-parks",
    "nature-reserves",
    "wilderness",
    "scenic-routes",
    "national-parks"
  ];

  if (osmOnly.includes(id)) {
    return {
      geoapify: false,
      osm: true,
      nps: id === "national-parks",
      weather: false,
    };
  }

  if (id === "visitor-centers") {
    return {
      geoapify: false,
      osm: false,
      nps: true,
      weather: false,
    };
  }

  if (id === "events") {
    return {
      geoapify: false,
      osm: false,
      nps: true,
      weather: false,
    };
  }

  // 🌆 URBAN SCENIC — Geoapify only
  const urbanScenic = [
    "viewpoints",
    "scenic-overlooks",
    "observation-towers",
    "landmarks",
    "botanical-gardens",
    "museums",
    "galleries",
    "urban-parks",
    "scenic-drives",
    "road-trip-routes"
  ];

  if (urbanScenic.includes(id)) {
    return {
      geoapify: true,
      osm: false,
      nps: false,
      weather: false,
    };
  }

  // 🍽️ FOOD — Geoapify only
  const food = [
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

  if (food.includes(id)) {
    return {
      geoapify: true,
      osm: false,
      nps: false,
      weather: false,
    };
  }

  // 🚗 SERVICES — Geoapify only
  const services = [
    "parking-lots",
    "parking-garages",
    "gas-stations"
  ];

  if (services.includes(id)) {
    return {
      geoapify: true,
      osm: false,
      nps: false,
      weather: false,
    };
  }

  if (id === "alerts") {
    return {
      geoapify: false,
      osm: false,
      nps: true,
      weather: false,
    };
  }

  // 🔍 SEARCH — now Geoapify only
  if (id === "search") {
    return {
      geoapify: true,
      osm: false,
      nps: false,
      weather: false,
    };
  }

  // 🌦 WEATHER — Open-Meteo only
  if (id === "weather") {
    return {
      geoapify: false,
      osm: false,
      nps: false,
      weather: true,
    };
  }

  // Default
  return {
    geoapify: false,
    osm: false,
    nps: false,
    weather: false,
  };
}
