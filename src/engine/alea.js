/**
 * Source d'aléa du moteur.
 *
 * En jeu, c'est `Math.random`. Mais la simulation automatique a besoin de
 * parties reproductibles : sans graine, deux exécutions de la même stratégie
 * donnent des résultats très différents et on ne sait plus si un écart vient
 * du code ou du hasard. `graine(n)` bascule sur un générateur déterministe.
 */

let etat = null;

/** Fixe la graine (parties reproductibles). `graine(null)` revient à Math.random. */
export function graine(n) {
  etat = n === null || n === undefined ? null : n >>> 0 || 1;
}

/** Nombre dans [0, 1[. Xorshift32 quand une graine est posée. */
export function hasard() {
  if (etat === null) return Math.random();
  etat ^= etat << 13;
  etat >>>= 0;
  etat ^= etat >>> 17;
  etat ^= etat << 5;
  etat >>>= 0;
  return etat / 4294967296;
}

/** Élément au hasard dans un tableau non vide. */
export const tirer = (arr) => arr[Math.floor(hasard() * arr.length)];

// ---- Flux séparé pour le texte -------------------------------------------
// La génération du récit et des brèves ne doit JAMAIS puiser dans le même flux
// que la simulation : ajouter une phrase décalerait tous les tirages suivants
// et ferait bouger l'équilibrage sans qu'aucune règle n'ait changé. Mesuré :
// brancher le récit déplaçait l'année d'entrée au Top 50 d'une stratégie.

let etatTexte = 987654321;

export function graineTexte(n) {
  etatTexte = (n === null || n === undefined ? 987654321 : n >>> 0) || 1;
}

export function hasardTexte() {
  etatTexte ^= etatTexte << 13;
  etatTexte >>>= 0;
  etatTexte ^= etatTexte >>> 17;
  etatTexte ^= etatTexte << 5;
  etatTexte >>>= 0;
  return etatTexte / 4294967296;
}

export const tirerTexte = (arr) => arr[Math.floor(hasardTexte() * arr.length)];
