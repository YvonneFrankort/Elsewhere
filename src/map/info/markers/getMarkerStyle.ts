
export function getMarkerStyle(feature: any) {
  const t = feature.properties.tags || {};

  // --- NATURE ---
  if (t.water === "lake") {
    return {
      icon: "lake",
      color: "#4DA6FF",
      size: 1.2,
      category: "nature",
      subcategory: "lake"
    };
  }

  if (t.waterway === "river") {
    return {
      icon: "river",
      color: "#1E90FF",
      size: 1.1,
      category: "nature",
      subcategory: "river"
    };
  }

  if (t.waterway === "waterfall") {
    return {
      icon: "waterfall",
      color: "#66CCFF",
      size: 1.3,
      category: "nature",
      subcategory: "waterfall"
    };
  }

  if (t.natural === "peak") {
    return {
      icon: "peak",
      color: "#999999",
      size: 1.3,
      category: "nature",
      subcategory: "peak"
    };
  }

  if (t.tourism === "viewpoint") {
    return {
      icon: "viewpoint",
      color: "#FFCC00",
      size: 1.2,
      category: "nature",
      subcategory: "viewpoint"
    };
  }

  if (t.highway === "trailhead" || t.information === "guidepost") {
    return {
      icon: "trailhead",
      color: "#228B22",
      size: 1.2,
      category: "nature",
      subcategory: "trailhead"
    };
  }

  // --- FOOD ---
  if (t.amenity === "restaurant") {
    if (t.cuisine === "italian") {
      return {
        icon: "italian",
        color: "#FF4D4D",
        size: 1.2,
        category: "food",
        subcategory: "italian"
      };
    }

    if (t.cuisine === "mexican") {
      return {
        icon: "mexican",
        color: "#FFB347",
        size: 1.2,
        category: "food",
        subcategory: "mexican"
      };
    }

    return {
      icon: "restaurant",
      color: "#FF7043",
      size: 1.1,
      category: "food",
      subcategory: "restaurant"
    };
  }

  // --- ACTIVITIES ---
  if (t.leisure === "bowling_alley") {
    return {
      icon: "bowling",
      color: "#FF8C00",
      size: 1.3,
      category: "activities",
      subcategory: "bowling"
    };
  }

  if (t.leisure === "amusement_arcade") {
    return {
      icon: "arcade",
      color: "#BA55D3",
      size: 1.3,
      category: "activities",
      subcategory: "arcade"
    };
  }

  if (t.leisure === "miniature_golf") {
    return {
      icon: "minigolf",
      color: "#32CD32",
      size: 1.3,
      category: "activities",
      subcategory: "minigolf"
    };
  }

  // --- DEFAULT ---
  return {
    icon: "default",
    color: "#999999",
    size: 1.0,
    category: "other",
    subcategory: "other"
  };
}
