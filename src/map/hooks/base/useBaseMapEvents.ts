import { useEffect } from "react";

export function useBaseMapEvents(mapRef: React.MutableRefObject<any>) {
  // Placeholder: shared event listeners (click, move, load)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // map.on("click", () => {});
    // map.on("move", () => {});

    return () => {
      // map.off("click");
      // map.off("move");
    };
  }, []);
}
