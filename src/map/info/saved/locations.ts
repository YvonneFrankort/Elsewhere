// saved/locations.ts

let savedLocations: any[] = [];

export function saveLocation(place: any) {
  savedLocations.push(place);
}

export function getSavedLocations() {
  return savedLocations;
}

export function removeSavedLocation(id: string) {
  savedLocations = savedLocations.filter(p => p.id !== id);
}
