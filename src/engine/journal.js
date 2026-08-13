import { tirerTexte as tirer, hasardTexte } from "./alea.js";
import { fmtArgent, fmtNb, fmtPct, tresorerie } from "./formules.js";

/**
 * La Gazette du Balancier — le trimestre raconté en une de journal.
 *
 * Trois mécanismes tiennent la variété, dans l'ordre d'importance :
 *
 * 1. **Une mémoire de ce qui a déjà fait la une.** C'était la vraie cause du
 *    « le journal parle toujours des mêmes choses » : les poids étant
 *    déterministes, la même situation gagnait systématiquement. Une famille
 *    récemment titrée est fortement pénalisée, ce qui force la rotation même
 *    quand la marque ronronne.
 * 2. **Un catalogue large**, nourri de tout ce que le trimestre produit — pas
 *    seulement les ventes et l'aléa : un modèle qui sort d'étude, une
 *    complication maîtrisée, un départ, une jauge qui franchit un palier, la
 *    dette, l'impôt, l'âge de la maison, la saison.
 * 3. **Des variantes par famille**, pour que deux passages sur le même sujet ne
 *    donnent pas la même phrase.
 */

const SAISONS = { 1: "Hiver", 2: "Printemps", 3: "Été", 4: "Automne" };

/**
 * Taille de la mémoire de la Gazette, en entrées (deux par trimestre : la une
 * et le second article). Soit environ quatre trimestres de recul.
 */
export const MEMOIRE_JOURNAL = 8;

const un = (arr) => tirer(arr);

/**
 * Les aléas portent leurs propres titres de presse (champ `presse` du
 * catalogue) : un aléa est écrit du point de vue du joueur, un journal parle à
 * la troisième personne. Ce tableau ne sert plus que de filet de sécurité pour
 * une entrée qui n'en aurait pas.
 */
const TITRES_ALEA = {
  celebrite: ["UNE STAR AU POIGNET", "APERÇUE EN COUVERTURE", "LE POIGNET QUI FAIT PARLER"],
  tiktok: ["LA VIDÉO QUI S'EMBALLE", "SUCCÈS VIRAL INATTENDU", "LES RÉSEAUX S'EN MÊLENT"],
  contrefacon: ["DES COPIES EN CIRCULATION", "LA CONTREFAÇON S'INVITE", "FAUSSES PIÈCES SAISIES"],
  cambriolage: ["ATELIER CAMBRIOLÉ", "VOL DANS LES RÉSERVES", "UNE NUIT AGITÉE À L'ÉTABLI"],
  demission: ["UN DÉPART À L'ATELIER", "L'ÉTABLI PERD UNE MAIN", "DÉBAUCHAGE CHEZ LE VOISIN"],
  retard: ["LES COMPOSANTS N'ARRIVENT PAS", "CHAÎNE D'APPROVISIONNEMENT GRIPPÉE", "L'ATTENTE DES FOURNITURES"],
  chf: ["LE FRANC S'ENVOLE", "LA MONNAIE PÈSE SUR LES COÛTS", "CHANGE DÉFAVORABLE"],
  article: ["LA PRESSE SPÉCIALISÉE APPLAUDIT", "BEL ARTICLE DANS LA PRESSE", "UN PAPIER QUI FAIT DU BIEN"],
  recession: ["LE MARCHÉ SE CONTRACTE", "RÉCESSION : LA DEMANDE RECULE", "LES CLIENTS SE FONT RARES"],
  collectionneur: ["UN COLLECTIONNEUR PASSE COMMANDE", "COMMANDE FERME D'UN AMATEUR", "UNE SÉRIE POUR UN SEUL HOMME"],
};

/** De quoi remplir une page quand le trimestre n'a rien produit de saillant. */
const AMBIANCE_SAISON = {
  1: [
    "Les ateliers rouvrent après les fêtes, les carnets sont vides et tout est à refaire.",
    "Janvier, mois des inventaires et des résolutions qu'on ne tiendra pas.",
    "Le marché de janvier ne dit rien de l'année : la profession le sait, et le répète chaque année.",
  ],
  2: [
    "La saison des salons bat son plein ; on s'y montre autant qu'on y vend.",
    "Le printemps est la saison des annonces. Tout le monde a quelque chose à dévoiler.",
    "Les commandes du printemps décideront des embauches de l'automne.",
  ],
  3: [
    "L'été vide les ateliers et ralentit les livraisons. C'est ainsi chaque année.",
    "Juillet : la profession part en vacances, et le marché avec elle.",
    "Les horlogers sont aux Brenets ou en Italie. Les établis attendent.",
  ],
  4: [
    "Les fêtes approchent : c'est maintenant que se jouent les chiffres de l'année.",
    "L'automne remplit les vitrines. Ceux qui n'ont pas de stock le regretteront.",
    "Le dernier trimestre pèse le tiers de l'année. Il n'y a pas de rattrapage après.",
  ],
};

