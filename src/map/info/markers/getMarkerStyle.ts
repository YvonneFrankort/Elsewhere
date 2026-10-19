export function getMarkerStyle(feature: any) {
  const category = feature.properties?.category;
  const subcategory = feature.properties?.subcategory;

  // -------------------------
  // NATURE - WATER
  // -------------------------
  if (
    [
      "waterfalls"
      // later:
      // "lakes",
      // "rivers",
      // "beaches"
    ].includes(subcategory)
  ) {
    return {
      icon: "water",
      size: 1.2,
      category,
      subcategory
    };
  }

  // -------------------------
  // NATURE - LANDFORMS
  // -------------------------
  if (
    [
      "arches",
      "natural-bridges",
      "caves",
      "rockhouses",
      "ridges",
      "peaks",
      "gorges",
      "river-overlooks"
    ].includes(subcategory)
  ) {
    return {
      icon: "landforms",
      size: 1.2,
      category,
      subcategory
    };
  }

  // -------------------------
  // NATURE - TRAILS
  // -------------------------
  if (
    [
      "trails",
      "trailheads"
    ].includes(subcategory)
  ) {
    return {
      icon: "trails",
      size: 1.2,
      category,
      subcategory
    };
  }

  // -------------------------
  // NATURE - SCENIC
  // -------------------------
  if (
    [
      "viewpoints",
      "scenic-roads"
    ].includes(subcategory)
  ) {
    return {
      icon: "scenic",
      size: 1.2,
      category,
      subcategory
    };
  }

  // -------------------------
  // NATURE - PROTECTED
  // -------------------------
  if (
    [
      "national_park",
      "national_monument",
      "national_preserve",
      "national_historic_site",
      "national_recreation_area",
      "national_seashore",
      "national_river",
      "national_lakeshore",
      "nature-preserves",
      "nature-reserves",
      "state-parks",
      "visitor-center",
      "alert", 
      "event"
    ].includes(subcategory)
  ) {
    return {
      icon: "protected",
      size: 1.2,
      category,
      subcategory
    };
  }

  // -------------------------
  // HISTORIC
  // -------------------------
  if (
    [
      "battlefields",
      "historic-sites",
      "monuments"
    ].includes(subcategory)
  ) {
    return {
      icon: subcategory,
      size: 1.2,
      category,
      subcategory
    };
  }

  // -------------------------
  // FOOD
  // -------------------------
  if (
    [
      "restaurants",
      "cafes-sweets",
      "fast-casual",
      "drinks"
    ].includes(subcategory)
  ) {
    return {
      icon: subcategory,
      size: 1.2,
      category,
      subcategory
    };
  }

  // -------------------------
  // ATTRACTIONS
  // -------------------------
  if (
    [
      "urban-scenic",
      "wildlife-marine",
      "theme-parks",
      "entertainment"
    ].includes(subcategory)
  ) {
    return {
      icon: subcategory,
      size: 1.2,
      category,
      subcategory
    };
  }

  // -------------------------
  // TRAVEL
  // -------------------------
  if (
    [
      "parking"
    ].includes(subcategory)
  ) {
    return {
      icon: subcategory,
      size: 1.2,
      category,
      subcategory
    };
  }

  // -------------------------
  // DEFAULT
  // -------------------------
  return {
    icon: "default",
    size: 1.0,
    category,
    subcategory
  };
}