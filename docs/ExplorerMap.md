# Explorer Map --- Technical Documentation
Last updated: 18 November 2026

## Status

Explorer Map V1 is considered feature complete.

The map is operational on mobile and desktop and supports:
- Curated places
- NPS parks
- Visitor centers
- Alerts
- Events
- Tours
- Geoapify places
- Shared popup system

Future development should focus on Memory Map rather than adding major Explorer features.

---

## Purpose

The Explorer Map is a map-based nature and place-discovery feature in a
React/TypeScript application. It is designed to help someone explore an
area, discover relevant places before and during a travel.

The main use is nature exploration in Tennessee, Kentucky, Virginia, South Carolina, and nearby West Virginia. The currently
supported state set also includes Georgia and North Carolina.

The focus of the map is on:
- discovering nearby points of interest
- different categories help the user explore his surroundings
- mobile-first, where desktop version has teh same features

Categories insclude: 
- Nature & Outdoors with subcategories Water, Landforms, Trails, Scenic an dProtected Areas
- Historic & Cultural with subcategories Battlefields, Historic Sites and Monuments
- Food & Drinks with subcategories Restaurants, Cafes & Sweets, Fast & Casual and Drinks
- Attractions & Entertainment with subcategories Urban Scenic, Wildlife & Marine, Theme Parks and Entertainment
- Travel & Transport with subcategory Parking

---

## Main capabilities

- Mapbox map initialization.
- User-location startup when browser geolocation is allowed.
- A fallback starting location around Crossville, Tennessee, when location is unavailable or denied.
- Category toggles, including multiple active categories.
- Curated map features.
- NPS park-related information, including alerts and tours.
- Supplementary Geoapify results for Food & Drinks and Attractions & Entertainment .
- NPS trail line features loaded for the current visible map bounds.
- Point markers and map line/polygon rendering through the shared info-places GeoJSON source.
- Feature selection and a details popup on mobile and desktop.
- The popup follows its selected point marker while the map moves or resizes.
- Map pan and zoom remain usable after data has loaded.

---

## Data Sources

The application uses 3 data sources for the explorer map feature.

### Curated Data
Custom hand-curated locations in geojson format include:
- Waterfalls
- Caves
- Arches
- Cliffs
- Gorges
- Natural Bridges
- Peaks
- Ridges
- Rockhouses
- Overlooks
- Trailheads
- Historic Sites
- Scenic Locations
- Battlefields
- Historic Sites
- Monuments
- Scenic Roads
- Scenic Overlooks
- Viewpoints
- National Parks
- Nature Preserves
- Nature Reserves
- State Parks
- Parking Garages
- Trail Parking

They provide coverage where public APIs are weak or missing. Some data includes link an dopen source images. The curated loader also includes a border-coverage GeoJSON file.

### NPS
Provides:
- National Parks
- Visitor Centers
- Alerts
- Events
- Tours
- Activities
- Opening Hours
- Fees
- Directions
- Images
- Links

This became the richest source of information.

### Geoapify
Provides:
- Restaurants
- Attractions
- Supporting trip information

--- 

## Architecture

The map is organized around a shared shell and shared map/data state, with separate desktop and mobile presentation components.

**InfoMapShell**
The shell coordinates the map experience. Responsibilities include:
- Holding the Mapbox map reference (mapRef).
- Tracking map readiness and location readiness.
- Starting the category data-loading flow after the map and initial location are ready.
- Reading the places collection from the places store.
- Reading and updating the selected item through the map UI state.
- Calling shared marker/layer hooks.
- Choosing the desktop or mobile UI based on isMobile.
- Passing the selected place and selection callback to the relevant UI.
- Rendering the desktop details popup.  

The **selected place** is derived from the places collection and the
selected item ID. The popup component receives the selected feature and a screen position.  

**Map initialization hooks**
The initialization flow uses:
- useGlobalMapInitialize
- useBaseMapInitialize
useBaseMapInitialize forwards the optional onMapReady callback to useGlobalMapInitialize.  

The global initializer creates the Mapbox map once, stores it in
mapRef, adds the scale control, initializes the style manager, and creates the shared GeoJSON source and geometry layers after the map
style loads.  

The initializer uses a didInit ref to prevent duplicate
initialization. The initial style is held in a ref so changes to the
style prop do not recreate the map.

