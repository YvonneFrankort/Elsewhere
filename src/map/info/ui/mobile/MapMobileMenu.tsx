import { useState, useRef, useEffect } from "react";
import "./MapMobileMenu.css";
import type { Feature } from "geojson";
import type {
  PlaceCategory,
  PlaceGroup,
  PlaceSubcategory,
  PlaceItem
} from "../../data/placeCategories";
import { placeCategories } from "../../data/placeCategories";

interface InfoMapMobileProps {
  query: string;
  setQuery: (value: string) => void;
  mapRef: React.RefObject<mapboxgl.Map | null>;
  handleSearch: () => void;
  style: string;
  setStyle: (value: string) => void;
  onCategorySelect: (item: PlaceItem) => void;
  places: Feature[];
  selectedPlace: Feature | null;
  selectPlace: (place: Feature) => void;
}

function InfoMapMobile({
  query,
  setQuery,
  mapRef,
  handleSearch,
  style,
  setStyle,
  onCategorySelect
}: InfoMapMobileProps) {

  const [open, setOpen] = useState(false);

  // NEW: expanded levels
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [openSubId, setOpenSubId] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function toggleCategory(cat: PlaceCategory) {
    setOpenCategoryId(prev => prev === cat.id ? null : cat.id);
    setOpenGroupId(null);
    setOpenSubId(null);
  }

  function toggleGroup(group: PlaceGroup) {
    setOpenGroupId(prev => prev === group.id ? null : group.id);
    setOpenSubId(null);
  }

  function toggleSub(sub: PlaceSubcategory) {
    setOpenSubId(prev => prev === sub.id ? null : sub.id);
  }

  function handleItemClick(item: PlaceItem) {
    onCategorySelect(item);
    setOpen(false);
  }

  return (
    <div className="mobile-layer">

      {/* ⭐ TOP BAR */}
      <div className="mobile-topbar">
        <button className="menu-button" onClick={() => setOpen(true)}>☰</button>

        <button className="planner-button">🗺️</button>

        <div className="mobile-search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-icon" onClick={handleSearch}>🔍</button>
        </div>
      </div>

      {/* ⭐ ZOOM */}
      <div className="mobile-zoom">
        <button onClick={() => mapRef.current?.zoomIn()}>＋</button>
        <button onClick={() => mapRef.current?.zoomOut()}>−</button>
      </div>

      {/* ⭐ MENU ROOT */}
      {open && (
        <div className="mobile-menu-root">
          <div className="menu-overlay" onClick={() => setOpen(false)} />

          <div className="menu-panel menu-panel--open" ref={panelRef}>
            <div className="menu-header">
              <h3>Map Options</h3>
              <button className="menu-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="menu-content">

              {/* ⭐ Layout */}
              <div className="menu-section">
                <h4>Layout</h4>

                <div className="layout-options">
                  <button
                    className={style === "mapbox://styles/mapbox/streets-v12" ? "active" : ""}
                    onClick={() => {
                      setStyle("mapbox://styles/mapbox/streets-v12");
                      setOpen(false);
                    }}
                  >
                    Streets
                  </button>

                  <button
                    className={style === "mapbox://styles/mapbox/outdoors-v12" ? "active" : ""}
                    onClick={() => {
                      setStyle("mapbox://styles/mapbox/outdoors-v12");
                      setOpen(false);
                    }}
                  >
                    Outdoors
                  </button>

                  <button
                    className={style === "mapbox://styles/mapbox/satellite-streets-v12" ? "active" : ""}
                    onClick={() => {
                      setStyle("mapbox://styles/mapbox/satellite-streets-v12");
                      setOpen(false);
                    }}
                  >
                    Satellite
                  </button>
                </div>
              </div>

              {/* ⭐ Categories */}
              <div className="menu-section">
                <h4>Categories</h4>

                <div className="category-options">

                  {placeCategories.map((cat) => (
                    <div key={cat.id} className="category-group">

                      {/* CATEGORY */}
                      <div className="category-title" onClick={() => toggleCategory(cat)}>
                        {cat.label}
                        <span className="chevron">{openCategoryId === cat.id ? "▼" : "▶"}</span>
                      </div>

                      {/* GROUPS */}
                      {openCategoryId === cat.id && (
                        <div className="group-list">
                          {cat.groups.map((group) => (
                            <div key={group.id} className="group-block">

                              <div className="group-title" onClick={() => toggleGroup(group)}>
                                {group.label}
                                <span className="chevron">{openGroupId === group.id ? "▼" : "▶"}</span>
                              </div>

                              {/* SUBCATEGORIES */}
                              {openGroupId === group.id && (
                                <div className="sub-list">
                                  {group.subcategories.map((sub) => (
                                    <div key={sub.id} className="sub-block">

                                      <div className="sub-title" onClick={() => toggleSub(sub)}>
                                        {sub.label}
                                        <span className="chevron">{openSubId === sub.id ? "▼" : "▶"}</span>
                                      </div>

                                      {/* FINAL ITEMS */}
                                      {openSubId === sub.id && (
                                        <div className="item-list">
                                          {sub.items.map((item) => (
                                            <button
                                              key={item.id}
                                              className="item-button"
                                              onClick={() => handleItemClick(item)}
                                            >
                                              {item.label}
                                            </button>
                                          ))}
                                        </div>
                                      )}

                                    </div>
                                  ))}
                                </div>
                              )}

                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  ))}

                </div>
              </div>

              <div className="menu-section">
                <h4>Settings</h4>
                <div className="placeholder">Coming soon</div>
              </div>
            </div>

            <div className="menu-footer">
              <button className="footer-btn">Info</button>
              <button className="footer-btn">Go to Planner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InfoMapMobile;
