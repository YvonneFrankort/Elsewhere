import "./LeftPanel.css";
import { categories } from "../../map/info/config/categories";
import { useCategoryFilters } from "../../map/hooks/info/useCategoryFilters";

export function LeftPanel({ onToggleCategory }: { onToggleCategory: (id: string, visible: boolean) => void }) {
  console.log("LeftPanel rendered");
  console.log("categories:", categories);


  const { active, toggleCategory } = useCategoryFilters(onToggleCategory);

  return (
    <div className="left-panel-wrapper">
      <div className="left-panel">

        <div className="lp-section">
          <button className="lp-btn">Layers</button>
          <button className="lp-btn">Style</button>
        </div>

        <div className="lp-divider" />

        <div className="lp-section">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`lp-btn ${active[cat.id] ? "active" : ""}`}
              style={active[cat.id] ? { background: cat.color, color: "white" } : {}}
              onClick={() => toggleCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="lp-divider" />

        <div className="lp-section">
          <button className="lp-btn">Favorites</button>
          <button className="lp-btn reset">Reset</button>
        </div>

      </div>
    </div>
  );
}
