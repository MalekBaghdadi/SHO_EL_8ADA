# Sho El 8ada?

**Live: https://malekbaghdadi.github.io/SHO_EL_8ADA/**

The daily question ("what are we eating?") answered. Swipe through 150+ Lebanese and international dishes, or tap **Decide** and let the app pick.

- **Swipe deck:** right = "yalla, this one", left = skip. Undo if you change your mind.
- **Decide for me:** a quick shuffle that lands on one dish.
- **Filters:** meal (breakfast / lunch / dinner / dessert), protein, home-cooked vs order out, mood.
- **Learns quietly:** picks and skips nudge future suggestions; favorites come up more; recent picks take a few days off.
- **Favorites & history**, saved on the device. No account, no server, no tracking.
- **Installable** on a phone (Add to Home Screen) and works offline.

The original Next.js + Gemini version is preserved at the [`v1-legacy`](https://github.com/MalekBaghdadi/SHO_EL_8ADA/tree/v1-legacy) tag.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

Builds the site and publishes `dist/` to the `gh-pages` branch, which GitHub Pages serves. Takes about a minute to go live.

## Editing dishes

All dishes live in [`src/data/dishes.ts`](src/data/dishes.ts), one row each:

```ts
["mloukhieh", "Mloukhieh", "ملوخية", "Jute-leaf stew over rice…", "Lebanese", "lunch", "chicken meat", "home", "comfort heavy"],
//  id          name         Arabic    one-liner                   origin      meals    protein(s)     where   moods
```

- meals: `breakfast lunch dinner dessert`
- protein: `chicken meat fish veggie`
- where: `home out`
- moods: `light heavy comfort healthy quick sweet spicy fresh`

### Photos

A dish shows `public/photos/<id>.webp` if it's listed in `src/data/photos.json`, otherwise a colored illustrated card.
To use your own photo: drop an ~800px-wide `.webp` at `public/photos/<id>.webp` and add an entry to `photos.json`
(`{"author": "Me", "license": "All rights reserved", "licenseUrl": "", "source": ""}`).

The bundled photos are freely licensed (Wikimedia Commons / Openverse) and credited in the app's ⓘ screen. The dev-only
scripts in `scripts/` were used to find and download them:

```bash
node scripts/find-image-candidates.mjs <id>   # search Wikimedia Commons → scripts/candidates.json
python scripts/fetch-photos.py                # download picks from scripts/picks.json → public/photos
```

## Stack

Vite · React · TypeScript · Framer Motion · vite-plugin-pwa. Plain CSS with light/dark themes.
