import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: chemin du site GitHub Pages (nom du repo)
export default defineConfig({
  plugins: [react()],
  base: "/ecuries-pwa/",
});
