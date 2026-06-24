import { create } from "zustand";
import { searchPlacesByItem } from "../services/apiPlacesSource";
import { usePlacesStore } from "./usePlacesStore";

interface InfoMapState {
  loading: boolean;
  selectedItemId: string | null;
  hiddenSubcategories: Set<string>;

  setLoading: (value: boolean) => void;
  setSelectedItem: (itemId: string | null) => void;

  toggleSubcategory: (id: string, map: mapboxgl.Map) => void;
  loadPlacesForItem: (map: mapboxgl.Map, itemId: string) => Promise<void>;
}

export const useInfoMapData = create<InfoMapState>((set, get) => ({
  loading: false,
  selectedItemId: null,
  hiddenSubcategories: new Set(),

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

    // Re-filter current places from the REAL store
    const { places } = usePlacesStore.getState();
    const filtered = places.filter((p) => !hidden.has(p.category));

    const source = map.getSource("places-source") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "FeatureCollection" as const,
        features: filtered.map((p) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [p.longitude, p.latitude],
          },
          properties: {
            id: p.id,
            name: p.name,
            category: p.category,
          },
        })),
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

      const places = results.map((p) => ({
        id: p.id,
        name: p.name,
        latitude: p.lat,
        longitude: p.lon,
        category: p.subcategoryId,
      }));

      // Send results to the REAL store
      const { setPlaces } = usePlacesStore.getState();
      setPlaces(places);

    } catch (err) {
      console.error("Failed to load places:", err);
    }

    set({ loading: false });
  },
}));
