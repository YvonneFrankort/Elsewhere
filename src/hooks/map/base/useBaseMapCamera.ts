import { useCallback } from "react";

export function useBaseMapCamera(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) {
  const flyTo = useCallback(
    (
      center: [number, number],
      zoom: number = 9.8,
      pitch: number = 58,
      bearing: number = 12
    ) => {
      const map = mapRef.current;
      if (!map) return;

      map.flyTo({
        center,
        zoom,
        pitch,
        bearing,
        duration: 800,
      });
    },
    [mapRef]
  );

  const easeTo = useCallback(
    (
      center: [number, number],
      zoom: number = 9.8,
      pitch: number = 58,
      bearing: number = 12,
      duration: number = 800
    ) => {
      const map = mapRef.current;
      if (!map) return;

      map.easeTo({
        center,
        zoom,
        pitch,
        bearing,
        duration,
      });
    },
    [mapRef]
  );

  return { flyTo, easeTo };
}
