/**
 * Simulation automatique 2015 → 2065, en Node, sans navigateur.
 *
 * Objectif : garantir qu'aucun crash, NaN, Infinity ou valeur absurde
 * n'apparaît sur les 200 trimestres d'une partie complète — y compris quand un
 * testeur enchaîne les « passer à la fin de l'année » jusqu'au bout.
 *
 * Ce n'est PAS un test d'équilibrage : on vérifie la santé du moteur, et on
 * imprime la courbe pour qu'un humain juge si elle est plausible.
 *
 *   npm run sim            # toutes les stratégies
 *   npm run sim -- --trace # + le détail année par année
 */
import { etatInitial, simulateQuarter } from "../src/engine/simulation.js";
import * as F from "../src/engine/formules.js";
import * as C from "../src/data/config.js";
import * as M from "../src/data/monde.js";
import { graine } from "../src/engine/alea.js";

const TRACE = process.argv.includes("--trace");
// Chaque stratégie est rejouée sur plusieurs graines : une partie qui passe par
// chance ne prouve rien, et on veut des résultats reproductibles d'un run à l'autre.
const GRAINES = [1, 7, 42, 1337, 90210];

// ---- Vérification de santé ------------------------------------------------

/** Parcourt récursivement une valeur et signale tout nombre non fini. */
function nombresInvalides(valeur, chemin = "", vus = new Set()) {
  const problemes = [];
  if (typeof valeur === "number") {
    if (!Number.isFinite(valeur)) problemes.push(`${chemin} = ${valeur}`);
    return problemes;
  }
  if (valeur === null || typeof valeur !== "object") return problemes;
  if (vus.has(valeur)) return problemes;
  vus.add(valeur);
  for (const [k, v] of Object.entries(valeur)) {
    problemes.push(...nombresInvalides(v, chemin ? `${chemin}.${k}` : k, vus));
  }
  return problemes;
}

/** Invariants que l'état doit respecter à tout moment. */
function invariantsRompus(g, rap) {
  const casses = [];
  if (g.heures < 0) casses.push(`heures négatives (${g.heures})`);
  if (g.capacite <= 0) casses.push(`capacité nulle ou négative (${g.capacite})`);
  for (const j of ["noto", "cred", "des", "savoir"]) {
    if (g[j] < 0 || g[j] > 100) casses.push(`jauge ${j} hors bornes (${g[j]})`);
  }
  for (const [k, n] of Object.entries(g.employes)) {
    if (n < 0 || !Number.isInteger(n)) casses.push(`effectif ${k} invalide (${n})`);
  }
  for (const m of g.modeles) {
    if (m.stock < 0) casses.push(`stock négatif sur « ${m.nom} » (${m.stock})`);
    if (F.heuresParPiece(m) <= 0) casses.push(`heures/pièce nulles sur « ${m.nom} »`);
  }
  for (const l of rap.lignes) {
    if (l.vendues > l.prod + 1e9) casses.push(`ventes aberrantes sur « ${l.nom} »`);
    if (l.vendues < 0 || l.prod < 0) casses.push(`quantité négative sur « ${l.nom} »`);
  }
  if (rap.revenus < 0) casses.push(`revenus négatifs (${rap.revenus})`);
  if (rap.impot < 0) casses.push(`impôt négatif (${rap.impot})`);
  return casses;
}

// ---- Stratégies -----------------------------------------------------------
// Chacune reçoit l'état en début de trimestre et le rend modifié, comme le
// ferait un joueur. Elles servent à couvrir des chemins de code différents.

/** Le testeur qui clique « passer l'année » sans jamais rien décider. */
const passif = (g) => g;

/** Lance un modèle puis ne touche plus à rien : teste la production seule. */
function minimal(g, ctx) {
  if (g.modeles.length === 0 && g.heures >= F.heuresRD(C.COUTS_H.rd, g.employes)) {
    g = lancerModele(g, ctx, "quartz", "grandpublic");
  }
  const actif = g.modeles.find((m) => m.statut === "actif");
  if (actif && !actif.prix) g = fixePrix(g, 260);
  return produire(g);
}

/**
 * Développe tout : gamme, équipe, canaux, recherches, encadrement.
 * `seuilInvest` = trésorerie minimale avant d'engager horloger + atelier. C'est
 * le paramètre qui décide si la marque décolle : investir tôt est risqué mais
 * c'est la seule façon de convertir la demande en ventes.
 */
