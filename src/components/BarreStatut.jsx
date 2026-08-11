import { useEffect, useRef, useState } from "react";
import { S } from "../styles.js";
import {
  chargeHeures, fmtArgent, fmtH, heuresEmployes, heuresProductionDispo, encadrement, tresorerie,
} from "../engine/formules.js";

/**
 * Barre de statut persistante, collée en bas (public principal : mobile).
 *
 * Le chiffre mis en avant est le solde d'heures **réellement libres** : les
 * heures du fondateur encore disponibles, plus celles de l'atelier, moins la
 * production déjà planifiée. Retour de beta : la barre n'affichait que les
 * heures du fondateur et ne bougeait pas quand on programmait la production —
 * impossible de savoir ce qu'il restait.
 */
export default function BarreStatut({ g, autosaveAt }) {
  const tres = tresorerie(g);

  const dispo = heuresProductionDispo(g);
  const planifie = chargeHeures(g.modeles);
  const libres = dispo - planifie;
  const equipe = Math.round(heuresEmployes(g.employes) * encadrement(g.employes).efficacite);

  // Le solde doit réagir à la seconde où l'on agit ou où l'on planifie.
  const [delta, setDelta] = useState(null);
  const precedent = useRef(libres);
  useEffect(() => {
    const avant = precedent.current;
    precedent.current = libres;
    if (libres !== avant) {
      setDelta(libres - avant);
      const id = setTimeout(() => setDelta(null), 1200);
      return () => clearTimeout(id);
    }
  }, [libres]);

  // « sauvegarde auto ✓ » : les testeurs demandaient si le jeu sauvegardait.
  const [sauve, setSauve] = useState(false);
  useEffect(() => {
    if (!autosaveAt) return;
    setSauve(true);
    const id = setTimeout(() => setSauve(false), 2600);
    return () => clearTimeout(id);
  }, [autosaveAt]);

  const part = dispo > 0 ? Math.max(0, Math.min(100, (100 * libres) / dispo)) : 0;
  const couleur = libres < 0 ? "#D06050" : libres < dispo * 0.15 ? "#E0B44A" : "#C9A227";

  return (
    <div style={S.barre}>
      <div style={{ height: 3, background: "#0E140F" }}>
        <div style={{ height: "100%", width: part + "%", background: couleur, transition: "width 320ms ease-out" }} />
      </div>

      <div style={S.barreContenu}>
        <div style={{ position: "relative" }}>
          <div style={S.barreLabel}>Heures libres</div>
          <div
            key={libres}
            style={{ ...S.barreValeur, color: couleur, animation: delta ? "barillet-pulse 600ms ease-out" : "none" }}
          >
            {fmtH(libres)}
          </div>
          {delta !== null && (
            <div style={{ ...S.barreDelta, color: delta < 0 ? "#D06050" : "#8FBF7F" }}>
              {delta > 0 ? "+" : ""}
              {delta} h
            </div>
          )}
        </div>

        <div>
          <div style={S.barreLabel}>Caisse</div>
          <div style={{ ...S.barreValeur, color: tres.basse ? "#D06050" : "#EDE6D6" }}>{fmtArgent(g.cash)}</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={S.barreLabel}>{sauve ? <span style={S.green}>sauvegarde auto ✓</span> : "Trimestre"}</div>
          <div style={{ ...S.barreValeur, color: "#9DA8A6" }}>
            T{g.t} {g.annee}
          </div>
        </div>
      </div>

      {/* La décomposition, pour que le solde ne soit jamais un chiffre magique. */}
      <div style={S.barreDetail}>
        {libres < 0 ? (
          <span style={S.red}>
            ⚠ Vous avez planifié {fmtH(-libres)} de trop : la production sera réduite au prorata.
          </span>
        ) : (
          <>
            vous {fmtH(g.heures)}
            {equipe > 0 ? " + atelier " + fmtH(equipe) : ""} − production planifiée {fmtH(planifie)}
            {dispo >= g.capacite ? " · postes pleins (" + fmtH(g.capacite) + ")" : ""}
          </>
        )}
      </div>
    </div>
  );
}
