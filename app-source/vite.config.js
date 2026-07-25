import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    cssCodeSplit: false,
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          motion: ["gsap"]
        }
      }
    }
  }
});
