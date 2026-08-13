import { EVENEMENTS, OPPORTUNITES, poolAleas } from "../data/evenements.js";
import {
  PAYS, ORIGINES, EMPLOYES, EMPLOYES_VIDE, COMPLICATIONS, MATERIAUX, CANAUX, CANAUX_VIDE,
  CAPACITE_DEPART, HEURES_FONDATEUR, HEURES_PAR_SAVOIR, ANNEE_DEBUT,
  CRED_SAVOIR_SEUIL, CRED_ANCIENNETE_ANS, SATURATION_DECROISSANCE, IMPOT_TAUX,
} from "../data/config.js";
import {
  capaciteEffective, chargeHeures, clamp, coutUnitaire, coutsFixes, demandeBase, detailFixes,
  encadrement, fmtArgent, fraicheur, heuresEmployes, heuresParPiece, margeMoyenne, nbEmployes,
  num, tauxInteret,
} from "./formules.js";
import { hasard, tirer as pick } from "./alea.js";
import { effetsActifs, nettoyerMods, trimestreIndex } from "./effets.js";
import { mondeInitial, evoluerMonde, breveConcurrent } from "./monde.js";
import { journalTrimestre, MEMOIRE_JOURNAL } from "./journal.js";

const SEGMENTS_VIDE = { grandpublic: 0, lifestyle: 0, connaisseurs: 0, bling: 0 };

export function etatInitial({ pays, profil, origine, marque }) {
  const p = PAYS[pays];
  const o = ORIGINES[origine];
  const capital = Math.round(o.capital * (profil === "financier" ? 1.5 : 1));
  const etat = {
    annee: ANNEE_DEBUT, t: 1,
    pays, profil, origine, // les effets d'époque en dépendent
    cash: capital, dette: o.dette,
    noto: 2 + o.reseau,
    cred: Math.max(0, o.cred + p.credBonus),
    des: 5,
    savoir: 5 + p.savoirBonus + (profil === "artisan" ? 10 : 0),
    capacite: CAPACITE_DEPART, // postes d'atelier, en heures par trimestre
    heures: HEURES_FONDATEUR, // heures du fondateur restantes ce trimestre
    employes: { ...EMPLOYES_VIDE },
    ateliers: 0, ateliersFixes: 0,
    canaux: { ...CANAUX_VIDE }, // id → palier ouvert
    complications: { aucune: 1 }, // id → niveau maîtrisé
    materiaux: { acier: true }, // id → maîtrisé
    recherche: null, // { type, id, niveau, restant }
    reseau: o.reseau,
    modeles: [], kickstarterFait: false,
    revenusAnnee: 0, revenusAnneePrec: 0, resultatAnnee: 0, meilleurRang: 2200,
    saturation: { ...SEGMENTS_VIDE }, // ventes récentes, se résorbent chaque trimestre
    segVendues: { ...SEGMENTS_VIDE }, // cumul, pour les statistiques
    marque: marque || "Votre marque",
    journal: [], opportunite: null, oppRecentes: [],
    journalRecent: [], // familles déjà passées en une de la Gazette
    tirages: [], // { id, q } — mémoire courte des aléas et opportunités déjà vus
    mods: [], // modificateurs durables posés par les aléas et les opportunités
    // Actions prises pendant le trimestre en cours : matière première du récit.
    actionsTour: [],
    monde: mondeInitial(),
    faitsMonde: [],
    messages: [
      "T1 " + ANNEE_DEBUT + " — " + (marque || "Votre marque") + " est née. Capital : " +
      fmtArgent(capital) + (o.dette ? " (dette : " + fmtArgent(o.dette) + ")" : "") +
      ". Vous disposez de " + HEURES_FONDATEUR + " h par trimestre.",
    ],
  };
  etat.opportunite = tirerOpportunite(etat);
  return etat;
}

/**
 * Époque de la marque. Sans elle, un catalogue profond propose une offre de
 * rachat au troisième trimestre et un cambriolage de réserves vides.
 */
export function epoqueDe(g) {
  const age = g.annee - ANNEE_DEBUT;
  const n = nbEmployes(g.employes);
  if (age > 15 || n > 10) return "maturite";
  if (age < 5 && n < 3) return "debut";
  return "croissance";
}

