import { useState } from "react";
import React from "react";
import type { Feature } from "geojson";
import type { PlaceCategory, PlaceGroup, PlaceSubcategory, PlaceItem } from "../../data/placeCategories";
import { placeCategories } from "../../data/placeCategories";

import { useCategoryState } from "../../state/useCategoryState";


interface Props {
  flyTo: (center: [number, number], zoom?: number, pitch?: number, bearing?: number) => void;
  style: string;
  setStyle: (s: string) => void;
  query: string;
  setQuery: (s: string) => void;
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  handleSearch: () => void;
  places: Feature[];
  selectedPlace: Feature | null;
  selectPlace: (place: Feature) => void;
}

/* -----------------------------
   Segmented Control
------------------------------ */

interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedProps {
  value: string;
  onChange: (v: string) => void;
  options: SegmentedOption[];
}

function Segmented({ value, onChange, options }: SegmentedProps) {
  return (
    <div className="segmented">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={value === opt.value ? "active" : ""}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* -----------------------------
   Main Component
------------------------------ */
function InfoMapControls({
  flyTo,
  style,
  setStyle,
  query,
  setQuery,
  mapRef,
  handleSearch
}: Props) {

  const [layout, setLayout] = useState("info");
  const [showCategories, setShowCategories] = useState(false);

  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [openSubId, setOpenSubId] = useState<string | null>(null);

  // ⭐ NEW: Zustand multi-category state
  const activeCategories = useCategoryState((s) => s.activeCategories);
  const toggleCategoryState = useCategoryState((s) => s.toggleCategory);

  function toggleCategory(cat: PlaceCategory) {
    setOpenCategoryId(prev => (prev === cat.id ? null : cat.id));
    setOpenGroupId(null);
    setOpenSubId(null);
  }

  function toggleGroup(group: PlaceGroup) {
    setOpenGroupId(prev => (prev === group.id ? null : group.id));
    setOpenSubId(null);
  }

  function toggleSub(sub: PlaceSubcategory) {
    setOpenSubId(prev => (prev === sub.id ? null : sub.id));
  }

  // ⭐ UPDATED: Multi-category toggle
  function handleItemClick(item: PlaceItem) {
    toggleCategoryState(item.id);   // add/remove category
  }

  return (
    <div className="map-ui-section">
      <div className="map-topbar">
        <div className="topbar-left">

          <Segmented
            value={layout}
            onChange={setLayout}
            options={[
              { label: "Info Map", value: "info" },
              { label: "Memory Map", value: "memory" },
              { label: "Planner", value: "planner" }
            ]}
          />

          <Segmented
            value={style}
            onChange={setStyle}
            options={[
              { label: "Streets", value: "mapbox://styles/mapbox/streets-v12" },
              { label: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v12" },
              { label: "Satellite", value: "mapbox://styles/mapbox/satellite-streets-v12" }
            ]}
          />

          <button className="places-btn" onClick={() => setShowCategories(v => !v)}>
            Categories
          </button>

        </div>

        <div className="topbar-center">
          <div className="map-search">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search place or coordinates"
            />
            <button onClick={handleSearch}>🔍</button>
          </div>
        </div>

        <div className="topbar-right" />
      </div>

      {showCategories && (
        <div className="places-panel">

          {placeCategories.map(cat => (
            <div key={cat.id} className="category-group">

              {/* CATEGORY */}
              <div className="category-title" onClick={() => toggleCategory(cat)}>
                {cat.label}
                <span className="chevron">{openCategoryId === cat.id ? "▼" : "▶"}</span>
              </div>

              {/* GROUPS */}
              {openCategoryId === cat.id && (
                <div className="subcategory-list">

                  {cat.groups.map(group => (
                    <div key={group.id} className="group-block">

                      <div className="group-title" onClick={() => toggleGroup(group)}>
                        {group.label}
                        <span className="chevron">{openGroupId === group.id ? "▼" : "▶"}</span>
                      </div>

                      {/* SUBCATEGORIES OR DIRECT ITEMS */}
                      {openGroupId === group.id && (
                        <div className="sub-list">

                          {/* CASE 1: group has direct items */}
                          {group.items && (
                            <div className="item-list">
                              {group.items.map(item => (
                                <div
                                  key={item.id}
                                  className={
                                    "place-item sub-item " +
                                    (activeCategories.includes(item.id) ? "active" : "")
                                  }
                                  onClick={() => handleItemClick(item)}
                                >
                                  {item.label}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* CASE 2: group has subcategories */}
                          {group.subcategories && group.subcategories.map(sub => (
                            <div key={sub.id} className="sub-block">

                              <div className="sub-title" onClick={() => toggleSub(sub)}>
                                {sub.label}
                                <span className="chevron">{openSubId === sub.id ? "▼" : "▶"}</span>
                              </div>

                              {openSubId === sub.id && (
                                <div className="item-list">
                                  {sub.items.map(item => (
                                    <div
                                      key={item.id}
                                      className={
                                        "place-item sub-item " +
                                        (activeCategories.includes(item.id) ? "active" : "")
                                      }
                                      onClick={() => handleItemClick(item)}
                                    >
                                      {item.label}
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
              )}

            </div>
          ))}

        </div>
      )}

      <div className="desktop-zoom">
        <button onClick={() => mapRef.current?.zoomIn()}>＋</button>
        <button onClick={() => mapRef.current?.zoomOut()}>−</button>
      </div>
    </div>
  );
}

export default React.memo(InfoMapControls);
