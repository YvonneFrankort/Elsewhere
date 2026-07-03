
export interface CategoryResolution {
  geoapify: boolean;
  osm: boolean;
  nps: boolean;
  eventbrite: boolean;
  nominatim: boolean;
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
    "national-parks",
    "wilderness",

    // Nature scenic (OSM only)
    "scenic-routes",
  ];

  if (osmOnly.includes(id)) {
    return {
      geoapify: false,
      osm: true,
      nps: id === "national-parks",
      eventbrite: false,
      nominatim: false,
      weather: false
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
      eventbrite: false,
      nominatim: false,
      weather: false
    };
  }

  // 🍽️ FOOD — Geoapify only
  const food = [
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
      eventbrite: false,
      nominatim: false,
      weather: false
    };
  }

  // 🎡 ENTERTAINMENT — Geoapify only
  const entertainment = [
    "amusement-parks",
    "water-parks",
    "roller-coaster-parks",
    "family-parks",
    "zoos",
    "aquariums",
    "cinemas",
    "theatres",
    "escape-rooms",
    "bowling",
    "mini-golf"
  ];

  if (entertainment.includes(id)) {
    return {
      geoapify: true,
      osm: false,
      nps: false,
      eventbrite: false,
      nominatim: false,
      weather: false
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
      eventbrite: false,
      nominatim: false,
      weather: false
    };
  }

  // 🎉 EVENTS — Eventbrite only
  if (id === "events") {
    return {
      geoapify: false,
      osm: false,
      nps: false,
      eventbrite: true,
      nominatim: false,
      weather: false
    };
  }

  // 🔍 SEARCH — Nominatim only
  if (id === "search") {
    return {
      geoapify: false,
      osm: false,
      nps: false,
      eventbrite: false,
      nominatim: true,
      weather: false
    };
  }

  // 🌦 WEATHER — Open-Meteo only
  if (id === "weather") {
    return {
      geoapify: false,
      osm: false,
      nps: false,
      eventbrite: false,
      nominatim: false,
      weather: true
    };
  }

  // Default
  return {
    geoapify: false,
    osm: false,
    nps: false,
    eventbrite: false,
    nominatim: false,
    weather: false
  };
}
