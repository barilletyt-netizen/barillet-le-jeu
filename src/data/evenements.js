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

import { DIRECTEURS, DIRECTEUR_REQ, DIRECTEUR_CONDITION } from "./config.js";

const estSuisse = (g) => g.pays === "suisse";
const anciennete = (g) => g.annee - 2015;

export const EVENEMENTS = [
  // ---- 2015-2023 : ce que la branche a réellement traversé ----------------
  {
    annee: 2015, t: 1, id: "bns",
    titre: "La BNS lâche le taux plancher",
    texte: "Le 15 janvier, la Banque nationale abandonne le cours plancher de l'euro. Le franc s'envole de 20% en une matinée. Pour une industrie qui produit en francs et vend en euros et en dollars, c'est un séisme. L'année finira sur la première baisse des exportations depuis 2009.",
    // Le choc s'encaisse, il ne se subit pas cinquante ans : l'industrie a
    // réellement réabsorbé le franc fort en deux à trois ans (délocalisation
    // partielle des composants, hausse des prix export, gains de productivité).
    // +18% au premier trimestre, dégressif par paliers annuels vers +8%, qui
    // reste, lui, permanent.
    mods: [
      { quoi: "couts", mult: 1.18, duree: 4, si: estSuisse },
      { quoi: "couts", mult: 1.14, debut: 4, duree: 4, si: estSuisse },
      { quoi: "couts", mult: 1.11, debut: 8, duree: 4, si: estSuisse },
      { quoi: "couts", mult: 1.08, debut: 12, duree: null, si: estSuisse },
      { quoi: "couts", mult: 1.10, duree: 8, si: (g) => !estSuisse(g) },
      { quoi: "couts", mult: 1.05, debut: 8, duree: null, si: (g) => !estSuisse(g) },
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
    annee: 2036, t: 1, id: "retourMilieu",
    titre: "Le milieu de gamme reprend des couleurs",
    texte: "Dix ans que la profession ne jure que par les extrêmes : la pièce à mille francs et celle à cent mille. Une génération d'acheteurs qui n'a connu que ce choix redécouvre qu'il existe quelque chose entre les deux — et que c'est précisément ce qu'on porte tous les jours.",
    // Atténue `polarisation` (2026) sans l'annuler : elle avait posé
    // ×0.82 / ×0.88 / ×1.18 / ×1.30, il en reste environ la moitié. Placé dix
    // ans après le choc et non vingt : la compensation arrivait si tard que
    // les stratégies de volume ne s'en relevaient pas.
    mods: [
      { quoi: "demande", seg: ["grandpublic"], mult: 1.10, duree: null },
      { quoi: "demande", seg: ["lifestyle"], mult: 1.07, duree: null },
      { quoi: "demande", seg: ["connaisseurs"], mult: 0.93, duree: null },
      { quoi: "demande", seg: ["bling"], mult: 0.88, duree: null },
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
    decision: "offreRachat",
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
    decision: "machineAnglage",
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
    decision: "contratSpatial",
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
  // ---- Les cinq d'origine ------------------------------------------------
  {
    id: "salon", titre: "Invitation au salon Genève Time", epoque: "toujours",
    texte: "Un stand se libère. CHF 25'000, mais la visibilité est réelle.",
    cout: 25000, heures: 80, req: (g) => g.modeles.some((m) => m.statut === "actif"),
    effet: { noto: 10, cred: 4, des: 3 },
    msg: "Salon Genève Time : notoriété +10, crédibilité +4, désirabilité +3.",
  },
  {
    id: "youtubeur", titre: "Un YouTubeur veut tester votre montre", epoque: "toujours",
    texte: "« Remontoir » (280k abonnés) demande un exemplaire. Review honnête... dans les deux sens.",
    cout: 0, heures: 20, req: (g) => g.modeles.some((m) => m.statut === "actif"),
    tirage: (r) => r < 0.62
      ? { cred: 5, noto: 4, des: 3, msg: "Review positive de « Remontoir » : crédibilité +5, notoriété +4, désirabilité +3." }
      : { cred: -3, noto: 2, msg: "Review mitigée de « Remontoir »... crédibilité −3, notoriété +2." },
  },
  {
    id: "detaillant", titre: "Grosse commande d'un détaillant", epoque: "toujours",
    texte: "Une chaîne veut votre stock à −25%. Cash immédiat, marge sacrifiée, distribution renforcée.",
    cout: 0, heures: 30, req: (g) => g.modeles.some((m) => m.stock > 20),
    effet: { ecoulerStock: { prixMult: 0.75 }, des: -1 },
    msg: "Détaillant : tout le stock à −25%. Désirabilité −1 : écouler en gros se voit.",
  },
  {
    id: "voyagepresse", titre: "Organiser un voyage de presse", epoque: "toujours",
    texte: "Trois journalistes dans le Jura, montres offertes. CHF 12'000. Si ça se sait...",
    cout: 12000, heures: 80, req: () => true,
    effet: { cred: 5, presseAchetee: 1 },
    msg: "Voyage de presse : crédibilité +5.",
  },
  {
    id: "collab", titre: "Collab influenceur lifestyle", epoque: "toujours",
    texte: "500k abonnés, CHF 20'000 le post. La notoriété s'achète, la crédibilité en souffre.",
    cout: 20000, heures: 40, req: () => true,
    effet: { noto: 12, cred: -2, presseAchetee: 1 },
    msg: "Collab influenceur : notoriété +12, crédibilité −2.",
  },

  // ---- Salons et concours ------------------------------------------------
  {
    id: "concours", titre: "Concourir au Grand Prix", epoque: ["croissance", "maturite"],
    texte: "Le grand concours horloger de l'année ouvre ses candidatures. Y aller ne garantit rien.",
    cout: 15000, heures: 60,
    req: (g) => Object.values(g.complications).some((n) => n >= 2),
    tirage: (r) => r < 0.12
      ? { cred: 12, noto: 10, des: 8, msg: "Vainqueur du Grand Prix ! Crédibilité +12, notoriété +10, désirabilité +8." }
      : r < 0.47
        ? { cred: 6, noto: 4, msg: "Nomination au Grand Prix : crédibilité +6, notoriété +4." }
        : { msg: "Ni nomination ni prix. Le jury n'a pas retenu la pièce." },
  },
  {
    id: "salonAsie", titre: "Un salon horloger asiatique", epoque: ["croissance", "maturite"],
    texte: "Loin, cher, et c'est là que se trouve la moitié des acheteurs.",
    cout: 40000, heures: 100, req: (g) => g.cred >= 20,
    effet: { noto: 12, cred: 5, mods: [{ quoi: "portee", mult: 1.15, duree: 4 }] },
    msg: "Salon asiatique : notoriété +12, crédibilité +5, portée des canaux +15% pendant un an.",
  },
  {
    id: "salonAmerique", titre: "Un salon à New York", epoque: ["croissance", "maturite"],
    texte: "Sur le premier marché mondial. Le billet d'entrée est le double d'ailleurs.",
    cout: 35000, heures: 60, req: (g) => g.noto >= 25,
    effet: {
      noto: 16, cred: 4, canalPalier: "detaillants",
      mods: [{ quoi: "portee", mult: 1.2, duree: 6 }],
    },
    msg: "Salon de New York : notoriété +16, crédibilité +4, un palier de détaillants offert, et la portée des canaux +20% pendant dix-huit mois.",
  },
  {
    id: "concoursDesign", titre: "Un concours de design horloger", epoque: "toujours",
    texte: "Peu de gloire, mais une ligne au palmarès.",
    cout: 8000, heures: 40,
    req: (g) => g.modeles.some((m) => m.statut === "actif" && m.age < 12),
    tirage: (r) => r < 0.15
      ? { des: 10, noto: 6, msg: "Prix du concours de design : désirabilité +10, notoriété +6." }
      : r < 0.60
        ? { des: 5, msg: "Nomination au concours de design : désirabilité +5." }
        : { msg: "Le jury est passé à côté. Rien à en tirer cette année." },
  },
  {
    id: "salonEcoles", titre: "Le salon des écoles d'horlogerie", epoque: "toujours",
    texte: "Deux jours à serrer des mains pour recruter avant les autres.",
    cout: 5000, heures: 40, req: (g) => Object.values(g.employes).reduce((s, n) => s + n, 0) >= 2,
    effet: { savoir: 3, embaucheFacile: true },
    msg: "Salon des écoles : savoir-faire +3, et la prochaine embauche coûtera deux fois moins d'heures.",
  },

  // ---- Image et prestige -------------------------------------------------
  {
    id: "partenariatMusee", titre: "Une exposition dans un musée horloger", epoque: "maturite",
    texte: "Un musée propose une exposition temporaire sur votre maison.",
    cout: 20000, heures: 60, req: (g) => g.savoir >= 45,
    effet: { cred: 10, des: 5, noto: 4 },
    msg: "Exposition au musée : crédibilité +10, désirabilité +5, notoriété +4.",
  },
  {
    id: "documentaire", titre: "Un documentaire sur l'atelier", epoque: "maturite",
    texte: "Une équipe veut tourner un mois durant. Des caméras dans les pattes, et une audience.",
    cout: 30000, heures: 80, req: (g) => g.annee - 2015 >= 10,
    effet: { noto: 14, cred: 6, mods: [{ quoi: "capacite", mult: 0.8, duree: 1 }] },
    msg: "Documentaire : notoriété +14, crédibilité +6. L'atelier tourne au ralenti ce trimestre.",
  },
  {
    id: "atelierOuvert", titre: "Ouvrir l'atelier au public", epoque: "toujours",
    texte: "Deux week-ends portes ouvertes. Les gens veulent voir des mains travailler.",
    cout: 10000, heures: 50, req: (g) => g.ateliers >= 1,
    effet: { cred: 5, des: 4, venteDirecte: { n: 15, prixMult: 1 } },
    msg: "Portes ouvertes : crédibilité +5, désirabilité +4, et quinze ventes directes à plein tarif.",
  },
  {
    id: "ambassadeur", titre: "Signer un ambassadeur", epoque: "maturite",
    texte: "Cher, efficace, et jamais tout à fait sincère.",
    cout: 60000, heures: 40, req: (g) => g.noto >= 45,
    effet: { noto: 18, des: 6, cred: -3, mods: [{ quoi: "fixesAjout", montant: 8000, duree: 12 }] },
    msg: "Ambassadeur signé : notoriété +18, désirabilité +6, crédibilité −3. CHF 8'000 par trimestre pendant trois ans.",
  },
  {
    id: "capsuleCollab", titre: "Une série capsule avec une autre maison", epoque: ["croissance", "maturite"],
    texte: "Mode, automobile ou musique : un autre univers propose une collaboration.",
    cout: 25000, heures: 70, req: (g) => g.des >= 35,
    effet: { noto: 12, des: 8, cred: -4, venteDirecte: { n: 50, prixMult: 1.5 } },
    msg: "Série capsule : notoriété +12, désirabilité +8, crédibilité −4, cinquante pièces vendues à 1,5× le prix.",
  },

  // ---- Commercial ---------------------------------------------------------
  {
    id: "boutiqueEphemere", titre: "Un pop-up de trois mois", epoque: "toujours",
    texte: "Une rue passante, trois mois, tout le stock disponible et plein tarif.",
    cout: 30000, heures: 60, req: (g) => g.noto >= 20 && g.modeles.some((m) => m.stock > 0),
    effet: { ecoulerStock: { prixMult: 1, max: 80 }, noto: 5 },
    msg: "Boutique éphémère : jusqu'à quatre-vingts pièces écoulées à plein tarif, notoriété +5.",
  },
  {
    id: "preventeCommunaute", titre: "Ouvrir une précommande", epoque: "toujours",
    texte: "Proposer une précommande à vos clients fidèles. L'argent rentre avant que la montre existe.",
    cout: 0, heures: 60, req: (g) => g.des >= 30 && g.modeles.some((m) => m.statut === "actif"),
    effet: { prevente: { n: 40, part: 0.6, delai: 2 } },
    msg: "Précommande ouverte : quarante pièces payées à 60% d'avance, à livrer sous deux trimestres.",
  },
  {
    id: "contratOEM", titre: "Produire pour une autre marque", epoque: ["croissance", "maturite"],
    texte: "Une autre marque veut que vous produisiez pour elle, sans votre nom dessus. C'est de l'argent facile et un peu d'âme en moins.",
    cout: 0, heures: 90, req: (g) => Object.values(g.employes).reduce((s, n) => s + n, 0) >= 3,
    effet: { cred: -5, contratOEM: true },
    msg: "Contrat de sous-traitance signé : un revenu garanti pendant un an, la capacité mobilisée d'autant, crédibilité −5.",
  },
  {
    id: "licenceMarque", titre: "Licencier votre nom", epoque: "maturite",
    texte: "Un industriel veut licencier votre nom pour une gamme accessible. Beaucoup d'argent, un vrai risque.",
    cout: 0, heures: 50, req: (g) => g.noto >= 50,
    effet: {
      cash: 250000, des: -12, cred: -8,
      mods: [{ quoi: "revenuTrim", montant: 40000, duree: 12 }],
    },
    msg: "Licence signée : CHF 250'000 tout de suite, CHF 40'000 par trimestre pendant trois ans. Désirabilité −12, crédibilité −8, définitivement.",
  },

  // ---- Production et savoir-faire ----------------------------------------
  {
    id: "certificationChrono", titre: "Faire certifier un calibre chronomètre", epoque: ["croissance", "maturite"],
    texte: "Long, cher, et ça se voit sur le cadran.",
    cout: 25000, heures: 80, req: (g) => g.modeles.some((m) => m.statut === "actif" && m.qual >= 7),
    effet: { cred: 7, qualPlus: 1, mods: [{ quoi: "prixAcceptable", mult: 1.12, duree: null }] },
    msg: "Certification chronomètre : qualité +1 sur le modèle, crédibilité +7, prix acceptable +12%.",
  },
  {
    id: "rachatFournisseur", titre: "Racheter votre fournisseur", epoque: "maturite",
    texte: "Votre fournisseur de composants est à vendre. L'acheter, c'est ne plus jamais dépendre de personne.",
    cout: 300000, heures: 100, req: (g) => g.cash >= 500000,
    effet: { savoir: 6, atelierPlus: 1, mods: [{ quoi: "couts", mult: 0.75, duree: null }] },
    msg: "Fournisseur racheté : coûts matière −25% pour toujours, savoir-faire +6, un poste d'atelier de plus.",
  },
  {
    id: "formationInterne", titre: "Faire former toute l'équipe", epoque: ["croissance", "maturite"],
    texte: "Un spécialiste extérieur, un trimestre entier, tout l'atelier sur les bancs.",
    cout: 15000, heures: 70, req: (g) => Object.values(g.employes).reduce((s, n) => s + n, 0) >= 4,
    effet: {
      savoir: 8,
      mods: [{ quoi: "capacite", mult: 1.08, duree: null }, { quoi: "capacite", mult: 0.75, duree: 1 }],
    },
    msg: "Formation : savoir-faire +8 et 8% d'efficacité en plus, définitivement. La production souffre ce trimestre.",
  },

  // ---- Finance ------------------------------------------------------------
  {
    id: "rachatInde", titre: "Une maison en difficulté est à vendre", epoque: "maturite",
    texte: "Un indépendant du classement jette l'éponge. Reprendre son atelier, son stock et son nom, c'est deux ans d'avance — ou un boulet.",
    cout: 350000, heures: 80, req: (g) => g.cash >= 400000 && g.annee >= 2025,
    effet: { atelierPlus: 1, employePlus: 2, cred: 5, savoir: 8, rachatInde: true },
    msg: "Maison rachetée : un atelier, deux employés, crédibilité +5, savoir-faire +8 — et les coûts fixes qui vont avec.",
  },
  {
    id: "fournisseurExclusif", titre: "Contrat d'exclusivité fournisseur", epoque: ["croissance", "maturite"],
    texte: "Un fournisseur propose l'exclusivité sur ses cadrans en échange d'un engagement de volume.",
    cout: 0, heures: 50, req: (g) => Object.values(g.segVendues).reduce((s, n) => s + n, 0) >= 500,
    effet: { engagementVolume: true, mods: [{ quoi: "couts", mult: 0.85, duree: null }] },
    msg: "Exclusivité signée : coûts matière −15% pour toujours. En dessous de 125 pièces par trimestre, CHF 20'000 de pénalité.",
  },
  {
    id: "familyOffice", titre: "Un family office propose un ticket patient", epoque: "maturite",
    texte: "De l'argent qui ne demande pas de résultat trimestriel — contre un quart de la maison.",
    cout: 0, heures: 70, req: (g) => g.revenusAnnee >= 3000000,
    effet: { cash: 1000000, dilution: 25 },
    msg: "Family office : CHF 1'000'000 contre 25% du capital. Aucun coût récurrent, mais la maison n'est plus tout à fait la vôtre.",
  },
  {
    id: "empruntObligataire", titre: "Émettre un emprunt auprès de vos clients", epoque: "maturite",
    texte: "Ils prêtent, vous remboursez en montres ou en francs.",
    cout: 0, heures: 60, req: (g) => g.revenusAnnee >= 5000000,
    effet: { cash: 600000, dette: 600000, des: 5 },
    msg: "Emprunt obligataire : CHF 600'000 à taux réduit, désirabilité +5 — les clients deviennent parties prenantes.",
  },
];

/**
 * Les aléas. Soixante-huit entrées, tirées avec une mémoire courte et une
 * fenêtre d'époque (voir engine/simulation.js) — sans ces deux règles, un
 * catalogue profond se comporterait comme un catalogue de dix.
 *
 * Chaque entrée porte :
 *   `texte`  ce que lit le joueur dans son rapport
 *   `presse` les titres à la troisième personne pour la Gazette
 *   `epoque` "debut" | "croissance" | "maturite" | "toujours" (ou une liste)
 *   `req`    condition d'apparition
 *   `effet`  effet du trimestre, déclaratif (voir appliquerEffet)
 *   `mods`   effets durables posés sur la partie, en trimestres
 *   `choix`  l'aléa se décide au lieu de se subir — passe par l'interface
 *            d'opportunité, pas par le rapport
 */

const effectif = (employes) => Object.values(employes).reduce((s, n) => s + n, 0);
const actifs = (g) => g.modeles.filter((m) => m.statut === "actif");
const age = (g) => g.annee - 2015;
const canal = (g, id) => g.canaux[id] || 0;
const beneficeCumule = (g) => g.journal.reduce((s, l) => s + (l.resultat || 0), 0);
const venduesAnnee = (g) => g.journal.slice(-4).reduce((s, l) => s + (l.vendues || 0), 0);

export const ALEAS = [
  // ---- Les dix d'origine ------------------------------------------------
  {
    id: "retard", titre: "Fournisseur en retard", epoque: "toujours",
    texte: "Un lot de composants n'arrive pas. Production divisée par deux ce trimestre.",
    presse: ["LES COMPOSANTS N'ARRIVENT PAS", "CHAÎNE D'APPROVISIONNEMENT GRIPPÉE", "L'ATTENTE DES FOURNITURES"],
    effet: { prodMult: 0.5 },
  },
  {
    id: "chf", titre: "Le franc suisse s'envole", epoque: "toujours",
    texte: "Coûts de production +12% ce trimestre.",
    presse: ["LE FRANC S'ENVOLE", "LA MONNAIE PÈSE SUR LES COÛTS", "CHANGE DÉFAVORABLE"],
    effet: { coutMult: 1.12 },
  },
  {
    id: "celebrite", titre: "Une célébrité porte votre montre", epoque: "toujours",
    texte: "Repérée en couverture. Notoriété +6, désirabilité +5.",
    presse: ["UNE STAR AU POIGNET", "APERÇUE EN COUVERTURE", "LE POIGNET QUI FAIT PARLER"],
    effet: { noto: 6, des: 5 },
  },
  {
    id: "article", titre: "Article élogieux", epoque: "toujours",
    texte: "Un magazine spécialisé vous encense. Crédibilité +4.",
    presse: ["LA PRESSE SPÉCIALISÉE APPLAUDIT", "BEL ARTICLE DANS LA PRESSE", "UN PAPIER QUI FAIT DU BIEN"],
    effet: { cred: 4 },
  },
  {
    id: "tiktok", titre: "Buzz TikTok inattendu", epoque: "toujours",
    texte: "Une vidéo devient virale. Notoriété +8, crédibilité −1.",
    presse: ["LA VIDÉO QUI S'EMBALLE", "SUCCÈS VIRAL INATTENDU", "LES RÉSEAUX S'EN MÊLENT"],
    effet: { noto: 8, cred: -1 },
  },
  {
    id: "recession", titre: "Récession locale", epoque: "toujours",
    texte: "Demande −20% ce trimestre.",
    presse: ["LE MARCHÉ SE CONTRACTE", "RÉCESSION : LA DEMANDE RECULE", "LES CLIENTS SE FONT RARES"],
    effet: { demandeMult: 0.8 },
  },
  {
    id: "contrefacon", titre: "Contrefaçons repérées", epoque: "toujours",
    req: (g) => g.noto >= 40,
    texte: "Des copies circulent. Désirabilité −5, ventes −10% ce trimestre.",
    presse: ["DES COPIES EN CIRCULATION", "LA CONTREFAÇON S'INVITE", "FAUSSES PIÈCES SAISIES"],
    effet: { des: -5, demandeMult: 0.9 },
  },
  {
    id: "cambriolage", titre: "Cambriolage de l'atelier", epoque: "toujours",
    req: (g) => g.modeles.some((m) => m.stock > 10),
    texte: "30% du stock disparaît, plus CHF 10'000 de dégâts.",
    presse: ["ATELIER CAMBRIOLÉ", "VOL DANS LES RÉSERVES", "UNE NUIT AGITÉE À L'ÉTABLI"],
    effet: { stockMult: 0.7, cash: -10000 },
  },
  {
    id: "demission", titre: "Un collaborateur démissionne", epoque: "toujours",
    req: (g) => effectif(g.employes) > 0,
    texte: "Débauché par un concurrent. Savoir-faire −3, un poste à repourvoir.",
    presse: ["UN DÉPART À L'ATELIER", "L'ÉTABLI PERD UNE MAIN", "DÉBAUCHAGE CHEZ LE VOISIN"],
    effet: { savoir: -3, employeMoins: 1 },
  },
  {
    id: "collectionneur", titre: "Un collectionneur passe commande", epoque: "toujours",
    req: (g) => g.modeles.some((m) => m.stock > 15),
    texte: "15 pièces d'un coup, payées +20%.",
    presse: ["UN COLLECTIONNEUR PASSE COMMANDE", "COMMANDE FERME D'UN AMATEUR", "UNE SÉRIE POUR UN SEUL HOMME"],
    effet: { venteDirecte: { n: 15, prixMult: 1.2, stockMin: 15 } },
  },

  // ---- Les quatorze du lore, longtemps restés sur le papier --------------
  {
    id: "fraude", titre: "Fraude d'un employé", epoque: ["croissance", "maturite"],
    req: (g) => effectif(g.employes) >= 2 && g.cash > 100000,
    texte: "Un collaborateur détournait des fonds depuis plusieurs trimestres. Perte de 8% de la trésorerie, crédibilité −4.",
    presse: ["DÉTOURNEMENT À L'ATELIER", "UNE AFFAIRE INTERNE", "LES COMPTES NE TOMBAIENT PLUS JUSTE"],
    effet: { cashPct: -0.08, cred: -4 },
  },
  {
    id: "fournisseurFaillite", titre: "Fournisseur en faillite", epoque: "toujours",
    texte: "Votre fournisseur de composants a été racheté par un groupe qui garde la production pour lui. Coûts +20% pendant trois trimestres, le temps d'en trouver un autre.",
    presse: ["LE FOURNISSEUR PASSE SOUS PAVILLON ÉTRANGER", "APPROVISIONNEMENT À RÉINVENTER", "UN CARNET D'ADRESSES À REFAIRE"],
    mods: [{ quoi: "couts", mult: 1.20, duree: 3 }],
  },
  {
    id: "rappelQualite", titre: "Rappel qualité", epoque: ["croissance", "maturite"],
    req: (g) => Object.values(g.segVendues).reduce((s, n) => s + n, 0) >= 100,
    texte: "Un défaut de série sur les mouvements. Rappel, réparation, excuses. Crédibilité −6, désirabilité −4.",
    presse: ["RAPPEL SUR UNE SÉRIE", "LE DÉFAUT QU'ON N'AVAIT PAS VU", "LA MAISON RAPPELLE SES PIÈCES"],
    effet: { caPct: -0.15, cred: -6, des: -4 },
  },
  {
    id: "venteCaritative", titre: "Invitation à une vente caritative", epoque: "toujours",
    req: (g) => g.cred >= 25 && actifs(g).some((m) => m.stock > 0),
    texte: "Une pièce unique part sous le marteau pour une œuvre. Crédibilité +7, désirabilité +6, une montre en moins.",
    presse: ["UNE PIÈCE UNIQUE POUR LA BONNE CAUSE", "SOUS LE MARTEAU POUR LA RECHERCHE", "LA MAISON DONNE SA MONTRE"],
    effet: { cred: 7, des: 6, stockMoins: 1 },
  },
  {
    id: "recordEncheres", titre: "Record aux enchères", epoque: ["croissance", "maturite"],
    req: (g) => g.des >= 55 && age(g) >= 8,
    texte: "Une de vos premières pièces vient de tripler son prix d'origine en salle des ventes. Désirabilité +10, notoriété +5.",
    presse: ["UN RECORD EN SALLE DES VENTES", "LA COTE S'ENVOLE", "TROIS FOIS LE PRIX D'ORIGINE"],
    effet: { des: 10, noto: 5 },
  },
  {
    id: "volPrototype", titre: "Vol d'un prototype", epoque: "toujours",
    req: (g) => g.modeles.some((m) => m.statut === "dev"),
    texte: "Le prototype a disparu avant sa présentation. Le développement perd un trimestre, et quelqu'un, quelque part, a vos plans.",
    presse: ["PROTOTYPE DISPARU", "UN VOL AVANT L'HEURE", "LES PLANS DANS LA NATURE"],
    effet: { devPlus: 1 },
  },
  {
    id: "douaneAlea", titre: "Nouveau droit de douane", epoque: ["croissance", "maturite"],
    req: (g) => canal(g, "ecommerce") >= 2 || canal(g, "detaillants") >= 2,
    texte: "Votre principal marché d'export impose une surtaxe. Portée des canaux −25% pendant quatre trimestres.",
    presse: ["SURTAXE SUR LE MARCHÉ PRINCIPAL", "LES DOUANES SE REFERMENT", "EXPORTER COÛTE PLUS CHER"],
    mods: [{ quoi: "portee", mult: 0.75, duree: 4 }],
  },
  {
    id: "incendie", titre: "Incendie de l'atelier", epoque: ["croissance", "maturite"],
    req: (g) => g.ateliers >= 1,
    texte: "Un départ de feu dans l'atelier. L'assurance couvre la moitié : 60% du stock perdu, la production amputée deux trimestres.",
    presse: ["L'ATELIER A BRÛLÉ", "UNE NUIT QU'ON N'OUBLIERA PAS", "LES ÉTABLIS SOUS L'EAU DES POMPIERS"],
    effet: { stockMult: 0.4 },
    mods: [{ quoi: "capacite", mult: 0.7, duree: 2 }],
  },
  {
    id: "penurieAcier", titre: "Pénurie d'acier", epoque: "toujours",
    texte: "L'acier de qualité horlogère manque. Coûts +18% ce trimestre, production plafonnée à 70%.",
    presse: ["L'ACIER MANQUE", "APPROVISIONNEMENT SOUS TENSION", "ON SE BAT POUR DES BOÎTIERS"],
    effet: { coutMult: 1.18, prodMult: 0.7 },
  },
  {
    id: "museeExpo", titre: "Une pièce entre au musée", epoque: ["croissance", "maturite"],
    req: (g) => g.savoir >= 55 && Object.values(g.complications).some((n) => n >= 2),
    texte: "Un musée horloger intègre une de vos montres à sa collection permanente. Crédibilité +8.",
    presse: ["UNE MONTRE AU MUSÉE", "RECONNAISSANCE INSTITUTIONNELLE", "LA PIÈCE REJOINT LES COLLECTIONS"],
    effet: { cred: 8 },
  },
  {
    id: "ecolePartenariat", titre: "Partenariat avec une école d'horlogerie", epoque: ["croissance", "maturite"],
    req: (g) => effectif(g.employes) >= 3,
    texte: "Une école place deux apprentis chez vous. Savoir-faire +5.",
    presse: ["DEUX APPRENTIS À L'ÉTABLI", "LA MAISON FORME", "TRANSMETTRE, ENFIN"],
    effet: { savoir: 5 },
  },
  {
    id: "panneMachine", titre: "Panne d'une machine-outil", epoque: ["croissance", "maturite"],
    req: (g) => g.ateliers >= 1,
    texte: "Le tour à décolleter est hors service. Réparation CHF 25'000, capacité −30% ce trimestre.",
    presse: ["LA MACHINE S'ARRÊTE", "PANNE EN PRODUCTION", "UNE SEMAINE DE RETARD"],
    effet: { cash: -25000, capMult: 0.7 },
  },
  {
    id: "clientFortune", titre: "Commande d'un client fortuné", epoque: "toujours",
    req: (g) => g.des >= 40 && actifs(g).some((m) => m.stock > 0),
    texte: "Un collectionneur veut une pièce sur mesure, payée dix fois le prix catalogue. Désirabilité +5.",
    presse: ["UNE COMMANDE SPÉCIALE", "SUR MESURE POUR UN AMATEUR", "LA MAISON SORT DU CATALOGUE"],
    effet: { venteDirecte: { n: 1, prixMult: 10, stockMin: 1 }, des: 5 },
  },
  {
    id: "redressement", titre: "Contrôle fiscal", epoque: "maturite",
    req: (g) => beneficeCumule(g) > 500000,
    texte: "L'administration revient sur trois exercices. Redressement de 6% du bénéfice cumulé, et beaucoup de paperasse.",
    presse: ["LE FISC S'INVITE", "CONTRÔLE SUR TROIS EXERCICES", "L'ADDITION DES ANNÉES PASSÉES"],
    effet: { beneficePct: -0.06 },
  },
  {
    id: "talentDebauche", titre: "Un concurrent débauche votre meilleur horloger", epoque: ["croissance", "maturite"],
    req: (g) => effectif(g.employes) >= 3 && g.savoir >= 50,
    texte: "Une grande maison a doublé son salaire. Savoir-faire −5, un poste vacant, et le carnet de commandes qui part avec.",
    presse: ["DÉBAUCHÉ PAR PLUS GROS", "LE SAVOIR-FAIRE CHANGE DE MAISON", "ON NE RETIENT PAS UN RÉGLEUR AVEC DES MOTS"],
    effet: { savoir: -5, employeMoins: 1 },
  },

  // ---- Atelier et production --------------------------------------------
  {
    id: "erreurSerie", titre: "Erreur de série", epoque: "toujours",
    req: (g) => actifs(g).reduce((s, m) => s + Number(m.prod || 0), 0) >= 50,
    texte: "Une erreur de réglage sur toute une série. 20% de la production à repasser : autant d'heures perdues.",
    presse: ["TOUTE UNE SÉRIE À REPRENDRE", "L'ERREUR QU'ON NE VOIT QU'APRÈS"],
    effet: { prodMult: 0.8 },
  },
  {
    id: "apprentiDoue", titre: "Un apprenti doué", epoque: "toujours",
    req: (g) => effectif(g.employes) >= 2,
    texte: "Un apprenti d'un talent rare. Savoir-faire +4, et dans un an il vaudra un horloger confirmé.",
    presse: ["UN APPRENTI QU'ON GARDE", "LE COUP D'ŒIL D'UN DÉBUTANT"],
    effet: { savoir: 4 },
  },
  {
    id: "accidentTravail", titre: "Accident du travail", epoque: "toujours",
    req: (g) => effectif(g.employes) >= 3,
    texte: "Un accident à l'établi. Personne de gravement blessé, mais un poste immobilisé et une inspection à venir. Crédibilité −2.",
    presse: ["ACCIDENT À L'ATELIER", "UNE INSPECTION S'ANNONCE"],
    effet: { cred: -2, capMult: 0.85 },
  },
  {
    id: "inventaireOublie", titre: "Un fond de réserve oublié", epoque: "toujours",
    req: (g) => age(g) >= 4 && actifs(g).length > 0,
    texte: "En rangeant la réserve : trente pièces d'un ancien modèle, jamais mises en vente. Elles repartent en stock.",
    presse: ["TRENTE MONTRES RETROUVÉES", "LE FOND DE RÉSERVE"],
    effet: { stockPlus: 30 },
  },
  {
    id: "hygrometrie", titre: "L'atelier prend l'humidité", epoque: ["croissance", "maturite"],
    req: (g) => g.ateliers >= 1,
    texte: "La régulation d'humidité a lâché. Poussière et oxydation : 10% du stock à démonter et nettoyer.",
    presse: ["L'ATELIER PREND L'HUMIDITÉ", "TOUT À DÉMONTER"],
    effet: { stockMult: 0.9, capMult: 0.9 },
  },
  {
    id: "normesAtelier", titre: "Mise aux normes", epoque: "maturite",
    req: (g) => effectif(g.employes) >= 5,
    texte: "Mise aux normes exigée sur l'atelier. CHF 18'000, non négociables.",
    presse: ["L'INSPECTION PASSE", "LES NORMES ONT UN PRIX"],
    effet: { cash: -18000 },
  },

  // ---- Fournisseurs et matières -----------------------------------------
  {
    id: "lotDefectueux", titre: "Lot de cadrans hors tolérance", epoque: "toujours",
    texte: "Un lot de cadrans arrive hors tolérance. Production divisée par deux ce trimestre, remboursement partiel du fournisseur.",
    presse: ["DES CADRANS HORS TOLÉRANCE", "LE LOT QU'IL FAUT RENVOYER"],
    effet: { prodMult: 0.5, cash: 5000 },
  },
  {
    id: "fournisseurHistorique", titre: "Le fournisseur des débuts ferme", epoque: ["croissance", "maturite"],
    req: (g) => age(g) >= 6,
    texte: "Le fournisseur qui vous suivait depuis les débuts ferme. Coûts +15% pendant deux trimestres, le temps d'en retrouver un.",
    presse: ["LA MAISON QUI NOUS FOURNISSAIT FERME", "VINGT ANS DE RELATION QUI S'ARRÊTENT"],
    mods: [{ quoi: "couts", mult: 1.15, duree: 2 }],
  },
  {
    id: "penurieSaphir", titre: "Plus de glaces saphir", epoque: "toujours",
    texte: "Les glaces saphir manquent. Le temps de sourcer ailleurs, l'atelier rend un cinquième de moins.",
    presse: ["PLUS DE SAPHIR", "LES GLACES MANQUENT"],
    effet: { capMult: 0.83 },
  },

  // ---- Commercial et distribution ---------------------------------------
  {
    id: "detaillantImpaye", titre: "Un détaillant fait défaut", epoque: "toujours",
    req: (g) => canal(g, "detaillants") >= 1,
    texte: "Un détaillant dépose le bilan avec votre marchandise. 8% du chiffre du trimestre passé en pertes.",
    presse: ["UN DÉTAILLANT FAIT DÉFAUT", "LA MARCHANDISE ET L'ARGENT"],
    effet: { caPct: -0.08 },
  },
  {
    id: "vagueRetours", titre: "Vague de retours clients", epoque: ["croissance", "maturite"],
    req: (g) => venduesAnnee(g) >= 200,
    texte: "Une vague de retours sur un défaut mineur mais visible. 5% des ventes annulées, désirabilité −3.",
    presse: ["LES CLIENTS RENVOIENT", "UN DÉFAUT QUI SE VOIT"],
    effet: { caPct: -0.05, des: -3 },
  },
  {
    id: "marcheGrisEnvol", titre: "La cote s'envole sur le marché gris", epoque: ["croissance", "maturite"],
    req: (g) => g.des >= 50,
    texte: "Vos pièces se revendent 40% au-dessus du prix catalogue. Désirabilité +8 — et pas un franc pour la maison.",
    presse: ["LA COTE S'ENVOLE SUR LE MARCHÉ GRIS", "ON REVEND PLUS CHER QUE NOUS"],
    effet: { des: 8 },
  },
  {
    id: "revendeurParallele", titre: "Un circuit parallèle brade vos modèles", epoque: "toujours",
    req: (g) => canal(g, "ecommerce") >= 2,
    texte: "Un revendeur parallèle brade vos modèles en ligne. Ventes +10% ce trimestre, désirabilité −6. Difficile de s'en réjouir.",
    presse: ["NOS MONTRES BRADÉES EN LIGNE", "LE CIRCUIT PARALLÈLE"],
    effet: { demandeMult: 1.1, des: -6 },
  },

  // ---- Presse, réseaux et réputation ------------------------------------
  {
    id: "macroVirale", titre: "Le défaut filmé de trop près", epoque: "toujours",
    req: (g) => actifs(g).length > 0,
    texte: "Quelqu'un a filmé en macro un défaut de finition sur votre mouvement. La vidéo tourne. Crédibilité −6, notoriété +6.",
    presse: ["LE DÉFAUT FILMÉ DE TROP PRÈS", "LA MACRO QUI FAIT MAL"],
    effet: { cred: -6, noto: 6 },
  },
  {
    id: "forumsDefense", titre: "Les clients montent au créneau", epoque: ["croissance", "maturite"],
    req: (g) => g.cred >= 30,
    texte: "Attaquée sur un forum, la marque a été défendue par ses propres clients. Crédibilité +3, désirabilité +2.",
    presse: ["LES CLIENTS MONTENT AU CRÉNEAU", "UNE COMMUNAUTÉ QUI RÉPOND"],
    effet: { cred: 3, des: 2 },
  },
  {
    id: "couvertureMagazine", titre: "En couverture", epoque: ["croissance", "maturite"],
    req: (g) => g.noto >= 30,
    texte: "Couverture d'un magazine spécialisé. Notoriété +7, crédibilité +3.",
    presse: ["EN COUVERTURE", "LA UNE D'UN MAGAZINE"],
    effet: { noto: 7, cred: 3 },
  },
  {
    id: "demontageDirect", titre: "Démontée en direct", epoque: "toujours",
    req: (g) => actifs(g).length > 0,
    texte: "Un YouTubeur démonte votre montre en direct devant 200'000 personnes. Tout dépend de ce qu'il y a dedans.",
    presse: ["DÉMONTÉE EN DIRECT", "L'ÉPREUVE DU TOURNEVIS"],
    // Le verdict dépend de la meilleure pièce du catalogue.
    effetSelon: (g) =>
      Math.max(...actifs(g).map((m) => m.qual)) >= 7
        ? { cred: 8, des: 5, verdict: "Le mouvement a tenu l'examen. Crédibilité +8, désirabilité +5." }
        : { cred: -7, des: -4, verdict: "L'intérieur ne valait pas l'extérieur. Crédibilité −7, désirabilité −4." },
  },
  {
    id: "prixDesign", titre: "Un prix pour le dessin", epoque: ["croissance", "maturite"],
    req: (g) => actifs(g).some((m) => m.age < 8),
    texte: "Un prix de design récompense une de vos pièces. Désirabilité +7, notoriété +4.",
    presse: ["UN PRIX POUR LE DESSIN", "RÉCOMPENSÉE POUR SON STYLE"],
    effet: { des: 7, noto: 4 },
  },
  {
    id: "celebriteGenante", titre: "Une ambassadrice encombrante", epoque: "toujours",
    req: (g) => g.noto >= 40,
    texte: "Une personnalité très commentée porte votre montre partout. Notoriété +9, crédibilité −5. On ne choisit pas ses ambassadeurs.",
    presse: ["UNE AMBASSADRICE ENCOMBRANTE", "LE POIGNET QU'ON N'AVAIT PAS DEMANDÉ"],
    effet: { noto: 9, cred: -5 },
  },

  // ---- Marché et finance -------------------------------------------------
  {
    id: "tauxHausse", titre: "La banque resserre", epoque: "toujours",
    req: (g) => g.dette > 100000,
    texte: "Les taux montent. Vos intérêts augmentent de moitié pour les trois prochaines années.",
    presse: ["LA BANQUE RESSERRE", "LE CRÉDIT COÛTE PLUS CHER"],
    mods: [{ quoi: "interets", mult: 1.5, duree: 12 }],
  },
  {
    id: "subventionRegionale", titre: "Une aide pour l'artisanat", epoque: ["debut", "croissance"],
    req: (g) => g.pays === "suisse" || g.pays === "france",
    texte: "Une aide régionale à l'artisanat vous est accordée : CHF 50'000, sans contrepartie autre qu'un dossier à remplir.",
    presse: ["UNE AIDE POUR L'ARTISANAT", "LE CANTON MET LA MAIN À LA POCHE"],
    effet: { cash: 50000 },
  },
  {
    id: "primeAssurance", titre: "Les assurances revoient leurs tarifs", epoque: "toujours",
    req: (g) => g.ateliers >= 1,
    texte: "Après le sinistre d'un confrère, les primes de la branche augmentent. Coûts fixes +4'000 par trimestre.",
    presse: ["LES ASSURANCES REVOIENT LEURS TARIFS", "LE SINISTRE DU VOISIN, NOTRE FACTURE"],
    mods: [{ quoi: "fixesAjout", montant: 4000, duree: null }],
  },
  {
    id: "changeFavorable", titre: "Le change joue pour nous", epoque: "toujours",
    texte: "Le change vous est favorable ce trimestre. Coûts de production −8%.",
    presse: ["LE CHANGE JOUE POUR NOUS", "UN TRIMESTRE DE RÉPIT SUR LES COÛTS"],
    effet: { coutMult: 0.92 },
  },
  {
    id: "grosImpaye", titre: "Un impayé qui pèse", epoque: ["croissance", "maturite"],
    req: (g) => g.revenusAnnee >= 500000,
    texte: "Un client important ne paie pas et conteste. 12% de la trésorerie bloqués, procédure engagée.",
    presse: ["UN IMPAYÉ QUI PÈSE", "L'ARGENT QUI NE RENTRE PAS"],
    effet: { cashPct: -0.12 },
  },

  // ---- Liés au pays de départ -------------------------------------------
  {
    id: "zoneEconomique", titre: "La région passe en zone prioritaire", epoque: "toujours",
    req: (g) => g.pays === "chine",
    texte: "Votre région est classée zone économique prioritaire. Coûts de production −10%, définitivement.",
    presse: ["LA RÉGION PASSE EN ZONE PRIORITAIRE", "UN COUP DE POUCE ADMINISTRATIF"],
    mods: [{ quoi: "couts", mult: 0.9, duree: null }],
  },
  {
    id: "marcheInterieurJP", titre: "Le marché intérieur s'entrouvre", epoque: "toujours",
    req: (g) => g.pays === "japon",
    texte: "Le marché intérieur japonais s'ouvre enfin aux petites maisons locales. Demande +15% pendant deux ans.",
    presse: ["LE MARCHÉ INTÉRIEUR S'ENTROUVRE", "LES JAPONAIS DÉCOUVRENT LEURS MARQUES"],
    mods: [{ quoi: "demande", mult: 1.15, duree: 8 }],
  },
  {
    id: "presseParisienne", titre: "Paris s'entiche de la maison", epoque: "toujours",
    req: (g) => g.pays === "france",
    texte: "La presse parisienne s'entiche de votre maison. Crédibilité +6, notoriété +5. Ça ne durera pas, autant en profiter.",
    presse: ["PARIS S'ENTICHE DE LA MAISON", "LA PRESSE PARISIENNE ADOPTE"],
    effet: { cred: 6, noto: 5 },
  },
];

/**
 * Les aléas possibles ce trimestre. Les entrées `choix` en sont exclues tant
 * que l'interface de décision ne les porte pas : un aléa qui se décide et un
 * aléa qui se subit ne se lisent pas pareil, et on ne veut pas du second par
 * défaut.
 */
export function poolAleas(g) {
  return ALEAS.filter((a) => !a.choix && (!a.req || a.req(g)));
}

/**
 * L'enquête sur la presse achetée. Elle ne passe pas par le tirage ordinaire :
 * sa probabilité dépend du compteur de complaisances (voir tirerAlea).
 */
ALEAS.push({
  id: "enqueteScandale", titre: "Un journaliste enquête", epoque: "toujours",
  req: (g) => (g.presseAchetee || 0) >= 3,
  texte: "Un papier révèle vos voyages de presse et vos montres offertes. Crédibilité −14, notoriété +4. L'ardoise repart à zéro, la réputation non.",
  presse: ["CE QUE LA MAISON OFFRAIT AUX JOURNALISTES", "ENQUÊTE SUR DES COMPLAISANCES", "LE PRIX DES BONS ARTICLES"],
  effet: { cred: -14, noto: 4, resetPresse: true },
});

/**
 * Les deux aléas qui dépendent de la politique salariale. `risqueSocial` les
 * fait doubler quand on paie mal et diviser par deux quand on paie bien : sans
 * ça, la décision n'aurait aucune conséquence visible.
 */
ALEAS.push(
  {
    id: "greve", titre: "Grève à l'atelier", epoque: ["croissance", "maturite"],
    risqueSocial: true,
    req: (g) => effectif(g.employes) >= 5 && g.salaires === "serree",
    texte: "L'atelier débraye. Production nulle ce trimestre, crédibilité −3. Il faudra choisir : céder ou tenir.",
    presse: ["L'ATELIER DÉBRAYE", "BRAS DE FER SOCIAL", "LES ÉTABLIS À L'ARRÊT"],
    effet: { prodMult: 0, cred: -3 },
  },
  {
    id: "departsSimultanes", titre: "Deux départs le même mois", epoque: ["croissance", "maturite"],
    risqueSocial: true,
    req: (g) => effectif(g.employes) >= 4 && g.salaires === "serree",
    texte: "Deux départs le même mois. Le message est clair. Savoir-faire −6, deux postes vacants.",
    presse: ["DEUX DÉPARTS LE MÊME MOIS", "L'ATELIER SE VIDE"],
    effet: { savoir: -6, employeMoins: 2 },
  }
);

// La démission ordinaire relève elle aussi du climat social.
for (const a of ALEAS) if (a.id === "demission" || a.id === "talentDebauche") a.risqueSocial = true;

/**
 * Les décisions. Un aléa qu'on subit et un aléa qu'on décide ne se lisent pas
 * pareil : ceux-là arrivent comme les opportunités, avec un choix à faire.
 *
 * Même forme qu'une opportunité, plus deux champs :
 *   `effetRefus`     ce que coûte — ou rapporte — le fait de dire non
 *   `surEvenement`   la décision n'est pas tirée au sort, c'est un événement
 *                    historique qui la déclenche
 */
export const DECISIONS = [
  {
    id: "maitreRetraite", type: "decision", titre: "Un maître horloger à la retraite se propose",
    texte: "Il viendrait deux jours par semaine. Le savoir-faire d'une vie, contre un salaire qui n'est pas symbolique.",
    cout: 0, heures: 20, epoque: ["croissance", "maturite"], req: (g) => g.savoir >= 40,
    effet: { savoir: 6, mods: [{ quoi: "fixesAjout", montant: 4000, duree: null }] },
    msg: "Le maître revient à l'établi : savoir-faire +6, CHF 4'000 par trimestre.",
  },
  {
    id: "outillageOccasion", type: "decision", titre: "L'outillage d'une manufacture qui ferme",
    texte: "Une maison liquide son outillage. CHF 40'000 pour deux cents heures de capacité — le prix d'un tiers d'agrandissement.",
    cout: 40000, heures: 30, epoque: "toujours", req: (g) => g.ateliers >= 1,
    effet: { capacitePlus: 200 },
    msg: "Outillage racheté : +200 h de capacité par trimestre, sans coût fixe supplémentaire.",
  },
  {
    id: "remiseVolume", type: "decision", titre: "Le fournisseur propose un contrat",
    texte: "−12% sur les composants pendant un an, contre un engagement de volume. En dessous, pénalité.",
    cout: 0, heures: 30, epoque: ["croissance", "maturite"],
    req: (g) => Object.values(g.segVendues).reduce((s, n) => s + n, 0) >= 300,
    effet: { engagementVolume: true, mods: [{ quoi: "couts", mult: 0.88, duree: 4 }] },
    msg: "Contrat signé : composants −12% pendant un an. En dessous de 125 pièces par trimestre, CHF 20'000 de pénalité.",
  },
  {
    id: "ebauchesLiquidation", type: "decision", titre: "Des ébauches à saisir",
    texte: "Soixante ébauches en liquidation à moitié prix. À prendre maintenant ou jamais.",
    cout: 18000, heures: 20, epoque: "toujours", req: () => true,
    effet: { mods: [{ quoi: "mouvement", mvtId: "ebauche", mult: 0.5, duree: 2 }] },
    msg: "Ébauches achetées : le mouvement coûte moitié prix pendant deux trimestres.",
  },
  {
    id: "maroquinier", type: "decision", titre: "Un maroquinier veut signer vos bracelets",
    texte: "Un nom réputé sur le cuir. La montre gagne, la marge perd.",
    cout: 0, heures: 30, epoque: ["croissance", "maturite"], req: (g) => g.des >= 30,
    effet: { qualPlus: 1, mods: [{ quoi: "couts", mult: 1.03, duree: null }] },
    msg: "Le cuir prend un nom : qualité +1 sur la meilleure pièce, coûts +3%.",
  },
  {
    id: "commandeCorporate", type: "decision", titre: "Quarante montres pour une entreprise",
    texte: "Gravées à leur logo, pour leurs cadres. Payées comptant, sans négociation possible — et sans prestige.",
    cout: 0, heures: 40, epoque: "toujours",
    req: (g) => g.noto >= 25 && g.modeles.some((m) => m.statut === "actif" && m.stock >= 40),
    effet: { venteDirecte: { n: 40, prixMult: 0.85 }, cred: -1 },
    msg: "Commande d'entreprise honorée.",
  },
  {
    id: "localCentreVille", type: "decision", titre: "Un local en centre-ville se libère",
    texte: "Une rue passante, 30% sous le prix habituel d'une boutique. L'occasion ne se représentera pas.",
    cout: 90000, heures: 40, epoque: ["croissance", "maturite"], req: (g) => g.cash >= 250000,
    effet: {
      canalPalier: "boutique", canalOuvre: "boutique", noto: 6, des: 3,
      mods: [{ quoi: "fixesAjout", montant: -6000, duree: 24 }],
    },
    msg: "Local pris à 30% sous le prix : la boutique en propre s'ouvre ou progresse d'un palier, et le loyer est allégé six ans durant.",
  },
  {
    id: "podcast", type: "decision", titre: "Un podcast horloger vous invite",
    texte: "Une heure au micro. Vingt heures de préparation pour ne pas dire de bêtises.",
    cout: 0, heures: 20, epoque: "toujours", req: (g) => g.cred >= 15,
    effet: { cred: 4, noto: 3 },
    msg: "Une heure au micro : crédibilité +4, notoriété +3.",
  },
  {
    id: "investisseurApproche", type: "decision", titre: "Un investisseur frappe à la porte",
    texte: "CHF 400'000 contre 20% du capital. De quoi accélérer — et un actionnaire à convaincre désormais.",
    cout: 0, heures: 40, epoque: ["croissance", "maturite"], req: (g) => g.revenusAnnee >= 1000000,
    effet: { cash: 400000, dilution: 20 },
    msg: "Investisseur entré au capital : CHF 400'000 contre 20% de la maison.",
  },
  {
    id: "horlogerLegendaire", type: "decision", titre: "Un nom cherche une maison",
    texte: "Un horloger dont tout le monde connaît le nom est disponible. Il produit comme les autres, au double du salaire — CHF 16'000 par trimestre, définitivement.",
    // La condition ne porte pas que sur le savoir-faire : un nom à double
    // salaire dans un atelier de trois personnes est une ruine, pas une
    // consécration. Il ne se propose qu'à une maison capable de l'absorber.
    cout: 0, heures: 40, epoque: "maturite",
    req: (g) => g.savoir >= 60 && Object.values(g.employes).reduce((s, n) => s + n, 0) >= 5 && g.cash >= 250000,
    // C'est un horloger avant d'être un nom : il occupe un poste et rend ses
    // 450 h comme les autres, au double du salaire. Sans cela il coûtait une
    // fortune sans jamais rien produire.
    effet: {
      savoir: 12, cred: 6, employePlus: 1,
      mods: [{ quoi: "fixesAjout", montant: 8000, duree: null }],
    },
    msg: "Le régleur que tout le monde voulait a signé : savoir-faire +12, crédibilité +6, 450 h de production — au double du salaire d'un horloger.",
  },
  {
    id: "ancienCamarade", type: "decision", titre: "Un ancien camarade propose de s'associer",
    texte: "CHF 200'000 contre 15% et un droit de regard. L'argent d'un ami n'est jamais tout à fait gratuit.",
    cout: 0, heures: 30, epoque: ["debut", "croissance"], req: (g) => g.annee - 2015 <= 8,
    effet: { cash: 200000, dilution: 15 },
    msg: "Association scellée : CHF 200'000 contre 15% de la maison.",
  },
  {
    id: "labelSwissMade", type: "decision", titre: "Le label Swiss made sous contrôle",
    texte: "Contrôle sur la composition de vos montres. Se mettre en conformité coûte CHF 25'000 ; y renoncer coûte le label, et ce qu'il permet de facturer.",
    cout: 25000, heures: 40, epoque: ["croissance", "maturite"], req: (g) => g.pays === "suisse",
    effet: { cred: 2 },
    effetRefus: {
      mods: [{ quoi: "prixAcceptable", mult: 0.85, duree: null }],
      msg: "Label perdu : le prix acceptable recule de 15%, définitivement.",
    },
    msg: "Mise en conformité faite : le label est sauf.",
  },
  {
    id: "venteCaritative", type: "decision", titre: "Une vente caritative vous invite",
    texte: "Une pièce unique sous le marteau pour une œuvre. Une montre en moins, quarante heures d'établi, et beaucoup de regards.",
    cout: 0, heures: 40, epoque: "toujours",
    req: (g) => g.cred >= 25 && g.modeles.some((m) => m.statut === "actif" && m.stock > 0),
    effet: { cred: 7, des: 6, stockMoins: 1 },
    msg: "La pièce est partie sous le marteau : crédibilité +7, désirabilité +6.",
  },
  {
    id: "ecolePartenariat", type: "decision", titre: "Une école veut placer deux apprentis",
    texte: "Trente heures à les encadrer ce trimestre, et un atelier qui transmet enfin quelque chose.",
    cout: 0, heures: 30, epoque: ["croissance", "maturite"],
    req: (g) => Object.values(g.employes).reduce((s, n) => s + n, 0) >= 3,
    effet: { savoir: 5, mods: [{ quoi: "salaires", mult: 0.95, duree: 4 }] },
    msg: "Deux apprentis à l'établi : savoir-faire +5, masse salariale allégée un an durant.",
  },

  // ---- Les trois décisions déclenchées par un événement -------------------
  {
    id: "machineAnglage", type: "decision", surEvenement: true,
    titre: "Installer le robot d'établi ?",
    texte: "La machine anglie un pont aussi bien qu'un humain, en un dixième du temps. La profession se divise entre ceux qui l'achètent et ceux qui refusent.",
    cout: 0, heures: 40, req: () => true,
    effet: { des: -10, cred: -6, mods: [{ quoi: "capacite", mult: 1.67, duree: null }] },
    msg: "Machine installée : l'atelier rend deux tiers d'heures en plus. Désirabilité −10, crédibilité −6.",
    effetRefus: { cred: 4, msg: "La maison s'en tient à la main. Crédibilité +4." },
  },
  {
    id: "contratSpatial", type: "decision", surEvenement: true,
    titre: "Le contrat spatial",
    texte: "Une mission habitée longue durée cherche un garde-temps mécanique qui fonctionne sans gravité ni électricité. Il faut tout reprendre depuis le début.",
    cout: 200000, heures: 150, req: (g) => g.savoir >= 70,
    effet: { cred: 15, noto: 12, des: 10 },
    msg: "Contrat spatial décroché : crédibilité +15, notoriété +12, désirabilité +10.",
  },
  {
    id: "offreRachat", type: "decision", surEvenement: true,
    titre: "Un groupe veut racheter la maison",
    texte: "L'offre est sérieuse, le chèque considérable, et le nom resterait sur les cadrans. Ce ne serait simplement plus votre maison.",
    cout: 0, heures: 0, req: () => true,
    effet: { finPartie: "rachat" },
    msg: "Offre acceptée.",
    effetRefus: { cred: 3, msg: "Offre déclinée. La profession en prend note : crédibilité +3." },
  },
];

/**
 * Les six recrutements de direction. Ils passent par l'interface de décision
 * comme le reste : un directeur se choisit, il ne se tire pas au sort.
 *
 * Un directeur exonère, il ne multiplie pas — voir DIRECTEURS dans config.js.
 * Le prérequis monte avec le nombre de directeurs déjà en poste : la structure
 * doit précéder l'encadrement, sinon on paie six salaires pour trois ateliers.
 */
const CANDIDATURES = {
  production: "Un directeur de production venu d'une grande manufacture propose ses services. Il sait faire construire, et il sait remplir.",
  rh: "Une DRH d'un groupe horloger cherche une maison à taille humaine. Elle recrute par dix et connaît tout le monde dans la vallée.",
  dsi: "Un directeur des systèmes d'information vous explique que votre boutique en ligne date d'il y a quinze ans. Il n'a pas tort.",
  commercial: "Un directeur commercial avec le carnet d'adresses de la profession entière. Il ouvre des portes que vous ne saviez pas fermées.",
  marketing: "Une directrice marketing qui a fait trois marques avant la vôtre. Elle sait ce qu'une campagne coûte et ce qu'elle rapporte.",
  financier: "Un directeur financier qui parle aux banques dans leur langue, et à l'administration fiscale dans la sienne.",
};

for (const [role, texte] of Object.entries(DIRECTEURS)) {
  DECISIONS.push({
    id: "recruter_" + role, type: "decision", titre: "Recruter : " + texte.nom.toLowerCase(),
    texte: CANDIDATURES[role] + " Salaire : " + texte.fixes.toLocaleString("fr-CH").replace(/\s/g, "'") + " CHF par trimestre.",
    cout: 0, heures: 40, epoque: "maturite",
    req: (g) => {
      if (g.directeurs && g.directeurs[role]) return false;
      if (!DIRECTEUR_CONDITION[role].ok(g)) return false;
      const dejaLa = Object.values(g.directeurs || {}).filter(Boolean).length;
      // Le Top 10 fait tomber les seuils croissants : à ce niveau, la maison
      // n'a plus à prouver qu'elle peut se payer une direction.
      const top10 = (g.rangs || []).some((r) => r <= 10);
      const req = DIRECTEUR_REQ(dejaLa, top10);
      const effectif2 = Object.values(g.employes).reduce((s, n) => s + n, 0);
      return effectif2 >= req.employes && g.cred >= req.cred;
    },
    // Le salaire n'est pas un modificateur : il entre dans les coûts fixes par
    // masseDirection(). Le `req` suffit à interdire un second directeur du même rôle.
    effet: { directeur: role },
    msg: texte.nom + " rejoint la maison. " + texte.desc,
  });
}

/** Tout ce qui peut être proposé au joueur, opportunités et décisions. */
export const PROPOSITIONS = [...OPPORTUNITES, ...DECISIONS];

/**
 * `copieConcurrent` a besoin d'identifier le meilleur vendeur : il ne pouvait
 * pas être écrit avec le vocabulaire déclaratif des autres aléas.
 */
ALEAS.push({
  id: "copieConcurrent", titre: "Un concurrent copie votre best-seller", epoque: ["croissance", "maturite"],
  req: (g) => g.modeles.some((m) => m.statut === "actif" && m.age >= 2),
  texte: "Une maison concurrente sort une pièce très proche de votre meilleure vente, 30% moins chère. Fraîcheur du modèle −35%, désirabilité −4.",
  presse: ["UNE RESSEMBLANCE TROUBLANTE", "LE MARCHÉ SE COPIE", "NOTRE BEST-SELLER A UN JUMEAU"],
  effet: { fraicheurMalus: 0.35, des: -4 },
});

// Les deux aléas qui coûtaient des heures repassent en décisions : on ne
// dépense pas quarante heures d'établi dans un rapport qu'on se contente de lire.
for (let i = ALEAS.length - 1; i >= 0; i--) {
  if (ALEAS[i].id === "venteCaritative" || ALEAS[i].id === "ecolePartenariat") ALEAS.splice(i, 1);
}

/**
 * Une proposition dont l'effet est définitif ne se propose qu'une fois.
 *
 * Sans cette règle, le label Swiss made revenait tous les trois ans et chaque
 * refus multipliait le prix acceptable par 0,85 — cinq refus et la marque était
 * morte, sans que le joueur ait jamais vu venir le cumul. Même chose à
 * l'endroit : on ne rachète pas deux fois le même fournisseur.
 *
 * La règle se déduit du contenu plutôt que de se poser à la main : un
 * modificateur sans durée, une dilution du capital ou une fin de partie
 * suffisent. Le rachat d'un indépendant y échappe volontairement — l'Empire
 * demande d'en racheter trois.
 */
for (const o of PROPOSITIONS) {
  const e = o.effet || {};
  const permanent = (liste) => (liste || []).some((m) => m.duree == null);
  if (permanent(e.mods) || permanent(o.effetRefus && o.effetRefus.mods) || e.dilution || e.finPartie) {
    o.uneFois = true;
  }
}