/** Notes de métier, par gamme : ce que le geste veut dire, et ce qu'il coûte. */
const NOTES_METIER = {
  grandpublic: [
    "Mouvement posé, boîtier fermé, contrôle de marche au banc : une heure par pièce, et pas une de plus. " +
      "C'est à ce prix qu'une montre reste accessible.",
    "Sur les grandes séries, tout se joue au dixième d'heure. Un geste économisé, c'est une marge sauvée.",
  ],
  lifestyle: [
    "Deux heures par pièce : le temps d'un vrai contrôle esthétique, d'un bracelet ajusté, d'un emballage soigné.",
    "Le client de cette gamme n'ouvrira jamais le fond de sa montre. Il regardera le cadran tous les jours.",
  ],
  connaisseurs: [
    "Anglage des ponts à la lime, côtes de Genève, réglage en cinq positions : douze heures d'établi par pièce. " +
      "Le connaisseur retournera la montre pour vérifier.",
    "Un amateur averti reconnaît un angle rentrant fait à la main. C'est précisément ce qu'il paie.",
  ],
  bling: [
    "Sertissage pierre à pierre, polissage miroir : près d'une semaine de travail pour une seule montre.",
    "À ce niveau, la pierre coûte moins cher que la main qui la pose.",
  ],
};

/** Ce qui se dit dans la profession, sans jamais nommer personne. */
const RUMEURS = [
  "Un atelier de la vallée cherche un régleur depuis huit mois. Le métier ne se transmet plus assez vite.",
  "Les délais de livraison des ébauches s'allongent partout. Chacun accuse son voisin d'avoir sur-commandé.",
  "Une maison centenaire aurait refusé une offre de rachat. Personne ne confirme, tout le monde en parle.",
  "Le marché de l'occasion pèse désormais plus lourd que le neuf sur certaines références.",
  "Les salons coûtent de plus en plus cher et rapportent de moins en moins de commandes fermes.",
  "Un fournisseur de cadrans a fermé. Ses clients se partagent une capacité qui n'existe plus.",
  "On annonce chaque année la mort de la montre mécanique. Elle se porte toujours.",
  "Les grandes maisons recrutent les horlogers des petites en doublant les salaires. Rien de nouveau.",
];

/**
 * Construit tous les articles possibles pour ce trimestre, chacun avec sa
 * famille et son poids. Rien n'est imposé : c'est l'état du jeu qui décide de
 * la hiérarchie.
 */
