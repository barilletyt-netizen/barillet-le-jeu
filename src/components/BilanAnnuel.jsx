import { useEffect } from "react";
import { S } from "../styles.js";
import { revenusTop50 } from "../data/monde.js";
import { voisinsVivants } from "../engine/monde.js";
import { fmtArgent, fmtM } from "../engine/formules.js";

export default function BilanAnnuel({ b, marque, journal, monde, onContinuer }) {
  // Un trimestre qui passe doit se lire depuis le début : sans ça on arrive
  // au milieu de la page précédente et il faut remonter à la main.
  useEffect(() => window.scrollTo(0, 0), []);

  const v = voisinsVivants(monde, b.rang, b.annee);
  const geants = monde.geants;
  const trims = journal.filter((j) => j.annee === b.annee);

  return (
    <div style={S.root}>
      <div style={{ ...S.wrap, paddingTop: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 34 }}>{b.premierTop50 ? "👑" : "🏆"}</div>
          <div style={S.h1}>CLASSEMENT {b.annee}</div>
          <div style={S.steel}>Le Stanley Morgan Top 50 est tombé</div>
        </div>

        {/* Entrer dans les cinquante n'arrête plus la partie : c'est un jalon,
            et il se fête. Y rester est une autre affaire. */}
        {b.premierTop50 && (
          <div style={{ ...S.panel, borderColor: "#C9A227", marginTop: 16, textAlign: "center" }}>
            <div style={{ ...S.gold, fontSize: 21 }}>{(marque || "Votre marque").toUpperCase()} ENTRE AU TOP 50</div>
            <div style={{ ...S.steel, marginTop: 6 }}>
              #{b.rang} mondial, {fmtArgent(b.revenus)} de revenus. Vous êtes la première maison fondée en 2015
              à y parvenir. Reste à y rester : le classement se recompose chaque année, et personne n'y est
              jamais assis.
            </div>
          </div>
        )}
        {!b.premierTop50 && b.rang <= 50 && (
          <div style={{ ...S.panel, borderColor: "#4A6B4E", marginTop: 16 }}>
            <span style={S.green}>
              ✦ {b.anneesTop50}ᵉ exercice consécutif ou non dans les cinquante premières.
            </span>
          </div>
        )}

        <div style={{ ...S.panel, marginTop: 16 }}>
          {geants.map((c, i) => (
            <div key={c.nom} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #1E2A20" }}>
              <span>
                <span style={S.steel}>#{i + 1}</span> {c.nom}
                {/* Une flèche suffit à rendre le classement vivant. */}
                {c.tendance > 0.05 && <span style={S.green}> ▲</span>}
                {c.tendance < -0.05 && <span style={S.red}> ▼</span>}
              </span>
              <span style={S.steel}>{fmtM(c.rev)}</span>
            </div>
          ))}
          <div style={{ ...S.steel, textAlign: "center", padding: "4px 0" }}>· · ·</div>
          {v.dessus.map((x) => (
            <div key={x.nom} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #1E2A20" }}>
              <span>
                <span style={S.steel}>#~{x.rang}</span> {x.nom}
                {x.tendance > 20 && <span style={S.green}> ▲{x.tendance}</span>}
                {x.tendance < -20 && <span style={S.red}> ▼{-x.tendance}</span>}
              </span>
              <span style={S.steel}>{fmtArgent(x.rev)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 14px", background: "#243626", margin: "0 -14px" }}>
            <span>
              <span style={S.gold}>#~{b.rang}</span> {marque || "Votre marque"}
            </span>
            <span style={S.gold}>{fmtArgent(b.revenus)}</span>
          </div>
          {v.dessous.map((x) => (
            <div key={x.nom} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #1E2A20" }}>
              <span>
                <span style={S.steel}>#~{x.rang}</span> {x.nom}
                {x.tendance > 20 && <span style={S.green}> ▲{x.tendance}</span>}
                {x.tendance < -20 && <span style={S.red}> ▼{-x.tendance}</span>}
              </span>
              <span style={S.steel}>{fmtArgent(x.rev)}</span>
            </div>
          ))}
        </div>

        {trims.length > 0 && (
          <div style={S.panel}>
            {trims.map((j, i) => (
              <div key={i} style={{ padding: "3px 0", borderBottom: "1px solid #1E2A20", fontSize: 17 }}>
                <span style={S.steel}>T{j.t}</span> · CA {fmtArgent(j.revenus)} ·
                <span style={j.resultat >= 0 ? S.green : S.red}>
                  {" "}
                  {j.resultat >= 0 ? "+" : ""}
                  {fmtArgent(j.resultat)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={S.panel}>
          Revenus annuels : <span style={S.gold}>{fmtArgent(b.revenus)}</span>
          {b.prec > 0 && (
            <span style={b.revenus >= b.prec ? S.green : S.red}>
              {" "}
              ({b.revenus >= b.prec ? "+" : ""}
              {Math.round((b.revenus / Math.max(1, b.prec) - 1) * 100)}% vs {b.annee - 1})
            </span>
          )}
          <br />
          <span style={S.steel}>
            Objectif Top 50 en {b.annee} : {fmtArgent(revenusTop50(b.annee))} de revenus annuels.
            {b.annee > 2015 ? " La barre monte d'environ 4% par an — le marché grossit aussi." : ""}
          </span>
        </div>

        <button style={S.cta} onClick={onContinuer}>
          ANNÉE SUIVANTE ▸
        </button>
      </div>
    </div>
  );
}
