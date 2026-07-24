import type { OSMTag } from "./osmtypes"


export const osmFilters: Record<string, OSMTag[]> = {
  // 🌊 WATER
  lakes: [
    { key: "natural", value: "water" },
    { key: "water", value: "lake" }
  ],
  rivers: [
    { key: "waterway", value: "river" }
  ],
  waterfalls: [
    { key: "waterway", value: "waterfall" }
  ],
  beaches: [
    { key: "natural", value: "beach" }
  ],

  // 🏔️ MOUNTAINS & FORESTS
  mountains: [
  { key: "natural", value: "peak" },
  { key: "natural", value: "hill" },
  { key: "natural", value: "ridge" },
  { key: "natural", value: "cliff" },
  { key: "natural", value: "rock" },
  { key: "natural", value: "mountain" }
],
forests: [
    { key: "landuse", value: "forest" },
    { key: "natural", value: "wood" }
  ],
  canyons: [
  { key: "natural", value: "cliff" },
  { key: "natural", value: "valley" },
  { key: "natural", value: "gorge" },
  { key: "natural", value: "gully" },
  { key: "natural", value: "ravine" }
],
  caves: [
    { key: "natural", value: "cave_entrance" }
  ],
  islands: [
  { key: "place", value: "island" },
  { key: "place", value: "islet" },
  { key: "place", value: "archipelago" },
  { key: "natural", value: "peninsula" }
],

  // 🥾 TRAILS
  hiking: [
  { key: "highway", value: "path" },
  { key: "highway", value: "footway" },
  { key: "highway", value: "track" },
  { key: "route", value: "hiking" }
],
  trailheads: [
  { key: "information", value: "guidepost" },
  { key: "information", value: "trailhead" },
  { key: "trailhead", value: "yes" }
],

  "climbing-areas": [
    { key: "sport", value: "climbing" }
  ],
  ski: [
  { key: "piste:type", value: "downhill" },
  { key: "piste:type", value: "nordic" },
  { key: "piste:type", value: "ski_jump" }
],

  // 🛡️ PROTECTED AREAS
  "nature-reserves": [{ key: "leisure", value: "nature_reserve" }],
  "national-parks": [{ key: "boundary", value: "national_park" }],
  wilderness: [{ key: "boundary", value: "protected_area" }],

  // 🌄 SCENIC
  viewpoints: [{ key: "tourism", value: "viewpoint" }],
  "mountain-peaks": [{ key: "natural", value: "peak" }],
  "scenic-overlooks": [{ key: "tourism", value: "viewpoint" }],
  "scenic-routes": [{ key: "scenic", value: "yes" }], // weak
  "scenic-drives": [{ key: "scenic", value: "yes" }], // weak

  // 🚗 TRAVEL & TRANSPORT
  "parking-lots": [{ key: "amenity", value: "parking" }],
  "gas-stations": [{ key: "amenity", value: "fuel" }]
};
