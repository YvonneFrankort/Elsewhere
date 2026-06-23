import mapboxgl from "mapbox-gl";

export interface SourceRegistryItem {
  id: string;
  add: (map: mapboxgl.Map) => void;
}

export interface LayerRegistryItem {
  id: string;
  add: (map: mapboxgl.Map) => void;
}
