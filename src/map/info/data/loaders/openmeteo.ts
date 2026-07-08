

// This loader will later fetch:
// - current weather
// - hourly forecast
// - daily forecast
// - weather codes
// - alerts
// - sunrise/sunset
// from the Open-Meteo API

import type { Feature, Point } from "geojson";
import type { LoaderParams } from "./types";

export async function load(params: LoaderParams): Promise<Feature<Point>[]> {
  const { latitude, longitude, startDate, endDate } = params;

  const base = startDate && endDate
    ? "https://archive-api.open-meteo.com/v1/archive"
    : "https://api.open-meteo.com/v1/forecast";

  const url = `${base}?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation&daily=weathercode,sunrise,sunset&timezone=auto`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const feature: Feature<Point> = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      properties: {
        id: `weather-${latitude}-${longitude}`,
        name: "Weather",
        categories: ["weather"],
        weather: {
          current: data.current_weather,
          hourly: data.hourly,
          daily: data.daily
        }
      }
    };

    return [feature];
  } catch (err) {
    console.error("Weather loader error:", err);
    return [];
  }
}
