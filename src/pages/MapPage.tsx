import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../lib/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import CustomDropdown from "../components/CustomDropdown";


export default function MapPage() {

  useEffect(() => {
    document.body.classList.add("map-page");
    document.documentElement.classList.add("map-page");
    return () => {
      document.body.classList.remove("map-page");
      document.documentElement.classList.remove("map-page");
    };
  }, []);


  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const didInitStyle = useRef(false);

  const [style, setStyle] = useState("mapbox://styles/mapbox/streets-v12");
  const [query, setQuery] = useState("");

  const [locating, setLocating] = useState(false);


  // --- CUSTOM LAYERS (3D, SKY, TERRAIN) ---
  function applyCustomLayers(map: mapboxgl.Map) {
    if (!map.getSource("mapbox-dem")) {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
    }
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });

    if (!map.getLayer("sky")) {
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      });
    }

    if (!map.getLayer("3d-buildings")) {
      map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.6,
        },
      });
    }
  }

  // --- INITIAL MAP LOAD (DELAYED TO FIX 400PX BUG) ---
  useEffect(() => {
    if (!mapContainer.current) return;

    // Wait for layout to fully settle before creating the map
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapContainer.current!,
          style,
          center: [25.47, 65.01],
          zoom: 11,
          pitch: 20,
          bearing: 0,
        });

        mapRef.current = map;

        map.on("load", () => {
          applyCustomLayers(map);

          map.addControl(new mapboxgl.NavigationControl(), "top-right");
          map.addControl(
            new mapboxgl.ScaleControl({ maxWidth: 120, unit: "metric" }),
            "bottom-left"
          );

          setTimeout(() => map.resize(), 100);
        });
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

// --- STYLE CHANGE (smooth) ---
useEffect(() => {
  if (!mapRef.current) return;

  const map = mapRef.current;

  const center = map.getCenter();
  const zoom = map.getZoom();
  const pitch = map.getPitch();
  const bearing = map.getBearing();

  map.once("style.load", () => {
    applyCustomLayers(map);

    map.easeTo({
      center,
      zoom,
      pitch,
      bearing,
      duration: 600,
    });
  });

  map.setStyle(style);
}, [style]);


  // --- SEARCH ---
  async function handleSearch() {
    if (!mapRef.current || !query) return;

    const parts = query.split(/[\s,]+/).map((p) => p.trim());

    if (parts.length === 2 && !isNaN(+parts[0]) && !isNaN(+parts[1])) {
      mapRef.current.flyTo({
        center: [+parts[0], +parts[1]],
        zoom: 12,
        pitch: 60,
      });
      return;
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.features?.length) {
      const [lng, lat] = data.features[0].center;
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 12,
        pitch: 60,
      });

      setQuery("");
    }
  }

  // --- LOCATE ME ---
  const handleLocateMe = () => {
    console.log("BUTTON CLICKED");

    if (!mapRef.current?.loaded()) {
      console.log("Map still loading");
      return;
    }

    if (locating) {
      console.log("Already locating, ignoring extra click");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation not supported in this browser");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("GEO SUCCESS", pos);
        const { longitude, latitude } = pos.coords;

        if (userMarkerRef.current) userMarkerRef.current.remove();

        const el = document.createElement("div");
        el.className = "location-dot";

        userMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current!);

        mapRef.current!.easeTo({
          center: [longitude, latitude],
          zoom: 16,
          pitch: 30,
          duration: 800,
        });

        setLocating(false);
      },
      (err) => {
        console.log("GEO ERROR", err);
        alert(err.message);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <>
      {/* MAP BELOW */}
      <div className="map-wrapper">
        <div ref={mapContainer} className="map-container" />
      </div>

      {/* UI ABOVE */}
      <div className="map-ui">
        <div className="map-search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search place or coordinates"
          />
          <button onClick={handleSearch}>🔍</button>
        </div>

        <div className="map-style">
          <CustomDropdown
            value={style}
            onChange={(v) => setStyle(v)}
            options={[
              { label: "Streets", value: "mapbox://styles/mapbox/streets-v12" },
              { label: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v12" },
              { label: "Dark", value: "mapbox://styles/mapbox/dark-v11" },
              { label: "Satellite", value: "mapbox://styles/mapbox/satellite-streets-v12" },
            ]}
          />

        </div>

        {/* FIXED BUTTON */}
        <button className="map-fab" onClick={handleLocateMe}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="white" />
            <path
              d="M12 2v3M12 19v3M4 12H2M22 12h-3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </>
  );
}
