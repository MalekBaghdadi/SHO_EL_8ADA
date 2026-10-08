// Dev-only: Openverse (CC-licensed, mostly Flickr) fallback for dishes Commons couldn't cover.
// Usage: node scripts/find-openverse.mjs id="query" ...  → merges into scripts/candidates.json
import fs from "node:fs";
const outPath = new URL("./candidates.json", import.meta.url);
const out = JSON.parse(fs.readFileSync(outPath));
for (const arg of process.argv.slice(2)) {
  const [id, q] = arg.split("=");
  const url = "https://api.openverse.org/v1/images/?" + new URLSearchParams({ q, license: "by,by-sa,cc0,pdm", page_size: "8", mature: "false" });
  const r = await fetch(url, { headers: { "User-Agent": "ShoEl8ada/2.0" } });
  const j = await r.json();
  out[id] = (j.results ?? []).filter((x) => (x.width ?? 1000) >= 600).slice(0, 5).map((x) => ({
    title: x.title, thumb: x.thumbnail, full: x.url, page: x.foreign_landing_url,
    license: `${x.license === "pdm" ? "Public domain" : x.license === "cc0" ? "CC0" : "CC " + x.license.toUpperCase()} ${x.license_version ?? ""}`.trim(),
    licenseUrl: x.license_url, author: (x.creator ?? "Unknown").slice(0, 80), w: x.width, h: x.height,
  }));
  console.log(id, out[id].length);
}
fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
