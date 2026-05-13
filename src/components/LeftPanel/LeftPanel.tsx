import "./LeftPanel.css";

export function LeftPanel() {
  return (
    <div className="left-panel-wrapper">
      <div className="left-panel">
        <div className="lp-section">
          <button className="lp-btn">Layers</button>
          <button className="lp-btn">Style</button>
        </div>

        <div className="lp-divider" />

        <div className="lp-section">
          <button className="lp-btn">City</button>
          <button className="lp-btn">Park</button>
          <button className="lp-btn">Trail</button>
          <button className="lp-btn">Museum</button>
          <button className="lp-btn">Attraction</button>
          <button className="lp-btn">Event</button>
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
