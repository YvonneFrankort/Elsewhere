export async function loadExploreKentuckyLake() {
  const html = await fetch("https://www.explorekentuckylake.com/events/").then(r => r.text());
  const doc = new DOMParser().parseFromString(html, "text/html");

  const items = [...doc.querySelectorAll(".event-item")];

  return items.map(item => {
    const title = item.querySelector(".event-title")?.textContent?.trim() ?? "";
    const date = item.querySelector(".event-date")?.textContent?.trim() ?? "";
    const location = item.querySelector(".event-location")?.textContent?.trim() ?? "";
    const description = item.querySelector(".event-summary")?.textContent?.trim() ?? "";
    const url = item.querySelector("a")?.href ?? "";

    return {
      title,
      date,
      time: "",
      location,
      description,
      url,
      source: "ExploreKentuckyLake",
      lat: 36.8000,
      lon: -88.1000
    };
  }).filter(e => e.title);
}
