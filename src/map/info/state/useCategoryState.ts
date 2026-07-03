import { create } from "zustand";

interface CategoryState {
  activeCategories: string[];
  toggleCategory: (cat: string) => void;
  setCategories: (cats: string[]) => void;
}

export const useCategoryState = create<CategoryState>((set) => ({
  activeCategories: [],

  toggleCategory: (cat) =>
    set((state) => {
      const exists = state.activeCategories.includes(cat);
      return {
        activeCategories: exists
          ? state.activeCategories.filter((c) => c !== cat) // remove
          : [...state.activeCategories, cat]                // add
      };
    }),

  setCategories: (cats) => set({ activeCategories: cats })
}));
