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
import { etatInitial, simulateQuarter } from "../src/engine/simulation.js";
import * as F from "../src/engine/formules.js";
import * as C from "../src/data/config.js";
import * as M from "../src/data/monde.js";
import { graine } from "../src/engine/alea.js";

const arg = (nom, defaut) => {
  const i = process.argv.indexOf("--" + nom);
  return i >= 0 && process.argv[i + 1] ? Number(process.argv[i + 1]) : defaut;
};
const NB_SEEDS = arg("seeds", 10);
const TRACE = process.argv.includes("--trace");

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

/** Fixe le prix d'un modèle en multiple du prix « acceptable » de son segment. */
function tarifer(g, facteur) {
  return {
    ...g,
    modeles: g.modeles.map((m) => {
      if (m.statut !== "actif" || m.prix) return m;
      const repere =
        C.SEGMENTS[m.seg].ideal *
        C.MATERIAUX[m.materiau].idealMult *
        F.paliersDe(m).reduce((s, p) => s * p.prixMult, 1);
      return { ...m, prix: Math.round(repere * facteur) };
    }),
  };
}

const embaucher = (g, poste) =>
  g.heures < C.COUTS_H.embauche ? g : {
    ...g,
    heures: g.heures - C.COUTS_H.embauche,
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
    modeles: g.modeles.map((m) => {
      if (m.statut !== "actif") return m;
      const seg = C.SEGMENTS[m.seg];
      const idealAdj =
        seg.ideal *
        C.MATERIAUX[m.materiau].idealMult *
        F.paliersDe(m).reduce((s, p) => s * p.prixMult, 1) *
        (0.55 + m.qual / 14 + g.cred / 300);
      return { ...m, prix: Math.round(idealAdj * facteur) };
    }),
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

/** Plancher de notoriété : même le plus radin des margeurs entretient un minimum. */
function entretenirImage(g, ctx, { notoCible, presseAussi = false }) {
  if (g.noto < notoCible) g = marketing(g, ctx);
  if (presseAussi && g.cred < 14) g = presse(g);
  return g;
}

/** Capacité : embaucher tant qu'il reste des postes, agrandir quand ils manquent. */
function croitre(g, seuil) {
  let boucle = 0;
  while (totalDemande(g) > F.heuresProductionDispo(g) * 1.05 && g.heures >= C.COUTS_H.embauche && boucle++ < 8) {
    const libres =
      g.capacite - g.heures - F.heuresEmployes(g.employes) * F.encadrement(g.employes).efficacite;
    if (F.encadrement(g.employes).manque > 0 && g.cash > seuil) { g = embaucher(g, "chef"); continue; }
    if (libres >= C.HEURES_EMPLOYE * 0.5 && g.cash > seuil) { g = embaucher(g, "horloger"); continue; }
    if (g.cash > C.ATELIER_COUT + seuil && g.heures >= C.COUTS_H.atelier) {
      g = { ...g, heures: g.heures - C.COUTS_H.atelier, cash: g.cash - C.ATELIER_COUT,
        ateliers: g.ateliers + 1, capacite: g.capacite + C.ATELIER_HEURES };
      continue;
    }
    break;
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
  if (g.modeles.length === 0) g = lancerModele(g, ctx, { mvt: "ebauche", seg: "connaisseurs" });
  if (g.modeles.length === 1 && g.cash > 600000) g = lancerModele(g, ctx, { mvt: "ebauche", seg: "bling", mat: "acier" });
  if (g.modeles.length === 2 && g.cash > 2000000 && (g.complications.chrono || 0) > 0) {
    g = lancerModele(g, ctx, { mvt: "ebauche", seg: "bling", compls: ["chrono", "date"] });
  }
  g = tarifer(g, 1.35); // « marger comme un porc »
  g = retarifer(g, 1.35);
  g = faceliftSiUtile(g, ctx, 150000);
  g = rechercher(g, ctx);
  g = ouvrirCanal(g, { privilegieMarge: true });
  g = croitre(g, 200000);
  return produire(g);
}

/** Le Volumiste : prix bas, portée maximale, capacité avant tout. */
function volumiste(g, ctx) {
  if (g.cash < 150000) g = emprunter(g);
  // Le volume a besoin d'être connu : la notoriété est son carburant.
  g = entretenirImage(g, ctx, { notoCible: 55 });
  if (g.modeles.length === 0) g = lancerModele(g, ctx, { mvt: "quartz", seg: "grandpublic" });
  if (g.modeles.length === 1 && g.cash > 400000) g = lancerModele(g, ctx, { mvt: "quartz", seg: "lifestyle" });
  if (g.modeles.length === 2 && g.cash > 1200000) g = lancerModele(g, ctx, { mvt: "ebauche", seg: "lifestyle" });
  g = tarifer(g, 0.8);
  g = retarifer(g, 0.8);
  g = faceliftSiUtile(g, ctx, 120000);
  g = ouvrirCanal(g, { seuil: 120000 });
  g = croitre(g, 150000);
  return produire(g);
}

/** Le Prestigieux : jauges d'abord, prix ensuite. */
function prestigieux(g, ctx) {
  if (g.cash < 150000) g = emprunter(g);
  g = entretenirImage(g, ctx, { notoCible: 65, presseAussi: true });
  if (g.modeles.length === 0) g = lancerModele(g, ctx, { mvt: "ebauche", seg: "connaisseurs" });
  if (g.modeles.length === 1 && g.cred > 12 && g.cash > 700000) {
    g = lancerModele(g, ctx, { mvt: "ebauche", seg: "connaisseurs", style: "dress" });
  }
  if (g.modeles.length === 2 && g.cash > 2500000) g = lancerModele(g, ctx, { mvt: "ebauche", seg: "bling" });
  g = tarifer(g, 1.1);
  g = retarifer(g, 1.1);
  g = faceliftSiUtile(g, ctx, 200000);
  g = rechercher(g, ctx, { seuil: 2 });
  g = ouvrirCanal(g, { privilegieMarge: true });
  g = croitre(g, 200000);
  return produire(g);
}

/** L'Équilibré : un peu de tout, prudent sur la trésorerie. */
function equilibre(g, ctx) {
  if (g.cash < 120000) g = emprunter(g);
  g = entretenirImage(g, ctx, { notoCible: 45, presseAussi: true });
  if (g.modeles.length === 0) g = lancerModele(g, ctx, { mvt: "quartz", seg: "grandpublic" });
  if (g.modeles.length === 1 && g.cash > 500000) g = lancerModele(g, ctx, { mvt: "ebauche", seg: "lifestyle" });
  if (g.modeles.length === 2 && g.cash > 1500000) g = lancerModele(g, ctx, { mvt: "ebauche", seg: "connaisseurs" });
  g = tarifer(g, 1.0);
  g = retarifer(g, 1.0);
  g = faceliftSiUtile(g, ctx, 150000);
  g = rechercher(g, ctx);
  g = ouvrirCanal(g);
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

function partie(bot, seed, ctx, origine) {
  graine(seed);
  let g = etatInitial({ ...ctx, origine, marque: bot.nom });
  const courbe = [];
  let anneeTop50 = null;
  let faillite = false;

  while (g.annee <= C.ANNEE_FIN) {
    g = bot.jouer(g, ctx);
    const { gs2, rap, faillite: mort } = simulateQuarter(g, g.heures, ctx);
    if (mort) { faillite = true; courbe.push({ annee: g.annee, ca: gs2.revenusAnnee, rang: M.RANG_MAX }); break; }
    g = { ...gs2 };
    if (g.t >= 4) {
      const rang = M.rangPour(g.revenusAnnee, g.annee);
      courbe.push({ annee: g.annee, ca: g.revenusAnnee, rang, cash: rap.cash, equipe: F.nbEmployes(g.employes) });
      if (rang <= 50 && anneeTop50 === null) anneeTop50 = g.annee;
      g.revenusAnneePrec = g.revenusAnnee;
      g.revenusAnnee = 0;
      g.annee += 1;
      g.t = 1;
    } else g.t += 1;
    g.heures = C.HEURES_FONDATEUR;
  }
  const derniere = courbe[courbe.length - 1] || { ca: 0, rang: M.RANG_MAX, annee: C.ANNEE_DEBUT };
  return { anneeTop50, faillite, derniere, courbe };
}

// ---- Exécution ------------------------------------------------------------

const ctx = { pays: "suisse", profil: "artisan" };
const ORIGINE = "moyen";
const seeds = Array.from({ length: NB_SEEDS }, (_, i) => 1000 + i * 137);
const median = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);

console.log(`Bots stratèges · ${seeds.length} graines · ${ORIGINE} / ${ctx.pays} / ${ctx.profil}\n`);
console.log("bot          | Top 50 (médiane) | jamais | faillites | CA médian 2065 | rang médian");
console.log("-".repeat(92));

const resultats = [];
for (const bot of BOTS) {
  const runs = seeds.map((s) => partie(bot, s, ctx, ORIGINE));
  const tops = runs.map((r) => r.anneeTop50).filter((x) => x !== null);
  const faillites = runs.filter((r) => r.faillite).length;
  const cas = runs.map((r) => r.derniere.ca);
  const rangs = runs.map((r) => r.derniere.rang);
  const res = {
    nom: bot.nom, medianeTop50: median(tops), jamais: runs.length - tops.length,
    faillites, caMedian: median(cas), rangMedian: median(rangs),
  };
  resultats.push(res);
  console.log(
    res.nom.padEnd(12) + " | " +
    String(res.medianeTop50 ?? "—").padStart(16) + " | " +
    String(res.jamais).padStart(6) + " | " +
    String(res.faillites).padStart(9) + " | " +
    F.fmtArgent(res.caMedian).padStart(14) + " | " +
    String(res.rangMedian).padStart(11)
  );
  if (TRACE) {
    for (const p of runs[0].courbe.filter((_, i) => i % 5 === 0)) {
      console.log(`     ${p.annee} · CA ${F.fmtArgent(p.ca).padStart(14)} · rang ${p.rang}`);
    }
  }
}

// ---- Verdict --------------------------------------------------------------

const viables = resultats.filter((r) => r.medianeTop50 !== null);
const ecart = viables.length > 1
  ? Math.max(...viables.map((r) => r.medianeTop50)) - Math.min(...viables.map((r) => r.medianeTop50))
  : 0;
const plusTot = viables.length ? Math.min(...viables.map((r) => r.medianeTop50)) : null;
const equilibreRes = resultats.find((r) => r.nom === "Équilibré");

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
    nom: "aucun Top 50 avant 2040",
    ok: plusTot === null || plusTot >= 2040,
    mesure: plusTot ? "plus tôt : " + plusTot : "aucun Top 50",
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
