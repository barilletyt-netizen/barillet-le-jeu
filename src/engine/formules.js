import {
  MATERIAUX, MOUVEMENTS, PAYS, SEGMENTS, STYLES, COMPLICATIONS, FINITION, CANAUX,
  EMPLOYES, HEURES_EMPLOYE, ATELIER_FIXES, FIXES_BASE, COMPL_NIVEAU_REQUIS,
  ENCADREMENT_PAR_CHEF, ENCADREMENT_PLANCHER, INDEMNITE_TRIMESTRES, FACELIFT_PART_RD,
} from "../data/config.js";
import { multEvenements } from "../data/evenements.js";
import { devise, enDevise } from "./devise.js";

// fr-CH sépare les milliers par une espace fine ou insécable selon le moteur :
// on normalise vers l'apostrophe suisse.
const SEP = /[\s\u202f\u00a0\u2009]/g;
export const fmtNb = (n) => Math.round(n).toLocaleString("fr-CH").replace(SEP, "'");

/**
 * Montant dans la devise d'affichage. Le moteur ne manipule que des CHF ; la
 * conversion est purement cosmétique (voir engine/devise.js).
 */
export function fmtArgent(chf) {
  const d = devise();
  return d.avant + fmtNb(enDevise(chf)) + d.apres;
}

// Les revenus des géants du classement sont déjà exprimés en millions.
export const fmtM = (n) => {
  const d = devise();
  const v = n * d.taux;
  return v >= 1000 ? (v / 1000).toFixed(1) + " Mds" : Math.round(v) + " M";
};
export const fmtH = (n) => fmtNb(n) + " h";
export const fmtPct = (n) => Math.round(n * 100) + "%";
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const num = (v) => Number(v) || 0;

// ---- Complications d'un modèle ------------------------------------------
// Un modèle porte une liste [{ id, niveau }] figée à sa création.

export const listeCompls = (m) => (Array.isArray(m.compls) ? m.compls : []);

export const paletteComplication = (id, niveau) =>
  COMPLICATIONS[id].niveaux[clamp(niveau || 1, 1, COMPLICATIONS[id].niveaux.length) - 1];

export const paliersDe = (m) => listeCompls(m).map((c) => paletteComplication(c.id, c.niveau));

export function nomComplications(m) {
  const noms = paliersDe(m).map((p) => p.nom);
  return noms.length ? noms.join(" + ") : "Trois aiguilles";
}

const somme = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
const produit = (arr, f) => arr.reduce((s, x) => s * f(x), 1);

// ---- Heures d'atelier ---------------------------------------------------
// quartz 1 h/pièce, ébauche 3 h, manufacture 10 h, plus complications et finition.

export function heuresParPiece(m) {
  return (
    MOUVEMENTS[m.mvt].heures +
    somme(paliersDe(m), (p) => p.heures) +
    (m.finition ? FINITION.heures : 0)
  );
}

export const heuresModele = (m) => Math.max(0, num(m.prod)) * heuresParPiece(m);

export function chargeHeures(modeles) {
  return modeles.reduce((s, m) => s + (m.statut === "actif" ? heuresModele(m) : 0), 0);
}

export function heuresEmployes(employes) {
  return Object.entries(employes).reduce(
    (s, [k, n]) => s + (EMPLOYES[k].production ? n * HEURES_EMPLOYE : 0),
    0
  );
}

export const nbEmployes = (employes) => Object.values(employes).reduce((s, n) => s + n, 0);

export const nbProduction = (employes) =>
  Object.entries(employes).reduce((s, [k, n]) => s + (EMPLOYES[k].production ? n : 0), 0);

/**
 * Encadrement : au-delà de ENCADREMENT_PAR_CHEF personnes en production, il faut
 * des chefs d'atelier. Sans eux, l'atelier tourne mal — c'est le frein qui
 * remplace « on embauche et ça roule tout seul ».
 */
