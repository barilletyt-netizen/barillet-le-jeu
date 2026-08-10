// Sauvegarde locale (localStorage). Une seule partie à la fois.
// v5 = passage au budget d'heures (v0.5). Les sauvegardes v4 (points
// d'action) ne sont volontairement pas migrées : le modèle a changé.

const SAVE_KEY = "barillet-save-v5";
const VERSION = 5;

function dispo() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false; // navigation privée / stockage bloqué
  }
}

export function existeSauvegarde() {
  if (!dispo()) return false;
  try {
    return !!localStorage.getItem(SAVE_KEY);
  } catch {
    return false;
  }
}

export function sauvegarderPartie(data) {
  if (!dispo()) return false;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: VERSION, date: Date.now(), ...data }));
    return true;
  } catch {
    return false;
  }
}

export function chargerPartie() {
  if (!dispo()) return null;
  try {
    const brut = localStorage.getItem(SAVE_KEY);
    if (!brut) return null;
    const s = JSON.parse(brut);
    if (s.v !== VERSION || !s.g) return null;
    return s;
  } catch {
    return null;
  }
}

export function effacerSauvegarde() {
  if (!dispo()) return;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* rien à faire */
  }
}
