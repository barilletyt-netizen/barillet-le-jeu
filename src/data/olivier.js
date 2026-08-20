/**
 * Les lettres d'Olivier — le seul fil narratif continu de la partie.
 *
 * Olivier est le vieil horloger de la vallée qui a formé le fondateur. Il écrit
 * tous les cinq ans, et sa lettre s'affiche sous la Gazette : ce n'est pas un
 * journal, c'est du papier à lettre. Il suggère un objectif pour les cinq ans
 * qui viennent.
 *
 * **Un objectif raté ne coûte rien.** Ni jauge, ni argent, ni malus caché —
 * seulement une ligne déçue et l'objectif suivant. Un testeur de la beta est
 * mort en suivant à la lettre la chaîne de conseils du jeu ; on ne recrée pas
 * ce piège sous une forme narrative. Olivier suggère, il ne commande pas.
 *
 * Arc sur cinquante ans : sceptique jusqu'en 2030, fier mais exigeant jusqu'en
 * 2045, inquiet ensuite. **Il meurt en 2048.** Sa fille reprend la plume à
 * partir de 2050, d'un ton plus distant. Une lettre scellée, écrite avant sa
 * mort, s'ouvre en 2065.
 */

export const ANNEE_MORT_OLIVIER = 2048;

const ca = (n) => (g) => g.revenusAnneePrec >= n || g.revenusAnnee >= n;
const rang = (n) => (g) => (g.rangs || []).some((r) => r <= n);
const refs = (n) => (g) => g.modeles.filter((m) => m.statut === "actif").length >= n;
const salaries = (n) => (g) => Object.values(g.employes).reduce((s, x) => s + x, 0) >= n;

/**
 * Une période : deux variantes d'objectif, et le jeu retient celle qui colle le
 * mieux à ce que la marque est en train de devenir. `prefere` départage.
 */
export const PERIODES = [
  {
    debut: 2015, fin: 2020,
    variantes: [
      { id: "ca1m", texte: "atteindre 1 million de chiffre d'affaires annuel", atteint: ca(1000000) },
      { id: "compl3", texte: "maîtriser une famille de complication jusqu'à son dernier palier",
        atteint: (g) => Object.values(g.complications).some((n) => n >= 3) },
    ],
    prefere: (g) => (g.savoir >= 30 ? 1 : 0),
    recompense: { id: "rdOfferte", texte: "une R&D offerte — ni heures, ni francs" },
  },
  {
    debut: 2020, fin: 2025,
    variantes: [
      { id: "top1000", texte: "entrer dans les mille premières marques mondiales", atteint: rang(1000) },
      { id: "refs4", texte: "tenir quatre références au catalogue", atteint: refs(4) },
    ],
    prefere: (g) => (g.modeles.length >= 3 ? 1 : 0),
    recompense: { id: "atelierOffert", texte: "une tranche d'atelier offerte" },
  },
  {
    debut: 2025, fin: 2030,
    variantes: [
      { id: "ca5m", texte: "atteindre 5 millions de chiffre d'affaires annuel", atteint: ca(5000000) },
      { id: "salaries5", texte: "employer cinq personnes", atteint: salaries(5) },
    ],
    prefere: (g) => (g.revenusAnnee > 2000000 ? 0 : 1),
    recompense: { id: "directionOfferte", texte: "un recrutement de direction offert" },
  },
  {
    debut: 2030, fin: 2035,
    variantes: [
      { id: "top500", texte: "entrer dans les cinq cents premières", atteint: rang(500) },
      { id: "mat2", texte: "maîtriser deux matériaux", atteint: (g) => Object.keys(g.materiaux).length >= 3 },
    ],
    prefere: (g) => (g.employes.materiaux > 0 ? 1 : 0),
    recompense: { id: "credCanal", texte: "dix points de crédibilité et un palier de canal offert" },
  },
  {
    debut: 2035, fin: 2040,
    variantes: [
      { id: "ca25m", texte: "atteindre 25 millions de chiffre d'affaires annuel", atteint: ca(25000000) },
      { id: "salaries10", texte: "employer dix personnes", atteint: salaries(10) },
    ],
    prefere: (g) => (g.revenusAnnee > 12000000 ? 0 : 1),
    recompense: { id: "subvention", texte: "une subvention d'un million de francs" },
  },
  {
    debut: 2040, fin: 2045,
    variantes: [
      { id: "top200", texte: "entrer dans les deux cents premières", atteint: rang(200) },
      { id: "krach", texte: "traverser le krach de 2043 sans faillite", atteint: (g) => g.annee >= 2044 },
    ],
    prefere: (g) => ((g.rangs || []).some((r) => r <= 400) ? 0 : 1),
    recompense: { id: "des12", texte: "douze points de désirabilité" },
  },
  {
    debut: 2045, fin: 2050,
    variantes: [
      { id: "top100", texte: "entrer dans les cent premières", atteint: rang(100) },
      { id: "manuf", texte: "bâtir une manufacture", atteint: (g) => g.ateliers >= 1 && g.capacite >= 20000 },
    ],
    prefere: (g) => (g.directeurs && g.directeurs.production ? 1 : 0),
    recompense: { id: "manufDemiPrix", texte: "la manufacture à moitié prix" },
  },
  {
    debut: 2050, fin: 2055,
    variantes: [{ id: "top50", texte: "entrer dans le Top 50", atteint: rang(50) }],
    prefere: () => 0,
    recompense: { id: "cred15", texte: "quinze points de crédibilité" },
  },
  {
    debut: 2055, fin: 2060,
    variantes: [
      { id: "rester5", texte: "tenir cinq exercices dans le Top 50", atteint: (g) => (g.anneesTop50 || 0) >= 5 },
      { id: "rachats3", texte: "racheter trois maisons", atteint: (g) => (g.rachatsIndes || 0) >= 3 },
    ],
    prefere: (g) => ((g.rachatsIndes || 0) >= 1 ? 1 : 0),
    recompense: { id: "directeurOffert", texte: "un directeur dont le salaire est pris en charge cinq ans" },
  },
  {
    debut: 2060, fin: 2065,
    variantes: [{ id: "finir50", texte: "finir dans le Top 50", atteint: rang(50) }],
    prefere: () => 0,
    recompense: { id: "epilogue", texte: "un épilogue enrichi dans la lettre scellée" },
  },
];

