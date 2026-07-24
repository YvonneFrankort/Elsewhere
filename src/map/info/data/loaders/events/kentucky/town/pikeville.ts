export async function loadPikevilleEvents() {
  const html = await fetch("https://visitpikeville.com/events/list/").then(r => r.text());
  const doc = new DOMParser().parseFromString(html, "text/html");

  const items = [...doc.querySelectorAll(".tribe-events-calendar-list__event")];

  return items.map(item => {
    const title = item.querySelector(".tribe-events-calendar-list__event-title")?.textContent?.trim() ?? "";
    const date = item.querySelector(".tribe-events-calendar-list__event-date")?.textContent?.trim() ?? "";
    const time = item.querySelector(".tribe-events-calendar-list__event-time")?.textContent?.trim() ?? "";
    const location = item.querySelector(".tribe-events-calendar-list__event-venue")?.textContent?.trim() ?? "";
    const url = item.querySelector("a")?.href ?? "";

    // Pikeville city center
    const lat = 37.4793;
    const lon = -82.5188;

    return {
      title,
      date,
      time,
      location,
      url,
      source: "Pikeville",
      lat,
      lon
    };
  });
}
