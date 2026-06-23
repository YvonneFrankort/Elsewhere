import { create } from "zustand";
import type { Feature } from "geojson";

interface PlacesState {
  places: Feature[];
  selectedPlace: Feature | null;
  setPlaces: (places: Feature[]) => void;
  selectPlace: (place: Feature | null) => void;
}

export const usePlacesStore = create<PlacesState>((set) => ({
  places: [],
  selectedPlace: null,

  setPlaces(places) {
    set({ places });
  },

  selectPlace(place) {
    set({ selectedPlace: place });
  },
}));
