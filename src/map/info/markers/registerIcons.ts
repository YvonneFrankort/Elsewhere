export async function registerIcons(map: mapboxgl.Map) {
  const icons = [
// Nature
{ name: "lake", url: "/icons/info/nature/lake.svg" },
{ name: "river", url: "/icons/info/nature/river.svg" },
{ name: "waterfall", url: "/icons/info/nature/waterfall.svg" },
{ name: "peak", url: "/icons/info/nature/peak.svg" },
{ name: "viewpoint", url: "/icons/info/nature/viewpoint.svg" },
{ name: "trailhead", url: "/icons/info/nature/trailhead.svg" },
{ name: "forest", url: "/icons/info/nature/forest.svg" },
{ name: "beach", url: "/icons/info/nature/beach.svg" },
{ name: "mountain", url: "/icons/info/nature/mountain.svg" },
{ name: "national_park", url: "/icons/info/nature/national_park.svg" },

    // --- Food ---
    { name: "restaurant", url: "/icons/info/food/restaurant.svg" },
    { name: "italian", url: "/icons/info/food/italian.svg" },
    { name: "mexican", url: "/icons/info/food/mexican.svg" },
    { name: "cafe", url: "/icons/info/food/cafe.svg" },
    { name: "bakery", url: "/icons/info/food/bakery.svg" },
    { name: "icecream", url: "/icons/info/food/icecream.svg" },
    { name: "fastfood", url: "/icons/info/food/fastfood.svg" },
    { name: "bbq", url: "/icons/info/food/bbq.svg" },
    { name: "donuts", url: "/icons/info/food/donuts.svg" },

    // --- Activities ---
    { name: "bowling", url: "/icons/info/activities/bowling.svg" },
    { name: "arcade", url: "/icons/info/activities/arcade.svg" },
    { name: "minigolf", url: "/icons/info/activities/minigolf.svg" },
    { name: "cinema", url: "/icons/info/activities/cinema.svg" },
    { name: "theatre", url: "/icons/info/activities/theatre.svg" },
    { name: "zoo", url: "/icons/info/activities/zoo.svg" },
    { name: "aquarium", url: "/icons/info/activities/aquarium.svg" },
    { name: "themepark", url: "/icons/info/activities/themepark.svg" },
    { name: "amusementpark", url: "/icons/info/activities/amusementpark.svg" },

    // --- Shopping ---
    { name: "mall", url: "/icons/info/shopping/mall.svg" },
    { name: "supermarket", url: "/icons/info/shopping/supermarket.svg" },
    { name: "boutique", url: "/icons/info/shopping/boutique.svg" },

    // --- Accommodation ---
    { name: "hotel", url: "/icons/info/accommodation/hotel.svg" },
    { name: "hostel", url: "/icons/info/accommodation/hostel.svg" },
    { name: "motel", url: "/icons/info/accommodation/motel.svg" },
    { name: "guesthouse", url: "/icons/info/accommodation/guesthouse.svg" },
    { name: "vacation_rental", url: "/icons/info/accommodation/vacation_rental.svg" },

    // --- Transport ---
    { name: "bus", url: "/icons/info/transport/bus.svg" },
    { name: "train", url: "/icons/info/transport/train.svg" },
    { name: "airport", url: "/icons/info/transport/airport.svg" },
    { name: "parking", url: "/icons/info/transport/parking.svg" },

    // --- Other ---
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
