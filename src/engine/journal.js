import { tirerTexte as tirer, hasardTexte } from "./alea.js";
import { fmtArgent, fmtNb, tresorerie } from "./formules.js";

/**
 * La Gazette du Balancier — le trimestre raconté en une de journal.
 *
 * La chronique en paragraphes ne tenait pas : « souvent la même, on ne la lit
 * plus après trois tours ». Deux causes, traitées ici :
 *
 * 1. **L'ordre était figé** — toujours les actions, puis l'événement, puis les
 *    chiffres. Ici chaque fait candidat porte un poids, et c'est le plus fort
 *    qui fait la une. Un trimestre calme et un trimestre de crise ne se lisent
 *    plus du tout pareil.
 * 2. **Tout était raconté** — même ce qui n'avait aucun intérêt. Un journal
 *    trie : on garde la une, deux articles, un filet. Le reste passe à la
 *    trappe.
 */

const SAISONS = { 1: "Hiver", 2: "Printemps", 3: "Été", 4: "Automne" };

/**
 * Les aléas sont écrits du point de vue du joueur (« votre montre »). Un journal
 * parle à la troisième personne : on leur donne ici leur version de presse.
 */
const TITRES_ALEA = {
  celebrite: ["UNE STAR AU POIGNET", "APERÇUE EN COUVERTURE", "LE POIGNET QUI FAIT PARLER"],
  tiktok: ["LA VIDÉO QUI S'EMBALLE", "SUCCÈS VIRAL INATTENDU"],
  contrefacon: ["DES COPIES EN CIRCULATION", "LA CONTREFAÇON S'INVITE"],
  cambriolage: ["ATELIER CAMBRIOLÉ", "VOL DANS LES RÉSERVES"],
  demission: ["UN DÉPART À L'ATELIER", "L'ÉTABLI PERD UNE MAIN"],
  retard: ["LES COMPOSANTS N'ARRIVENT PAS", "CHAÎNE D'APPROVISIONNEMENT GRIPPÉE"],
  chf: ["LE FRANC S'ENVOLE", "LA MONNAIE PÈSE SUR LES COÛTS"],
  article: ["LA PRESSE SPÉCIALISÉE APPLAUDIT", "BEL ARTICLE DANS LA PRESSE"],
  recession: ["LE MARCHÉ SE CONTRACTE", "RÉCESSION : LA DEMANDE RECULE"],
  collectionneur: ["UN COLLECTIONNEUR PASSE COMMANDE", "COMMANDE FERME D'UN AMATEUR"],
};

const un = (arr) => tirer(arr);

/**
 * Construit tous les articles possibles pour ce trimestre, chacun avec son
 * poids. Rien n'est imposé : c'est l'état du jeu qui décide de la hiérarchie.
 */
