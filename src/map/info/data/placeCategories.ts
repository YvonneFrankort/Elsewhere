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
        { id: "waterfalls", label: "Waterfalls" }
      ]
    },
    {
      id: "landforms",
      label: "Landforms",
      items: [
        { id: "arches", label: "Arches" },
        { id: "natural-bridges", label: "Natural Bridges" },
        { id: "caves", label: "Caves" },
        { id: "rockhouses", label: "Rockhouses" },
        { id: "ridges", label: "Ridges" },
        { id: "peaks", label: "Peaks" },
        { id: "gorges", label: "Gorges" },
        { id: "river-overlooks", label: "River Overlooks" }
      ]
    },
    {
      id: "trails",
      label: "Trails",
      items: [
        { id: "trails", label: "Trails" },
        { id: "trailheads", label: "Trailheads" }
      ]
    },
    {
      id: "scenic",
      label: "Scenic",
      items: [
        { id: "viewpoints", label: "Viewpoints" },
        { id: "scenic-roads", label: "Scenic Roads" }
      ]
    },
    {
      id: "protected",
      label: "Protected Areas",
      items: [
        { id: "national-parks", label: "National Parks" },
        { id: "state-parks", label: "State Parks" },
        { id: "nature-preserves", label: "Nature Preserves" },
        { id: "nature-reserves", label: "Nature Reserves" },

        { id: "national_park", label: "National Parks (NPS)" },
        { id: "national_monument", label: "National Monuments" },
        { id: "national_preserve", label: "National Preserves" },
        { id: "national_historic_site", label: "Historic Sites (NPS)" },
        { id: "national_recreation_area", label: "Recreation Areas" },
        { id: "national_seashore", label: "National Seashores" },
        { id: "national_river", label: "National Rivers" },
        { id: "national_lakeshore", label: "National Lakeshores" },

        { id: "visitor_center", label: "Visitor Centers" },
        { id: "alert", label: "Park Alerts" },
        { id: "event", label: "Park Events" }
      ]
    }
  ]
},

{
  id: "historic",
  label: "Historic & Cultural",
  icon: "🏛️",
  groups: [
    {
      id: "battlefields",
      label: "Battlefields",
      items: [
        { id: "battlefields", label: "Battlefields" }
      ]
    },
    {
      id: "historic-sites",
      label: "Historic Sites",
      items: [
        { id: "historic-sites", label: "Historic Sites" }
      ]
    },
    {
      id: "monuments",
      label: "Monuments",
      items: [
        { id: "monuments", label: "Monuments" }
      ]
    }
  ]
},

  // FOOD (Geoapify)
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

  // ATTRACTIONS (curated)
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
          { id: "urban-parks", label: "Urban Parks" }
        ]
      },
      {
        id: "wildlife-marine",
        label: "Wildlife & Marine",
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
        { id: "parking-garages", label: "Parking Garages" },
        { id: "trailheads", label: "Trail Parking" }
      ]
    }
  ]
}

];
