import type { Feature, Point } from "geojson";
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon"; 

function normalizeCampground(cg: any): Feature<Point> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        Number(cg.longitude),
        Number(cg.latitude)
      ]
    },
    properties: {
      id: cg.id,
      name: cg.name,
      category: "campground",
      source: "nps",
      parkCode: cg.parkCode,
      description: cg.description,
      url: cg.url
    }
  };
}
