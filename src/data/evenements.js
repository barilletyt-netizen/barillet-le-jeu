// Événements historiques scriptés, aléas trimestriels et opportunités.
//
// La chronologie couvre chaque année de 2015 à 2065 sans trou. De 2015 à 2026
// les chiffres cités sont réels (sources FH, Deloitte, presse) : ne pas les
// arrondir, une partie de l'audience du jeu les connaît. À partir de 2027 c'est
// de la fiction plausible, calée sur les cycles observés de la branche.
//
// Chaque événement porte des `mods` : des modificateurs déclaratifs empilés par
// engine/effets.js. `duree` en trimestres, `null` = permanent. `immediat`
// applique un effet ponctuel sur les jauges au trimestre de l'événement.

const estSuisse = (g) => g.pays === "suisse";
const anciennete = (g) => g.annee - 2015;

export const EVENEMENTS = [
  // ---- 2015-2023 : ce que la branche a réellement traversé ----------------
  {
    annee: 2015, t: 1, id: "bns",
    titre: "La BNS lâche le taux plancher",
    texte: "Le 15 janvier, la Banque nationale abandonne le cours plancher de l'euro. Le franc s'envole de 20% en une matinée. Pour une industrie qui produit en francs et vend en euros et en dollars, c'est un séisme. L'année finira sur la première baisse des exportations depuis 2009.",
    mods: [
      { quoi: "couts", mult: 1.18, duree: null, si: estSuisse },
      { quoi: "couts", mult: 1.10, duree: null, si: (g) => !estSuisse(g) },
      { quoi: "demande", mult: 0.90, duree: 4, si: estSuisse },
    ],
  },
  {
    annee: 2015, t: 2, id: "appleWatch",
    titre: "Lancement de l'Apple Watch",
    texte: "Le quartz d'entrée de gamme prend un coup pendant deux ans.",
    mods: [
      { quoi: "demande", seg: ["grandpublic", "lifestyle"], mvt: ["quartz"], mult: 0.75, duree: 9 },
    ],
  },
  {
    annee: 2016, t: 3, id: "annee2016",
    titre: "La pire année dont on se souvienne",
    texte: "Les exportations reculent nettement, douze mois de baisse consécutifs, Hong Kong s'effondre d'un quart. Franc fort, anticorruption chinoise, touristes disparus, montres connectées : tout est arrivé en même temps. Les grandes maisons rachètent leurs propres stocks aux détaillants.",
    mods: [
      { quoi: "demande", mult: 0.82, duree: 2 },
      { quoi: "demande", seg: ["connaisseurs", "bling"], mult: 0.88, duree: 2 },
      { quoi: "portee", mult: 0.75, duree: 2 },
    ],
  },
  {
    annee: 2017, t: 1, id: "reprise2017",
    titre: "Reprise des exportations suisses",
    texte: "Le marché repart. La demande gagne 10% cette année.",
    mods: [{ quoi: "demande", mult: 1.10, duree: 4 }],
  },
  {
    annee: 2018, t: 3, id: "swatchBaselworld",
    titre: "Le premier groupe quitte Baselworld",
    texte: "Le plus gros exposant du salon historique annonce qu'il n'y reviendra pas, entraînant dix-sept marques avec lui. La question n'est plus de savoir si le salon change, mais s'il survit.",
    mods: [
      { quoi: "portee", mult: 0.92, duree: 8 },
      { quoi: "fixesAjout", montant: -1200, duree: null },
    ],
  },
  {
    annee: 2019, t: 2, id: "exodeBaselworld",
    titre: "L'exode",
    texte: "Les plus grands noms partent à leur tour pour un nouveau salon genevois. Un siècle de rendez-vous bâlois s'achève. Les indépendants doivent réinventer leur façon de se montrer — le commerce en ligne devient structurellement plus intéressant que les foires.",
    mods: [{ quoi: "portee", mult: 0.94, duree: null }],
  },
  {
    annee: 2020, t: 1, id: "covid",
    titre: "Pandémie de Covid-19",
    texte: "Salons annulés, boutiques fermées. Les ventes reculent de 40% toute l'année.",
    mods: [{ quoi: "demande", mult: 0.60, duree: 4 }],
  },
  {
    annee: 2021, t: 2, id: "bulle",
    titre: "Bulle spéculative",
    texte: "Connaisseurs et bling-bling s'envolent de 50% jusqu'à fin 2022.",
    mods: [{ quoi: "demande", seg: ["connaisseurs", "bling"], mult: 1.5, duree: 6 }],
  },
  {
    annee: 2022, t: 3, id: "picBulle",
    titre: "Le sommet, puis la bascule",
    texte: "Les cotes atteignent des niveaux que personne n'explique plus. Puis, au milieu de l'été, l'aiguille redescend. Ceux qui ont acheté au sommet l'ont fait pour revendre, et ils revendent tous en même temps.",
    mods: [
      { quoi: "demande", seg: ["connaisseurs", "bling"], mult: 1.4, duree: 1 },
      { quoi: "demande", seg: ["connaisseurs", "bling"], mult: 0.75, debut: 1, duree: 5 },
    ],
    immediat: () => ({ des: -8 }),
  },
  {
    annee: 2023, t: 1, id: "correction",
    titre: "Correction du marché gris",
    texte: "La fête est finie sur le haut de gamme.",
    mods: [{ quoi: "demande", seg: ["connaisseurs", "bling"], mult: 0.9, duree: 4 }],
  },

  // ---- 2024-2026 : faits réels vérifiés ----------------------------------
  {
    annee: 2024, t: 1, id: "chine2024",
    titre: "Le marché chinois décroche",
    texte: "Les exportations suisses vers la Chine s'effondrent de 26%, Hong Kong de 19%. Le client asiatique aspirationnel a disparu du jour au lendemain. Les États-Unis, eux, progressent encore.",
    mods: [
      { quoi: "demande", mult: 0.80, duree: 4 },
      { quoi: "demande", seg: ["connaisseurs", "bling"], mult: 0.90, duree: 4 },
    ],
  },
  {
    annee: 2024, t: 4, id: "volumes2024",
    titre: "Les volumes s'effondrent, la valeur tient",
    texte: "15,3 millions de pièces exportées, 1,6 million de moins qu'un an plus tôt. La branche vend moins de montres, mais plus cher. L'entrée de gamme suisse est en train de disparaître.",
    mods: [
      { quoi: "demande", seg: ["grandpublic"], mult: 0.85, duree: null },
      { quoi: "demande", seg: ["connaisseurs", "bling"], mult: 1.05, duree: null },
    ],
  },
  {
    annee: 2025, t: 3, id: "douane39",
    titre: "39% : le choc douanier américain",
    texte: "Washington frappe les importations suisses d'une surtaxe de 39% au 7 août. Le premier marché mondial devient d'un coup inaccessible. Les expéditions vers les États-Unis chutent de moitié.",
    mods: [
      { quoi: "demande", mult: 0.62, duree: 2, si: estSuisse },
      { quoi: "couts", mult: 1.10, duree: 2, si: estSuisse },
      { quoi: "demande", mult: 0.92, duree: 2, si: (g) => !estSuisse(g) },
      { quoi: "portee", mult: 0.70, duree: 2 },
    ],
  },
  {
    annee: 2025, t: 4, id: "douane15",
    titre: "Berne arrache un accord à 15%",
    texte: "Après trois allers-retours à Washington, la surtaxe retombe à 15%. Historiquement élevé, mais respirable. Les marques répercutent sur les prix américains et la demande tient.",
    // Annule `douane39` en le raccourcissant : ses mods durent 2 trimestres
    // depuis T3 2025, donc ils s'éteignent d'eux-mêmes au T1 2026. Ne reste
    // que la surcharge douanière permanente.
    mods: [{ quoi: "couts", mult: 1.04, duree: null }],
  },
  {
    annee: 2026, t: 1, id: "or5000",
    titre: "L'or franchit les 5000 dollars",
    texte: "Plus de 60% de hausse en cinq ans, un record annuel comme on n'en avait pas vu depuis les années 1970. Les maisons augmentent leurs prix or de 5 à 8% en cours d'année, l'acier ne bouge pas.",
    mods: [{ quoi: "materiau", mat: "or", mult: 2.2, duree: null }],
    immediat: (g) => (g.modeles.some((m) => m.materiau === "or") ? { des: +4 } : {}),
  },
  {
    annee: 2026, t: 2, id: "polarisation",
    titre: "La grande polarisation",
    texte: "Les montres au-delà de 50'000 francs pèsent 1,4% des volumes, 37% de la valeur et 89% de la croissance. Le milieu de gamme est pris en étau. Les volumes ont été divisés par deux en vingt ans.",
    mods: [
      { quoi: "demande", seg: ["grandpublic"], mult: 0.82, duree: null },
      { quoi: "demande", seg: ["lifestyle"], mult: 0.88, duree: null },
      { quoi: "demande", seg: ["connaisseurs"], mult: 1.18, duree: null },
      { quoi: "demande", seg: ["bling"], mult: 1.30, duree: null },
    ],
  },
  {
    annee: 2026, t: 4, id: "ebauches2026",
    titre: "Les ébauches renchérissent",
    texte: "Les fournisseurs de mouvements standards répercutent la hausse de leurs coûts. Assembler devient moins rentable qu'usiner soi-même — pour ceux qui en ont les moyens.",
    mods: [{ quoi: "mouvement", mvtId: "ebauche", mult: 1.25, duree: null }],
  },

  // ---- 2027-2065 : fiction plausible -------------------------------------
  {
    annee: 2027, t: 2, id: "apresDouane",
    titre: "L'après-douane",
    texte: "Les marques ont appris à produire au plus près de leurs marchés. Une partie de l'assemblage quitte discrètement la Suisse, et personne ne tient à en parler trop fort.",
    mods: [{ quoi: "couts", mult: 0.92, duree: null }],
    immediat: (g) => (estSuisse(g) ? { cred: -2 } : {}),
  },
  {
    annee: 2028, t: 2, id: "carbone",
    titre: "Taxe carbone sur les produits de luxe",
    texte: "Bruxelles impose une contribution climat sur les biens de luxe importés. Les maisons qui produisent local respirent, les autres paient.",
    mods: [
      { quoi: "fixesMult", mult: 1.06, duree: null, si: (g) => g.pays === "suisse" || g.pays === "france" },
      { quoi: "fixesMult", mult: 1.12, duree: null, si: (g) => g.pays !== "suisse" && g.pays !== "france" },
    ],
  },
  {
    annee: 2029, t: 4, id: "genZ",
    titre: "La génération Z redécouvre le mécanique",
    texte: "Une génération née avec l'écran au poignet s'entiche de ce qui tourne tout seul. Les réseaux se couvrent de vidéos d'échappements filmés en macro.",
    mods: [
      { quoi: "demande", seg: ["lifestyle"], mvt: ["ebauche", "manufacture"], mult: 1.35, duree: 12 },
      { quoi: "gainNoto", mult: 1.2, duree: 12 },
    ],
  },
  {
    annee: 2030, t: 1, id: "smartwatchPlateau",
    titre: "La montre connectée plafonne",
    texte: "Après quinze ans de croissance, le poignet connecté sature : tout le monde en a une, personne ne la renouvelle. La montre classique récupère une clientèle qu'elle croyait perdue.",
    mods: [
      { quoi: "demande", seg: ["grandpublic"], mult: 1.20, duree: null },
      { quoi: "demande", seg: ["lifestyle"], mult: 1.15, duree: null },
    ],
  },
  {
    annee: 2031, t: 1, id: "penurieSemi",
    titre: "Pénurie mondiale de composants électroniques",
    texte: "Plus de quartz, plus de modules, plus de piles. Les chaînes d'assemblage électronique s'arrêtent. Le mécanique, lui, n'a jamais eu besoin de silicium.",
    mods: [
      { quoi: "demande", mvt: ["quartz"], mult: 0.40, duree: 8 },
      { quoi: "demande", mvt: ["ebauche", "manufacture"], mult: 1.25, duree: 8 },
    ],
  },
  {
    annee: 2032, t: 4, id: "tracabilite",
    titre: "Traçabilité obligatoire des composants",
    texte: "Chaque pièce doit désormais être traçable de la mine à la vitrine. Les grandes maisons ont les systèmes, les petites paient des consultants.",
    mods: [{ quoi: "fixesAjout", montant: 8000, duree: null }],
    immediat: () => ({ cred: +4 }),
  },
  {
    annee: 2033, t: 3, id: "impression3d",
    titre: "Un boîtier imprimé décroche la certification chronomètre",
    texte: "Une jeune maison fait certifier une montre dont le boîtier sort d'une imprimante. La profession se déchire : progrès ou trahison ?",
    mods: [
      { quoi: "couts", mult: 0.92, duree: null },
      { quoi: "demande", seg: ["connaisseurs"], mult: 0.92, duree: 8 },
    ],
  },
  {
    annee: 2034, t: 2, id: "secondeMain",
    titre: "L'occasion dépasse le neuf",
    texte: "Pour la première fois, le marché de la montre d'occasion pèse plus lourd que celui du neuf. Les marques ouvrent leurs propres circuits de certification.",
    mods: [
      { quoi: "desEffet", mult: 1.20, duree: null },
      { quoi: "demande", seg: ["grandpublic"], mult: 0.88, duree: null },
    ],
  },
  {
    annee: 2035, t: 2, id: "inde",
    titre: "L'Inde devient le deuxième marché mondial",
    texte: "Trente ans de croissance ininterrompue, une classe moyenne massive et un goût prononcé pour le mécanique accessible. Le centre de gravité de l'industrie se déplace.",
    mods: [
      { quoi: "demande", mult: 1.18, duree: null },
      { quoi: "pool", mult: 1.20, duree: null },
    ],
  },
  {
    annee: 2036, t: 3, id: "salonUnique",
    titre: "Le salon unique",
    texte: "Après vingt ans de guerre des salons, la profession se range derrière un seul rendez-vous mondial. Y être devient obligatoire, ne pas y être devient une déclaration.",
    mods: [{ quoi: "portee", mult: 1.05, duree: null }],
  },
  {
    annee: 2037, t: 1, id: "coupeEbauche",
    titre: "Un géant coupe la fourniture d'ébauches",
    texte: "Le principal fournisseur de mouvements du marché annonce qu'il réserve sa production à ses propres marques. Des centaines d'assembleurs se retrouvent sans moteur.",
    mods: [
      { quoi: "mouvement", mvtId: "ebauche", mult: 1.9, duree: null },
      { quoi: "demande", mvt: ["manufacture"], mult: 1.30, duree: null },
    ],
  },
  {
    annee: 2038, t: 1, id: "microMarques",
    titre: "La vague des micro-marques",
    texte: "Des centaines de marques nées en ligne inondent le segment accessible. Beaucoup disparaîtront, mais le marché est devenu illisible pour le client.",
    mods: [
      { quoi: "demande", seg: ["grandpublic", "lifestyle"], mult: 0.85, duree: null },
      { quoi: "gainNoto", mult: 0.75, duree: null },
    ],
  },
  {
    annee: 2039, t: 3, id: "iaMouvement",
    titre: "Une IA conçoit un mouvement primé",
    texte: "Le calibre récompensé cette année n'a pas été dessiné par un humain. Un label « conception humaine » apparaît dans la foulée, et se vend cher.",
    mods: [
      { quoi: "demande", seg: ["connaisseurs"], mult: 1.25, duree: null, si: (g) => g.savoir >= 60 },
      { quoi: "demande", seg: ["connaisseurs"], mult: 0.85, duree: null, si: (g) => g.savoir < 60 },
    ],
    immediat: () => ({ cred: -3 }),
  },
  {
    annee: 2040, t: 2, id: "labelHumain",
    titre: "Le label « conception humaine »",
    texte: "Un an après le calibre dessiné par une machine, un label officiel garantit qu'un humain a tout conçu. Il se vend, et cher.",
    mods: [{ quoi: "prixAcceptable", mult: 1.15, duree: null, si: (g) => g.savoir >= 55 }],
    immediat: (g) => (g.savoir < 55 ? { des: -4 } : {}),
  },
  {
    annee: 2041, t: 2, id: "orRecycle",
    titre: "L'or minier interdit, l'or recyclé obligatoire",
    texte: "Traçabilité totale imposée sur les métaux précieux. Le stock recyclé mondial ne suffit pas à la demande.",
    mods: [{ quoi: "materiau", mat: "or", mult: 1.5, duree: null }],
    immediat: (g) => (g.materiaux && g.materiaux.or ? { des: +6, cred: +4 } : {}),
  },
  {
    annee: 2042, t: 4, id: "afrique",
    titre: "Le marché africain s'ouvre",
    texte: "Lagos, Nairobi, Abidjan : une classe moyenne considérable découvre l'horlogerie mécanique, avec ses propres codes esthétiques.",
    mods: [
      { quoi: "demande", mult: 1.15, duree: null },
      { quoi: "demande", mult: 1.10, duree: null, si: (g) => g.modeles.some((m) => m.materiau === "bronze") },
    ],
  },
  {
    annee: 2043, t: 4, id: "krach",
    titre: "Krach financier mondial",
    texte: "Les marchés s'effondrent, le luxe avec eux. Les listes d'attente se vident en trois semaines, le marché gris devient un marché de liquidation.",
    mods: [
      { quoi: "demande", mult: 0.65, duree: 8 },
      { quoi: "demande", seg: ["bling"], mult: 0.70, duree: 8 },
    ],
    immediat: () => ({ des: -15 }),
  },
  {
    annee: 2044, t: 1, id: "apresKrach",
    titre: "L'année d'après",
    texte: "Le luxe repart, mais pas comme avant. Les acheteurs veulent des choses qui gardent leur valeur, et se méfient de ce qui brille.",
    mods: [
      { quoi: "demande", seg: ["bling"], mult: 0.70, duree: null },
      { quoi: "demande", seg: ["connaisseurs"], mult: 1.20, duree: null },
    ],
  },
  {
    annee: 2045, t: 3, id: "consolidation",
    titre: "La grande consolidation",
    texte: "Les groupes profitent des ruines du krach pour racheter tout ce qui tient encore debout. Un tiers des indépendants du classement changent de main en dix-huit mois.",
    mods: [],
    monde: { disparitionIndes: 0.3 },
  },
  {
    annee: 2046, t: 1, id: "collectionneurs",
    titre: "Une nouvelle génération de collectionneurs",
    texte: "Les enfants du krach ont vu leurs parents perdre leurs actions et garder leurs montres. Ils achètent ce qui dure.",
    mods: [
      { quoi: "demande", seg: ["connaisseurs"], mult: 1.30, duree: 12 },
      { quoi: "desEffet", mult: 1.5, duree: 12 },
    ],
  },
  {
    annee: 2047, t: 2, id: "heritage",
    titre: "Les héritages arrivent sur le marché",
    texte: "La génération qui achetait dans les années 2020 lègue ses collections. Des dizaines de milliers de pièces arrivent d'un coup en salle des ventes.",
    mods: [{ quoi: "demande", seg: ["connaisseurs"], mult: 0.88, duree: 12 }],
    immediat: (g) => (anciennete(g) >= 25 ? { des: -6, cred: +5 } : { des: -6 }),
  },
  {
    annee: 2048, t: 3, id: "traiteGris",
    titre: "Traité international sur le marché secondaire",
    texte: "La spéculation sur les montres neuves est encadrée : registre obligatoire, revente taxée avant deux ans de détention. La fin des listes d'attente organisées.",
    mods: [
      { quoi: "desPlafond", valeur: 78, duree: null },
      { quoi: "demande", seg: ["connaisseurs"], mult: 0.90, duree: null },
    ],
  },
  {
    annee: 2049, t: 4, id: "energie",
    titre: "Crise énergétique",
    texte: "L'électricité industrielle est rationnée. Les ateliers tournent au ralenti, les fours de traitement thermique passent en priorité basse.",
    mods: [
      { quoi: "capacite", mult: 0.80, duree: 8 },
      { quoi: "fixesMult", mult: 1.12, duree: null },
    ],
  },
  {
    annee: 2050, t: 2, id: "finQuartz",
    titre: "La montre connectée absorbe définitivement le quartz",
    texte: "Plus personne ne fabrique de quartz sous 300 francs : le poignet connecté a tout pris. Le quartz survit en haut de gamme, comme une curiosité de précision.",
    mods: [
      { quoi: "demande", mvt: ["quartz"], mult: 0.40, duree: null },
      { quoi: "demande", seg: ["grandpublic"], mult: 0.80, duree: null },
    ],
  },
  {
    annee: 2051, t: 2, id: "centenaires",
    titre: "L'année des centenaires",
    texte: "Plusieurs maisons fêtent leurs cent ans avec un faste inhabituel. L'ancienneté redevient l'argument de vente principal.",
    mods: [],
    immediat: (g) => {
      const a = anciennete(g);
      if (a < 15) return { des: -4 };
      const bonus = Math.floor(a / 10);
      return { cred: bonus, des: bonus };
    },
  },
  {
    annee: 2052, t: 4, id: "transmission",
    titre: "Crise de la transmission",
    texte: "Les écoles d'horlogerie ne remplissent plus leurs classes. Les maisons se volent les derniers régleurs à coups de salaires doublés.",
    mods: [{ quoi: "salaires", mult: 1.35, duree: null }],
  },
  {
    annee: 2053, t: 3, id: "robotEtabli",
    titre: "Le robot d'établi",
    texte: "Une machine sait désormais anglier un pont aussi bien qu'un humain, en un dixième du temps. La profession se divise entre ceux qui l'achètent et ceux qui refusent.",
    mods: [],
    choix: {
      accepter: "Installer la machine",
      refuser: "S'en tenir à la main",
      // L'effet réel est posé par le joueur : voir CHOIX_EVENEMENT.
    },
  },
  {
    annee: 2054, t: 1, id: "climatAlpin",
    titre: "Le climat frappe la vallée",
    texte: "Inondations et éboulements dans les vallées horlogères. Plusieurs ateliers historiques sont hors service pour un an.",
    mods: [
      { quoi: "capacite", mult: 0.75, duree: 4, si: estSuisse },
      { quoi: "couts", mult: 1.15, duree: 4, si: estSuisse },
      { quoi: "couts", mult: 1.20, duree: 4, si: (g) => !estSuisse(g) },
    ],
  },
  {
    annee: 2055, t: 1, id: "chineHaut",
    titre: "La Chine domine le haut de gamme",
    texte: "Trois maisons chinoises entrent dans les dix premières du classement. Le récit du « swiss made » comme seule garantie d'excellence ne tient plus.",
    mods: [
      { quoi: "demande", seg: ["bling"], mult: 0.75, duree: null, si: (g) => g.pays !== "chine" },
      { quoi: "demande", seg: ["connaisseurs"], mult: 0.88, duree: null, si: (g) => g.pays !== "chine" },
      { quoi: "demande", seg: ["bling", "connaisseurs"], mult: 1.4, duree: null, si: (g) => g.pays === "chine" },
    ],
  },
  {
    annee: 2056, t: 2, id: "contrefaconIA",
    titre: "La contrefaçon parfaite",
    texte: "Les copies sont désormais indiscernables des originales, y compris pour les experts. Seule la traçabilité permet encore de distinguer.",
    mods: [{ quoi: "freqContrefacon", mult: 2, duree: 6 }],
    immediat: () => ({ des: -10 }),
  },
  {
    annee: 2057, t: 4, id: "certificatNumerique",
    titre: "Le passeport numérique de la montre",
    texte: "Chaque pièce reçoit une identité infalsifiable liée à son propriétaire. La contrefaçon perd son marché en dix-huit mois.",
    mods: [{ quoi: "fixesAjout", montant: 6000, duree: null }],
    immediat: () => ({ des: +6 }),
  },
  {
    annee: 2058, t: 3, id: "renaissance",
    titre: "Renaissance artisanale mondiale",
    texte: "Après un demi-siècle d'automatisation, le fait-main redevient le seul luxe crédible. Les métiers d'art n'ont jamais été si bien payés.",
    mods: [{ quoi: "demande", seg: ["connaisseurs"], mult: 1.35, duree: null }],
  },
  {
    annee: 2059, t: 3, id: "espace",
    titre: "L'horlogerie spatiale",
    texte: "Les premières missions habitées longue durée créent un besoin : un garde-temps mécanique qui fonctionne sans gravité ni électricité. Une maison décroche le contrat.",
    mods: [],
    opportunite: { id: "contratSpatial", si: (g) => g.savoir >= 70 },
  },
  {
    annee: 2060, t: 1, id: "patrimoine",
    titre: "Patrimoine immatériel prioritaire",
    texte: "Les métiers horlogers sont classés au plus haut niveau de protection. Subventions à la formation, allègements fiscaux pour les maisons anciennes.",
    mods: [
      { quoi: "impotPoints", points: -8, duree: null, si: (g) => anciennete(g) >= 30 },
      { quoi: "salaires", mult: 0.9, duree: null, si: (g) => anciennete(g) >= 30 },
    ],
  },
  {
    annee: 2061, t: 2, id: "matieres",
    titre: "Crise des matières premières",
    texte: "Saphir de synthèse, acier chirurgical, huiles de haute horlogerie : tout manque en même temps. Les délais s'allongent, les prix suivent.",
    mods: [
      { quoi: "couts", mult: 1.25, duree: null },
      { quoi: "capacite", mult: 0.87, duree: 12 },
    ],
  },
  {
    annee: 2062, t: 3, id: "nouvelleVague",
    titre: "Une nouvelle génération de fondateurs",
    texte: "Des marques nées après le krach, dirigées par des gens qui n'ont jamais connu Baselworld, prennent des places dans le classement. Elles ne font rien comme leurs aînées.",
    mods: [],
    monde: { nouveauxIndes: 5 },
  },
  {
    annee: 2063, t: 1, id: "derniereBulle",
    titre: "La dernière bulle",
    texte: "Comme tous les vingt ans, le marché s'emballe. Ceux qui ont vécu 2021 reconnaissent les signes. Les autres achètent.",
    mods: [
      { quoi: "demande", seg: ["connaisseurs", "bling"], mult: 1.6, duree: 6 },
      { quoi: "demande", seg: ["connaisseurs", "bling"], mult: 0.6, debut: 6, duree: null },
    ],
  },
  {
    annee: 2064, t: 4, id: "demiSiecle",
    titre: "Un demi-siècle",
    texte: "Cinquante ans que la maison existe — ou n'existe plus. La profession dresse le bilan d'une industrie qui a survécu à l'électronique, à la pandémie, au krach et à la machine qui dessine.",
    mods: [],
    poidsJournal: 95,
  },
  {
    annee: 2065, t: 4, id: "finale",
    titre: "Le dernier classement",
    texte: "Cinquante ans après, le classement tombe une dernière fois. La question n'est plus de savoir où l'on figure, mais si la maison passera l'année suivante sans vous.",
    mods: [],
    poidsJournal: 100,
  },
];

