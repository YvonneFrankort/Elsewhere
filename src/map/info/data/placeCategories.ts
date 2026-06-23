// src/map/info/data/placeCategories.ts

export interface PlaceItem {
  id: string;
  label: string;
  filters?: string[];
}

export interface PlaceSubcategory {
  id: string;
  label: string;
  items: PlaceItem[];
}

export interface PlaceGroup {
  id: string;
  label: string;
  subcategories: PlaceSubcategory[];
}

export interface PlaceCategory {
  id: string;
  label: string;
  groups: PlaceGroup[];
}

export const placeCategories: PlaceCategory[] = [
  {
    id: "nature",
    label: "Nature & Outdoors",
    groups: [
      {
        id: "water",
        label: "Water",
        subcategories: [
          {
            id: "water-types",
            label: "Types",
            items: [
              { id: "lakes", label: "Lakes" },
              { id: "rivers", label: "Rivers" },
              { id: "waterfalls", label: "Waterfalls" },
              { id: "beaches", label: "Beaches" }
            ]
          }
        ]
      },
      {
        id: "mountains-forests",
        label: "Mountains & Forests",
        subcategories: [
          {
            id: "landforms",
            label: "Landforms",
            items: [
              { id: "mountains", label: "Mountains" },
              { id: "forests", label: "Forests" },
              { id: "canyons", label: "Canyons" },
              { id: "desert", label: "Desert" }
            ]
          }
        ]
      },
      {
        id: "trails",
        label: "Trails",
        subcategories: [
          {
            id: "trail-types",
            label: "Trail Types",
            items: [
              { id: "hiking", label: "Hiking Trails" },
              { id: "ski", label: "Ski Trails" }
            ]
          }
        ]
      },
      {
        id: "wildlife",
        label: "Wildlife",
        subcategories: [
          {
            id: "wildlife-types",
            label: "Types",
            items: [
              { id: "wildlife-parks", label: "Wildlife Parks" },
              { id: "wildlife-sightings", label: "Wildlife Sightings" }
            ]
          }
        ]
      },
      {
        id: "protected",
        label: "Protected Areas",
        subcategories: [
          {
            id: "protected-types",
            label: "Types",
            items: [
              { id: "nature-reserves", label: "Nature Reserves" },
              { id: "national-parks", label: "National Parks" },
              { id: "wilderness", label: "Wilderness Areas" }
            ]
          }
        ]
      },
      {
        id: "scenic",
        label: "Scenic",
        subcategories: [
          {
            id: "scenic-types",
            label: "Types",
            items: [
              { id: "scenic-routes", label: "Scenic Routes" },
              { id: "viewpoints", label: "Viewpoints" },
              { id: "scenic-drives", label: "Scenic Drives" }
            ]
          }
        ]
      },
      {
        id: "road-trips",
        label: "Road Trips",
        subcategories: [
          {
            id: "road-trip-types",
            label: "Types",
            items: [
              { id: "scenic-byways", label: "Scenic Byways" },
              { id: "road-trip-routes", label: "Road Trip Routes" }
            ]
          }
        ]
      }
    ]
  },

  {
    id: "food",
    label: "Food & Drink",
    groups: [
      {
        id: "restaurants",
        label: "Restaurants",
        subcategories: [
          {
            id: "cuisines",
            label: "Cuisines",
            items: [
              { id: "italian", label: "Italian" },
              { id: "mexican", label: "Mexican" },
              { id: "bbq", label: "BBQ" },
              { id: "steakhouse", label: "Steakhouse" },
              { id: "asian", label: "Asian" },
              { id: "seafood", label: "Seafood" },
              { id: "breakfast", label: "Breakfast" }
            ]
          },
          {
            id: "restaurant-types",
            label: "Types",
            items: [
              { id: "fine-dining", label: "Fine Dining" },
              { id: "casual-dining", label: "Casual Dining" },
              { id: "family-style", label: "Family Style" },
              { id: "buffet", label: "Buffet" },
              { id: "food-trucks", label: "Food Trucks" }
            ]
          }
        ]
      },
      {
        id: "cafes-sweets",
        label: "Cafés & Sweets",
        subcategories: [
          {
            id: "cafe-types",
            label: "Types",
            items: [
              { id: "cafes", label: "Cafés" },
              { id: "bakeries", label: "Bakeries" },
              { id: "ice-cream", label: "Ice Cream" },
              { id: "donuts", label: "Donuts" }
            ]
          }
        ]
      },
      {
        id: "fast-casual",
        label: "Fast & Casual",
        subcategories: [
          {
            id: "fast-casual-types",
            label: "Types",
            items: [
              { id: "fast-food", label: "Fast Food" },
              { id: "pizza", label: "Pizza" },
              { id: "burger", label: "Burger" },
              { id: "sandwich", label: "Sandwich" }
            ]
          }
        ]
      },
      {
        id: "drinks",
        label: "Drinks",
        subcategories: [
          {
            id: "drink-types",
            label: "Types",
            items: [
              { id: "breweries", label: "Breweries" },
              { id: "wineries", label: "Wineries" },
              { id: "distilleries", label: "Distilleries" }
            ]
          }
        ]
      }
    ]
  },

  {
    id: "attractions",
    label: "Attractions & Entertainment",
    groups: [
      {
        id: "theme-parks",
        label: "Theme Parks",
        subcategories: [
          {
            id: "theme-park-types",
            label: "Types",
            items: [
              { id: "amusement-parks", label: "Amusement Parks" },
              { id: "water-parks", label: "Water Parks" },
              { id: "roller-coaster-parks", label: "Roller Coaster Parks" },
              { id: "family-parks", label: "Family Parks" }
            ]
          }
        ]
      },
      {
        id: "attractions-group",
        label: "Attractions",
        subcategories: [
          {
            id: "attraction-types",
            label: "Types",
            items: [
              { id: "zoos", label: "Zoos" },
              { id: "aquariums", label: "Aquariums" },
              { id: "botanical-gardens", label: "Botanical Gardens" },
              { id: "observation-towers", label: "Observation Towers" },
              { id: "landmarks", label: "Landmarks" }
            ]
          }
        ]
      },
      {
        id: "entertainment",
        label: "Entertainment",
        subcategories: [
          {
            id: "entertainment-types",
            label: "Types",
            items: [
              { id: "cinemas", label: "Cinemas" },
              { id: "theatres", label: "Theatres" },
              { id: "escape-rooms", label: "Escape Rooms" },
              { id: "bowling", label: "Bowling" }
            ]
          }
        ]
      }
    ]
  },

  {
    id: "travel",
    label: "Travel & Transport",
    groups: [
      {
        id: "parking",
        label: "Parking",
        subcategories: [
          {
            id: "parking-types",
            label: "Types",
            items: [
              { id: "parking-lots", label: "Parking Lots" },
              { id: "parking-garages", label: "Parking Garages" }
            ]
          }
        ]
      },
      {
        id: "fuel",
        label: "Fuel",
        subcategories: [
          {
            id: "fuel-types",
            label: "Types",
            items: [
              { id: "gas-stations", label: "Gas Stations" }
            ]
          }
        ]
      }
    ]
  }
];
