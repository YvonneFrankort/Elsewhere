import { create } from "zustand";

interface InfoMapUIState {
  selectedItemId: string | null;
  loading: boolean;
  hiddenSubcategories: Set<string>;

  setSelectedItem: (id: string | null) => void;
  setLoading: (value: boolean) => void;
  toggleSubcategory: (id: string) => void;
}

export const useInfoMapUI = create<InfoMapUIState>((set, get) => ({
  selectedItemId: null,
  loading: false,
  hiddenSubcategories: new Set(),

  setSelectedItem: (id) => set({ selectedItemId: id }),
  setLoading: (value) => set({ loading: value }),

  toggleSubcategory: (id) => {
    const hidden = new Set(get().hiddenSubcategories);

    if (hidden.has(id)) hidden.delete(id);
    else hidden.add(id);

    set({ hiddenSubcategories: hidden });
  }
}));
