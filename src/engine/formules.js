import {
  MATERIAUX, MOUVEMENTS, PAYS, SEGMENTS, STYLES, COMPLICATIONS, FINITION, CANAUX,
  EMPLOYES, HEURES_EMPLOYE, FIXES_BASE, COMPL_NIVEAU_REQUIS, SALAIRES,
  DIRECTEURS, DIRECTEUR_REQ, DIRECTEUR_CONDITION, HEURES_DELEGUEES, COUTS_H,
  ENCADREMENT_PAR_CHEF, ENCADREMENT_SANS_CHEF, ENCADREMENT_PLANCHER,
  INDEMNITE_TRIMESTRES, FACELIFT_PART_RD,
  CONCAVITE_NOTORIETE, CONCAVITE_CREDIBILITE, CONCAVITE_DESIRABILITE, ELASTICITE_PRIX,
} from "../data/config.js";
import { effetsActifs, effetsNeutres, multDemande } from "./effets.js";
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

/**
 * Heures d'atelier par pièce. La gamme visée fixe le standard de finition
 * (1 h en grand public, 30 h en haute horlogerie) ; le mouvement maison, les
 * complications et la finition s'ajoutent par-dessus.
 */
export function heuresParPiece(m) {
  return (
    SEGMENTS[m.seg].heures +
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
export function encadrement(employes, salaires = "standard") {
  const prod = nbProduction(employes);
  const chefs = employes.chef || 0;
  // Les ENCADREMENT_SANS_CHEF premiers sont encadrés par le fondateur lui-même.
  const aEncadrer = Math.max(0, prod - ENCADREMENT_SANS_CHEF);
  const requis = Math.ceil(aEncadrer / ENCADREMENT_PAR_CHEF);
  const bonus = (SALAIRES[salaires] || SALAIRES.standard).efficacite;
  if (requis === 0) {
    return { requis: 0, chefs, manque: 0, efficacite: 1 + bonus, prod, sansChef: ENCADREMENT_SANS_CHEF };
  }
  const couverture = Math.min(1, chefs / requis);
  return {
    requis, chefs, prod, sansChef: ENCADREMENT_SANS_CHEF,
    manque: Math.max(0, requis - chefs),
    efficacite: ENCADREMENT_PLANCHER + (1 - ENCADREMENT_PLANCHER) * couverture + bonus,
  };
}

// Heures réellement productibles : main-d'œuvre encadrée, plafonnée par les postes.
export function heuresProductionDispo(g) {
  const effEnc = encadrement(g.employes, g.salaires).efficacite;
  return Math.floor(Math.min(g.heures + heuresEmployes(g.employes) * effEnc, capaciteEffective(g)));
}

/**
 * Capacité d'atelier après les événements. Une hausse du temps de fabrication
 * (crise des matières, rationnement électrique) se traduit ici plutôt que dans
 * les heures par pièce : même résultat, sans faire passer l'accumulateur dans
 * les dix fonctions qui comptent des heures.
 */
export function capaciteEffective(g, eff = null) {
  const e = eff || g.effets || effetsActifs(g);
  return Math.floor(g.capacite * e.capacite);
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

export function coutUnitaire(m, { pays, savoir, employes, mult = 1, eff = null }) {
  const e = eff || effetsNeutres();
  const remiseMatiere = employes && employes.materiaux > 0 ? 0.8 : 1;
  const base =
    MOUVEMENTS[m.mvt].cout * (e.coutMouvement[m.mvt] || 1) + 60 +
    MATERIAUX[m.materiau].cout * remiseMatiere * (e.coutMateriau[m.materiau] || 1) +
    somme(paliersDe(m), (p) => p.heures) * 25 + // main-d'œuvre de complication
    (m.finition ? FINITION.cout : 0);
  return Math.round(base * PAYS[pays].coutMult * (1 - Math.min(0.15, savoir / 600)) * mult * e.couts);
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

// ---- Directeurs ----------------------------------------------------------

export const directeursDe = (g) =>
  Object.keys(DIRECTEURS).filter((k) => g.directeurs && g.directeurs[k]);

export const aDirecteur = (g, role) => !!(g.directeurs && g.directeurs[role]);

/** Salaires des directeurs, hors masse salariale ordinaire. */
export const masseDirection = (g) =>
  directeursDe(g).reduce((s, k) => s + DIRECTEURS[k].fixes, 0);

/**
 * Coût en heures d'une action, une fois la délégation prise en compte. Le
 * produit n'y figure jamais : la R&D, les complications et les matériaux
 * restent au fondateur quoi qu'il arrive.
 */
export function coutHeures(action, g) {
  const base = COUTS_H[action];
  if (base == null) return 0;
  const delegue = directeursDe(g).some((k) => DIRECTEURS[k].exonere.includes(action));
  return delegue ? Math.min(base, HEURES_DELEGUEES) : base;
}

/** Le prochain directeur recrutable, avec ses prérequis. */
export function directeurRecrutable(g, role) {
  if (aDirecteur(g, role)) return null;
  const top10 = (g.rangs || []).some((r) => r <= 10);
  const req = DIRECTEUR_REQ(directeursDe(g).length, top10);
  const condition = DIRECTEUR_CONDITION[role];
  return {
    role, ...DIRECTEURS[role], req, condition,
    ok:
      nbEmployes(g.employes) >= req.employes &&
      g.cred >= req.cred &&
      condition.ok(g),
  };
}

export function coutsFixes({ employes, ateliersFixes = 0, canaux, eff = null, salaires = "standard", directeurs = null }) {
  const e = eff || effetsNeutres();
  const politique = (SALAIRES[salaires] || SALAIRES.standard).mult;
  const direction = masseDirection({ directeurs });
  const base =
    FIXES_BASE + (masseSalariale(employes) + direction) * e.salaires * politique +
    ateliersFixes + fixesCanaux(canaux);
  return Math.round(base * e.fixesMult + e.fixesAjout);
}

/**
 * Décomposition des coûts fixes, poste par poste. Sans elle, « couper des
 * coûts » reste une intention : le joueur ne sait pas où appuyer.
 */
export function detailFixes({ employes, ateliers, ateliersFixes = 0, canaux, salaires = "standard", directeurs = null }) {
  const politique = (SALAIRES[salaires] || SALAIRES.standard).mult;
  const lignes = [{ libelle: "Structure de base", montant: FIXES_BASE }];
  for (const [k, n] of Object.entries(employes)) {
    if (n > 0) {
      lignes.push({
        libelle: EMPLOYES[k].nom + (n > 1 ? " ×" + n : "") + (politique !== 1 ? " (" + SALAIRES[salaires].nom.toLowerCase() + ")" : ""),
        montant: Math.round(n * EMPLOYES[k].fixes * politique),
        detail: n > 1 ? fmtArgent(EMPLOYES[k].fixes) + " chacun" : null,
      });
    }
  }
  for (const k of directeursDe({ directeurs })) {
    lignes.push({ libelle: DIRECTEURS[k].nom, montant: Math.round(DIRECTEURS[k].fixes * politique) });
  }
  if (ateliersFixes > 0) {
    lignes.push({
      libelle: "Agrandissements d'atelier" + (ateliers > 1 ? " ×" + ateliers : ""),
      montant: ateliersFixes,
    });
  }
  for (const [id, n] of Object.entries(canaux)) {
    const p = paliersCanal(id, n);
    if (p && p.fixes > 0) lignes.push({ libelle: CANAUX[id].nom + " — " + p.nom, montant: p.fixes });
  }
  return lignes;
}

// ---- Conseils ------------------------------------------------------------

/** Trésorerie d'avance qu'un conseil de dépense doit laisser au joueur. */
export const MARGE_CONSEIL_TRIMESTRES = 3;

/**
 * Un conseil ne doit jamais pousser à une dépense qui met le joueur en danger.
 * Retour de beta : un testeur est mort en suivant littéralement la chaîne de
 * recommandations. En dessous de ce seuil, l'UI passe en formulation neutre.
 */
export function conseilFinancable(g, montant) {
  return g.cash - montant >= coutsFixes(g) * MARGE_CONSEIL_TRIMESTRES;
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
// Ralenti d'un cran de plus post-S3 : se faire un nom prend des années, et
// c'est ce qui étire la rampe des deux premières décennies.
export const gainMarketing = (g, pays) =>
  Math.max(1, Math.round((4 - g.noto / 22) * PAYS[pays].mktMult * (g.effets || effetsActifs(g)).gainNoto));
export const gainChoc = (g, pays) => Math.max(3, Math.round((9 - g.noto / 14) * PAYS[pays].mktMult));

// ---- Demande ------------------------------------------------------------

export const fraicheur = (age) => Math.max(0.35, 1 - 0.045 * Math.max(0, age - 4));

/**
 * Rendement d'une jauge, en rendements décroissants. Renvoie 0 à 0 et 1 à 100,
 * mais monte beaucoup plus vite au début : les vingt premiers points de
 * notoriété valent plus que les vingt derniers.
 */
export const rendement = (valeur, concavite) => Math.pow(clamp(valeur, 0, 100) / 100, concavite);

/**
 * Le prix « acceptable » d'un modèle : ce que le marché est prêt à payer avant
 * que l'élasticité ne morde. Il monte avec le matériau, les complications, la
 * finition, la qualité et la crédibilité — et suit les événements d'époque.
 *
 * Exporté parce que les bots doivent tarifer là-dessus : tant qu'ils
 * recalculaient leur propre repère, ils étaient aveugles à tout ce qui déplace
 * le prix acceptable, et l'équilibrage jauges/prix se mesurait sur un angle
 * mort.
 */
export function prixAcceptable(m, g, eff = null) {
  const e = eff || g.effets || effetsActifs(g);
  return (
    SEGMENTS[m.seg].ideal *
    MATERIAUX[m.materiau].idealMult *
    produit(paliersDe(m), (p) => p.prixMult) *
    (m.finition ? FINITION.prixMult : 1) *
    (0.55 + m.qual / 14 + 0.33 * rendement(g.cred, CONCAVITE_CREDIBILITE)) *
    e.prixAcceptable
  );
}

/**
 * Source unique de vérité pour la demande. L'étude de marché et la simulation
 * l'appellent toutes les deux ; la simulation y ajoute seulement l'aléa.
 * `prixTest` permet de simuler un autre prix que celui du modèle.
 */
export function demandeBase(m, g, multExterne = 1, prixTest = null) {
  const seg = SEGMENTS[m.seg];
  // L'appelant peut fournir l'accumulateur déjà calculé (la simulation le fait
  // une fois par trimestre) plutôt que de le refaire pour chaque modèle.
  const eff = g.effets || effetsActifs(g);
  const prixBrut = num(prixTest !== null ? prixTest : m.prix);
  // Sans prix affiché, rien ne se vend : le joueur doit trancher.
  if (prixBrut <= 0) return 0;
  const prixN = Math.max(50, prixBrut);
  if (m.qual < seg.qualMin || g.noto < seg.notoMin) return 0;

  const idealAdj = prixAcceptable(m, g, eff);

  // Adhérence au prix : linéaire tant qu'on reste sous le prix acceptable,
  // écrasée par une puissance au-dessus. Vendre trop cher se paie très vite.
  const ratio = prixN / idealAdj;
  const priceFit =
    clamp(1.45 - ratio, 0.02, 1.1) * (ratio > 1 ? Math.pow(1 / ratio, ELASTICITE_PRIX) : 1);
  // Le plafond de désirabilité et son efficacité sont eux aussi des leviers
  // d'époque : le traité sur le marché secondaire plafonne, la génération
  // d'après-krach rend la rareté plus payante.
  const desirabilite =
    rendement(Math.min(g.des, eff.desPlafond), CONCAVITE_DESIRABILITE) * eff.desEffet;
  const desMult =
    m.seg === "connaisseurs" || m.seg === "bling" ? 0.45 + 1.11 * desirabilite : 0.85 + 0.33 * desirabilite;
  // Saturation calculée sur les ventes récentes : le marché se referme si on
  // l'inonde, mais il respire dès qu'on lève le pied.
  const pool = seg.pool * eff.pool;
  const satMult = pool / (pool + (g.saturation[m.seg] || 0));
  const styleMult = STYLES[m.style].mult[m.seg];

  return (
    seg.base *
    rendement(g.noto, CONCAVITE_NOTORIETE) *
    priceFit * porteeTotale(g.canaux) * eff.portee * (aDirecteur(g, "commercial") ? 1.15 : 1) * desMult * satMult * fraicheur(m.age) * styleMult *
    multDemande(g, m.seg, m.mvt, eff) *
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
