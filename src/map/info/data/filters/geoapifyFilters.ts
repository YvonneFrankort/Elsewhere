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
  "ice-cream": ["catering.ice_cream"], 
  donuts: ["catering.bakery"],

  "fast-food": ["catering.fast_food"],
  pizza: ["catering.restaurant"],
  burger: ["catering.fast_food"],
  sandwich: ["catering.fast_food"],

  breweries: ["catering.brewery"],       
  wineries: ["catering.winery"],         
  distilleries: ["catering.bar"],

  // 🎡 ENTERTAINMENT
  "amusement-parks": ["entertainment.amusement_park"],
  "water-parks": ["entertainment.water_park"],
  "roller-coaster-parks": ["entertainment.theme_park"], 
  "family-parks": ["entertainment.theme_park"],        

zoos: ["entertainment.zoo"],
aquariums: ["entertainment.aquarium"],
       

  cinemas: ["entertainment.cinema"],
  theatres: ["entertainment.theatre"],

  "escape-rooms": ["entertainment.theme_park"],         
  bowling: ["entertainment.sports_centre"],             
  "mini-golf": ["entertainment.sports_centre"],         

  // 🚗 SERVICES
  "parking-lots": ["service.parking"],                 
  "parking-garages": ["service.parking"],               
  "gas-stations": ["service.gas_station"],

  // 🌆 URBAN SCENIC
  "scenic-overlooks": ["tourism.viewpoint"],            
  viewpoints: ["tourism.viewpoint"],                   
  landmarks: ["tourism.sights"],
  "observation-towers": ["tourism.sights"],

  "scenic-drives": ["tourism.attraction"],
  "road-trip-routes": ["tourism.attraction"],

  "botanical-gardens": ["tourism.garden"],
  museums: ["tourism.museum"],
  galleries: ["tourism.gallery"],
  "urban-parks": ["tourism.park"],                     

  // Optional but recommended
  attractions: ["tourism.attraction"]
};