export const OPPORTUNITES = [
  {
    id: "salon", titre: "Invitation au salon Genève Time",
    texte: "Un stand se libère. CHF 25'000, mais la visibilité est réelle.",
    cout: 25000, heures: 80, req: (g) => g.modeles.some((m) => m.statut === "actif"),
  },
  {
    id: "youtubeur", titre: "Un YouTubeur veut tester votre montre",
    texte: "« Remontoir » (280k abonnés) demande un exemplaire. Review honnête... dans les deux sens.",
    cout: 0, heures: 20, req: (g) => g.modeles.some((m) => m.statut === "actif"),
  },
  {
    id: "detaillant", titre: "Grosse commande d'un détaillant",
    texte: "Une chaîne veut votre stock à -25%. Cash immédiat, marge sacrifiée, distribution renforcée.",
    cout: 0, heures: 30, req: (g) => g.modeles.some((m) => m.stock > 20),
  },
  {
    id: "voyagepresse", titre: "Organiser un voyage de presse",
    texte: "Trois journalistes dans le Jura, montres offertes. CHF 12'000. Si ça se sait...",
    cout: 12000, heures: 80, req: () => true,
  },
  {
    id: "collab", titre: "Collab influenceur lifestyle",
    texte: "500k abonnés, CHF 20'000 le post. La notoriété s'achète, la crédibilité en souffre.",
    cout: 20000, heures: 40, req: () => true,
  },
];

