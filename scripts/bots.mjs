/**
 * Bots stratèges — outil d'équilibrage permanent.
 *
 *   npm run bots              # les 4 stratégies, 10 graines chacune
 *   npm run bots -- --seeds 20
 *   npm run bots -- --trace   # + la courbe année par année du premier run
 *
 * Diagnostic de beta à corriger : la stratégie « prix maximaux » domine, les
 * jauges d'image ne servent à rien, et le Top 50 tombe en 8 ans au lieu de ~40.
 *
 * Critères de validation (§ Phase B) :
 *   1. aucun bot ne domine — écart d'année d'entrée au Top 50 < 10 ans entre
 *      les stratégies viables ;
 *   2. aucun bot n'entre au Top 50 avant 2040 ;
 *   3. l'Équilibré ne fait jamais faillite.
 */
import { etatInitial, simulateQuarter, tirerOpportunite } from "../src/engine/simulation.js";
import * as F from "../src/engine/formules.js";
import * as C from "../src/data/config.js";
import * as M from "../src/data/monde.js";
import { graine, hasard } from "../src/engine/alea.js";
import { trimestreIndex } from "../src/engine/effets.js";
import { EVENEMENTS, PROPOSITIONS } from "../src/data/evenements.js";

const arg = (nom, defaut) => {
  const i = process.argv.indexOf("--" + nom);
  return i >= 0 && process.argv[i + 1] ? Number(process.argv[i + 1]) : defaut;
};
const NB_SEEDS = arg("seeds", 10);
const TRACE = process.argv.includes("--trace");

/** Option de texte : `--pays chine`, `--sans bns`, `--bot Équilibré`. */
const argTxt = (nom, defaut) => {
  const i = process.argv.indexOf("--" + nom);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : defaut;
};
const PAYS = argTxt("pays", "suisse");
const SANS = argTxt("sans", null);
const SEUL = argTxt("bot", null);
const MAX_GAMME = arg("gamme", 99);

// ---- Briques communes -----------------------------------------------------

const actifs = (g) => g.modeles.filter((m) => m.statut === "actif");

function lancerModele(g, ctx, { mvt, seg, style = "sport", mat = "acier", compls = [] }) {
  const cout = F.coutRD(mvt, ctx.profil);
  const heures = F.heuresRD(C.COUTS_H.rd, g.employes);
  if (g.cash < cout || g.heures < heures) return g;
  const liste = compls.filter((id) => (g.complications[id] || 0) > 0).map((id) => ({ id, niveau: g.complications[id] }));
  return {
    ...g, cash: g.cash - cout, heures: g.heures - heures,
    modeles: [...g.modeles, {
      nom: seg + "-" + g.modeles.length, mvt, seg, style, materiau: mat,
      compls: liste, finition: false, prix: "",
      qual: F.qualiteNouveau(mvt, { pays: ctx.pays, profil: ctx.profil, savoir: g.savoir, compls: liste }),
      prod: 0, stock: 0, age: 0, statut: "dev",
      devRestant: F.dureeDev(mvt, ctx.profil, g.employes),
    }],
  };
}

/**
 * Fixe le prix d'un modèle en multiple du prix acceptable réel.
 *
 * Les bots recalculaient auparavant leur propre repère, sans la qualité, sans
 * la crédibilité et sans les événements d'époque : ils étaient aveugles à tout
 * ce qui déplace le prix acceptable, et l'équilibrage jauges/prix se mesurait
 * donc à côté. On tarife maintenant sur la même fonction que le moteur.
 */
function tarifer(g, facteur) {
  return {
    ...g,
    modeles: g.modeles.map((m) =>
      m.statut !== "actif" || m.prix ? m : { ...m, prix: Math.round(F.prixAcceptable(m, g) * facteur) }
    ),
  };
}

const embaucher = (g, poste) =>
  g.heures < F.coutHeures("embauche", g) ? g : {
    ...g,
    heures: g.heures - F.coutHeures("embauche", g),
    employes: { ...g.employes, [poste]: g.employes[poste] + 1 },
    savoir: F.clamp(g.savoir + C.EMPLOYES[poste].savoir, 0, 100),
  };

const emprunter = (g) =>
  g.heures < C.COUTS_H.emprunt ? g : {
    ...g, heures: g.heures - C.COUTS_H.emprunt,
    cash: g.cash + C.COUTS_CHF.emprunt, dette: g.dette + C.COUTS_CHF.emprunt,
  };

const marketing = (g, ctx) =>
  g.heures < C.COUTS_H.marketing || g.cash < C.COUTS_CHF.marketing ? g : {
    ...g, heures: g.heures - C.COUTS_H.marketing, cash: g.cash - C.COUTS_CHF.marketing,
    noto: F.clamp(g.noto + F.gainMarketing(g, ctx.pays), 0, 100),
  };

