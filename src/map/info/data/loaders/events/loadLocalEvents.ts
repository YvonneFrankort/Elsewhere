
import { loadBluegrassCountryFestivals } from "./kentucky/area/bluegrassCountyFestivals"
import { loadBoydCountyEvents } from "./kentucky/area/boydCountyKy"
import { loadExploreKentuckyLake } from "./kentucky/area/exploreKentuckyLake"
import { loadLakeCumberlandVacation } from "./kentucky/area/lakeCumberlandVacation"

import { loadPikevilleEvents } from "./kentucky/town/pikeville";
import { loadHazardEvents } from "./kentucky/town/hazard";
import { loadPaintsvilleEvents } from "./kentucky/town/paintsville";
import { loadMurrayEvents_TourMurray } from "./kentucky/town/murray";
import { loadMurrayEvents_ExploreKentuckyLake } from "./kentucky/town/murrayLakeRegion";


export async function loadLocalEvents() {
  console.log("🎪 Loading local events...");
  
  const results = await Promise.allSettled([
    loadBluegrassCountryFestivals(),
    loadBoydCountyEvents(),
    loadExploreKentuckyLake(),
    loadLakeCumberlandVacation(),

    loadPikevilleEvents(),
    loadHazardEvents(),
    loadPaintsvilleEvents(),
    loadMurrayEvents_TourMurray(),
    loadMurrayEvents_ExploreKentuckyLake(),
  ]);

 const events = results
    .filter(
      (r): r is PromiseFulfilledResult<any[]> =>
        r.status === "fulfilled"
    )
    .flatMap(r => r.value);

  console.log("🎪 Total Events:", events.length);
  console.log("🎪 Sample:", events.slice(0, 5));

  return events;
}