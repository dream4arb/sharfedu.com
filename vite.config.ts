import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: ".",
  publicDir: false,
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
      "@shared": path.resolve(projectRoot, "shared"),
      "@assets": path.resolve(projectRoot, "attached_assets"),
    },
  },
  build: {
    outDir: "server/public",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
    },
  },
});
