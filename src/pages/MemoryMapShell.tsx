import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import mapboxgl from "mapbox-gl";

import { useBaseMapInitialize } from "../map/hooks/base/useBaseMapInitialize";
import { useBaseMapStyle } from "../map/hooks/base/useBaseMapStyle";
import { useBaseMapCamera } from "../map/hooks/base/useBaseMapCamera";
import { useBaseMapEvents } from "../map/hooks/base/useBaseMapEvents";

import { StyleManager } from "../map/core/style/StyleManager";

import MemoryMapDesktop from "../map/memory/hooks/MemoryMapDesktop";
import MemoryMapMobile from "../map/memory/hooks/MemoryMapMobile";
import "../map/memory/ui/memory-map.css"

import type {
  Memory,
  MemoryNote,
  MemoryPhoto,
} from "../map/memory/data/types";

import type {
  UpdateMemoryInput,
} from "../map/memory/data/memoryService";

import {
  addPhoto,
  createMemory,
  createNote,
  deletePhoto,
  getMemories,
  getMemoryNotes,
  getMemoryPhotos,
  updateMemory,
  updateNote,
  updatePhoto,
} from "../map/memory/data/memoryService";

import {
  getLocalPhotoAsset,
} from "../map/memory/data/memoryDatabase";

import "../map/info/ui/desktop/desktop-ui.css";
import "../map/info/ui/mobile/MapMobileMenu.css";
import "../styles/map-location-ping.css";

import { MAPBOX_TOKEN } from "../lib/mapbox";

interface MemoryPhotoView {
  photo: MemoryPhoto;
  imageUrl: string | null;
}

interface MemoryMapShellProps {
  onBack: () => void;
}

