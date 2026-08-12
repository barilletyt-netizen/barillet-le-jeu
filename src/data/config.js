// Données de création de personnage et catalogue produit.
// Spec v0.5 : budget d'heures (plus de PA), employés spécialisés, complications,
// self-made à 10'000 CHF, horizon 2015-2065.

// ---- Fermeture de la beta ------------------------------------------------
// Drapeau unique : à true, l'application ne sert que l'écran de fermeture. Le
// jeu reste intégralement dans le code, rien n'est supprimé — repasser à false
// suffit à rouvrir (beta de novembre).
//
// ATTENTION : `main` sert le panneau de fermeture (true). Sur la branche de
// chantier il est à false pour pouvoir jouer et tester. Au moment de rouvrir,
// c'est la seule ligne à vérifier.
export const BETA_FERMEE = true;

// Liens de l'écran de fermeture. Un lien à null s'affiche en texte simple :
// mieux vaut pas de lien qu'un lien mort sur une page publique.
// Discord volontairement absent : l'invitation passe par la description de la
// vidéo et la newsletter, pas par le jeu.
export const LIENS = {
  youtube: "https://www.youtube.com/@barilletmontre",
  discord: null,
};

// ---- Temps et budget d'heures -------------------------------------------

export const ANNEE_DEBUT = 2015;
export const ANNEE_FIN = 2065;

// Le fondateur dispose de 360 h par trimestre. Ce qui n'est pas dépensé en
// actions part à l'établi : production + savoir-faire. Chaque heure de com est
// une montre non produite — c'est le cœur du jeu.
// Playtest v0.5 : 500 h laissaient tout faire dans le même trimestre. À 360 h,
// une R&D coûte la moitié du trimestre et il faut choisir.
export const HEURES_FONDATEUR = 360;

// Coûts en heures des actions du fondateur. Blocs chunky, jamais de micro-gestion.
export const COUTS_H = {
  marketing: 80,
  choc: 110,
  presse: 50,
  rd: 180,
  facelift: 140,
  edition: 80,
  kickstarter: 160,
  distribution: 80,
  etude: 40,
  soldes: 30,
  embauche: 40,
  atelier: 60,
  emprunt: 30,
  licenciement: 30,
  canal: 0, // le coût en heures dépend du palier ouvert
};

// Un facelift coûte cette part du budget R&D d'origine (playtest : 40% était
// trop peu, on relançait un modèle indéfiniment pour rien).
export const FACELIFT_PART_RD = 0.75;

// Montants en CHF des actions. Partagés entre la logique et les libellés de
// l'UI, pour qu'un changement de tarif ne laisse pas un texte périmé derrière.
export const COUTS_CHF = {
  marketing: 15000,
  choc: 30000,
  etude: 5000,
  emprunt: 150000,
  remboursement: 50000,
};

// Heures d'établi nécessaires pour gagner 1 point de savoir-faire.
export const HEURES_PAR_SAVOIR = 150;

export const PAYS = {
  suisse: {
    nom: "Suisse", flag: "🇨🇭", coutMult: 1.35, credBonus: 2, qualBonus: 2, mktMult: 1.0, savoirBonus: 8,
    desc: "Savoir-faire et label. Cher, mais crédible dès le départ.",
  },
  chine: {
    nom: "Chine", flag: "🇨🇳", coutMult: 0.55, credBonus: -2, qualBonus: 0, mktMult: 1.0, savoirBonus: 0,
    desc: "Production à bas coût. Crédibilité à construire.",
  },
  japon: {
    nom: "Japon", flag: "🇯🇵", coutMult: 1.0, credBonus: 1, qualBonus: 2, mktMult: 0.85, savoirBonus: 8,
    desc: "Excellence technique. Export plus difficile au début.",
  },
  france: {
    nom: "France", flag: "🇫🇷", coutMult: 1.1, credBonus: 0, qualBonus: 0, mktMult: 1.45, savoirBonus: 3,
    desc: "Presse spécialisée accessible : marketing très efficace.",
  },
};

export const PROFILS = {
  ingenieur: { nom: "Ingénieur", icon: "⚙", desc: "Mouvement manufacture débloqué. Développement plus rapide, R&D -30%." },
  financier: { nom: "Financier", icon: "💼", desc: "Capital ×1.5. Emprunts à taux réduit." },
  artisan: { nom: "Artisan", icon: "🔧", desc: "Qualité +2, savoir-faire +10 au départ." },
};

