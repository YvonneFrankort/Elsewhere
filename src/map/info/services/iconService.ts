import type mapboxgl from "mapbox-gl";

export async function loadIcon(
  map: mapboxgl.Map,
  name: string
) {
  const url = `/icons/info/${name}.png`;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    if (!map.hasImage(name)) {
      map.addImage(name, bitmap, { pixelRatio: 1 });
    }
  } catch (err) {
    console.error("Failed to load icon:", name, err);
  }
}
