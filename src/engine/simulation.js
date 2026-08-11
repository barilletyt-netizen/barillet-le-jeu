import { EVENEMENTS, OPPORTUNITES, poolAleas } from "../data/evenements.js";
import {
  PAYS, ORIGINES, EMPLOYES, EMPLOYES_VIDE, COMPLICATIONS, MATERIAUX, CANAUX, CANAUX_VIDE,
  CAPACITE_DEPART, HEURES_FONDATEUR, HEURES_PAR_SAVOIR, ANNEE_DEBUT,
  CRED_SAVOIR_SEUIL, CRED_ANCIENNETE_ANS, SATURATION_DECROISSANCE, IMPOT_TAUX,
} from "../data/config.js";
import {
  chargeHeures, clamp, coutUnitaire, coutsFixes, demandeBase, encadrement, fmtCHF,
  fraicheur, heuresEmployes, heuresParPiece, margeMoyenne, num, tauxInteret,
} from "./formules.js";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const SEGMENTS_VIDE = { grandpublic: 0, lifestyle: 0, connaisseurs: 0, bling: 0 };

export function etatInitial({ pays, profil, origine, marque }) {
  const p = PAYS[pays];
  const o = ORIGINES[origine];
  const capital = Math.round(o.capital * (profil === "financier" ? 1.5 : 1));
  const etat = {
    annee: ANNEE_DEBUT, t: 1,
    cash: capital, dette: o.dette,
    noto: 2 + o.reseau,
    cred: Math.max(0, o.cred + p.credBonus),
    des: 5,
    savoir: 5 + p.savoirBonus + (profil === "artisan" ? 10 : 0),
    capacite: CAPACITE_DEPART, // postes d'atelier, en heures par trimestre
    heures: HEURES_FONDATEUR, // heures du fondateur restantes ce trimestre
    employes: { ...EMPLOYES_VIDE },
    ateliers: 0,
    canaux: { ...CANAUX_VIDE }, // id → palier ouvert
    complications: { aucune: 1 }, // id → niveau maîtrisé
    materiaux: { acier: true }, // id → maîtrisé
    recherche: null, // { type, id, niveau, restant }
    reseau: o.reseau,
    modeles: [], kickstarterFait: false,
    revenusAnnee: 0, revenusAnneePrec: 0, resultatAnnee: 0, meilleurRang: 2200,
    saturation: { ...SEGMENTS_VIDE }, // ventes récentes, se résorbent chaque trimestre
    segVendues: { ...SEGMENTS_VIDE }, // cumul, pour les statistiques
    journal: [], opportunite: null, oppRecentes: [],
    messages: [
      "T1 " + ANNEE_DEBUT + " — " + (marque || "Votre marque") + " est née. Capital : " +
      fmtCHF(capital) + (o.dette ? " (dette : " + fmtCHF(o.dette) + ")" : "") +
      ". Vous disposez de " + HEURES_FONDATEUR + " h par trimestre.",
    ],
  };
  etat.opportunite = tirerOpportunite(etat);
  return etat;
}

/**
 * Tire une opportunité. Rien tant qu'aucun modèle n'est lancé — recevoir des
 * journalistes avant d'avoir la moindre montre n'avait aucun sens. Et on ne
 * repropose pas ce qui vient de passer.
 */
export function tirerOpportunite(etat) {
  if (etat.modeles.length === 0) return null;
  if (Math.random() > 0.4) return null;
  const recentes = etat.oppRecentes || [];
  let dispo = OPPORTUNITES.filter((o) => o.req(etat) && !recentes.includes(o.id));
  if (dispo.length === 0) dispo = OPPORTUNITES.filter((o) => o.req(etat));
  return dispo.length ? pick(dispo).id : null;
}

