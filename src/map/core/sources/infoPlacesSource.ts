// src/map/sources/infoPlacesSource.ts
import mapboxgl from "mapbox-gl";
import { infoPlaces } from "./infoPlaces";
import type { FeatureCollection, Feature, Point } from "geojson";

function buildGeoJSON(): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: infoPlaces.map((p): Feature<Point> => ({
      type: "Feature",
      properties: {
        id: p.id,
        name: p.name,
        category: p.category,
      },
      geometry: {
        type: "Point",
        coordinates: [p.longitude, p.latitude],
      },
    })),
  };
}

export const infoPlacesSource = {
  id: "info-places-source",

  add(map: mapboxgl.Map) {
    const data = buildGeoJSON();

    if (!map.getSource(this.id)) {
      map.addSource(this.id, {
        type: "geojson",
        data,
      });
    } else {
      (map.getSource(this.id) as mapboxgl.GeoJSONSource).setData(data);
    }
  }
};
