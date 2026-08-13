import { EVENEMENTS } from "../data/evenements.js";
import { ANNEE_DEBUT } from "../data/config.js";

/**
 * Les effets durables des événements historiques, empilés.
 *
 * Avant la chronologie complète, cinq événements suffisaient à une fonction
 * écrite à la main. Avec cinquante et un événements dont une trentaine à effet
 * permanent, il faut un cumul déclaratif : chaque événement porte une liste de
 * modificateurs, et on additionne ce qui est actif à la date courante.
 *
 * Un modificateur : { quoi, mult, debut, duree, si, seg, mvt, mat }
 *   - `debut`  décalage en trimestres après l'événement (0 par défaut)
 *   - `duree`  durée en trimestres, `null` = permanent
 *   - `si`     prédicat sur l'état de la partie (pays, âge, savoir-faire…)
 *
 * Les heures par pièce ne figurent pas dans ce vocabulaire : une hausse du
 * temps de fabrication se traduit ici par une baisse de capacité d'atelier,
 * ce qui produit le même résultat sans faire passer l'accumulateur dans les
 * dix fonctions qui calculent des heures.
 */

const SEGS = ["grandpublic", "lifestyle", "connaisseurs", "bling"];

export const trimestreIndex = (annee, t) => (annee - ANNEE_DEBUT) * 4 + (t - 1);

export function effetsNeutres() {
  return {
    demande: 1,
    demandeSeg: { grandpublic: 1, lifestyle: 1, connaisseurs: 1, bling: 1 },
    demandeMvt: { quartz: 1, ebauche: 1, manufacture: 1 },
    // Croisements gamme × mouvement : « le quartz d'entrée de gamme », « le
    // lifestyle mécanique ». Ni un segment ni un mouvement seul ne les décrit.
    demandeCroisee: [],
    couts: 1,
    coutMateriau: {},
    coutMouvement: {},
    fixesAjout: 0,
    fixesMult: 1,
    salaires: 1,
    capacite: 1,
    portee: 1,
    pool: 1,
    prixAcceptable: 1,
    desEffet: 1,
    desPlafond: 100,
    gainNoto: 1,
    impotPoints: 0,
    freqContrefacon: 1,
    interets: 1,
    revenuTrim: 0, // revenu récurrent : licence de marque, contrat de sous-traitance
  };
}

function appliquer(acc, mod) {
  const m = mod.mult;
  switch (mod.quoi) {
    case "demande":
      if (mod.seg && mod.mvt) acc.demandeCroisee.push({ seg: mod.seg, mvt: mod.mvt, mult: m });
      else if (mod.seg) for (const s of mod.seg) acc.demandeSeg[s] *= m;
      else if (mod.mvt) for (const v of mod.mvt) acc.demandeMvt[v] *= m;
      else acc.demande *= m;
      break;
    case "couts": acc.couts *= m; break;
    case "materiau": acc.coutMateriau[mod.mat] = (acc.coutMateriau[mod.mat] || 1) * m; break;
    case "mouvement": acc.coutMouvement[mod.mvtId] = (acc.coutMouvement[mod.mvtId] || 1) * m; break;
    case "fixesAjout": acc.fixesAjout += mod.montant; break;
    case "fixesMult": acc.fixesMult *= m; break;
    case "salaires": acc.salaires *= m; break;
    case "capacite": acc.capacite *= m; break;
    case "portee": acc.portee *= m; break;
    case "pool": acc.pool *= m; break;
    case "prixAcceptable": acc.prixAcceptable *= m; break;
    case "desEffet": acc.desEffet *= m; break;
    case "desPlafond": acc.desPlafond = Math.min(acc.desPlafond, mod.valeur); break;
    case "gainNoto": acc.gainNoto *= m; break;
    case "impotPoints": acc.impotPoints += mod.points; break;
    case "freqContrefacon": acc.freqContrefacon *= m; break;
    case "interets": acc.interets *= m; break;
    case "revenuTrim": acc.revenuTrim += mod.montant; break;
    default: break;
  }
}

/**
 * Tous les modificateurs actifs au trimestre courant de `g`.
 * `g` doit porter `annee`, `t` et — pour les effets conditionnels — `pays`,
 * `savoir` et l'ancienneté de la marque.
 */
export function effetsActifs(g) {
  const acc = effetsNeutres();
  if (!g || g.annee == null) return acc;
  const now = trimestreIndex(g.annee, g.t || 1);
  for (const e of EVENEMENTS) {
    if (!e.mods) continue;
    const q0 = trimestreIndex(e.annee, e.t);
    if (q0 > now) continue;
    for (const mod of e.mods) {
      const debut = q0 + (mod.debut || 0);
      if (now < debut) continue;
      if (mod.duree != null && now >= debut + mod.duree) continue;
      if (mod.si && !mod.si(g)) continue;
      appliquer(acc, mod);
    }
  }
  // Modificateurs posés en cours de partie par un aléa ou une opportunité :
  // une hausse de prime d'assurance ou un contrat d'ambassadeur dure au-delà
  // du trimestre où on l'a acceptée. Ils transitent par la sauvegarde : rien
  // d'autre que des données JSON ici, jamais de fonction.
  for (const mod of g.mods || []) {
    if (mod.fin != null && now >= mod.fin) continue;
    if (mod.si && !mod.si(g)) continue;
    appliquer(acc, mod);
  }
  return acc;
}

/** Purge les modificateurs de partie arrivés à échéance. */
export function nettoyerMods(g) {
  const now = trimestreIndex(g.annee, g.t);
  return (g.mods || []).filter((m) => m.fin == null || now < m.fin);
}

/** Multiplicateur de demande pour un segment et un mouvement donnés. */
export function multDemande(g, segKey, mvtKey, eff = null) {
  const a = eff || effetsActifs(g);
  let m = a.demande * (a.demandeSeg[segKey] || 1) * (a.demandeMvt[mvtKey] || 1);
  for (const c of a.demandeCroisee) {
    if (c.seg.includes(segKey) && c.mvt.includes(mvtKey)) m *= c.mult;
  }
  return m;
}

/** Aide de lecture : les multiplicateurs cumulés par segment, pour les tests. */
export function tableauCumul(g) {
  const a = effetsActifs(g);
  const parSegment = {};
  for (const s of SEGS) parSegment[s] = a.demande * a.demandeSeg[s];
  return { parSegment, ...a };
}