**Data and state**  
The map uses shared state for:
- The loaded places collection.
- Active categories.
- The selected item ID.

---

## Map initialization and location

The map initially uses a Crossville, Tennessee area as its fallback
center. 
When geolocation is available and permission is granted, the map moves to the user's location. The tested location view uses a closer zoom and
a lower pitch. If geolocation is denied, unavailable, or times out, the
map remains at the fallback location.

Category loading waits until both the map and the initial location decision are ready. This avoids starting the data-loading process against an uninitialized map.

---

## Marker and Popups

Each category has an unique marker and color (Nature green, water blue, parking purple, historic brown, food yellow). When a category is selected, marker matching that category apppear on the map. Categories can be toggled and untoggled, multiple categories can be active at the same time. 
A click on a marker opens a popup window with information about the place. 
Depending on data availability, the shared popup may contain:

- Image
- Description
- Category
- Address
- Directions
- Activities
- Contact information
- Opening hours
- Fees
- Website links
- Alerts
- Events
- Tours

The marker and popup component is shared between mobile and desktop.

---

## Desktop and Mobile

Explorer Map is mobile-first.
The primary use case is exploration during travel.

Desktop support exists for browsing and planning but was considered secondary during development.

Memory Map is expected to become more desktop-centric.

**Mobile**
- Primary target platform.
- Used during travel.

Supports:
- Marker selection
- Rich popups
- Dynamic popup positioning

**Desktop**
Secondary target platform.

Used for:
- Trip planning
- Browsing

Desktop popup support added after mobile functionality was completed.

---

## Relationship to Memory Map

Explorer Map serves as the place-discovery layer for the Travel Companion project.

The location, category, and information architecture established here is intended to be reused by Memory Map and Planner Map in later phases of development.

PlaceDetailsPopup is expected to become a shared place-information component across multiple map experiences.

---

## User Features

Explorer Map supports:
- Multiple category selection.
- Searching for locations and coordinates.
- Switching between Streets, Outdoors, and Satellite map styles.
- Map zoom controls.
- Automatic user-location detection when allowed.
- Mobile and desktop map interaction.
- Rich popup information for supported locations.
- NPS alerts, events, tours, activities, fees, directions, and visitor information.
- Geoapify restaurants and attractions.
- Curated natural, historic, and travel-related locations.

## Current limitations and Known Issues

Known limitations:
- The map is focused on a regional area rather than comprehensive nationwide coverage.
- Geoapify is supplementary and is not considered a reliable source for detailed nature trail linework.
- NPS trail feature was not promoted to a core Explorer feature because large trail networks were visually overwhelming. Trailheads remain available because they provide actionable information. Trail linework remains in the project and may be revisited later.
- Marker and popup image loading may take longer than the initial map
  display.
- The popup may vary in size; this is currently accepted.
- Marker and popup state may be lost after changing the map style (Streets / Outdoors / Satellite)
- Marker layers are not consistently restored after a style reload.
- Trail linework is available but is not considered a primary Explorer feature.
- Some categories currently contain few or no results in the supported region.
- Wikimedia image support varies depending on image source availability.

---

## Important files and responsibilities

**InfoMapShell.tsx** coordinates map readiness,
location, data loading, shared state, desktop/mobile rendering, and desktop popup  

**useGlobalMapInitialize.ts** creates the Mapbox map, style manager, shared GeoJSON source, and
geometry layers  

**useBaseMapInitialize.ts** forwards initialization
options/callbacks to the global initializer

**useInfoMapData.ts** chooses and runs data loaders based on active categories

**usePlacesLayer.ts** applies marker styling and updates the shared info-places source

**useInitPlacesLayer.ts** registers icons and installs marker/trail interaction handlers

**nps/trails.ts** queries NPS public trail linework
for the current map bounds

**visitorCenters.ts** loads NPS visitor-center features separately from the parks loader

**MapDesktopControls.tsx** desktop map controls and category interface

**MapMobileMenu.tsx** Mobile map controls and mobile popup positioning/rendering

**PlaceDetailsPopup.tsx** shared place details popup UI

**getMarkerStyle.ts** determines icon and size based on feature properties

**applyMarkerStyle.ts** applies marker style properties to features

**registerIcons.ts** registers marker icons with the map
**shared/markers/index.ts** re-exports shared marker utilities
