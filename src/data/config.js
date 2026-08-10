// Données de création de personnage et catalogue produit.
// Spec v0.5 : budget d'heures (plus de PA), employés spécialisés, complications,
// self-made à 10'000 CHF, horizon 2015-2065.

// ---- Temps et budget d'heures -------------------------------------------

export const ANNEE_DEBUT = 2015;
export const ANNEE_FIN = 2065;

// Le fondateur dispose de 500 h par trimestre. Ce qui n'est pas dépensé en
// actions part à l'établi : production + savoir-faire. Chaque heure de com est
// une montre non produite — c'est le cœur du jeu.
export const HEURES_FONDATEUR = 500;

// Coûts en heures des actions du fondateur. Blocs chunky, jamais de micro-gestion.
export const COUTS_H = {
  marketing: 60,
  choc: 80,
  presse: 40,
  rd: 150,
  facelift: 60,
  edition: 60,
  kickstarter: 120,
  distribution: 60,
  etude: 30,
  soldes: 20,
  embauche: 30,
  atelier: 40,
  emprunt: 20,
};

// Heures d'établi nécessaires pour gagner 1 point de savoir-faire.
export const HEURES_PAR_SAVOIR = 200;

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
    desc: "+450 h de production par trimestre, savoir-faire +4.",
  },
  decorateur: {
    nom: "Décorateur", icon: "🎨", production: true, fixes: 9000, savoir: 2,
    desc: "+450 h de production, débloque les finitions (qualité et désirabilité).",
  },
  ingenieur: {
    nom: "Ingénieur", icon: "⚙", production: false, fixes: 12000, savoir: 3,
    desc: "R&D plus rapide et moins chère en heures. Requis pour les hautes complications.",
  },
  materiaux: {
    nom: "Expert matériaux", icon: "🧪", production: false, fixes: 10000, savoir: 2,
    desc: "Débloque bronze, titane, céramique et or. Coûts matière −20%.",
  },
};

export const EMPLOYES_VIDE = { horloger: 0, decorateur: 0, ingenieur: 0, materiaux: 0 };

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

// expert : nécessite un expert matériaux dans l'équipe.
export const MATERIAUX = {
  acier: { nom: "Acier", cout: 0, idealMult: 1, expert: false },
  bronze: { nom: "Bronze", cout: 60, idealMult: 1.15, expert: true },
  titane: { nom: "Titane", cout: 320, idealMult: 1.5, expert: true },
  ceramique: { nom: "Céramique", cout: 420, idealMult: 1.7, expert: true },
  or: { nom: "Or", cout: 2500, idealMult: 2.6, expert: true },
};

// Arbre techno. `req` = complication précédente, `ingenieur` = ingénieur requis
// (employé ou profil), `manufacture` = mouvement manufacture obligatoire.
// heures = heures d'atelier ajoutées par pièce. prixMult = prix acceptable.
export const COMPLICATIONS = {
  aucune: { nom: "Trois aiguilles", heures: 0, rdHeures: 0, rd: 0, dev: 0, qual: 0, prixMult: 1, req: null },
  date: { nom: "Date", heures: 1, rdHeures: 60, rd: 15000, dev: 1, qual: 0, prixMult: 1.1, req: null },
  chrono: { nom: "Chronographe", heures: 3, rdHeures: 150, rd: 90000, dev: 3, qual: 1, prixMult: 1.45, req: "date" },
  gmt: { nom: "GMT", heures: 2, rdHeures: 130, rd: 70000, dev: 2, qual: 1, prixMult: 1.35, req: "chrono" },
  lune: { nom: "Phase de lune", heures: 2, rdHeures: 140, rd: 80000, dev: 2, qual: 1, prixMult: 1.4, req: "gmt", ingenieur: true },
  reserve: { nom: "Réserve de marche", heures: 2, rdHeures: 120, rd: 60000, dev: 2, qual: 1, prixMult: 1.25, req: "lune", ingenieur: true },
  tourbillon: { nom: "Tourbillon", heures: 12, rdHeures: 300, rd: 600000, dev: 6, qual: 2, prixMult: 3, req: "reserve", ingenieur: true, manufacture: true },
};

// Finition maison : débloquée par le décorateur.
export const FINITION = { heures: 1, cout: 80, qual: 1, prixMult: 1.2 };

export const SEGMENTS = {
  grandpublic: { nom: "Grand public", ideal: 280, base: 3800, pool: 90000, qualMin: 0, notoMin: 0, desc: "Gros volumes, très sensible au prix." },
  lifestyle: { nom: "Lifestyle", ideal: 700, base: 2300, pool: 55000, qualMin: 2, notoMin: 10, desc: "Achète l'image. Notoriété indispensable." },
  connaisseurs: { nom: "Connaisseurs", ideal: 3500, base: 750, pool: 16000, qualMin: 5, notoMin: 5, desc: "Qualité et crédibilité exigées." },
  bling: { nom: "Bling-bling", ideal: 9000, base: 280, pool: 6000, qualMin: 4, notoMin: 35, desc: "Prix élevés, mais il faut être connu." },
};

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
