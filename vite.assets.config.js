// vite.assets.config.js
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: "extensions/chatbot-embed/assets",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: path.resolve(__dirname, "app/entry.client.jsx"),
      output: {
        entryFileNames: "entry.client.js",
        assetFileNames: "chatbot.css",
        chunkFileNames: "[name].js"
      }
    }
  }
});
