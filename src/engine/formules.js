import {
  MATERIAUX, MOUVEMENTS, PAYS, SEGMENTS, STYLES, COMPLICATIONS, FINITION,
  EMPLOYES, HEURES_EMPLOYE, ATELIER_FIXES, FIXES_BASE,
} from "../data/config.js";
import { multEvenements } from "../data/evenements.js";

// fr-CH sépare les milliers par une espace fine ou insécable selon le moteur :
// on normalise vers l'apostrophe suisse.
const SEP = /[\s\u202f\u00a0\u2009]/g;
export const fmtNb = (n) => Math.round(n).toLocaleString("fr-CH").replace(SEP, "'");
export const fmtCHF = (n) => "CHF " + fmtNb(n);
export const fmtM = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + " Mds" : n + " M");
export const fmtH = (n) => fmtNb(n) + " h";
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const num = (v) => Number(v) || 0;

// ---- Heures d'atelier (spec v0.5) ---------------------------------------
// quartz 1 h/pièce, ébauche 3 h, manufacture 10 h, plus les heures de
// complication et de finition. La capacité reste le frein anti-snowball.

export const complicationDe = (m) => COMPLICATIONS[m.compl || "aucune"];

export function heuresParPiece(m) {
  return MOUVEMENTS[m.mvt].heures + complicationDe(m).heures + (m.finition ? FINITION.heures : 0);
}

export const heuresModele = (m) => Math.max(0, num(m.prod)) * heuresParPiece(m);

export function chargeHeures(modeles) {
  return modeles.reduce((s, m) => s + (m.statut === "actif" ? heuresModele(m) : 0), 0);
}

// Heures apportées par les employés affectés à la production (horlogers, décorateurs).
export function heuresEmployes(employes) {
  return Object.entries(employes).reduce(
    (s, [k, n]) => s + (EMPLOYES[k].production ? n * HEURES_EMPLOYE : 0),
    0
  );
}

export const nbEmployes = (employes) => Object.values(employes).reduce((s, n) => s + n, 0);

// Heures réellement productibles ce trimestre : main-d'œuvre disponible,
// plafonnée par les postes de travail de l'atelier. Embaucher sans agrandir
// ne sert à rien, et inversement.
export function heuresProductionDispo(g) {
  return Math.min(g.heures + heuresEmployes(g.employes), g.capacite);
}

// ---- Coûts --------------------------------------------------------------

export function coutUnitaire(m, { pays, savoir, employes, mult = 1 }) {
  const remiseMatiere = employes && employes.materiaux > 0 ? 0.8 : 1;
  const base =
    MOUVEMENTS[m.mvt].cout + 60 +
    MATERIAUX[m.materiau].cout * remiseMatiere +
    (m.finition ? FINITION.cout : 0);
  return Math.round(base * PAYS[pays].coutMult * (1 - Math.min(0.15, savoir / 600)) * mult);
}

export function coutRD(mvtKey, profil) {
  return Math.round(MOUVEMENTS[mvtKey].rd * (profil === "ingenieur" ? 0.7 : 1));
}

// L'ingénieur employé fait gagner un trimestre, cumulable avec le profil.
export function dureeDev(mvtKey, profil, employes) {
  let d = MOUVEMENTS[mvtKey].dev;
  if (profil === "ingenieur") d -= 1;
  if (employes && employes.ingenieur > 0) d -= 1;
  return Math.max(1, d);
}

// Un ingénieur dans l'équipe absorbe une partie des heures de R&D du fondateur.
export function heuresRD(base, employes) {
  if (employes && employes.ingenieur > 0) return Math.max(30, Math.round(base * 0.6));
  return base;
}

export function qualiteNouveau(mvtKey, { pays, profil, savoir, compl = "aucune", finition = false }) {
  return (
    MOUVEMENTS[mvtKey].qual +
    PAYS[pays].qualBonus +
    (profil === "artisan" ? 2 : 0) +
    Math.floor(savoir / 25) +
    COMPLICATIONS[compl].qual +
    (finition ? FINITION.qual : 0)
  );
}

export function coutsFixes({ employes, ateliers }) {
  const masse = Object.entries(employes).reduce((s, [k, n]) => s + n * EMPLOYES[k].fixes, 0);
  return FIXES_BASE + masse + ateliers * ATELIER_FIXES;
}

export const tauxInteret = (profil) => (profil === "financier" ? 0.04 : 0.06);

// ---- Complications ------------------------------------------------------

export const aIngenieur = (g, profil) => profil === "ingenieur" || g.employes.ingenieur > 0;

// Complications recherchables maintenant : la précédente est acquise, celle-ci
// ne l'est pas encore. `bloque` = il manque l'ingénieur.
export function complicationsRecherchables(g, profil) {
  return Object.entries(COMPLICATIONS)
    .filter(([k]) => k !== "aucune" && !g.complications.includes(k))
    .filter(([, c]) => c.req === null || g.complications.includes(c.req))
    .map(([k, c]) => ({ id: k, ...c, bloque: !!c.ingenieur && !aIngenieur(g, profil) }));
}

// Complications utilisables sur un modèle : le tourbillon exige la manufacture.
export function complicationsDispo(g, mvtKey) {
  return g.complications.filter((k) => !COMPLICATIONS[k].manufacture || mvtKey === "manufacture");
}

export const materiauxDispo = (g) =>
  Object.keys(MATERIAUX).filter((k) => !MATERIAUX[k].expert || g.employes.materiaux > 0);

// ---- Image --------------------------------------------------------------

export const gainMarketing = (g, pays) => Math.max(2, Math.round((8 - g.noto / 14) * PAYS[pays].mktMult));
export const gainChoc = (g, pays) => Math.max(4, Math.round((14 - g.noto / 10) * PAYS[pays].mktMult));
export const gainDist = (g) => Math.max(2, 7 - Math.floor(g.dist / 20));

// ---- Demande ------------------------------------------------------------

export const fraicheur = (age) => Math.max(0.35, 1 - 0.045 * Math.max(0, age - 4));

// Source unique de vérité pour la demande : l'étude de marché et la simulation
// s'appuient sur la même formule (la simulation y ajoute seulement l'aléa).
export function demandeBase(m, g, multExterne = 1) {
  const seg = SEGMENTS[m.seg];
  const prixN = Math.max(50, num(m.prix));
  if (m.qual < seg.qualMin || g.noto < seg.notoMin) return 0;

  // Le prix « acceptable » monte avec le matériau, la complication et la finition.
  const idealAdj =
    seg.ideal *
    MATERIAUX[m.materiau].idealMult *
    complicationDe(m).prixMult *
    (m.finition ? FINITION.prixMult : 1) *
    (0.55 + m.qual / 14 + g.cred / 300);

  const priceFit = clamp(1.45 - prixN / idealAdj, 0.05, 1.1);
  const distMult = 0.35 + (g.dist / 100) * 0.85;
  const desMult = m.seg === "connaisseurs" || m.seg === "bling" ? 0.45 + g.des / 90 : 0.85 + g.des / 300;
  const satMult = seg.pool / (seg.pool + g.segVendues[m.seg] * 2);
  const styleMult = STYLES[m.style].mult[m.seg];

  const d =
    seg.base *
    Math.pow(g.noto / 100, 0.85) *
    priceFit * distMult * desMult * satMult * fraicheur(m.age) * styleMult *
    multEvenements(g.annee, g.t, m.seg, m.mvt) *
    multExterne;

  return d;
}

export const estimerDemande = (m, g) => Math.round(demandeBase(m, g));
