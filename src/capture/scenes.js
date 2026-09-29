import {
  COUTS_H, COUTS_CHF, EMPLOYES, HEURES_FONDATEUR, ANNEE_FIN, MOUVEMENTS,
} from "../data/config.js";
import {
  clamp, coutHeures, coutRD, dureeDev, estimerDemande, gainMarketing, heuresParPiece,
  heuresProductionDispo, heuresRD, prixAcceptable, qualiteNouveau, complicationsRecherchables,
} from "../engine/formules.js";
import { etatInitial, simulateQuarter, tirerOpportunite } from "../engine/simulation.js";
import { evoluerMonde } from "../engine/monde.js";
import { rangPour } from "../data/monde.js";
import { passageAnnee, choisirObjectif, periodeQuiOuvre } from "../engine/mentor.js";
import { LETTRES } from "../data/olivier.js";
import { graine as graineSimulation, graineTexte } from "../engine/alea.js";

/** Une graine pour le moteur et une pour les mots : même URL, même image. */
const graine = (n) => {
  graineSimulation(n);
  graineTexte(n);
};

/**
 * Les scènes du devlog #1.
 *
 * Chaque scène **joue réellement une partie** avec le moteur du jeu jusqu'au
 * moment à filmer. Rien n'est écrit à la main dans l'état : ni trésorerie, ni
 * rang, ni ventes. Seules les *décisions* sont scriptées — embaucher, lancer
 * un modèle, fixer un prix — exactement comme un joueur les prendrait, avec les
 * mêmes fonctions de coût que l'interface. Les conséquences, elles, sortent de
 * `simulateQuarter`, qui est le moteur.
 *
 * Une graine fixe par scène : la même URL redonne la même image, ce qui permet
 * de refaire une prise.
 */

// ---- Décisions, à l'identique de l'interface ---------------------------

/** Lancer un modèle en R&D — même calcul que `creerModele` dans App.jsx. */
function lancerModele(g, ctx, nm) {
  const cout = coutRD(nm.mvt, ctx.profil);
  const heures = heuresRD(COUTS_H.rd, g.employes);
  if (g.heures < heures || g.cash < cout) return g;
  const compls = (nm.compls || []).map((id) => ({ id, niveau: g.complications[id] || 1 }));
  return {
    ...g,
    cash: g.cash - cout,
    heures: g.heures - heures,
    modeles: [
      ...g.modeles,
      {
        nom: nm.nom, mvt: nm.mvt, seg: nm.seg, style: nm.style, materiau: nm.mat || "acier",
        compls, finition: false, prix: "", savoirCreation: g.savoir,
        qual: qualiteNouveau(nm.mvt, { pays: ctx.pays, profil: ctx.profil, savoir: g.savoir, compls }),
        prod: 0, stock: 0, age: 0, statut: "dev",
        devRestant: dureeDev(nm.mvt, ctx.profil, g.employes),
      },
    ],
  };
}

/** Embaucher — même calcul que `embaucher` dans App.jsx. */
function embaucher(g, type) {
  const cout = coutHeures("embauche", g);
  if (g.heures < cout) return g;
  return {
    ...g,
    heures: g.heures - cout,
    employes: { ...g.employes, [type]: g.employes[type] + 1 },
    savoir: clamp(g.savoir + EMPLOYES[type].savoir, 0, 100),
  };
}

/**
 * Une campagne de marketing — même calcul que l'action de l'interface.
 *
 * Sans elle, une marque ne se vend pas : la gamme lifestyle exige 10 de
 * notoriété, on part à 6 et la jauge décline chaque trimestre. Un joueur qui
 * ne communique jamais n'existe pas ; un script qui l'oublie ne mesure que son
 * propre oubli.
 */
function marketing(g, ctx) {
  const h = coutHeures("marketing", g);
  if (g.heures < h || g.cash < COUTS_CHF.marketing) return g;
  return {
    ...g,
    heures: g.heures - h,
    cash: g.cash - COUTS_CHF.marketing,
    noto: clamp(g.noto + gainMarketing(g, ctx.pays), 0, 100),
  };
}

/** Garder la notoriété au-dessus d'une cible, comme le ferait un joueur attentif. */
const entretenir = (g, ctx, cible) => (g.noto < cible ? marketing(g, ctx) : g);

