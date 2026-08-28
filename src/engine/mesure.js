import { GOATCOUNTER } from "../data/config.js";

/**
 * Mesure d'audience — combien de visiteurs, combien de parties lancées.
 *
 * Deux principes tenus ici. **Rien ne part tant que la clé n'est pas posée** :
 * sans `GOATCOUNTER`, aucun script n'est chargé et aucune requête ne quitte le
 * navigateur. Et **rien de personnel n'est collecté** : GoatCounter ne pose pas
 * de cookie et n'enregistre pas d'identifiant de visiteur, ce qui évite le
 * bandeau de consentement et, accessoirement, de savoir des choses qu'on n'a
 * pas besoin de savoir.
 *
 * Une mesure qui échoue ne doit jamais gêner une partie : tout est enveloppé.
 */

let charge = false;

export function initMesure() {
  if (charge || !GOATCOUNTER || typeof document === "undefined") return;
  charge = true;
  try {
    const s = document.createElement("script");
    s.async = true;
    s.dataset.goatcounter = "https://" + GOATCOUNTER + ".goatcounter.com/count";
    s.src = "https://gc.zgo.at/count.js";
    document.head.appendChild(s);
  } catch {
    // Une mesure ratée n'est pas un incident de jeu.
  }
}

/** Un événement nommé — « partie lancée », « partie terminée ». */
export function compter(nom, titre) {
  if (!GOATCOUNTER || typeof window === "undefined") return;
  try {
    if (typeof window.goatcounter?.count === "function") {
      window.goatcounter.count({ path: nom, title: titre || nom, event: true });
    }
  } catch {
    // Idem : on ne casse pas une partie pour un compteur.
  }
}
