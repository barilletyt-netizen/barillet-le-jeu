import { useEffect, useRef, useState } from "react";
import { S } from "../styles.js";
import { HEURES_FONDATEUR } from "../data/config.js";
import { fmtArgent, fmtH, tresorerie } from "../engine/formules.js";

/**
 * Barre de statut persistante, collée en bas (public principal : mobile).
 *
 * Trois informations seulement — heures, caisse, trimestre — parce que le
 * problème remonté en beta est la perte de vue de ces trois chiffres pendant la
 * navigation dans les panneaux, pas un manque d'information générale. Les jauges
 * restent dans le corps de la page.
 */
export default function BarreStatut({ g, autosaveAt }) {
  const tres = tresorerie(g);

  // Le décompte d'heures doit se voir au moment où l'action est prise.
  const [delta, setDelta] = useState(null);
  const precedent = useRef(g.heures);
  useEffect(() => {
    const avant = precedent.current;
    precedent.current = g.heures;
    if (g.heures < avant) {
      setDelta(g.heures - avant);
      const id = setTimeout(() => setDelta(null), 1200);
      return () => clearTimeout(id);
    }
  }, [g.heures]);

  // « sauvegarde auto ✓ » : les testeurs demandaient si le jeu sauvegardait.
  const [sauve, setSauve] = useState(false);
  useEffect(() => {
    if (!autosaveAt) return;
    setSauve(true);
    const id = setTimeout(() => setSauve(false), 2600);
    return () => clearTimeout(id);
  }, [autosaveAt]);

  const part = Math.max(0, Math.min(100, (100 * g.heures) / HEURES_FONDATEUR));
  const couleurHeures = g.heures === 0 ? "#D06050" : g.heures < HEURES_FONDATEUR * 0.25 ? "#E0B44A" : "#C9A227";

  return (
    <div style={S.barre}>
      {/* Jauge d'heures en fond, pour lire le budget restant d'un coup d'œil. */}
      <div style={{ height: 3, background: "#0E140F" }}>
        <div style={{ height: "100%", width: part + "%", background: couleurHeures, transition: "width 320ms ease-out" }} />
      </div>

      <div style={S.barreContenu}>
        <div style={{ position: "relative" }}>
          <div style={S.barreLabel}>Heures</div>
          <div
            key={g.heures}
            style={{ ...S.barreValeur, color: couleurHeures, animation: delta ? "barillet-pulse 600ms ease-out" : "none" }}
          >
            {fmtH(g.heures)}
          </div>
          {delta !== null && <div style={S.barreDelta}>{delta} h</div>}
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
    </div>
  );
}
