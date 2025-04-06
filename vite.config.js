import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import viteCompression from "vite-plugin-compression"; // ← הוספה כאן
import removeConsole from "vite-plugin-remove-console";
import { visualizer } from "rollup-plugin-visualizer";


export default defineConfig({
  base: "/", // for github pages
  plugins: [
    react(),
    viteCompression(), 
    removeConsole({ exclude: ['error'] }),
    visualizer({
      filename: "./dist/bundle-report.html",
      gzipSize: true,
      brotliSize: true,
      open: true
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