const presse = (g) =>
  g.heures < C.COUTS_H.presse ? g : {
    ...g, heures: g.heures - C.COUTS_H.presse,
    cred: F.clamp(g.cred + 2, 0, 100), noto: F.clamp(g.noto + 1, 0, 100),
  };

const totalDemande = (g) => actifs(g).reduce((s, m) => s + F.estimerDemande(m, g), 0);

/**
 * Réajuste les prix à chaque tour : la qualité et la crédibilité montent, donc
 * le prix acceptable aussi. Un bot qui fixe son prix une fois pour toutes se
 * sous-vend après dix ans.
 */
function retarifer(g, facteur) {
  return {
    ...g,
    modeles: g.modeles.map((m) =>
      m.statut !== "actif" ? m : { ...m, prix: Math.round(F.prixAcceptable(m, g) * facteur) }
    ),
  };
}

/** Un modèle qui vieillit perd sa demande : on le rafraîchit quand c'est rentable. */
function faceliftSiUtile(g, ctx, seuilCash) {
  const i = g.modeles.findIndex((m) => m.statut === "actif" && F.fraicheur(m.age) < 0.62);
  if (i < 0 || g.heures < C.COUTS_H.facelift) return g;
  const cout = F.coutFacelift(g.modeles[i], ctx.profil);
  if (g.cash < cout + seuilCash) return g;
  return {
    ...g, heures: g.heures - C.COUTS_H.facelift, cash: g.cash - cout,
    modeles: g.modeles.map((m, j) => (j === i ? { ...m, age: 0 } : m)),
  };
}

/**
 * Plancher de notoriété. La cible monte avec la trésorerie : une marque qui
 * gagne de l'argent continue d'investir son image, elle ne s'arrête pas à un
 * palier arbitraire.
 */
function entretenirImage(g, ctx, { notoCible, presseAussi = false }) {
  const cible = Math.min(100, notoCible + (g.cash > 3000000 ? 25 : g.cash > 800000 ? 12 : 0));
  if (g.noto < cible) g = marketing(g, ctx);
  if (presseAussi && g.cred < (g.cash > 2000000 ? 30 : 14)) g = presse(g);
  return g;
}

/**
 * Élargit la gamme quand la trésorerie le permet largement. Chaque segment a
 * son plafond de saturation : la seule façon de continuer à croître est
 * d'ouvrir de nouvelles lignes, comme le ferait un joueur.
 */
function elargirGamme(g, ctx, planBrut) {
  // `--gamme N` plafonne la largeur de gamme : c'est ainsi qu'on mesure si
  // huit références valent réellement plus que deux.
  const plan = planBrut.slice(0, MAX_GAMME);
  const rang = g.modeles.length;
  const suivant = plan[rang];
  if (!suivant) return g;
  // Le premier modèle n'attend pas : sans produit, il n'y a pas de partie.
  // Les suivants demandent une trésorerie croissante.
  const seuil = rang === 0 ? 0 : 400000 * Math.pow(2.1, rang - 1);
  if (g.cash < seuil) return g;
  return lancerModele(g, ctx, suivant);
}

/** Capacité : embaucher tant qu'il reste des postes, agrandir quand ils manquent. */
function croitre(g, seuil) {
  let boucle = 0;
  while (totalDemande(g) > F.heuresProductionDispo(g) * 1.05 && g.heures >= C.COUTS_H.embauche && boucle++ < 8) {
    const libres =
      g.capacite - g.heures - F.heuresEmployes(g.employes) * F.encadrement(g.employes).efficacite;
    if (F.encadrement(g.employes).manque > 0 && g.cash > seuil) { g = embaucher(g, "chef"); continue; }
    if (libres >= C.HEURES_EMPLOYE * 0.5 && g.cash > seuil) { g = embaucher(g, "horloger"); continue; }
    // On prend la halle si on peut se la payer, sinon le petit palier : c'est
    // ce qui permet à une stratégie de volume de monter par petits pas.
    const grand = C.ATELIERS.grand, petit = C.ATELIERS.petit;
    const choix =
      g.cash > grand.cout + seuil ? grand : g.cash > petit.cout + seuil ? petit : null;
    const hAgrandir = F.aDirecteur(g, "production") ? C.HEURES_DELEGUEES : choix && choix.heuresAction;
    if (choix && g.heures >= hAgrandir) {
      g = { ...g, heures: g.heures - hAgrandir, cash: g.cash - choix.cout,
        ateliers: g.ateliers + 1, ateliersFixes: (g.ateliersFixes || 0) + choix.fixes,
        capacite: g.capacite + choix.heures };
      continue;
    }
    break;
  }
  return g;
}

/**
 * Recrute la direction dès que la maison peut se la payer, et engage la
 * manufacture quand l'atelier sature. C'est le troisième acte : sans lui, une
 * marque riche reste bloquée par les heures du fondateur.
 */
