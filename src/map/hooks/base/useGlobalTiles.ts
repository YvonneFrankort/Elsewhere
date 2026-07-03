import mapboxgl from "mapbox-gl";

export function initializeGlobalTiles(map: mapboxgl.Map) {
  // --- URBAN TILE SOURCE (MapTiler POI) ---
  if (!map.getSource("urban-pois")) {
    map.addSource("urban-pois", {
      type: "vector",
      url: "https://api.maptiler.com/tiles/poi-v2/tiles.json?key=YOUR_KEY"
    });
  }

  // Later:
  // - add tile layers
  // - add tile styling
  // - add tile registry
}
