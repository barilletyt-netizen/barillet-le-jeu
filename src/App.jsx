import { useEffect, useState } from "react";
import Intro from "./components/Intro.jsx";
import Brief from "./components/Brief.jsx";
import Setup from "./components/Setup.jsx";
import Jeu from "./components/Jeu.jsx";
import Rapport from "./components/Rapport.jsx";
import BilanAnnuel from "./components/BilanAnnuel.jsx";
import Fin from "./components/Fin.jsx";
import BetaFermee from "./components/BetaFermee.jsx";
import {
  BETA_FERMEE,
  ATELIERS,
  CANAUX, COUTS_CHF, COUTS_H, EMPLOYES, COMPLICATIONS, SALAIRES, HEURES_DELEGUEES, HEURES_EMPLOYE, ENCADREMENT_PAR_CHEF, DIRECTEURS,
  MATERIAUX, MOUVEMENTS, SEGMENTS, STYLES, ANNEE_DEBUT, ANNEE_FIN, HEURES_FONDATEUR,
} from "./data/config.js";
import { PROPOSITIONS } from "./data/evenements.js";
import { trimestreIndex } from "./engine/effets.js";
import { evaluerFin, scandaleAtteint } from "./engine/fins.js";
import { passageAnnee, choisirObjectif, periodeQuiOuvre } from "./engine/mentor.js";
import { LETTRES } from "./data/olivier.js";
import { rangPour } from "./data/monde.js";
import {
  clamp, coutFacelift, coutUnitaire, coutRD, dureeDev, fmtArgent, fmtH, fmtNb,
  gainChoc, gainMarketing, grilleDePrix, heuresRD, indemnite, margeMoyenne,
  nomComplications, num, paletteComplication, qualiteNouveau,
  aDirecteur, coutHeures, directeurRecrutable, heuresModele, heuresParPiece, heuresProductionDispo,
} from "./engine/formules.js";
import { etatInitial, simulateQuarter, tirerOpportunite } from "./engine/simulation.js";
import { hasard } from "./engine/alea.js";
import { evoluerMonde } from "./engine/monde.js";
import { setDevise } from "./engine/devise.js";
import { nomDeMarque } from "./data/noms.js";
import { chargerPartie, existeSauvegarde, sauvegarderPartie } from "./engine/save.js";