function diriger(g, ctx, seuil = 400000) {
  for (const role of ["production", "commercial", "rh", "marketing", "dsi", "financier"]) {
    const d = F.directeurRecrutable(g, role);
    if (d && !C.DIRECTEUR_CONDITION[role].ok(g)) continue;
    // Un salaire de direction se juge sur douze trimestres, pas sur un.
    if (d && d.ok && g.cash > seuil + d.fixes * 12 && g.heures >= 40) {
      g = { ...g, heures: g.heures - 40, directeurs: { ...(g.directeurs || {}), [role]: true } };
    }
  }
  // La manufacture : un pari, donc on ne l'engage qu'avec de la marge.
  const m = C.ATELIERS.manufacture;
  const h = F.aDirecteur(g, "production") ? C.HEURES_DELEGUEES : m.heuresAction;
  if (F.aDirecteur(g, "production") && !g.chantier && g.cash > m.cout + seuil * 4 && g.heures >= h) {
    g = { ...g, heures: g.heures - h, cash: g.cash - m.cout,
      chantier: { restant: m.delai, heures: m.heures, fixes: m.fixes } };
  }
  return g;
}

/** Ouvre le prochain canal, en privilégiant la portée ou la marge. */
function ouvrirCanal(g, { privilegieMarge = false, seuil = 150000 } = {}) {
  const ouvrables = F.canauxOuvrables(g)
    .filter((c) => c.manque.length === 0 && g.cash > c.cout + seuil && g.heures >= c.heures)
    .sort((a, b) =>
      privilegieMarge
        ? C.CANAUX[b.id].marge - C.CANAUX[a.id].marge || b.portee - a.portee
        : b.portee - a.portee
    );
  const c = ouvrables[0];
  if (!c) return g;
  return { ...g, heures: g.heures - c.heures, cash: g.cash - c.cout, canaux: { ...g.canaux, [c.id]: c.niveau } };
}

function rechercher(g, ctx, { seuil = 3 } = {}) {
  if (g.recherche) return g;
  const paliers = [...F.complicationsRecherchables(g, ctx.profil), ...F.materiauxRecherchables(g)];
  for (const p of paliers) {
    const h = F.heuresRD(p.rdHeures, g.employes);
    if (!p.bloque && g.heures >= h && g.cash > p.rd * seuil) {
      return { ...g, heures: g.heures - h, cash: g.cash - p.rd,
        recherche: { type: p.type, id: p.id, niveau: p.niveau || 1, restant: Math.max(1, p.dev) } };
    }
  }
  return g;
}

/** Production alignée sur la demande estimée, répartie au prorata. */
function produire(g) {
  const liste = actifs(g);
  if (!liste.length) return g;
  const dispo = F.heuresProductionDispo(g);
  const voulu = liste.map((m) => Math.max(0, F.estimerDemande(m, g) - m.stock));
  const heures = liste.reduce((s, m, i) => s + voulu[i] * F.heuresParPiece(m), 0);
  const f = heures > dispo && heures > 0 ? dispo / heures : 1;
  let i = 0;
  return {
    ...g,
    modeles: g.modeles.map((m) => (m.statut === "actif" ? { ...m, prod: Math.floor(voulu[i++] * f) } : m)),
  };
}

// ---- Les quatre stratégies ------------------------------------------------

/** Le Margeur : prix très au-dessus du repère, petits volumes, montée en gamme. */
function margeur(g, ctx) {
  if (g.cash < 120000) g = emprunter(g);
  // Le margeur ne dépense en image que le strict nécessaire pour exister.
  g = entretenirImage(g, ctx, { notoCible: 28 });
  g = elargirGamme(g, ctx, [
    { mvt: "ebauche", seg: "connaisseurs" },
    { mvt: "ebauche", seg: "bling" },
    { mvt: "ebauche", seg: "bling", compls: ["chrono", "date"] },
    { mvt: "ebauche", seg: "connaisseurs", style: "dress", compls: ["date"] },
    { mvt: "ebauche", seg: "bling", style: "squelette", compls: ["chrono", "gmt"] },
    { mvt: "ebauche", seg: "connaisseurs", style: "plongeuse" },
    { mvt: "ebauche", seg: "bling", style: "dress" },
    { mvt: "ebauche", seg: "connaisseurs", style: "squelette" },
  ]);
  // 1,20× le prix acceptable : le prix premium qu'un joueur avisé tient
  // vraiment. Au-delà (1,35×), l'élasticité ne laisse plus rien à vendre —
  // ce n'est plus une stratégie, c'est une erreur.
  g = tarifer(g, 1.2);
  g = retarifer(g, 1.2);
  g = faceliftSiUtile(g, ctx, 150000);
  g = rechercher(g, ctx);
  g = ouvrirCanal(g, { privilegieMarge: true });
  g = diriger(g, ctx);
  g = croitre(g, 200000);
  return produire(g);
}

