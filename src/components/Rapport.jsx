import { S } from "../styles.js";
import { fmtArgent, fmtH, fmtNb, fmtPct } from "../engine/formules.js";

export default function Rapport({ r, onContinuer }) {
  return (
    <div style={S.root}>
      <div style={{ ...S.wrap, paddingTop: 24 }}>
        <div style={S.h1}>
          Rapport T{r.t} {r.annee}
        </div>

        {r.evt && (
          <div style={{ ...S.panel, borderColor: "#C9A227", marginTop: 12 }}>
            <span style={S.gold}>⚡ {r.evt.titre}</span>
            <br />
            <span style={S.steel}>{r.evt.texte}</span>
          </div>
        )}
        {r.alea && (
          <div style={{ ...S.panel, borderColor: "#4A7C9E", marginTop: 12 }}>
            <span style={S.blue}>🎲 {r.alea.titre}</span>
            <br />
            <span style={S.steel}>{r.alea.texte}</span>
          </div>
        )}
        {r.capDepassee && (
          <div style={{ ...S.panel, borderColor: "#D06050" }}>
            <span style={S.red}>
              ⚠ Atelier saturé — {fmtH(r.heuresDemandees)} planifiées pour {fmtH(r.heuresDispo)} disponibles.
              Production réduite au prorata.
            </span>
          </div>
        )}
        {r.gainsCred && r.gainsCred.length > 0 && (
          <div style={{ ...S.panel, borderColor: "#4A6B4E" }}>
            <span style={S.green}>
              ✦ Crédibilité +{r.gainsCred.length} — {r.gainsCred.join(", ")}.
            </span>
          </div>
        )}

        {r.lignes.length === 0 && (
          <div style={{ ...S.panel, ...S.steel, marginTop: 12 }}>Aucun modèle en vente ce trimestre.</div>
        )}
        {r.lignes.map((l, i) => (
          <div key={i} style={{ ...S.panel, marginTop: 12 }}>
            <span style={S.gold}>{l.nom}</span>
            {l.fraicheur < 0.6 && <span style={S.red}> (vieillissant)</span>}
            <br />
            <span style={S.steel}>
              Produites {fmtNb(l.prod)} ({fmtH(l.heures)}) · Demande {fmtNb(l.demande)} ·{" "}
            </span>
            <span>Vendues {fmtNb(l.vendues)}</span>
            <span style={S.steel}> · Stock {fmtNb(l.stock)}</span>
            <br />
            <span style={S.green}>{fmtArgent(l.ca)} de chiffre d'affaires</span>
          </div>
        ))}

        {r.encadrement && r.encadrement.manque > 0 && (
          <div style={{ ...S.panel, borderColor: "#D06050" }}>
            <span style={S.red}>
              ⚠ Atelier sous-encadré — {r.encadrement.manque} chef
              {r.encadrement.manque > 1 ? "s" : ""} d'atelier manquant{r.encadrement.manque > 1 ? "s" : ""} :
              l'équipe n'a rendu que {fmtPct(r.encadrement.efficacite)} de ses heures.
            </span>
          </div>
        )}

        <div style={S.panel}>
          <div>
            Ventes <span style={{ float: "right" }}>{fmtArgent(r.ventesBrutes)}</span>
          </div>
          {r.commissions > 0 && (
            <div style={S.steel}>
              dont commissions de distribution
              <span style={{ float: "right", ...S.red }}>−{fmtArgent(r.commissions)}</span>
            </div>
          )}
          <div>
            Revenus encaissés <span style={{ float: "right", ...S.green }}>{fmtArgent(r.revenus)}</span>
          </div>
          <div>
            Production <span style={{ float: "right", ...S.red }}>−{fmtArgent(r.coutsProd)}</span>
          </div>
          <div>
            Coûts fixes <span style={{ float: "right", ...S.red }}>−{fmtArgent(r.fixes)}</span>
          </div>
          {/* Décomposition : « couper des coûts » doit être actionnable. */}
          {r.detailFixes &&
            r.detailFixes.map((l, i) => (
              <div key={i} style={{ ...S.steel, paddingLeft: 12 }}>
                {l.libelle}
                <span style={{ float: "right" }}>−{fmtArgent(l.montant)}</span>
              </div>
            ))}
          <div>
            Intérêts <span style={{ float: "right", ...S.red }}>−{fmtArgent(r.interets)}</span>
          </div>
          {r.impot > 0 && (
            <div>
              Impôt sur le bénéfice annuel{" "}
              <span style={{ float: "right", ...S.red }}>−{fmtArgent(r.impot)}</span>
            </div>
          )}
          <div style={{ borderTop: "1px solid #2A3A2C", marginTop: 6, paddingTop: 6 }}>
            Résultat{" "}
            <span style={{ float: "right", ...(r.resultatNet >= 0 ? S.green : S.red), fontSize: 21 }}>
              {r.resultatNet >= 0 ? "+" : ""}
              {fmtArgent(r.resultatNet)}
            </span>
          </div>
          <div>
            Caisse <span style={{ float: "right", ...S.gold }}>{fmtArgent(r.cash)}</span>
          </div>
          <div style={{ ...S.steel, marginTop: 6 }}>
            Atelier : {fmtH(r.heuresUtilisees)} produites sur {fmtH(r.heuresDispo)} disponibles (vous{" "}
            {fmtH(r.heuresFondateur)} + équipe {fmtH(r.heuresEquipe)}, postes {fmtH(r.capacite)})
            {r.gainSavoir > 0 ? " · établi : savoir-faire +" + r.gainSavoir : ""}
          </div>
        </div>

        <button style={S.cta} onClick={onContinuer}>
          CONTINUER ▸
        </button>
      </div>
    </div>
  );
}
