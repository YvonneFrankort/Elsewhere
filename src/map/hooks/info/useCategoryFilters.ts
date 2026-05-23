import { useState, useCallback } from "react";
import { categories } from "../../map/info/config/categories";

export function useCategoryFilters(onToggleCategory: (id: string, visible: boolean) => void) {
  // Create initial state: { city: true, park: true, ... }
  const [active, setActive] = useState(
    () => Object.fromEntries(categories.map(c => [c.id, true]))
  );

  const toggleCategory = useCallback((id: string) => {
    setActive(prev => {
      const next = { ...prev, [id]: !prev[id] };
      onToggleCategory(id, next[id]); // notify StyleManager
      return next;
    });
  }, [onToggleCategory]);

  return { active, toggleCategory };
}