/** Le Volumiste : prix bas, portée maximale, capacité avant tout. */
function volumiste(g, ctx) {
  if (g.cash < 150000) g = emprunter(g);
  // Le volume a besoin d'être connu : la notoriété est son carburant.
  g = entretenirImage(g, ctx, { notoCible: 55 });
  g = elargirGamme(g, ctx, [
    { mvt: "quartz", seg: "grandpublic" },
    { mvt: "quartz", seg: "lifestyle" },
    { mvt: "quartz", seg: "grandpublic", style: "plongeuse" },
    { mvt: "ebauche", seg: "lifestyle" },
    { mvt: "quartz", seg: "grandpublic", style: "dress" },
    { mvt: "quartz", seg: "lifestyle", style: "sport" },
    { mvt: "quartz", seg: "lifestyle", style: "plongeuse" },
    { mvt: "ebauche", seg: "grandpublic" },
  ]);
  g = tarifer(g, 0.8);
  g = retarifer(g, 0.8);
  g = faceliftSiUtile(g, ctx, 120000);
  g = ouvrirCanal(g, { seuil: 120000 });
  g = diriger(g, ctx, 300000);
  g = croitre(g, 150000);
  return produire(g);
}

/** Le Prestigieux : jauges d'abord, prix ensuite. */
function prestigieux(g, ctx) {
  if (g.cash < 150000) g = emprunter(g);
  g = entretenirImage(g, ctx, { notoCible: 65, presseAussi: true });
  g = elargirGamme(g, ctx, [
    { mvt: "ebauche", seg: "connaisseurs" },
    { mvt: "ebauche", seg: "connaisseurs", style: "dress" },
    { mvt: "ebauche", seg: "bling" },
    { mvt: "ebauche", seg: "connaisseurs", style: "plongeuse", compls: ["date"] },
    { mvt: "ebauche", seg: "bling", style: "squelette", compls: ["chrono"] },
    { mvt: "ebauche", seg: "lifestyle" },
    { mvt: "ebauche", seg: "connaisseurs", style: "sport" },
    { mvt: "ebauche", seg: "bling", style: "dress" },
  ]);
  g = tarifer(g, 1.1);
  g = retarifer(g, 1.1);
  g = faceliftSiUtile(g, ctx, 200000);
  g = rechercher(g, ctx, { seuil: 2 });
  g = ouvrirCanal(g, { privilegieMarge: true });
  g = diriger(g, ctx);
  g = croitre(g, 200000);
  return produire(g);
}

/** L'Équilibré : un peu de tout, prudent sur la trésorerie. */
function equilibre(g, ctx) {
  if (g.cash < 120000) g = emprunter(g);
  g = entretenirImage(g, ctx, { notoCible: 45, presseAussi: true });
  g = elargirGamme(g, ctx, [
    { mvt: "quartz", seg: "grandpublic" },
    { mvt: "quartz", seg: "lifestyle" },
    { mvt: "ebauche", seg: "connaisseurs" },
    { mvt: "quartz", seg: "grandpublic", style: "plongeuse" },
    { mvt: "ebauche", seg: "bling" },
    { mvt: "ebauche", seg: "lifestyle", style: "dress" },
    { mvt: "quartz", seg: "lifestyle", style: "squelette" },
    { mvt: "ebauche", seg: "connaisseurs", style: "plongeuse" },
    // Au-delà de huit, on décline dans des gammes déjà occupées : c'est là que
    // la cannibalisation doit se voir, et c'est ce qu'on veut mesurer.
    { mvt: "quartz", seg: "grandpublic", style: "dress" },
    { mvt: "ebauche", seg: "connaisseurs", style: "squelette" },
    { mvt: "quartz", seg: "lifestyle", style: "sport" },
    { mvt: "ebauche", seg: "bling", style: "dress" },
    { mvt: "quartz", seg: "grandpublic", style: "sport" },
    { mvt: "ebauche", seg: "lifestyle", style: "plongeuse" },
  ]);
  g = tarifer(g, 1.0);
  g = retarifer(g, 1.0);
  g = faceliftSiUtile(g, ctx, 150000);
  g = rechercher(g, ctx);
  g = ouvrirCanal(g);
  g = diriger(g, ctx);
  g = croitre(g, 200000);
  return produire(g);
}

const BOTS = [
  { nom: "Margeur", jouer: margeur },
  { nom: "Volumiste", jouer: volumiste },
  { nom: "Prestigieux", jouer: prestigieux },
  { nom: "Équilibré", jouer: equilibre },
];

// ---- Boucle de partie -----------------------------------------------------

/**
 * Mesure pauvre des opportunités : pas de moteur d'arbitrage, deux extrêmes.
 * `politique` vaut "tout" (accepter systématiquement ce qui est finançable),
 * "rien" (refuser), ou null (ne rien tirer du tout — le comportement d'origine).
 * L'écart entre les deux borne ce que les opportunités valent, et une
 * bissection par catégorie puis par entrée désigne les coupables.
 */
