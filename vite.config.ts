import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Event booking app",
        short_name: "App",
        description: "My Progressive Web App",
        theme_color: "#ffffff",
        screenshots: [
          {
            src: "mobile.png",
            sizes: "540x960",
            type: "image/png",
            form_factor: "narrow",
          },
          {
            src: "desktop.png",
            sizes: "1536x1024",
            type: "image/png",
            form_factor: "wide",
          },
        ],
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-icon.webp",
            sizes: "512x512",
            type: "image/webp",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],

  build: {
    chunkSizeWarningLimit: 1500,
  },
});
