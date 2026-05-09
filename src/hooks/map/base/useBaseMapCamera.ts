import { useCallback } from "react";

export function useBaseMapCamera(
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) {
  const flyTo = useCallback(
    (
      center: [number, number],
      zoom: number = 12,
      pitch: number = 0,
      bearing: number = 0
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
      zoom: number = 12,
      pitch: number = 0,
      bearing: number = 0,
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
