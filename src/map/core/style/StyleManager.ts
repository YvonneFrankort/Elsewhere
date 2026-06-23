import mapboxgl from "mapbox-gl";
import { sourcesRegistry } from "../registry/sources";
import { layersRegistry } from "../registry/layers";

type RebuildFn = (map: mapboxgl.Map) => void;

export class StyleManager {
  private map: mapboxgl.Map;
  private currentStyle: string;
  private isSwitching = false;
  private rebuildFns: RebuildFn[] = [];

  constructor(map: mapboxgl.Map, initialStyle: string) {
    this.map = map;
    this.currentStyle = initialStyle;

    // Core visual features only
    this.registerTerrain();
    this.registerSky();
    this.register3DBuildings();
    this.registerFog();

    // Rebuild global layers
    this.registerRebuild((map) => {
      for (const layer of layersRegistry) {
        try {
          layer.add(map);
        } catch (err) {
          console.error("Layer rebuild failed:", err);
        }
      }
    });

    console.log("Rebuilders count:", this.rebuildFns.length);

    this.map.on("style.load", () => {
      if (!this.isSwitching) return;

      this.map.setPitch(58);
      this.map.setBearing(12);
      this.map.setZoom(9.8);

      this.isSwitching = false;

      for (const fn of this.rebuildFns) {
        try {
          fn(this.map);
        } catch (err) {
          console.error("Rebuilder failed during style.load:", err);
        }
      }
    });

    // Initial rebuild
    for (const fn of this.rebuildFns) {
      try {
        fn(this.map);
      } catch (err) {
        console.error("Initial rebuild failed:", err);
      }
    }
  }

  registerRebuild(fn: RebuildFn) {
    this.rebuildFns.push(fn);
  }

  setStyle(style: string) {
    if (style === this.currentStyle) {
      this.isSwitching = false;
      return;
    }

    this.isSwitching = true;
    this.currentStyle = style;

    this.map.setStyle(style, { diff: false } as any);
  }

  // --- Terrain ---
  private registerTerrain() {
    this.registerRebuild((map) => {
      try {
        if (!map.getSource("mapbox-dem")) {
          map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14,
          } as any);
        }

        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
      } catch (err) {
        console.error("Terrain rebuild failed:", err);
      }
    });
  }

  // --- Sky ---
  private registerSky() {
    this.registerRebuild((map) => {
      try {
        if (!map.getLayer("sky")) {
          map.addLayer({
            id: "sky",
            type: "sky",
            paint: {
              "sky-type": "atmosphere",
              "sky-atmosphere-sun": [0.0, 0.0],
              "sky-atmosphere-sun-intensity": 15,
            },
          } as any);
        }
      } catch (err) {
        console.error("Sky rebuild failed:", err);
      }
    });
  }

  // --- 3D Buildings ---
  private register3DBuildings() {
    this.registerRebuild((map) => {
      try {
        if (!map.getLayer("3d-buildings")) {
          map.addLayer({
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.6,
            },
          } as any);
        }
      } catch (err) {
        console.error("3D buildings rebuild failed:", err);
      }
    });
  }

  // --- Fog ---
  private registerFog() {
    this.registerRebuild((map) => {
      try {
        map.setFog({
          range: [0.5, 10],
          color: "rgba(200, 200, 200, 0.5)",
          "horizon-blend": 0.2,
          "high-color": "rgba(255, 255, 255, 0.1)",
          "space-color": "rgba(0, 0, 0, 1)",
        });
      } catch (err) {
        console.error("Fog rebuild failed:", err);
      }
    });
  }
}
