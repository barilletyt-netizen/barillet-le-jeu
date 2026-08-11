import { S } from "../styles.js";
import { ORIGINES, PAYS, PROFILS } from "../data/config.js";
import { nomDeMarque } from "../data/noms.js";

export default function Setup({ pays, profil, origine, marque, set, onDemarrer }) {
  const pret = pays && profil && origine;
  return (
    <div style={S.root}>
      <div style={{ ...S.wrap, paddingTop: 24 }}>
        <div style={S.h1}>Création</div>

        <div style={S.h2}>NOM DE LA MARQUE</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            style={S.input}
            value={marque}
            onChange={(e) => set.marque(e.target.value)}
            placeholder="Ex. Vallorbe & Fils"
          />
          <button
            style={{ ...S.ghost, marginTop: 0, width: 52 }}
            title="Proposer un autre nom"
            onClick={() => set.marque(nomDeMarque())}
          >
            🎲
          </button>
        </div>
        <div style={{ ...S.steel, marginTop: 4 }}>Proposition modifiable — écrivez le vôtre si vous préférez.</div>

        <div style={S.h2}>PAYS DE DÉPART</div>
        {Object.entries(PAYS).map(([k, p]) => (
          <button key={k} style={S.btn(pays === k)} onClick={() => set.pays(k)}>
            {p.flag} <span style={S.gold}>{p.nom}</span>
            <br />
            <span style={S.steel}>{p.desc}</span>
          </button>
        ))}

        <div style={S.h2}>PROFIL</div>
        {Object.entries(PROFILS).map(([k, p]) => (
          <button key={k} style={S.btn(profil === k)} onClick={() => set.profil(k)}>
            {p.icon} <span style={S.gold}>{p.nom}</span>
            <br />
            <span style={S.steel}>{p.desc}</span>
          </button>
        ))}

        <div style={S.h2}>ORIGINE SOCIALE</div>
        {Object.entries(ORIGINES).map(([k, o]) => (
          <button key={k} style={S.btn(origine === k)} onClick={() => set.origine(k)}>
            <span style={S.gold}>{o.nom}</span>
            <br />
            <span style={S.steel}>{o.desc}</span>
          </button>
        ))}

        <button style={{ ...S.cta, opacity: pret ? 1 : 0.35 }} disabled={!pret} onClick={onDemarrer}>
          FONDER LA MARQUE
        </button>
      </div>
    </div>
  );
}
