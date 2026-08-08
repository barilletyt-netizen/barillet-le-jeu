import { S } from "../styles.js";
import { ANNEE_DEBUT, ANNEE_FIN } from "../data/config.js";

export default function Intro({ sauvegardeExiste, saveMsg, onNouvelle, onCharger }) {
  return (
    <div style={S.root}>
      <div style={{ ...S.wrap, paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>⌚</div>
        <div style={{ ...S.h1, fontSize: 22 }}>BARILLET</div>
        <div style={{ ...S.steel, marginTop: 10 }}>le jeu — v0.4</div>
        <div style={{ ...S.panel, marginTop: 28, textAlign: "left" }}>
          {ANNEE_DEBUT}. Vous avez {ANNEE_FIN - ANNEE_DEBUT} ans pour bâtir une marque horlogère et viser
          le Top 50 mondial. Un tour = un trimestre, {" "}
          <span style={S.gold}>2 points d'action</span> par trimestre. Développer prend du temps,
          l'atelier a un budget d'heures, les jauges déclinent, la faillite est définitive.
        </div>
        <button style={S.cta} onClick={onNouvelle}>
          NOUVELLE PARTIE
        </button>
        {sauvegardeExiste && (
          <button style={S.ghost} onClick={onCharger}>
            REPRENDRE LA SAUVEGARDE
          </button>
        )}
        {saveMsg && <div style={{ ...S.steel, marginTop: 10 }}>{saveMsg}</div>}
      </div>
    </div>
  );
}
