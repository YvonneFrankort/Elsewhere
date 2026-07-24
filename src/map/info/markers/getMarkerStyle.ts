export function getMarkerStyle(feature: any) {
  const t = feature.properties.tags || {};

  // 🌊 WATER
  if (t.water === "lake") {
    return {
      icon: "lakes",
      color: "#4DA6FF",
      size: 1.2,
      category: "nature",
      subcategory: "lakes"
    };
  }

  if (t.waterway === "river") {
    return {
      icon: "rivers",
      color: "#1E90FF",
      size: 1.1,
      category: "nature",
      subcategory: "rivers"
    };
  }

  if (t.waterway === "waterfall") {
    return {
      icon: "waterfalls",
      color: "#66CCFF",
      size: 1.3,
      category: "nature",
      subcategory: "waterfalls"
    };
  }

  // 🏔️ MOUNTAINS & LANDFORMS
  if (t.natural === "peak") {
    return {
      icon: "mountain-peaks",
      color: "#999999",
      size: 1.3,
      category: "nature",
      subcategory: "mountain-peaks"
    };
  }

  if (t.tourism === "viewpoint") {
    return {
      icon: "viewpoints",
      color: "#FFCC00",
      size: 1.2,
      category: "nature",
      subcategory: "viewpoints"
    };
  }

  if (t.information === "guidepost" || t.highway === "trailhead") {
    return {
      icon: "trailheads",
      color: "#228B22",
      size: 1.2,
      category: "nature",
      subcategory: "trailheads"
    };
  }

  // 🍽 FOOD
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

  // 🎳 ACTIVITIES
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

  // 🟦 DEFAULT
  return {
    icon: "default",
    color: "#999999",
    size: 1.0,
    category: "other",
    subcategory: "other"
  };
}
