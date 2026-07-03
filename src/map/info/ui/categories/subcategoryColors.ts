
import type { PlaceCategory } from "../../data/placeCategories";

const colorPalette = [
  "#4A90E2", "#50E3C2", "#B8E986", "#F8E71C", "#F5A623",
  "#D0021B", "#9013FE", "#8B572A", "#417505", "#BD10E0",
  "#7ED321", "#F6A623", "#D0011B", "#4A4A4A", "#9B9B9B"
];

let colorIndex = 0;
const nextColor = () => colorPalette[colorIndex++ % colorPalette.length];

export const subcategoryColors: Record<string, string> = {};

export function generateSubcategoryColors(categories: PlaceCategory[]) {
  categories.forEach(category =>
    category.groups.forEach(group =>
      group.subcategories?.forEach(sub => {
        subcategoryColors[sub.id] = nextColor();
      })
    )
  );
}
