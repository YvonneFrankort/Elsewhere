import mapboxgl from "mapbox-gl";
import { CameraManager } from "./CameraManager";

export class MapManager {
    private map: mapboxgl.Map | null = null;
    private camera: CameraManager | null = null;
    private isReady = false;
    private readyCallbacks: Array<() => void> = [];


    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    initMap(options: {
        style: string;
        center: [number, number];
        zoom: number;
        pitch?: number;
        bearing?: number;
    }) {
        if (this.map) return this.map;

        this.map = new mapboxgl.Map({
            container: this.container,
            style: options.style,
            center: options.center,
            zoom: options.zoom,
            pitch: options.pitch ?? 0,
            bearing: options.bearing ?? 0,
        });

        this.map.addControl(
            new mapboxgl.ScaleControl({
                maxWidth: 120,
                unit: "metric",
            }),
            "bottom-left"
        );

        // ⭐ Map fully loaded
        this.map.once("load", () => {
            this.camera = new CameraManager(this.map!);

            this.isReady = true;
            this.readyCallbacks.forEach(cb => cb());
            this.readyCallbacks = [];
        });

        this.map.on("resize", () => this.map?.resize());

        this.map.on("error", (e) => {
            console.error("Mapbox error:", e.error);
        });

        return this.map;
    }

    onReady(callback: () => void) {
        if (this.isReady) {
            callback();
        } else {
            this.readyCallbacks.push(callback);
        }
    }

    getMap() {
        return this.map;
    }

    getCamera() {
        return this.camera;
    }

    setStyle(style: string) {
        if (!this.map) return;

        this.isReady = false;

        this.map.setStyle(style);

        this.map.once("style.load", () => {
            this.camera = new CameraManager(this.map!);
            this.isReady = true;
            this.readyCallbacks.forEach(cb => cb());
            this.readyCallbacks = [];
        });
    }

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.camera = null;
            this.isReady = false;
            this.readyCallbacks = [];
        }
    }
}
