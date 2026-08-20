import { PERIODES, LETTRES, REACTIONS, ANNEE_MORT_OLIVIER, lettreScellee } from "../data/olivier.js";
import { hasardTexte, tirerTexte } from "./alea.js";
import { ATELIERS } from "../data/config.js";
import { clamp } from "./formules.js";

/**
 * Le fil d'Olivier : une lettre tous les cinq ans, un objectif proposé, et
 * une récompense s'il est atteint. Jamais de pénalité s'il ne l'est pas.
 *
 * Le texte tire sur le flux d'aléa réservé aux mots (`hasardTexte`) : une
 * réaction du mentor ne doit pas déplacer l'équilibrage d'un cheveu.
 */

export const periodeDe = (annee) => PERIODES.find((p) => annee >= p.debut && annee < p.fin) || null;
export const periodeQuiOuvre = (annee) => PERIODES.find((p) => p.debut === annee) || null;

/** L'objectif retenu pour une période : celui qui colle à ce que la marque devient. */
export function choisirObjectif(periode, g) {
  const i = Math.min(periode.prefere(g), periode.variantes.length - 1);
  const v = periode.variantes[i];
  return { periode: periode.debut, id: v.id, texte: v.texte, recompense: periode.recompense };
}

/** La lettre du début de période, signée selon qui tient la plume. */
export function lettreDe(annee, g, ctx = {}) {
  if (annee === 2065) {
    return { auteur: "Olivier", scellee: true, texte: lettreScellee(g, ctx) };
  }
  const texte = LETTRES[annee];
  if (!texte) return null;
  return {
    auteur: annee > ANNEE_MORT_OLIVIER ? "La fille d'Olivier" : "Olivier",
    scellee: false,
    texte,
  };
}

/**
 * Solde la période écoulée. Renvoie l'état modifié et la ligne de réaction.
 * Une récompense se donne, un échec ne se paie pas.
 */
export function soldePeriode(g) {
  const obj = g.objectif;
  if (!obj) return { etat: g, reaction: null };
  const periode = PERIODES.find((p) => p.debut === obj.periode);
  const variante = periode && periode.variantes.find((v) => v.id === obj.id);
  const reussi = !!(variante && variante.atteint(g));
  const reaction = {
    reussi,
    texte: tirerTexte(reussi ? REACTIONS.reussi : REACTIONS.rate),
    objectif: obj.texte,
    recompense: reussi ? obj.recompense.texte : null,
  };
  return { etat: reussi ? appliquerRecompense(g, obj.recompense.id) : g, reaction };
}

/** Les récompenses. Les « offertes » posent un jeton que l'action consomme. */
export function appliquerRecompense(g, id) {
  const e = { ...g, objectifsReussis: [...(g.objectifsReussis || []), id] };
  switch (id) {
    case "rdOfferte": e.rdOfferte = true; break;
    case "atelierOffert":
      e.ateliers = g.ateliers + 1;
      e.ateliersFixes = (g.ateliersFixes || 0) + ATELIERS.grand.fixes;
      e.capacite = g.capacite + ATELIERS.grand.heures;
      break;
    case "directionOfferte": e.directionOfferte = true; break;
    case "credCanal":
      e.cred = clamp(g.cred + 10, 0, 100);
      e.canalOffert = true;
      break;
    case "subvention": e.cash = g.cash + 1000000; break;
    case "des12": e.des = clamp(g.des + 12, 0, 100); break;
    case "manufDemiPrix": e.manufDemiPrix = true; break;
    case "cred15": e.cred = clamp(g.cred + 15, 0, 100); break;
    case "directeurOffert": e.directeurOffert = true; break;
    case "epilogue": e.epilogueEnrichi = true; break;
    default: break;
  }
  return e;
}

/**
 * Passage d'année : solde la période qui se termine, ouvre celle qui commence.
 * Appelé une fois par an, au moment où le joueur quitte le bilan annuel.
 */
export function passageAnnee(g, nouvelleAnnee, ctx = {}) {
  let etat = g;
  let reaction = null;
  const ouvre = periodeQuiOuvre(nouvelleAnnee);
  if (ouvre || nouvelleAnnee === 2065) {
    const solde = soldePeriode(etat);
    etat = solde.etat;
    reaction = solde.reaction;
  }
  const lettre = lettreDe(nouvelleAnnee, etat, ctx);
  if (ouvre) etat = { ...etat, objectif: choisirObjectif(ouvre, etat) };
  return { etat, lettre, reaction };
}

/** Bruit de texte réservé : le mentor ne touche jamais au flux de simulation. */
export const tonAleatoire = () => hasardTexte();
