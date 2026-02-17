# Plan: Hybrid Deterministic Image System (Phase 5)

## Goal
Solve the "Empty Website" problem while maintaining the **Strict Deterministic Architecture**.

## The "Middle Ground" Strategy
We will not hotlink images in production (slower, fragile). Instead, we implement a **One-Time Population Script** that fetches professional food photography from Unsplash to fill your local `/public/images/foods/` folder.

## Architecture

### 1. [Strict Runtime] (Unchanged)
The website remains fast and offline-capable:
-   **Resolver:** Logic stays `src = /images/foods/{imageKey}.webp`.
-   **No Dynamic Code:** No fetching icons or search bars in the client.

### 2. [Automated Content Pipeline]
#### [NEW] [scripts/populate-images.mjs](file:///c:/programming/ShoEl8ada/scripts/populate-images.mjs)
-   **Function:** Automatically downloads high-quality images for missing `imageKeys`.
-   **Source:** Uses `https://images.unsplash.com/photo-...` or a curated list of Unsplash IDs.
-   **Format:** Converts/saves them as `.webp` files in the correct local folder.

## Proposed Changes

### 1. [Content Pipeline]
#### [NEW] [scripts/populate-images.mjs](file:///c:/programming/ShoEl8ada/scripts/populate-images.mjs)
-   List of 50+ curated Unsplash Food IDs.
-   Logic to loop through `data/foods.ts` and download missing assets using `curl` or `fetch`.

#### [MODIFY] [package.json](file:///c:/programming/ShoEl8ada/package.json)
-   Add `"images:populate": "node scripts/populate-images.mjs"`

### 2. [Next.js Config]
#### [MODIFY] [next.config.js](file:///c:/programming/ShoEl8ada/next.config.js)
-   Add Unsplash to `remotePatterns` (just in case you want to use a remote fallback during development).

## Verification Plan
1.  **Run Population:** Execute `npm run images:populate`.
2.  **Verify Local:** Check if `/public/images/foods/` is now full of beautiful `.webp` files.
3.  **Run Site:** Refresh the browser—every food should now have a stunning professional photo.

## Why this is the "Best" Middle Ground:
-   **Fast:** No network calls when your users visit the site.
-   **Easy:** You don't have to manually search for 50 images.
-   **Professional:** Unsplash provides "Food Porn" level quality consistently.
