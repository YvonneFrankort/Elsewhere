export async function loadBluegrassCountryFestivals() {
  const html = await fetch("https://bluegrasscountry.org/festivals/").then(r => r.text());
  const doc = new DOMParser().parseFromString(html, "text/html");

  const items = [...doc.querySelectorAll(".festival-item")];

  return items.map(item => {
    const title = item.querySelector(".festival-title")?.textContent?.trim() ?? "";
    const date = item.querySelector(".festival-date")?.textContent?.trim() ?? "";
    const location = item.querySelector(".festival-location")?.textContent?.trim() ?? "";
    const description = item.querySelector(".festival-description")?.textContent?.trim() ?? "";
    const url = item.querySelector("a")?.href ?? "";

    // Filter out click-through-only items
    if (!date || !location) return null;

    return {
      title,
      date,
      time: "",
      location,
      description,
      url,
      source: "BluegrassCountryFestivals",
      lat: 38.2000,
      lon: -84.9000
    };
  }).filter(Boolean);
}