/**
 * Poids de tirage d'une entrée. Deux règles, sans lesquelles soixante aléas se
 * comportent comme dix :
 *
 * 1. **Mémoire courte** — ce qui vient d'être tiré revient quatre fois moins
 *    souvent pendant trois ans, deux fois moins pendant trois de plus.
 * 2. **Fenêtre d'époque** — hors de sa fenêtre, une entrée pèse zéro.
 */
export function poidsTirage(entree, g) {
  const fenetre = entree.epoque;
  if (fenetre && fenetre !== "toujours") {
    const liste = Array.isArray(fenetre) ? fenetre : [fenetre];
    if (!liste.includes("toujours") && !liste.includes(epoqueDe(g))) return 0;
  }
  const vu = (g.tirages || []).find((r) => r.id === entree.id);
  if (!vu) return 1;
  const ecoule = trimestreIndex(g.annee, g.t) - vu.q;
  if (ecoule < 12) return 0.25;
  if (ecoule < 24) return 0.5;
  return 1;
}

/** Tirage pondéré sur le flux d'aléa de simulation. */
function tirerPondere(liste, g) {
  const poids = liste.map((x) => poidsTirage(x, g));
  const total = poids.reduce((s, p) => s + p, 0);
  if (total <= 0) return null;
  let r = hasard() * total;
  for (let i = 0; i < liste.length; i++) {
    r -= poids[i];
    if (r <= 0) return liste[i];
  }
  return liste[liste.length - 1];
}

/** Fréquences : le jeu peut se permettre d'être plus vivant, le catalogue est profond. */
export const FREQ_ALEA = 0.45;
export const FREQ_OPPORTUNITE = 0.5;

/**
 * Tire une opportunité. Rien tant qu'aucun modèle n'est lancé — recevoir des
 * journalistes avant d'avoir la moindre montre n'avait aucun sens.
 */
export function tirerOpportunite(etat) {
  if (etat.modeles.length === 0) return null;
  if (hasard() > FREQ_OPPORTUNITE) return null;
  const dispo = OPPORTUNITES.filter((o) => o.req(etat));
  const choisie = tirerPondere(dispo, etat);
  return choisie ? choisie.id : null;
}

export function tirerAlea(gs) {
  if (hasard() > FREQ_ALEA) return null;
  return tirerPondere(poolAleas(gs), gs);
}

/**
 * Simule un trimestre complet.
 * @param {object} gs état de la partie
 * @param {number} heuresRestantes heures du fondateur non dépensées → établi
 * @param {{pays: string, profil: string}} ctx
 * @returns {{gs2: object, rap: object, faillite: boolean}}
 */
