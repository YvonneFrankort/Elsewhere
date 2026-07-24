export async function loadMurrayEvents_TourMurray() {
  const html = await fetch("https://www.tourmurray.com/events").then(r => r.text());
  const doc = new DOMParser().parseFromString(html, "text/html");

  const items = [...doc.querySelectorAll(".event-card")];

  return items.map(item => {
    const title = item.querySelector(".event-title")?.textContent?.trim() ?? "";
    const date = item.querySelector(".event-date")?.textContent?.trim() ?? "";
    const time = item.querySelector(".event-time")?.textContent?.trim() ?? "";
    const location = item.querySelector(".event-location")?.textContent?.trim() ?? "";
    const description = item.querySelector("p")?.textContent?.trim() ?? "";
    const url = item.querySelector("a")?.href ?? "";

    // Murray city center
    const lat = 36.6230;
    const lon = -88.3148;

    return {
      title,
      date,
      time,
      location,
      description,
      url,
      source: "Murray (TourMurray)",
      lat,
      lon
    };
  }).filter(e => e.title);
}
