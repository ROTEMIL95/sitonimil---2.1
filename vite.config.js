import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import viteCompression from "vite-plugin-compression"; // ← הוספה כאן

export default defineConfig({
  base: "/", // for github pages
  plugins: [
    react(),
    viteCompression(), // ← הפעלת הדחיסה כאן
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
