// Dev-only: finds freely licensed photo candidates on Wikimedia Commons for every dish.
// Usage: node scripts/find-image-candidates.mjs [dishId ...]  →  writes scripts/candidates.json
import fs from "node:fs";

const UA = "ShoEl8ada/2.0 (https://github.com/MalekBaghdadi/SHO_EL_8ADA)";
const queries = JSON.parse(fs.readFileSync(new URL("./image-queries.json", import.meta.url)));
const outPath = new URL("./candidates.json", import.meta.url);
const out = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath)) : {};
const only = process.argv.slice(2);

const FREE = /^(cc0|public domain|pd|cc by(-sa)? \d|cc by(-sa)?$|cc-by|attribution)/i;

async function api(host, params) {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params });
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.ok) return r.json();
    await new Promise((s) => setTimeout(s, 1500 * (i + 1)));
  }
  throw new Error("failed " + url);
}

const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function fileInfo(titles) {
  if (!titles.length) return [];
  const j = await api("commons.wikimedia.org", {
    action: "query", prop: "imageinfo", titles: titles.join("|"),
    iiprop: "url|extmetadata|size|mime", iiurlwidth: "360",
  });
  const res = [];
  for (const p of j.query?.pages ?? []) {
    const ii = p.imageinfo?.[0];
    if (!ii || !/jpeg|png|webp/.test(ii.mime)) continue;
    const m = ii.extmetadata ?? {};
    const license = strip(m.LicenseShortName?.value);
    if (!FREE.test(license)) continue;
    if (ii.width < 600) continue;
    res.push({
      title: p.title,
      thumb: ii.thumburl,
      page: ii.descriptionurl,
      license,
      licenseUrl: m.LicenseUrl?.value ?? "",
      author: strip(m.Artist?.value).slice(0, 80) || "Unknown",
      w: ii.width, h: ii.height,
    });
  }
  // keep requested order
  return titles.map((t) => res.find((r) => r.title === t)).filter(Boolean);
}

async function wikiLead(title) {
  const j = await api("en.wikipedia.org", { action: "query", prop: "pageimages", piprop: "name", titles: title, redirects: "1" });
  const name = j.query?.pages?.[0]?.pageimage;
  return name ? "File:" + name : null;
}

async function search(q, n = 8) {
  const j = await api("commons.wikimedia.org", {
    action: "query", list: "search", srsearch: `${q} filetype:bitmap`, srnamespace: "6", srlimit: String(n),
  });
  return (j.query?.search ?? []).map((s) => s.title);
}

for (const [id, q] of Object.entries(queries)) {
  if (only.length ? !only.includes(id) : out[id]) continue;
  const titles = [];
  if (q.startsWith("search:")) {
    titles.push(...(await search(q.slice(7))));
  } else {
    const lead = await wikiLead(q);
    if (lead) titles.push(lead);
    titles.push(...(await search(q)));
  }
  const uniq = [...new Set(titles)];
  out[id] = (await fileInfo(uniq.slice(0, 12))).slice(0, 5);
  console.log(id.padEnd(22), out[id].length);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
}
