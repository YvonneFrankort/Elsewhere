import { useState, useRef, useEffect } from "react";
import "./MapMobileMenu.css";

function InfoMapMobile() {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="mobile-menu-root">

      <div className="mobile-topbar">
        <button className="menu-button" onClick={() => setOpen(true)}>☰</button>
        <button className="planner-button">🗺️</button>
      </div>

      {open && (
        <div className="menu-overlay" onClick={() => setOpen(false)} />
      )}

      <div className={`menu-panel ${open ? "menu-panel--open" : ""}`} ref={panelRef}>
        <div className="menu-header">
          <h3>Map Options</h3>
          <button className="menu-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="menu-content">
          <div className="menu-section">
            <h4>Layout</h4>
            <div className="placeholder">Coming soon</div>
          </div>

          <div className="menu-section">
            <h4>Categories</h4>
            <div className="placeholder">Coming soon</div>
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
  );
}

export default InfoMapMobile;
