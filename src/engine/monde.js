import { CLASSEMENT_MONDE, INDES, RANG_MAX, facteurMarche, revenusPourRang } from "../data/monde.js";
import { hasard, tirer, hasardTexte, tirerTexte } from "./alea.js";
import { clamp } from "./formules.js";

/**
 * Le classement vivant.
 *
 * Jusqu'ici les géants avaient des revenus figés et les voisins du joueur
 * étaient réinventés à chaque bilan : personne ne suivait la trajectoire d'une
 * marque d'une année sur l'autre. Ici le monde a une mémoire.
 *
 * Deux populations, traitées différemment :
 * - les **géants** portent leurs revenus en millions et dérivent librement ;
 *   ils peuvent se doubler, c'est visible et c'est ce qui rend le Top 10 vivant.
 * - les **indépendants** portent un rang, pas un chiffre. Leur revenu se déduit
 *   de la table des rangs, ce qui garantit qu'on ne verra jamais un 92ᵉ mieux
 *   doté qu'un 50ᵉ — l'incohérence relevée en beta.
 */

export function mondeInitial() {
  return {
    geants: CLASSEMENT_MONDE.map((c) => ({ nom: c.nom, rev: c.rev, tendance: 0 })),
    // Répartis du haut du classement jusqu'au fond, pour qu'il y ait toujours
    // du monde autour du joueur quel que soit son niveau.
    independants: INDES.map((nom, i) => ({
      nom,
      // Bornés comme lors de l'évolution : aucun rang ne dépasse le fond du
      // classement, sinon on affiche des places qui n'existent pas.
      rang: Math.round(clamp(55 * Math.pow(1.5, i), 40, RANG_MAX)),
      tendance: 0,
    })),
  };
}

/**
 * Fait vivre le monde d'une année sur l'autre. Renvoie le monde à jour et les
 * faits marquants, qui alimentent les brèves.
 */
export function evoluerMonde(monde, annee) {
  const faits = [];
  const croissanceBase = facteurMarche(annee + 1) / facteurMarche(annee) - 1;

  const geants = monde.geants.map((m) => {
    // Croissance du marché, plus un aléa propre à la marque.
    const perso = (hasard() - 0.45) * 0.16;
    const taux = croissanceBase + perso;
    return { ...m, rev: Math.max(50, Math.round(m.rev * (1 + taux))), tendance: taux };
  });

  const avant = monde.geants.map((m) => m.nom);
  geants.sort((a, b) => b.rev - a.rev);
  const apres = geants.map((m) => m.nom);
  for (let i = 0; i < apres.length; i++) {
    if (avant[i] !== apres[i] && i < 5) {
      faits.push({
        type: "classement",
        texte: apres[i] + " passe devant " + avant[i] + " et prend la " + (i + 1) + "ᵉ place mondiale.",
      });
      break; // une seule permutation racontée par an, sinon c'est du bruit
    }
  }

  const independants = monde.independants.map((m) => {
    // Un indépendant qui monte gagne des places (rang qui baisse).
    const derive = (hasard() - 0.5) * 0.22;
    const rang = Math.round(clamp(m.rang * (1 + derive), 40, RANG_MAX));
    return { ...m, rang, tendance: m.rang - rang };
  });

  // Le plus en difficulté de l'année devient une proie potentielle.
  const enChute = independants.filter((m) => m.tendance < -80).sort((a, b) => a.tendance - b.tendance)[0];
  if (enChute) {
    faits.push({
      type: "difficulte",
      marque: enChute.nom,
      texte: enChute.nom + " dévisse au classement — la presse évoque une recherche de repreneur.",
    });
  }
  const enHausse = independants.filter((m) => m.tendance > 80).sort((a, b) => b.tendance - a.tendance)[0];
  if (enHausse) {
    faits.push({
      type: "hausse",
      marque: enHausse.nom,
      texte: enHausse.nom + " gagne " + enHausse.tendance + " places en un an. On parle beaucoup d'eux.",
    });
  }

  return { monde: { geants, independants }, faits };
}

/**
 * Les quatre marques les plus proches du joueur au classement, prises dans les
 * indépendants qui existent vraiment — pas des noms tirés au hasard.
 */
export function voisinsVivants(monde, rang, annee) {
  const tries = [...monde.independants].sort((a, b) => a.rang - b.rang);
  const dessus = tries.filter((m) => m.rang < rang).slice(-2);
  const dessous = tries.filter((m) => m.rang >= rang).slice(0, 2);
  const ligne = (m) => ({ nom: m.nom, rang: m.rang, rev: revenusPourRang(m.rang, annee), tendance: m.tendance });
  return { dessus: dessus.map(ligne), dessous: dessous.map(ligne) };
}

/** Une brève sur un concurrent, choisie selon ce qui se passe vraiment. */
export function breveConcurrent(monde, faits) {
  // Flux texte : une brève ne doit pas perturber la simulation.
  if (faits.length && hasardTexte() < 0.65) return tirerTexte(faits).texte;
  const geant = tirerTexte(monde.geants);
  const inde = tirerTexte(monde.independants);
  const brevesGeants = [
    geant.nom + " ouvre une boutique amirale à Shanghai.",
    geant.nom + " signe un contrat d'image avec un footballeur international.",
    geant.nom + " annonce une hausse de tarifs de 6% sur toute sa collection.",
    geant.nom + " rappelle une série pour un défaut de lunette. La presse est acide.",
    geant.nom + " inaugure un musée de marque et fait venir la profession entière.",
    geant.nom + " rachète son principal fournisseur de cadrans.",
  ];
  const brevesIndes = [
    inde.nom + " lance une série limitée qui part en trois jours.",
    inde.nom + " se sépare de son directeur créatif après six ans.",
    inde.nom + " ouvre un atelier de restauration ouvert au public.",
    inde.nom + " renonce au quartz et passe toute sa gamme en mécanique.",
    inde.nom + " est cité en exemple dans un dossier sur l'horlogerie indépendante.",
    inde.nom + " retarde ses livraisons de deux trimestres. Les clients grognent.",
  ];
  return hasardTexte() < 0.5 ? tirerTexte(brevesGeants) : tirerTexte(brevesIndes);
}
