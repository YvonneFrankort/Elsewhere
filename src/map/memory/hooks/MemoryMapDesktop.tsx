import React, { useEffect, useState } from "react";
import type mapboxgl from "mapbox-gl";
import "../ui/desktop/memory-map-desktop.css"

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

interface MemoryMapDesktopProps extends MemoryEditorProps {
  style: string;
  setStyle: (style: string) => void;
  query: string;
  setQuery: (query: string) => void;
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  handleSearch: () => void;
  onBack: () => void;
  pendingLocation?: {
    longitude: number;
    latitude: number;
  } | null;
  onCancelCreateMemory?: () => void;
}

interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
}

function Segmented({ value, onChange, options }: SegmentedProps) {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button
          key={option.value}
          className={value === option.value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

function MemoryMapDesktop({
  style,
  setStyle,
  query,
  setQuery,
  mapRef,
  handleSearch,
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
  onUpdatePhoto,
  onDeletePhoto,
  onCloseEditor,
  pendingLocation,
  onCancelCreateMemory,
}: MemoryMapDesktopProps) {
  const [newMemoryTitle, setNewMemoryTitle] = useState("");
  const [memoryTitle, setMemoryTitle] = useState("");
  const [capturedAt, setCapturedAt] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [photoCaptions, setPhotoCaptions] = useState<Record<string, string>>({});

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
    <div className="map-ui-section">
      <div className="map-topbar">
        <div className="topbar-left">
          <Segmented
            value="memory"
            onChange={(value) => {
              if (value === "info") onBack();
            }}
            options={[
              { label: "Info Map", value: "info" },
              { label: "Memory Map", value: "memory" },
              { label: "Planner", value: "planner" },
            ]}
          />

          <Segmented
            value={style}
            onChange={setStyle}
            options={[
              {
                label: "Streets",
                value: "mapbox://styles/mapbox/streets-v12",
              },
              {
                label: "Outdoors",
                value: "mapbox://styles/mapbox/outdoors-v12",
              },
              {
                label: "Satellite",
                value: "mapbox://styles/mapbox/satellite-streets-v12",
              },
            ]}
          />
        </div>

        <div className="topbar-center">
          <div className="map-search">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) =>
                event.key === "Enter" && handleSearch()
              }
              placeholder="Search place or coordinates"
            />

            <button onClick={handleSearch}>🔍</button>
          </div>
        </div>

        <div className="topbar-right" />
      </div>

      <div className="desktop-zoom">
        <button onClick={() => mapRef.current?.zoomIn()}>＋</button>
        <button onClick={() => mapRef.current?.zoomOut()}>−</button>
      </div>
      {/*
<aside className="memory-desktop-sidebar">
        <h3>Memories</h3>

        <p>{memories.length} saved memories</p>

        {memories.map((memory) => (
<button
  key={memory.id}
  onClick={() => onSelectMemory(memory)}
  className={`memory-list-button ${
    selectedMemory?.id === memory.id ? "active" : ""
  }`}
>
            {memory.title}
          </button>
        ))}
      </aside>
      */}

      {selectedMemory && (
        <aside className="memory-desktop-editor">

          <div className="memory-editor-header">
            <h3>Edit memory</h3>
            <button onClick={onCloseEditor}>Close</button>
          </div>

          {editorLoading ? (
            <p>Loading memory…</p>
          ) : (
            <>
              <label className="memory-editor-label">
                Title
                <input
                  value={memoryTitle}
                  onChange={(event) => setMemoryTitle(event.target.value)}
                  className="memory-editor-input"
                />
              </label>

              <label className="memory-editor-label">
                Date and time
                <input
                  type="datetime-local"
                  value={capturedAt}
                  onChange={(event) => setCapturedAt(event.target.value)}
                  className="memory-editor-input"
                />
              </label>

              <label className="memory-editor-label">
                Location name
                <input
                  value={locationLabel}
                  onChange={(event) => setLocationLabel(event.target.value)}
                  placeholder="Add a place name"
                  className="memory-editor-input"
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

              <div className="memory-photo-grid">
                {photos.map(({ photo, imageUrl }) => (
                  <div key={photo.id} className="memory-photo-item">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={photo.caption ?? photo.originalFileName}
                        className="memory-photo-thumbnail"
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

                    <div className="memory-photo-actions">
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

              <label className="memory-editor-label memory-editor-label--spaced">
                Add photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelection}
                  disabled={editorSaving}
                  className="memory-editor-input"
                />
              </label>

              <hr />

              <h4>Notes</h4>

              {notes.map((note) => (
                <div key={note.id} className="memory-note-item">
                  {editingNoteId === note.id ? (
                    <>
                      <textarea
                        value={editingNoteContent}
                        onChange={(event) =>
                          setEditingNoteContent(event.target.value)
                        }
                        rows={4}
                        className="memory-note-textarea"
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
                      <p className="memory-note-content">
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

              <label className="memory-editor-label memory-editor-label--spaced">
                Add a note
                <textarea
                  value={newNote}
                  onChange={(event) => setNewNote(event.target.value)}
                  placeholder="Write a reflection…"
                  rows={4}
                  className="memory-note-textarea"
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
        </aside>
      )}
    </div>
  );
}

export default React.memo(MemoryMapDesktop);