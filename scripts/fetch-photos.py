"""Dev-only: downloads the picked photos, resizes to 800px wide WebP, and writes credits.
Run from the app folder:  python scripts/fetch-photos.py
Needs Pillow. Output: public/photos/<id>.webp and src/data/photos.json
"""
import io, json, os, re, time, urllib.request
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cands = json.load(open(os.path.join(ROOT, "scripts", "candidates.json"), encoding="utf-8"))
picks = json.load(open(os.path.join(ROOT, "scripts", "picks.json"), encoding="utf-8"))
out_dir = os.path.join(ROOT, "public", "photos")
os.makedirs(out_dir, exist_ok=True)
UA = "ShoEl8ada/2.0 (https://github.com/MalekBaghdadi/SHO_EL_8ADA)"
W = 800

def download(url):
    for i in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return urllib.request.urlopen(req, timeout=60).read()
        except Exception as e:
            print("  retry", i, e)
            time.sleep(3 * (i + 1))
    raise RuntimeError(url)

credits = {}
for dish_id, idx in picks.items():
    c = cands[dish_id][idx]
    if "full" in c:  # Openverse
        url = c["full"]
    elif c["w"] > 960:
        # Wikimedia only serves standard thumbnail widths (https://w.wiki/GHai)
        url = re.sub(r"/\d+px-", "/960px-", c["thumb"].split("?")[0])
    else:
        url = (c["thumb"].split("?")[0].replace("/thumb/", "/").rsplit("/", 1)[0]
               .replace("thumb.wikimedia.org", "upload.wikimedia.org"))
    dest = os.path.join(out_dir, dish_id + ".webp")
    if not os.path.exists(dest):
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(download(url)))).convert("RGB")
        if im.width > W:
            im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
        im.save(dest, "WEBP", quality=68, method=6)
        time.sleep(0.3)
    credits[dish_id] = {
        "author": re.sub(r"\s+", " ", c["author"]).strip(),
        "license": c["license"],
        "licenseUrl": c.get("licenseUrl", ""),
        "source": c["page"],
    }
    print(dish_id, os.path.getsize(dest) // 1024, "KB")

json.dump(credits, open(os.path.join(ROOT, "src", "data", "photos.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("total", len(credits))
