/**
 * La couche de langue — posée, pas encore remplie.
 *
 * Le jeu compte environ 860 textes longs (événements, aléas, journal, lettres
 * d'Olivier) plus l'interface. Les traduire est un chantier à part entière que
 * le game designer a repoussé ; ce module existe pour que ce chantier n'oblige
 * pas à réécrire le reste le jour venu.
 *
 * **Le principe.** Le français reste écrit en clair dans le code — c'est la
 * langue de travail, et rendre chaque phrase illisible derrière une clé pour
 * une traduction qui n'existe pas serait un mauvais échange. `t()` renvoie le
 * texte français tel quel tant qu'aucune traduction n'est enregistrée, et le
 * remplace dès qu'il en trouve une.
 *
 *   t("Nouvelle partie")            → "Nouvelle partie" en fr, "New game" en en
 *   t(alea.texte, { cle: alea.id }) → traduction indexée par identifiant
 *
 * **Traduire viendra donc en trois temps** : remplir `TRADUCTIONS.en` pour
 * l'interface, puis un dictionnaire par identifiant pour le contenu narratif,
 * puis rien d'autre — aucun appelant n'aura à changer.
 */

export const LANGUES = { fr: "Français", en: "English" };
export const LANGUE_DEFAUT = "fr";

/**
 * Les traductions, par langue. Une entrée manquante retombe sur le français :
 * une langue à moitié traduite reste jouable, elle n'affiche pas de clés nues.
 */
export const TRADUCTIONS = {
  en: {
    // Interface — à remplir en premier, c'est ce qu'on voit dans les dix
    // premières minutes et dans une vidéo.
  },
};

let langue = LANGUE_DEFAUT;

/** La langue du navigateur, si on la parle. Sinon le français. */
export function langueInitiale() {
  if (typeof navigator === "undefined") return LANGUE_DEFAUT;
  const n = (navigator.language || "").slice(0, 2).toLowerCase();
  return LANGUES[n] ? n : LANGUE_DEFAUT;
}

export const langueCourante = () => langue;

export function definirLangue(l) {
  langue = LANGUES[l] ? l : LANGUE_DEFAUT;
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem("barillet-langue", langue);
  } catch {
    // Un navigateur qui refuse le stockage ne doit pas empêcher de jouer.
  }
  return langue;
}

export function chargerLangue() {
  try {
    if (typeof localStorage !== "undefined") {
      const l = localStorage.getItem("barillet-langue");
      if (l && LANGUES[l]) return definirLangue(l);
    }
  } catch {
    // Idem.
  }
  return definirLangue(langueInitiale());
}

/**
 * Traduit, ou rend le français inchangé. `cle` permet d'indexer un texte long
 * par identifiant plutôt que par son contenu — c'est ce dont le contenu
 * narratif aura besoin, une phrase de trois lignes faisant une mauvaise clé.
 */
export function t(fr, { cle } = {}) {
  if (langue === LANGUE_DEFAUT) return fr;
  const dico = TRADUCTIONS[langue];
  if (!dico) return fr;
  const trouve = (cle && dico[cle]) || dico[fr];
  return trouve || fr;
}

/** Combien reste-t-il à traduire : utile pour suivre l'avancement. */
export function couverture(langue2) {
  const dico = TRADUCTIONS[langue2] || {};
  return Object.keys(dico).length;
}
