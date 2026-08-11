// Données de création de personnage et catalogue produit.
// Spec v0.5 : budget d'heures (plus de PA), employés spécialisés, complications,
// self-made à 10'000 CHF, horizon 2015-2065.

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
    desc: "Encadre jusqu'à " + 5 + " personnes en production. Sans lui, l'atelier perd en efficacité.",
  },
};

// Encadrement : au-delà de ce ratio, il faut des chefs d'atelier.
export const ENCADREMENT_PAR_CHEF = 5;
// Efficacité plancher quand personne n'encadre l'atelier.
export const ENCADREMENT_PLANCHER = 0.55;
// Indemnité de licenciement, en trimestres de salaire.
export const INDEMNITE_TRIMESTRES = 2;

export const EMPLOYES_VIDE = { horloger: 0, decorateur: 0, ingenieur: 0, materiaux: 0, chef: 0 };

// ---- Produit ------------------------------------------------------------

// heures = heures d'atelier consommées par pièce produite.
export const MOUVEMENTS = {
  quartz: { nom: "Quartz", cout: 20, qual: 2, rd: 8000, dev: 1, heures: 1, desc: "Mouvement à ~CHF 20. 1 trim. de dev. 1 h d'atelier/pièce." },
  ebauche: { nom: "Mécanique (ébauche)", cout: 220, qual: 5, rd: 35000, dev: 3, heures: 3, desc: "Ébauche à ~CHF 220. 3 trim. de dev. 3 h d'atelier/pièce." },
  manufacture: { nom: "Manufacture", cout: 2500, qual: 8, rd: 400000, dev: 6, heures: 10, desc: "Mouvement maison à ~CHF 2'500. 6 trim. 10 h/pièce. Ingénieur requis." },
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
export const SEGMENTS = {
  grandpublic: { nom: "Grand public", ideal: 280, base: 3800, pool: 800000, qualMin: 0, notoMin: 0, desc: "Gros volumes, très sensible au prix." },
  lifestyle: { nom: "Lifestyle", ideal: 700, base: 2300, pool: 320000, qualMin: 2, notoMin: 10, desc: "Achète l'image. Notoriété indispensable." },
  connaisseurs: { nom: "Connaisseurs", ideal: 3500, base: 750, pool: 90000, qualMin: 5, notoMin: 5, desc: "Qualité et crédibilité exigées." },
  bling: { nom: "Bling-bling", ideal: 9000, base: 280, pool: 30000, qualMin: 4, notoMin: 35, desc: "Prix élevés, mais il faut être connu." },
};

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
export const CAPACITE_DEPART = 500;
export const ATELIER_COUT = 120000;
export const ATELIER_HEURES = 450;
export const ATELIER_FIXES = 6000;
export const FIXES_BASE = 12000;

// ---- Crédibilité (rééquilibrage S2) -------------------------------------
export const CRED_SAVOIR_SEUIL = 60; // savoir-faire ≥ 60 → +1 crédibilité par an
export const CRED_ANCIENNETE_ANS = 5; // +1 crédibilité tous les 5 ans d'existence
