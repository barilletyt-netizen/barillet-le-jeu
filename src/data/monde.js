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

const SEUILS_RANG = [
  [600000000, 10], [200000000, 25], [60000000, 50], [25000000, 100],
  [8000000, 200], [2500000, 400], [800000, 700], [250000, 1100], [50000, 1600], [0, 2200],
];

export function rangPour(rev) {
  for (const [seuil, rang] of SEUILS_RANG) if (rev >= seuil) return rang;
  return 2200;
}

// Deux concurrents fictifs juste au-dessus et deux juste en dessous, pour donner
// au joueur un voisinage crédible plutôt qu'un rang nu.
export function voisins(rang, revenus) {
  const pick = (i) => INDES[(rang * 7 + i * 13) % INDES.length];
  return {
    dessus: [
      { rang: Math.max(51, rang - Math.round(rang * 0.08)), nom: pick(1), rev: revenus * 1.35 },
      { rang: Math.max(51, rang - Math.round(rang * 0.04)), nom: pick(2), rev: revenus * 1.15 },
    ],
    dessous: [
      { rang: rang + Math.round(rang * 0.05), nom: pick(3), rev: revenus * 0.85 },
      { rang: rang + Math.round(rang * 0.1), nom: pick(4), rev: revenus * 0.65 },
    ],
  };
}