export const ORIGINES = {
  heritier: { nom: "Héritier", capital: 2000000, dette: 0, reseau: 8, cred: 5, desc: "CHF 2'000'000, réseau immense. Partie facile." },
  moyen: { nom: "Classe moyenne", capital: 300000, dette: 0, reseau: 4, cred: 2, desc: "CHF 300'000, réseau correct. Équilibré." },
  selfmade: { nom: "Self-made", capital: 10000, dette: 30000, reseau: 2, cred: 1, desc: "CHF 10'000, crédit étudiant de 30'000. Brutal." },
};

// ---- Employés spécialisés (v0.5) ----------------------------------------
// Chaque employé apporte ~450 h/trimestre dans sa spécialité.

export const HEURES_EMPLOYE = 450;

export const EMPLOYES = {
  horloger: {
    nom: "Horloger", icon: "👤", production: true, fixes: 8000, savoir: 4,
    desc: "+450 h de production par trimestre.",
  },
  decorateur: {
    nom: "Décorateur", icon: "🎨", production: true, fixes: 9000, savoir: 2,
    desc: "+450 h de production, débloque la finition maison.",
  },
  ingenieur: {
    nom: "Ingénieur", icon: "⚙", production: false, fixes: 12000, savoir: 3,
    desc: "R&D plus rapide et moins chère en heures. Requis pour les hautes complications.",
  },
  materiaux: {
    nom: "Expert matériaux", icon: "🧪", production: false, fixes: 10000, savoir: 2,
    desc: "Requis pour travailler bronze, titane, céramique et or. Coûts matière −20%.",
  },
  chef: {
    nom: "Chef d'atelier", icon: "📋", production: false, fixes: 14000, savoir: 1,
    desc: "Encadre 5 personnes de production de plus, au-delà des 3 que vous gérez vous-même.",
  },
};

// Encadrement. Le fondateur gère lui-même ses premiers employés : le chef
// d'atelier est un palier de croissance, pas un prérequis à la première
// embauche (retour de beta : la pénalité tombait dès le premier horloger et
// rendait le démarrage incompréhensible).
export const ENCADREMENT_SANS_CHEF = 3;
export const ENCADREMENT_PAR_CHEF = 5;
// Efficacité plancher quand personne n'encadre l'atelier.
export const ENCADREMENT_PLANCHER = 0.55;
// Indemnité de licenciement, en trimestres de salaire.
export const INDEMNITE_TRIMESTRES = 2;

export const EMPLOYES_VIDE = { horloger: 0, decorateur: 0, ingenieur: 0, materiaux: 0, chef: 0 };

// ---- Produit ------------------------------------------------------------

// heures = supplément d'atelier par pièce, en plus des heures de la gamme.
// Un mouvement maison se termine et se règle à la main : il coûte du temps par
// dessus le standard de finition du segment. Ébauche et quartz s'assemblent.
export const MOUVEMENTS = {
  quartz: { nom: "Quartz", cout: 20, qual: 2, rd: 8000, dev: 1, heures: 0, desc: "Mouvement à ~CHF 20. 1 trim. de dev." },
  ebauche: { nom: "Mécanique (ébauche)", cout: 220, qual: 5, rd: 35000, dev: 3, heures: 0, desc: "Ébauche à ~CHF 220. 3 trim. de dev." },
  manufacture: { nom: "Manufacture", cout: 2500, qual: 8, rd: 400000, dev: 6, heures: 6, desc: "Mouvement maison à ~CHF 2'500. 6 trim. +6 h/pièce. Ingénieur requis." },
};

export const STYLES = {
  sport: { nom: "Sport", mult: { grandpublic: 1.1, lifestyle: 1.15, connaisseurs: 0.9, bling: 0.9 } },
  dress: { nom: "Classique", mult: { grandpublic: 0.9, lifestyle: 0.95, connaisseurs: 1.15, bling: 1.0 } },
  plongeuse: { nom: "Plongeuse", mult: { grandpublic: 1.05, lifestyle: 1.1, connaisseurs: 1.05, bling: 0.85 } },
  squelette: { nom: "Squelette", mult: { grandpublic: 0.7, lifestyle: 0.9, connaisseurs: 1.1, bling: 1.25 } },
};