/** Ce qu'Olivier écrit en ouvrant chaque période. Le ton suit l'arc. */
export const LETTRES = {
  2015:
    "Alors comme ça tu te lances. Je t'ai vu limer des ponts pendant six ans, je sais ce que tu vaux à " +
    "l'établi — ce que je ne sais pas, c'est ce que tu vaux devant un banquier. Ce métier a enterré plus " +
    "d'horlogers doués que de mauvais commerçants. Je te souhaite de me faire mentir.",
  2020:
    "Cinq ans. À ton âge j'en étais encore à réparer les pendules des fermes pour payer mon loyer, alors " +
    "je ne vais pas te faire la leçon. Mais j'ai vu ton catalogue. Tu vas vite. On va bien voir si ça tient.",
  2025:
    "On commence à parler de toi à la vallée. Pas toujours en bien, ce qui est plutôt bon signe : on ne " +
    "jalouse pas les maisons qui ne vont nulle part. Fais attention à ne pas confondre le bruit et la marque.",
  2030:
    "Quinze ans. Je dois reconnaître que je te croyais mort à la troisième année. Tu as tenu, et ça, dans " +
    "ce métier, c'est déjà une réponse. Maintenant la vraie question commence : est-ce que ce que tu fais " +
    "te ressemble encore ?",
  2035:
    "J'ai eu une de tes montres entre les mains la semaine dernière. Un client me l'a apportée pour un " +
    "réglage. J'ai ouvert le fond. J'ai refermé sans rien dire, et j'ai souri tout seul dans mon atelier " +
    "comme un imbécile.",
  2040:
    "Vingt-cinq ans. La moitié du chemin. Les mains commencent à me trahir, alors je regarde beaucoup et " +
    "je lime peu. Ce que je vois : tu as construit quelque chose qui ne dépend plus de toi. C'est la seule " +
    "définition d'une maison que je connaisse.",
  2045:
    "Je ne vais pas tourner autour. Le médecin est clair, et j'ai toujours détesté les gens qui font des " +
    "mystères. Il me reste peu. Ce n'est pas grave — j'ai eu ce que je voulais : un atelier, des mains " +
    "propres, et quelqu'un à qui transmettre. Occupe-toi de la suite, je regarde encore un peu.",
  2050:
    "Vous ne me connaissez pas. Je suis la fille d'Olivier. En vidant son établi j'ai trouvé une liasse de " +
    "brouillons, tous adressés à vous, certains raturés dix fois. Il vous suivait de bien plus près qu'il " +
    "ne vous le disait. Je continue, puisqu'il l'aurait fait.",
  2055:
    "Mon père notait vos chiffres dans un carnet, à côté des relevés de marche de ses propres montres. " +
    "Il vous mettait au même rang que son travail. Je ne crois pas qu'il vous l'ait jamais dit.",
  2060:
    "Il reste une enveloppe scellée dans le tiroir de son établi, avec votre nom dessus et une consigne : " +
    "ne pas ouvrir avant 2065. J'ai résisté jusqu'ici. Encore cinq ans.",
};

/** Ce qu'il répond quand la période se solde. Jamais dur, jamais chiffré. */
export const REACTIONS = {
  reussi: [
    "Tu l'as fait. Je ne dirai pas que j'en doutais, ce serait mentir deux fois.",
    "C'est fait, et bien fait. Je garde la coupure de journal.",
    "Voilà. On peut passer à la suite.",
  ],
  rate: [
    "Ça n'est pas venu. Ce n'est pas grave — j'ai raté des choses bien plus faciles.",
    "Pas cette fois. Le métier ne récompense pas les calendriers, il récompense la constance.",
    "Tant pis. Ce que tu as appris en essayant ne se perdra pas.",
  ],
};

/** La lettre scellée de 2065, adaptée à la trajectoire finale. */
export function lettreScellee(g, ctx) {
  const debut =
    "« À ouvrir en 2065 » — l'écriture d'Olivier, tremblée, datée de 2047.\n\n" +
    "Si tu lis ceci, c'est que la maison a tenu cinquante ans. ";
  if (ctx.rang <= 50) {
    return debut +
      "Et d'après ce qu'on m'a lu au téléphone, tu es allé là où je n'ai jamais osé regarder. " +
      "Je n'ai jamais eu que quatre établis et deux paires de mains. Toi tu as un nom. Fais-en quelque " +
      "chose de plus long que toi.";
  }
  if (ctx.rang <= 300) {
    return debut +
      "Tu n'es pas devenu un géant, et je crois que c'est très bien ainsi. Les géants n'ont pas de " +
      "mains, ils ont des services. Toi tu as encore un atelier où l'on reconnaît le bruit de chaque " +
      "machine. C'est plus rare que le Top 50.";
  }
  return debut +
    "Le classement ne t'a pas donné grand-chose, et il s'en remettra. Ce qui compte est ailleurs : " +
    "des gens ont porté ce que tu as fait, tous les jours, pendant des années. Aucun tableau ne mesure ça.";
}
