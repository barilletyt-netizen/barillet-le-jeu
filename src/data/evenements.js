// Événements historiques scriptés, aléas trimestriels et opportunités.
// Session 3 : enrichir 2015-2026 et monter à ~20 aléas.

export const EVENEMENTS = [
  { annee: 2015, t: 2, titre: "Lancement de l'Apple Watch", texte: "Le quartz d'entrée de gamme prend un coup pendant 2 ans." },
  { annee: 2017, t: 1, titre: "Reprise des exportations suisses", texte: "Le marché repart. Demande +10% cette année." },
  { annee: 2020, t: 1, titre: "Pandémie de Covid-19", texte: "Salons annulés, boutiques fermées. Ventes -40% toute l'année." },
  { annee: 2021, t: 2, titre: "Bulle spéculative", texte: "Connaisseurs et bling-bling +50% jusqu'à fin 2022." },
  { annee: 2023, t: 1, titre: "Correction du marché gris", texte: "La fête est finie sur le haut de gamme." },
];

// Multiplicateur de demande dû aux événements historiques, par segment et mouvement.
export function multEvenements(annee, t, segKey, mvtKey) {
  let m = 1;
  if (mvtKey === "quartz" && (segKey === "grandpublic" || segKey === "lifestyle")) {
    if ((annee === 2015 && t >= 2) || annee === 2016 || (annee === 2017 && t <= 2)) m *= 0.75;
  }
  if (annee === 2017) m *= 1.1;
  if (annee === 2020) m *= 0.6;
  if ((segKey === "connaisseurs" || segKey === "bling") && ((annee === 2021 && t >= 2) || annee === 2022)) m *= 1.5;
  if ((segKey === "connaisseurs" || segKey === "bling") && annee === 2023) m *= 0.9;
  return m;
}

export const OPPORTUNITES = [
  {
    id: "salon", titre: "Invitation au salon Genève Time",
    texte: "Un stand se libère. CHF 25'000, mais la visibilité est réelle.",
    cout: 25000, pa: 1, req: (g) => g.modeles.some((m) => m.statut === "actif"),
  },
  {
    id: "youtubeur", titre: "Un YouTubeur veut tester votre montre",
    texte: "« Remontoir » (280k abonnés) demande un exemplaire. Review honnête... dans les deux sens.",
    cout: 0, pa: 1, req: (g) => g.modeles.some((m) => m.statut === "actif"),
  },
  {
    id: "detaillant", titre: "Grosse commande d'un détaillant",
    texte: "Une chaîne veut votre stock à -25%. Cash immédiat, marge sacrifiée, distribution renforcée.",
    cout: 0, pa: 1, req: (g) => g.modeles.some((m) => m.stock > 20),
  },
  {
    id: "voyagepresse", titre: "Organiser un voyage de presse",
    texte: "Trois journalistes dans le Jura, montres offertes. CHF 12'000. Si ça se sait...",
    cout: 12000, pa: 1, req: () => true,
  },
  {
    id: "collab", titre: "Collab influenceur lifestyle",
    texte: "500k abonnés, CHF 20'000 le post. La notoriété s'achète, la crédibilité en souffre.",
    cout: 20000, pa: 1, req: () => true,
  },
];

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
  if (g.employes > 0) pool.push({ id: "demission", titre: "Un horloger démissionne", texte: "Débauché par un concurrent. Savoir-faire −3." });
  if (g.modeles.some((m) => m.stock > 15)) pool.push({ id: "collectionneur", titre: "Un collectionneur passe commande", texte: "15 pièces d'un coup, payées +20%." });
  return pool;
}
