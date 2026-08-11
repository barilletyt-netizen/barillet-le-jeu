import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
// Horodatage du build : c'est ce qui permet de rattacher un retour de testeur
// à une version précise du jeu.
const build = new Date().toISOString().slice(0, 16).replace("T", " ");

// base = "/barillet-le-jeu/" pour GitHub Pages (https://<user>.github.io/barillet-le-jeu/).
// En local (npm run dev) on reste à la racine.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/barillet-le-jeu/" : "/",
  plugins: [react()],
  define: {
    __VERSION__: JSON.stringify(pkg.version),
    __BUILD__: JSON.stringify(build),
  },
  build: { outDir: "dist" },
}));
