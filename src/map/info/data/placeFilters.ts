// src/map/info/data/placeFilters.ts

import type { PlaceCategory } from "./placeCategories";

// ---------------------------------------------
// AUTO‑GENERATED COLOR PALETTE (one per subcategory)
// ---------------------------------------------

const colorPalette = [
  "#4A90E2", "#50E3C2", "#B8E986", "#F8E71C", "#F5A623",
  "#D0021B", "#9013FE", "#8B572A", "#417505", "#BD10E0",
  "#7ED321", "#F6A623", "#D0011B", "#4A4A4A", "#9B9B9B"
];

let colorIndex = 0;
const nextColor = () => colorPalette[colorIndex++ % colorPalette.length];

// ---------------------------------------------
// STRICT FILTERS (Geoapify categories)
// ---------------------------------------------

export const strictFilters: Record<string, string[]> = {
  // Nature → Water
  lakes: ["natural.lake"],
  rivers: ["natural.river"],
  waterfalls: ["natural.waterfall"],
  beaches: ["natural.beach"],

  // Nature → Mountains & Forests
  mountains: ["natural.mountain"],
  forests: ["natural.forest"],
  canyons: ["natural.canyon"],
  desert: ["natural.desert"],

  // Trails
  hiking: ["sport.hiking"],
  ski: ["sport.ski"],

  // Wildlife
  "wildlife-parks": ["zoo"],
  "wildlife-sightings": ["natural"],

  // Protected Areas
  "nature-reserves": ["national_park"],
  "national-parks": ["national_park"],
  wilderness: ["natural"],

  // Scenic
  "scenic-routes": ["tourism.attraction"],
  viewpoints: ["viewpoint"],
  "scenic-drives": ["tourism.attraction"],

  // Road Trips
  "scenic-byways": ["tourism.attraction"],
  "road-trip-routes": ["tourism.attraction"],

  // Food → Restaurants
  italian: ["catering.restaurant.italian"],
  mexican: ["catering.restaurant.mexican"],
  bbq: ["catering.restaurant.bbq"],
  steakhouse: ["catering.restaurant.steak_house"],
  asian: ["catering.restaurant.asian"],
  seafood: ["catering.restaurant.seafood"],
  breakfast: ["catering.restaurant.breakfast"],

  "fine-dining": ["catering.restaurant"],
  "casual-dining": ["catering.restaurant"],
  "family-style": ["catering.restaurant"],
  buffet: ["catering.restaurant"],
  "food-trucks": ["catering.fast_food"],

  // Cafés & Sweets
  cafes: ["catering.cafe"],
  bakeries: ["catering.bakery"],
  "ice-cream": ["catering.ice_cream"],
  donuts: ["catering.donut"],

  // Fast & Casual
  "fast-food": ["catering.fast_food"],
  pizza: ["catering.pizza"],
  burger: ["catering.burger"],
  sandwich: ["catering.sandwich"],

  // Drinks
  breweries: ["catering.brewery"],
  wineries: ["catering.winery"],
  distilleries: ["catering.distillery"],

  // Attractions
  "amusement-parks": ["entertainment.amusement_park"],
  "water-parks": ["entertainment.water_park"],
  "roller-coaster-parks": ["entertainment.amusement_park"],
  "family-parks": ["entertainment.amusement_park"],

  zoos: ["zoo"],
  aquariums: ["aquarium"],
  "botanical-gardens": ["garden.botanical"],
  "observation-towers": ["tower.observation"],
  landmarks: ["tourism.attraction"],

  cinemas: ["entertainment.cinema"],
  theatres: ["entertainment.theatre"],
  "escape-rooms": ["entertainment.escape_room"],
  bowling: ["entertainment.bowling"],

  // Travel → Parking
  "parking-lots": ["parking"],
  "parking-garages": ["parking.garage"],

  // Travel → Fuel
  "gas-stations": ["service.gas_station"]
};

// ---------------------------------------------
// FALLBACK FILTERS (used when strict returns 0)
// ---------------------------------------------

export const fallbackFilters: Record<string, string[]> = {
  lakes: ["natural"],
  rivers: ["natural"],
  waterfalls: ["natural"],
  beaches: ["natural"],

  mountains: ["natural"],
  forests: ["natural"],
  canyons: ["natural"],
  desert: ["natural"],

  hiking: ["sport"],
  ski: ["sport"],

  "wildlife-parks": ["zoo"],
  "wildlife-sightings": ["natural"],

  "nature-reserves": ["national_park"],
  "national-parks": ["national_park"],
  wilderness: ["natural"],

  "scenic-routes": ["tourism"],
  viewpoints: ["tourism"],
  "scenic-drives": ["tourism"],

  "scenic-byways": ["tourism"],
  "road-trip-routes": ["tourism"],

  italian: ["catering.restaurant"],
  mexican: ["catering.restaurant"],
  bbq: ["catering.restaurant"],
  steakhouse: ["catering.restaurant"],
  asian: ["catering.restaurant"],
  seafood: ["catering.restaurant"],
  breakfast: ["catering.restaurant"],

  "fine-dining": ["catering.restaurant"],
  "casual-dining": ["catering.restaurant"],
  "family-style": ["catering.restaurant"],
  buffet: ["catering.restaurant"],
  "food-trucks": ["catering"],

  cafes: ["catering"],
  bakeries: ["catering"],
  "ice-cream": ["catering"],
  donuts: ["catering"],

  "fast-food": ["catering"],
  pizza: ["catering"],
  burger: ["catering"],
  sandwich: ["catering"],

  breweries: ["catering"],
  wineries: ["catering"],
  distilleries: ["catering"],

  "amusement-parks": ["entertainment"],
  "water-parks": ["entertainment"],
  "roller-coaster-parks": ["entertainment"],
  "family-parks": ["entertainment"],

  zoos: ["zoo"],
  aquariums: ["aquarium"],
  "botanical-gardens": ["garden"],
  "observation-towers": ["tower"],
  landmarks: ["tourism"],

  cinemas: ["entertainment"],
  theatres: ["entertainment"],
  "escape-rooms": ["entertainment"],
  bowling: ["entertainment"],

  "parking-lots": ["parking"],
  "parking-garages": ["parking"],

  "gas-stations": ["service"]
};

// ---------------------------------------------
// COLOR MAP (subcategory → color)
// ---------------------------------------------

export const subcategoryColors: Record<string, string> = {};

export const generateColors = (categories: PlaceCategory[]) => {
  categories.forEach(category =>
    category.groups.forEach(group =>
      group.subcategories.forEach(sub => {
        subcategoryColors[sub.id] = nextColor();
      })
    )
  );
};

// ---------------------------------------------
// REVERSE MAPPING (API → subcategory)
// ---------------------------------------------

export const reverseMap: Record<string, string> = {};

export const generateReverseMapping = () => {
  Object.entries(strictFilters).forEach(([itemId, filters]) => {
    filters.forEach(f => {
      reverseMap[f] = itemId;
    });
  });
};

// ---------------------------------------------
// HYBRID FILTER RESOLUTION
// ---------------------------------------------

export const resolveFilters = (itemId: string) => {
  const strict = strictFilters[itemId] || [];
  const fallback = fallbackFilters[itemId] || [];
  return { strict, fallback };
};
