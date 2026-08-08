import { MATERIAUX, MOUVEMENTS, PAYS, SEGMENTS, STYLES, ATELIER_FIXES, EMPLOYE_FIXES, FIXES_BASE, ETABLI_ECONOMIE } from "../data/config.js";
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

// ---- Capacité en heures (spec v0.4) -------------------------------------
// quartz 1 h/pièce, ébauche 3 h, manufacture 10 h. La capacité est le frein
// anti-snowball principal : on ne produit pas des manufactures en volume.

export const heuresParPiece = (mvtKey) => MOUVEMENTS[mvtKey].heures;

export const heuresModele = (m) => Math.max(0, num(m.prod)) * heuresParPiece(m.mvt);

export function chargeHeures(modeles) {
  return modeles.reduce((s, m) => s + (m.statut === "actif" ? heuresModele(m) : 0), 0);
}

// ---- Coûts --------------------------------------------------------------

export function coutUnitaire(m, { pays, savoir, mult = 1 }) {
  const base = MOUVEMENTS[m.mvt].cout + 60 + MATERIAUX[m.materiau].cout;
  return Math.round(base * PAYS[pays].coutMult * (1 - Math.min(0.15, savoir / 600)) * mult);
}

export function coutRD(mvtKey, profil) {
  return Math.round(MOUVEMENTS[mvtKey].rd * (profil === "ingenieur" ? 0.7 : 1));
}

export function dureeDev(mvtKey, profil) {
  const d = MOUVEMENTS[mvtKey].dev;
  return profil === "ingenieur" ? Math.max(1, d - 1) : d;
}

export function qualiteNouveau(mvtKey, { pays, profil, savoir }) {
  return MOUVEMENTS[mvtKey].qual + PAYS[pays].qualBonus + (profil === "artisan" ? 2 : 0) + Math.floor(savoir / 25);
}

// PA non dépensés = travail à l'établi : savoir-faire +1 et coûts fixes −4'000 chacun.
export function coutsFixes({ employes, ateliers }, etabli = 0) {
  return Math.max(4000, FIXES_BASE + employes * EMPLOYE_FIXES + ateliers * ATELIER_FIXES - etabli * ETABLI_ECONOMIE);
}

export const tauxInteret = (profil) => (profil === "financier" ? 0.04 : 0.06);

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

  const idealAdj = seg.ideal * MATERIAUX[m.materiau].idealMult * (0.55 + m.qual / 14 + g.cred / 300);
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