export function tirerAlea(gs) {
  if (Math.random() > 0.4) return null;
  return pick(poolAleas(gs));
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
  let ventesBrutes = 0, coutsProd = 0, caDirect = 0;

  // Un événement historique remplace l'aléa du trimestre : pas deux chocs à la fois.
  const evtHisto = EVENEMENTS.find((e) => e.annee === gs.annee && e.t === gs.t) || null;
  const alea = evtHisto ? null : tirerAlea(gs);

  let mProd = 1, mCoutU = 1, mDemande = 1;
  let modeles = gs.modeles.map((m) => ({ ...m }));

  if (alea) {
    if (alea.id === "retard") mProd = 0.5;
    if (alea.id === "chf") mCoutU = 1.12;
    if (alea.id === "celebrite") { noto = clamp(noto + 6, 0, 100); des = clamp(des + 5, 0, 100); }
    if (alea.id === "contrefacon") { des = clamp(des - 5, 0, 100); mDemande *= 0.9; }
    if (alea.id === "article") cred = clamp(cred + 4, 0, 100);
    if (alea.id === "cambriolage") { modeles = modeles.map((m) => ({ ...m, stock: Math.floor(m.stock * 0.7) })); cash -= 10000; }
    if (alea.id === "demission") {
      savoir = clamp(savoir - 3, 0, 100);
      const postes = Object.keys(employes).filter((k) => employes[k] > 0);
      if (postes.length) {
        const parti = pick(postes);
        employes = { ...employes, [parti]: employes[parti] - 1 };
        messagesDev.push("Départ d'un " + EMPLOYES[parti].nom.toLowerCase() + " : son poste est vacant.");
      }
    }
    if (alea.id === "tiktok") { noto = clamp(noto + 8, 0, 100); cred = clamp(cred - 1, 0, 100); }
    if (alea.id === "recession") mDemande *= 0.8;
    if (alea.id === "collectionneur") {
      const idx = modeles.findIndex((m) => m.stock > 15);
      if (idx >= 0) {
        const prixN = Math.max(50, num(modeles[idx].prix));
        caDirect += Math.round(15 * prixN * 1.2);
        modeles[idx].stock -= 15;
      }
    }
  }

  // Heures disponibles : fondateur + équipe de production, corrigée par
  // l'encadrement, plafonnée par les postes de l'atelier.
  const enc = encadrement(employes);
  const heuresDispo = Math.floor(
    Math.min(heuresRestantes + heuresEmployes(employes) * enc.efficacite, gs.capacite)
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
        savoir = clamp(savoir + 2, 0, 100);
        return { ...m, statut: "actif", devRestant: 0 };
      }
      return { ...m, devRestant: restant };
    }

    const prixN = Math.max(50, num(m.prix));
    const prodEff = Math.round(Math.max(0, num(m.prod)) * scaleCap * mProd);
    heuresUtilisees += prodEff * heuresParPiece(m);

    const cU = coutUnitaire(m, { pays, savoir, employes, mult: mCoutU });
    coutsProd += prodEff * cU;

    // L'état courant sert de base à la demande : les jauges déjà modifiées par
    // l'aléa comptent dès ce trimestre.
    const etatDemande = { ...gs, noto, cred, des, saturation };
    let d = demandeBase(m, etatDemande, mDemande);
    if (d > 0) d *= 0.85 + Math.random() * 0.3;

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
      nom: m.nom, prod: prodEff, heures: prodEff * heuresParPiece(m),
      demande: Math.round(d), vendues, ca: Math.round(vendues * prixN * marge),
      stock: stockFinal, fraicheur: fraicheur(m.age),
    });
    return { ...m, stock: stockFinal, age: m.age + 1 };
  });

  ventesBrutes += caDirect;
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
      messagesDev.push("Matériau maîtrisé : " + MATERIAUX[recherche.id].nom + ". Disponible sur les nouveaux modèles.");
    } else {
      const palier = COMPLICATIONS[recherche.id].niveaux[recherche.niveau - 1];
      complications = { ...complications, [recherche.id]: recherche.niveau };
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

  const interets = Math.round((gs.dette * tauxInteret(profil)) / 4);
  const fixes = coutsFixes({ employes, ateliers: gs.ateliers, canaux: gs.canaux });
  const resultat = revenus - coutsProd - fixes - interets;
  cash += resultat;

  // Impôt sur le bénéfice, prélevé au dernier trimestre de l'exercice.
  const beneficeAnnuel = gs.resultatAnnee + resultat;
  const impot = gs.t === 4 && beneficeAnnuel > 0 ? Math.round(beneficeAnnuel * IMPOT_TAUX) : 0;
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

  const rap = {
    annee: gs.annee, t: gs.t, lignes, revenus, ventesBrutes, commissions, marge,
    coutsProd, fixes, interets, impot, resultat, resultatNet: resultat - impot,
    evt: evtHisto, alea, cash, capDepassee, gainsCred, gainSavoir,
    heuresUtilisees, heuresDemandees, heuresDispo,
    heuresFondateur: Math.max(0, heuresRestantes),
    heuresEquipe: heuresEmployes(employes),
    encadrement: enc, capacite: gs.capacite,
  };

  const gs2 = {
    ...gs, cash, modeles, segVendues, saturation, noto, cred, des, savoir, employes,
    complications, materiaux, recherche,
    journal: [...gs.journal, { annee: gs.annee, t: gs.t, revenus, resultat: resultat - impot, cash }],
    revenusAnnee: gs.revenusAnnee + revenus,
    resultatAnnee: gs.t === 4 ? 0 : beneficeAnnuel,
    messages: messagesDev,
  };
  return { gs2, rap, faillite };
}