function appliquerOpportunite(g, ctx, filtre) {
  const opp = PROPOSITIONS.find((o) => o.id === g.opportunite);
  if (!opp) return { ...g, opportunite: null };
  if (filtre && !filtre(opp)) return refuserOpportunite(g);
  if (g.heures < opp.heures || g.cash < opp.cout) return refuserOpportunite(g);

  const e = opp.tirage ? opp.tirage(hasard()) : opp.effet || {};
  const etat = {
    ...g, opportunite: null, heures: g.heures - opp.heures, cash: g.cash - opp.cout,
    oppFaites: [...(g.oppFaites || []), opp.id],
  };
  const q = trimestreIndex(g.annee, g.t);
  if (e.noto) etat.noto = F.clamp(g.noto + e.noto, 0, 100);
  if (e.cred) etat.cred = F.clamp(g.cred + e.cred, 0, 100);
  if (e.des) etat.des = F.clamp(g.des + e.des, 0, 100);
  if (e.savoir) etat.savoir = F.clamp(g.savoir + e.savoir, 0, 100);
  if (e.cash) etat.cash += e.cash;
  if (e.dette) etat.dette = g.dette + e.dette;
  if (e.capacitePlus) etat.capacite = g.capacite + e.capacitePlus;
  if (e.presseAchetee) etat.presseAchetee = (g.presseAchetee || 0) + e.presseAchetee;
  if (e.engagementVolume) etat.engagementVolume = true;
  if (e.atelierPlus) {
    etat.ateliers = g.ateliers + e.atelierPlus;
    etat.ateliersFixes = (g.ateliersFixes || 0) + C.ATELIERS.grand.fixes * e.atelierPlus;
    etat.capacite = (etat.capacite || g.capacite) + C.ATELIERS.grand.heures * e.atelierPlus;
  }
  if (e.employePlus) etat.employes = { ...g.employes, horloger: g.employes.horloger + e.employePlus };
  if (e.canalPalier) {
    const n = g.canaux[e.canalPalier] || 0;
    if (n > 0 && n < C.CANAUX[e.canalPalier].paliers.length) {
      etat.canaux = { ...g.canaux, [e.canalPalier]: n + 1 };
    }
  }
  if (e.ecoulerStock) {
    let reste = e.ecoulerStock.max || Infinity, encaisse = 0;
    etat.modeles = g.modeles.map((m) => {
      if (m.statut !== "actif" || m.stock <= 0 || reste <= 0) return m;
      const n = Math.min(m.stock, reste);
      reste -= n;
      encaisse += Math.round(n * Math.max(50, Number(m.prix) || 0) * e.ecoulerStock.prixMult * F.margeMoyenne(g.canaux));
      return { ...m, stock: m.stock - n };
    });
    etat.cash += encaisse;
    etat.revenusAnnee = g.revenusAnnee + encaisse;
  }
  if (e.mods) {
    etat.mods = [
      ...(g.mods || []),
      ...e.mods.map((mod) => ({ ...mod, fin: mod.duree == null ? null : q + mod.duree })),
    ];
  }
  return etat;
}

/** Refuser n'est pas neutre partout : le label perdu se paie. */
function refuserOpportunite(g) {
  const opp = PROPOSITIONS.find((o) => o.id === g.opportunite);
  const etat = { ...g, opportunite: null, oppFaites: opp ? [...(g.oppFaites || []), opp.id] : g.oppFaites };
  const r = opp && opp.effetRefus;
  if (!r) return etat;
  if (r.cred) etat.cred = F.clamp(g.cred + r.cred, 0, 100);
  if (r.des) etat.des = F.clamp(g.des + r.des, 0, 100);
  if (r.noto) etat.noto = F.clamp(g.noto + r.noto, 0, 100);
  if (r.mods) {
    const q = trimestreIndex(g.annee, g.t);
    etat.mods = [
      ...(g.mods || []),
      ...r.mods.map((mod) => ({ ...mod, fin: mod.duree == null ? null : q + mod.duree })),
    ];
  }
  return etat;
}

