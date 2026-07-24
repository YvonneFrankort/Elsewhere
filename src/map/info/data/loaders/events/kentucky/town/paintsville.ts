export async function loadPaintsvilleEvents() {
  const html = await fetch("https://paintsvilletourism.com/community-events/").then(r => r.text());
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Each event is inside a wp-block-column
  const items = [...doc.querySelectorAll(".wp-block-column")];

  return items.map(item => {
    const title = item.querySelector("h2, h3, .wp-block-heading")?.textContent?.trim() ?? "";
    const paragraphs = [...item.querySelectorAll("p")].map(p => p.textContent.trim());

    // Extract date/time/location heuristically
    const date = paragraphs.find(p => /\d{4}/.test(p)) ?? "";
    const time = paragraphs.find(p => /am|pm/i.test(p)) ?? "";
    const location = paragraphs.find(p => /Paintsville|Park|Center|Museum|Library/i.test(p)) ?? "";

    const url = item.querySelector("a")?.href ?? "";

    // Paintsville city center
    const lat = 37.8140;
    const lon = -82.8071;

    return {
      title,
      date,
      time,
      location,
      url,
      source: "Paintsville",
      lat,
      lon
    };
  }).filter(e => e.title); // only keep real events
}
