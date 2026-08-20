import { COMPLICATIONS } from "../data/config.js";
import { listeCompls } from "./formules.js";

/**
 * Les fins de partie.
 *
 * Conditions arbitrées par le game designer (lot final S5, § 5) : elles font
 * foi sur toute version antérieure du lore.
 *
 * Deux temporalités. Le **Scandale** est une défaite qui peut tomber à tout
 * moment — la maison va bien, le fondateur est écarté. Les quatre autres
 * s'évaluent en 2065, dans l'ordre de priorité ci-dessous : une partie remplit
 * souvent plusieurs conditions, et c'est la plus singulière qui doit être
 * racontée.
 *
 * L'écran de fin révèle les cinq à chaque partie : celles qu'on a atteintes en
 * clair, les autres en indices sans le moindre chiffre. C'est le levier de
 * rejouabilité du jeu — on relance pour aller voir.
 */

export const FINS = [
  {
    id: "scandale", nom: "LE SCANDALE", icone: "📰", defaite: true,
    // Priorité maximale : une réputation détruite prime sur tout le reste.
    quand: "immediat",
    description:
      "La marque survit, les comptes étaient bons, et le fondateur est écarté de l'industrie. " +
      "Ce n'est pas l'argent qui a manqué.",
    indice:
      "Une maison n'est jamais tombée à cause de ses comptes, mais à cause de ce qu'elle offrait " +
      "aux journalistes.",
    atteinte: (g) =>
      ((g.presseAchetee || 0) >= 6 && (g.enquetes || 0) >= 2) ||
      (g.cred < 10 && (g.credMax || 0) > 50),
  },
  {
    id: "empire", nom: "L'EMPIRE", icone: "🏰",
    quand: "finale",
    description:
      "Trois maisons rachetées, une direction industrielle, et une place parmi les cent premières. " +
      "Le chassé est devenu le chasseur.",
    indice: "D'autres ont préféré racheter leurs concurrents plutôt que de les affronter.",
    atteinte: (g, ctx) =>
      (g.rachatsIndes || 0) >= 3 &&
      !!(g.directeurs && g.directeurs.production) &&
      ctx.rang <= 100 &&
      g.cash >= 200000000,
  },
  {
    id: "montreDuSiecle", nom: "LA MONTRE DU SIÈCLE", icone: "🏛",
    quand: "finale",
    description:
      "Une seule pièce a suffi. Tourbillon de manufacture, qualité hors échelle, complications au " +
      "dernier palier — et une vitrine de musée. Le nom passe à la postérité, quelle que soit la " +
      "taille de la maison.",
    indice:
      "Un seul garde-temps a suffi à faire passer un nom à la postérité, dans une maison qui n'a " +
      "jamais été grande.",
    atteinte: (g) =>
      !!g.museeExpo &&
      g.modeles.some(
        (m) =>
          m.mvt === "manufacture" &&
          m.qual >= 17 &&
          (m.savoirCreation || 0) >= 80 &&
          listeCompls(m).some((c) => c.id === "tourbillon") &&
          listeCompls(m).some((c) => c.niveau >= 3)
      ),
  },
  {
    id: "marqueCulte", nom: "LA MARQUE CULTE", icone: "💎",
    quand: "finale",
    description:
      "Jamais plus d'une poignée de références, une désirabilité que rien n'a entamée pendant dix " +
      "ans, et une indépendance intacte. La retenue a fait ce que la croissance n'aurait pas fait.",
    indice:
      "Certaines maisons n'ont jamais laissé leur catalogue dépasser une poignée de références — " +
      "et c'est ce qui les a rendues légendaires.",
    atteinte: (g) => (g.maxReferences || 0) <= 5 && (g.desHauteAns || 0) >= 10,
  },
  {
    id: "succession", nom: "LA SUCCESSION", icone: "✉",
    quand: "finale",
    description:
      "Cinquante ans, vivante et indépendante. La lettre scellée d'Olivier s'ouvre, puis la maison " +
      "passe à l'un des enfants avec un mot : « fais mieux que moi. »",
    indice: "Il y a ceux qui gagnent, et ceux qui transmettent.",
    // La fin par défaut : arriver au bout sans faillite ni rachat.
    atteinte: () => true,
  },
];

/** La fin la plus singulière parmi celles que la partie remplit. */
export function evaluerFin(g, ctx = {}) {
  const candidates = FINS.filter((f) => f.quand === "finale");
  return candidates.find((f) => f.atteinte(g, ctx)) || FINS[FINS.length - 1];
}

/** Le scandale peut tomber à tout moment : il se teste chaque trimestre. */
export const scandaleAtteint = (g) => FINS[0].atteinte(g);

/**
 * Ce que l'écran de fin affiche : chaque fin, atteinte ou non. Les autres
 * parties comptent — une fin déjà obtenue reste révélée d'une partie à l'autre.
 */
export function tableauDesFins(g, ctx, obtenue, debloquees = []) {
  return FINS.map((f) => ({
    ...f,
    obtenue: f.id === obtenue,
    connue: f.id === obtenue || debloquees.includes(f.id),
  }));
}

/** Le modèle qui a fait la Montre du Siècle, pour pouvoir le nommer. */
export function pieceDeMusee(g) {
  return g.modeles.find(
    (m) =>
      m.mvt === "manufacture" &&
      m.qual >= 17 &&
      (m.savoirCreation || 0) >= 80 &&
      listeCompls(m).some((c) => c.id === "tourbillon")
  );
}

/** Les familles de complications au palier maximal, pour l'affichage. */
export const paliersMax = (m) =>
  listeCompls(m)
    .filter((c) => c.niveau >= COMPLICATIONS[c.id].niveaux.length)
    .map((c) => COMPLICATIONS[c.id].nom);
