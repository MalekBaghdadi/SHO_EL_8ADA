import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Served from https://malekbaghdadi.github.io/SHO_EL_8ADA/
const base = "/SHO_EL_8ADA/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "Sho El 8ada",
        short_name: "Sho el 8ada",
        description: "Can't decide what to eat? Swipe through dishes or let it decide for you.",
        theme_color: "#ec8a1e",
        background_color: "#fbf5ec",
        display: "standalone",
        start_url: base,
        scope: base,
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,png}"],
        globIgnores: ["**/og.png"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes("/photos/"),
            handler: "CacheFirst",
            options: { cacheName: "photos", expiration: { maxEntries: 200 } },
          },
        ],
      },
    }),
  ],
});
