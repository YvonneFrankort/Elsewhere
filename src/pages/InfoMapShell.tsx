import { useEffect, useRef, useState } from "react";
import React from "react";
import mapboxgl from "mapbox-gl";

import "../map/info/ui/desktop/desktop-ui.css";
import "../styles/map-location-ping.css";

import { MAPBOX_TOKEN } from "../lib/mapbox";

import { useBaseMapInitialize } from "../map/hooks/base/useBaseMapInitialize";
import { useBaseMapStyle } from "../map/hooks/base/useBaseMapStyle";
import { useBaseMapCamera } from "../map/hooks/base/useBaseMapCamera";
import { useBaseMapEvents } from "../map/hooks/base/useBaseMapEvents";

import { StyleManager } from "../map/core/style/StyleManager";

import InfoMapControls from "../map/info/ui/desktop/MapDesktopControls";
import InfoMapMobile from "../map/info/ui/mobile/MapMobileMenu";

import { usePlacesStore } from "../map/info/state/usePlacesStore";
import { usePlacesLayer } from "../map/info/layers/places/usePlacesLayer";
import { useInfoMapData } from "../map/info/state/useInfoMapData";   
import type { PlaceItem } from "../map/info/data/placeCategories";
import { useInitPlacesLayer } from "../map/info/layers/places/initPlacesLayer";
import { useSearchLayer } from "../map/info/layers/search/SearchLayer";

function InfoMapShell() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleManagerRef = useRef<StyleManager | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [style, setStyle] = useState("mapbox://styles/mapbox/streets-v12");
  const [query, setQuery] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ⭐ NEW: search result state for useSearchLayer
  const [searchResult, setSearchResult] = useState<{
    id?: string;
    name?: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const {
    places,
    selectedPlace,
    selectPlace
  } = usePlacesStore();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
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

  // ⭐ MAP INITIALIZATION
  useBaseMapInitialize(mapContainer, mapRef, styleManagerRef, style);
  useBaseMapStyle(mapRef, styleManagerRef, style);

  // ⭐ CREATE INFO PLACES LAYER
  useInitPlacesLayer(mapRef);

  // ⭐ CREATE SEARCH LAYER
  useSearchLayer(mapRef, searchResult);

  // ⭐ UPDATE INFO PLACES LAYER
  usePlacesLayer(mapRef, places, selectPlace);

  const { flyTo } = useBaseMapCamera(mapRef);
  useBaseMapEvents(mapRef);

  useEffect(() => {
    if (!selectedPlace || !mapRef.current) return;

    if (
      selectedPlace.geometry?.type === "Point" &&
      Array.isArray(selectedPlace.geometry.coordinates)
    ) {
      const coords = selectedPlace.geometry.coordinates as [number, number];
      flyTo(coords, 14);
    }
  }, [selectedPlace, flyTo]);

  // ⭐ MOBILE AUTO-LOCATE
  useEffect(() => {
    if (!isMobile) return;
    if (!mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;

        if (userMarkerRef.current) userMarkerRef.current.remove();

        const el = document.createElement("div");
        el.className = "pulse-marker";

        userMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current!);

        mapRef.current!.jumpTo({
          center: [longitude, latitude],
          zoom: 16,
          pitch: 50,
        });
      },
      (err) => console.error("GEO ERROR", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [isMobile, mapRef]);

  // ⭐ UPDATED SEARCH HANDLER
  async function handleSearch() {
    if (!mapRef.current || !query.trim()) return;

    const parts = query.split(/[\s,]+/).map((p) => p.trim());

    // Direct coordinate search
    if (parts.length === 2 && !isNaN(+parts[0]) && !isNaN(+parts[1])) {
      const lng = +parts[0];
      const lat = +parts[1];

      setSearchResult({
        latitude: lat,
        longitude: lng,
        name: "Coordinates"
      });

      flyTo([lng, lat], 60);
      setQuery("");
      return;
    }

    // Geocoding search
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.features?.length) {
      const [lng, lat] = data.features[0].center;

      setSearchResult({
        id: data.features[0].id,
        name: data.features[0].place_name,
        latitude: lat,
        longitude: lng
      });

      flyTo([lng, lat], 12);
      setQuery("");
    }
  }

  function handleLocateMe() {
    if (!mapRef.current || !mapRef.current.loaded()) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;

        if (userMarkerRef.current) userMarkerRef.current.remove();

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

        setTimeout(() => {
          mapRef.current?.dragPan.enable();
          mapRef.current?.touchZoomRotate.enableRotation();
        }, 900);
      },
      (err) => console.error("GEO ERROR", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // ⭐ CATEGORY HANDLER
  function handleCategorySelect(item: PlaceItem) {
    if (!mapRef.current) return;

    const { loadPlacesForItem } = useInfoMapData.getState();
    loadPlacesForItem(mapRef.current, item.id);
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <div id="dropdown-layer"></div>
      <div ref={mapContainer} className="flex-1 w-full h-full map-container" />

      <div className="map-ui"></div>

      {!isMobile && (
        <div className="desktop-ui">
          <InfoMapControls
            flyTo={flyTo}
            mapRef={mapRef}
            style={style}
            setStyle={setStyle}
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}

            places={places}
            selectedPlace={selectedPlace}
            selectPlace={selectPlace}

            onCategorySelect={handleCategorySelect}
          />
        </div>
      )}

      {isMobile && (
        <div className="mobile-ui">
          <InfoMapMobile
            query={query}
            setQuery={setQuery}
            mapRef={mapRef}
            handleSearch={handleSearch}
            style={style}
            setStyle={setStyle}

            onCategorySelect={handleCategorySelect}

            places={places}
            selectedPlace={selectedPlace}
            selectPlace={selectPlace}
          />
        </div>
      )}

      <button className="map-fab" onClick={handleLocateMe}>
        <img src="/icons/location.svg" alt="Locate me" />
      </button>
    </div>
  );
}

export default React.memo(InfoMapShell);
