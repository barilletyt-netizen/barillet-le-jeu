/**
 * Pose un bandeau d'archive sur la version musée.
 *
 * Sans lui, un visiteur qui tombe sur /musee/ croit jouer au jeu et rapporte
 * des bugs vieux d'un an. Le bandeau est injecté au déploiement plutôt que
 * commité dans l'ancienne version : cette version-là ne doit plus bouger.
 */
import { readFileSync, writeFileSync } from "node:fs";

const fichier = process.argv[2];
const html = readFileSync(fichier, "utf8");

const bandeau = `
<style>
  #bandeau-musee {
    position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
    background: #C9A227; color: #16170F;
    font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px;
    padding: 8px 14px; text-align: center; line-height: 1.4;
    box-shadow: 0 1px 0 rgba(0,0,0,0.4);
  }
  #bandeau-musee a { color: #16170F; font-weight: bold; }
  body { padding-top: 42px; }
</style>
<div id="bandeau-musee">
  Version d'archive — la toute première mouture jouable, gardée telle quelle.
  <a href="/barillet-le-jeu/">Jouer à la version actuelle →</a>
</div>
`;

writeFileSync(fichier, html.replace("<body>", "<body>" + bandeau));
console.log("Bandeau d'archive posé sur " + fichier);
