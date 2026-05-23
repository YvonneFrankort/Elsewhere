import mapboxgl from "mapbox-gl";
import { sourcesRegistry } from "../sources";
import { layersRegistry } from "../layers";
import { categories } from "../../info/config/categories";

type RebuildFn = (map: mapboxgl.Map) => void;

export class StyleManager {
  private map: mapboxgl.Map;
  private currentStyle: string;
  private isSwitching = false;
  private rebuildFns: RebuildFn[] = [];

  constructor(map: mapboxgl.Map, initialStyle: string) {
    this.map = map;
    this.currentStyle = initialStyle;

    // ⭐ Register terrain/sky/3D FIRST
    this.registerTerrain();
    this.registerSky();
    this.register3DBuildings();
    this.registerFog();


    // ⭐ Register your source rebuilders
    this.registerRebuild((map) => {
      for (const src of sourcesRegistry) {
        src.add(map);
      }
    });

    // ⭐ Register your layer rebuilders
    this.registerRebuild((map) => {
      for (const layer of layersRegistry) {
        layer.add(map);
      }
    });

    // ⭐ Debug: confirm rebuilders exist
    console.log("Rebuilders count:", this.rebuildFns.length);

    // ⭐ Attach style.load AFTER all rebuilders exist
    this.map.on("style.load", () => {
      if (!this.isSwitching) return;

      this.map.setPitch(58);
      this.map.setBearing(12)
      this.map.setZoom(9.8);

      this.isSwitching = false;

      for (const fn of this.rebuildFns) {
        fn(this.map);
      }
    });

    // ⭐ Run rebuilders once on initial load
    for (const fn of this.rebuildFns) {
      fn(this.map);
    }
  }

  registerRebuild(fn: RebuildFn) {
    this.rebuildFns.push(fn);
  }

  setStyle(style: string) {
    if (style === this.currentStyle) return;

    this.isSwitching = true;
    this.currentStyle = style;

    this.map.setStyle(style, { diff: false } as any);
  }

  // --- Terrain ---
  private registerTerrain() {
    this.registerRebuild((map) => {
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        } as any);
      }

      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
    });
  }

  // --- Sky ---
  private registerSky() {
    this.registerRebuild((map) => {
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
    });
  }

  // --- 3D Buildings ---
  private register3DBuildings() {
    this.registerRebuild((map) => {
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
    });
  }

  // --- Fog (enables horizon + sky visibility) ---
  private registerFog() {
    this.registerRebuild((map) => {
      map.setFog({
        range: [0.5, 10],
        color: "rgba(200, 200, 200, 0.5)",
        "horizon-blend": 0.2,
        "high-color": "rgba(255, 255, 255, 0.1)",
        "space-color": "rgba(0, 0, 0, 1)",
      });
    });
  }
  
setCategoryVisibility(id: string, visible: boolean) {
  const category = categories.find(c => c.id === id);
  if (!category) return;

  category.layers.forEach(layerId => {
    if (this.map.getLayer(layerId)) {
      this.map.setLayoutProperty(
        layerId,
        "visibility",
        visible ? "visible" : "none"
      );
    }
  });
}
}