function partie(bot, seed, ctx, origine, politique = null, filtre = null) {
  graine(seed);
  let g = etatInitial({ ...ctx, origine, marque: bot.nom });
  const courbe = [];
  let anneeTop50 = null;
  let faillite = false;

  while (g.annee <= C.ANNEE_FIN) {
    if (politique === "tout") g = appliquerOpportunite(g, ctx, filtre);
    else if (politique === "rien") g = refuserOpportunite(g);
    g = bot.jouer(g, ctx);
    const { gs2, rap, faillite: mort } = simulateQuarter(g, g.heures, ctx);
    if (mort) { faillite = true; courbe.push({ annee: g.annee, ca: gs2.revenusAnnee, rang: M.RANG_MAX }); break; }
    g = { ...gs2 };
    if (g.t >= 4) {
      const rang = M.rangPour(g.revenusAnnee, g.annee);
      courbe.push({
        annee: g.annee, ca: g.revenusAnnee, rang, cash: rap.cash, equipe: F.nbEmployes(g.employes),
        // De quoi diagnostiquer un plafond : est-ce l'atelier, le marché ou la caisse ?
        heuresUtilisees: rap.heuresUtilisees, capacite: rap.capacite, heuresDispo: rap.heuresDispo,
        saturation: { ...g.saturation }, ateliers: g.ateliers, dette: g.dette,
      });
      if (rang <= 50 && anneeTop50 === null) anneeTop50 = g.annee;
      g.revenusAnneePrec = g.revenusAnnee;
      g.revenusAnnee = 0;
      g.annee += 1;
      g.t = 1;
    } else g.t += 1;
    g.heures = C.HEURES_FONDATEUR;
    if (politique) g.opportunite = tirerOpportunite(g);
  }
  const derniere = courbe[courbe.length - 1] || { ca: 0, rang: M.RANG_MAX, annee: C.ANNEE_DEBUT };
  // Entrer au Top 50 n'arrête plus la partie : ce qui compte est d'y être
  // encore à la fin, et combien d'exercices on y a tenu.
  const anneesTop50 = courbe.filter((p) => p.rang <= 50).length;
  return {
    anneeTop50, faillite, derniere, courbe, anneesTop50,
    finitTop50: !faillite && derniere.rang <= 50,
    sortiTop50: anneeTop50 !== null && derniere.rang > 50,
  };
}

// ---- Exécution ------------------------------------------------------------

// Test discriminant : retirer un événement permet de savoir si c'est lui qui
// tue une stratégie, ou si la stratégie se tue toute seule.
if (SANS) {
  const i = EVENEMENTS.findIndex((e) => e.id === SANS);
  if (i < 0) { console.error("Aucun événement « " + SANS + " »."); process.exit(1); }
  EVENEMENTS.splice(i, 1);
}

const ctx = { pays: PAYS, profil: "artisan" };
const ORIGINE = "moyen";
const seeds = Array.from({ length: NB_SEEDS }, (_, i) => 1000 + i * 137);
const median = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);

console.log(`Bots stratèges · ${seeds.length} graines · ${ORIGINE} / ${ctx.pays} / ${ctx.profil}` +
  (SANS ? ` · SANS « ${SANS} »` : "") + "\n");
console.log(
  "bot          | entrée Top 50 | ans dedans | y finit | en sort | faillites | CA médian 2065 | rang"
);
console.log("-".repeat(104));

const resultats = [];
for (const bot of BOTS.filter((b) => !SEUL || b.nom === SEUL)) {
  const runs = seeds.map((s) => partie(bot, s, ctx, ORIGINE));
  const tops = runs.map((r) => r.anneeTop50).filter((x) => x !== null);
  const faillites = runs.filter((r) => r.faillite).length;
  const cas = runs.map((r) => r.derniere.ca);
  const rangs = runs.map((r) => r.derniere.rang);
  const res = {
    nom: bot.nom, medianeTop50: median(tops), jamais: runs.length - tops.length,
    faillites, caMedian: median(cas), rangMedian: median(rangs),
    finissentTop50: runs.filter((r) => r.finitTop50).length,
    sortent: runs.filter((r) => r.sortiTop50).length,
    anneesTop50Medianes: median(runs.map((r) => r.anneesTop50)),
    seeds: runs.length,
  };
  resultats.push(res);
  console.log(
    res.nom.padEnd(12) + " | " +
    String(res.medianeTop50 ?? "—").padStart(13) + " | " +
    String(res.anneesTop50Medianes).padStart(10) + " | " +
    (res.finissentTop50 + "/" + res.seeds).padStart(7) + " | " +
    (res.sortent + "/" + res.seeds).padStart(7) + " | " +
    String(res.faillites).padStart(9) + " | " +
    F.fmtArgent(res.caMedian).padStart(14) + " | " +
    String(res.rangMedian).padStart(4)
  );
  if (TRACE) {
    for (const p of runs[0].courbe.filter((_, i) => i % 5 === 0)) {
      console.log(`     ${p.annee} · CA ${F.fmtArgent(p.ca).padStart(14)} · rang ${p.rang}`);
    }
  }
}

// ---- Diagnostic de plafond -------------------------------------------------

/**
 * Pourquoi une marque cesse de grandir après 2050. Trois causes possibles et
 * trois corrections opposées : l'atelier saturé (il faut des paliers plus
 * gros), le marché épuisé (il faut des pools ou une expansion), ou la
 * trésorerie (il faut des leviers de financement). On mesure avant de régler.
 *
 *   npm run bots -- --plafond
 */
