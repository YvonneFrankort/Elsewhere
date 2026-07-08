import { create } from "zustand";
import type { Feature } from "geojson";

interface PlacesState {
  places: Feature[];
  selectedPlaceId: string | null;

  setPlaces: (places: Feature[]) => void;
  selectPlace: (id: string | null) => void;
}

export const usePlacesStore = create<PlacesState>((set) => ({
  places: [],
  selectedPlaceId: null,

  setPlaces: (places) => set({ places }),
  selectPlace: (id) => set({ selectedPlaceId: id }),
}));