function batisseur(g, ctx, seuilInvest = 250000) {
  if (g.cash < 100000 && g.dette < 5000000 && g.heures >= C.COUTS_H.emprunt) {
    g = { ...g, cash: g.cash + 150000, dette: g.dette + 150000, heures: g.heures - C.COUTS_H.emprunt };
  }
  if (g.modeles.length === 0 && g.heures >= F.heuresRD(C.COUTS_H.rd, g.employes)) {
    g = lancerModele(g, ctx, "quartz", "grandpublic");
  }
  const actif = g.modeles.find((m) => m.statut === "actif");
  if (actif && !actif.prix) g = fixePrix(g, 260);

  // Une deuxième puis une troisième ligne quand la trésorerie suit.
  if (g.modeles.length === 1 && g.cash > 400000 && g.heures >= F.heuresRD(C.COUTS_H.rd, g.employes)) {
    g = lancerModele(g, ctx, "ebauche", "lifestyle");
  }
  if (g.modeles.length === 2 && g.cash > 1500000 && g.heures >= F.heuresRD(C.COUTS_H.rd, g.employes)) {
    g = lancerModele(g, ctx, "ebauche", "connaisseurs");
  }
  for (const m of g.modeles) {
    if (m.statut === "actif" && !m.prix) {
      g = fixePrix(g, Math.round(C.SEGMENTS[m.seg].ideal * 0.95), m.nom);
    }
  }

  if (g.cash > 80000 && g.heures >= C.COUTS_H.marketing) {
    g = { ...g, heures: g.heures - C.COUTS_H.marketing, cash: g.cash - 15000,
      noto: F.clamp(g.noto + F.gainMarketing(g, ctx.pays), 0, 100) };
  }
  if (g.cred < 14 && g.heures >= C.COUTS_H.presse) {
    g = { ...g, heures: g.heures - C.COUTS_H.presse, cred: F.clamp(g.cred + 2, 0, 100),
      noto: F.clamp(g.noto + 1, 0, 100) };
  }

  // Recherches : on prend le premier palier abordable.
  if (!g.recherche) {
    const paliers = [...F.complicationsRecherchables(g, ctx.profil), ...F.materiauxRecherchables(g)];
    for (const p of paliers) {
      const h = F.heuresRD(p.rdHeures, g.employes);
      if (!p.bloque && g.heures >= h && g.cash > p.rd * 3) {
        g = { ...g, heures: g.heures - h, cash: g.cash - p.rd,
          recherche: { type: p.type, id: p.id, niveau: p.niveau || 1, restant: Math.max(1, p.dev) } };
        break;
      }
    }
  }

  // Spécialistes utiles, puis encadrement, puis capacité.
  for (const poste of ["ingenieur", "materiaux", "decorateur"]) {
    if (g.employes[poste] === 0 && g.cash > 600000 && g.heures >= C.COUTS_H.embauche) {
      g = embaucher(g, poste);
      break;
    }
  }
  const enc = F.encadrement(g.employes);
  if (enc.manque > 0 && g.cash > 150000 && g.heures >= C.COUTS_H.embauche) g = embaucher(g, "chef");

  // Croissance : on embauche tant qu'il reste des postes libres, et on n'achète
  // une extension que si on peut réellement la payer — l'ancienne version
  // ignorait le prix et se ruinait toute seule.
  const demande = totalDemande(g);
  let boucle = 0;
  while (demande > F.heuresProductionDispo(g) * 1.05 && g.heures >= C.COUTS_H.embauche && boucle++ < 8) {
    const postesLibres = g.capacite - g.heures - F.heuresEmployes(g.employes) * F.encadrement(g.employes).efficacite;
    if (postesLibres >= C.HEURES_EMPLOYE * 0.5 && g.cash > seuilInvest) {
      g = embaucher(g, "horloger");
      continue;
    }
    if (g.cash > C.ATELIERS.grand.cout + seuilInvest && g.heures >= C.ATELIERS.grand.heuresAction) {
      g = { ...g, heures: g.heures - C.ATELIERS.grand.heuresAction, cash: g.cash - C.ATELIERS.grand.cout,
        ateliers: g.ateliers + 1, ateliersFixes: (g.ateliersFixes || 0) + C.ATELIERS.grand.fixes, capacite: g.capacite + C.ATELIERS.grand.heures };
      continue;
    }
    break;
  }
  if (F.heuresProductionDispo(g) >= demande * 0.9) {
    for (const c of F.canauxOuvrables(g)) {
      if (c.manque.length === 0 && g.cash > c.cout + 150000 && g.heures >= c.heures) {
        g = { ...g, heures: g.heures - c.heures, cash: g.cash - c.cout,
          canaux: { ...g.canaux, [c.id]: c.niveau } };
        break;
      }
    }
  }
  return produire(g);
}