function articlesPossibles({ rap, gs, actions, marque, monde, faitsMonde }) {
  const arts = [];
  const tres = tresorerie({ ...gs, cash: rap.cash, journal: [...gs.journal, { resultat: rap.resultatNet }] });
  const vendues = rap.lignes.reduce((s, l) => s + l.vendues, 0);
  const stock = rap.lignes.reduce((s, l) => s + l.stock, 0);
  const rupture = rap.lignes.find((l) => l.vendues > 0 && l.stock === 0);
  const vieillissant = rap.lignes.find((l) => l.fraicheur < 0.5);
  const age = rap.annee - 2015;
  const effectif = Object.values(rap.employes || {}).reduce((s, n) => s + n, 0);
  const MAJ = marque.toUpperCase();

  // `source` sert au rapport à ne pas répéter ce que le journal a déjà titré ;
  // `famille` sert à la mémoire anti-répétition.
  const ajoute = (famille, poids, titre, texte, source = null) =>
    arts.push({ famille, poids, titre, texte, source });

  // --- La marque en danger : rien ne passe devant.
  if (tres.danger) {
    ajoute("danger", 100,
      un([MAJ + " : LES COMPTES INQUIÈTENT", "TRÉSORERIE SOUS TENSION CHEZ " + MAJ, MAJ + " JOUE SA SURVIE"]),
      "Le trimestre se solde par " + fmtArgent(-rap.resultatNet) + " de pertes. Au rythme actuel, la maison " +
        "n'a plus que quelques trimestres devant elle. Les fournisseurs commencent à poser des questions."
    );
  }

  // --- Le monde extérieur.
  if (rap.evt) ajoute("evt", 90, rap.evt.titre.toUpperCase(), rap.evt.texte, "evt");
  // La démission a son propre article, plus précis (il nomme le poste) : sans
  // cette exception, le même départ occuperait deux colonnes du même numéro.
  if (rap.alea && !(rap.alea.id === "demission" && rap.depart)) {
    ajoute("alea", rap.alea.id === "celebrite" || rap.alea.id === "tiktok" ? 80 : 62,
      un(rap.alea.presse || TITRES_ALEA[rap.alea.id] || [rap.alea.titre.toUpperCase()]),
      rap.alea.texte, "alea");
  }

  // --- L'atelier : ce qui en sort, ce qu'on y apprend, qui le quitte.
  for (const nom of rap.modelesPrets || []) {
    ajoute("sortie", 76,
      un([
        "LA « " + nom.toUpperCase() + " » EST PRÊTE",
        "PREMIÈRE SORTIE POUR LA « " + nom.toUpperCase() + " »",
        MAJ + " DÉVOILE LA « " + nom.toUpperCase() + " »",
      ]),
      un([
        "Sortie d'étude après plusieurs trimestres d'établi. Reste à lui trouver des acheteurs.",
        "Les premiers exemplaires ont quitté l'atelier. La suite se joue en vitrine.",
        "L'atelier a livré ce qu'on lui demandait. Le marché tranchera.",
      ])
    );
  }
  if (rap.acquis) {
    ajoute("savoirfaire", 74,
      rap.acquis.type === "materiau"
        ? un([MAJ + " TRAVAILLE LE " + rap.acquis.nom.toUpperCase(), "LE " + rap.acquis.nom.toUpperCase() + " ENTRE À L'ATELIER"])
        : un(["MAÎTRISE DE LA " + (rap.acquis.famille || rap.acquis.nom).toUpperCase(), MAJ + " S'ATTAQUE À LA COMPLICATION"]),
      rap.acquis.type === "materiau"
        ? "Après des mois d'essais, la maison sait désormais travailler ce matériau. " +
          un(["Les nouvelles références pourront en profiter.", "Peu d'ateliers de cette taille s'y risquent."])
        : "La complication est au point — « " + rap.acquis.nom + " ». " +
          un(["Peu de maisons de cette taille en sont capables.", "Le savoir-faire s'installe, et ça se verra au prix."])
    );
  }
  if (rap.depart) {
    ajoute("depart", 58,
      un(["UN " + rap.depart.toUpperCase() + " QUITTE LA MAISON", "DÉPART À L'ÉTABLI"]),
      un([
        "Débauché par un concurrent. Le poste est à repourvoir, et le savoir-faire part avec la personne.",
        "Le carnet d'adresses de la profession est court : tout le monde saura d'où il vient.",
      ]),
      "alea"
    );
  }
  if (rap.encadrement && rap.encadrement.manque > 0) {
    ajoute("encadrement", 50,
      un(["L'ATELIER TOURNE MAL", "DÉSORGANISATION EN PRODUCTION", "TROP D'ÉTABLIS, PAS ASSEZ DE CHEFS"]),
      "Il manque " + rap.encadrement.manque + " chef" + (rap.encadrement.manque > 1 ? "s" : "") +
        " d'atelier. L'équipe ne rend que " + fmtPct(rap.encadrement.efficacite) + " de ses heures — " +
        "le reste se perd en allées et venues."
    );
  }
  if (rap.capDepassee) {
    ajoute("saturation", 48,
      un(["L'ATELIER NE SUIT PLUS", "CAPACITÉ SATURÉE CHEZ " + MAJ]),
      "La production planifiée dépasse ce que les établis peuvent absorber. " +
        un(["Il faudra agrandir, ou renoncer.", "On produit au prorata, et on livre en retard."])
    );
  }
  if (effectif >= 10 && effectif % 10 < 2) {
    ajoute("effectif", 40,
      un([MAJ + " PASSE LA BARRE DES " + effectif, "L'ATELIER COMPTE " + effectif + " PERSONNES"]),
      un([
        "Ce n'est plus un établi, c'est une maison.",
        "La masse salariale est devenue le premier poste de dépense.",
        "Il a fallu apprendre à déléguer.",
      ])
    );
  }

  // --- Le commerce.
  if (rupture) {
    ajoute("rupture", 66,
      un([
        "LA « " + rupture.nom.toUpperCase() + " » INTROUVABLE",
        "RUPTURE SUR LA « " + rupture.nom.toUpperCase() + " »",
        "LES VITRINES SE VIDENT",
      ]),
      "Les " + fmtNb(rupture.vendues) + " pièces produites sont parties. " +
        un([
          "Les détaillants relancent, les clients patientent.",
          "Une liste d'attente s'organise, ce qui n'a jamais nui à une marque.",
          "Chez " + marque + ", on hésite entre fierté et embarras.",
        ])
    );
  }
  if (stock > vendues * 2 && stock > 50) {
    ajoute("surstock", 52,
      un(["LES RÉSERVES DE " + MAJ + " GONFLENT", "DU STOCK, ET PEU D'ACHETEURS", "L'INVENDU S'ACCUMULE"]),
      fmtNb(stock) + " pièces dorment en réserve pour " + fmtNb(vendues) + " vendues ce trimestre. " +
        un([
          "La production a pris de l'avance sur le marché, ce qui coûte cher en trésorerie.",
          "Chaque pièce en réserve est de l'argent immobilisé.",
        ])
    );
  }
  if (vieillissant) {
    ajoute("vieillissement", 46,
      un(["LA « " + vieillissant.nom.toUpperCase() + " » A FAIT SON TEMPS", "UNE RÉFÉRENCE QUI S'ESSOUFFLE"]),
      "Le modèle ne séduit plus comme avant : " + fmtPct(vieillissant.fraicheur) + " de fraîcheur seulement. " +
        un(["Un facelift s'impose, ou une remplaçante.", "Les vitrines réclament du neuf."])
    );
  }
  if (rap.lignes.length > 0 && vendues === 0) {
    ajoute("zero", 64,
      un(["AUCUNE VENTE CE TRIMESTRE", "LE SILENCE COMMERCIAL", "PERSONNE N'EST VENU"]),
      "Pas une pièce n'a trouvé preneur. " +
        un([
          "Le prix, la notoriété ou la distribution : l'un des trois manque, et il faudra trancher.",
          "Les cartons sont restés fermés dans l'arrière-boutique.",
        ])
    );
  }
  if (rap.resultatNet > 0 && rap.revenus > 0 && rap.resultatNet > rap.revenus * 0.25) {
    ajoute("resultat", 58,
      un([MAJ + " PASSE DANS LE VERT", "EXERCICE SOLIDE POUR " + MAJ, "LES AFFAIRES REPRENNENT CHEZ " + MAJ]),
      fmtArgent(rap.revenus) + " encaissés, " + fmtArgent(rap.resultatNet) + " de résultat. " +
        un([
          "De quoi envisager la suite autrement.",
          "L'atelier peut souffler.",
          "On parlera d'investissement au prochain conseil.",
        ])
    );
  }
  if (rap.commissions > 0 && rap.commissions > rap.revenus * 0.35) {
    ajoute("marge", 42,
      un(["LES REVENDEURS SE SERVENT", "LA MARGE PART AILLEURS"]),
      fmtArgent(rap.commissions) + " sont restés chez les détaillants ce trimestre, contre " +
        fmtArgent(rap.revenus) + " encaissés par la maison. " +
        un(["Le volume a un prix.", "C'est le tarif du réseau, et il ne se négocie pas."])
    );
  }

  // --- Les jauges qui franchissent un palier : une seule fois chacune.
  const palier = (v) => (v >= 75 ? 75 : v >= 50 ? 50 : v >= 25 ? 25 : 0);
  if (palier(rap.noto) > palier(gs.noto)) {
    ajoute("noto", 56,
      un([MAJ + " SORT DE L'ANONYMAT", "ON COMMENCE À CONNAÎTRE " + MAJ, "LE NOM CIRCULE"]),
      "La notoriété franchit les " + palier(rap.noto) + " points. " +
        un(["Les détaillants rappellent d'eux-mêmes.", "On cite la marque sans avoir à l'expliquer."])
    );
  }
  if (palier(rap.cred) > palier(gs.cred)) {
    ajoute("cred", 54,
      un(["LA PROFESSION PREND " + MAJ + " AU SÉRIEUX", "CRÉDIBILITÉ ACQUISE"]),
      "La presse spécialisée ne parle plus de la maison comme d'un amateur. " +
        un(["Ça se paie en années, pas en francs.", "C'est le capital le plus lent à bâtir."])
    );
  }
  if (rap.des >= 60 && gs.des < 60) {
    ajoute("desirabilite", 54,
      un(["ON S'ARRACHE LES PIÈCES DE " + MAJ, "LA COTE MONTE"]),
      "Le marché de l'occasion s'anime et les listes d'attente s'allongent. " +
        un(["La rareté travaille pour la marque.", "C'est le moment de ne rien brader."])
    );
  }
  if (rap.savoir >= 60 && gs.savoir < 60) {
    ajoute("savoirjauge", 52,
      un(["UN VRAI SAVOIR-FAIRE MAISON", "L'ÉTABLI A APPRIS"]),
      "Le tour de main est là. Les pièces sortent mieux finies, et coûtent moins cher à produire."
    );
  }

  // --- Le calendrier et les comptes.
  if (age > 0 && age % 5 === 0 && rap.t === 4) {
    ajoute("anniversaire", 60,
      un([MAJ + " FÊTE SES " + age + " ANS", age + " ANS DE MAISON"]),
      un([
        "Peu de marques fondées la même année sont encore là.",
        "Un anniversaire se célèbre avec une pièce, pas avec un discours.",
        "L'occasion de regarder le chemin parcouru — et celui qui reste.",
      ])
    );
  }
  if (gs.dette > 800000) {
    ajoute("dette", 48,
      un(["L'ARDOISE S'ALLONGE", MAJ + " S'ENDETTE", "LA BANQUE EN PREMIÈRE LIGNE"]),
      fmtArgent(gs.dette) + " de dettes au compteur, " + fmtArgent(rap.interets) + " d'intérêts sur le seul " +
        "trimestre. " + un(["Le banquier est devenu un associé silencieux.", "Chaque pièce vendue rembourse d'abord la banque."])
    );
  }
  if (rap.impot > 0) {
    ajoute("impot", 36,
      un(["LE FISC PASSE À LA CAISSE", "IMPÔT SUR L'EXERCICE"]),
      fmtArgent(rap.impot) + " d'impôt sur le bénéfice de l'année. " +
        un(["C'est le prix du succès.", "Le comptable avait prévenu."])
    );
  }

  // --- Ce que le fondateur a fait de son temps, s'il a fait quelque chose.
  const gros = (actions || []).filter((a) => ["rd", "recherche", "canal", "atelier", "embauche"].includes(a));
  if (gros.length > 0) {
    const quoi = {
      rd: "met une nouvelle référence en chantier",
      recherche: "engage un programme technique",
      canal: "élargit son réseau de vente",
      atelier: "agrandit son atelier",
      embauche: "recrute",
    };
    ajoute("decision", 44,
      MAJ + " " + quoi[gros[0]].toUpperCase(),
      "La maison " + gros.map((a) => quoi[a]).join(", ") + ". " +
        un(["Un pari sur les prochaines années.", "L'atelier prend de l'ampleur.", "La profession observe."])
    );
  }

  // --- Le classement, qui est le but du jeu et dont le journal ne parlait pas.
  const rangs = gs.rangs || [];
  if (rap.t === 1 && rangs.length >= 2) {
    const actuel = rangs[rangs.length - 1];
    const avant = rangs[rangs.length - 2];
    const gagne = avant - actuel;
    const SEUILS = [1000, 500, 200, 100, 50];
    const franchi = SEUILS.find((s) => avant > s && actuel <= s);
    if (franchi) {
      ajoute("classement", 78,
        un([MAJ + " ENTRE DANS LES " + franchi, "LE SEUIL DES " + franchi + " EST FRANCHI"]),
        "Pour la première fois, la maison figure parmi les " + franchi + " premières marques mondiales. " +
          "Il y a " + age + " ans, elle n'existait pas."
      );
    } else if (Math.abs(gagne) >= Math.max(5, avant * 0.05)) {
      ajoute("classement", 68,
        gagne > 0
          ? un([MAJ + " GAGNE " + gagne + " PLACES", "L'ASCENSION CONTINUE", MAJ + " REMONTE AU CLASSEMENT"])
          : un([MAJ + " RECULE AU CLASSEMENT", -gagne + " PLACES PERDUES", "LE CLASSEMENT SE REFERME"]),
        gagne > 0
          ? "De la " + avant + "ᵉ à la " + actuel + "ᵉ place en un an. " +
            un([
              "Ce sont les indépendants qu'on double d'abord. Les groupes viennent après.",
              "Le classement ne récompense que le chiffre. La maison en fait, désormais.",
              "À ce rythme, la barre suivante tombera avant dix ans.",
            ])
          : "La maison perd " + -gagne + " places. " +
            un([
              "Les concurrents ont grandi plus vite, ou la maison a stagné — le classement ne fait pas la différence.",
              "Une année sans nouveauté se paie l'année suivante.",
            ])
      );
    }
  }

  // --- Les concurrents ailleurs que dans le filet de bas de page.
  if (monde && rangs.length) {
    const rang = rangs[rangs.length - 1];
    const tries = [...monde.independants].sort((a, b) => a.rang - b.rang);
    const poursuivant = tries.filter((m) => m.rang > rang).slice(0, 1)[0];
    const devant = tries.filter((m) => m.rang < rang).slice(-1)[0];
    const fait = (faitsMonde || []).find((f) => f.type === "difficulte" || f.type === "hausse");
    const candidats = [];
    if (poursuivant && poursuivant.rang - rang < 40) {
      candidats.push([
        un(["UN CONCURRENT SE RAPPROCHE", poursuivant.nom.toUpperCase() + " GAGNE DU TERRAIN"]),
        poursuivant.nom + " n'est plus qu'à " + (poursuivant.rang - rang) + " places. " +
          "Les deux maisons visent les mêmes clients.",
      ]);
    }
    if (devant) {
      candidats.push([
        un(["LA PLACE AU-DESSUS", "CE QUI SÉPARE DE " + devant.nom.toUpperCase()]),
        devant.nom + " occupe la " + devant.rang + "ᵉ place. " +
          un(["Sur ce marché, on ne double personne sans que quelqu'un recule.", "C'est la prochaine à prendre."]),
      ]);
    }
    if (fait) {
      candidats.push([
        fait.type === "difficulte"
          ? un([fait.marque.toUpperCase() + " DÉVISSE", "UNE MAISON EN DIFFICULTÉ"])
          : un([fait.marque.toUpperCase() + " S'ENVOLE", "UN INDÉPENDANT QUI MONTE"]),
        fait.texte,
      ]);
    }
    if (candidats.length) {
      const c = candidats[Math.floor(hasardTexte() * candidats.length)];
      ajoute("concurrence", 44, c[0], c[1]);
    }
  }

  // --- Le fond de tiroir. Il est volontairement varié : quand la maison
  // ronronne, c'est lui qui fait la une, et c'est là que la lassitude naissait.
  // Cinq familles distinctes se relaient au lieu d'une seule.
  if (vendues > 0) {
    ajoute("courant", 18,
      un(["LES VENTES DU TRIMESTRE", "LE CARNET DE COMMANDES", "CE QUI EST SORTI DE L'ATELIER"]),
      fmtNb(vendues) + " pièces vendues, " + fmtArgent(rap.revenus) + " encaissés. " +
        un(["Le métier continue.", "Sans éclat, mais sans accroc.", "L'atelier tourne à son rythme."])
    );
  } else {
    ajoute("courant", 16,
      un(["TRIMESTRE SANS RELIEF", "RIEN À SIGNALER", "L'ÉTABLI TOURNE"]),
      rap.lignes.length === 0
        ? "La collection est encore en étude. On attend."
        : "Aucune vente enregistrée. Le trimestre restera une ligne blanche."
    );
  }

  // Comparaison avec l'an dernier : le même trimestre, un an plus tôt.
  const anPasse = gs.journal.find((l) => l.annee === rap.annee - 1 && l.t === rap.t);
  if (anPasse && anPasse.revenus > 0) {
    const ecart = (rap.revenus - anPasse.revenus) / anPasse.revenus;
    ajoute("retro", 20,
      Math.abs(ecart) < 0.1
        ? un(["UNE ANNÉE POUR RIEN ?", "STABLE, POUR LE MEILLEUR ET POUR LE PIRE"])
        : ecart > 0
          ? un(["MIEUX QUE L'AN DERNIER", "LA PROGRESSION SE CONFIRME"])
          : un(["EN RETRAIT SUR UN AN", "LE TRIMESTRE DÉÇOIT"]),
      "À la même saison l'an dernier, la maison encaissait " + fmtArgent(anPasse.revenus) + ". " +
        (Math.abs(ecart) < 0.1
          ? un(["Douze mois plus tard, presque rien n'a bougé.", "La stabilité rassure les banquiers et personne d'autre."])
          : (ecart > 0 ? "Soit " + fmtPct(ecart) + " de mieux. " : "Soit " + fmtPct(-ecart) + " de moins. ") +
            un(["Reste à savoir si la tendance tient.", "La profession regardera l'exercice complet."]))
    );
  }

  // Une note de métier : ce que le geste veut dire, pour ce que fait la maison.
  const segsActifs = [...new Set(rap.lignes.map((l) => l.seg).filter(Boolean))];
  if (segsActifs.length > 0) {
    ajoute("metier", 15,
      un(["CE QUE DEMANDE LE GESTE", "L'ÉTABLI, MODE D'EMPLOI", "CHRONIQUE DE L'ATELIER"]),
      un(NOTES_METIER[segsActifs[Math.floor(hasardTexte() * segsActifs.length)]] || NOTES_METIER.lifestyle)
    );
  }

  // La rumeur de la profession : ce qui se dit ailleurs, sans nommer personne.
  ajoute("profession", 13,
    un(["ON EN PARLE DANS LA VALLÉE", "BRUITS D'ATELIERS", "LA PROFESSION EN BREF"]),
    un(RUMEURS)
  );

  // Une chronique de saison, toujours disponible pour compléter la page.
  ajoute("saison", 12,
    un(["LA SAISON DANS LA PROFESSION", "AIR DU TEMPS", "CARNET DE LA PROFESSION"]),
    un(AMBIANCE_SAISON[rap.t] || AMBIANCE_SAISON[1])
  );

  return arts;
}