// Les matériaux se travaillent : chacun demande une recherche (heures + CHF +
// trimestres) ET un expert matériaux dans l'équipe. L'acier est acquis d'office.
// Playtest : avec le seul expert, on passait directement à l'or et le bénéfice
// explosait. `req` enchaîne l'apprentissage des alliages.
export const MATERIAUX = {
  acier: { nom: "Acier", cout: 0, idealMult: 1, req: null, rdHeures: 0, rd: 0, dev: 0, acquisDepart: true },
  bronze: { nom: "Bronze", cout: 60, idealMult: 1.15, req: null, rdHeures: 80, rd: 30000, dev: 1 },
  titane: { nom: "Titane", cout: 320, idealMult: 1.5, req: "bronze", rdHeures: 160, rd: 120000, dev: 2 },
  ceramique: { nom: "Céramique", cout: 420, idealMult: 1.7, req: "titane", rdHeures: 200, rd: 200000, dev: 2 },
  or: { nom: "Or", cout: 2500, idealMult: 2.6, req: "titane", rdHeures: 240, rd: 350000, dev: 3 },
};

// Nombre maximum de complications sur une même montre.
export const COMPLICATIONS_MAX = 3;

// Arbre techno à trois niveaux par complication (18 recherches en tout).
// `req` = complication précédente, qu'il faut maîtriser au moins au niveau
// COMPL_NIVEAU_REQUIS pour ouvrir celle-ci. `ingenieur` = ingénieur requis
// (employé ou profil), `manufacture` = mouvement manufacture obligatoire.
// Par niveau : heures = heures d'atelier ajoutées par pièce ; prixMult = prix
// acceptable ; qual = qualité ajoutée.
export const COMPL_NIVEAU_REQUIS = 2;

export const COMPLICATIONS = {
  aucune: {
    nom: "Trois aiguilles", req: null,
    niveaux: [{ nom: "Trois aiguilles", heures: 0, rdHeures: 0, rd: 0, dev: 0, qual: 0, prixMult: 1 }],
  },
  date: {
    nom: "Date", req: null,
    niveaux: [
      { nom: "Date à guichet", heures: 1, rdHeures: 60, rd: 15000, dev: 1, qual: 0, prixMult: 1.1 },
      { nom: "Grande date", heures: 1, rdHeures: 90, rd: 35000, dev: 1, qual: 1, prixMult: 1.2 },
      { nom: "Quantième annuel", heures: 2, rdHeures: 140, rd: 90000, dev: 2, qual: 1, prixMult: 1.35 },
    ],
  },
  chrono: {
    nom: "Chronographe", req: "date",
    niveaux: [
      { nom: "Chrono à came", heures: 3, rdHeures: 150, rd: 90000, dev: 2, qual: 1, prixMult: 1.4 },
      { nom: "Roue à colonnes", heures: 4, rdHeures: 200, rd: 160000, dev: 3, qual: 2, prixMult: 1.6 },
      { nom: "Rattrapante", heures: 6, rdHeures: 280, rd: 320000, dev: 4, qual: 2, prixMult: 1.95 },
    ],
  },
  gmt: {
    nom: "GMT", req: "chrono",
    niveaux: [
      { nom: "Aiguille 24 heures", heures: 2, rdHeures: 120, rd: 60000, dev: 2, qual: 1, prixMult: 1.3 },
      { nom: "Heure sautante", heures: 2, rdHeures: 170, rd: 120000, dev: 2, qual: 1, prixMult: 1.45 },
      { nom: "Heure universelle", heures: 3, rdHeures: 230, rd: 240000, dev: 3, qual: 2, prixMult: 1.7 },
    ],
  },
  lune: {
    nom: "Phase de lune", req: "gmt", ingenieur: true,
    niveaux: [
      { nom: "Phase de lune", heures: 2, rdHeures: 130, rd: 80000, dev: 2, qual: 1, prixMult: 1.35 },
      { nom: "Lune de précision", heures: 3, rdHeures: 190, rd: 150000, dev: 3, qual: 1, prixMult: 1.5 },
      { nom: "Complication astronomique", heures: 5, rdHeures: 260, rd: 300000, dev: 4, qual: 2, prixMult: 1.85 },
    ],
  },
  reserve: {
    nom: "Réserve de marche", req: "lune", ingenieur: true,
    niveaux: [
      { nom: "Indicateur de réserve", heures: 2, rdHeures: 110, rd: 60000, dev: 2, qual: 1, prixMult: 1.25 },
      { nom: "Réserve longue durée", heures: 3, rdHeures: 160, rd: 130000, dev: 2, qual: 1, prixMult: 1.4 },
      { nom: "Réserve d'un mois", heures: 4, rdHeures: 220, rd: 260000, dev: 3, qual: 2, prixMult: 1.65 },
    ],
  },
  tourbillon: {
    nom: "Tourbillon", req: "reserve", ingenieur: true, manufacture: true,
    niveaux: [
      { nom: "Tourbillon une cage", heures: 12, rdHeures: 300, rd: 600000, dev: 5, qual: 2, prixMult: 2.6 },
      { nom: "Tourbillon volant", heures: 14, rdHeures: 380, rd: 900000, dev: 5, qual: 2, prixMult: 3.2 },
      { nom: "Tourbillon multi-axes", heures: 18, rdHeures: 460, rd: 1400000, dev: 6, qual: 3, prixMult: 4.2 },
    ],
  },
};

