import { S } from "../styles.js";
import { ANNEE_DEBUT, ANNEE_FIN, HEURES_FONDATEUR } from "../data/config.js";

export default function Intro({ sauvegardeExiste, saveMsg, onNouvelle, onCharger }) {
  return (
    <div style={S.root}>
      <div style={{ ...S.wrap, paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>⌚</div>
        <div style={{ ...S.h1, fontSize: 22 }}>BARILLET</div>
        <div style={{ ...S.steel, marginTop: 10 }}>le jeu — v0.5</div>
        <div style={{ ...S.panel, marginTop: 28, textAlign: "left" }}>
          {ANNEE_DEBUT}. Vous avez {ANNEE_FIN - ANNEE_DEBUT} ans pour bâtir une marque horlogère et viser
          le Top 50 mondial. Un tour = un trimestre, et vous disposez de{" "}
          <span style={S.gold}>{HEURES_FONDATEUR} heures</span> par trimestre. Tout en coûte : chaque heure de
          communication est une montre non produite. Les heures que vous ne dépensez pas partent à l'établi.
          Développer prend du temps, les jauges déclinent, la faillite est définitive.
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
