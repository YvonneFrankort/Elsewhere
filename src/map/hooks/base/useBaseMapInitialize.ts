import { useGlobalMapInitialize } from "./useGlobalMapInitialize";
import { StyleManager } from "../../core/style/StyleManager";

export function useBaseMapInitialize(
  mapContainer: React.RefObject<HTMLDivElement | null>,
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  styleManagerRef: React.MutableRefObject<StyleManager | null>,
  style: string
) {
  useGlobalMapInitialize(mapContainer, mapRef, styleManagerRef, style);
}

