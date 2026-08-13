/**
 * Contrôle de la chronologie — `npm run chrono`
 *
 * Deux vérifications que l'œil ne fait pas de façon fiable sur cinquante et un
 * événements :
 *
 * 1. **Couverture** : aucune année de 2015 à 2065 ne doit être vide. Le trou de
 *    42 ans diagnostiqué à la revue est précisément ce qu'on ne veut plus.
 * 2. **Empilement** : une trentaine d'événements ont un effet permanent. Le
 *    moteur les multiplie ; il faut voir où ça atterrit. Un segment sous ×0.4
 *    cumulé est un segment mort, et c'est un signalement, pas une correction
 *    automatique.
 */
import { EVENEMENTS } from "../src/data/evenements.js";
import { effetsActifs } from "../src/engine/effets.js";

const ANNEE_DEBUT = 2015;
const ANNEE_FIN = 2065;
const SEGS = ["grandpublic", "lifestyle", "connaisseurs", "bling"];
const MVTS = ["quartz", "ebauche", "manufacture"];
const SEUIL_MORT = 0.4;

const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);
const x = (v) => "×" + v.toFixed(2);

// ---- 1. Couverture -------------------------------------------------------

console.log("\n\x1b[1mCOUVERTURE 2015-2065\x1b[0m\n");

const parAnnee = new Map();
for (const e of EVENEMENTS) {
  if (!parAnnee.has(e.annee)) parAnnee.set(e.annee, []);
  parAnnee.get(e.annee).push(e);
}

const trous = [];
const lignes = [];
for (let a = ANNEE_DEBUT; a <= ANNEE_FIN; a++) {
  const evts = parAnnee.get(a) || [];
  if (evts.length === 0) trous.push(a);
  lignes.push(
    "  " + a + "  " +
    (evts.length ? evts.map((e) => "T" + e.t + " " + e.id).join(" · ") : "\x1b[31m— vide —\x1b[0m")
  );
}
console.log(lignes.join("\n"));

const permanents = EVENEMENTS.filter((e) => (e.mods || []).some((m) => m.duree == null)).length;
console.log(
  "\n  " + EVENEMENTS.length + " événements sur " + (ANNEE_FIN - ANNEE_DEBUT + 1) + " années · " +
  permanents + " à effet permanent"
);
if (trous.length) console.log("\x1b[31m  ✗ années sans événement : " + trous.join(", ") + "\x1b[0m");
else console.log("\x1b[32m  ✓ aucune année vide\x1b[0m");

// ---- 2. Empilement des effets permanents ---------------------------------

console.log("\n\x1b[1mMULTIPLICATEURS CUMULÉS\x1b[0m");

// Un état de référence : marque suisse, ancienne, savoir-faire élevé. Les
// effets conditionnels se lisent mieux sur un profil qui les déclenche tous.
const etatType = (annee) => ({
  annee, t: 4, pays: "suisse", savoir: 65, des: 60,
  modeles: [{ materiau: "acier" }], materiaux: { acier: true },
  employes: {}, canaux: {},
});

const morts = [];
for (const annee of [2035, 2050, 2065]) {
  const g = etatType(annee);
  const a = effetsActifs(g);
  console.log("\n  \x1b[1m" + annee + "\x1b[0m");
  console.log(
    "  " + pad("segment", 14) + MVTS.map((v) => padL(v, 13)).join("") + padL("gamme seule", 14)
  );
  for (const s of SEGS) {
    const base = a.demande * a.demandeSeg[s];
    const cellules = MVTS.map((v) => {
      let m = base * a.demandeMvt[v];
      for (const c of a.demandeCroisee) {
        if (c.seg.includes(s) && c.mvt.includes(v)) m *= c.mult;
      }
      const txt = padL(x(m), 13);
      return m < SEUIL_MORT ? "\x1b[31m" + txt + "\x1b[0m" : txt;
    });
    if (SEGS.every(() => true) && base < SEUIL_MORT) morts.push({ annee, seg: s, v: base });
    console.log("  " + pad(s, 14) + cellules.join("") + padL(x(base), 14));
  }
  console.log(
    "  " + pad("", 14) + "coûts " + x(a.couts) + " · fixes " + x(a.fixesMult) +
    " +" + a.fixesAjout + " · salaires " + x(a.salaires) +
    " · capacité " + x(a.capacite) + " · portée " + x(a.portee)
  );
  console.log(
    "  " + pad("", 14) + "prix acceptable " + x(a.prixAcceptable) +
    " · désirabilité " + x(a.desEffet) + " plafond " + a.desPlafond +
    " · pool " + x(a.pool) + " · notoriété " + x(a.gainNoto)
  );
}

console.log("");
if (morts.length) {
  console.log("\x1b[31m  ✗ gammes sous ×" + SEUIL_MORT + " (mortes) :\x1b[0m");
  for (const m of morts) console.log("    " + m.annee + " · " + m.seg + " " + x(m.v));
  console.log("    → à signaler, pas à corriger seul.");
} else {
  console.log("\x1b[32m  ✓ aucune gamme sous ×" + SEUIL_MORT + " cumulé\x1b[0m");
}
console.log("");

process.exit(trous.length ? 1 : 0);
