export async function loadBoydCountyEvents() {
  const html = await fetch("https://www.boydcountyky.gov/289/Upcoming-Events").then(r => r.text());
  const doc = new DOMParser().parseFromString(html, "text/html");

  const items = [...doc.querySelectorAll(".event-item")];

  return items.map(item => {
    const title = item.querySelector(".event-title")?.textContent?.trim() ?? "";
    const date = item.querySelector(".event-date")?.textContent?.trim() ?? "";
    const time = item.querySelector(".event-time")?.textContent?.trim() ?? "";
    const location = item.querySelector(".event-location")?.textContent?.trim() ?? "";
    const description = item.querySelector(".event-description")?.textContent?.trim() ?? "";
    const url = item.querySelector("a")?.href ?? "";

    return {
      title,
      date,
      time,
      location,
      description,
      url,
      source: "BoydCounty",
      lat: 38.4800,
      lon: -82.6500
    };
  }).filter(e => e.title);
}
