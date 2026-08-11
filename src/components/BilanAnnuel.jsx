import { S } from "../styles.js";
import { CLASSEMENT_MONDE, REVENUS_TOP50, voisins } from "../data/monde.js";
import { fmtCHF, fmtM } from "../engine/formules.js";

export default function BilanAnnuel({ b, marque, journal, onContinuer }) {
  const v = voisins(b.rang, b.revenus);
  const trims = journal.filter((j) => j.annee === b.annee);

  return (
    <div style={S.root}>
      <div style={{ ...S.wrap, paddingTop: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 34 }}>🏆</div>
          <div style={S.h1}>CLASSEMENT {b.annee}</div>
          <div style={S.steel}>Le Stanley Morgan Top 50 est tombé</div>
        </div>

        <div style={{ ...S.panel, marginTop: 16 }}>
          {CLASSEMENT_MONDE.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #1E2A20" }}>
              <span>
                <span style={S.steel}>#{i + 1}</span> {c.nom}
              </span>
              <span style={S.steel}>{fmtM(c.rev)}</span>
            </div>
          ))}
          <div style={{ ...S.steel, textAlign: "center", padding: "4px 0" }}>· · ·</div>
          {v.dessus.map((x, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #1E2A20" }}>
              <span>
                <span style={S.steel}>#~{x.rang}</span> {x.nom}
              </span>
              <span style={S.steel}>{fmtCHF(x.rev)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 14px", background: "#243626", margin: "0 -14px" }}>
            <span>
              <span style={S.gold}>#~{b.rang}</span> {marque || "Votre marque"}
            </span>
            <span style={S.gold}>{fmtCHF(b.revenus)}</span>
          </div>
          {v.dessous.map((x, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #1E2A20" }}>
              <span>
                <span style={S.steel}>#~{x.rang}</span> {x.nom}
              </span>
              <span style={S.steel}>{fmtCHF(x.rev)}</span>
            </div>
          ))}
        </div>

        {trims.length > 0 && (
          <div style={S.panel}>
            {trims.map((j, i) => (
              <div key={i} style={{ padding: "3px 0", borderBottom: "1px solid #1E2A20", fontSize: 17 }}>
                <span style={S.steel}>T{j.t}</span> · CA {fmtCHF(j.revenus)} ·
                <span style={j.resultat >= 0 ? S.green : S.red}>
                  {" "}
                  {j.resultat >= 0 ? "+" : ""}
                  {fmtCHF(j.resultat)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={S.panel}>
          Revenus annuels : <span style={S.gold}>{fmtCHF(b.revenus)}</span>
          {b.prec > 0 && (
            <span style={b.revenus >= b.prec ? S.green : S.red}>
              {" "}
              ({b.revenus >= b.prec ? "+" : ""}
              {Math.round((b.revenus / Math.max(1, b.prec) - 1) * 100)}% vs {b.annee - 1})
            </span>
          )}
          <br />
          <span style={S.steel}>Objectif Top 50 : {fmtCHF(REVENUS_TOP50)} de revenus annuels.</span>
        </div>

        <button style={S.cta} onClick={onContinuer}>
          ANNÉE SUIVANTE ▸
        </button>
      </div>
    </div>
  );
}
