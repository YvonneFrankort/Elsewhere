import type { Feature } from "geojson";
import { getMarkerStyle } from "./getMarkerStyle";

export function applyMarkerStyle(feature: Feature): Feature {
  
  console.log(
"[MarkerStyle IN]",
feature.properties?.name,
feature.properties?.category,
feature.properties?.subcategory
);
  
  const style = getMarkerStyle(feature);

  console.log(
  "[MarkerStyle OUT]",
  style
);

  feature.properties = feature.properties || {};

  feature.properties.icon = style.icon;
  feature.properties.size = style.size;
  feature.properties.category = style.category;
  feature.properties.subcategory = style.subcategory;

  return feature;
}