export function encadrement(employes) {
  const prod = nbProduction(employes);
  const requis = Math.ceil(prod / ENCADREMENT_PAR_CHEF);
  const chefs = employes.chef || 0;
  if (requis === 0) return { requis: 0, chefs, efficacite: 1, manque: 0 };
  const couverture = Math.min(1, chefs / requis);
  return {
    requis, chefs, manque: Math.max(0, requis - chefs),
    efficacite: ENCADREMENT_PLANCHER + (1 - ENCADREMENT_PLANCHER) * couverture,
  };
}

// Heures réellement productibles : main-d'œuvre encadrée, plafonnée par les postes.
export function heuresProductionDispo(g) {
  const eff = encadrement(g.employes).efficacite;
  return Math.floor(Math.min(g.heures + heuresEmployes(g.employes) * eff, g.capacite));
}

// ---- Canaux de distribution ---------------------------------------------

export const paliersCanal = (id, niveau) => (niveau > 0 ? CANAUX[id].paliers[niveau - 1] : null);

// Portée totale : ce qui multiplie le volume accessible.
export function porteeTotale(canaux) {
  return Object.entries(canaux).reduce((s, [id, n]) => {
    const p = paliersCanal(id, n);
    return s + (p ? p.portee : 0);
  }, 0);
}

/**
 * Marge moyenne encaissée, pondérée par la portée de chaque canal.
 * Passer par les détaillants gonfle le volume mais dilue la marge : c'est
 * l'arbitrage central de la distribution.
 */
export function margeMoyenne(canaux) {
  let portee = 0, pondere = 0;
  for (const [id, n] of Object.entries(canaux)) {
    const p = paliersCanal(id, n);
    if (!p) continue;
    portee += p.portee;
    pondere += p.portee * CANAUX[id].marge;
  }
  return portee > 0 ? pondere / portee : 1;
}

export const fixesCanaux = (canaux) =>
  Object.entries(canaux).reduce((s, [id, n]) => {
    const p = paliersCanal(id, n);
    return s + (p ? p.fixes : 0);
  }, 0);

// Prochain palier ouvrable pour chaque canal, avec ses prérequis.
export function canauxOuvrables(g) {
  return Object.entries(CANAUX)
    .map(([id, c]) => {
      const niveau = g.canaux[id] || 0;
      const prochain = niveau + 1;
      if (prochain > c.paliers.length) return null;
      const p = c.paliers[prochain - 1];
      const manque = [];
      if (c.reqCred && g.cred < c.reqCred) manque.push("crédibilité " + c.reqCred);
      if (c.reqNoto && g.noto < c.reqNoto) manque.push("notoriété " + c.reqNoto);
      return { id, canal: c, niveau: prochain, ...p, manque };
    })
    .filter(Boolean);
}

// ---- Coûts --------------------------------------------------------------

export function coutUnitaire(m, { pays, savoir, employes, mult = 1 }) {
  const remiseMatiere = employes && employes.materiaux > 0 ? 0.8 : 1;
  const base =
    MOUVEMENTS[m.mvt].cout + 60 +
    MATERIAUX[m.materiau].cout * remiseMatiere +
    somme(paliersDe(m), (p) => p.heures) * 25 + // main-d'œuvre de complication
    (m.finition ? FINITION.cout : 0);
  return Math.round(base * PAYS[pays].coutMult * (1 - Math.min(0.15, savoir / 600)) * mult);
}

export function coutRD(mvtKey, profil) {
  return Math.round(MOUVEMENTS[mvtKey].rd * (profil === "ingenieur" ? 0.7 : 1));
}

export const coutFacelift = (m, profil) => Math.round(coutRD(m.mvt, profil) * FACELIFT_PART_RD);

export function dureeDev(mvtKey, profil, employes) {
  let d = MOUVEMENTS[mvtKey].dev;
  if (profil === "ingenieur") d -= 1;
  if (employes && employes.ingenieur > 0) d -= 1;
  return Math.max(1, d);
}

export function heuresRD(base, employes) {
  if (employes && employes.ingenieur > 0) return Math.max(30, Math.round(base * 0.6));
  return base;
}

