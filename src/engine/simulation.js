import { EVENEMENTS, OPPORTUNITES, poolAleas } from "../data/evenements.js";
import { PAYS, ORIGINES, CAPACITE_DEPART, PA_PAR_TRIMESTRE, ANNEE_DEBUT } from "../data/config.js";
import {
  chargeHeures, clamp, coutUnitaire, coutsFixes, demandeBase, fmtCHF,
  fraicheur, heuresParPiece, num, tauxInteret,
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
    capacite: CAPACITE_DEPART, // en heures d'atelier par trimestre
    employes: 0, ateliers: 0,
    reseau: o.reseau, pa: PA_PAR_TRIMESTRE,
    modeles: [], kickstarterFait: false,
    revenusAnnee: 0, revenusAnneePrec: 0, meilleurRang: 2200,
    segVendues: { grandpublic: 0, lifestyle: 0, connaisseurs: 0, bling: 0 },
    journal: [], opportunite: null,
    messages: [
      "T1 " + ANNEE_DEBUT + " — " + (marque || "Votre marque") + " est née. Capital : " +
      fmtCHF(capital) + (o.dette ? " (dette : " + fmtCHF(o.dette) + ")" : "") + ".",
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
 * @param {number} paRestants PA non dépensés → travail à l'établi
 * @param {{pays: string, profil: string}} ctx
 * @returns {{gs2: object, rap: object, faillite: boolean}}
 */
export function simulateQuarter(gs, paRestants, ctx) {
  const { pays, profil } = ctx;
  let cash = gs.cash;
  let { noto, cred, des, savoir, dist, employes } = gs;
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
    if (alea.id === "demission") { savoir = clamp(savoir - 3, 0, 100); employes = Math.max(0, employes - 1); }
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

  // Capacité : budget d'heures d'atelier. Si la charge dépasse, tout est réduit
  // au prorata (quartz 1 h, ébauche 3 h, manufacture 10 h par pièce).
  const heuresDemandees = chargeHeures(modeles);
  const capDepassee = heuresDemandees > gs.capacite;
  const scaleCap = capDepassee ? gs.capacite / heuresDemandees : 1;
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
    heuresUtilisees += prodEff * heuresParPiece(m.mvt);

    const cU = coutUnitaire(m, { pays, savoir, mult: mCoutU });
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

    lignes.push({
      nom: m.nom, prod: prodEff, heures: prodEff * heuresParPiece(m.mvt),
      demande: Math.round(d), vendues, ca: vendues * prixN,
      stock: stockFinal, fraicheur: fraicheur(m.age),
    });
    return { ...m, stock: stockFinal, age: m.age + 1 };
  });

  revenus += caDirect;

  const interets = Math.round((gs.dette * tauxInteret(profil)) / 4);
  const etabli = Math.min(paRestants, PA_PAR_TRIMESTRE);
  const fixes = coutsFixes({ employes, ateliers: gs.ateliers }, etabli);
  if (etabli > 0) savoir = clamp(savoir + etabli, 0, 100);
  cash = cash - coutsProd - fixes - interets + revenus;

  // Déclin naturel des jauges : rien n'est acquis.
  noto = Math.max(0, noto - Math.max(2, Math.round(noto * 0.05)));
  cred = Math.max(0, cred - 1);
  des = Math.max(0, des - 1);

  const resultat = revenus - coutsProd - fixes - interets;
  const faillite = cash < -50000;

  const rap = {
    annee: gs.annee, t: gs.t, lignes, revenus, coutsProd, fixes, interets, resultat,
    evt: evtHisto, alea, cash, etabli, capDepassee,
    heuresUtilisees, heuresDemandees, capacite: gs.capacite,
  };

  const gs2 = {
    ...gs, cash, modeles, segVendues, noto, cred, des, savoir, dist, employes,
    journal: [...gs.journal, { annee: gs.annee, t: gs.t, revenus, resultat, cash }],
    revenusAnnee: gs.revenusAnnee + revenus,
    messages: messagesDev,
  };
  return { gs2, rap, faillite };
}
