import { useState } from "react";

export function useMapStyle() {
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/streets-v12"
  );

  return { mapStyle, setMapStyle };
}
