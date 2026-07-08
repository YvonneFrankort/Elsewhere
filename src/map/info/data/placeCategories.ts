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
  subcategories?: PlaceSubcategory[];
  items?: PlaceItem[];
}

export interface PlaceCategory {
  id: string;
  label: string;
  icon?: string;
  groups: PlaceGroup[];
}

export const placeCategories: PlaceCategory[] = [
  {
    id: "nature",
    label: "Nature & Outdoors",
    icon: "🌲",
    groups: [
      {
        id: "water",
        label: "Water",
        items: [
          { id: "lakes", label: "Lakes" },
          { id: "rivers", label: "Rivers" },
          { id: "waterfalls", label: "Waterfalls" },
          { id: "beaches", label: "Beaches" }
        ]
      },
      {
        id: "mountains-forests",
        label: "Mountains & Forests",
        items: [
          { id: "mountains", label: "Mountains" },
          { id: "forests", label: "Forests" },
          { id: "canyons", label: "Canyons" },
          { id: "desert", label: "Desert" },
          { id: "caves", label: "Caves" },
          { id: "islands", label: "Islands" }
        ]
      },
      {
        id: "trails",
        label: "Trails",
        items: [
          { id: "hiking", label: "Hiking Trails" },
          { id: "ski", label: "Ski Trails" },
          { id: "trailheads", label: "Trailheads" },
          { id: "climbing-areas", label: "Climbing Areas" }
        ]
      },
      {
        id: "wildlife",
        label: "Wildlife",
        items: [
          { id: "wildlife-parks", label: "Wildlife Parks" }
        ]
      },
      {
        id: "protected",
        label: "Protected Areas",
        items: [
          { id: "nature-reserves", label: "Nature Reserves" },
          { id: "national-parks", label: "National Parks" },
          { id: "wilderness", label: "Wilderness Areas" },
          { id: "visitor-centers", label: "Visitor Centers" },
          { id: "alerts", label: "Park Alerts" }, // going to planner map
          { id: "events", label: "Park Events" } // going to planner map
        ]
      },
      {
        id: "scenic",
        label: "Scenic",
        items: [
          { id: "scenic-routes", label: "Scenic Routes" },
          { id: "mountain-peaks", label: "Mountain Peaks" },
        ]
      },
      {
        id: "road-trips", // going to planner map
        label: "Road Trips",
        items: [
          { id: "road-trip-routes", label: "Road Trip Routes" }
        ]
      }
    ]
  },

  {
    id: "food",
    label: "Food & Drink",
    icon: "🍽️",
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
        items: [
          { id: "cafes", label: "Cafés" },
          { id: "bakeries", label: "Bakeries" },
          { id: "ice-cream", label: "Ice Cream" },
          { id: "donuts", label: "Donuts" }
        ]
      },
      {
        id: "fast-casual",
        label: "Fast & Casual",
        items: [
          { id: "fast-food", label: "Fast Food" },
          { id: "pizza", label: "Pizza" },
          { id: "burger", label: "Burger" },
          { id: "sandwich", label: "Sandwich" }
        ]
      },
      {
        id: "drinks",
        label: "Drinks",
        items: [
          { id: "breweries", label: "Breweries" },
          { id: "wineries", label: "Wineries" },
          { id: "distilleries", label: "Distilleries" }
        ]
      }
    ]
  },

  {
    id: "attractions",
    label: "Attractions & Entertainment",
    icon: "🎡",
    groups: [
      {
        id: "urban-scenic",
        label: "Urban Scenic",
        items: [
          { id: "viewpoints", label: "Viewpoints" },
          { id: "scenic-overlooks", label: "Scenic Overlooks" },
          { id: "observation-towers", label: "Observation Towers" },
          { id: "landmarks", label: "Landmarks" },
          { id: "botanical-gardens", label: "Botanical Gardens" },
          { id: "museums", label: "Museums" },
          { id: "galleries", label: "Galleries" },
          { id: "urban-parks", label: "Urban Parks" },
          { id: "scenic-drives", label: "Scenic Drives" },
          { id: "road-trip-routes", label: "Road Trip Routes" }
        ]
      },
      {
        id: "attractions-group",
        label: "Attractions",
        items: [
          { id: "zoos", label: "Zoos" },
          { id: "aquariums", label: "Aquariums" }
        ]
      },
      {
        id: "theme-parks",
        label: "Theme Parks",
        items: [
          { id: "amusement-parks", label: "Amusement Parks" },
          { id: "water-parks", label: "Water Parks" },
          { id: "roller-coaster-parks", label: "Roller Coaster Parks" },
          { id: "family-parks", label: "Family Parks" }
        ]
      },
      {
        id: "entertainment",
        label: "Entertainment",
        items: [
          { id: "cinemas", label: "Cinemas" },
          { id: "theatres", label: "Theatres" },
          { id: "escape-rooms", label: "Escape Rooms" },
          { id: "bowling", label: "Bowling" },
          { id: "mini-golf", label: "Mini Golf" }
        ]
      }
    ]
  },

  {
    id: "travel",
    label: "Travel & Transport",
    icon: "🚗",
    groups: [
      {
        id: "parking",
        label: "Parking",
        items: [
          { id: "parking-lots", label: "Parking Lots" },
          { id: "parking-garages", label: "Parking Garages" }
        ]
      },
      {
        id: "fuel",
        label: "Fuel",
        items: [
          { id: "gas-stations", label: "Gas Stations" }
        ]
      }
    ]
  }
];