// Finition maison : débloquée par le décorateur.
export const FINITION = { heures: 1, cout: 80, qual: 1, prixMult: 1.2 };

// `ideal` sert de repère de prix au joueur et de pivot à la formule de demande —
// ce n'est plus un prix imposé. `pool` = taille du marché avant saturation.
// Playtest : les pools d'origine plafonnaient le quartz vers 1'500 pièces par
// trimestre. Élargis pour qu'une marque de volume puisse exister.
//
// Les pools du haut de gamme avaient été resserrés pour compenser sa
// supériorité — compensation levée depuis que les heures par pièce portent
// l'écart : le haut de gamme est désormais bridé par le temps d'atelier, pas
// par un marché artificiellement rétréci. Une seule cause, un seul frein.
// `heures` = temps d'atelier par pièce, porté par la gamme et non par le
// mouvement. Échelle arbitrée sur le réel horloger, pas sur l'équilibrage : un
// quartz d'entrée de gamme s'assemble en minutes, une pièce de haute horlogerie
// finie main demande des dizaines d'heures. C'est le sujet même du jeu.
export const SEGMENTS = {
  grandpublic: { nom: "Grand public", ideal: 280, base: 3800, pool: 800000, heures: 1, qualMin: 0, notoMin: 0, desc: "Gros volumes, très sensible au prix. 1 h de main-d'œuvre par pièce." },
  lifestyle: { nom: "Lifestyle", ideal: 700, base: 2300, pool: 320000, heures: 2, qualMin: 2, notoMin: 10, desc: "Achète l'image. Notoriété indispensable. 2 h par pièce." },
  connaisseurs: { nom: "Connaisseurs", ideal: 3500, base: 2100, pool: 90000, heures: 12, qualMin: 5, notoMin: 5, desc: "Qualité et crédibilité exigées. Marché étroit, 12 h par pièce." },
  bling: { nom: "Bling-bling", ideal: 9000, base: 800, pool: 30000, heures: 30, qualMin: 4, notoMin: 35, desc: "Marché minuscule, finition d'exception : 30 h par pièce." },
};

// ---- Rendements des jauges ----------------------------------------------
// Les jauges d'image agissent en rendements décroissants : un exposant < 1
// rend les premiers points très payants et les derniers presque décoratifs.
//
// Pourquoi concave plutôt qu'un poids global plus faible : la beta a montré que
// les jauges devenaient accessoires au-delà d'un certain niveau, mais elles
// doivent rester le déverrouillage des marges en début de partie. Aplatir le
// haut de la courbe tame la stratégie « tout dans l'image » sans dévaloriser
// les premiers investissements — au contraire, il les renforce.
// Élasticité au-delà du prix acceptable. En dessous, la demande reste linéaire ;
// au-dessus, elle est écrasée par une puissance.
// Beta : « il suffit de marger comme un porc » — vendre 35% au-dessus ne coûtait
// presque rien en volume. Posée à 2,6, puis détendue à 1,6 : une fois les heures
// par gamme en place, le haut de gamme était puni deux fois (par le temps
// d'atelier et par le prix). Mesuré : l'écart entre stratégies passe de 48× à
// 31× en relâchant ce seul curseur.
export const ELASTICITE_PRIX =
  typeof process !== "undefined" && process.env && process.env.BARILLET_ELASTICITE
    ? Number(process.env.BARILLET_ELASTICITE)
    : 1.6;

export const CONCAVITE_NOTORIETE = 0.55;
export const CONCAVITE_CREDIBILITE = 0.55;
export const CONCAVITE_DESIRABILITE = 0.55;

// La saturation d'un segment se résorbe : elle mesure les ventes récentes, pas
// le cumul de toute la partie (sinon le marché se ferme définitivement).
export const SATURATION_DECROISSANCE = 0.75;

