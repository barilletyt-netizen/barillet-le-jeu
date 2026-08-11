// Version et horodatage du build, injectés par Vite (voir vite.config.js).
// Affichés dans l'UI pour qu'un retour de testeur puisse être rattaché à un
// build précis. Les valeurs de repli servent aux tests Node, où Vite n'a pas
// remplacé les constantes.

/* global __VERSION__, __BUILD__ */
export const VERSION = typeof __VERSION__ !== "undefined" ? __VERSION__ : "dev";
export const BUILD = typeof __BUILD__ !== "undefined" ? __BUILD__ : "local";
export const ETIQUETTE = "v" + VERSION + " · build " + BUILD;
