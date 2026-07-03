import type { OSMTag } from "./osmtypes"


export const osmFilters: Record<string, OSMTag[]> = {
  // 🌊 WATER
  lakes: [
    { key: "natural", value: "water" },
    { key: "water", value: "lake" }
  ],
  rivers: [{ key: "waterway", value: "river" }],
  waterfalls: [{ key: "waterway", value: "waterfall" }],
  beaches: [{ key: "natural", value: "beach" }],

  // 🏔️ MOUNTAINS & FORESTS
  mountains: [{ key: "natural", value: "peak" }],
  forests: [
    { key: "landuse", value: "forest" },
    { key: "natural", value: "wood" }
  ],
  canyons: [{ key: "natural", value: "cliff" }],
  caves: [{ key: "natural", value: "cave_entrance" }],
  islands: [{ key: "place", value: "island" }],

  // 🥾 TRAILS
  hiking: [
    { key: "highway", value: "path" },
    { key: "route", value: "hiking" }
  ],
  trailheads: [
    { key: "information", value: "guidepost" },
    { key: "trailhead", value: "yes" }
  ],
  "climbing-areas": [{ key: "sport", value: "climbing" }],

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