// ---- Canaux de distribution (remplacent la jauge « distribution /100 ») -----
// Chaque canal a 3 paliers. `portee` multiplie le volume accessible, `marge` est
// la part du prix qui revient à la marque : les détaillants agréés ouvrent le
// volume mais prennent leur commission.
export const CANAUX = {
  direct: {
    nom: "Vente directe", icon: "🤝", marge: 1.0,
    desc: "Bouche-à-oreille, atelier, connaissances. Peu de volume, toute la marge.",
    paliers: [
      { nom: "Carnet d'adresses", portee: 0.35, cout: 0, fixes: 0, heures: 0 },
      { nom: "Fichier clients", portee: 0.5, cout: 15000, fixes: 2000, heures: 40 },
      { nom: "Clientèle fidélisée", portee: 0.7, cout: 60000, fixes: 6000, heures: 60 },
    ],
  },
  ecommerce: {
    nom: "E-commerce", icon: "💻", marge: 0.92,
    desc: "Votre boutique en ligne. Frais de paiement et logistique.",
    paliers: [
      { nom: "Site vitrine", portee: 0.6, cout: 25000, fixes: 3000, heures: 60 },
      { nom: "Boutique en ligne", portee: 1.2, cout: 80000, fixes: 8000, heures: 60 },
      { nom: "Plateforme internationale", portee: 2.0, cout: 250000, fixes: 20000, heures: 80 },
    ],
  },
  foires: {
    nom: "Foires et salons", icon: "🎪", marge: 0.95, bonusCred: 1,
    desc: "Stands et salons. Coûte cher en fixe, entretient la crédibilité.",
    paliers: [
      { nom: "Salons régionaux", portee: 0.4, cout: 20000, fixes: 8000, heures: 80 },
      { nom: "Circuit européen", portee: 0.8, cout: 60000, fixes: 18000, heures: 80 },
      { nom: "Salons mondiaux", portee: 1.4, cout: 150000, fixes: 40000, heures: 100 },
    ],
  },
  detaillants: {
    nom: "Détaillants agréés", icon: "🏬", marge: 0.55, reqCred: 6,
    desc: "Le volume, mais 45% du prix part chez le revendeur.",
    paliers: [
      { nom: "Quelques revendeurs", portee: 1.5, cout: 15000, fixes: 4000, heures: 80 },
      { nom: "Réseau national", portee: 3.0, cout: 60000, fixes: 10000, heures: 80 },
      { nom: "Réseau mondial", portee: 5.0, cout: 200000, fixes: 25000, heures: 100 },
    ],
  },
  boutique: {
    nom: "Boutique en propre", icon: "🏛", marge: 1.0, reqNoto: 30, bonusDes: 2,
    desc: "Vitrine à votre nom. Marge pleine, loyer lourd, désirabilité en hausse.",
    paliers: [
      { nom: "Première boutique", portee: 0.7, cout: 300000, fixes: 25000, heures: 120 },
      { nom: "Quelques adresses", portee: 1.5, cout: 700000, fixes: 55000, heures: 120 },
      { nom: "Flagships mondiaux", portee: 2.6, cout: 1500000, fixes: 110000, heures: 140 },
    ],
  },
};

export const CANAUX_VIDE = { direct: 1, ecommerce: 0, foires: 0, detaillants: 0, boutique: 0 };

// ---- Fiscalité ----------------------------------------------------------
// Impôt sur le bénéfice annuel, prélevé au bilan de fin d'année.
export const IMPOT_TAUX = 0.18;

// ---- Atelier et coûts fixes ---------------------------------------------
// L'atelier est un plafond d'heures : embaucher sans agrandir ne sert à rien.
//
// Deux paliers, parce qu'un seul enfermait les stratégies de volume. Mesure :
// un volumiste dégage ~25'000 par trimestre et paie ~74'000 de frais fixes ; il
// n'atteignait jamais les 350'000 nécessaires pour s'offrir la grande
// extension, restait bloqué à un employé pendant cinquante ans et mourait avec
// une demande de 3'800 pièces qu'il ne pouvait pas servir.
//
// Le petit palier permet de croître par petits pas ; le grand reste plus
// avantageux au poste (50'000 contre 60'000, et 3'500 de fixes contre 5'000) :
// s'offrir la grande halle reste la bonne affaire quand on en a les moyens.
export const ATELIERS = {
  petit: { nom: "Un poste de travail", postes: 1, heures: 450, cout: 60000, fixes: 5000, heuresAction: 30 },
  grand: { nom: "Une halle de quatre postes", postes: 4, heures: 1800, cout: 200000, fixes: 14000, heuresAction: 60 },
};

// L'atelier de départ accueille le fondateur et un compagnon.
export const CAPACITE_DEPART = 810;

export const FIXES_BASE = 12000;

// ---- Crédibilité (rééquilibrage S2) -------------------------------------
export const CRED_SAVOIR_SEUIL = 60; // savoir-faire ≥ 60 → +1 crédibilité par an
export const CRED_ANCIENNETE_ANS = 5; // +1 crédibilité tous les 5 ans d'existence
