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
import { useCategoryState } from "../../state/useCategoryState";
import PlaceDetailsPopup from "../../data/components/PlaceDetailsPopup";

interface InfoMapMobileProps {
  query: string;
  setQuery: (value: string) => void;
  mapRef: React.RefObject<mapboxgl.Map | null>;
  handleSearch: () => void;
  style: string;
  setStyle: (value: string) => void;
  places: Feature[];
  selectedPlace: Feature | null;
  selectPlace: (place: Feature) => void;
  setSelectedItem: (id: string | null) => void;
}

function InfoMapMobile({
  query,
  setQuery,
  mapRef,
  handleSearch,
  style,
  setStyle,
  selectedPlace,
  setSelectedItem,
}: InfoMapMobileProps) {

  const [open, setOpen] = useState(false);

  // Accordion state
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [openSubId, setOpenSubId] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);

  // Zustand toggle
  const toggleCategory = useCategoryState((s) => s.toggleCategory);

  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);


  useEffect(() => {
    //alert(selectedPlace?.properties?.name);
    console.log("SELECTED PLACE", selectedPlace);
    console.log("PROPERTIES", selectedPlace?.properties);
    console.log("WEBSITE", selectedPlace?.properties?.website);
    console.log("IMAGE", selectedPlace?.properties?.image);

  }, [selectedPlace]);

  useEffect(() => {
    if (!selectedPlace) return;

    console.log("GEOMETRY", selectedPlace.geometry);
  }, [selectedPlace]);

  useEffect(() => {
    if (!selectedPlace) return;
    if (!mapRef.current) return;

    const coords =
      selectedPlace.geometry.type === "Point"
        ? selectedPlace.geometry.coordinates
        : null;

    if (!coords) return;

    const point = mapRef.current.project(coords as [number, number]);

    console.log("POPUP POS", point);
    setPopupPos({
      x: point.x,
      y: point.y,
    });
  }, [selectedPlace, mapRef]);


  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    map.on("move", updatePopupPosition);

    return () => {
      map.off("move", updatePopupPosition);
    };
  }, [mapRef, selectedPlace]);


  function updatePopupPosition() {
    if (!selectedPlace || !mapRef.current) return;

    const coords =
      selectedPlace.geometry.type === "Point"
        ? selectedPlace.geometry.coordinates
        : null;

    if (!coords) return;

    const point = mapRef.current.project(coords as [number, number]);

    setPopupPos({
      x: point.x,
      y: point.y,
    });
  }

  // Accordion toggles
  function toggleCategoryUI(cat: PlaceCategory) {
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

  // REAL category toggle
  function handleItemClick(item: PlaceItem) {
    toggleCategory(item.id);   // ⭐ multi-category toggle
  }

/*   function getImageUrl(url: string) {
    if (url.includes("commons.wikimedia.org/wiki/File:")) {
      const filename = url.split("File:").pop();

      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename ?? "")}`;
    }

    return url;
  } */

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
                      <div className="category-title" onClick={() => toggleCategoryUI(cat)}>
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

                              {/* SUBCATEGORIES OR DIRECT ITEMS */}
                              {openGroupId === group.id && (
                                <div className="sub-list">

                                  {/* CASE 1: group has direct items */}
                                  {group.items && (
                                    <div className="item-list">
                                      {group.items.map((item) => (
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

                                  {/* CASE 2: group has subcategories */}
                                  {group.subcategories && group.subcategories.map((sub) => (
                                    <div key={sub.id} className="sub-block">

                                      <div className="sub-title" onClick={() => toggleSub(sub)}>
                                        {sub.label}
                                        <span className="chevron">{openSubId === sub.id ? "▼" : "▶"}</span>
                                      </div>

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
{/* 
{selectedPlace && (
  <div className="info-popup" style={{ left: popupPos.x, top: popupPos.y }}>
    <button
      className="menu-close"
      onClick={() => setSelectedItem(null)}
    >
      x
    </button>

    {selectedPlace.properties?.name && (
      <h3>{selectedPlace.properties.name}</h3>
    )}

    {selectedPlace.properties?.image?.url && (
      <div className="popup-image-container">
        <img
          src={getImageUrl(selectedPlace.properties.image.url)}
          alt={
            selectedPlace.properties.image.name ||
            selectedPlace.properties?.name ||
            "Place image"
          }
          className="popup-image"
        />
        {selectedPlace.properties.image.name && (
          <p className="popup-image-caption">
            {selectedPlace.properties.image.name}
          </p>
        )}
      </div>
    )}

    {selectedPlace.properties?.subcategory && (
      <p>Category: {selectedPlace.properties.subcategory}</p>
    )}

    {selectedPlace.properties?.description && (
      <p>Description: {selectedPlace.properties.description}</p>
    )}

    {selectedPlace.properties?.duration && (
      <p>Duration: {selectedPlace.properties.duration}</p>
    )}

    {selectedPlace.properties?.fee && (
      <p>Fee: {selectedPlace.properties.fee}</p>
    )}

    {selectedPlace.properties?.best_time && (
      <p>Best Time: {selectedPlace.properties.best_time}</p>
    )}

    {selectedPlace.properties?.best_time_to_visit && (
      <p>Best Time to Visit: {selectedPlace.properties.best_time_to_visit}</p>
    )}

    {selectedPlace.properties?.access && (
      <p>Access: {selectedPlace.properties.access}</p>
    )}

    {selectedPlace.properties?.parking && (
      <p>Parking: {selectedPlace.properties.parking}</p>
    )}

    {selectedPlace.properties?.website && (
      <p>
        Website:{" "}
        <a
          href={selectedPlace.properties.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Website ↗
        </a>
      </p>
    )}

    {selectedPlace.properties?.url && (
      <p>
        URL:{" "}
        <a
          href={selectedPlace.properties.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Link ↗
        </a>
      </p>
    )}
  </div>
)} */}
<PlaceDetailsPopup
  selectedPlace={selectedPlace}
  popupPos={popupPos}
  onClose={() => setSelectedItem(null)}
/>
</div>
);
}

export default InfoMapMobile;
