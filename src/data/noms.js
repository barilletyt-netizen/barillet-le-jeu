/**
 * Générateur de noms.
 *
 * Les champs vides freinaient les testeurs pressés : on pré-remplit avec une
 * proposition crédible, toujours écrasable. Le vocabulaire est celui de l'arc
 * jurassien et de la Vallée de Joux — des sonorités d'horlogerie, sans reprendre
 * de marque existante.
 */
import { hasard, tirer } from "../engine/alea.js";

const PATRONYMES = [
  "Vallorbe", "Berthoud", "Ferrand", "Delorme", "Vaucher", "Chapuis", "Rochat",
  "Golay", "Meylan", "Piguet", "Jeanneret", "Grandjean", "Courvoisier", "Perret",
  "Aubry", "Sandoz", "Brandt", "Girard", "Humbert", "Nicolet",
];

const FORMES = [
  (n) => n + " & Fils",
  (n) => n + " Frères",
  (n) => "Maison " + n,
  (n) => "Manufacture " + n,
  (n) => "Atelier " + n,
  (n) => n + " & Cie",
  (n) => n + " Horlogerie",
];

const LIEUX = [
  "Le Sentier", "Le Locle", "Sainte-Croix", "Fleurier", "Val-de-Travers",
  "Les Brenets", "La Sagne", "Tramelan", "Porrentruy", "Saint-Imier",
];

/** Un nom de marque : patronyme mis en forme, ou patronyme + lieu. */
export function nomDeMarque() {
  const patronyme = tirer(PATRONYMES);
  if (hasard() < 0.25) return patronyme + " de " + tirer(LIEUX);
  return tirer(FORMES)(patronyme);
}

// Noms de modèles : courts, évocateurs, prononçables. Mélange de lieux, de
// vocabulaire technique et de mots de métier.
const MODELES = [
  "Balancier", "Échappement", "Spiral", "Ancre", "Rubis", "Guichet", "Cadran",
  "Aiguille", "Pivot", "Rouage", "Platine", "Ressort", "Pendule", "Cliquet",
  "Vertige", "Méridien", "Alizé", "Sillage", "Cabestan", "Boussole", "Sextant",
  "Nocturne", "Aurore", "Zénith", "Crépuscule", "Solstice", "Équinoxe",
  "Combe", "Doubs", "Chasseral", "Suze", "Areuse", "Orbe",
];

const QUALIFICATIFS = [
  "Premier", "Classique", "Sport", "Marine", "Automatique", "Nocturne",
  "Réserve", "Héritage", "Signature", "Origine", "Grand", "Petit",
];

/** Un nom de modèle : un mot fort, parfois suivi d'un qualificatif ou d'un chiffre. */
export function nomDeModele() {
  const base = tirer(MODELES);
  const d = hasard();
  if (d < 0.45) return base;
  if (d < 0.75) return base + " " + tirer(QUALIFICATIFS);
  return base + " " + (Math.floor(hasard() * 9) + 1) + "0";
}