/**
 * Le numéro du trimestre. La une est le fait le plus marquant, suivie d'un ou
 * deux articles et d'un filet sur le reste de l'industrie.
 *
 * `familles` est la mémoire transmise au trimestre suivant : c'est elle qui
 * empêche le journal de titrer six fois de suite sur le même sujet.
 */
export function journalTrimestre({ rap, gs, actions = [], marque, breve }) {
  const recentes = gs.journalRecent || [];
  const arts = articlesPossibles({ rap, gs, actions, marque: marque || "la maison" })
    .map((a) => {
      // La pénalité compte les passages récents, elle ne regarde pas seulement
      // le dernier : un sujet qui revient trois fois s'efface complètement,
      // quitte à laisser la une à un simple filet de fond de page. « danger »
      // est pénalisé moins vite — une maison qui coule reste une nouvelle tant
      // qu'elle coule — mais il est pénalisé quand même, sinon il monopolise
      // toutes les unes de l'agonie.
      const passages = recentes.filter((f) => f === a.famille).length;
      const malus = passages * (a.famille === "danger" ? 30 : 34);
      // Un peu de bruit : deux trimestres identiques ne donnent pas exactement
      // le même journal.
      return { ...a, poids: a.poids + hasardTexte() * 10 - malus };
    })
    .sort((a, b) => b.poids - a.poids);

  const retenus = arts.slice(0, 3);
  return {
    saison: (SAISONS[rap.t] || "Hiver") + " " + rap.annee,
    numero: (rap.annee - 2015) * 4 + rap.t,
    une: retenus[0],
    articles: retenus.slice(1),
    filet: breve,
    // Ce que le journal a déjà dit : le rapport n'y revient pas.
    sources: retenus.map((a) => a.source).filter(Boolean),
    // Mémoire anti-répétition, à reporter dans l'état du trimestre suivant.
    familles: retenus.map((a) => a.famille),
  };
}