function MemoryMapShell({ onBack }: MemoryMapShellProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleManagerRef = useRef<StyleManager | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const memoryMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const [style, setStyle] = useState(
    "mapbox://styles/mapbox/streets-v12"
  );
  const [query, setQuery] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  useEffect(() => {
    console.log("Selected memory changed:", selectedMemory?.id ?? null);
  }, [selectedMemory]);

  const [notes, setNotes] = useState<MemoryNote[]>([]);
  const [photos, setPhotos] = useState<MemoryPhotoView[]>([]);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);

  const [detailRefresh, setDetailRefresh] = useState(0);
  const [isChoosingLocation, setIsChoosingLocation] = useState(false);

  const [pendingLocation, setPendingLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  const [newMemoryTitle, setNewMemoryTitle] = useState("");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMapReady = useCallback((_map: mapboxgl.Map) => {
    setMapReady(true);
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
    handleMapReady
  );

  useBaseMapStyle(mapRef, styleManagerRef, style);

  const { flyTo } = useBaseMapCamera(mapRef);

  useBaseMapEvents(mapRef);

  // Load the local memory archive.
  const refreshMemories = useCallback(async () => {
    try {
      const savedMemories = await getMemories();
      setMemories(savedMemories);
    } catch (error) {
      console.error("Could not load memories", error);
      setEditorError("Could not load saved memories.");
    }
  }, []);

  useEffect(() => {
    void refreshMemories();
  }, [refreshMemories]);

  // Load notes and photo previews whenever the selected memory changes.
  useEffect(() => {
    let cancelled = false;
    const createdUrls: string[] = [];

    async function loadSelectedMemory() {
      if (!selectedMemory) {
        setNotes([]);
        setPhotos([]);
        return;
      }

      setEditorLoading(true);
      setEditorError(null);

      try {
        const [savedNotes, savedPhotos] = await Promise.all([
          getMemoryNotes(selectedMemory.id),
          getMemoryPhotos(selectedMemory.id),
        ]);

        const photoViews: MemoryPhotoView[] = await Promise.all(
          savedPhotos.map(async (photo) => {
            const asset = await getLocalPhotoAsset(photo.id);

            if (!asset) {
              return { photo, imageUrl: null };
            }

            const imageUrl = URL.createObjectURL(asset.blob);
            createdUrls.push(imageUrl);

            return { photo, imageUrl };
          })
        );

        if (!cancelled) {
          setNotes(savedNotes);
          setPhotos(photoViews);
        }
      } catch (error) {
        console.error("Could not load memory details", error);

        if (!cancelled) {
          setEditorError("Could not load this memory's notes or photos.");
        }
      } finally {
        if (!cancelled) {
          setEditorLoading(false);
        }
      }
    }

    void loadSelectedMemory();

    return () => {
      cancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedMemory?.id, detailRefresh]);

  // Create one map marker for each memory.
  useEffect(() => {
    const map = mapRef.current;

    memoryMarkersRef.current.forEach((marker) => marker.remove());
    memoryMarkersRef.current = [];

    if (!map || !mapReady) return;

    memories.forEach((memory) => {
      const markerElement = document.createElement("button");
      markerElement.type = "button";
      markerElement.className = "memory-map-marker";
      markerElement.title = memory.title;
      markerElement.setAttribute(
        "aria-label",
        `Open memory: ${memory.title}`
      );

      markerElement.style.width = "28px";
      markerElement.style.height = "28px";
      markerElement.style.borderRadius = "50%";
      markerElement.style.border = "3px solid white";
      markerElement.style.background = "#8b5cf6";
      markerElement.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35)";
      markerElement.style.cursor = "pointer";

      /*    markerElement.addEventListener("click", (event) => {
           event.stopPropagation();
           setSelectedMemory(memory);
         }); */

      markerElement.addEventListener("click", (event) => {
        event.stopPropagation();
        console.log("Memory marker clicked:", memory.id);
        setSelectedMemory(memory);
      });

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: "center",
      })
        .setLngLat([
          memory.location.coordinates.longitude,
          memory.location.coordinates.latitude,
        ])
        .addTo(map);

      memoryMarkersRef.current.push(marker);
    });

    return () => {
      memoryMarkersRef.current.forEach((marker) => marker.remove());
      memoryMarkersRef.current = [];
    };
  }, [memories, mapReady]);

  // INITIAL USER LOCATION
  useEffect(() => {
    if (!mapReady) return;

    const map = mapRef.current;
    if (!map) return;

    let cancelled = false;

    const fallback = () => {
      if (cancelled) return;

      map.jumpTo({
        center: [-85.0269, 35.9489],
        zoom: 12,
        pitch: 50,
      });
    };

    if (!navigator.geolocation) {
      fallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled || mapRef.current !== map) return;

        const { longitude, latitude } = pos.coords;

        map.jumpTo({
          center: [longitude, latitude],
          zoom: 16,
          pitch: 50,
        });

        const el = document.createElement("div");
        el.className = "pulse-marker";

        userMarkerRef.current?.remove();

        userMarkerRef.current = new mapboxgl.Marker({
          element: el,
        })
          .setLngLat([longitude, latitude])
          .addTo(map);
      },
      () => fallback(),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      cancelled = true;
    };
  }, [mapReady]);

  // SEARCH
  async function handleSearch() {
    if (!mapRef.current || !query.trim()) return;

    const parts = query.split(/[\s,]+/).map((part) => part.trim());

    if (
      parts.length === 2 &&
      !isNaN(Number(parts[0])) &&
      !isNaN(Number(parts[1]))
    ) {
      const longitude = Number(parts[0]);
      const latitude = Number(parts[1]);

      if (
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        console.warn("Invalid coordinates");
        return;
      }

      flyTo([longitude, latitude], 12);
      setQuery("");
      return;
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Mapbox search failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.features?.length) {
        const [longitude, latitude] = data.features[0].center;
        flyTo([longitude, latitude], 12);
        setQuery("");
      } else {
        console.warn("No search results found");
      }
    } catch (error) {
      console.error("MAP SEARCH ERROR", error);
    }
  }

  // START LOCATION SELECTION
  const handleStartLocationSelection = useCallback(() => {
    setSelectedMemory(null);
    setNewMemoryTitle("");
    setEditorError(null);
    setIsChoosingLocation(true);
  }, []);

  // CONFIRM THE LOCATION SHOWN AT THE MAP CENTRE
  const handleConfirmLocationSelection = useCallback(() => {
    setIsChoosingLocation(false);
  }, []);

  // CANCEL LOCATION SELECTION
  const handleCancelLocationSelection = useCallback(() => {
    setIsChoosingLocation(false);
    setNewMemoryTitle("");
    setEditorError(null);
  }, []);

  // CREATE A MEMORY ONLY AFTER THE LOCATION HAS BEEN CONFIRMED.
  const handleCreateMemory = useCallback(
    async (title: string) => {
      const map = mapRef.current;

      if (!map) {
        setEditorError("The map is not ready.");
        return;
      }

      if (!title.trim()) {
        setEditorError("Please enter a memory title.");
        return;
      }

      const center = map.getCenter();

      setEditorSaving(true);
      setEditorError(null);

      try {
        const memory = await createMemory({
          title: title.trim(),
          location: {
            coordinates: {
              longitude: center.lng,
              latitude: center.lat,
            },
            label: null,
          },
          capturedAt: new Date().toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        setIsChoosingLocation(false);
        setNewMemoryTitle("");
        setPendingLocation(null);

        await refreshMemories();
        setSelectedMemory(memory);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not create memory.";

        setEditorError(message);
        throw error;
      } finally {
        setEditorSaving(false);
      }
    },
    [refreshMemories]
  );

  // UPDATE THE SELECTED MEMORY.
  const handleSaveMemory = useCallback(
    async (changes: UpdateMemoryInput) => {
      if (!selectedMemory) return;

      setEditorSaving(true);
      setEditorError(null);

      try {
        const updated = await updateMemory(selectedMemory.id, changes);
        setSelectedMemory(updated);
        await refreshMemories();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not save memory.";

        setEditorError(message);
        throw error;
      } finally {
        setEditorSaving(false);
      }
    },
    [selectedMemory, refreshMemories]
  );

  // ADD A NOTE WITHOUT REPLACING PREVIOUS NOTES.
  const handleAddNote = useCallback(
    async (content: string) => {
      if (!selectedMemory) return;

      setEditorSaving(true);
      setEditorError(null);

      try {
        await createNote(selectedMemory.id, content);
        setNotes(await getMemoryNotes(selectedMemory.id));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not add note.";
        setEditorError(message);
        throw error;
      } finally {
        setEditorSaving(false);
      }
    },
    [selectedMemory]
  );

  const handleUpdateNote = useCallback(
    async (noteId: string, content: string) => {
      if (!selectedMemory) return;

      setEditorSaving(true);
      setEditorError(null);

      try {
        await updateNote(noteId, content);
        setNotes(await getMemoryNotes(selectedMemory.id));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not update note.";
        setEditorError(message);
        throw error;
      } finally {
        setEditorSaving(false);
      }
    },
    [selectedMemory]
  );

  // ADD PHOTOS TO THE EXISTING MEMORY.
  const handleAddPhotos = useCallback(
    async (files: File[]) => {
      if (!selectedMemory) return;

      setEditorSaving(true);
      setEditorError(null);

      try {
        for (const file of files) {
          await addPhoto(selectedMemory.id, file);
        }

        // Trigger a reload of the selected memory's photos.
        setDetailRefresh((current) => current + 1);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not add photos.";
        setEditorError(message);
        throw error;
      } finally {
        setEditorSaving(false);
      }
    },
    [selectedMemory]
  );

  // UPDATE AN INDIVIDUAL PHOTO CAPTION.
  const handleUpdatePhoto = useCallback(
    async (photoId: string, caption: string) => {
      if (!selectedMemory) return;

      setEditorSaving(true);
      setEditorError(null);

      try {
        await updatePhoto(photoId, {
          caption: caption.trim() || null,
        });

        setDetailRefresh((current) => current + 1);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not update photo caption.";

        setEditorError(message);
        throw error;
      } finally {
        setEditorSaving(false);
      }
    },
    [selectedMemory]
  );

  // DELETE AN INDIVIDUAL PHOTO.
  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      if (!selectedMemory) return;

      setEditorSaving(true);
      setEditorError(null);

      try {
        await deletePhoto(photoId);

        setDetailRefresh((current) => current + 1);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not delete photo.";

        setEditorError(message);
        throw error;
      } finally {
        setEditorSaving(false);
      }
    },
    [selectedMemory]
  );

  // LOCATE ME
  function handleLocateMe() {
    const map = mapRef.current;

    if (!map || !map.loaded() || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;

        const el = document.createElement("div");
        el.className = "pulse-marker";

        userMarkerRef.current?.remove();

        userMarkerRef.current = new mapboxgl.Marker({
          element: el,
        })
          .setLngLat([longitude, latitude])
          .addTo(map);

        map.easeTo({
          center: [longitude, latitude],
          zoom: 14,
          duration: 800,
        });
      },
      (error) => console.error("GEO ERROR", error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  // CLEANUP MARKERS.
  useEffect(() => {
    return () => {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;

      memoryMarkersRef.current.forEach((marker) => marker.remove());
      memoryMarkersRef.current = [];
    };
  }, []);

  const editorProps = {
    memories,
    selectedMemory,
    notes,
    photos,
    editorLoading,
    editorSaving,
    editorError,
    onSelectMemory: setSelectedMemory,
    onCreateMemory: handleCreateMemory,
    onSaveMemory: handleSaveMemory,
    onAddNote: handleAddNote,
    onUpdateNote: handleUpdateNote,
    onAddPhotos: handleAddPhotos,
    onUpdatePhoto: handleUpdatePhoto,
    onDeletePhoto: handleDeletePhoto,
    onCloseEditor: () => {
      setSelectedMemory(null);
      setEditorError(null);
    },
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <div id="dropdown-layer" />
      <div ref={mapContainer} className="flex-1 w-full h-full map-container" />

      {isChoosingLocation && (
        <>
          {/* Fixed pin: the map moves underneath it. */}
          <div className="memory-location-pin">
            <div className="memory-location-pin-center" />
          </div>

          {/* Title and actions stay on the map. */}
          <div
            className={`memory-create-panel ${isMobile
              ? "memory-create-panel--mobile"
              : "memory-create-panel--desktop"
              }`}
          >
            <input
              type="text"
              value={newMemoryTitle}
              onChange={(event) => setNewMemoryTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && newMemoryTitle.trim()) {
                  void handleCreateMemory(newMemoryTitle);
                }
              }}
              placeholder="Give this memory a title"
              autoFocus
              className="memory-create-title-input"
            />

            {editorError && (
              <p className="memory-create-error" role="alert">
                {editorError}
              </p>
            )}

            <div className="memory-create-actions">
              <button
                type="button"
                className="memory-create-cancel"
                onClick={handleCancelLocationSelection}
                disabled={editorSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="memory-create-save"
                onClick={() => void handleCreateMemory(newMemoryTitle)}
                disabled={editorSaving || !newMemoryTitle.trim()}
              >
                {editorSaving ? "Saving…" : "Save Memory"}
              </button>
            </div>
          </div>
        </>
      )}

      {!isChoosingLocation && !pendingLocation && (
        <button
          type="button"
          className="memory-add-button"
          onClick={handleStartLocationSelection}
        >
          + Add Memory
        </button>
      )}

      {pendingLocation && !isChoosingLocation && (
        <div className="memory-pending-location-banner" />
      )}

      <div className="map-ui" />

      {!isMobile && (
        <div className="desktop-ui">
          <MemoryMapDesktop
            style={style}
            setStyle={setStyle}
            query={query}
            setQuery={setQuery}
            mapRef={mapRef}
            handleSearch={handleSearch}
            onBack={onBack}
            {...editorProps}
          />
        </div>
      )}

      {isMobile && (
        <div className="mobile-ui">
          <MemoryMapMobile
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            mapRef={mapRef}
            style={style}
            setStyle={setStyle}
            onBack={onBack}
            {...editorProps}
          />
        </div>
      )}

      <button className="map-fab locate-me-btn" onClick={handleLocateMe}>
        <span className="locate-me-inner" />
      </button>
    </div>
  );
}

export default React.memo(MemoryMapShell);