if (process.argv.includes("--plafond")) {
  const SEGS = ["grandpublic", "lifestyle", "connaisseurs", "bling"];
  console.log("\nDIAGNOSTIC DE PLAFOND — médianes sur " + seeds.length + " graines\n");
  for (const bot of BOTS.filter((b) => !SEUL || ["Margeur", "Prestigieux"].includes(b.nom))) {
    if (SEUL && bot.nom !== SEUL) continue;
    if (!SEUL && !["Margeur", "Prestigieux"].includes(bot.nom)) continue;
    const runs = seeds.map((s) => partie(bot, s, ctx, ORIGINE));
    console.log("\x1b[1m" + bot.nom + "\x1b[0m");
    console.log(
      "  année |     atelier |  équipe |    trésorerie |          CA | rang | " +
      SEGS.map((x) => x.slice(0, 5).padStart(6)).join(" ")
    );
    for (const annee of [2045, 2050, 2055, 2060, 2065]) {
      const pts = runs.map((r) => r.courbe.find((p) => p.annee === annee)).filter(Boolean);
      if (!pts.length) continue;
      const med = (f) => median(pts.map(f));
      const util = med((p) => p.heuresUtilisees);
      const cap = med((p) => p.capacite);
      // Part du pool déjà consommée : au-delà de ~50%, le marché se referme.
      const sat = SEGS.map((sg) => {
        const s2 = med((p) => p.saturation[sg] || 0);
        const pool = C.SEGMENTS[sg].pool;
        return ((s2 / (s2 + pool)) * 100).toFixed(0).padStart(5) + "%";
      });
      console.log(
        "   " + annee + " | " +
        (Math.round((util / cap) * 100) + "%").padStart(4) + " " +
        (Math.round(cap / 100) / 10 + "k h").padStart(6) + " | " +
        String(med((p) => p.equipe)).padStart(7) + " | " +
        F.fmtArgent(med((p) => p.cash)).padStart(13) + " | " +
        F.fmtArgent(med((p) => p.ca)).padStart(11) + " | " +
        String(med((p) => p.rang)).padStart(4) + " | " + sat.join(" ")
      );
    }
    console.log("");
  }
  process.exit(0);
}

// ---- Mesure des opportunités ----------------------------------------------

/**
 * Version pauvre, volontairement : deux extrêmes, pas de moteur d'arbitrage.
 * Un bot qui accepte tout et un bot qui refuse tout ; l'écart borne ce que les
 * opportunités valent. Si l'écart est gros, on bissecte par catégorie puis par
 * entrée pour désigner les coupables.
 *
 *   npm run bots -- --opp        les deux extrêmes, par stratégie
 *   npm run bots -- --opp-cat    bissection par catégorie
 *   npm run bots -- --opp-une    bissection entrée par entrée
 */
const CATEGORIES = {
  salons: ["salon", "salonAsie", "salonAmerique", "concours", "concoursDesign", "salonEcoles"],
  image: ["partenariatMusee", "documentaire", "atelierOuvert", "ambassadeur", "capsuleCollab",
    "podcast", "youtubeur", "voyagepresse", "collab"],
  commercial: ["detaillant", "boutiqueEphemere", "preventeCommunaute", "contratOEM",
    "licenceMarque", "commandeCorporate", "localCentreVille"],
  production: ["certificationChrono", "rachatFournisseur", "formationInterne", "maitreRetraite",
    "outillageOccasion", "remiseVolume", "ebauchesLiquidation", "maroquinier",
    "horlogerLegendaire", "ecolePartenariat", "fournisseurExclusif"],
  finance: ["rachatInde", "familyOffice", "empruntObligataire", "investisseurApproche", "ancienCamarade"],
  autres: ["venteCaritative", "labelSwissMade", "machineAnglage", "contratSpatial", "offreRachat"],
};

const caMedianAvec = (bot, politique, filtre) =>
  median(seeds.map((s) => partie(bot, s, ctx, ORIGINE, politique, filtre).derniere.ca));

if (process.argv.includes("--opp") || process.argv.includes("--opp-cat") || process.argv.includes("--opp-une")) {
  console.log("\nMESURE DES OPPORTUNITÉS — accepter tout contre ne rien accepter\n");
  console.log("bot          |    refuse tout |   accepte tout | écart");
  console.log("-".repeat(62));
  const botsMesures = BOTS.filter((b) => !SEUL || b.nom === SEUL);
  for (const bot of botsMesures) {
    const rien = caMedianAvec(bot, "rien", null);
    const tout = caMedianAvec(bot, "tout", null);
    const r = rien > 0 ? tout / rien : 0;
    console.log(
      bot.nom.padEnd(12) + " | " + F.fmtArgent(rien).padStart(14) + " | " +
      F.fmtArgent(tout).padStart(14) + " | " + (r ? r.toFixed(2) + "×" : "—")
    );
  }

  if (process.argv.includes("--opp-cat") || process.argv.includes("--opp-une")) {
    const cible = botsMesures[0];
    const base = caMedianAvec(cible, "rien", null);
    const groupes = process.argv.includes("--opp-une")
      ? Object.fromEntries(PROPOSITIONS.map((o) => [o.id, [o.id]]))
      : CATEGORIES;
    console.log("\nBISSECTION sur « " + cible.nom + " » — chaque ligne : cette seule famille acceptée\n");
    const lignes = [];
    for (const [nom, ids] of Object.entries(groupes)) {
      const ca = caMedianAvec(cible, "tout", (o) => ids.includes(o.id));
      lignes.push({ nom, ca, gain: base > 0 ? ca / base : 0 });
    }
    lignes.sort((a, b) => b.gain - a.gain);
    for (const l of lignes) {
      if (Math.abs(l.gain - 1) < 0.02 && process.argv.includes("--opp-une")) continue;
      console.log("  " + l.nom.padEnd(22) + F.fmtArgent(l.ca).padStart(14) + "  " + l.gain.toFixed(2) + "×");
    }
    console.log("\n  référence (rien accepté) : " + F.fmtArgent(base));
    if (process.argv.includes("--trace")) {
      const id = argTxt("trace-id", null);
      if (id) {
        const r = partie(cible, seeds[0], ctx, ORIGINE, "tout", (o) => o.id === id);
        for (const p of r.courbe.filter((_, i) => i % 5 === 0)) {
          console.log("    " + p.annee + " · CA " + F.fmtArgent(p.ca).padStart(13) +
            " · caisse " + F.fmtArgent(p.cash).padStart(13) + " · équipe " + p.equipe +
            " · atelier " + Math.round((p.heuresUtilisees / p.capacite) * 100) + "%");
        }
      }
    }
  }
  process.exit(0);
}

