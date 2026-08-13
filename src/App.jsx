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
  CANAUX, COUTS_CHF, COUTS_H, EMPLOYES, COMPLICATIONS, SALAIRES,
  MATERIAUX, MOUVEMENTS, SEGMENTS, STYLES, ANNEE_FIN, HEURES_FONDATEUR,
} from "./data/config.js";
import { OPPORTUNITES } from "./data/evenements.js";
import { rangPour } from "./data/monde.js";
import {
  clamp, coutFacelift, coutUnitaire, coutRD, dureeDev, fmtArgent, fmtH, fmtNb,
  gainChoc, gainMarketing, grilleDePrix, heuresRD, indemnite, margeMoyenne,
  nomComplications, num, paletteComplication, qualiteNouveau,
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
    const heures = heuresRD(palier.rdHeures, g.employes);
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

  function embaucher(type) {
    const e = EMPLOYES[type];
    if (!assez(COUTS_H.embauche)) return;
    setG({
      ...g,
      heures: g.heures - COUTS_H.embauche,
      employes: { ...g.employes, [type]: g.employes[type] + 1 },
      savoir: clamp(g.savoir + e.savoir, 0, 100),
      messages: [
        ...g.messages,
        e.nom + " embauché·e : " + e.desc + " Savoir-faire +" + e.savoir + ", coûts fixes +" + fmtArgent(e.fixes) + "/trimestre.",
      ],
    });
  }

  // Se séparer d'un collaborateur : indemnité immédiate, salaire économisé ensuite.
  function licencier(type) {
    const e = EMPLOYES[type];
    if (g.employes[type] <= 0 || !assez(COUTS_H.licenciement)) return;
    const cout = indemnite(type);
    setG({
      ...g,
      heures: g.heures - COUTS_H.licenciement,
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

    if (type === "marketing" && assez(COUTS_H.marketing, COUTS_CHF.marketing)) {
      const gain = gainMarketing(g, pays);
      setG({ ...g, heures: g.heures - COUTS_H.marketing, cash: g.cash - COUTS_CHF.marketing, noto: clamp(g.noto + gain, 0, 100),
        messages: [...g.messages, "Marketing : notoriété +" + gain + "."] });
    }

    if (type === "choc" && assez(COUTS_H.choc, COUTS_CHF.choc)) {
      const gain = gainChoc(g, pays);
      setG({ ...g, heures: g.heures - COUTS_H.choc, cash: g.cash - COUTS_CHF.choc,
        noto: clamp(g.noto + gain, 0, 100), cred: clamp(g.cred - 2, 0, 100), des: clamp(g.des - 1, 0, 100),
        messages: [...g.messages, "Campagne choc : notoriété +" + gain + ", mais crédibilité −2 et désirabilité −1. Le buzz a un prix."] });
    }

    if (type === "presse" && assez(COUTS_H.presse)) {
      setG({ ...g, heures: g.heures - COUTS_H.presse, cred: clamp(g.cred + 2, 0, 100), noto: clamp(g.noto + 1, 0, 100),
        messages: [...g.messages, "Relations presse : crédibilité +2, notoriété +1."] });
    }

    if (type === "etude" && assez(COUTS_H.etude, COUTS_CHF.etude)) {
      // L'étude ne dit plus « le » prix : elle chiffre la demande à trois prix.
      const lignes = g.modeles
        .filter((m) => m.statut === "actif")
        .map((m) => {
          const grille = grilleDePrix(m, g)
            .map((x) => fmtArgent(x.prix) + " → ~" + fmtNb(x.demande) + " pièces (" + fmtArgent(x.ca) + ")")
            .join(" · ");
          return m.nom + " : " + grille;
        });
      setG({ ...g, heures: g.heures - COUTS_H.etude, cash: g.cash - COUTS_CHF.etude,
        messages: [...g.messages, "Étude de marché — demande estimée au prochain trimestre. " +
          (lignes.length ? lignes.join(" | ") : "Aucun modèle en vente.")] });
    }



    if (type === "soldes" && assez(COUTS_H.soldes)) {
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
      setG({ ...g, heures: g.heures - COUTS_H.soldes, cash: g.cash + cash, modeles, des: clamp(g.des - 8, 0, 100),
        revenusAnnee: g.revenusAnnee + cash,
        messages: [...g.messages, "Soldes : " + unites + " pièces écoulées à −35% → +" + fmtArgent(cash) +
          ". Désirabilité −8 : brader laisse des traces."] });
    }

    if (type === "kickstarter" && assez(COUTS_H.kickstarter) && !g.kickstarterFait && g.modeles.length > 0) {
      const leve = Math.round(20000 + g.noto * 2500 + g.reseau * 8000);
      setG({ ...g, heures: g.heures - COUTS_H.kickstarter, kickstarterFait: true, cash: g.cash + leve,
        noto: clamp(g.noto + 8, 0, 100), des: clamp(g.des + 4, 0, 100),
        messages: [...g.messages, "Kickstarter réussi : " + fmtArgent(leve) + " levés, notoriété +8, désirabilité +4."] });
    }

    if (type === "emprunt" && assez(COUTS_H.emprunt)) {
      setG({ ...g, heures: g.heures - COUTS_H.emprunt, cash: g.cash + COUTS_CHF.emprunt, dette: g.dette + COUTS_CHF.emprunt,
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
    if (!a || !assez(a.heuresAction, a.cout)) return;
    setG({
      ...g,
      heures: g.heures - a.heuresAction,
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

  function facelift(i) {
    const m = g.modeles[i];
    const cout = coutFacelift(m, profil);
    if (!assez(COUTS_H.facelift, cout)) return;
    setG({ ...g, heures: g.heures - COUTS_H.facelift, cash: g.cash - cout,
      modeles: g.modeles.map((x, j) => (j === i ? { ...x, age: 0 } : x)),
      messages: [...g.messages, "Facelift de « " + m.nom + " » : fraîcheur restaurée. Coût : " + fmtArgent(cout) + "."] });
  }

  function edition(i) {
    const m = g.modeles[i];
    const cout = 50 * coutUnitaire(m, { pays, savoir: g.savoir, employes: g.employes });
    if (!assez(COUTS_H.edition, cout)) return;
    const vendues = Math.round(50 * clamp(0.25 + g.des / 80, 0.2, 1));
    const ca = Math.round(vendues * Math.max(50, num(m.prix)) * 1.6 * margeMoyenne(g.canaux));
    setG({ ...g, heures: g.heures - COUTS_H.edition, cash: g.cash - cout + ca,
      des: clamp(g.des + 8, 0, 100), cred: clamp(g.cred - 1, 0, 100),
      revenusAnnee: g.revenusAnnee + ca,
      messages: [...g.messages, "Édition limitée « " + m.nom + " » ×50 : " + vendues + " vendues à prix fort → +" +
        fmtArgent(ca - cout) + " net. Désirabilité +8, crédibilité −1 (le marketing de la rareté)."] });
  }

  function opportunite(accepte) {
    const opp = OPPORTUNITES.find((o) => o.id === g.opportunite);
    if (!opp) return;
    // Acceptée ou déclinée, l'opportunité rejoint la mémoire courte : elle ne
    // sera pas reproposée tout de suite (playtest : voyage de presse un
    // trimestre sur deux).
    const memoire = [opp.id, ...(g.oppRecentes || [])].slice(0, 3);
    if (!accepte) {
      setG({ ...g, opportunite: null, oppRecentes: memoire });
      return;
    }
    if (!assez(opp.heures, opp.cout)) return;

    const etat = { ...g, heures: g.heures - opp.heures, cash: g.cash - opp.cout, opportunite: null, oppRecentes: memoire };
    let msg = "";

    if (opp.id === "salon") {
      etat.noto = clamp(g.noto + 10, 0, 100);
      etat.cred = clamp(g.cred + 4, 0, 100);
      etat.des = clamp(g.des + 3, 0, 100);
      msg = "Salon Genève Time : notoriété +10, crédibilité +4, désirabilité +3.";
    }

    if (opp.id === "youtubeur") {
      if (hasard() < 0.62) {
        etat.cred = clamp(g.cred + 5, 0, 100);
        etat.noto = clamp(g.noto + 4, 0, 100);
        etat.des = clamp(g.des + 3, 0, 100);
        msg = "Review positive de « Remontoir » : crédibilité +5, notoriété +4, désirabilité +3.";
      } else {
        etat.cred = clamp(g.cred - 3, 0, 100);
        etat.noto = clamp(g.noto + 2, 0, 100);
        msg = "Review mitigée de « Remontoir »... crédibilité −3, notoriété +2.";
      }
    }

    if (opp.id === "detaillant") {
      let cash = 0, unites = 0;
      etat.modeles = g.modeles.map((m) => {
        if (m.stock > 0 && m.statut === "actif") {
          unites += m.stock;
          cash += Math.round(m.stock * Math.max(50, num(m.prix)) * 0.75 * margeMoyenne(g.canaux));
          return { ...m, stock: 0 };
        }
        return m;
      });
      etat.cash += cash;
      etat.revenusAnnee = g.revenusAnnee + cash;
      etat.des = clamp(g.des - 1, 0, 100);
      msg = "Détaillant : " + unites + " montres à −25% → +" + fmtArgent(cash) + ". Désirabilité −1 : écouler en gros se voit.";
    }

    // Les deux complaisances alimentent le compteur : le risque n'est plus un
    // tirage sur place, c'est une enquête qui peut tomber n'importe quand
    // ensuite, d'autant plus probable qu'on a recommencé.
    if (opp.id === "voyagepresse") {
      etat.cred = clamp(g.cred + 5, 0, 100);
      etat.presseAchetee = (g.presseAchetee || 0) + 1;
      msg = "Voyage de presse : crédibilité +5." +
        (etat.presseAchetee >= 3 ? " Trois complaisances au compteur — la profession finit toujours par parler." : "");
    }

    if (opp.id === "collab") {
      etat.noto = clamp(g.noto + 12, 0, 100);
      etat.cred = clamp(g.cred - 2, 0, 100);
      etat.presseAchetee = (g.presseAchetee || 0) + 1;
      msg = "Collab influenceur : notoriété +12, crédibilité −2." +
        (etat.presseAchetee >= 3 ? " Trois complaisances au compteur — ça finira par se savoir." : "");
    }

    etat.messages = [...g.messages, msg];
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
    setRapport(rap);
    if (g.t >= 4) {
      const rang = rangPour(gs2.revenusAnnee, g.annee);
      setBilanAnnuel({
        annee: g.annee, revenus: gs2.revenusAnnee, rang,
        prec: g.revenusAnneePrec, meilleurRang: Math.min(rang, g.meilleurRang),
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
    const etat = { ...g, t: g.t + 1, heures: HEURES_FONDATEUR, actionsTour: [] };
    etat.opportunite = tirerOpportunite(etat);
    etat.messages = ["T" + etat.t + " " + etat.annee + " — à vous de jouer.", ...g.messages];
    setG(etat);
    persister(etat);
    setPhase("play");
  }

  function continuerApresAnnuel() {
    const { rang } = bilanAnnuel;
    const meilleurRang = Math.min(rang, g.meilleurRang);
    const nouvelleAnnee = g.annee + 1;

    if (rang <= 50) {
      setFinInfo({ type: "top50", annee: g.annee, revenus: g.revenusAnnee, rang });
      setPhase("fin");
      setBilanAnnuel(null);
      return;
    }
    if (nouvelleAnnee > ANNEE_FIN) {
      setFinInfo({ type: "temps", annee: ANNEE_FIN, revenus: g.revenusAnnee, rang, meilleurRang });
      setPhase("fin");
      setBilanAnnuel(null);
      return;
    }

    // Le monde bouge entre deux années : les géants se doublent, les
    // indépendants montent et descendent, et ça alimente les brèves.
    const { monde, faits } = evoluerMonde(g.monde, g.annee);

    const etat = {
      ...g, annee: nouvelleAnnee, t: 1, heures: HEURES_FONDATEUR, actionsTour: [],
      monde, faitsMonde: faits,
      revenusAnneePrec: g.revenusAnnee, revenusAnnee: 0, meilleurRang,
      messages: ["T1 " + nouvelleAnnee + " — nouvelle année."],
    };
    etat.opportunite = tirerOpportunite(etat);
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
          facelift, edition, opportunite, politiqueSalariale, setProd, setPrix,
          finTrimestre, passerAnnee, sauvegarder, abandonner,
        }}
      />
    );
  }

  if (phase === "rapport" && rapport) {
    return <Rapport r={rapport} onContinuer={continuerApresRapport} />;
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
