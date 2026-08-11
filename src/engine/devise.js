/**
 * Devise d'affichage.
 *
 * Décision de spec : l'économie reste **entièrement calculée en CHF**. Ce module
 * ne touche pas au moteur, il habille les montants au moment de les afficher.
 * Les taux sont grossiers et fixes, volontairement : c'est de la couleur locale,
 * pas une simulation de change.
 *
 * La devise courante est un état de module, posé au démarrage et au chargement
 * d'une partie (même approche que la graine d'aléa). Elle évite de faire
 * traverser le pays à travers les deux cents appels de formatage de l'UI.
 */

export const DEVISES = {
  suisse: { code: "CHF", taux: 1, avant: "CHF ", apres: "" },
  france: { code: "EUR", taux: 1.05, avant: "", apres: " €" },
  japon: { code: "JPY", taux: 170, avant: "¥ ", apres: "" },
  chine: { code: "CNY", taux: 8, avant: "", apres: " ¥ CNY" },
};

const DEFAUT = "suisse";
let courante = DEFAUT;

/** Pose la devise d'affichage à partir du pays de départ. */
export function setDevise(pays) {
  courante = DEVISES[pays] ? pays : DEFAUT;
}

export const devise = () => DEVISES[courante];

/** Convertit un montant CHF vers la devise d'affichage. */
export const enDevise = (chf) => chf * devise().taux;