// ---- Petits utilitaires de stratégie --------------------------------------

function lancerModele(g, ctx, mvt, seg) {
  const cout = F.coutRD(mvt, ctx.profil);
  const heures = F.heuresRD(C.COUTS_H.rd, g.employes);
  if (g.cash < cout) return g;
  return {
    ...g, cash: g.cash - cout, heures: g.heures - heures,
    modeles: [...g.modeles, {
      nom: seg + "-" + g.modeles.length, mvt, seg, style: "sport", materiau: "acier",
      compls: [], finition: false, prix: "",
      qual: F.qualiteNouveau(mvt, { pays: ctx.pays, profil: ctx.profil, savoir: g.savoir, compls: [] }),
      prod: 0, stock: 0, age: 0, statut: "dev",
      devRestant: F.dureeDev(mvt, ctx.profil, g.employes),
    }],
  };
}

const fixePrix = (g, prix, nom = null) => ({
  ...g,
  modeles: g.modeles.map((m) =>
    m.statut === "actif" && !m.prix && (nom === null || m.nom === nom) ? { ...m, prix } : m
  ),
});

const embaucher = (g, poste) => ({
  ...g,
  heures: g.heures - C.COUTS_H.embauche,
  employes: { ...g.employes, [poste]: g.employes[poste] + 1 },
  savoir: F.clamp(g.savoir + C.EMPLOYES[poste].savoir, 0, 100),
});

const totalDemande = (g) =>
  g.modeles.filter((m) => m.statut === "actif").reduce((s, m) => s + F.estimerDemande(m, g), 0);

/** Répartit la capacité entre les modèles au prorata de leur demande. */
function produire(g) {
  const actifs = g.modeles.filter((m) => m.statut === "actif");
  if (actifs.length === 0) return g;
  const dispo = F.heuresProductionDispo(g);
  const demandes = actifs.map((m) => Math.max(0, F.estimerDemande(m, g) - m.stock));
  const heuresVoulues = actifs.reduce((s, m, i) => s + demandes[i] * F.heuresParPiece(m), 0);
  const facteur = heuresVoulues > dispo && heuresVoulues > 0 ? dispo / heuresVoulues : 1;
  let i = 0;
  return {
    ...g,
    modeles: g.modeles.map((m) =>
      m.statut === "actif" ? { ...m, prod: Math.floor(demandes[i++] * facteur) } : m
    ),
  };
}

// ---- Boucle de partie -----------------------------------------------------

function jouerPartie({ nom, strategie, origine, pays, profil, ...options }, seed) {
  graine(seed);
  const ctx = { pays, profil };
  let g = etatInitial({ pays, profil, origine, marque: "Test " + nom });
  const annees = new Map();
  const erreurs = [];
  let trimestres = 0;
  let finPar = "temps";

  while (g.annee <= C.ANNEE_FIN) {
    try {
      g = strategie(g, ctx, options.seuilInvest);
    } catch (e) {
      erreurs.push(`T${g.t} ${g.annee} — stratégie : ${e.message}`);
      break;
    }

    let res;
    try {
      res = simulateQuarter(g, g.heures, ctx);
    } catch (e) {
      erreurs.push(`T${g.t} ${g.annee} — simulateQuarter a levé : ${e.message}\n${e.stack}`);
      break;
    }
    const { gs2, rap, faillite } = res;
    trimestres++;

    const nan = [...nombresInvalides(gs2, "etat"), ...nombresInvalides(rap, "rapport")];
    if (nan.length) {
      erreurs.push(`T${g.t} ${g.annee} — valeurs non finies : ${nan.slice(0, 5).join(", ")}`);
      break;
    }
    const casses = invariantsRompus(gs2, rap);
    if (casses.length) {
      erreurs.push(`T${g.t} ${g.annee} — invariants : ${casses.slice(0, 5).join(", ")}`);
      break;
    }

    const a = annees.get(g.annee) || { ca: 0, res: 0, pieces: 0 };
    a.ca += rap.revenus;
    a.res += rap.resultatNet;
    a.pieces += rap.lignes.reduce((s, l) => s + l.vendues, 0);
    a.cash = rap.cash;
    a.equipe = F.nbEmployes(gs2.employes);
    a.portee = F.porteeTotale(gs2.canaux);
    a.modeles = gs2.modeles.length;
    annees.set(g.annee, a);

    if (faillite) { finPar = "faillite"; break; }

    g = { ...gs2 };
    if (g.t >= 4) {
      // Bascule d'année, comme continuerApresAnnuel côté UI.
      const rang = M.rangPour(g.revenusAnnee);
      annees.get(g.annee).rang = rang;
      if (rang <= 50) { finPar = "top50"; break; }
      g.meilleurRang = Math.min(rang, g.meilleurRang);
      g.revenusAnneePrec = g.revenusAnnee;
      g.revenusAnnee = 0;
      g.annee += 1;
      g.t = 1;
    } else {
      g.t += 1;
    }
    g.heures = C.HEURES_FONDATEUR;
  }

  return { nom, annees, erreurs, trimestres, finPar, g };
}

