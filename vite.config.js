import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import viteCompression from "vite-plugin-compression";
import removeConsole from "vite-plugin-remove-console";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa"; // ✅ נוספה כאן

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    viteCompression(),
    removeConsole({ exclude: ['error'] }),
    visualizer({
      filename: "./dist/bundle-report.html",
      gzipSize: true,
      brotliSize: true,
      open: true
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Sitonim-il",
        short_name: "Sitonimil",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1e88e5",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ],
  server: {
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  build: {
    sourcemap: true,
  }
});
