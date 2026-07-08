import type { Feature } from "geojson";
import { getMarkerStyle } from "./getMarkerStyle";

export function applyMarkerStyle(feature: Feature): Feature {
  const style = getMarkerStyle(feature);

  feature.properties = feature.properties || {};

  feature.properties.icon = style.icon;
  feature.properties.color = style.color;
  feature.properties.size = style.size;
  feature.properties.category = style.category;
  feature.properties.subcategory = style.subcategory;

  return feature;
}
