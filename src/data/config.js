// Données de création de personnage et catalogue produit.
// Spec v0.4 : 2 PA/trimestre, self-made à 10'000 CHF, capacité d'atelier en heures.

export const PA_PAR_TRIMESTRE = 2;

export const ANNEE_DEBUT = 2015;
// Le proto s'arrête en 2035. La spec v0.4 vise 2065 (50 ans) : à rouvrir
// quand l'équilibrage long terme sera fait (sessions 2-3).
export const ANNEE_FIN = 2035;

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
  // Spec v0.4 : 10'000 CHF. Le Kickstarter et les micro-séries quartz sont
  // quasi obligatoires. C'est voulu.
  selfmade: { nom: "Self-made", capital: 10000, dette: 30000, reseau: 2, cred: 1, desc: "CHF 10'000, crédit étudiant de 30'000. Brutal." },
};

// heures = heures d'atelier consommées par pièce produite (spec v0.4).
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

export const MATERIAUX = {
  acier: { nom: "Acier", cout: 0, idealMult: 1 },
  bronze: { nom: "Bronze", cout: 60, idealMult: 1.15 },
  or: { nom: "Or", cout: 2500, idealMult: 2.6 },
};

export const SEGMENTS = {
  grandpublic: { nom: "Grand public", ideal: 280, base: 3800, pool: 90000, qualMin: 0, notoMin: 0, desc: "Gros volumes, très sensible au prix." },
  lifestyle: { nom: "Lifestyle", ideal: 700, base: 2300, pool: 55000, qualMin: 2, notoMin: 10, desc: "Achète l'image. Notoriété indispensable." },
  connaisseurs: { nom: "Connaisseurs", ideal: 3500, base: 750, pool: 16000, qualMin: 5, notoMin: 5, desc: "Qualité et crédibilité exigées." },
  bling: { nom: "Bling-bling", ideal: 9000, base: 280, pool: 6000, qualMin: 4, notoMin: 35, desc: "Prix élevés, mais il faut être connu." },
};

// Atelier : la capacité est un budget d'heures par trimestre.
// 300 h = 300 quartz, ou 100 ébauches, ou 30 manufactures.
export const CAPACITE_DEPART = 300;
export const ATELIER_COUT = 120000;
export const ATELIER_HEURES = 400;
export const ATELIER_FIXES = 6000;
export const EMPLOYE_FIXES = 8000;
export const FIXES_BASE = 12000;
export const ETABLI_ECONOMIE = 4000;
