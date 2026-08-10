import { useState } from "react";
import { S } from "../styles.js";
import Jauge from "./Jauge.jsx";
import {
  MATERIAUX, MOUVEMENTS, SEGMENTS, STYLES, COMPLICATIONS, EMPLOYES, FINITION,
  ATELIER_COUT, ATELIER_HEURES, ATELIER_FIXES, COUTS_H, HEURES_FONDATEUR,
  HEURES_EMPLOYE, COMPL_NIVEAU_REQUIS,
} from "../data/config.js";
import { OPPORTUNITES } from "../data/evenements.js";
import {
  chargeHeures, complicationDe, complicationsDispo, complicationsRecherchables,
  complicationsVerrouillees, coutRD, coutUnitaire, dureeDev, fmtCHF, fmtH, fraicheur,
  gainChoc, gainDist, gainMarketing, heuresEmployes, heuresModele, heuresParPiece,
  heuresProductionDispo, heuresRD, nbEmployes, niveauPourModele, paletteComplication,
} from "../engine/formules.js";

export default function Jeu({ g, ctx, marque, saveMsg, actions }) {
  const { pays, profil } = ctx;

  const [showJournal, setShowJournal] = useState(false);
  const [picker, setPicker] = useState(null); // "facelift" | "edition"
  const [panneau, setPanneau] = useState(null); // "rd" | "complication" | "embauche"
  const [nm, setNm] = useState({
    mvt: "ebauche", seg: "lifestyle", style: "sport", mat: "acier",
    compl: "aucune", finition: false, prix: 700, nom: "",
  });

  const opp = g.opportunite ? OPPORTUNITES.find((o) => o.id === g.opportunite) : null;
  const actifs = g.modeles.filter((m) => m.statut === "actif");
  const charge = chargeHeures(g.modeles);
  const dispoProd = heuresProductionDispo(g);
  const mainOeuvreEquipe = heuresEmployes(g.employes);
  // Main-d'œuvre payée mais que les postes d'atelier ne peuvent pas absorber.
  const heuresPerdues = Math.max(0, g.heures + mainOeuvreEquipe - g.capacite);
  // Ce qu'un employé de production ajouterait vraiment, postes compris.
  const postesLibres = Math.max(0, g.capacite - g.heures - mainOeuvreEquipe);
  const gainEmbauche = Math.min(HEURES_EMPLOYE, postesLibres);
  const coutU = (m) => coutUnitaire(m, { pays, savoir: g.savoir, employes: g.employes });

  // Une action est jouable si le fondateur a les heures et la caisse le budget.
  // Sans coût en CHF, elle reste jouable à découvert (cf. App.jsx).
  const ok = (heures, cash = 0) => g.heures >= heures && (cash <= 0 || g.cash >= cash);
  const heuresRDModele = heuresRD(COUTS_H.rd, g.employes);
  const recherchables = complicationsRecherchables(g, profil);
  const verrouillees = complicationsVerrouillees(g);
  const complsModele = complicationsDispo(g, nm.mvt);
  const materiauxOk = Object.keys(MATERIAUX).filter((k) => !MATERIAUX[k].expert || g.employes.materiaux > 0);
  const decorateurDispo = g.employes.decorateur > 0;

  function lancerRD() {
    actions.creerModele(nm);
    setPanneau(null);
    setNm({ ...nm, nom: "" });
  }

  // Le mouvement peut invalider la complication choisie (tourbillon = manufacture).
  function choisirMvt(k) {
    const compls = complicationsDispo(g, k);
    setNm({ ...nm, mvt: k, compl: compls.includes(nm.compl) ? nm.compl : "aucune" });
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

        {/* Le budget d'heures est la ressource centrale : il passe avant les jauges. */}
        <div style={{ ...S.panel, borderColor: "#C9A227" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={S.jauge}>Vos heures ce trimestre</span>
            <span style={{ ...S.gold, fontSize: 24 }}>
              {g.heures}
              <span style={S.steel}>/{HEURES_FONDATEUR} h</span>
            </span>
          </div>
          <div style={{ background: "#0E140F", border: "1px solid #2A3A2C", height: 10, marginTop: 6 }}>
            <div style={{ background: "#C9A227", height: "100%", width: (100 * g.heures) / HEURES_FONDATEUR + "%" }} />
          </div>
          <div style={{ ...S.steel, marginTop: 6 }}>
            Les heures que vous ne dépensez pas partent à l'établi : elles produisent des montres et font
            monter le savoir-faire.
          </div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <span style={S.steel}>
              Atelier : <span style={{ color: charge > dispoProd ? "#D06050" : "#EDE6D6" }}>{fmtH(charge)}</span> planifiées
              sur {fmtH(dispoProd)} disponibles
            </span>
            <span style={S.steel}>
              (vous {fmtH(g.heures)} + équipe {fmtH(mainOeuvreEquipe)}, postes {fmtH(g.capacite)})
            </span>
          </div>
          {heuresPerdues > 0 && (
            <div style={{ ...S.steel, color: "#D06050", marginTop: 6 }}>
              ⚠ Postes saturés : {fmtH(heuresPerdues)} de main-d'œuvre restent inemployées. Agrandissez l'atelier
              pour qu'elles servent à quelque chose.
            </div>
          )}
        </div>

        <div style={{ ...S.panel, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <Jauge label="Notoriété" val={g.noto} />
          <Jauge label="Crédibilité" val={g.cred} />
          <Jauge label="Désirabilité" val={g.des} />
          <Jauge label="Savoir-faire" val={g.savoir} />
          <Jauge label="Distribution" val={g.dist} />
          <div>
            <span style={S.jauge}>Équipe</span>
            <br />
            <span style={{ fontSize: 21 }}>{nbEmployes(g.employes)}</span>
            <span style={S.steel}> pers.</span>
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
              {fmtH(opp.heures)}
              {opp.cout > 0 ? " + " + fmtCHF(opp.cout) : ""}
            </span>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button style={{ ...S.ghost, marginTop: 0 }} onClick={() => actions.opportunite(false)}>
                Décliner
              </button>
              <button
                style={{ ...S.cta, marginTop: 0, opacity: ok(opp.heures, opp.cout) ? 1 : 0.4 }}
                onClick={() => actions.opportunite(true)}
              >
                ACCEPTER
              </button>
            </div>
          </div>
        )}

        {g.recherche && (
          <div style={{ ...S.panel, borderColor: "#4A7C9E" }}>
            <span style={S.blue}>
              ⚙ Recherche en cours : {COMPLICATIONS[g.recherche.id].nom} niveau {g.recherche.niveau} — «{" "}
              {paletteComplication(g.recherche.id, g.recherche.niveau).nom} »
            </span>
            <br />
            <span style={S.steel}>
              {g.recherche.restant} trimestre{g.recherche.restant > 1 ? "s" : ""} restant
              {g.recherche.restant > 1 ? "s" : ""}
            </span>
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
                — {MOUVEMENTS[m.mvt].nom} · {complicationDe(m).nom} · {STYLES[m.style].nom} ·{" "}
                {MATERIAUX[m.materiau].nom}
                {m.finition ? " · finition maison" : ""} · {SEGMENTS[m.seg].nom} · qualité {m.qual}/10 ·{" "}
                {heuresParPiece(m)} h/pièce
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

        <div style={S.h2}>ACTIONS — {fmtH(g.heures)} disponibles</div>

        <div style={S.h3}>PRODUIT</div>
        {panneau !== "rd" && (
          <button style={S.action(ok(heuresRDModele))} onClick={() => ok(heuresRDModele) && setPanneau("rd")}>
            ⌚ Nouvelle R&D <span style={S.steel}>({fmtH(heuresRDModele)} + coût, 1 à 6 trim.)</span>
          </button>
        )}
        {panneau === "rd" && (
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
                  onClick={() => choisirMvt(k)}
                >
                  <span style={S.gold}>{mv.nom}</span>{" "}
                  <span style={S.steel}>
                    — {fmtCHF(coutRD(k, profil))}, {dureeDev(k, profil, g.employes)} trim., {mv.heures} h/pièce{" "}
                    {bloque ? "⚙ ingénieur requis" : ""}
                  </span>
                </button>
              );
            })}

            <div style={S.h3}>COMPLICATION</div>
            {complsModele.map((k) => {
              const niveau = niveauPourModele(g, k);
              const pal = paletteComplication(k, niveau);
              return (
                <button key={k} style={S.btn(nm.compl === k)} onClick={() => setNm({ ...nm, compl: k })}>
                  <span style={S.gold}>{pal.nom}</span>
                  {k !== "aucune" && <span style={S.steel}> (niveau {niveau})</span>}
                  {pal.heures > 0 && (
                    <span style={S.steel}>
                      {" "}
                      — +{pal.heures} h/pièce, qualité +{pal.qual}, prix acceptable ×{pal.prixMult}
                    </span>
                  )}
                </button>
              );
            })}
            <div style={{ ...S.steel, marginTop: 6 }}>
              Un modèle fige le niveau du jour : monter la complication après coup ne le met pas à jour.
              {recherchables.length > 0 ? " Les paliers suivants se recherchent dans ATELIER & ÉQUIPE." : ""}
            </div>

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
              {materiauxOk.map((k) => (
                <button key={k} style={{ ...S.btn(nm.mat === k), marginBottom: 0 }} onClick={() => setNm({ ...nm, mat: k })}>
                  {MATERIAUX[k].nom}
                  {MATERIAUX[k].cout > 0 ? " (+" + MATERIAUX[k].cout + ")" : ""}
                </button>
              ))}
            </div>
            {g.employes.materiaux === 0 && (
              <div style={{ ...S.steel, marginTop: 6 }}>
                Bronze, titane, céramique et or demandent un expert matériaux dans l'équipe.
              </div>
            )}

            <div style={S.h3}>FINITION</div>
            {decorateurDispo ? (
              <button style={S.btn(nm.finition)} onClick={() => setNm({ ...nm, finition: !nm.finition })}>
                <span style={S.gold}>{nm.finition ? "✓ Finition maison" : "Finition maison"}</span>{" "}
                <span style={S.steel}>
                  — +{FINITION.heures} h/pièce, +{FINITION.cout} CHF/pièce, qualité +{FINITION.qual}, entretient la
                  désirabilité
                </span>
              </button>
            ) : (
              <div style={{ ...S.panel, ...S.steel, marginBottom: 8 }}>
                Il faut un décorateur dans l'équipe pour proposer une finition maison.
              </div>
            )}

            <div style={S.h3}>SEGMENT</div>
            {Object.entries(SEGMENTS).map(([k, sg]) => (
              <button
                key={k}
                style={S.btn(nm.seg === k)}
                onClick={() =>
                  setNm({
                    ...nm, seg: k,
                    prix: Math.round(sg.ideal * MATERIAUX[nm.mat].idealMult * COMPLICATIONS[nm.compl].prixMult),
                  })
                }
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
              <button style={{ ...S.cta, background: "#2A3A2C", color: "#EDE6D6" }} onClick={() => setPanneau(null)}>
                ANNULER
              </button>
              <button style={{ ...S.cta, opacity: ok(heuresRDModele, coutRD(nm.mvt, profil)) ? 1 : 0.4 }} onClick={lancerRD}>
                LANCER LA R&D
              </button>
            </div>
          </div>
        )}

        <button
          style={S.action(ok(COUTS_H.facelift) && actifs.length > 0)}
          onClick={() => actifs.length > 0 && ok(COUTS_H.facelift) && setPicker(picker === "facelift" ? null : "facelift")}
        >
          ✨ Facelift d'un modèle{" "}
          <span style={S.steel}>({fmtH(COUTS_H.facelift)} + 40% du coût R&D) — restaure la fraîcheur</span>
        </button>
        <button
          style={S.action(ok(COUTS_H.edition) && actifs.length > 0)}
          onClick={() => actifs.length > 0 && ok(COUTS_H.edition) && setPicker(picker === "edition" ? null : "edition")}
        >
          💎 Édition limitée ×50{" "}
          <span style={S.steel}>({fmtH(COUTS_H.edition)} + prod.) — désirabilité +8, crédibilité −1</span>
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

        <div style={S.h3}>ATELIER & ÉQUIPE</div>
        <div style={{ ...S.panel, ...S.steel }}>
          {nbEmployes(g.employes) === 0
            ? "Vous êtes seul·e à l'établi. Chaque embauche ajoute 450 h de spécialité par trimestre."
            : Object.entries(g.employes)
                .filter(([, n]) => n > 0)
                .map(([k, n]) => EMPLOYES[k].nom + " ×" + n)
                .join(" · ")}
        </div>

        {panneau !== "embauche" && (
          <button style={S.action(ok(COUTS_H.embauche))} onClick={() => ok(COUTS_H.embauche) && setPanneau("embauche")}>
            👥 Embaucher{" "}
            <span style={S.steel}>({fmtH(COUTS_H.embauche)}) — {fmtH(HEURES_EMPLOYE)} de spécialité par trimestre</span>
          </button>
        )}
        {panneau === "embauche" && (
          <div style={{ ...S.panel, borderColor: "#C9A227" }}>
            {gainEmbauche < HEURES_EMPLOYE && (
              <div style={{ ...S.panel, borderColor: "#D06050", marginBottom: 8 }}>
                <span style={S.red}>
                  ⚠ Vos postes d'atelier sont presque pleins : un employé de production n'ajouterait que{" "}
                  {fmtH(gainEmbauche)} utilisables sur {fmtH(HEURES_EMPLOYE)}.
                </span>
                <br />
                <span style={S.steel}>
                  Agrandissez l'atelier ({fmtCHF(ATELIER_COUT)}, +{ATELIER_HEURES} h de postes) avant d'embaucher,
                  ou vous paierez un salaire pour rien.
                </span>
              </div>
            )}
            {Object.entries(EMPLOYES).map(([k, e]) => (
              <button
                key={k}
                style={S.btn(false)}
                onClick={() => {
                  actions.embaucher(k);
                  setPanneau(null);
                }}
              >
                {e.icon} <span style={S.gold}>{e.nom}</span>{" "}
                <span style={S.steel}>— {fmtCHF(e.fixes)}/trim · {e.desc}</span>
                {e.production && (
                  <>
                    <br />
                    <span style={{ ...S.steel, color: gainEmbauche > 0 ? "#8FBF7F" : "#D06050" }}>
                      {gainEmbauche > 0
                        ? "→ " + fmtH(gainEmbauche) + " réellement utilisables avec vos postes actuels"
                        : "→ 0 h utilisable : vos postes d'atelier sont saturés"}
                    </span>
                  </>
                )}
              </button>
            ))}
            <button style={S.ghost} onClick={() => setPanneau(null)}>
              Annuler
            </button>
          </div>
        )}

        {panneau !== "complication" && recherchables.length > 0 && (
          <button
            style={S.action(!g.recherche)}
            onClick={() => !g.recherche && setPanneau("complication")}
          >
            🔩 Rechercher une complication{" "}
            <span style={S.steel}>
              {g.recherche ? "— une recherche est déjà en cours" : "— arbre Date → Chrono → GMT → Lune → Réserve → Tourbillon"}
            </span>
          </button>
        )}
        {panneau === "complication" && (
          <div style={{ ...S.panel, borderColor: "#C9A227" }}>
            <div style={{ ...S.steel, marginBottom: 8 }}>
              Chaque complication a trois paliers. Il faut la maîtriser au niveau {COMPL_NIVEAU_REQUIS} pour
              ouvrir la suivante de l'arbre.
            </div>
            {recherchables.map((c) => {
              const h = heuresRD(c.rdHeures, g.employes);
              const jouable = !c.bloque && ok(h, c.rd);
              return (
                <button
                  key={c.id}
                  style={{ ...S.btn(false), opacity: jouable ? 1 : 0.45 }}
                  disabled={!jouable}
                  onClick={() => {
                    actions.rechercherComplication(c);
                    setPanneau(null);
                  }}
                >
                  <span style={S.gold}>{c.famille}</span>{" "}
                  <span style={S.steel}>niveau {c.niveau}/3 — « {c.nom} »</span>
                  <br />
                  <span style={S.steel}>
                    {fmtH(h)} + {fmtCHF(c.rd)}, {c.dev} trim. · +{c.heures} h/pièce, qualité +{c.qual}, prix
                    acceptable ×{c.prixMult}
                    {c.bloque ? " · ⚙ ingénieur requis" : ""}
                    {c.manufacture ? " · manufacture requise" : ""}
                  </span>
                </button>
              );
            })}
            {verrouillees.length > 0 && (
              <div style={{ ...S.steel, marginTop: 6 }}>
                Encore fermé : {verrouillees.map((v) => v.famille + " (demande " + v.manque + ")").join(" · ")}.
              </div>
            )}
            <button style={S.ghost} onClick={() => setPanneau(null)}>
              Annuler
            </button>
          </div>
        )}

        <button style={S.action(ok(COUTS_H.atelier, ATELIER_COUT))} onClick={() => actions.action("atelier")}>
          🏭 Agrandir l'atelier{" "}
          <span style={S.steel}>
            ({fmtH(COUTS_H.atelier)}, {fmtCHF(ATELIER_COUT)}) — +{ATELIER_HEURES} h de postes, fixes +
            {fmtCHF(ATELIER_FIXES)}/trim
          </span>
        </button>

        <div style={S.h3}>IMAGE</div>
        <button style={S.action(ok(COUTS_H.marketing, 15000))} onClick={() => actions.action("marketing")}>
          📣 Marketing{" "}
          <span style={S.steel}>({fmtH(COUTS_H.marketing)}, 15'000) — notoriété +{gainMarketing(g, pays)}</span>
        </button>
        <button style={S.action(ok(COUTS_H.choc, 30000))} onClick={() => actions.action("choc")}>
          💥 Campagne choc{" "}
          <span style={S.steel}>
            ({fmtH(COUTS_H.choc)}, 30'000) — notoriété +{gainChoc(g, pays)}, crédibilité −2, désirabilité −1
          </span>
        </button>
        <button style={S.action(ok(COUTS_H.presse))} onClick={() => actions.action("presse")}>
          📰 Relations presse <span style={S.steel}>({fmtH(COUTS_H.presse)}) — crédibilité +2</span>
        </button>
        <button style={S.action(ok(COUTS_H.etude, 5000))} onClick={() => actions.action("etude")}>
          🔍 Étude de marché{" "}
          <span style={S.steel}>({fmtH(COUTS_H.etude)}, 5'000) — révèle la demande estimée</span>
        </button>

        <div style={S.h3}>COMMERCE</div>
        <button style={S.action(ok(COUTS_H.distribution, 12000))} onClick={() => actions.action("distribution")}>
          🏪 Développer la distribution{" "}
          <span style={S.steel}>({fmtH(COUTS_H.distribution)}, 12'000) — réseau +{gainDist(g)}</span>
        </button>
        <button
          style={S.action(ok(COUTS_H.soldes) && g.modeles.some((m) => m.stock > 0 && m.statut === "actif"))}
          onClick={() => actions.action("soldes")}
        >
          🏷 Soldes <span style={S.steel}>({fmtH(COUTS_H.soldes)}) — tout le stock à −35%, désirabilité −8</span>
        </button>
        {!g.kickstarterFait && (
          <button
            style={S.action(ok(COUTS_H.kickstarter) && g.modeles.length > 0)}
            onClick={() => actions.action("kickstarter")}
          >
            🚀 Kickstarter{" "}
            <span style={S.steel}>({fmtH(COUTS_H.kickstarter)}, une fois) — cash + notoriété + désirabilité</span>
          </button>
        )}

        <div style={S.h3}>FINANCE</div>
        <button style={S.action(ok(COUTS_H.emprunt))} onClick={() => actions.action("emprunt")}>
          🏦 Emprunt{" "}
          <span style={S.steel}>
            ({fmtH(COUTS_H.emprunt)}) — +150'000, taux {profil === "financier" ? "4" : "6"}%
          </span>
        </button>
        {g.dette > 0 && (
          <button style={S.action(g.cash > 0)} onClick={() => actions.action("rembourser")}>
            💰 Rembourser <span style={S.steel}>(0 h) — jusqu'à 50'000 de dette</span>
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
