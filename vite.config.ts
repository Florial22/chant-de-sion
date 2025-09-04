import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json" assert { type: "json" };

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"] },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version), 
  },
});
