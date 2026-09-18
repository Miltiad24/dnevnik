import { resolve } from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [viteReact(), tailwindcss()],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  base: "./",
  build: {
    outDir: resolve(__dirname, "android/app/src/main/assets/www"),
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000,
    rollupOptions: {
      input: resolve(__dirname, "apk-entry/index.html"),
      output: {
        format: "iife",
        name: "DnevnikApp",
        inlineDynamicImports: true,
        entryFileNames: "app.js",
        chunkFileNames: "app.js",
        assetFileNames: (asset) =>
          asset.name && asset.name.endsWith(".css") ? "app.css" : "assets/[name][extname]",
      },
    },
  },
});
