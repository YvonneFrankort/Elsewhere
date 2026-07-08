import type { Feature } from "geojson";
import { usePlacesStore } from "../../state/usePlacesStore";
import { useInfoMapUI } from "../../state/useInfoMapUI";

export function InfoList() {
  const places = usePlacesStore((s) => s.places);

  const selectedItemId = useInfoMapUI((s) => s.selectedItemId);
  const setSelectedItem = useInfoMapUI((s) => s.setSelectedItem);

  function selectPlace(feature: Feature | null) {
    const id = feature?.properties?.id ?? null;
    setSelectedItem(id);
  }

  return (
    <div className="info-list">
      {places.map((place: Feature) => (
        <div
          key={place.properties?.id}
          className={`info-list-item ${
            place.properties?.id === selectedItemId ? "selected" : ""
          }`}
          onClick={() => selectPlace(place)}
        >
          {place.properties?.name}
        </div>
      ))}
    </div>
  );
}
