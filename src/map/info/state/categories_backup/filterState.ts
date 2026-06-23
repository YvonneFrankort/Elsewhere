export interface FilterState {
  activeFilters: Set<string>;
}

export const initialFilterState: FilterState = {
  activeFilters: new Set()
};

export type FilterAction =
  | { type: "TOGGLE_FILTER"; filterId: string }
  | { type: "SET_FILTERS"; filterIds: string[] }
  | { type: "CLEAR_FILTERS" };

export function filterReducer(
  state: FilterState,
  action: FilterAction
): FilterState {
  switch (action.type) {
    case "TOGGLE_FILTER": {
      const next = new Set(state.activeFilters);
      if (next.has(action.filterId)) {
        next.delete(action.filterId);
      } else {
        next.add(action.filterId);
      }
      return { activeFilters: next };
    }
    case "SET_FILTERS":
      return { activeFilters: new Set(action.filterIds) };
    case "CLEAR_FILTERS":
      return { activeFilters: new Set() };
    default:
      return state;
  }
}
