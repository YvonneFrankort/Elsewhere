export interface LoaderParams {
  latitude: number;
  longitude: number;
  radiusKm: number;

  // NPS
  state?: string;

  // Eventbrite
  query?: string;

  // OpenMeteo
  includeWeather?: boolean;
  startDate?: string;
  endDate?: string;
}
