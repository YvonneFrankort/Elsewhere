export async function registerIcons(map: mapboxgl.Map) {
  const icons = [
    // 🌊 WATER
    { name: "lakes", url: "/icons/info/nature/lake.svg" },
    { name: "rivers", url: "/icons/info/nature/river.svg" },
    { name: "waterfalls", url: "/icons/info/nature/waterfall.svg" },
    { name: "beaches", url: "/icons/info/nature/beach.svg" },

    // 🏔️ MOUNTAINS & LANDFORMS
    { name: "mountains", url: "/icons/info/nature/mountain.svg" },
    { name: "mountain-peaks", url: "/icons/info/nature/peak.svg" },
    { name: "canyons", url: "/icons/info/nature/canyon.svg" },
    { name: "caves", url: "/icons/info/nature/cave.svg" },
    { name: "islands", url: "/icons/info/nature/island.svg" },
    { name: "forests", url: "/icons/info/nature/forest.svg" },

    // 🥾 TRAILS
    { name: "hiking", url: "/icons/info/nature/hiking.svg" },
    { name: "trailheads", url: "/icons/info/nature/trailhead.svg" },
    { name: "climbing-areas", url: "/icons/info/nature/climbing.svg" },
    { name: "ski", url: "/icons/info/nature/ski.svg" },

    // 🛡️ PROTECTED AREAS
    { name: "national-parks", url: "/icons/info/nature/national_park.svg" },
    { name: "nature-reserves", url: "/icons/info/nature/nature_reserve.svg" },
    { name: "wilderness", url: "/icons/info/nature/wilderness.svg" },

    // 🌄 SCENIC
    { name: "viewpoints", url: "/icons/info/nature/viewpoint.svg" },
    { name: "scenic-overlooks", url: "/icons/info/nature/viewpoint.svg" },
    { name: "scenic-routes", url: "/icons/info/nature/scenic_route.svg" },
    { name: "scenic-drives", url: "/icons/info/nature/scenic_drive.svg" },

    // 🚗 TRAVEL & TRANSPORT
    { name: "parking-lots", url: "/icons/info/transport/parking.svg" },
    { name: "gas-stations", url: "/icons/info/transport/fuel.svg" },

    // 🔍 SEARCH / DEFAULT
    { name: "search", url: "/icons/info/other/search.svg" },
    { name: "default", url: "/icons/info/other/default.svg" },
    { name: "location", url: "/icons/info/other/location.svg" },
    { name: "info", url: "/icons/info/other/info.svg" }
  ];

  for (const icon of icons) {
    if (!map.hasImage(icon.name)) {
      try {
        const response = await fetch(icon.url);
        const svgText = await response.text();

        const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);

        map.loadImage(url, (err, image) => {
          if (!err && image) {
            map.addImage(icon.name, image);
          }
        });
      } catch (e) {
        console.warn("Failed to load icon:", icon.name, e);
      }
    }
  }
}
