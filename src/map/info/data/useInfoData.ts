import { useEffect, useState } from "react";
import type { InfoPlace } from "../types/InfoPlace";

// Loaders (empty for now)
import * as OpenTripMapLoader from "./loaders/geoapify";
import * as OSMLoader from "./loaders/osm";
import * as NPSLoader from "./loaders/nps";
import * as EventbriteLoader from "./loaders/eventbrite";
import * as NominatimLoader from "./loaders/nominatim";
import * as OpenMeteoLoader from "./loaders/openmeteo";

export interface LoaderParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export interface UseInfoDataParams {
  center: [number, number]; // [lng, lat]
  radiusKm: number;
}

export function useInfoData({ center, radiusKm }: UseInfoDataParams) {
  const [data, setData] = useState<InfoPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const params = {
        latitude: center[1],
        longitude: center[0],
        radiusKm,
      };

      // Loaders will return InfoPlace[] later
      const results = await Promise.all([
        OpenTripMapLoader.load(params),
        OSMLoader.load(params),
        NPSLoader.load(params),
        EventbriteLoader.load(params),
        NominatimLoader.load(params),
        OpenMeteoLoader.load(params),
      ]);

      const merged = results.flat();
      setData(merged);
      setLoading(false);
    }

    load();
  }, [center, radiusKm]);

  return { data, loading };
}
