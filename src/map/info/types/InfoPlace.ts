export interface InfoPlace {
  id: string;
  name: string;
  category: string; // park, trail, museum, attraction, event, city

  latitude: number;
  longitude: number;

  // General
  description?: string;
  address?: string;
  image?: string;
  url?: string;
  tags?: string[];
  rating?: number;
  popularity?: number;
  access?: string; // public, private, seasonal, permit, etc.

  // Hiking / Trails
  difficulty?: string; // easy, moderate, hard (from OSM sac_scale)
  lengthKm?: number;   // computed from geometry or API
  surface?: string;    // gravel, dirt, paved
  elevationGain?: number; // total uphill meters
  trailType?: string;  // hiking, walking, cycling
  entrance?: string;   // entrance fee or description
  trailhead?: {
    latitude: number;
    longitude: number;
    description?: string;
  };
  warnings?: string[]; // closures, wildlife, weather, NPS alerts

  // Events
  startDate?: string;  // ISO date
  endDate?: string;    // ISO date
  price?: string;      // free, $20, donation, etc.
  targetGroup?: string; // family, adults, kids, seniors
  eventType?: string;   // concert, workshop, festival
  organizer?: string;
  registrationRequired?: boolean;
  accessibility?: string[]; // wheelchair, stroller, etc.

  // Museums
  openingHours?: string[];
  exhibitions?: string[]; // special or temporary exhibitions

  // Weather
  weather?: {
    temperature?: number;
    condition?: string;
    icon?: string;
    alerts?: string[];
  };
  sunrise?: string;
  sunset?: string;

  // Metadata
  source: string; // "OpenTripMap", "OSM", "NPS", "Nominatim", "OpenMeteo"
  distance?: number; // computed from user or search center
}
