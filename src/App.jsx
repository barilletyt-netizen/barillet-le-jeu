import { useEffect, useState } from "react";
import Intro from "./components/Intro.jsx";
import Setup from "./components/Setup.jsx";
import Jeu from "./components/Jeu.jsx";
import Rapport from "./components/Rapport.jsx";
import BilanAnnuel from "./components/BilanAnnuel.jsx";
import Fin from "./components/Fin.jsx";
import {
  ATELIER_COUT, ATELIER_HEURES, COMPLICATIONS, COUTS_H, EMPLOYES,
  MATERIAUX, MOUVEMENTS, SEGMENTS, STYLES, ANNEE_FIN, HEURES_FONDATEUR,
} from "./data/config.js";
import { OPPORTUNITES } from "./data/evenements.js";
import { rangPour } from "./data/monde.js";
import {
  clamp, coutRD, coutUnitaire, dureeDev, estimerDemande, fmtCHF, fmtH,
  gainChoc, gainDist, gainMarketing, heuresRD, num, qualiteNouveau,
} from "./engine/formules.js";
import { etatInitial, simulateQuarter, tirerOpportunite } from "./engine/simulation.js";
import { chargerPartie, existeSauvegarde, sauvegarderPartie } from "./engine/save.js";

export default function App() {
  const [phase, setPhase] = useState("intro");
  const [pays, setPays] = useState(null);
  const [profil, setProfil] = useState(null);
  const [origine, setOrigine] = useState(null);
  const [marque, setMarque] = useState("");

  const [g, setG] = useState(null);
  const [rapport, setRapport] = useState(null);
  const [bilanAnnuel, setBilanAnnuel] = useState(null);
  const [finInfo, setFinInfo] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [sauvegardeExiste, setSauvegardeExiste] = useState(false);

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
    if (ok) setSauvegardeExiste(true);
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
    setPhase("play");
  }

  // ---- Cycle de vie de la partie -----------------------------------------

  function demarrer() {
    const etat = etatInitial({ pays, profil, origine, marque });
    setG(etat);
    persister(etat);
    setPhase("play");
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
    setMarque("");
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
    const compl = nm.compl || "aucune";
    const detail = [
      MOUVEMENTS[nm.mvt].nom,
      COMPLICATIONS[compl].nom,
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
          compl, finition: !!nm.finition,
          prix: nm.prix,
          qual: qualiteNouveau(nm.mvt, { pays, profil, savoir: g.savoir, compl, finition: !!nm.finition }),
          prod: 0, stock: 0, age: 0, statut: "dev", devRestant: duree,
        },
      ],
      messages: [
        ...g.messages,
        "R&D lancée : « " + nom + " » (" + detail + (nm.finition ? ", finition maison" : "") +
        "). Prêt dans " + duree + " trim. " + fmtH(heures) + " et " + fmtCHF(cout) + ".",
      ],
    });
  }

  function rechercherComplication(id) {
    const c = COMPLICATIONS[id];
    const heures = heuresRD(c.rdHeures, g.employes);
    if (!assez(heures, c.rd) || g.recherche) return;
    const duree = Math.max(1, c.dev - (g.employes.ingenieur > 0 ? 1 : 0));
    setG({
      ...g,
      cash: g.cash - c.rd,
      heures: g.heures - heures,
      recherche: { id, restant: duree },
      messages: [
        ...g.messages,
        "Recherche lancée : " + c.nom + ". " + duree + " trim., " + fmtH(heures) + " et " + fmtCHF(c.rd) + ".",
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
        e.nom + " embauché·e : " + e.desc + " Savoir-faire +" + e.savoir + ", coûts fixes +" + fmtCHF(e.fixes) + "/trimestre.",
      ],
    });
  }

  function action(type) {
    if (!g) return;

    if (type === "marketing" && assez(COUTS_H.marketing, 15000)) {
      const gain = gainMarketing(g, pays);
      setG({ ...g, heures: g.heures - COUTS_H.marketing, cash: g.cash - 15000, noto: clamp(g.noto + gain, 0, 100),
        messages: [...g.messages, "Marketing : notoriété +" + gain + "."] });
    }

    if (type === "choc" && assez(COUTS_H.choc, 30000)) {
      const gain = gainChoc(g, pays);
      setG({ ...g, heures: g.heures - COUTS_H.choc, cash: g.cash - 30000,
        noto: clamp(g.noto + gain, 0, 100), cred: clamp(g.cred - 2, 0, 100), des: clamp(g.des - 1, 0, 100),
        messages: [...g.messages, "Campagne choc : notoriété +" + gain + ", mais crédibilité −2 et désirabilité −1. Le buzz a un prix."] });
    }

    if (type === "presse" && assez(COUTS_H.presse)) {
      setG({ ...g, heures: g.heures - COUTS_H.presse, cred: clamp(g.cred + 2, 0, 100), noto: clamp(g.noto + 1, 0, 100),
        messages: [...g.messages, "Relations presse : crédibilité +2, notoriété +1."] });
    }

    if (type === "distribution" && assez(COUTS_H.distribution, 12000)) {
      const gain = gainDist(g);
      setG({ ...g, heures: g.heures - COUTS_H.distribution, cash: g.cash - 12000, dist: clamp(g.dist + gain, 0, 100),
        messages: [...g.messages, "Distribution : réseau de vente +" + gain + "."] });
    }

    if (type === "etude" && assez(COUTS_H.etude, 5000)) {
      const lignes = g.modeles
        .filter((m) => m.statut === "actif")
        .map((m) => m.nom + " : ~" + estimerDemande(m, g) + " pièces");
      setG({ ...g, heures: g.heures - COUTS_H.etude, cash: g.cash - 5000,
        messages: [...g.messages, "Étude de marché — demande estimée au prochain trimestre : " +
          (lignes.length ? lignes.join(" · ") : "aucun modèle actif") + "."] });
    }

    if (type === "atelier" && assez(COUTS_H.atelier, ATELIER_COUT)) {
      setG({ ...g, heures: g.heures - COUTS_H.atelier, cash: g.cash - ATELIER_COUT,
        ateliers: g.ateliers + 1, capacite: g.capacite + ATELIER_HEURES,
        messages: [...g.messages, "Atelier agrandi : +" + ATELIER_HEURES +
          " h de postes de travail par trimestre, coûts fixes +CHF 6'000/trimestre."] });
    }

    if (type === "soldes" && assez(COUTS_H.soldes)) {
      let cash = 0, unites = 0;
      const modeles = g.modeles.map((m) => {
        if (m.stock > 0 && m.statut === "actif") {
          unites += m.stock;
          cash += Math.round(m.stock * Math.max(50, num(m.prix)) * 0.65);
          return { ...m, stock: 0 };
        }
        return m;
      });
      if (unites === 0) return;
      setG({ ...g, heures: g.heures - COUTS_H.soldes, cash: g.cash + cash, modeles, des: clamp(g.des - 8, 0, 100),
        revenusAnnee: g.revenusAnnee + cash,
        messages: [...g.messages, "Soldes : " + unites + " pièces écoulées à −35% → +" + fmtCHF(cash) +
          ". Désirabilité −8 : brader laisse des traces."] });
    }

    if (type === "kickstarter" && assez(COUTS_H.kickstarter) && !g.kickstarterFait && g.modeles.length > 0) {
      const leve = Math.round(20000 + g.noto * 2500 + g.reseau * 8000);
      setG({ ...g, heures: g.heures - COUTS_H.kickstarter, kickstarterFait: true, cash: g.cash + leve,
        noto: clamp(g.noto + 8, 0, 100), des: clamp(g.des + 4, 0, 100),
        messages: [...g.messages, "Kickstarter réussi : " + fmtCHF(leve) + " levés, notoriété +8, désirabilité +4."] });
    }

    if (type === "emprunt" && assez(COUTS_H.emprunt)) {
      setG({ ...g, heures: g.heures - COUTS_H.emprunt, cash: g.cash + 150000, dette: g.dette + 150000,
        messages: [...g.messages, "Emprunt : +CHF 150'000 (taux " + (profil === "financier" ? "4" : "6") + "%/an)."] });
    }

    if (type === "rembourser" && g.dette > 0 && g.cash > 0) {
      const montant = Math.min(50000, g.dette, g.cash);
      setG({ ...g, cash: g.cash - montant, dette: g.dette - montant,
        messages: [...g.messages, "Remboursement : −" + fmtCHF(montant) + " de dette."] });
    }
  }

  function facelift(i) {
    const m = g.modeles[i];
    const cout = Math.round(coutRD(m.mvt, profil) * 0.4);
    if (!assez(COUTS_H.facelift, cout)) return;
    setG({ ...g, heures: g.heures - COUTS_H.facelift, cash: g.cash - cout,
      modeles: g.modeles.map((x, j) => (j === i ? { ...x, age: 0 } : x)),
      messages: [...g.messages, "Facelift de « " + m.nom + " » : fraîcheur restaurée. Coût : " + fmtCHF(cout) + "."] });
  }

  function edition(i) {
    const m = g.modeles[i];
    const cout = 50 * coutUnitaire(m, { pays, savoir: g.savoir, employes: g.employes });
    if (!assez(COUTS_H.edition, cout)) return;
    const vendues = Math.round(50 * clamp(0.25 + g.des / 80, 0.2, 1));
    const ca = Math.round(vendues * Math.max(50, num(m.prix)) * 1.6);
    setG({ ...g, heures: g.heures - COUTS_H.edition, cash: g.cash - cout + ca,
      des: clamp(g.des + 8, 0, 100), cred: clamp(g.cred - 1, 0, 100),
      revenusAnnee: g.revenusAnnee + ca,
      messages: [...g.messages, "Édition limitée « " + m.nom + " » ×50 : " + vendues + " vendues à prix fort → +" +
        fmtCHF(ca - cout) + " net. Désirabilité +8, crédibilité −1 (le marketing de la rareté)."] });
  }

  function opportunite(accepte) {
    const opp = OPPORTUNITES.find((o) => o.id === g.opportunite);
    if (!opp) return;
    if (!accepte) {
      setG({ ...g, opportunite: null });
      return;
    }
    if (!assez(opp.heures, opp.cout)) return;

    const etat = { ...g, heures: g.heures - opp.heures, cash: g.cash - opp.cout, opportunite: null };
    let msg = "";

    if (opp.id === "salon") {
      etat.noto = clamp(g.noto + 10, 0, 100);
      etat.cred = clamp(g.cred + 4, 0, 100);
      etat.des = clamp(g.des + 3, 0, 100);
      msg = "Salon Genève Time : notoriété +10, crédibilité +4, désirabilité +3.";
    }

    if (opp.id === "youtubeur") {
      if (Math.random() < 0.62) {
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
          cash += Math.round(m.stock * Math.max(50, num(m.prix)) * 0.75);
          return { ...m, stock: 0 };
        }
        return m;
      });
      etat.cash += cash;
      etat.revenusAnnee = g.revenusAnnee + cash;
      etat.dist = clamp(g.dist + 5, 0, 100);
      msg = "Détaillant : " + unites + " montres à −25% → +" + fmtCHF(cash) + ". Distribution +5.";
    }

    if (opp.id === "voyagepresse") {
      if (Math.random() < 0.88) {
        etat.cred = clamp(g.cred + 5, 0, 100);
        msg = "Voyage de presse réussi : crédibilité +5.";
      } else {
        etat.cred = clamp(g.cred - 8, 0, 100);
        msg = "Scandale ! Un journaliste raconte tout. Crédibilité −8.";
      }
    }

    if (opp.id === "collab") {
      etat.noto = clamp(g.noto + 12, 0, 100);
      etat.cred = clamp(g.cred - 2, 0, 100);
      msg = "Collab influenceur : notoriété +12, crédibilité −2.";
    }

    etat.messages = [...g.messages, msg];
    setG(etat);
  }

  const setProd = (i, val) => setG({ ...g, modeles: g.modeles.map((m, j) => (j === i ? { ...m, prod: val } : m)) });
  const setPrix = (i, val) => setG({ ...g, modeles: g.modeles.map((m, j) => (j === i ? { ...m, prix: val } : m)) });

  // ---- Fin de trimestre ---------------------------------------------------

  function finTrimestre() {
    const { gs2, rap, faillite } = simulateQuarter(g, g.heures, ctx);
    if (faillite) {
      setFinInfo({ type: "faillite", annee: g.annee, revenus: gs2.revenusAnnee });
      setPhase("fin");
      return;
    }
    setRapport(rap);
    if (g.t >= 4) {
      const rang = rangPour(gs2.revenusAnnee);
      setBilanAnnuel({
        annee: g.annee, revenus: gs2.revenusAnnee, rang,
        prec: g.revenusAnneePrec, meilleurRang: Math.min(rang, g.meilleurRang),
      });
    }
    setG(gs2);
    setPhase("rapport");
  }

  // Enchaîne les trimestres restants de l'année sans repasser par le joueur.
  function passerAnnee() {
    let etat = g;
    let heures = g.heures;
    for (;;) {
      const { gs2, faillite } = simulateQuarter(etat, heures, ctx);
      if (faillite) {
        setFinInfo({ type: "faillite", annee: etat.annee, revenus: gs2.revenusAnnee });
        setPhase("fin");
        return;
      }
      if (etat.t >= 4) {
        const rang = rangPour(gs2.revenusAnnee);
        setBilanAnnuel({
          annee: etat.annee, revenus: gs2.revenusAnnee, rang,
          prec: etat.revenusAnneePrec, meilleurRang: Math.min(rang, etat.meilleurRang),
        });
        setG(gs2);
        setRapport(null);
        setPhase("annuel");
        return;
      }
      etat = { ...gs2, t: etat.t + 1 };
      heures = HEURES_FONDATEUR;
    }
  }

  function continuerApresRapport() {
    if (bilanAnnuel) {
      setPhase("annuel");
      return;
    }
    const etat = { ...g, t: g.t + 1, heures: HEURES_FONDATEUR };
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

    const etat = {
      ...g, annee: nouvelleAnnee, t: 1, heures: HEURES_FONDATEUR,
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
        onNouvelle={() => setPhase("setup")}
        onCharger={charger}
      />
    );
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
        g={g} ctx={ctx} marque={marque} saveMsg={saveMsg}
        actions={{
          action, creerModele, rechercherComplication, embaucher, facelift, edition,
          opportunite, setProd, setPrix, finTrimestre, passerAnnee, sauvegarder,
        }}
      />
    );
  }

  if (phase === "rapport" && rapport) {
    return <Rapport r={rapport} onContinuer={continuerApresRapport} />;
  }

  if (phase === "annuel" && bilanAnnuel) {
    return (
      <BilanAnnuel b={bilanAnnuel} marque={marque} journal={g.journal} onContinuer={continuerApresAnnuel} />
    );
  }

  if (phase === "fin" && finInfo) {
    return <Fin f={finInfo} marque={marque} onRejouer={rejouer} />;
  }

  return null;
}
