import { useState } from "react";
import { S } from "../styles.js";
import Jauge from "./Jauge.jsx";
import {
  MATERIAUX, MOUVEMENTS, SEGMENTS, STYLES,
  ATELIER_COUT, ATELIER_HEURES, ATELIER_FIXES, EMPLOYE_FIXES,
} from "../data/config.js";
import { OPPORTUNITES } from "../data/evenements.js";
import {
  chargeHeures, coutRD, coutUnitaire, dureeDev, fmtCHF, fmtH,
  fraicheur, gainChoc, gainDist, gainMarketing, heuresModele, heuresParPiece,
} from "../engine/formules.js";

export default function Jeu({ g, ctx, marque, saveMsg, actions }) {
  const { pays, profil } = ctx;

  const [showJournal, setShowJournal] = useState(false);
  const [picker, setPicker] = useState(null); // "facelift" | "edition"
  const [showNouveauModele, setShowNouveauModele] = useState(false);
  const [nm, setNm] = useState({ mvt: "ebauche", seg: "lifestyle", style: "sport", mat: "acier", prix: 700, nom: "" });

  const opp = g.opportunite ? OPPORTUNITES.find((o) => o.id === g.opportunite) : null;
  const actifs = g.modeles.filter((m) => m.statut === "actif");
  const charge = chargeHeures(g.modeles);
  const coutU = (m) => coutUnitaire(m, { pays, savoir: g.savoir });

  function lancerRD() {
    actions.creerModele(nm);
    setShowNouveauModele(false);
    setNm({ ...nm, nom: "" });
  }

  return (
    <div style={S.root}>
      <div style={{ ...S.wrap, paddingTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={S.h1}>{marque || "Votre marque"}</div>
          <div style={{ ...S.gold, fontFamily: "'Press Start 2P', monospace", fontSize: 11 }}>
            T{g.t} {g.annee}
          </div>
        </div>

        <div style={{ ...S.panel, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
          <div>
            Caisse
            <br />
            <span style={{ ...(g.cash < 30000 ? S.red : S.gold), fontSize: 22 }}>{fmtCHF(g.cash)}</span>
          </div>
          <div>
            Dette
            <br />
            <span style={{ ...(g.dette > 0 ? S.red : S.steel), fontSize: 22 }}>{fmtCHF(g.dette)}</span>
          </div>
        </div>

        <div style={{ ...S.panel, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <Jauge label="Notoriété" val={g.noto} />
          <Jauge label="Crédibilité" val={g.cred} />
          <Jauge label="Désirabilité" val={g.des} />
          <Jauge label="Savoir-faire" val={g.savoir} />
          <Jauge label="Distribution" val={g.dist} />
          <div>
            <span style={S.jauge}>Atelier</span>
            <br />
            <span style={{ fontSize: 21, color: charge > g.capacite ? "#D06050" : "#EDE6D6" }}>{charge}</span>
            <span style={S.steel}>/{g.capacite} h</span>
          </div>
        </div>

        {g.messages.length > 0 && (
          <div style={{ ...S.panel, borderColor: "#4A6B4E" }}>
            {g.messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                ▸ {m}
              </div>
            ))}
          </div>
        )}

        {opp && (
          <div style={{ ...S.panel, borderColor: "#C9A227" }}>
            <span style={S.gold}>★ {opp.titre}</span>
            <br />
            <span style={S.steel}>{opp.texte}</span>
            <br />
            <span style={S.steel}>
              {opp.pa} PA{opp.cout > 0 ? " + " + fmtCHF(opp.cout) : ""}
            </span>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button style={{ ...S.ghost, marginTop: 0 }} onClick={() => actions.opportunite(false)}>
                Décliner
              </button>
              <button
                style={{ ...S.cta, marginTop: 0, opacity: g.pa >= opp.pa && g.cash >= opp.cout ? 1 : 0.4 }}
                onClick={() => actions.opportunite(true)}
              >
                ACCEPTER
              </button>
            </div>
          </div>
        )}

        <div style={S.h2}>COLLECTION</div>
        {g.modeles.length === 0 && (
          <div style={{ ...S.panel, ...S.steel }}>Aucun modèle. Lancez une R&D — développer prend du temps.</div>
        )}
        {g.modeles.map((m, i) => (
          <div key={i} style={{ ...S.panel, opacity: m.statut === "dev" ? 0.75 : 1 }}>
            <div>
              <span style={S.gold}>{m.nom}</span>{" "}
              <span style={S.steel}>
                — {MOUVEMENTS[m.mvt].nom} · {STYLES[m.style].nom} · {MATERIAUX[m.materiau].nom} ·{" "}
                {SEGMENTS[m.seg].nom} · qualité {m.qual}/10 · {heuresParPiece(m.mvt)} h/pièce
              </span>
            </div>
            {m.statut === "dev" ? (
              <div style={{ marginTop: 6 }}>
                <span style={S.gold}>
                  ⚙ En développement — {m.devRestant} trimestre{m.devRestant > 1 ? "s" : ""} restant
                  {m.devRestant > 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                <label style={S.steel}>
                  Prix
                  <br />
                  <input
                    type="number"
                    inputMode="numeric"
                    style={S.num}
                    value={m.prix}
                    onChange={(e) => actions.setPrix(i, e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                  />
                </label>
                <label style={S.steel}>
                  Prod./trim.
                  <br />
                  <input
                    type="number"
                    inputMode="numeric"
                    style={S.num}
                    value={m.prod}
                    onChange={(e) => actions.setProd(i, e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                  />
                </label>
                <div style={S.steel}>
                  Heures
                  <br />
                  <span style={{ color: "#EDE6D6", fontSize: 20 }}>{fmtH(heuresModele(m))}</span>
                </div>
                <div style={S.steel}>
                  Stock
                  <br />
                  <span style={{ color: "#EDE6D6", fontSize: 20 }}>{m.stock}</span>
                </div>
                <div style={S.steel}>
                  Coût/unité
                  <br />
                  <span style={{ color: "#EDE6D6", fontSize: 20 }}>{fmtCHF(coutU(m))}</span>
                </div>
                <div style={S.steel}>
                  Fraîcheur
                  <br />
                  <span style={{ color: fraicheur(m.age) < 0.6 ? "#D06050" : "#EDE6D6", fontSize: 20 }}>
                    {Math.round(fraicheur(m.age) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        <div style={S.h2}>ACTIONS — {g.pa} PA restants</div>
        <div style={{ ...S.steel, marginBottom: 8 }}>
          Les PA non dépensés = travail à l'établi : savoir-faire +1 et coûts fixes −4'000 chacun.
        </div>

        <div style={S.h3}>PRODUIT</div>
        {!showNouveauModele && (
          <button style={S.action(g.pa >= 2)} onClick={() => g.pa >= 2 && setShowNouveauModele(true)}>
            ⌚ Nouvelle R&D <span style={S.steel}>(2 PA + coût, 1 à 6 trim.)</span>
          </button>
        )}
        {showNouveauModele && (
          <div style={{ ...S.panel, borderColor: "#C9A227" }}>
            <input
              style={{ ...S.input, marginBottom: 8 }}
              value={nm.nom}
              onChange={(e) => setNm({ ...nm, nom: e.target.value })}
              placeholder="Nom du modèle"
            />
            {Object.entries(MOUVEMENTS).map(([k, mv]) => {
              const bloque = k === "manufacture" && profil !== "ingenieur";
              return (
                <button
                  key={k}
                  style={{ ...S.btn(nm.mvt === k), opacity: bloque ? 0.4 : 1 }}
                  disabled={bloque}
                  onClick={() => setNm({ ...nm, mvt: k })}
                >
                  <span style={S.gold}>{mv.nom}</span>{" "}
                  <span style={S.steel}>
                    — {fmtCHF(coutRD(k, profil))}, {dureeDev(k, profil)} trim., {mv.heures} h/pièce{" "}
                    {bloque ? "⚙ ingénieur requis" : ""}
                  </span>
                </button>
              );
            })}

            <div style={S.h3}>STYLE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {Object.entries(STYLES).map(([k, st]) => (
                <button key={k} style={{ ...S.btn(nm.style === k), marginBottom: 0 }} onClick={() => setNm({ ...nm, style: k })}>
                  {st.nom}
                </button>
              ))}
            </div>

            <div style={S.h3}>MATÉRIAU</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {Object.entries(MATERIAUX).map(([k, mt]) => (
                <button key={k} style={{ ...S.btn(nm.mat === k), marginBottom: 0 }} onClick={() => setNm({ ...nm, mat: k })}>
                  {mt.nom}
                  {mt.cout > 0 ? " (+" + mt.cout + ")" : ""}
                </button>
              ))}
            </div>

            <div style={S.h3}>SEGMENT</div>
            {Object.entries(SEGMENTS).map(([k, sg]) => (
              <button
                key={k}
                style={S.btn(nm.seg === k)}
                onClick={() => setNm({ ...nm, seg: k, prix: Math.round(sg.ideal * MATERIAUX[nm.mat].idealMult) })}
              >
                <span style={S.gold}>{sg.nom}</span> <span style={S.steel}>— {sg.desc}</span>
              </button>
            ))}

            <label style={{ ...S.steel, display: "block", marginTop: 8 }}>
              Prix de vente
              <br />
              <input
                type="number"
                inputMode="numeric"
                style={S.num}
                value={nm.prix}
                onChange={(e) => setNm({ ...nm, prix: e.target.value === "" ? "" : parseInt(e.target.value) || 0 })}
              />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.cta, background: "#2A3A2C", color: "#EDE6D6" }} onClick={() => setShowNouveauModele(false)}>
                ANNULER
              </button>
              <button style={{ ...S.cta, opacity: g.cash >= coutRD(nm.mvt, profil) ? 1 : 0.4 }} onClick={lancerRD}>
                LANCER LA R&D
              </button>
            </div>
          </div>
        )}

        <button
          style={S.action(g.pa >= 1 && actifs.length > 0)}
          onClick={() => actifs.length > 0 && g.pa >= 1 && setPicker(picker === "facelift" ? null : "facelift")}
        >
          ✨ Facelift d'un modèle <span style={S.steel}>(1 PA + 40% du coût R&D) — restaure la fraîcheur</span>
        </button>
        <button
          style={S.action(g.pa >= 1 && actifs.length > 0)}
          onClick={() => actifs.length > 0 && g.pa >= 1 && setPicker(picker === "edition" ? null : "edition")}
        >
          💎 Édition limitée ×50 <span style={S.steel}>(1 PA + prod.) — désirabilité +8, crédibilité −1</span>
        </button>
        {picker && (
          <div style={{ ...S.panel, borderColor: "#C9A227" }}>
            <span style={S.steel}>Choisir le modèle :</span>
            {g.modeles.map(
              (m, i) =>
                m.statut === "actif" && (
                  <button
                    key={i}
                    style={S.btn(false)}
                    onClick={() => {
                      picker === "facelift" ? actions.facelift(i) : actions.edition(i);
                      setPicker(null);
                    }}
                  >
                    {m.nom}{" "}
                    <span style={S.steel}>
                      {picker === "facelift"
                        ? "— " + fmtCHF(Math.round(coutRD(m.mvt, profil) * 0.4))
                        : "— " + fmtCHF(50 * coutU(m)) + " de production"}
                    </span>
                  </button>
                )
            )}
            <button style={S.ghost} onClick={() => setPicker(null)}>
              Annuler
            </button>
          </div>
        )}
        <button style={S.action(g.pa >= 1)} onClick={() => actions.action("embauche")}>
          👤 Embaucher un horloger{" "}
          <span style={S.steel}>(1 PA) — savoir-faire +4, coûts fixes +{fmtCHF(EMPLOYE_FIXES)}/trim</span>
        </button>
        <button style={S.action(g.pa >= 1 && g.cash >= ATELIER_COUT)} onClick={() => actions.action("atelier")}>
          🏭 Agrandir l'atelier{" "}
          <span style={S.steel}>
            (1 PA, {fmtCHF(ATELIER_COUT)}) — capacité +{ATELIER_HEURES} h/trim, fixes +{fmtCHF(ATELIER_FIXES)}/trim
          </span>
        </button>

        <div style={S.h3}>IMAGE</div>
        <button style={S.action(g.pa >= 1 && g.cash >= 15000)} onClick={() => actions.action("marketing")}>
          📣 Marketing <span style={S.steel}>(1 PA, 15'000) — notoriété +{gainMarketing(g, pays)}</span>
        </button>
        <button style={S.action(g.pa >= 1 && g.cash >= 30000)} onClick={() => actions.action("choc")}>
          💥 Campagne choc{" "}
          <span style={S.steel}>(1 PA, 30'000) — notoriété +{gainChoc(g, pays)}, crédibilité −2, désirabilité −1</span>
        </button>
        <button style={S.action(g.pa >= 1 && g.reseau >= 2)} onClick={() => actions.action("presse")}>
          📰 Relations presse <span style={S.steel}>(1 PA) — crédibilité +2</span>
        </button>
        <button style={S.action(g.pa >= 1 && g.cash >= 5000)} onClick={() => actions.action("etude")}>
          🔍 Étude de marché <span style={S.steel}>(1 PA, 5'000) — révèle la demande estimée</span>
        </button>

        <div style={S.h3}>COMMERCE</div>
        <button style={S.action(g.pa >= 1 && g.cash >= 12000)} onClick={() => actions.action("distribution")}>
          🏪 Développer la distribution <span style={S.steel}>(1 PA, 12'000) — réseau +{gainDist(g)}</span>
        </button>
        <button
          style={S.action(g.pa >= 1 && g.modeles.some((m) => m.stock > 0 && m.statut === "actif"))}
          onClick={() => actions.action("soldes")}
        >
          🏷 Soldes <span style={S.steel}>(1 PA) — tout le stock à −35%, désirabilité −8</span>
        </button>
        {!g.kickstarterFait && (
          <button style={S.action(g.pa >= 2 && g.modeles.length > 0)} onClick={() => actions.action("kickstarter")}>
            🚀 Kickstarter <span style={S.steel}>(2 PA, une fois) — cash + notoriété + désirabilité</span>
          </button>
        )}

        <div style={S.h3}>FINANCE</div>
        <button style={S.action(g.pa >= 1)} onClick={() => actions.action("emprunt")}>
          🏦 Emprunt <span style={S.steel}>(1 PA) — +150'000, taux {profil === "financier" ? "4" : "6"}%</span>
        </button>
        {g.dette > 0 && (
          <button style={S.action(g.cash > 0)} onClick={() => actions.action("rembourser")}>
            💰 Rembourser <span style={S.steel}>(0 PA) — jusqu'à 50'000 de dette</span>
          </button>
        )}

        <button style={S.cta} onClick={actions.finTrimestre}>
          FIN DU TRIMESTRE ▸
        </button>
        <button style={S.ghost} onClick={actions.passerAnnee}>
          ▸▸ Passer à la fin de l'année (sans autres actions)
        </button>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.ghost} onClick={() => setShowJournal(!showJournal)}>
            {showJournal ? "Masquer le journal" : "Journal"}
          </button>
          <button style={S.ghost} onClick={actions.sauvegarder}>
            Sauvegarder
          </button>
        </div>
        {saveMsg && <div style={{ ...S.steel, textAlign: "center", marginTop: 6 }}>{saveMsg}</div>}

        {showJournal && (
          <div style={{ ...S.panel, marginTop: 10 }}>
            {g.journal.length === 0 && <span style={S.steel}>Aucun trimestre passé.</span>}
            {g.journal
              .slice()
              .reverse()
              .map((j, i) => (
                <div key={i} style={{ padding: "4px 0", borderBottom: "1px solid #1E2A20", fontSize: 17 }}>
                  <span style={S.steel}>
                    T{j.t} {j.annee}
                  </span>{" "}
                  · CA {fmtCHF(j.revenus)} ·
                  <span style={j.resultat >= 0 ? S.green : S.red}>
                    {" "}
                    {j.resultat >= 0 ? "+" : ""}
                    {fmtCHF(j.resultat)}
                  </span>
                  <span style={S.steel}> · Caisse {fmtCHF(j.cash)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
