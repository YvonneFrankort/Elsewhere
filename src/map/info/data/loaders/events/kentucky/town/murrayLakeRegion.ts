export async function loadMurrayEvents_ExploreKentuckyLake() {
  const html = await fetch("https://www.explorekentuckylake.com/murray/events/").then(r => r.text());
  const doc = new DOMParser().parseFromString(html, "text/html");

  const items = [...doc.querySelectorAll(".event-item")];

  return items.map(item => {
    const title = item.querySelector(".event-title")?.textContent?.trim() ?? "";
    const date = item.querySelector(".event-date")?.textContent?.trim() ?? "";
    const location = item.querySelector(".event-location")?.textContent?.trim() ?? "";
    const summary = item.querySelector(".event-summary")?.textContent?.trim() ?? "";
    const url = item.querySelector("a")?.href ?? "";

    // Murray city center
    const lat = 36.6230;
    const lon = -88.3148;

    return {
      title,
      date,
      time: "", // page does not provide time
      location,
      description: summary,
      url,
      source: "Murray (ExploreKentuckyLake)",
      lat,
      lon
    };
  }).filter(e => e.title);
}
