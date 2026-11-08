
import type { LoaderParams } from "../types";
import { getStateFromLatLon } from "../location/getStateFromLatLon";

// --- Alert Data ---------------------------------------------------------------

export interface NPSAlert {
  id: string;
  title: string;
  parkCode: string;
  description?: string;
  url?: string;
  type?: string;
}

// --- Normalization ------------------------------------------------------------

function normalizeAlert(a: any): NPSAlert {
  return {
    id: a.id,
    title: a.title,
    parkCode: a.parkCode,
    description: a.description,
    url: a.url,
    type: a.type
  };
}

// --- Loader ------------------------------------------------------------------

export async function loadAlerts(
  params: LoaderParams
): Promise<NPSAlert[]> {
  const key = import.meta.env.VITE_NPS_KEY;

  if (!key) {
    console.warn("NPS alerts: missing VITE_NPS_KEY");
    return [];
  }

  const state =
    params.state ||
    getStateFromLatLon(params.latitude, params.longitude);

  if (!state) return [];

  const states = state
    .split(",")
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);

  const stateResults = await Promise.all(
    states.map(async stateCode => {
      try {
        const url = new URL("https://developer.nps.gov/api/v1/alerts");

        url.searchParams.set("stateCode", stateCode);
        url.searchParams.set("limit", "500");

        const res = await fetch(url.toString(), {
          headers: {
            "X-Api-Key": key
          }
        });

        if (!res.ok) {
          console.warn(
            `NPS alerts failed for ${stateCode}: ${res.status}`
          );
          return [];
        }

        const json = await res.json();

        if (!Array.isArray(json.data)) {
          console.warn(
            `NPS alerts: unexpected response for ${stateCode}`,
            json
          );
          return [];
        }

        console.log(
          `🚨 NPS alerts ${stateCode}:`,
          json.data.length,
          "returned"
        );

        return json.data
          .filter((a: any) => a.parkCode)
          .map(normalizeAlert);

      } catch (err) {
        console.warn(
          `NPS alerts request failed for ${stateCode}:`,
          err
        );
        return [];
      }
    })
  );

  const uniqueAlerts = Array.from(
    new Map(
      stateResults
        .flat()
        .map(alert => [alert.id, alert])
    ).values()
  );

  console.log("🚨 NPS unique alerts:", uniqueAlerts.length);

  return uniqueAlerts;
}