function articlesPossibles({ rap, gs, actions, marque }) {
  const arts = [];
  const tres = tresorerie({ ...gs, cash: rap.cash, journal: [...gs.journal, { resultat: rap.resultatNet }] });
  const vendues = rap.lignes.reduce((s, l) => s + l.vendues, 0);
  const stock = rap.lignes.reduce((s, l) => s + l.stock, 0);
  const rupture = rap.lignes.find((l) => l.vendues > 0 && l.stock === 0);
  // `source` sert au rapport à ne pas répéter ce que le journal a déjà titré.
  const ajoute = (poids, titre, texte, source = null) => arts.push({ poids, titre, texte, source });

  // --- La marque en danger : rien ne passe devant.
  if (tres.danger) {
    ajoute(100,
      un([
        marque + " : LES COMPTES INQUIÈTENT",
        "TRÉSORERIE SOUS TENSION CHEZ " + marque.toUpperCase(),
        marque + " JOUE SA SURVIE",
      ]),
      "Le trimestre se solde par " + fmtArgent(-rap.resultatNet) + " de pertes. Au rythme actuel, la maison " +
        "n'a plus que quelques trimestres devant elle. Les fournisseurs commencent à poser des questions."
    );
  }

  // --- L'événement historique prime sur tout le reste.
  if (rap.evt) {
    ajoute(90, rap.evt.titre.toUpperCase(), rap.evt.texte, "evt");
  }

  // --- Un aléa fait un bon titre s'il n'y a pas mieux.
  if (rap.alea) {
    ajoute(rap.alea.id === "celebrite" || rap.alea.id === "tiktok" ? 80 : 62,
      un(TITRES_ALEA[rap.alea.id] || [rap.alea.titre.toUpperCase()]),
      rap.alea.texte,
      "alea"
    );
  }

  // --- Rupture de stock : la meilleure nouvelle possible pour une marque.
  if (rupture) {
    ajoute(66,
      un([
        "LA « " + rupture.nom.toUpperCase() + " » INTROUVABLE",
        "RUPTURE SUR LA « " + rupture.nom.toUpperCase() + " »",
      ]),
      "Les " + fmtNb(rupture.vendues) + " pièces produites sont parties. Les détaillants relancent, les " +
        "clients patientent. Chez " + marque + ", on hésite entre fierté et embarras."
    );
  }

  // --- Surstock : l'inverse, et ça se voit.
  if (stock > vendues * 2 && stock > 50) {
    ajoute(52,
      un(["LES RÉSERVES DE " + marque.toUpperCase() + " GONFLENT", "DU STOCK, ET PEU D'ACHETEURS"]),
      fmtNb(stock) + " pièces dorment en réserve pour " + fmtNb(vendues) + " vendues ce trimestre. " +
        "La production a pris de l'avance sur le marché, ce qui coûte cher en trésorerie."
    );
  }

  // --- Un résultat qui décolle.
  if (rap.resultatNet > 0 && rap.revenus > 0 && rap.resultatNet > rap.revenus * 0.25) {
    ajoute(58,
      un([
        marque.toUpperCase() + " PASSE DANS LE VERT",
        "EXERCICE SOLIDE POUR " + marque.toUpperCase(),
        "LES AFFAIRES REPRENNENT CHEZ " + marque.toUpperCase(),
      ]),
      fmtArgent(rap.revenus) + " encaissés, " + fmtArgent(rap.resultatNet) + " de résultat. " +
        un([
          "De quoi envisager la suite autrement.",
          "L'atelier peut souffler.",
          "On parlera d'investissement au prochain conseil.",
        ])
    );
  }

  // --- Aucune vente du tout : c'est une information.
  if (rap.lignes.length > 0 && vendues === 0) {
    ajoute(64,
      un(["AUCUNE VENTE CE TRIMESTRE", "LE SILENCE COMMERCIAL"]),
      "Pas une pièce n'a trouvé preneur. " +
        un([
          "Le prix, la notoriété ou la distribution : l'un des trois manque, et il faudra trancher.",
          "Les cartons sont restés fermés dans l'arrière-boutique.",
        ])
    );
  }

  // --- Ce que le fondateur a fait de son temps, s'il a fait quelque chose.
  const gros = actions.filter((a) => ["rd", "recherche", "canal", "atelier", "embauche"].includes(a));
  if (gros.length > 0) {
    const quoi = {
      rd: "met une nouvelle référence en chantier",
      recherche: "engage un programme technique",
      canal: "élargit son réseau de vente",
      atelier: "agrandit son atelier",
      embauche: "recrute",
    };
    ajoute(44,
      marque.toUpperCase() + " " + quoi[gros[0]].toUpperCase(),
      "La maison " + gros.map((a) => quoi[a]).join(", ") + ". " +
        un([
          "Un pari sur les prochaines années.",
          "L'atelier prend de l'ampleur.",
          "La profession observe.",
        ])
    );
  }

  // --- Le fond de tiroir. Deux versions : « rien à signaler » ne se dit que
  // quand il ne s'est vraiment rien passé, pas sur un trimestre à 243 ventes.
  if (vendues > 0) {
    ajoute(14,
      un(["LES VENTES DU TRIMESTRE", "LE CARNET DE COMMANDES", "CE QUI EST SORTI DE L'ATELIER"]),
      fmtNb(vendues) + " pièces vendues, " + fmtArgent(rap.revenus) + " encaissés. " +
        un(["Le métier continue.", "Sans éclat, mais sans accroc.", "L'atelier tourne à son rythme."])
    );
  } else {
    ajoute(12,
      un(["TRIMESTRE SANS RELIEF", "RIEN À SIGNALER", "L'ÉTABLI TOURNE"]),
      rap.lignes.length === 0
        ? "La collection est encore en étude. On attend."
        : "Aucune vente enregistrée. Le trimestre restera une ligne blanche."
    );
  }

  return arts;
}

/**
 * Le numéro du trimestre. La une est le fait le plus marquant, suivie d'un ou
 * deux articles et d'un filet sur le reste de l'industrie.
 */
export function journalTrimestre({ rap, gs, actions = [], marque, breve }) {
  const arts = articlesPossibles({ rap, gs, actions, marque: marque || "la maison" })
    // Un peu de bruit sur les poids : deux trimestres identiques ne donnent pas
    // exactement le même journal.
    .map((a) => ({ ...a, poids: a.poids + hasardTexte() * 8 }))
    .sort((a, b) => b.poids - a.poids);

  const numero = (rap.annee - 2015) * 4 + rap.t;
  const retenus = arts.slice(0, 3);
  return {
    saison: (SAISONS[rap.t] || "Hiver") + " " + rap.annee,
    numero,
    une: retenus[0],
    articles: retenus.slice(1),
    filet: breve,
    // Ce que le journal a déjà dit : le rapport n'y revient pas.
    sources: retenus.map((a) => a.source).filter(Boolean),
  };
}