/** Lancer une recherche de complication — même calcul que `rechercher`. */
function rechercher(g, ctx, id) {
  if (g.recherche) return g;
  const palier = complicationsRecherchables(g, ctx.profil).find((p) => p.id === id);
  if (!palier || palier.bloque) return g;
  const heures = heuresRD(palier.rdHeures, g.employes, g);
  if (g.heures < heures || g.cash < palier.rd) return g;
  const duree = Math.max(1, palier.dev - (g.employes.ingenieur > 0 ? 1 : 0));
  return {
    ...g,
    cash: g.cash - palier.rd,
    heures: g.heures - heures,
    recherche: { type: "complication", id: palier.id, niveau: palier.niveau, restant: duree },
  };
}

/**
 * Tarifer et produire. Un joueur fixe son prix au voisinage de ce que le
 * marché accepte, puis produit ce qu'il pense vendre, dans la limite de ses
 * heures. `facteur` = prix rapporté au prix acceptable.
 */
function gerer(g, facteur = 1.0) {
  let etat = {
    ...g,
    modeles: g.modeles.map((m) =>
      m.statut === "actif" ? { ...m, prix: Math.round(prixAcceptable(m, g) * facteur) } : m
    ),
  };
  const actifs = etat.modeles.filter((m) => m.statut === "actif");
  if (!actifs.length) return etat;
  const dispo = heuresProductionDispo(etat);
  const voulu = actifs.map((m) => Math.max(0, estimerDemande(m, etat) - m.stock));
  const heures = actifs.reduce((s, m, i) => s + voulu[i] * heuresParPiece(m), 0);
  const f = heures > dispo && heures > 0 ? dispo / heures : 1;
  let i = 0;
  etat = {
    ...etat,
    modeles: etat.modeles.map((m) => (m.statut === "actif" ? { ...m, prod: Math.floor(voulu[i++] * f) } : m)),
  };
  return etat;
}

// ---- Le temps qui passe, à l'identique de l'interface ------------------

/**
 * Un trimestre complet : simulation, puis la transition vers le trimestre
 * suivant telle que la fait App.jsx (continuerApresRapport ou, en fin
 * d'année, continuerApresAnnuel).
 *
 * Renvoie l'état *avant* transition quand il faut montrer le rapport ou le
 * bilan de ce trimestre-là.
 */
function trimestre(g, ctx) {
  const { gs2, rap, faillite } = simulateQuarter({ ...g, actionsTour: [] }, g.heures, ctx);
  if (faillite) return { faillite: true, avant: g, gs2, rap };

  let bilan = null;
  if (g.t >= 4) {
    const rang = rangPour(gs2.revenusAnnee, g.annee);
    bilan = {
      annee: g.annee, revenus: gs2.revenusAnnee, rang,
      prec: g.revenusAnneePrec, meilleurRang: Math.min(rang, g.meilleurRang),
      premierTop50: rang <= 50 && !g.top50Depuis,
      anneesTop50: (g.anneesTop50 || 0) + (rang <= 50 ? 1 : 0),
    };
  }

  // Transition vers le trimestre suivant.
  let suivant;
  if (!bilan) {
    suivant = { ...gs2, t: g.t + 1, heures: HEURES_FONDATEUR, actionsTour: [], lettre: null, reactionMentor: null };
  } else {
    const nouvelleAnnee = g.annee + 1;
    const { monde, faits } = evoluerMonde(gs2.monde, g.annee);
    const top50Depuis = bilan.rang <= 50 && !gs2.top50Depuis ? g.annee : gs2.top50Depuis || null;
    const { etat: apresMentor, lettre, reaction } = passageAnnee(gs2, nouvelleAnnee, { rang: bilan.rang });
    suivant = {
      ...apresMentor, annee: nouvelleAnnee, t: 1, heures: HEURES_FONDATEUR, actionsTour: [],
      monde, faitsMonde: faits, lettre, reactionMentor: reaction,
      revenusAnneePrec: gs2.revenusAnnee, revenusAnnee: 0,
      meilleurRang: bilan.meilleurRang, top50Depuis, anneesTop50: bilan.anneesTop50,
    };
  }
  suivant.opportunite = suivant.decisionEvt || tirerOpportunite(suivant);
  suivant.decisionEvt = null;
  return { faillite: false, avant: g, gs2, rap, bilan, suivant };
}

/** Une partie neuve, comme `demarrer` dans App.jsx. */
function nouvellePartie(ctx) {
  const g = etatInitial(ctx);
  g.objectif = choisirObjectif(periodeQuiOuvre(2015), g);
  g.lettre = { auteur: "Olivier", scellee: false, texte: LETTRES[2015] };
  return g;
}

const numTrimestre = (g) => (g.annee - 2015) * 4 + g.t;

// ---- Les scènes -------------------------------------------------------

/**
 * Une faillite réelle : le joueur prend des décisions plausibles mais trop
 * lourdes pour sa trésorerie, et le moteur fait le reste. Aucune caisse n'est
 * forcée. On note le trimestre où elle survient, sans le truquer.
 */
