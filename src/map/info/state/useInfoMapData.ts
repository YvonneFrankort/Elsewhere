// src/map/info/state/useInfoMapData.ts

import { create } from "zustand";
import type { FeatureCollection, Feature } from "geojson";
import { searchPlacesByItem } from "../services/apiPlacesSource";

interface InfoMapState {
  places: Feature[];
  loading: boolean;
  selectedItemId: string | null;
  hiddenSubcategories: Set<string>;

  setPlaces: (features: Feature[]) => void;
  setLoading: (value: boolean) => void;
  setSelectedItem: (itemId: string | null) => void;

  toggleSubcategory: (id: string, map: mapboxgl.Map) => void;
  loadPlacesForItem: (map: mapboxgl.Map, itemId: string) => Promise<void>;
}

export const useInfoMapData = create<InfoMapState>((set, get) => ({
  places: [],
  loading: false,
  selectedItemId: null,
  hiddenSubcategories: new Set(),

  setPlaces: (features) => set({ places: features }),
  setLoading: (value) => set({ loading: value }),
  setSelectedItem: (itemId) => set({ selectedItemId: itemId }),

  // -------------------------------------------------------
  // TOGGLE SUBCATEGORY VISIBILITY
  // -------------------------------------------------------
  toggleSubcategory: (id, map) => {
    const hidden = new Set(get().hiddenSubcategories);

    if (hidden.has(id)) hidden.delete(id);
    else hidden.add(id);

    set({ hiddenSubcategories: hidden });

    // Re-filter current places
    const { places } = get();
    const filtered = places.filter(
      (f) => !hidden.has(f.properties?.subcategoryId)
    );

    const source = map.getSource("info-places") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features: filtered,
      });
    }
  },

  // -------------------------------------------------------
  // LOAD PLACES FOR SELECTED ITEM
  // -------------------------------------------------------
  loadPlacesForItem: async (map, itemId) => {
    set({ loading: true, selectedItemId: itemId });

    try {
      const center = map.getCenter();
      const lat = center.lat;
      const lon = center.lng;

      const results = await searchPlacesByItem(lat, lon, itemId);

      // Convert to GeoJSON features
      const features: Feature[] = results.map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.lon, p.lat],
        },
        properties: {
          id: p.id,
          name: p.name,
          subcategoryId: p.subcategoryId,
          color: p.color,
        },
      }));

      // Apply visibility filtering
      const hidden = get().hiddenSubcategories;
      const filtered = features.filter(
        (f) => !hidden.has(f.properties?.subcategoryId)
      );

      // Update Zustand store
      set({ places: features });

      // Update Mapbox source
      const source = map.getSource("info-places") as mapboxgl.GeoJSONSource;

      if (source) {
        const geojson: FeatureCollection = {
          type: "FeatureCollection",
          features: filtered,
        };
        source.setData(geojson);
      }
    } catch (err) {
      console.error("Failed to load places:", err);
    }

    set({ loading: false });
  },
}));