// Effectif total, sans dépendre du moteur (évite un cycle d'imports).
const effectif = (employes) => Object.values(employes).reduce((s, n) => s + n, 0);

// Aléas possibles ce trimestre, selon l'état de la partie.
export function poolAleas(g) {
  const pool = [
    { id: "retard", titre: "Fournisseur en retard", texte: "Un lot de composants n'arrive pas. Production divisée par deux ce trimestre." },
    { id: "chf", titre: "Le franc suisse s'envole", texte: "Coûts de production +12% ce trimestre." },
    { id: "celebrite", titre: "Une célébrité porte votre montre", texte: "Repérée en couverture. Notoriété +6, désirabilité +5." },
    { id: "article", titre: "Article élogieux", texte: "Un magazine spécialisé vous encense. Crédibilité +4." },
    { id: "tiktok", titre: "Buzz TikTok inattendu", texte: "Une vidéo devient virale. Notoriété +8, crédibilité −1." },
    { id: "recession", titre: "Récession locale", texte: "Demande −20% ce trimestre." },
  ];
  if (g.noto >= 40) pool.push({ id: "contrefacon", titre: "Contrefaçons repérées", texte: "Des copies circulent. Désirabilité −5, ventes −10% ce trimestre." });
  if (g.modeles.some((m) => m.stock > 10)) pool.push({ id: "cambriolage", titre: "Cambriolage de l'atelier", texte: "30% du stock disparaît, plus CHF 10'000 de dégâts." });
  if (effectif(g.employes) > 0) pool.push({ id: "demission", titre: "Un collaborateur démissionne", texte: "Débauché par un concurrent. Savoir-faire −3, un poste à repourvoir." });
  if (g.modeles.some((m) => m.stock > 15)) pool.push({ id: "collectionneur", titre: "Un collectionneur passe commande", texte: "15 pièces d'un coup, payées +20%." });
  return pool;
}
