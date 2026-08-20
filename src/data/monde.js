// L'écosystème concurrent et le classement « Stanley Morgan Top 50 ».

export const CLASSEMENT_MONDE = [
  { nom: "Rolodex", rev: 9200 }, { nom: "Cartel", rev: 3100 }, { nom: "Homega", rev: 2600 },
  { nom: "Padek Philange", rev: 2100 }, { nom: "Audemars Pique", rev: 1900 }, { nom: "Long-Innes", rev: 1100 },
  { nom: "Fissot", rev: 900 }, { nom: "Grand Seikho", rev: 700 }, { nom: "TAG Heure", rev: 650 },
  { nom: "Ublot", rev: 600 },
];

export const INDES = [
  "Manufacture Delorme", "Kairos & Cie", "Atelier Brumaire", "Ferrand-Roux", "Tempus Nova",
  "Ostara Watch Co", "Cadran Bleu", "Maison Vaucher", "Heure Zéro", "Berthoud Frères",
];

// Points d'ancrage revenus annuels → rang mondial. Le rang est interpolé entre
// ces points, en échelle logarithmique : deux marques aux revenus proches ont
// des rangs proches, et un rang donné correspond toujours au même revenu.
// (Playtest : les voisins étaient inventés indépendamment de cette table, d'où
// un concurrent 92e avec 68 M alors que le joueur était 100e avec 50 M.)
const ANCRAGES = [
  [600000000, 10], [200000000, 25], [60000000, 50], [25000000, 100],
  [8000000, 200], [2500000, 400], [800000, 700], [250000, 1100],
  [50000, 1600], [10000, 2200],
];

export const RANG_MAX = 2200;

// Le marché grossit : ce qui suffisait à entrer au Top 50 en 2015 ne suffit plus
// vingt ans plus tard. Version minimale du classement vivant (le reste en S3) :
// toute la table d'ancrage est indexée sur cette croissance.
// ~60 M en 2015, ~126 M en 2040, ~263 M en 2065. Valeur calée aux bots : au
// dessous, une stratégie entre au Top 50 dès 2036 ; au-dessus, plus personne
// n'entre. Voir la section équilibrage du lore.
// Surchargeable en test : BARILLET_CROISSANCE=0.025 npm run bots
export const CROISSANCE_MARCHE =
  typeof process !== "undefined" && process.env && process.env.BARILLET_CROISSANCE
    ? Number(process.env.BARILLET_CROISSANCE)
    : 0.030;
const ANNEE_REFERENCE = 2015;

export const facteurMarche = (annee = ANNEE_REFERENCE) =>
  Math.pow(1 + CROISSANCE_MARCHE, Math.max(0, (annee || ANNEE_REFERENCE) - ANNEE_REFERENCE));

/** Revenus annuels qu'il faut atteindre pour entrer au Top 50 cette année-là. */
export const revenusTop50 = (annee = ANNEE_REFERENCE) => Math.round(60000000 * facteurMarche(annee));

// Conservé pour l'affichage hors partie (page d'introduction).
export const REVENUS_TOP50 = 60000000;

const logInterp = (x, x0, x1, y0, y1) => {
  const t = (Math.log(x) - Math.log(x0)) / (Math.log(x1) - Math.log(x0));
  return Math.exp(Math.log(y0) + t * (Math.log(y1) - Math.log(y0)));
};

/** Rang mondial pour un chiffre d'affaires annuel, à l'année donnée. */
export function rangPour(revBrut, annee = ANNEE_REFERENCE) {
  // On ramène le chiffre au barème de 2015 : c'est la barre qui monte.
  const rev = revBrut / facteurMarche(annee);
  if (rev >= ANCRAGES[0][0]) return 1;
  if (rev <= ANCRAGES[ANCRAGES.length - 1][0]) return RANG_MAX;
  for (let i = 0; i < ANCRAGES.length - 1; i++) {
    const [revHaut, rangHaut] = ANCRAGES[i];
    const [revBas, rangBas] = ANCRAGES[i + 1];
    if (rev <= revHaut && rev >= revBas) {
      return Math.round(logInterp(rev, revBas, revHaut, rangBas, rangHaut));
    }
  }
  return RANG_MAX;
}

/** Chiffre d'affaires qu'il faut réaliser pour tenir ce rang. Inverse de rangPour. */
export function revenusPourRang(rang, annee = ANNEE_REFERENCE) {
  const f = facteurMarche(annee);
  const r = Math.max(1, Math.min(RANG_MAX, rang));
  if (r <= ANCRAGES[0][1]) return Math.round(ANCRAGES[0][0] * f);
  for (let i = 0; i < ANCRAGES.length - 1; i++) {
    const [revHaut, rangHaut] = ANCRAGES[i];
    const [revBas, rangBas] = ANCRAGES[i + 1];
    if (r >= rangHaut && r <= rangBas) {
      return Math.round(logInterp(r, rangBas, rangHaut, revBas, revHaut) * f);
    }
  }
  return Math.round(ANCRAGES[ANCRAGES.length - 1][0] * f);
}

/**
 * Deux concurrents juste au-dessus et deux juste en dessous. Leurs revenus sont
 * dérivés de la même table que le rang du joueur : un voisin mieux classé gagne
 * forcément plus, et personne n'est 92e avec plus de chiffre qu'un 50e.
 */
export function voisins(rang, revenus, annee = ANNEE_REFERENCE) {
  const pick = (i) => INDES[(rang * 7 + i * 13) % INDES.length];
  const ligne = (r, i) => ({ rang: r, nom: pick(i), rev: revenusPourRang(r, annee) });
  const dessus = [
    Math.max(1, rang - Math.max(3, Math.round(rang * 0.08))),
    Math.max(1, rang - Math.max(1, Math.round(rang * 0.03))),
  ];
  const dessous = [
    Math.min(RANG_MAX, rang + Math.max(1, Math.round(rang * 0.04))),
    Math.min(RANG_MAX, rang + Math.max(3, Math.round(rang * 0.09))),
  ];
  return {
    dessus: dessus.map(ligne),
    dessous: dessous.map((r, i) => ligne(r, i + 2)),
  };
}
