/**
 * Mode capture — pour tourner les devlogs.
 *
 * Activé par `?capture=<scène>` dans l'URL. Il ne fait que **charger un état
 * de partie préparé** : aucune règle, aucune formule, aucun équilibrage ne
 * change. Les chiffres affichés sortent du vrai moteur, qui a joué la partie
 * jusqu'au moment voulu.
 *
 * En mode capture, trois choses sont neutralisées pour ne rien fausser :
 *  - **aucune sauvegarde n'est écrite** — tourner une scène ne doit pas
 *    écraser la partie en cours de celui qui filme ;
 *  - **aucune mesure d'audience ne part** — filmer ne doit pas gonfler les
 *    chiffres de fréquentation ;
 *  - **aucun élément parasite n'apparaît** : numéro de version, liens
 *    externes, bouton de retour.
 */

function lireScene() {
  if (typeof window === "undefined") return null;
  try {
    const s = new URLSearchParams(window.location.search).get("capture");
    return s ? s.trim() : null;
  } catch {
    return null;
  }
}

/** Le nom de la scène demandée, ou null hors mode capture. */
export const SCENE_CAPTURE = lireScene();
export const MODE_CAPTURE = SCENE_CAPTURE !== null;

/**
 * Agrandissement pour un enregistrement 1920×1080. Le jeu est pensé mobile :
 * sa colonne fait 560 px, illisible en vidéo pleine largeur. À ×1,6 elle
 * occupe près de 900 px, centrée — lisible sans qu'on voie les pixels
 * s'étirer.
 */
export const ZOOM_CAPTURE = 1.6;
