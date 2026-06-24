import { create } from "zustand";

export interface PlaceItemData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
}

interface PlacesState {
  places: PlaceItemData[];
  selectedPlace: PlaceItemData | null;
  setPlaces: (places: PlaceItemData[]) => void;
  selectPlace: (place: PlaceItemData | null) => void;
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
