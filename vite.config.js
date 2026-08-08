import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base = "/barillet-le-jeu/" pour GitHub Pages (https://<user>.github.io/barillet-le-jeu/).
// En local (npm run dev) on reste à la racine.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/barillet-le-jeu/" : "/",
  plugins: [react()],
  build: { outDir: "dist" },
}));
