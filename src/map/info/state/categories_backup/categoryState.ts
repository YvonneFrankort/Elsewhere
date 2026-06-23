export interface Category {
  id: string;
  label: string;
  subcategories?: Array<{
    id: string;
    label: string;
  }>;
}

export interface CategoryState {
  categories: Category[];               // all categories
  selectedCategoryId: string | null;    // active category
  selectedSubcategoryId: string | null; // active subcategory
}

export const initialCategoryState: CategoryState = {
  categories: [],            // you will fill this from your config
  selectedCategoryId: null,
  selectedSubcategoryId: null,
};


export type CategoryAction =
  | { type: "SET_CATEGORY"; categoryId: string | null }
  | { type: "SET_SUBCATEGORY"; subcategoryId: string | null }
  | { type: "RESET_CATEGORY" };

export function categoryReducer(
  state: CategoryState,
  action: CategoryAction
): CategoryState {
  switch (action.type) {
    case "SET_CATEGORY":
  return {
    ...state,
    selectedCategoryId: action.categoryId,
    selectedSubcategoryId: null,
  };

    case "SET_SUBCATEGORY":
  return {
    ...state,
    selectedSubcategoryId: action.subcategoryId,
  };

    case "RESET_CATEGORY":
  return {
    ...state,
    selectedCategoryId: null,
    selectedSubcategoryId: null,
  };
  }
}
