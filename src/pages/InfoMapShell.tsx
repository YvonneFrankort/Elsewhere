import { useEffect, useRef, useState } from "react";
import React from "react";
import mapboxgl from "mapbox-gl";

import "../map/info/ui/desktop/desktop-ui.css";
import "../styles/map-location-ping.css";
import { GEOAPIFY_KEY } from "../lib/geoapify";

import { useBaseMapInitialize } from "../map/hooks/base/useBaseMapInitialize";
import { useBaseMapStyle } from "../map/hooks/base/useBaseMapStyle";
import { useBaseMapCamera } from "../map/hooks/base/useBaseMapCamera";
import { useBaseMapEvents } from "../map/hooks/base/useBaseMapEvents";

import { StyleManager } from "../map/core/style/StyleManager";

import InfoMapControls from "../map/info/ui/desktop/MapDesktopControls";
import InfoMapMobile from "../map/info/ui/mobile/MapMobileMenu";
import { MAPBOX_TOKEN } from "../lib/mapbox";
import { useSearchLayer } from "../map/info/layers/search/SearchLayer";

function InfoMapShell() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleManagerRef = useRef<StyleManager | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const categoryMarkersRef = useRef<mapboxgl.Marker[]>([]);

  function clearCategoryMarkers() {
    categoryMarkersRef.current.forEach((m) => m.remove());
    categoryMarkersRef.current = [];
  }

  function fitMapToCategoryResults(features: any[]) {
    if (!mapRef.current) return;

    const bounds = new mapboxgl.LngLatBounds();

    features.forEach((f) => {
      const [lng, lat] = f.geometry.coordinates;
      bounds.extend([lng, lat]);
    });

    mapRef.current.fitBounds(bounds, {
      padding: 60,
      duration: 800,
    });
  }


  const [style, setStyle] = useState("mapbox://styles/mapbox/streets-v12");
  const [query, setQuery] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [searchResult, setSearchResult] = useState<{
    id?: string;
    name?: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.add("map-page");
    document.documentElement.classList.add("map-page");
    return () => {
      document.body.classList.remove("map-page");
      document.documentElement.classList.remove("map-page");
    };
  }, []);

  useBaseMapInitialize(
    mapContainer,
    mapRef,
    styleManagerRef,
    style,
    setUserLocation
  );

  useBaseMapStyle(mapRef, styleManagerRef, style);
  const { flyTo, easeTo } = useBaseMapCamera(mapRef);
  useBaseMapEvents(mapRef);
  useSearchLayer(mapRef, searchResult);
  useEffect(() => {
    if (!mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // update state so categories work immediately
        setUserLocation({ lat: latitude, lng: longitude });

        // center map
        mapRef.current!.setCenter([longitude, latitude]);
      },
      () => {
        // fallback: Tampere (to test)
        const fallback = { lat: 61.4981, lng: 23.7610 };
        setUserLocation(fallback);
        mapRef.current!.setCenter([fallback.lng, fallback.lat]);
      }
    );
  }, []);

  async function handleSearch() {
    if (!mapRef.current || !query.trim()) return;

    const parts = query.split(/[\s,]+/).map((p) => p.trim());

    // Direct coordinate input
    if (parts.length === 2 && !isNaN(+parts[0]) && !isNaN(+parts[1])) {
      flyTo([+parts[0], +parts[1]], 60);
      return;
    }

    // Geocoding
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.features?.length) {
      const [lng, lat] = data.features[0].center;
      flyTo([lng, lat], 12);
      setQuery("");
    }
  }

  function handleLocateMe() {
    if (!mapRef.current || !mapRef.current.loaded()) return;

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;

        setUserLocation({ lat: latitude, lng: longitude });

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        const el = document.createElement("div");
        el.className = "pulse-marker";

        userMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current!);

        mapRef.current!.easeTo({
          center: [longitude, latitude],
          zoom: 16,
          pitch: 50,
          duration: 800,
        });
      },
      (err) => console.error("GEO ERROR", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function handleCategorySelect(category: string) {
    console.log("CATEGORY SELECTED:", category);

    const filters: Record<string, string> = {
      restaurants: "catering.restaurant",
      cafes: "catering.cafe",
      parks: "leisure.park"
    };

    const filter = filters[category];
    if (!filter) {
      console.warn("Unknown category:", category);
      return;
    }

    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();
    const lat = center.lat;
    const lng = center.lng;


    const url = `https://api.geoapify.com/v2/places?categories=${filter}&filter=circle:${lng},${lat},5000&limit=50&apiKey=${GEOAPIFY_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();

      console.log("CATEGORY DATA:", data);

      // 1) Remove old category markers
      clearCategoryMarkers();

      // 2) Add new markers
      data.features.forEach((feature: any) => {
        const [lng, lat] = feature.geometry.coordinates;

        const marker = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(mapRef.current!);

        categoryMarkersRef.current.push(marker);
      });
      fitMapToCategoryResults(data.features);

    } catch (err) {
      console.error("CATEGORY LOAD ERROR:", err);
    }
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <div ref={mapContainer} className="flex-1 w-full h-full map-container" />

      <div className="map-ui">
        {isMobile ? (
          <div className="mobile-ui">
            <InfoMapMobile
              query={query}
              setQuery={setQuery}
              mapRef={mapRef}
              handleSearch={handleSearch}
              style={style}
              setStyle={setStyle}
              onCategorySelect={handleCategorySelect}
            />

          </div>
        ) : (
          <div className="desktop-ui">
            <InfoMapControls
              flyTo={flyTo}
              easeTo={easeTo}
              mapRef={mapRef}
              style={style}
              setStyle={setStyle}
              query={query}
              setQuery={setQuery}
              handleSearch={handleSearch}
            />
          </div>
        )}
      </div>

      <button className="map-fab" onClick={handleLocateMe}>
        <img src="/icons/location.svg" alt="Locate me" />
      </button>
    </div>
  );
}

export default React.memo(InfoMapShell);

