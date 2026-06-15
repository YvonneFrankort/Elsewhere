import { useState, useRef, useEffect } from "react";
import "./MapMobileMenu.css";

interface InfoMapMobileProps {
  query: string;
  setQuery: (value: string) => void;
  mapRef: React.RefObject<mapboxgl.Map | null>;
  handleSearch: () => void;
  style: string;
  setStyle: (value: string) => void;
  onCategorySelect: (category: string) => void;
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

  console.log("InfoMapMobile RENDER");
  console.log("MOBILE QUERY:", query);
  console.log("InfoMapMobile RENDER");

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log("InfoMapMobile MOUNTED");
    function handleClickOutside(e: MouseEvent) {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function loadCategory(type: string) {
    // later: call your real loader
    console.log("LOAD CATEGORY:", type);
  }


  return (
    <div className="mobile-layer">

      {/* ⭐ ALWAYS VISIBLE TOP BAR */}
      <div
        className="mobile-topbar"
        ref={() => console.log("TOPBAR MOUNTED")}
      >
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

      {/* ⭐ ZOOM BUTTONS — moved OUTSIDE the top bar */}
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

              <div className="menu-section">
                <h4>Categories</h4>

                <div className="category-options">
                  <button onClick={() => { onCategorySelect("restaurants"); setOpen(false); }}>
                    Restaurants
                  </button>

                  <button onClick={() => { onCategorySelect("cafes"); setOpen(false); }}>
                    Cafes
                  </button>

                  <button onClick={() => { onCategorySelect("parks"); setOpen(false); }}>
                    Parks
                  </button>
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
