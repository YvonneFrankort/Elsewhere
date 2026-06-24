import mapboxgl from "mapbox-gl";

export class CameraManager {
  private map: mapboxgl.Map | null = null;

  constructor(map?: mapboxgl.Map) {
    if (map) this.map = map;
  }

  attachMap(map: mapboxgl.Map) {
    this.map = map;
  }

  flyTo(center: [number, number], zoom = 14, duration = 800) {
    if (!this.map) return;
    this.map.flyTo({ center, zoom, duration });
  }

  jumpTo(center: [number, number], zoom = 14, pitch = 0) {
    if (!this.map) return;
    this.map.jumpTo({ center, zoom, pitch });
  }

  easeTo(center: [number, number], zoom = 14, pitch = 0, duration = 800) {
    if (!this.map) return;
    this.map.easeTo({ center, zoom, pitch, duration });
  }
}