// ---- Exécution ------------------------------------------------------------

const parties = [
  { nom: "passif (spam année)", strategie: passif, origine: "moyen", pays: "suisse", profil: "artisan" },
  { nom: "minimal quartz", strategie: minimal, origine: "moyen", pays: "suisse", profil: "artisan" },
  { nom: "bâtisseur classe moyenne", strategie: batisseur, origine: "moyen", pays: "suisse", profil: "artisan" },
  { nom: "bâtisseur self-made", strategie: batisseur, origine: "selfmade", pays: "france", profil: "financier" },
  { nom: "bâtisseur héritier ingénieur", strategie: batisseur, origine: "heritier", pays: "japon", profil: "ingenieur" },
  { nom: "bâtisseur Chine", strategie: batisseur, origine: "moyen", pays: "chine", profil: "artisan" },
  // Même stratégie, mais qui engage la capacité dès 160'000 au lieu de 250'000 :
  // sert à distinguer « le moteur bloque » de « l'ordre d'investissement compte ».
  { nom: "classe moyenne, investit tôt", strategie: batisseur, origine: "moyen", pays: "suisse", profil: "artisan", seuilInvest: 160000 },
  { nom: "self-made, investit tôt", strategie: batisseur, origine: "selfmade", pays: "france", profil: "financier", seuilInvest: 160000 },
];

let echecs = 0;
let total = 0;
for (const p of parties) {
  console.log(`\n── ${p.nom}`);
  for (const seed of GRAINES) {
    const r = jouerPartie(p, seed);
    total++;
    const derniere = [...r.annees.entries()].pop();
    if (r.erreurs.length) {
      echecs++;
      console.log(`   ❌ graine ${seed} — ${r.trimestres} trimestres avant l'anomalie`);
      r.erreurs.forEach((e) => console.log("      " + e));
      continue;
    }
    const [an, a] = derniere || [null, null];
    console.log(
      `   ✅ graine ${String(seed).padStart(5)} · ${String(r.trimestres).padStart(3)} trim. · ` +
      `fin « ${r.finPar} » ${an} · CA ${F.fmtArgent(a.ca).padStart(13)} · ` +
      `résultat ${F.fmtArgent(a.res).padStart(13)} · ${F.fmtNb(a.pieces).padStart(7)} pièces · ` +
      `équipe ${String(a.equipe).padStart(2)} · rang ${M.rangPour(a.ca)}`
    );
    if (TRACE) {
      console.log("      année |          CA |    résultat |  pièces | équipe | portée | modèles | rang");
      for (const [annee, x] of r.annees) {
        console.log(
          `      ${annee}  | ${F.fmtArgent(x.ca).padStart(11)} | ${F.fmtArgent(x.res).padStart(11)} | ` +
          `${F.fmtNb(x.pieces).padStart(7)} | ${String(x.equipe).padStart(6)} | ${x.portee.toFixed(1).padStart(6)} | ` +
          `${String(x.modeles).padStart(7)} | ${M.rangPour(x.ca)}`
        );
      }
    }
  }
}

console.log(
  `\n${echecs === 0 ? "Aucune anomalie détectée." : echecs + " partie(s) en échec."}` +
  ` ${total} parties simulées, horizon ${C.ANNEE_DEBUT}–${C.ANNEE_FIN}.`
);
process.exit(echecs === 0 ? 0 : 1);
