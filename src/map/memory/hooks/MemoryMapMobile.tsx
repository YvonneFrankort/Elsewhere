import React, { useEffect, useState } from "react";
import type mapboxgl from "mapbox-gl";
import "../ui/mobile/memory-map-mobile.css"

import type {
  Memory,
  MemoryNote,
  MemoryPhoto,
} from "../data/types";

import type {
  UpdateMemoryInput,
} from "../data/memoryService";

interface MemoryPhotoView {
  photo: MemoryPhoto;
  imageUrl: string | null;
}

interface MemoryEditorProps {
  memories: Memory[];
  selectedMemory: Memory | null;
  notes: MemoryNote[];
  photos: MemoryPhotoView[];
  editorLoading: boolean;
  editorSaving: boolean;
  editorError: string | null;
  onSelectMemory: (memory: Memory | null) => void;
  onCreateMemory: (title: string) => Promise<void>;
  onSaveMemory: (changes: UpdateMemoryInput) => Promise<void>;
  onAddNote: (content: string) => Promise<void>;
  onUpdateNote: (noteId: string, content: string) => Promise<void>;
  onAddPhotos: (files: File[]) => Promise<void>;
  onUpdatePhoto: (photoId: string, caption: string) => Promise<void>;
  onDeletePhoto: (photoId: string) => Promise<void>;
  onCloseEditor: () => void;
}

interface MemoryMapMobileProps extends MemoryEditorProps {
  query: string;
  setQuery: (value: string) => void;
  handleSearch: () => void;
  mapRef: React.RefObject<mapboxgl.Map | null>;
  style: string;
  setStyle: (value: string) => void;
  onBack: () => void;
  pendingLocation?: {
    longitude: number;
    latitude: number;
  } | null;
  onCancelCreateMemory?: () => void;
  filteredMemories: Memory[];
  timelineFilter: "all" | "today" | "week" | "month" | "lastMonth" | "year";
  setTimelineFilter: (
    filter: "all" | "today" | "week" | "month" | "lastMonth" | "year"
  ) => void;
  memoryArchive: {
    year: number;
    months: number[];
  }[];
  selectedArchiveYear: number | null;
  selectedArchiveMonth: number | null;
  setSelectedArchiveYear: (year: number | null) => void;
  setSelectedArchiveMonth: (month: number | null) => void;
}

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

