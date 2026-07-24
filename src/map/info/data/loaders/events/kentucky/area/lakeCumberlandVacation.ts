export async function loadLakeCumberlandVacation() {
  const html = await fetch("https://lakecumberlandvacation.com/calendar/").then(r => r.text());
  const doc = new DOMParser().parseFromString(html, "text/html");

  const items = [...doc.querySelectorAll(".event")];

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
      source: "LakeCumberlandVacation",
      lat: 36.9900,
      lon: -84.4800
    };
  }).filter(e => e.title);
}