export default function App() {
  // Court-circuit de fermeture : aucun hook n'est appelé au-delà, et surtout
  // aucune écriture dans le localStorage des visiteurs.
  if (BETA_FERMEE) return <BetaFermee />;

  const [phase, setPhase] = useState("intro");
  const [pays, setPays] = useState(null);
  const [profil, setProfil] = useState(null);
  const [origine, setOrigine] = useState(null);
  // Champ pré-rempli : les champs vides freinaient les testeurs pressés.
  const [marque, setMarque] = useState(nomDeMarque);

  const [g, setG] = useState(null);
  const [rapport, setRapport] = useState(null);
  const [bilanAnnuel, setBilanAnnuel] = useState(null);
  const [finInfo, setFinInfo] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [sauvegardeExiste, setSauvegardeExiste] = useState(false);
  // Horodatage du dernier autosave, pour le témoin de la barre de statut.
  const [autosaveAt, setAutosaveAt] = useState(0);

  const ctx = { pays, profil };

  useEffect(() => setSauvegardeExiste(existeSauvegarde()), []);

  useEffect(() => {
    if (!saveMsg) return;
    const id = setTimeout(() => setSaveMsg(""), 2500);
    return () => clearTimeout(id);
  }, [saveMsg]);

  // ---- Sauvegarde ---------------------------------------------------------

  // Sauvegarde silencieuse en début de trimestre : on ne perd jamais plus d'un tour.
  function persister(etat, ident = { pays, profil, origine, marque }) {
    const ok = sauvegarderPartie({ g: etat, ...ident });
    if (ok) {
      setSauvegardeExiste(true);
      setAutosaveAt(Date.now());
    }
    return ok;
  }

  function sauvegarder() {
    setSaveMsg(persister(g) ? "Partie sauvegardée ✓" : "Échec de la sauvegarde");
  }

  function charger() {
    const s = chargerPartie();
    if (!s) {
      setSaveMsg("Sauvegarde illisible");
      return;
    }
    setG(s.g);
    setPays(s.pays);
    setProfil(s.profil);
    setOrigine(s.origine);
    setMarque(s.marque);
    setDevise(s.pays);
    setPhase("play");
  }

  // ---- Cycle de vie de la partie -----------------------------------------

  function demarrer() {
    // L'économie reste en CHF ; seule la devise d'affichage suit le pays.
    setDevise(pays);
    const etat = etatInitial({ pays, profil, origine, marque });
    // Olivier écrit dès 2015 : la première lettre ouvre la partie.
    etat.objectif = choisirObjectif(periodeQuiOuvre(ANNEE_DEBUT), etat);
    etat.lettre = { auteur: "Olivier", scellee: false, texte: LETTRES[ANNEE_DEBUT] };
    setG(etat);
    persister(etat);
    setPhase("play");
  }

  // Repartir de zéro depuis une partie en cours : un testeur doit pouvoir
  // enchaîner une partie héritier et une partie self-made sans recharger.
  function abandonner() {
    rejouer();
    setPhase("brief");
  }

  function rejouer() {
    setPhase("intro");
    setG(null);
    setRapport(null);
    setBilanAnnuel(null);
    setFinInfo(null);
    setPays(null);
    setProfil(null);
    setOrigine(null);
    setMarque(nomDeMarque());
    setDevise(null);
    setSauvegardeExiste(existeSauvegarde());
  }

  // ---- Actions du joueur --------------------------------------------------
  // Tout coûte des heures. Ce qui n'est pas dépensé part à l'établi.

  // Les actions sans coût en CHF restent jouables à découvert : sinon une caisse
  // négative interdirait l'emprunt, seule porte de sortie.
  const assez = (heures, cash = 0) => g.heures >= heures && (cash <= 0 || g.cash >= cash);

  function creerModele(nm) {
    const cout = coutRD(nm.mvt, profil);
    const heures = heuresRD(COUTS_H.rd, g.employes);
    if (!assez(heures, cout)) return;

    const duree = dureeDev(nm.mvt, profil, g.employes);
    const nom = nm.nom || "Modèle " + (g.modeles.length + 1);
    // Les complications sont figées au niveau maîtrisé le jour de la création.
    const compls = (nm.compls || []).map((id) => ({ id, niveau: g.complications[id] || 1 }));
    const detail = [
      MOUVEMENTS[nm.mvt].nom,
      compls.length ? compls.map((c) => paletteComplication(c.id, c.niveau).nom).join(" + ") : "trois aiguilles",
      STYLES[nm.style].nom + " " + MATERIAUX[nm.mat].nom,
      SEGMENTS[nm.seg].nom,
    ].join(", ");

    setG({
      ...g,
      cash: g.cash - cout,
      heures: g.heures - heures,
      modeles: [
        ...g.modeles,
        {
          nom, mvt: nm.mvt, seg: nm.seg, style: nm.style, materiau: nm.mat,
          compls, finition: !!nm.finition,
          // Aucun prix imposé : le joueur le fixe quand le modèle sort d'étude.
          prix: "",
          savoirCreation: g.savoir,
      qual: qualiteNouveau(nm.mvt, {
            pays, profil, savoir: g.savoir, compls, finition: !!nm.finition,
          }),
          prod: 0, stock: 0, age: 0, statut: "dev", devRestant: duree,
        },
      ],
      messages: [
        ...g.messages,
        "R&D lancée : « " + nom + " » (" + detail + (nm.finition ? ", finition maison" : "") +
        "). Prêt dans " + duree + " trim. " + fmtH(heures) + " et " + fmtArgent(cout) + ".",
      ],
    });
  }

  /**
   * Une seule recherche à la fois, complication ou matériau. `palier` vient de
   * complicationsRecherchables/materiauxRecherchables : il porte son type, son
   * id, le niveau visé et les coûts de ce palier précis.
   */
  function rechercher(palier) {
    const heures = heuresRD(palier.rdHeures, g.employes, g);
    if (!assez(heures, palier.rd) || g.recherche) return;
    const duree = Math.max(1, palier.dev - (g.employes.ingenieur > 0 ? 1 : 0));
    const intitule =
      palier.type === "materiau"
        ? "travail du " + palier.famille.toLowerCase()
        : palier.famille + " niveau " + palier.niveau + " (« " + palier.nom + " »)";
    setG({
      ...g,
      cash: g.cash - palier.rd,
      heures: g.heures - heures,
      recherche: { type: palier.type, id: palier.id, niveau: palier.niveau || 1, restant: duree },
      messages: [
        ...g.messages,
        "Recherche lancée : " + intitule + ". " + duree + " trim., " + fmtH(heures) + " et " + fmtArgent(palier.rd) + ".",
      ],
    });
  }

  /**
   * L'équipe complète d'un coup : quatre horlogers et le chef qui les encadre.
   * Retour de test — répéter « embaucher » cinq fois par trimestre pendant
   * vingt ans n'est pas une décision, c'est une corvée.
   */
  function embaucherEquipe() {
    const cout = coutHeures("embauche", g) * 2;
    if (!assez(cout)) return;
    const employes = {
      ...g.employes,
      horloger: g.employes.horloger + ENCADREMENT_PAR_CHEF,
      chef: g.employes.chef + 1,
    };
    setG({
      ...g, heures: g.heures - cout, employes,
      savoir: clamp(g.savoir + EMPLOYES.horloger.savoir, 0, 100),
      messages: [...g.messages,
        "Équipe complète embauchée : " + ENCADREMENT_PAR_CHEF + " horlogers et un chef d'atelier, soit " +
        fmtH(ENCADREMENT_PAR_CHEF * HEURES_EMPLOYE) + " de production encadrée. Coûts fixes +" +
        fmtArgent(ENCADREMENT_PAR_CHEF * EMPLOYES.horloger.fixes + EMPLOYES.chef.fixes) + "/trimestre."],
    });
  }

  /**
   * Verse toutes les heures libres sur un modèle. Sans ça, il faut deviner
   * combien de pièces de plus une embauche permet, et tâtonner.
   */
  function produireAuMax(i) {
    const m = g.modeles[i];
    if (!m || m.statut !== "actif") return;
    const autres = g.modeles.reduce(
      (s, x, j) => s + (j !== i && x.statut === "actif" ? heuresModele(x) : 0), 0
    );
    const libre = Math.max(0, heuresProductionDispo(g) - autres);
    const n = Math.floor(libre / heuresParPiece(m));
    setG({ ...g, modeles: g.modeles.map((x, j) => (j === i ? { ...x, prod: n } : x)) });
  }

  /**
   * Recruter un directeur. C'est une action du panneau d'équipe et non une
   * proposition tirée au sort : une maison qui remplit les conditions ne doit
   * pas attendre que le hasard lui présente le bon rôle.
   */
  function recruterDirecteur(role) {
    const d = directeurRecrutable(g, role);
    if (!d || !d.ok || !assez(40)) return;
    setG({
      ...g,
      heures: g.heures - 40,
      directeurs: { ...(g.directeurs || {}), [role]: true },
      messages: [...g.messages, DIRECTEURS[role].nom + " rejoint la maison. " + DIRECTEURS[role].desc +
        " Salaire : " + fmtArgent(DIRECTEURS[role].fixes) + "/trimestre."],
    });
  }

  function embaucher(type) {
    const e = EMPLOYES[type];
    // Le salon des écoles paie une fois : la prochaine embauche coûte moitié
    // moins d'heures, et le nouveau venu arrive déjà formé.
    const cout = g.embaucheFacile ? Math.round(coutHeures("embauche", g) / 2) : coutHeures("embauche", g);
    if (!assez(cout)) return;
    setG({
      ...g,
      heures: g.heures - cout,
      embaucheFacile: false,
      employes: { ...g.employes, [type]: g.employes[type] + 1 },
      savoir: clamp(g.savoir + e.savoir + (g.embaucheFacile ? 3 : 0), 0, 100),
      messages: [
        ...g.messages,
        e.nom + " embauché·e : " + e.desc + " Savoir-faire +" + e.savoir + ", coûts fixes +" + fmtArgent(e.fixes) + "/trimestre.",
      ],
    });
  }

  // Se séparer d'un collaborateur : indemnité immédiate, salaire économisé ensuite.
  function licencier(type) {
    const e = EMPLOYES[type];
    if (g.employes[type] <= 0 || !assez(coutHeures("licenciement", g))) return;
    const cout = indemnite(type);
    setG({
      ...g,
      heures: g.heures - coutHeures("licenciement", g),
      cash: g.cash - cout,
      employes: { ...g.employes, [type]: g.employes[type] - 1 },
      messages: [
        ...g.messages,
        "Départ d'un " + e.nom.toLowerCase() + " : indemnité de " + fmtArgent(cout) + ", puis " +
        fmtArgent(e.fixes) + " de coûts fixes en moins chaque trimestre.",
      ],
    });
  }

  // Ouvrir ou monter d'un palier un canal de distribution.
  /**
   * Fermer un canal. Comme on se sépare d'un employé : ça soulage les coûts
   * fixes, ça coûte de la portée, et ça ne se rouvre qu'en repayant le palier.
   */
  function fermerCanal(id) {
    const niveau = g.canaux[id] || 0;
    if (niveau <= 0 || id === "direct") return;
    if (!assez(coutHeures("canal", g))) return;
    const p = CANAUX[id].paliers[niveau - 1];
    setG({
      ...g,
      heures: g.heures - coutHeures("canal", g),
      canaux: { ...g.canaux, [id]: niveau - 1 },
      des: clamp(g.des - 2, 0, 100),
      messages: [...g.messages,
        CANAUX[id].nom + " — palier « " + p.nom + " » fermé : portée −" + p.portee +
        ", coûts fixes −" + fmtArgent(p.fixes) + "/trimestre. Désirabilité −2 : se retirer se remarque."],
    });
  }

  function ouvrirCanal(palier) {
    if (palier.manque.length || !assez(palier.heures, palier.cout)) return;
    setG({
      ...g,
      heures: g.heures - palier.heures,
      cash: g.cash - palier.cout,
      canaux: { ...g.canaux, [palier.id]: palier.niveau },
      messages: [
        ...g.messages,
        CANAUX[palier.id].nom + " — « " + palier.nom + " » ouvert : portée " + palier.portee +
        ", marge " + Math.round(CANAUX[palier.id].marge * 100) + "%, coûts fixes +" +
        fmtArgent(palier.fixes) + "/trimestre.",
      ],
    });
  }

  function action(type) {
    if (!g) return;

    if (type === "marketing" && assez(coutHeures("marketing", g), COUTS_CHF.marketing)) {
      const gain = gainMarketing(g, pays);
      setG({ ...g, heures: g.heures - coutHeures("marketing", g), cash: g.cash - COUTS_CHF.marketing, noto: clamp(g.noto + gain, 0, 100),
        messages: [...g.messages, "Marketing : notoriété +" + gain + "."] });
    }

    if (type === "choc" && assez(coutHeures("choc", g), COUTS_CHF.choc)) {
      const gain = gainChoc(g, pays);
      setG({ ...g, heures: g.heures - coutHeures("choc", g), cash: g.cash - COUTS_CHF.choc,
        noto: clamp(g.noto + gain, 0, 100), cred: clamp(g.cred - 2, 0, 100), des: clamp(g.des - 1, 0, 100),
        messages: [...g.messages, "Campagne choc : notoriété +" + gain + ", mais crédibilité −2 et désirabilité −1. Le buzz a un prix."] });
    }

    if (type === "presse" && assez(coutHeures("presse", g))) {
      setG({ ...g, heures: g.heures - coutHeures("presse", g), cred: clamp(g.cred + 2, 0, 100), noto: clamp(g.noto + 1, 0, 100),
        messages: [...g.messages, "Relations presse : crédibilité +2, notoriété +1."] });
    }

    if (type === "etude" && assez(coutHeures("etude", g), COUTS_CHF.etude)) {
      // L'étude ne dit plus « le » prix : elle chiffre la demande à trois prix.
      const lignes = g.modeles
        .filter((m) => m.statut === "actif")
        .map((m) => {
          const grille = grilleDePrix(m, g)
            .map((x) => fmtArgent(x.prix) + " → ~" + fmtNb(x.demande) + " pièces (" + fmtArgent(x.ca) + ")")
            .join(" · ");
          return m.nom + " : " + grille;
        });
      // Le résultat ne part plus dans le fil de messages en haut de page : on
      // le garde structuré et l'écran l'affiche sous le bouton qui l'a produit.
      setG({ ...g, heures: g.heures - coutHeures("etude", g), cash: g.cash - COUTS_CHF.etude,
        etude: {
          annee: g.annee, t: g.t,
          lignes: g.modeles.filter((m) => m.statut === "actif").map((m) => ({
            nom: m.nom,
            points: grilleDePrix(m, g).map((x) => ({ prix: x.prix, demande: x.demande, ca: x.ca })),
          })),
        } });
    }



    if (type === "soldes" && assez(coutHeures("soldes", g))) {
      let cash = 0, unites = 0;
      const modeles = g.modeles.map((m) => {
        if (m.stock > 0 && m.statut === "actif") {
          unites += m.stock;
          cash += Math.round(m.stock * Math.max(50, num(m.prix)) * 0.65 * margeMoyenne(g.canaux));
          return { ...m, stock: 0 };
        }
        return m;
      });
      if (unites === 0) return;
      setG({ ...g, heures: g.heures - coutHeures("soldes", g), cash: g.cash + cash, modeles, des: clamp(g.des - 8, 0, 100),
        revenusAnnee: g.revenusAnnee + cash,
        messages: [...g.messages, "Soldes : " + unites + " pièces écoulées à −35% → +" + fmtArgent(cash) +
          ". Désirabilité −8 : brader laisse des traces."] });
    }

    if (type === "kickstarter" && assez(coutHeures("kickstarter", g)) && !g.kickstarterFait && g.modeles.length > 0) {
      const leve = Math.round(20000 + g.noto * 2500 + g.reseau * 8000);
      setG({ ...g, heures: g.heures - coutHeures("kickstarter", g), kickstarterFait: true, cash: g.cash + leve,
        noto: clamp(g.noto + 8, 0, 100), des: clamp(g.des + 4, 0, 100),
        messages: [...g.messages, "Kickstarter réussi : " + fmtArgent(leve) + " levés, notoriété +8, désirabilité +4."] });
    }

    if (type === "emprunt" && assez(coutHeures("emprunt", g))) {
      setG({ ...g, heures: g.heures - coutHeures("emprunt", g), cash: g.cash + COUTS_CHF.emprunt, dette: g.dette + COUTS_CHF.emprunt,
        messages: [...g.messages, "Emprunt : +" + fmtArgent(COUTS_CHF.emprunt) + " (taux " + (profil === "financier" ? "4" : "6") + "%/an)."] });
    }

    if (type === "rembourser" && g.dette > 0 && g.cash > 0) {
      const montant = Math.min(COUTS_CHF.remboursement, g.dette, g.cash);
      setG({ ...g, cash: g.cash - montant, dette: g.dette - montant,
        messages: [...g.messages, "Remboursement : −" + fmtArgent(montant) + " de dette."] });
    }
  }

  // Deux tailles d'extension : le petit pas pour les stratégies de volume qui
  // n'accumulent jamais assez pour la halle, la halle pour le passage à l'échelle.
  function agrandirAtelier(taille) {
    const a = ATELIERS[taille];
    if (!a) return;
    const h = aDirecteur(g, "production") ? HEURES_DELEGUEES : a.heuresAction;
    if (!assez(h, a.cout)) return;
    // La manufacture ne se livre pas le jour du chèque : quatre trimestres de
    // chantier, et une demande à deviner un an à l'avance.
    if (a.delai) {
      if (!aDirecteur(g, "production") || g.chantier) return;
      setG({
        ...g, heures: g.heures - h, cash: g.cash - a.cout,
        chantier: { restant: a.delai, heures: a.heures, fixes: a.fixes },
        messages: [...g.messages,
          "Manufacture engagée : " + fmtArgent(a.cout) + " versés, livraison dans " + a.delai +
          " trimestres. " + a.postes + " postes, " + fmtArgent(a.fixes) + " de charges par trimestre ensuite."],
      });
      return;
    }
    setG({
      ...g,
      heures: g.heures - h,
      cash: g.cash - a.cout,
      ateliers: g.ateliers + 1,
      ateliersFixes: (g.ateliersFixes || 0) + a.fixes,
      capacite: g.capacite + a.heures,
      messages: [
        ...g.messages,
        "Atelier agrandi : " + a.postes + " poste" + (a.postes > 1 ? "s" : "") + " de plus, soit +" +
        fmtH(a.heures) + " par trimestre. Coûts fixes +" + fmtArgent(a.fixes) + "/trimestre.",
      ],
    });
  }

  /**
   * Retirer une référence du catalogue. Le stock restant part au prix coûtant,
   * les heures cessent d'y aller, et la ligne disparaît de la collection —
   * sans quoi on accumule dix modèles fatigués qu'on fait défiler à chaque
   * trimestre.
   */
  function retirerModele(i) {
    const m = g.modeles[i];
    if (!m || m.statut !== "actif") return;
    const solde = Math.round(m.stock * Math.max(50, num(m.prix)) * 0.5 * margeMoyenne(g.canaux));
    setG({
      ...g,
      cash: g.cash + solde,
      revenusAnnee: g.revenusAnnee + solde,
      modeles: g.modeles.filter((_, j) => j !== i),
      des: clamp(g.des - 1, 0, 100),
      messages: [...g.messages,
        "« " + m.nom + " » retirée du catalogue" +
        (m.stock > 0 ? " — " + m.stock + " pièces soldées à moitié prix, +" + fmtArgent(solde) : "") +
        ". Désirabilité −1 : une référence qu'on arrête laisse des clients derrière."],
    });
  }

  function facelift(i) {
    const m = g.modeles[i];
    const cout = coutFacelift(m, profil);
    if (!assez(coutHeures("facelift", g), cout)) return;
    setG({ ...g, heures: g.heures - coutHeures("facelift", g), cash: g.cash - cout,
      modeles: g.modeles.map((x, j) => (j === i ? { ...x, age: 0 } : x)),
      messages: [...g.messages, "Facelift de « " + m.nom + " » : fraîcheur restaurée. Coût : " + fmtArgent(cout) + "."] });
  }

  function edition(i) {
    const m = g.modeles[i];
    const cout = 50 * coutUnitaire(m, { pays, savoir: g.savoir, employes: g.employes });
    if (!assez(coutHeures("edition", g), cout)) return;
    const vendues = Math.round(50 * clamp(0.25 + g.des / 80, 0.2, 1));
    const ca = Math.round(vendues * Math.max(50, num(m.prix)) * 1.6 * margeMoyenne(g.canaux));
    setG({ ...g, heures: g.heures - coutHeures("edition", g), cash: g.cash - cout + ca,
      des: clamp(g.des + 8, 0, 100), cred: clamp(g.cred - 1, 0, 100),
      revenusAnnee: g.revenusAnnee + ca,
      messages: [...g.messages, "Édition limitée « " + m.nom + " » ×50 : " + vendues + " vendues à prix fort → +" +
        fmtArgent(ca - cout) + " net. Désirabilité +8, crédibilité −1 (le marketing de la rareté)."] });
  }

  function opportunite(accepte) {
    const opp = PROPOSITIONS.find((o) => o.id === g.opportunite);
    if (!opp) return;
    // Acceptée ou déclinée, l'opportunité rejoint la mémoire courte : elle ne
    // sera pas reproposée tout de suite (playtest : voyage de presse un
    // trimestre sur deux).
    const memoire = [opp.id, ...(g.oppRecentes || [])].slice(0, 3);
    if (!accepte) {
      // Dire non n'est pas toujours neutre : le label perdu se paie, la
      // machine refusée se respecte.
      const r = opp.effetRefus;
      const etatRefus = {
        ...g, opportunite: null, oppRecentes: memoire,
        oppFaites: [...(g.oppFaites || []), opp.id],
      };
      if (r) {
        if (r.cred) etatRefus.cred = clamp(g.cred + r.cred, 0, 100);
        if (r.des) etatRefus.des = clamp(g.des + r.des, 0, 100);
        if (r.noto) etatRefus.noto = clamp(g.noto + r.noto, 0, 100);
        if (r.mods) {
          etatRefus.mods = [
            ...(g.mods || []),
            ...r.mods.map((mod) => ({
              ...mod,
              fin: mod.duree == null ? null : trimestreIndex(g.annee, g.t) + mod.duree,
            })),
          ];
        }
        if (r.msg) etatRefus.messages = [...g.messages, r.msg];
      }
      setG(etatRefus);
      return;
    }
    if (!assez(opp.heures, opp.cout)) return;

    // Vingt-six opportunités ne tiennent plus dans une chaîne de `if` : chacune
    // décrit son effet dans le catalogue, et on l'applique ici.
    const e = opp.tirage ? opp.tirage(hasard()) : opp.effet || {};
    const etat = {
      ...g,
      heures: g.heures - opp.heures,
      cash: g.cash - opp.cout,
      opportunite: null,
      oppRecentes: memoire,
      oppFaites: [...(g.oppFaites || []), opp.id],
    };
    const notes = [];

    if (e.noto) etat.noto = clamp(g.noto + e.noto, 0, 100);
    if (e.cred) etat.cred = clamp(g.cred + e.cred, 0, 100);
    if (e.des) etat.des = clamp(g.des + e.des, 0, 100);
    if (e.savoir) etat.savoir = clamp(g.savoir + e.savoir, 0, 100);
    if (e.cash) etat.cash += e.cash;
    if (e.dette) etat.dette = g.dette + e.dette;
    if (e.presseAchetee) etat.presseAchetee = (g.presseAchetee || 0) + e.presseAchetee;
    if (e.dilution) etat.dilution = (g.dilution || 0) + e.dilution;
    if (e.embaucheFacile) etat.embaucheFacile = true;
    if (e.engagementVolume) etat.engagementVolume = true;
    if (e.capacitePlus) etat.capacite = g.capacite + e.capacitePlus;
    if (e.directeur) etat.directeurs = { ...(g.directeurs || {}), [e.directeur]: true };
    if (e.rachatInde) etat.rachatsIndes = (g.rachatsIndes || 0) + 1;

    // Écouler du stock : tout, ou un plafond de pièces.
    if (e.ecoulerStock) {
      let encaisse = 0, unites = 0;
      let reste = e.ecoulerStock.max || Infinity;
      etat.modeles = g.modeles.map((m) => {
        if (m.statut !== "actif" || m.stock <= 0 || reste <= 0) return m;
        const n = Math.min(m.stock, reste);
        reste -= n;
        unites += n;
        encaisse += Math.round(n * Math.max(50, num(m.prix)) * e.ecoulerStock.prixMult * margeMoyenne(g.canaux));
        return { ...m, stock: m.stock - n };
      });
      etat.cash += encaisse;
      etat.revenusAnnee = g.revenusAnnee + encaisse;
      notes.push(unites + " pièces écoulées → +" + fmtArgent(encaisse) + ".");
    }

    // Vente directe : un nombre fixe de pièces, au prix qu'on veut.
    if (e.venteDirecte) {
      const { n, prixMult } = e.venteDirecte;
      const i = (etat.modeles || g.modeles).findIndex((m) => m.statut === "actif" && m.stock >= n);
      if (i >= 0) {
        const liste = [...(etat.modeles || g.modeles)];
        const prixN = Math.max(50, num(liste[i].prix));
        const encaisse = Math.round(n * prixN * prixMult);
        liste[i] = { ...liste[i], stock: liste[i].stock - n };
        etat.modeles = liste;
        etat.cash += encaisse;
        etat.revenusAnnee = (etat.revenusAnnee || g.revenusAnnee) + encaisse;
        notes.push(n + " pièces vendues directement → +" + fmtArgent(encaisse) + ".");
      } else {
        notes.push("Pas assez de stock pour honorer la commande : l'occasion est passée.");
      }
    }

    // Un palier de canal offert, s'il est déjà ouvert et pas au maximum.
    if (e.canalPalier) {
      const niveau = g.canaux[e.canalPalier] || 0;
      // `canalOuvre` permet d'ouvrir un canal encore fermé : un local qui se
      // libère n'a d'intérêt que si l'on n'avait pas encore de boutique.
      if ((niveau > 0 || e.canalOuvre === e.canalPalier) && niveau < CANAUX[e.canalPalier].paliers.length) {
        etat.canaux = { ...g.canaux, [e.canalPalier]: niveau + 1 };
        notes.push(CANAUX[e.canalPalier].nom + " passe au palier " + (niveau + 1) + ".");
      }
    }

    if (e.atelierPlus) {
      const a = ATELIERS.grand;
      etat.ateliers = g.ateliers + e.atelierPlus;
      etat.ateliersFixes = (g.ateliersFixes || 0) + a.fixes * e.atelierPlus;
      etat.capacite = g.capacite + a.heures * e.atelierPlus;
      notes.push("Atelier agrandi de " + fmtH(a.heures * e.atelierPlus) + " par trimestre.");
    }
    if (e.employePlus) {
      etat.employes = { ...g.employes, horloger: g.employes.horloger + e.employePlus };
    }

    // Qualité : sur le meilleur modèle en vente, celui qu'on fait certifier.
    if (e.qualPlus) {
      const liste = [...(etat.modeles || g.modeles)];
      let best = -1;
      liste.forEach((m, i) => {
        if (m.statut === "actif" && (best < 0 || m.qual > liste[best].qual)) best = i;
      });
      if (best >= 0) {
        liste[best] = { ...liste[best], qual: liste[best].qual + e.qualPlus };
        etat.modeles = liste;
        notes.push("« " + liste[best].nom + " » gagne un point de qualité.");
      }
    }

    // Précommande : l'argent rentre maintenant, les montres sont dues.
    if (e.prevente) {
      const liste = etat.modeles || g.modeles;
      const m = liste.find((x) => x.statut === "actif");
      if (m) {
        const encaisse = Math.round(e.prevente.n * Math.max(50, num(m.prix)) * e.prevente.part);
        etat.cash += encaisse;
        etat.revenusAnnee = (etat.revenusAnnee || g.revenusAnnee) + encaisse;
        etat.prevente = {
          nom: m.nom, n: e.prevente.n,
          echeance: trimestreIndex(g.annee, g.t) + e.prevente.delai,
          rembourse: encaisse,
        };
        notes.push("+" + fmtArgent(encaisse) + " encaissés d'avance sur « " + m.nom + " ».");
      }
    }

    // Sous-traitance : un revenu garanti contre de la capacité mobilisée.
    if (e.contratOEM) {
      const m = g.modeles.find((x) => x.statut === "actif");
      const revenu = m
        ? Math.round(100 * coutUnitaire(m, { pays, savoir: g.savoir, employes: g.employes }) * 1.35)
        : 60000;
      etat.mods = [
        ...(g.mods || []),
        { quoi: "revenuTrim", montant: revenu, fin: trimestreIndex(g.annee, g.t) + 4 },
        { quoi: "capacite", mult: 0.75, fin: trimestreIndex(g.annee, g.t) + 4 },
      ];
      notes.push(fmtArgent(revenu) + " par trimestre pendant un an, un quart de la capacité en moins.");
    }

    // Modificateurs durables déclarés par l'opportunité.
    if (e.mods) {
      etat.mods = [
        ...(etat.mods || g.mods || []),
        ...e.mods.map((mod) => ({
          ...mod,
          fin: mod.duree == null ? null : trimestreIndex(g.annee, g.t) + mod.duree,
        })),
      ];
    }

    etat.messages = [...g.messages, [e.msg || opp.msg, ...notes].filter(Boolean).join(" ")];
    // Une décision peut terminer la partie : accepter le rachat, c'est arrêter.
    if (e.finPartie) {
      setG(etat);
      setFinInfo({ type: e.finPartie, annee: g.annee, revenus: g.revenusAnnee, rang: g.meilleurRang });
      setPhase("fin");
      return;
    }
    setG(etat);
  }

  // La politique salariale ne coûte pas d'heures : c'est une décision, pas une
  // action. Elle prend effet au trimestre suivant, comme tout ce qui touche
  // aux coûts fixes.
  function politiqueSalariale(niveau) {
    setG({ ...g, salaires: niveau,
      messages: [...g.messages, "Politique salariale : " + SALAIRES[niveau].nom.toLowerCase() + ". " + SALAIRES[niveau].desc] });
  }

  const setProd = (i, val) => setG({ ...g, modeles: g.modeles.map((m, j) => (j === i ? { ...m, prod: val } : m)) });
  const setPrix = (i, val) => setG({ ...g, modeles: g.modeles.map((m, j) => (j === i ? { ...m, prix: val } : m)) });

  // ---- Fin de trimestre ---------------------------------------------------

  function finTrimestre(actionsPrises = []) {
    const { gs2, rap, faillite } = simulateQuarter({ ...g, actionsTour: actionsPrises }, g.heures, ctx);
    if (faillite) {
      setFinInfo({ type: "faillite", annee: g.annee, revenus: gs2.revenusAnnee });
      setPhase("fin");
      return;
    }
    // Le Scandale n'attend pas 2065 : la maison va bien, c'est le fondateur
    // qui est écarté.
    if (scandaleAtteint(gs2)) {
      setG(gs2);
      setFinInfo({ type: "alternative", fin: "scandale", annee: g.annee, revenus: gs2.revenusAnnee,
        rang: g.meilleurRang, etat: gs2 });
      setPhase("fin");
      return;
    }
    setRapport(rap);
    if (g.t >= 4) {
      const rang = rangPour(gs2.revenusAnnee, g.annee);
      setBilanAnnuel({
        annee: g.annee, revenus: gs2.revenusAnnee, rang,
        prec: g.revenusAnneePrec, meilleurRang: Math.min(rang, g.meilleurRang),
        premierTop50: rang <= 50 && !g.top50Depuis,
        anneesTop50: (g.anneesTop50 || 0) + (rang <= 50 ? 1 : 0),
      });
    }
    setG(gs2);
    setPhase("rapport");
  }

  // Enchaîne les trimestres restants de l'année sans repasser par le joueur.
  function passerAnnee(actionsPrises = []) {
    let etat = { ...g, actionsTour: actionsPrises };
    let heures = g.heures;
    for (;;) {
      const { gs2, faillite } = simulateQuarter(etat, heures, ctx);
      if (faillite) {
        setFinInfo({ type: "faillite", annee: etat.annee, revenus: gs2.revenusAnnee });
        setPhase("fin");
        return;
      }
      if (etat.t >= 4) {
        const rang = rangPour(gs2.revenusAnnee, etat.annee);
        setBilanAnnuel({
          annee: etat.annee, revenus: gs2.revenusAnnee, rang,
          prec: etat.revenusAnneePrec, meilleurRang: Math.min(rang, etat.meilleurRang),
          premierTop50: rang <= 50 && !etat.top50Depuis,
          anneesTop50: (etat.anneesTop50 || 0) + (rang <= 50 ? 1 : 0),
        });
        setG(gs2);
        setRapport(null);
        setPhase("annuel");
        return;
      }
      // Les trimestres enchaînés automatiquement n'ont pas d'action du joueur.
      etat = { ...gs2, t: etat.t + 1, actionsTour: [] };
      heures = HEURES_FONDATEUR;
    }
  }

  function continuerApresRapport() {
    if (bilanAnnuel) {
      setPhase("annuel");
      return;
    }
    // Une lettre et sa réaction ne se lisent qu'une fois.
    const etat = { ...g, t: g.t + 1, heures: HEURES_FONDATEUR, actionsTour: [], lettre: null, reactionMentor: null };
    etat.opportunite = etat.decisionEvt || tirerOpportunite(etat);
    etat.decisionEvt = null;
    etat.messages = ["T" + etat.t + " " + etat.annee + " — à vous de jouer.", ...g.messages];
    setG(etat);
    persister(etat);
    setPhase("play");
  }

  function continuerApresAnnuel() {
    const { rang } = bilanAnnuel;
    const meilleurRang = Math.min(rang, g.meilleurRang);
    const nouvelleAnnee = g.annee + 1;

    // Entrer au Top 50 n'arrête plus la partie : le jeu demande de bâtir une
    // marque pérenne, et durer est le vrai test. On garde trace de l'année
    // d'entrée et du nombre d'exercices passés dedans — c'est là-dessus que
    // l'écran de fin jugera la trajectoire.
    const top50Depuis = rang <= 50 && !g.top50Depuis ? g.annee : g.top50Depuis || null;
    const anneesTop50 = (g.anneesTop50 || 0) + (rang <= 50 ? 1 : 0);

    if (nouvelleAnnee > ANNEE_FIN) {
      const etatFinal = { ...g, top50Depuis, anneesTop50 };
      const fin = evaluerFin(etatFinal, { rang });
      setFinInfo({
        type: "alternative", fin: fin.id, annee: ANNEE_FIN, revenus: g.revenusAnnee, rang,
        meilleurRang, top50Depuis, anneesTop50, etat: etatFinal,
      });
      setPhase("fin");
      setBilanAnnuel(null);
      return;
    }

    // Le monde bouge entre deux années : les géants se doublent, les
    // indépendants montent et descendent, et ça alimente les brèves.
    const { monde, faits } = evoluerMonde(g.monde, g.annee);

    const { etat: apresMentor, lettre, reaction } = passageAnnee(g, nouvelleAnnee, { rang });
    const etat = {
      ...apresMentor, annee: nouvelleAnnee, t: 1, heures: HEURES_FONDATEUR, actionsTour: [],
      monde, faitsMonde: faits, lettre, reactionMentor: reaction,
      revenusAnneePrec: g.revenusAnnee, revenusAnnee: 0, meilleurRang,
      top50Depuis, anneesTop50,
      messages: ["T1 " + nouvelleAnnee + " — nouvelle année."],
    };
    etat.opportunite = etat.decisionEvt || tirerOpportunite(etat);
    etat.decisionEvt = null;
    setG(etat);
    persister(etat);
    setBilanAnnuel(null);
    setPhase("play");
  }

  // ---- Rendu --------------------------------------------------------------

  if (phase === "intro") {
    return (
      <Intro
        sauvegardeExiste={sauvegardeExiste}
        saveMsg={saveMsg}
        onNouvelle={() => setPhase("brief")}
        onCharger={charger}
      />
    );
  }

  if (phase === "brief") {
    return <Brief onContinuer={() => setPhase("setup")} onRetour={() => setPhase("intro")} />;
  }

  if (phase === "setup") {
    return (
      <Setup
        pays={pays} profil={profil} origine={origine} marque={marque}
        set={{ pays: setPays, profil: setProfil, origine: setOrigine, marque: setMarque }}
        onDemarrer={demarrer}
      />
    );
  }

  if (phase === "play" && g) {
    return (
      <Jeu
        g={g} ctx={ctx} marque={marque} saveMsg={saveMsg} autosaveAt={autosaveAt}
        actions={{
          action, creerModele, rechercher, embaucher, licencier, ouvrirCanal, agrandirAtelier,
          facelift, edition, opportunite, politiqueSalariale, embaucherEquipe, produireAuMax,
          fermerCanal, retirerModele, recruterDirecteur,
          setProd, setPrix,
          finTrimestre, passerAnnee, sauvegarder, abandonner,
        }}
      />
    );
  }

  if (phase === "rapport" && rapport) {
    return (
      <Rapport
        r={rapport}
        lettre={g.lettre}
        reactionMentor={g.reactionMentor}
        objectif={g.objectif}
        onContinuer={continuerApresRapport}
      />
    );
  }

  if (phase === "annuel" && bilanAnnuel) {
    return (
      <BilanAnnuel b={bilanAnnuel} marque={marque} journal={g.journal} monde={g.monde} onContinuer={continuerApresAnnuel} />
    );
  }

  if (phase === "fin" && finInfo) {
    return <Fin f={finInfo} marque={marque} onRejouer={rejouer} />;
  }

  return null;
}
