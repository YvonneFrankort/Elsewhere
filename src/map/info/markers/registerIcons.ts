export async function registerIcons(map: mapboxgl.Map) {

  console.log("[RegisterIcons] START");

  const icons = [

  // NATURE
  { name: "water", url: "/icons/info/nature/water.png" },
  { name: "landforms", url: "/icons/info/nature/landforms.png" },
  { name: "trails", url: "/icons/info/nature/trails.png" },
  { name: "scenic", url: "/icons/info/nature/scenic.png" },
  { name: "protected", url: "/icons/info/nature/protected.png" },

  // HISTORIC
  { name: "battlefields", url: "/icons/info/historic/battlefields.png" },
  { name: "historic-sites", url: "/icons/info/historic/historic-sites.png" },
  { name: "monuments", url: "/icons/info/historic/monuments.png" },

  // FOOD
  { name: "restaurants", url: "/icons/info/food/restaurants.png" },
  { name: "cafes-sweets", url: "/icons/info/food/cafes-sweets.png" },
  { name: "fast-casual", url: "/icons/info/food/fast-casual.png" },
  { name: "drinks", url: "/icons/info/food/drinks.png" },

  // ATTRACTIONS
  { name: "urban-scenic", url: "/icons/info/attractions/urban-scenic.png" },
  { name: "wildlife-marine", url: "/icons/info/attractions/wildlife-marine.png" },
  { name: "theme-parks", url: "/icons/info/attractions/theme-parks.png" },
  { name: "entertainment", url: "/icons/info/attractions/entertainment.png" },

  // TRAVEL
  { name: "parking", url: "/icons/info/travel/parking.png" },

  // DEFAULT
  { name: "default", url: "/icons/info/other/default.svg" }
];

  for (const icon of icons) {
    if (!map.hasImage(icon.name)) {
      try {
map.loadImage(icon.url, (err, image) => {

  console.log(
    "[Icon Load]",
    icon.name,
    "err:",
    err,
    "image:",
    !!image
  );

  if (!err && image) {
    map.addImage(icon.name, image);

    console.log(
      "[Icon Added]",
      icon.name,
      map.hasImage(icon.name)
    );
  }
});
      } catch (e) {
        console.warn("Failed to load icon:", icon.name, e);
      }
    }
  }
}