export function qualiteNouveau(mvtKey, { pays, profil, savoir, compls = [], finition = false }) {
  return (
    MOUVEMENTS[mvtKey].qual +
    PAYS[pays].qualBonus +
    (profil === "artisan" ? 2 : 0) +
    Math.floor(savoir / 25) +
    somme(compls.map((c) => paletteComplication(c.id, c.niveau)), (p) => p.qual) +
    (finition ? FINITION.qual : 0)
  );
}

export const masseSalariale = (employes) =>
  Object.entries(employes).reduce((s, [k, n]) => s + n * EMPLOYES[k].fixes, 0);

export function coutsFixes({ employes, ateliers, canaux }) {
  return FIXES_BASE + masseSalariale(employes) + ateliers * ATELIER_FIXES + fixesCanaux(canaux);
}

export const indemnite = (type) => EMPLOYES[type].fixes * INDEMNITE_TRIMESTRES;

export const tauxInteret = (profil) => (profil === "financier" ? 0.04 : 0.06);

// ---- Trésorerie et alerte de faillite ------------------------------------

/** Seuil sous lequel la caisse passe en rouge : deux trimestres de coûts fixes. */
export const seuilAlerte = (g) => Math.max(30000, coutsFixes(g) * 2);

/** Caisse en dessous de laquelle la partie s'arrête. */
export const SEUIL_FAILLITE = -50000;

/**
 * Diagnostic de trésorerie, pour la barre de statut et l'avertissement.
 * La projection extrapole le dernier trimestre connu : c'est volontairement
 * simple, le joueur doit pouvoir refaire le calcul de tête.
 * Playtest vague 1 : les trois testeurs sont morts sans voir venir la faillite.
 */
export function tresorerie(g) {
  const seuil = seuilAlerte(g);
  const dernier = g.journal.length ? g.journal[g.journal.length - 1].resultat : 0;
  const projection = g.cash + dernier * 2;
  // Marge avant la faillite, en trimestres, au rythme actuel.
  const trimestres =
    dernier < 0 ? Math.max(0, Math.floor((g.cash - SEUIL_FAILLITE) / -dernier)) : null;
  return {
    seuil,
    dernier,
    projection,
    trimestres,
    basse: g.cash < seuil,
    danger: dernier < 0 && projection < 0,
  };
}

// ---- Recherches (complications et matériaux) ----------------------------

export const aIngenieur = (g, profil) => profil === "ingenieur" || g.employes.ingenieur > 0;

export const niveauDe = (g, id) => g.complications[id] || 0;

export function complicationsRecherchables(g, profil) {
  return Object.entries(COMPLICATIONS)
    .filter(([k]) => k !== "aucune")
    .map(([k, c]) => {
      const acquis = niveauDe(g, k);
      const prochain = acquis + 1;
      if (prochain > c.niveaux.length) return null;
      const chaineOk = c.req === null || niveauDe(g, c.req) >= COMPL_NIVEAU_REQUIS;
      if (!chaineOk) return null;
      return {
        type: "complication", id: k, famille: c.nom, niveau: prochain, acquis,
        ...c.niveaux[prochain - 1],
        ingenieur: !!c.ingenieur, manufacture: !!c.manufacture,
        bloque: !!c.ingenieur && !aIngenieur(g, profil),
      };
    })
    .filter(Boolean);
}

export function complicationsVerrouillees(g) {
  return Object.entries(COMPLICATIONS)
    .filter(([k, c]) => k !== "aucune" && c.req !== null && niveauDe(g, c.req) < COMPL_NIVEAU_REQUIS)
    .map(([k, c]) => ({
      id: k, famille: c.nom,
      manque: COMPLICATIONS[c.req].nom + " niveau " + COMPL_NIVEAU_REQUIS,
    }));
}

// Complications posables sur un modèle : maîtrisées, et compatibles du mouvement.
export function complicationsDispo(g, mvtKey) {
  return Object.keys(COMPLICATIONS)
    .filter((k) => k !== "aucune" && niveauDe(g, k) > 0)
    .filter((k) => !COMPLICATIONS[k].manufacture || mvtKey === "manufacture");
}