function sceneFaillite(ctx, strategie, seed) {
  graine(seed);
  let g = nouvellePartie(ctx);
  for (let n = 0; n < 24; n++) {
    g = strategie(g, ctx, n);
    g = gerer(g, 1.0);
    const r = trimestre(g, ctx);
    if (r.faillite) {
      return {
        phase: "fin", g: r.gs2, ctx,
        finInfo: { type: "faillite", annee: g.annee, revenus: r.gs2.revenusAnnee },
        mesure: { trimestre: numTrimestre(g), annee: g.annee, t: g.t, caisse: Math.round(r.gs2.cash) },
      };
    }
    g = r.suivant;
  }
  return { phase: "play", g, ctx, mesure: { trimestre: null, note: "pas de faillite en 24 trimestres" } };
}

/**
 * Embauches lourdes et R&D sans ventes : ce qui tue une jeune maison. Le
 * budget d'heures limite ce qu'on peut faire en un trimestre, donc une maison
 * qui recrute trop recrute sur deux trimestres — `suite` est la vague du
 * second.
 */
const surrecrutement = (types, mvt, seg, suite = []) => (g, ctx, n) => {
  let e = g;
  if (n === 0) {
    e = lancerModele(e, ctx, { nom: "Première", mvt, seg, style: "sport" });
    for (const t of types) e = embaucher(e, t);
  }
  if (n === 1) for (const t of suite) e = embaucher(e, t);
  return e;
};