export function simulateQuarter(gs, heuresRestantes, ctx) {
  const { pays, profil } = ctx;
  let cash = gs.cash;
  let { noto, cred, des, savoir } = gs;
  let employes = { ...gs.employes };
  const segVendues = { ...gs.segVendues };
  const saturation = { ...gs.saturation };
  const lignes = [];
  const messagesDev = [];
  // Faits du trimestre que seul le moteur connaît, transmis au journal.
  const modelesPrets = [];
  let acquis = null;
  let depart = null;
  let ventesBrutes = 0, coutsProd = 0, caDirect = 0;

  // Les effets durables des événements et de la partie, empilés une fois
  // pour tout le trimestre.
  const eff = effetsActifs(gs);

  // Un événement historique remplace l'aléa du trimestre : pas deux chocs à la fois.
  const evtHisto = EVENEMENTS.find((e) => e.annee === gs.annee && e.t === gs.t) || null;
  const alea = evtHisto ? null : tirerAlea(gs);

  // Effet ponctuel de l'événement sur les jauges, le trimestre où il tombe.
  if (evtHisto && evtHisto.immediat) {
    const im = evtHisto.immediat(gs) || {};
    if (im.noto) noto = clamp(noto + im.noto, 0, 100);
    if (im.cred) cred = clamp(cred + im.cred, 0, 100);
    if (im.des) des = clamp(des + im.des, 0, 100);
    if (im.savoir) savoir = clamp(savoir + im.savoir, 0, 100);
  }

  let mProd = 1, mCoutU = 1, mDemande = 1, mCapacite = 1;
  let modeles = gs.modeles.map((m) => ({ ...m }));

  // Effet de l'aléa, appliqué depuis sa description. Les soixante entrées du
  // catalogue partagent le même vocabulaire : plus de chaîne de `if` par id.
  const effetAlea = alea ? (alea.effetSelon ? alea.effetSelon(gs) : alea.effet || {}) : {};
  const modsPoses = [];
  if (alea) {
    const e = effetAlea;
    if (e.noto) noto = clamp(noto + e.noto, 0, 100);
    if (e.cred) cred = clamp(cred + e.cred, 0, 100);
    if (e.des) des = clamp(des + e.des, 0, 100);
    if (e.savoir) savoir = clamp(savoir + e.savoir, 0, 100);
    if (e.cash) cash += e.cash;
    if (e.cashPct) cash += Math.round(cash * e.cashPct);
    if (e.beneficePct) {
      const cumul = gs.journal.reduce((s2, l) => s2 + (l.resultat || 0), 0);
      cash += Math.round(Math.max(0, cumul) * e.beneficePct);
    }
    if (e.prodMult) mProd *= e.prodMult;
    if (e.coutMult) mCoutU *= e.coutMult;
    if (e.demandeMult) mDemande *= e.demandeMult;
    if (e.capMult) mCapacite *= e.capMult;
    if (e.stockMult) modeles = modeles.map((m) => ({ ...m, stock: Math.floor(m.stock * e.stockMult) }));
    if (e.stockPlus) {
      const i = modeles.findIndex((m) => m.statut === "actif");
      if (i >= 0) modeles[i] = { ...modeles[i], stock: modeles[i].stock + e.stockPlus };
    }
    if (e.stockMoins) {
      const i = modeles.findIndex((m) => m.statut === "actif" && m.stock >= e.stockMoins);
      if (i >= 0) modeles[i] = { ...modeles[i], stock: modeles[i].stock - e.stockMoins };
    }
    if (e.devPlus) {
      const i = modeles.findIndex((m) => m.statut === "dev");
      if (i >= 0) modeles[i] = { ...modeles[i], devRestant: modeles[i].devRestant + e.devPlus };
    }
    if (e.fraicheurMalus) {
      const i = modeles.findIndex((m) => m.statut === "actif");
      if (i >= 0) modeles[i] = { ...modeles[i], age: modeles[i].age + Math.round(e.fraicheurMalus * 20) };
    }
    if (e.employeMoins) {
      for (let n = 0; n < e.employeMoins; n++) {
        const postes = Object.keys(employes).filter((k) => employes[k] > 0);
        if (!postes.length) break;
        const parti = pick(postes);
        employes = { ...employes, [parti]: employes[parti] - 1 };
        depart = EMPLOYES[parti].nom;
        messagesDev.push("Départ d'un " + EMPLOYES[parti].nom.toLowerCase() + " : son poste est vacant.");
      }
    }
    if (e.venteDirecte) {
      const { n, prixMult, stockMin } = e.venteDirecte;
      const i = modeles.findIndex((m) => m.statut === "actif" && m.stock >= (stockMin || n));
      if (i >= 0) {
        const prixN = Math.max(50, num(modeles[i].prix));
        caDirect += Math.round(n * prixN * prixMult);
        modeles[i] = { ...modeles[i], stock: modeles[i].stock - n };
      }
    }
    // Effets durables : ils survivent au trimestre et à la sauvegarde.
    for (const mod of alea.mods || []) {
      modsPoses.push({ ...mod, fin: mod.duree == null ? null : trimestreIndex(gs.annee, gs.t) + mod.duree });
    }
  }

  // Heures disponibles : fondateur + équipe de production, corrigée par
  // l'encadrement, plafonnée par les postes de l'atelier.
  const enc = encadrement(employes);
  const capacite = Math.floor(capaciteEffective(gs, eff) * mCapacite);
  const heuresDispo = Math.floor(
    Math.min(heuresRestantes + heuresEmployes(employes) * enc.efficacite, capacite)
  );
  const heuresDemandees = chargeHeures(modeles);
  const capDepassee = heuresDemandees > heuresDispo;
  const scaleCap = capDepassee ? heuresDispo / heuresDemandees : 1;
  let heuresUtilisees = 0;

  const marge = margeMoyenne(gs.canaux);

  modeles = modeles.map((m) => {
    if (m.statut === "dev") {
      const restant = m.devRestant - 1;
      if (restant <= 0) {
        messagesDev.push("« " + m.nom + " » est prêt ! Réglez prix et production.");
        modelesPrets.push(m.nom);
        savoir = clamp(savoir + 2, 0, 100);
        return { ...m, statut: "actif", devRestant: 0 };
      }
      return { ...m, devRestant: restant };
    }

    const prixN = Math.max(50, num(m.prix));
    const prodEff = Math.round(Math.max(0, num(m.prod)) * scaleCap * mProd);
    heuresUtilisees += prodEff * heuresParPiece(m);

    const cU = coutUnitaire(m, { pays, savoir, employes, mult: mCoutU, eff });
    coutsProd += prodEff * cU;

    // L'état courant sert de base à la demande : les jauges déjà modifiées par
    // l'aléa comptent dès ce trimestre.
    const etatDemande = { ...gs, noto, cred, des, saturation, effets: eff };
    let d = demandeBase(m, etatDemande, mDemande);
    if (d > 0) d *= 0.85 + hasard() * 0.3;

    const dispo = m.stock + prodEff;
    const vendues = Math.min(Math.round(d), dispo);
    segVendues[m.seg] += vendues;
    saturation[m.seg] += vendues;
    ventesBrutes += vendues * prixN;
    const stockFinal = dispo - vendues;

    // Rupture de stock = rareté : la désirabilité monte. Surstock : elle baisse.
    if (dispo > 0 && vendues >= dispo) des = clamp(des + 1, 0, 100);
    if (stockFinal > 100 && stockFinal > prodEff * 2) des = clamp(des - 1, 0, 100);
    if (m.finition && vendues > 0) des = clamp(des + 1, 0, 100);

    lignes.push({
      nom: m.nom, seg: m.seg, prod: prodEff, heures: prodEff * heuresParPiece(m),
      demande: Math.round(d), vendues, ca: Math.round(vendues * prixN * marge),
      stock: stockFinal, fraicheur: fraicheur(m.age),
    });
    return { ...m, stock: stockFinal, age: m.age + 1 };
  });

  ventesBrutes += caDirect;
  // Impayés, retours, rappels : une part du chiffre du trimestre s'évapore.
  if (effetAlea.caPct) ventesBrutes = Math.round(ventesBrutes * (1 + effetAlea.caPct));
  const commissions = Math.round(ventesBrutes * (1 - marge));
  const revenus = Math.round(ventesBrutes * marge);

  // La saturation se résorbe : un marché qu'on laisse respirer se rouvre.
  for (const k of Object.keys(saturation)) saturation[k] = Math.round(saturation[k] * SATURATION_DECROISSANCE);

  // Recherche en cours (complication ou matériau).
  let recherche = gs.recherche ? { ...gs.recherche, restant: gs.recherche.restant - 1 } : null;
  let complications = gs.complications;
  let materiaux = gs.materiaux;
  if (recherche && recherche.restant <= 0) {
    if (recherche.type === "materiau") {
      materiaux = { ...materiaux, [recherche.id]: true };
      acquis = { type: "materiau", nom: MATERIAUX[recherche.id].nom };
      messagesDev.push("Matériau maîtrisé : " + MATERIAUX[recherche.id].nom + ". Disponible sur les nouveaux modèles.");
    } else {
      const palier = COMPLICATIONS[recherche.id].niveaux[recherche.niveau - 1];
      complications = { ...complications, [recherche.id]: recherche.niveau };
      acquis = { type: "complication", nom: palier.nom, famille: COMPLICATIONS[recherche.id].nom };
      messagesDev.push(
        "Complication maîtrisée : " + COMPLICATIONS[recherche.id].nom + " niveau " + recherche.niveau +
        " — « " + palier.nom + " ». Disponible sur les nouveaux modèles."
      );
    }
    savoir = clamp(savoir + 3, 0, 100);
    recherche = null;
  }

  // Les heures libres du fondateur sont du temps d'établi : on y apprend.
  const gainSavoir = Math.min(2, Math.floor(Math.max(0, heuresRestantes) / HEURES_PAR_SAVOIR));
  if (gainSavoir > 0) savoir = clamp(savoir + gainSavoir, 0, 100);

  const interets = Math.round((gs.dette * tauxInteret(profil) * eff.interets) / 4);
  const contexteFixes = { employes, ateliers: gs.ateliers, ateliersFixes: gs.ateliersFixes || 0, canaux: gs.canaux, eff };
  const fixes = coutsFixes(contexteFixes);
  const resultat = revenus - coutsProd - fixes - interets;
  cash += resultat;

  // Impôt sur le bénéfice, prélevé au dernier trimestre de l'exercice.
  const beneficeAnnuel = gs.resultatAnnee + resultat;
  const tauxImpot = Math.max(0, IMPOT_TAUX + eff.impotPoints / 100);
  const impot = gs.t === 4 && beneficeAnnuel > 0 ? Math.round(beneficeAnnuel * tauxImpot) : 0;
  cash -= impot;

  // Les canaux qui font vivre l'image.
  for (const [id, n] of Object.entries(gs.canaux)) {
    if (!n) continue;
    if (CANAUX[id].bonusCred) cred = clamp(cred + CANAUX[id].bonusCred, 0, 100);
    if (CANAUX[id].bonusDes) des = clamp(des + CANAUX[id].bonusDes, 0, 100);
  }

  // Déclin naturel des jauges : rien n'est acquis.
  noto = Math.max(0, noto - Math.max(2, Math.round(noto * 0.05)));
  cred = Math.max(0, cred - 1);
  des = Math.max(0, des - 1);

  // Rééquilibrage S2 : la crédibilité se construit aussi passivement.
  const gainsCred = [];
  if (gs.t === 1) {
    if (savoir >= CRED_SAVOIR_SEUIL) {
      cred = clamp(cred + 1, 0, 100);
      gainsCred.push("savoir-faire ≥ " + CRED_SAVOIR_SEUIL);
    }
    const age = gs.annee - ANNEE_DEBUT;
    if (age > 0 && age % CRED_ANCIENNETE_ANS === 0) {
      cred = clamp(cred + 1, 0, 100);
      gainsCred.push(age + " ans d'existence");
    }
  }

  const faillite = cash < -50000;

  // Le récit se construit après coup, une fois les chiffres connus.
  const breve = breveConcurrent(gs.monde || mondeInitial(), gs.faitsMonde || []);

  const rap = {
    annee: gs.annee, t: gs.t, lignes, revenus, ventesBrutes, commissions, marge,
    coutsProd, fixes, interets, impot, resultat, resultatNet: resultat - impot,
    evt: evtHisto,
    alea: alea && effetAlea.verdict ? { ...alea, texte: alea.texte + " " + effetAlea.verdict } : alea,
    cash, capDepassee, gainsCred, gainSavoir,
    detailFixes: detailFixes(contexteFixes),
    heuresUtilisees, heuresDemandees, heuresDispo,
    heuresFondateur: Math.max(0, heuresRestantes),
    heuresEquipe: heuresEmployes(employes),
    encadrement: enc, capacite,
    // Pour le journal.
    modelesPrets, acquis, depart,
    noto, cred, des, savoir, employes,
  };
  rap.journal = journalTrimestre({ rap, gs, actions: gs.actionsTour || [], marque: gs.marque, breve });

  const gs2 = {
    ...gs, cash, modeles, segVendues, saturation, noto, cred, des, savoir, employes,
    complications, materiaux, recherche,
    journal: [...gs.journal, { annee: gs.annee, t: gs.t, revenus, resultat: resultat - impot, cash,
      vendues: lignes.reduce((s2, l) => s2 + l.vendues, 0) }],
    mods: [...nettoyerMods(gs), ...modsPoses],
    // Mémoire courte des tirages : ce qui vient de sortir se raréfie.
    tirages: alea
      ? [{ id: alea.id, q: trimestreIndex(gs.annee, gs.t) },
         ...(gs.tirages || []).filter((r) => r.id !== alea.id)].slice(0, 40)
      : gs.tirages || [],
    // Mémoire de la Gazette : les sujets déjà titrés passent leur tour.
    journalRecent: [...rap.journal.familles.slice(0, 2), ...(gs.journalRecent || [])].slice(0, MEMOIRE_JOURNAL),
    revenusAnnee: gs.revenusAnnee + revenus,
    resultatAnnee: gs.t === 4 ? 0 : beneficeAnnuel,
    messages: messagesDev,
  };
  return { gs2, rap, faillite };
}