// ---- Verdict --------------------------------------------------------------

const viables = resultats.filter((r) => r.medianeTop50 !== null);
const ecart = viables.length > 1
  ? Math.max(...viables.map((r) => r.medianeTop50)) - Math.min(...viables.map((r) => r.medianeTop50))
  : 0;
const plusTot = viables.length ? Math.min(...viables.map((r) => r.medianeTop50)) : null;
const equilibreRes = resultats.find((r) => r.nom === "Équilibré");

// La meilleure stratégie : celle qui tient le plus d'exercices dans les
// cinquante, et à égalité celle qui finit le mieux classée.
const meilleure = resultats.length
  ? [...resultats].sort(
      (a, b) => b.anneesTop50Medianes - a.anneesTop50Medianes || a.rangMedian - b.rangMedian
    )[0]
  : null;

// Écart de chiffre d'affaires entre la meilleure et la pire stratégie survivante :
// mesure de domination utilisable même quand personne n'atteint le Top 50.
const survivantes = resultats.filter((r) => r.faillites < seeds.length);
const cas = survivantes.map((r) => r.caMedian).filter((x) => x > 0);
const ratioCA = cas.length > 1 ? Math.max(...cas) / Math.min(...cas) : 1;

const criteres = [
  {
    // Sans cette condition, tous les autres critères passaient par vacuité :
    // un jeu que personne ne gagne n'est pas un jeu équilibré.
    nom: "le jeu est gagnable — au moins deux stratégies atteignent le Top 50",
    ok: viables.length >= 2,
    mesure: viables.length + " stratégie(s) au Top 50 sur " + BOTS.length,
  },
  {
    nom: "aucune stratégie ne domine (écart Top 50 < 10 ans)",
    ok: viables.length >= 2 && ecart < 10,
    mesure: viables.length > 1 ? ecart + " ans d'écart" : "non mesurable",
  },
  {
    nom: "aucune stratégie n'écrase les autres en CA (rapport < 5×)",
    ok: ratioCA < 5,
    mesure: "rapport " + ratioCA.toFixed(1) + "× entre la meilleure et la pire survivante",
  },
  {
    // Le critère « pas de Top 50 avant 2040 » est abandonné : entrer n'est plus
    // la fin de la partie, donc la date d'entrée ne dit plus grand-chose. Ce
    // qu'on veut, c'est que durer soit le vrai test.
    nom: "la meilleure stratégie est encore au Top 50 en 2065 (majorité des graines)",
    ok: meilleure !== null && meilleure.finissentTop50 > meilleure.seeds / 2,
    mesure: meilleure
      ? meilleure.nom + " y finit sur " + meilleure.finissentTop50 + "/" + meilleure.seeds + " graines"
      : "aucune stratégie n'entre au Top 50",
  },
  {
    // Un Top 50 dont on ne sort jamais est un plafond, pas un classement.
    nom: "au moins une stratégie viable en sort",
    ok: resultats.some((r) => r.sortent > 0),
    mesure: resultats.filter((r) => r.sortent > 0).map((r) => r.nom + " (" + r.sortent + ")").join(", ") || "aucune",
  },
  {
    nom: "l'Équilibré ne fait pas faillite",
    ok: equilibreRes.faillites === 0,
    mesure: equilibreRes.faillites + " faillite(s)",
  },
];

console.log("\nCritères d'équilibrage :");
for (const c of criteres) console.log(`  ${c.ok ? "✅" : "❌"} ${c.nom} — ${c.mesure}`);
const tousOk = criteres.every((c) => c.ok);
console.log(`\n${tousOk ? "Équilibrage validé." : "Équilibrage non validé."}`);
process.exit(tousOk ? 0 : 1);
