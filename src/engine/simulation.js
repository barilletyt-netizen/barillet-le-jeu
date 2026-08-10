import { EVENEMENTS, OPPORTUNITES, poolAleas } from "../data/evenements.js";
import {
  PAYS, ORIGINES, EMPLOYES, EMPLOYES_VIDE, COMPLICATIONS,
  CAPACITE_DEPART, HEURES_FONDATEUR, HEURES_PAR_SAVOIR, ANNEE_DEBUT,
  CRED_SAVOIR_SEUIL, CRED_ANCIENNETE_ANS,
} from "../data/config.js";
import {
  chargeHeures, clamp, coutUnitaire, coutsFixes, demandeBase, fmtCHF,
  fraicheur, heuresEmployes, heuresParPiece, num, tauxInteret,
} from "./formules.js";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

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
    dist: 5 + o.reseau,
    capacite: CAPACITE_DEPART, // postes d'atelier, en heures par trimestre
    heures: HEURES_FONDATEUR, // heures du fondateur restantes ce trimestre
    employes: { ...EMPLOYES_VIDE },
    ateliers: 0,
    complications: { aucune: 1 }, // id → niveau maîtrisé
    recherche: null, // { id, niveau, restant } — complication en développement
    reseau: o.reseau,
    modeles: [], kickstarterFait: false,
    revenusAnnee: 0, revenusAnneePrec: 0, meilleurRang: 2200,
    segVendues: { grandpublic: 0, lifestyle: 0, connaisseurs: 0, bling: 0 },
    journal: [], opportunite: null,
    messages: [
      "T1 " + ANNEE_DEBUT + " — " + (marque || "Votre marque") + " est née. Capital : " +
      fmtCHF(capital) + (o.dette ? " (dette : " + fmtCHF(o.dette) + ")" : "") +
      ". Vous disposez de " + HEURES_FONDATEUR + " h par trimestre.",
    ],
  };
  etat.opportunite = tirerOpportunite(etat);
  return etat;
}

export function tirerOpportunite(etat) {
  if (Math.random() > 0.45) return null;
  const dispo = OPPORTUNITES.filter((o) => o.req(etat));
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
  let { noto, cred, des, savoir, dist } = gs;
  let employes = { ...gs.employes };
  const segVendues = { ...gs.segVendues };
  const lignes = [];
  const messagesDev = [];
  let revenus = 0, coutsProd = 0, caDirect = 0;

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

  // Heures disponibles : ce qui reste au fondateur + les employés de production,
  // plafonné par les postes de l'atelier. Si la charge dépasse, tout est réduit
  // au prorata.
  const heuresDispo = Math.min(heuresRestantes + heuresEmployes(employes), gs.capacite);
  const heuresDemandees = chargeHeures(modeles);
  const capDepassee = heuresDemandees > heuresDispo;
  const scaleCap = capDepassee ? heuresDispo / heuresDemandees : 1;
  let heuresUtilisees = 0;

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
    const etatDemande = { ...gs, noto, cred, des, dist, segVendues };
    let d = demandeBase(m, etatDemande, mDemande);
    if (d > 0) d *= 0.85 + Math.random() * 0.3;

    const dispo = m.stock + prodEff;
    const vendues = Math.min(Math.round(d), dispo);
    segVendues[m.seg] += vendues;
    revenus += vendues * prixN;
    const stockFinal = dispo - vendues;

    // Rupture de stock = rareté : la désirabilité monte. Surstock : elle baisse.
    if (dispo > 0 && vendues >= dispo) des = clamp(des + 1, 0, 100);
    if (stockFinal > 100 && stockFinal > prodEff * 2) des = clamp(des - 1, 0, 100);
    // Une finition maison qui se vend entretient la désirabilité.
    if (m.finition && vendues > 0) des = clamp(des + 1, 0, 100);

    lignes.push({
      nom: m.nom, prod: prodEff, heures: prodEff * heuresParPiece(m),
      demande: Math.round(d), vendues, ca: vendues * prixN,
      stock: stockFinal, fraicheur: fraicheur(m.age),
    });
    return { ...m, stock: stockFinal, age: m.age + 1 };
  });

  revenus += caDirect;

  // Recherche de complication en cours.
  let recherche = gs.recherche ? { ...gs.recherche, restant: gs.recherche.restant - 1 } : null;
  let complications = gs.complications;
  if (recherche && recherche.restant <= 0) {
    const palier = COMPLICATIONS[recherche.id].niveaux[recherche.niveau - 1];
    complications = { ...complications, [recherche.id]: recherche.niveau };
    messagesDev.push(
      "Complication maîtrisée : " + COMPLICATIONS[recherche.id].nom + " niveau " + recherche.niveau +
      " — « " + palier.nom + " ». Disponible sur les nouveaux modèles."
    );
    savoir = clamp(savoir + 3, 0, 100);
    recherche = null;
  }

  // Les heures libres du fondateur sont du temps d'établi : on y apprend.
  const gainSavoir = Math.min(2, Math.floor(Math.max(0, heuresRestantes) / HEURES_PAR_SAVOIR));
  if (gainSavoir > 0) savoir = clamp(savoir + gainSavoir, 0, 100);

  const interets = Math.round((gs.dette * tauxInteret(profil)) / 4);
  const fixes = coutsFixes({ employes, ateliers: gs.ateliers });
  cash = cash - coutsProd - fixes - interets + revenus;

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

  const resultat = revenus - coutsProd - fixes - interets;
  const faillite = cash < -50000;

  const rap = {
    annee: gs.annee, t: gs.t, lignes, revenus, coutsProd, fixes, interets, resultat,
    evt: evtHisto, alea, cash, capDepassee, gainsCred, gainSavoir,
    heuresUtilisees, heuresDemandees, heuresDispo,
    heuresFondateur: Math.max(0, heuresRestantes),
    heuresEquipe: heuresEmployes(employes),
    capacite: gs.capacite,
  };

  const gs2 = {
    ...gs, cash, modeles, segVendues, noto, cred, des, savoir, dist, employes,
    complications, recherche,
    journal: [...gs.journal, { annee: gs.annee, t: gs.t, revenus, resultat, cash }],
    revenusAnnee: gs.revenusAnnee + revenus,
    messages: messagesDev,
  };
  return { gs2, rap, faillite };
}
