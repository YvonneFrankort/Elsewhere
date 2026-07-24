export async function loadHazardEvents() {
  const html = await fetch("https://www.hazardperrytourism.com/explore").then(r => r.text());
  const doc = new DOMParser().parseFromString(html, "text/html");

  const items = [...doc.querySelectorAll(".wp-block-column")];

  return items.map(item => {
    const title = item.querySelector("h2, h3, .wp-block-heading")?.textContent?.trim() ?? "";
    const paragraphs = [...item.querySelectorAll("p")].map(p => p.textContent.trim());

    const date = paragraphs.find(p => /\d{4}/.test(p)) ?? "";
    const time = paragraphs.find(p => /am|pm/i.test(p)) ?? "";
    const location = paragraphs.find(p => /Hazard|Park|Center|Museum|Library/i.test(p)) ?? "";
    const url = item.querySelector("a")?.href ?? "";

    const lat = 37.2490;
    const lon = -83.1935;

    return {
      title,
      date,
      time,
      location,
      url,
      source: "Hazard",
      lat,
      lon
    };
  }).filter(e => e.title);
}
