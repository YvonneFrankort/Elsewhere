import type { Feature } from "geojson";
import { usePlacesStore } from "../../state/usePlacesStore";

export function InfoList() {
  const places = usePlacesStore((s) => s.places);
  const selectPlace = usePlacesStore((s) => s.selectPlace);

  return (
    <div className="info-list">
      {places.map((place: Feature) => (
        <div
          key={place.properties?.id ?? place.id}
          className="info-list-item"
          onClick={() => selectPlace(place)}
        >
          {place.properties?.name}
        </div>
      ))}
    </div>
  );
}