const SCENES = {
  "faillite-1": () =>
    sceneFaillite(
      { pays: "suisse", profil: "artisan", origine: "selfmade", marque: "Atelier Vuilleumier" },
      surrecrutement(["horloger", "horloger"], "quartz", "grandpublic"),
      101
    ),
  "faillite-2": () =>
    sceneFaillite(
      { pays: "france", profil: "financier", origine: "selfmade", marque: "Maison Lebrun" },
      surrecrutement(["horloger", "horloger", "decorateur"], "quartz", "lifestyle"),
      202
    ),
  "faillite-3": () =>
    sceneFaillite(
      { pays: "chine", profil: "ingenieur", origine: "selfmade", marque: "Horlogerie Zhao" },
      surrecrutement(["horloger", "ingenieur", "ingenieur"], "quartz", "grandpublic"),
      303
    ),
  "faillite-4": () =>
    sceneFaillite(
      { pays: "japon", profil: "artisan", origine: "moyen", marque: "Atelier Kobayashi" },
      surrecrutement(
        ["horloger", "horloger", "horloger", "decorateur"],
        "ebauche", "connaisseurs",
        ["horloger", "horloger", "horloger", "horloger", "ingenieur", "chef", "horloger"]
      ),
      404
    ),

  creation: () => ({
    phase: "setup",
    g: null,
    ctx: { pays: null, profil: null, origine: null, marque: "Maison Barillet" },
  }),

  /**
   * Une partie en cours, en 2017, avec horloger, décorateur et ingénieur :
   * la répartition des heures est lisible dans le panneau du trimestre.
   */
  trimestre: () => {
    graine(517);
    const ctx = { pays: "suisse", profil: "artisan", origine: "moyen", marque: "Maison Barillet" };
    let g = nouvellePartie(ctx);
    g = lancerModele(g, ctx, { nom: "Tavannes", mvt: "quartz", seg: "lifestyle", style: "sport" });
    while (numTrimestre(g) < 9) {
      if (numTrimestre(g) === 3) g = embaucher(g, "horloger");
      if (numTrimestre(g) === 5) g = embaucher(g, "decorateur");
      if (numTrimestre(g) === 7) g = embaucher(g, "ingenieur");
      g = entretenir(g, ctx, 25);
      g = gerer(g, 1.0);
      const r = trimestre(g, ctx);
      if (r.faillite) break;
      g = r.suivant;
    }
    return { phase: "play", g: gerer(g, 1.0), ctx };
  },

  /**
   * L'écran de conception d'un modèle, avec l'arbre des complications
   * partiellement débloqué par de vraies recherches menées à terme.
   */
  modele: () => {
    graine(612);
    const ctx = { pays: "suisse", profil: "ingenieur", origine: "moyen", marque: "Maison Barillet" };
    let g = nouvellePartie(ctx);
    g = lancerModele(g, ctx, { nom: "Tavannes", mvt: "quartz", seg: "lifestyle", style: "sport" });
    // Date, puis chronographe : l'arbre s'ouvre à mesure qu'on le parcourt.
    const plan = ["date", "date", "chrono"];
    let etape = 0;
    while (numTrimestre(g) < 13) {
      if (!g.recherche && etape < plan.length) {
        const avant = g.complications[plan[etape]] || 0;
        g = rechercher(g, ctx, plan[etape]);
        if (g.recherche) etape += 1;
        else if ((g.complications[plan[etape]] || 0) > avant) etape += 1;
      }
      g = entretenir(g, ctx, 25);
      g = gerer(g, 1.0);
      const r = trimestre(g, ctx);
      if (r.faillite) break;
      g = r.suivant;
    }
    return { phase: "play", g: gerer(g, 1.0), ctx, panneau: "rd" };
  },

  /**
   * Le classement annuel, la marque autour du rang 1 200. On joue plusieurs
   * exercices et on garde celui dont le rang *obtenu* est le plus proche — le
   * rang n'est jamais écrit à la main.
   */
  classement: () => {
    graine(707);
    const ctx = { pays: "suisse", profil: "artisan", origine: "moyen", marque: "Maison Barillet" };
    let g = nouvellePartie(ctx);
    g = lancerModele(g, ctx, { nom: "Tavannes", mvt: "quartz", seg: "lifestyle", style: "sport" });
    let meilleur = null;
    while (g.annee <= 2022) {
      g = entretenir(g, ctx, 25);
      g = gerer(g, 1.0);
      const r = trimestre(g, ctx);
      if (r.faillite) break;
      if (r.bilan && (!meilleur || Math.abs(r.bilan.rang - 1200) < Math.abs(meilleur.bilan.rang - 1200))) {
        meilleur = { bilan: r.bilan, g: r.gs2, rap: r.rap };
      }
      g = r.suivant;
    }
    if (!meilleur) return { phase: "play", g, ctx, mesure: { rang: null } };
    return {
      phase: "annuel", g: meilleur.g, ctx, bilanAnnuel: meilleur.bilan, rapport: meilleur.rap,
      mesure: { rang: meilleur.bilan.rang, annee: meilleur.bilan.annee, revenus: meilleur.bilan.revenus },
    };
  },

  /**
   * Un modèle d'environ deux ans, au rapport de trimestre. On relève ses ventes
   * trimestre après trimestre pour dire honnêtement si elles déclinent.
   */
  vieillissement: () => {
    graine(808);
    const ctx = { pays: "suisse", profil: "artisan", origine: "moyen", marque: "Maison Barillet" };
    let g = nouvellePartie(ctx);
    g = lancerModele(g, ctx, { nom: "Tavannes", mvt: "quartz", seg: "lifestyle", style: "sport" });
    const ventes = [];
    let dernier = null;
    for (let n = 0; n < 16; n++) {
      g = entretenir(g, ctx, 25);
      g = gerer(g, 1.0);
      const r = trimestre(g, ctx);
      if (r.faillite) break;
      const ligne = r.rap.lignes.find((l) => l.nom === "Tavannes");
      const m = g.modeles.find((x) => x.nom === "Tavannes");
      if (ligne && m) {
        ventes.push({ age: m.age, vendues: ligne.vendues, demande: ligne.demande, fraicheur: ligne.fraicheur });
        // Le script demandait « environ deux ans ». Mais à deux ans (âge 8),
        // les ventes montent encore : la notoriété progresse plus vite que la
        // fraîcheur ne baisse. Le déclin ne devient lisible qu'au moment où la
        // fraîcheur passe sous 60 % — seuil où le rapport affiche la mention
        // « vieillissant ». On filme donc ce moment-là, le premier où le jeu
        // montre le déclin, et le rapport final le dit.
        if (ligne.fraicheur < 0.6 && !dernier) dernier = { g: r.gs2, rap: r.rap, suivant: r.suivant, age: m.age };
      }
      g = r.suivant;
    }
    const cible = dernier || { g, rap: null };
    return {
      phase: cible.rap ? "rapport" : "play", g: cible.g, ctx, rapport: cible.rap,
      mesure: { ventes, ageFilme: cible.age ?? null },
    };
  },
};

/** Les concurrents se voient au classement annuel : même écran. */
SCENES.concurrents = SCENES.classement;

export const NOMS_SCENES = Object.keys(SCENES);

/** Construit la scène demandée, ou null si elle n'existe pas. */
export function construireScene(nom) {
  const f = SCENES[nom];
  return f ? f() : null;
}

/** Les coûts vérifiés dans la configuration, pour le script du devlog. */
export const coutsMouvements = () =>
  Object.fromEntries(Object.entries(MOUVEMENTS).map(([k, v]) => [k, { unitaire: v.cout, rd: v.rd }]));

export { ANNEE_FIN };