function MemoryMapMobile({
  query,
  setQuery,
  handleSearch,
  mapRef,
  style,
  setStyle,
  onBack,
  memories,
  selectedMemory,
  notes,
  photos,
  editorLoading,
  editorSaving,
  editorError,
  onSelectMemory,
  onCreateMemory,
  onSaveMemory,
  onAddNote,
  onUpdateNote,
  onAddPhotos,
  onCloseEditor,
  pendingLocation,
  onCancelCreateMemory,
  onUpdatePhoto,
  onDeletePhoto,
  filteredMemories,
  timelineFilter,
  setTimelineFilter,
  memoryArchive,
  selectedArchiveYear,
  selectedArchiveMonth,
  setSelectedArchiveYear,
  setSelectedArchiveMonth,
}: MemoryMapMobileProps) {
  const [open, setOpen] = useState(false);
  const [newMemoryTitle, setNewMemoryTitle] = useState("");
  const [memoryTitle, setMemoryTitle] = useState("");
  const [capturedAt, setCapturedAt] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [photoCaptions, setPhotoCaptions] = useState<Record<string, string>>({});

  const styles = [
    { label: "Streets", value: "mapbox://styles/mapbox/streets-v12" },
    { label: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v12" },
    {
      label: "Satellite",
      value: "mapbox://styles/mapbox/satellite-streets-v12",
    },
  ];

  useEffect(() => {
    if (!selectedMemory) return;

    setMemoryTitle(selectedMemory.title);
    setCapturedAt(toDateTimeLocal(selectedMemory.capturedAt));
    setLocationLabel(selectedMemory.location.label ?? "");
    setNewNote("");
    setEditingNoteId(null);

    setPhotoCaptions(
      Object.fromEntries(
        photos.map(({ photo }) => [photo.id, photo.caption ?? ""])
      )
    );
  }, [selectedMemory?.id, photos]);

  async function handleCreate() {
    const title = newMemoryTitle.trim();
    if (!title) return;

    try {
      await onCreateMemory(title);
      setNewMemoryTitle("");
      setOpen(false);
    } catch {
      // The shell displays the error.
    }
  }

  async function handleSave() {
    if (!selectedMemory || !memoryTitle.trim() || !capturedAt) return;

    try {
      await onSaveMemory({
        title: memoryTitle.trim(),
        capturedAt: new Date(capturedAt).toISOString(),
        location: {
          ...selectedMemory.location,
          label: locationLabel.trim() || null,
        },
      });
    } catch {
      // The shell displays the error.
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;

    try {
      await onAddNote(newNote);
      setNewNote("");
    } catch {
      // The shell displays the error.
    }
  }

  async function handleSaveNote(noteId: string) {
    if (!editingNoteContent.trim()) return;

    try {
      await onUpdateNote(noteId, editingNoteContent);
      setEditingNoteId(null);
      setEditingNoteContent("");
    } catch {
      // The shell displays the error.
    }
  }

  async function handlePhotoSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    try {
      await onAddPhotos(files);
      event.target.value = "";
    } catch {
      // The shell displays the error.
    }
  }

  return (
    <div className="mobile-layer">
      <div className="mobile-topbar">
        <button
          className="menu-button"
          onClick={() => setOpen(true)}
          aria-label="Open map menu"
        >
          ☰
        </button>

        <div className="mobile-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
            placeholder="Search"
          />
          <button className="search-icon" onClick={handleSearch}>
            🔍
          </button>
        </div>
      </div>

      <div className="mobile-zoom">
        <button onClick={() => mapRef.current?.zoomIn()}>＋</button>
        <button onClick={() => mapRef.current?.zoomOut()}>−</button>
      </div>

      {open && (
        <div className="mobile-menu-root">
          <div
            className="menu-overlay"
            onClick={() => setOpen(false)}
          />

          <div className="menu-panel menu-panel--open">
            <div className="menu-header">
              <h3>Memory Map</h3>
              <button
                className="menu-close"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>


            <div className="menu-content">
              <div className="menu-section">
                <h4>Map</h4>

                <div className="layout-options">
                  <button
                    onClick={() => {
                      setOpen(false);
                      onBack();
                    }}
                  >
                    Info Map
                  </button>

                  <button className="active" disabled>
                    Memory Map
                  </button>
                </div>
              </div>

              {pendingLocation && (
                <div className="menu-section">
                  <h4>New memory</h4>

                  <p>
                    Selected location:{" "}
                    {pendingLocation.latitude.toFixed(5)},{" "}
                    {pendingLocation.longitude.toFixed(5)}
                  </p>

                  <input
                    value={newMemoryTitle}
                    onChange={(event) => setNewMemoryTitle(event.target.value)}
                    placeholder="Memory title"
                  />

                  <button
                    onClick={handleCreate}
                    disabled={editorSaving || !newMemoryTitle.trim()}
                  >
                    {editorSaving ? "Creating…" : "Create memory"}
                  </button>

                  <button
                    onClick={() => {
                      onCancelCreateMemory?.();
                      setNewMemoryTitle("");
                    }}
                    disabled={editorSaving}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="menu-section">
                <h4>Layout</h4>

                <div className="layout-options">
                  {styles.map((option) => (
                    <button
                      key={option.value}
                      className={style === option.value ? "active" : ""}
                      onClick={() => {
                        setStyle(option.value);
                        setOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="menu-section">
                <h4>Timeline</h4>

                <div className="memory-mobile-timeline-filters">
                  {[
                    { label: "All time", value: "all" },
                    { label: "Today", value: "today" },
                    { label: "This week", value: "week" },
                    { label: "This month", value: "month" },
                    { label: "Last month", value: "lastMonth" },
                    { label: "This year", value: "year" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={timelineFilter === option.value ? "active" : ""}
                      aria-pressed={timelineFilter === option.value}
                      onClick={() => {
                        setTimelineFilter(
                          option.value as
                          | "all"
                          | "today"
                          | "week"
                          | "month"
                          | "lastMonth"
                          | "year"
                        );
                        setSelectedArchiveYear(null);
                        setSelectedArchiveMonth(null);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="memory-mobile-archive">
                  <h4>Browse by year</h4>

                  {memoryArchive.map(({ year, months }) => (
                    <div key={year} className="memory-mobile-archive-year">
                      <button
                        type="button"
                        className={`memory-mobile-archive-year-button ${selectedArchiveYear === year &&
                            selectedArchiveMonth === null
                            ? "active"
                            : ""
                          }`}
                        onClick={() => {
                          setTimelineFilter("all");
                          setSelectedArchiveYear(
                            selectedArchiveYear === year ? null : year
                          );
                          setSelectedArchiveMonth(null);
                        }}
                      >
                        <span>
                          {selectedArchiveYear === year ? "▼" : "▶"} {year}
                        </span>
                        <span>
                          {memories.filter((memory) => {
                            const date = new Date(memory.capturedAt);
                            return date.getFullYear() === year;
                          }).length}
                        </span>
                      </button>

                      {selectedArchiveYear === year && (
                        <div className="memory-mobile-archive-months">
                          {months.map((month) => {
                            const monthName = new Date(year, month, 1).toLocaleDateString(
                              undefined,
                              { month: "long" }
                            );

                            const count = memories.filter((memory) => {
                              const date = new Date(memory.capturedAt);
                              return (
                                date.getFullYear() === year &&
                                date.getMonth() === month
                              );
                            }).length;

                            return (
                              <button
                                key={month}
                                type="button"
                                className={`memory-mobile-archive-month-button ${selectedArchiveMonth === month ? "active" : ""
                                  }`}
                                onClick={() => {
                                  setSelectedArchiveMonth(
                                    selectedArchiveMonth === month ? null : month
                                  );
                                }}
                              >
                                <span>{monthName}</span>
                                <span>{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <p>{filteredMemories.length} memories</p>

                <div className="memory-mobile-timeline-list">
                  {filteredMemories.map((memory) => (
                    <button
                      key={memory.id}
                      type="button"
                      className={
                        selectedMemory?.id === memory.id ? "active" : ""
                      }
                      onClick={() => {
                        onSelectMemory(memory);
                        setOpen(false);
                      }}
                    >
                      <strong>{memory.title}</strong>
                      <span>
                        {new Date(memory.capturedAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMemory && (
        <div className="memory-editor-panel">
          <div className="memory-mobile-editor-header">
            <h3>Edit memory</h3>
            <button onClick={onCloseEditor} aria-label="Close editor">
              ✕
            </button>
          </div>

          {editorLoading ? (
            <p>Loading memory…</p>
          ) : (
            <>
              <label>
                Title
                <input
                  value={memoryTitle}
                  onChange={(event) => setMemoryTitle(event.target.value)}
                />
              </label>

              <label>
                Date and time
                <input
                  type="datetime-local"
                  value={capturedAt}
                  onChange={(event) => setCapturedAt(event.target.value)}
                />
              </label>

              <label>
                Location name
                <input
                  value={locationLabel}
                  onChange={(event) => setLocationLabel(event.target.value)}
                  placeholder="Add a place name"
                />
              </label>

              <p>
                Coordinates:{" "}
                {selectedMemory.location.coordinates.latitude.toFixed(5)},{" "}
                {selectedMemory.location.coordinates.longitude.toFixed(5)}
              </p>

              <button
                onClick={handleSave}
                disabled={editorSaving || !memoryTitle.trim() || !capturedAt}
              >
                {editorSaving ? "Saving…" : "Save changes"}
              </button>

              <hr />

              <h4>Photos</h4>

              <div className="memory-mobile-photo-grid">
                {photos.map(({ photo, imageUrl }) => (
                  <div key={photo.id} className="memory-mobile-photo-item">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={photo.caption ?? photo.originalFileName}
                        className="memory-mobile-photo-thumbnail"
                      />
                    ) : (
                      <p>{photo.originalFileName} (image unavailable)</p>
                    )}

                    <label className="memory-editor-label">
                      Photo caption
                      <input
                        type="text"
                        className="memory-editor-input"
                        value={photoCaptions[photo.id] ?? ""}
                        onChange={(event) =>
                          setPhotoCaptions((current) => ({
                            ...current,
                            [photo.id]: event.target.value,
                          }))
                        }
                        disabled={editorSaving}
                        placeholder="Add a caption..."
                      />
                    </label>

                    <div className="memory-mobile-photo-actions">
                      <button
                        type="button"
                        onClick={() =>
                          void onUpdatePhoto(
                            photo.id,
                            photoCaptions[photo.id] ?? ""
                          )
                        }
                        disabled={editorSaving}
                      >
                        Save caption
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Delete this photo?")) {
                            void onDeletePhoto(photo.id);
                          }
                        }}
                        disabled={editorSaving}
                      >
                        Delete photo
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <label>
                Add photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelection}
                  disabled={editorSaving}
                />
              </label>

              <hr />

              <h4>Notes</h4>

              {notes.map((note) => (
                <div key={note.id} className="memory-mobile-note-item">
                  {editingNoteId === note.id ? (
                    <>
                      <textarea
                        className="memory-mobile-note-textarea"
                        value={editingNoteContent}
                        onChange={(event) =>
                          setEditingNoteContent(event.target.value)
                        }
                        rows={4}
                      />
                      <button
                        onClick={() => handleSaveNote(note.id)}
                        disabled={editorSaving}
                      >
                        Save note
                      </button>
                      <button onClick={() => setEditingNoteId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="memory-mobile-note-content">
                        {note.content}
                      </p>
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setEditingNoteContent(note.content);
                        }}
                      >
                        Edit note
                      </button>
                    </>
                  )}
                </div>
              ))}

              <label>
                Add a note
                <textarea
                  className="memory-mobile-note-textarea"
                  value={newNote}
                  onChange={(event) => setNewNote(event.target.value)}
                  placeholder="Write a reflection…"
                  rows={4}
                />
              </label>

              <button
                onClick={handleAddNote}
                disabled={editorSaving || !newNote.trim()}
              >
                Add note
              </button>
            </>
          )}

          {editorError && (
            <p className="memory-editor-error" role="alert">
              {editorError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default MemoryMapMobile;