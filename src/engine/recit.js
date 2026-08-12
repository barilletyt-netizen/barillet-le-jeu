import { SEGMENTS } from "../data/config.js";
import { tirerTexte as tirer } from "./alea.js";
import { fmtArgent, fmtNb } from "./formules.js";

/**
 * Récit trimestriel.
 *
 * Verdict du proto : « un début, mais austère ». Un rapport comptable ne fait
 * pas une chronique. On assemble ici, par gabarits, un ou deux paragraphes qui
 * racontent le trimestre : ce que le fondateur a fait, ce que le monde lui a
 * envoyé, ce que ça a donné en boutique, et une brève de l'industrie.
 *
 * Ton : chronique horlogère. Sérieux, avec des clins d'œil. Jamais de flatterie
 * automatique — un mauvais trimestre se dit franchement.
 */

const SAISONS = {
  1: ["janvier", "le cœur de l'hiver", "la reprise de janvier"],
  2: ["le printemps", "avril", "la saison des salons"],
  3: ["l'été", "juillet", "la torpeur de l'été"],
  4: ["l'automne", "octobre", "les semaines qui précèdent les fêtes"],
};

// Ce qu'on dit d'une action, à la première personne du fondateur.
const ACTIONS = {
  marketing: ["une campagne d'affichage", "une vague d'annonces dans la presse spécialisée", "une campagne d'image"],
  choc: ["une campagne choc dont on a beaucoup parlé, pas toujours en bien", "un coup d'éclat publicitaire assumé"],
  presse: ["quelques journalistes reçus à l'atelier", "un travail de fond avec la presse spécialisée"],
  etude: ["une étude de marché commandée à un cabinet", "un sondage sur les intentions d'achat"],
  rd: ["le lancement d'un nouveau calibre en étude", "une nouvelle référence mise en chantier"],
  recherche: ["un programme de recherche technique engagé", "des essais lancés à l'établi"],
  embauche: ["un recrutement", "une embauche à l'atelier"],
  licenciement: ["une séparation difficile avec un collaborateur", "un départ négocié"],
  canal: ["l'ouverture d'un nouveau canal de vente", "un accord de distribution signé"],
  atelier: ["des travaux d'agrandissement à l'atelier", "de nouveaux établis installés"],
  facelift: ["le rafraîchissement d'un modèle vieillissant", "une refonte esthétique d'une référence"],
  edition: ["une série limitée sortie des ateliers", "une édition confidentielle mise en vente"],
  soldes: ["un déstockage qu'on aurait préféré éviter", "des remises consenties pour écouler le stock"],
  kickstarter: ["une campagne de financement participatif", "un appel aux précommandes"],
  emprunt: ["un passage à la banque", "une ligne de crédit ouverte"],
  rembourser: ["un remboursement anticipé", "de la dette effacée"],
};

const OUVERTURES_CALME = [
  "Rien de spectaculaire ce trimestre.",
  "Un trimestre sans relief.",
  "Les semaines ont passé sans grand bruit.",
];

/** Phrase sur ce que le fondateur a fait de son temps. */
function phraseActions(actions) {
  const libelles = actions.map((a) => (ACTIONS[a] ? tirer(ACTIONS[a]) : null)).filter(Boolean);
  if (libelles.length === 0) return "Vous avez passé le trimestre à l'établi, sans lever la tête.";
  if (libelles.length === 1) return "Au programme : " + libelles[0] + ".";
  const dernier = libelles.pop();
  return "Au programme : " + libelles.join(", ") + " et " + dernier + ".";
}

/** Phrase sur le résultat commercial, franche. */
function phraseCommerce(rap) {
  const vendues = rap.lignes.reduce((s, l) => s + l.vendues, 0);
  const invendus = rap.lignes.reduce((s, l) => s + l.stock, 0);
  const rupture = rap.lignes.filter((l) => l.vendues > 0 && l.stock === 0);

  if (rap.lignes.length === 0) return "Rien à vendre : la collection est encore en étude.";
  if (vendues === 0) {
    return tirer([
      "Pas une pièce vendue. Les cartons sont restés fermés.",
      "Aucune vente. Le silence commercial complet.",
    ]);
  }

  let phrase = fmtNb(vendues) + " pièces sorties des ateliers et vendues, " + fmtArgent(rap.revenus) + " encaissés.";
  if (rupture.length > 0) {
    phrase += " " + tirer([
      "« " + rupture[0].nom + " » est parti en rupture — les détaillants en redemandent.",
      "Rupture de stock sur « " + rupture[0].nom + " » : la rareté fera le reste.",
    ]);
  } else if (invendus > vendues) {
    phrase += " " + tirer([
      "Le stock s'accumule plus vite qu'il ne s'écoule, et ça commence à se voir.",
      "Il reste " + fmtNb(invendus) + " pièces en réserve : la production a pris de l'avance sur la demande.",
    ]);
  }
  return phrase;
}

/** Phrase de bilan financier, sans complaisance. */
function phraseResultat(rap) {
  const r = rap.resultatNet;
  if (r > 0 && r > rap.revenus * 0.2) {
    return tirer([
      "L'exercice dégage " + fmtArgent(r) + " — de quoi voir venir.",
      "Le trimestre laisse " + fmtArgent(r) + " en caisse. On respire.",
    ]);
  }
  if (r > 0) return "Le trimestre finit à l'équilibre, tout juste : " + fmtArgent(r) + ".";
  if (r > -50000) return "Le trimestre coûte " + fmtArgent(-r) + ". Rien d'alarmant, rien de rassurant non plus.";
  return tirer([
    "Le trimestre creuse un trou de " + fmtArgent(-r) + ". La question du financement se pose.",
    fmtArgent(-r) + " de perte. À ce rythme, la banque va vouloir en parler.",
  ]);
}

/**
 * Assemble le récit du trimestre.
 * @param {object} rap rapport de simulation
 * @param {object} gs état du trimestre écoulé
 * @param {string[]} actions actions prises par le joueur pendant le trimestre
 * @param {string|null} breve brève du monde à glisser en fin de chronique
 */
export function recitTrimestre(rap, gs, actions = [], breve = null) {
  const paragraphes = [];

  const saison = tirer(SAISONS[rap.t] || SAISONS[1]);
  const ouverture =
    actions.length === 0 && !rap.evt && !rap.alea ? tirer(OUVERTURES_CALME) + " " : "";

  // Une seule évaluation : la tirer deux fois donnerait deux phrases différentes.
  const faits = phraseActions(actions);
  paragraphes.push(
    ouverture + "À " + saison + " " + rap.annee + ", " + faits.charAt(0).toLowerCase() + faits.slice(1)
  );

  if (rap.evt) {
    // Surtout pas de passage en minuscules : les titres portent des noms propres
    // (« Apple Watch », « Covid-19 ») qu'on abîmerait.
    paragraphes.push(tirer(["Et puis, l'événement du trimestre : ", "Le trimestre restera celui-ci : "]) +
      rap.evt.titre + ". " + rap.evt.texte);
  } else if (rap.alea) {
    paragraphes.push(rap.alea.titre + " : " + rap.alea.texte);
  }

  paragraphes.push(phraseCommerce(rap) + " " + phraseResultat(rap));

  if (breve) paragraphes.push("Ailleurs dans l'industrie — " + breve);

  return paragraphes;
}