export const niveauPourModele = (g, id) => niveauDe(g, id);

// Matériaux : acquis d'office, ou recherchés — et un expert dans l'équipe.
export const materiauxDispo = (g) => Object.keys(MATERIAUX).filter((k) => !!g.materiaux[k]);

export function materiauxRecherchables(g) {
  return Object.entries(MATERIAUX)
    .filter(([k, mat]) => !mat.acquisDepart && !g.materiaux[k])
    .filter(([, mat]) => mat.req === null || g.materiaux[mat.req])
    .map(([k, mat]) => ({
      type: "materiau", id: k, famille: mat.nom, nom: mat.nom,
      rdHeures: mat.rdHeures, rd: mat.rd, dev: mat.dev,
      bloque: g.employes.materiaux === 0,
    }));
}

// ---- Image --------------------------------------------------------------
// Playtest : la notoriété montait trop vite, la demande suivait sans effort.
export const gainMarketing = (g, pays) => Math.max(1, Math.round((5 - g.noto / 20) * PAYS[pays].mktMult));
export const gainChoc = (g, pays) => Math.max(3, Math.round((9 - g.noto / 14) * PAYS[pays].mktMult));

// ---- Demande ------------------------------------------------------------

export const fraicheur = (age) => Math.max(0.35, 1 - 0.045 * Math.max(0, age - 4));

/**
 * Source unique de vérité pour la demande. L'étude de marché et la simulation
 * l'appellent toutes les deux ; la simulation y ajoute seulement l'aléa.
 * `prixTest` permet de simuler un autre prix que celui du modèle.
 */
export function demandeBase(m, g, multExterne = 1, prixTest = null) {
  const seg = SEGMENTS[m.seg];
  const prixBrut = num(prixTest !== null ? prixTest : m.prix);
  // Sans prix affiché, rien ne se vend : le joueur doit trancher.
  if (prixBrut <= 0) return 0;
  const prixN = Math.max(50, prixBrut);
  if (m.qual < seg.qualMin || g.noto < seg.notoMin) return 0;

  // Le prix « acceptable » monte avec le matériau, les complications et la finition.
  const idealAdj =
    seg.ideal *
    MATERIAUX[m.materiau].idealMult *
    produit(paliersDe(m), (p) => p.prixMult) *
    (m.finition ? FINITION.prixMult : 1) *
    (0.55 + m.qual / 14 + g.cred / 300);

  const priceFit = clamp(1.45 - prixN / idealAdj, 0.05, 1.1);
  const desMult = m.seg === "connaisseurs" || m.seg === "bling" ? 0.45 + g.des / 90 : 0.85 + g.des / 300;
  // Saturation calculée sur les ventes récentes : le marché se referme si on
  // l'inonde, mais il respire dès qu'on lève le pied.
  const satMult = seg.pool / (seg.pool + (g.saturation[m.seg] || 0));
  const styleMult = STYLES[m.style].mult[m.seg];

  return (
    seg.base *
    Math.pow(g.noto / 100, 0.85) *
    priceFit * porteeTotale(g.canaux) * desMult * satMult * fraicheur(m.age) * styleMult *
    multEvenements(g.annee, g.t, m.seg, m.mvt) *
    multExterne
  );
}

export const estimerDemande = (m, g, prixTest = null) => Math.round(demandeBase(m, g, 1, prixTest));

// Trois points de prix autour du prix courant, pour l'étude de marché.
export function grilleDePrix(m, g) {
  // Sans prix fixé, on part du repère du segment pour proposer une fourchette.
  const base = Math.max(50, num(m.prix) || SEGMENTS[m.seg].ideal);
  return [0.7, 1, 1.4].map((f) => {
    const prix = Math.round(base * f);
    const d = estimerDemande(m, g, prix);
    return { prix, demande: d, ca: prix * d * margeMoyenne(g.canaux) };
  });
}
