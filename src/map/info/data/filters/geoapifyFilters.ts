export const geoapifyFilters: Record<string, string[]> = {
  // 🍽️ FOOD
  italian: ["catering.restaurant"],
  mexican: ["catering.restaurant"],
  bbq: ["catering.restaurant"],
  steakhouse: ["catering.restaurant"],
  asian: ["catering.restaurant"],
  seafood: ["catering.restaurant"],
  breakfast: ["catering.cafe"],

  "fine-dining": ["catering.restaurant"],
  "casual-dining": ["catering.restaurant"],
  "family-style": ["catering.restaurant"],
  buffet: ["catering.restaurant"],
  "food-trucks": ["catering.fast_food"],

  cafes: ["catering.cafe"],
  bakeries: ["catering.bakery"],
  "ice-cream": ["catering.ice_cream"],   // FIXED
  donuts: ["catering.bakery"],

  "fast-food": ["catering.fast_food"],
  pizza: ["catering.restaurant"],
  burger: ["catering.fast_food"],
  sandwich: ["catering.fast_food"],

  breweries: ["catering.brewery"],        // FIXED
  wineries: ["catering.winery"],          // FIXED
  distilleries: ["catering.bar"],

  // 🎡 ENTERTAINMENT
  "amusement-parks": ["entertainment.amusement_park"],
  "water-parks": ["entertainment.amusement_park"],
  "roller-coaster-parks": ["entertainment.theme_park"], // FIXED
  "family-parks": ["entertainment.theme_park"],         // FIXED

  zoos: ["tourism.zoo"],                  // FIXED
  aquariums: ["tourism.aquarium"],        // FIXED

  cinemas: ["entertainment.cinema"],
  theatres: ["entertainment.theatre"],

  "escape-rooms": ["entertainment.theme_park"],         // FIXED
  bowling: ["entertainment.sports_centre"],             // FIXED
  "mini-golf": ["entertainment.sports_centre"],         // FIXED

  // 🚗 SERVICES
  "parking-lots": ["service.parking"],                  // FIXED
  "parking-garages": ["service.parking"],               // FIXED
  "gas-stations": ["service.gas_station"],

  // 🌆 URBAN SCENIC
  "scenic-overlooks": ["tourism.viewpoint"],            // FIXED
  viewpoints: ["tourism.viewpoint"],                    // FIXED
  landmarks: ["tourism.sights"],
  "observation-towers": ["tourism.sights"],

  "scenic-drives": ["tourism.attraction"],
  "road-trip-routes": ["tourism.attraction"],

  "botanical-gardens": ["tourism.garden"],
  museums: ["tourism.museum"],
  galleries: ["tourism.gallery"],
  "urban-parks": ["tourism.park"],                      // FIXED

  // Optional but recommended
  attractions: ["tourism.attraction"]
};
