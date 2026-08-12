import { useEffect, useRef, useState } from "react";
import { S } from "../styles.js";
import Jauge from "./Jauge.jsx";
import BarreStatut from "./BarreStatut.jsx";
import {
  MATERIAUX, MOUVEMENTS, SEGMENTS, STYLES, COMPLICATIONS, EMPLOYES, FINITION, CANAUX,
  ATELIERS,
  COUTS_CHF, COUTS_H, HEURES_FONDATEUR,
  HEURES_EMPLOYE, COMPL_NIVEAU_REQUIS, COMPLICATIONS_MAX, ENCADREMENT_PAR_CHEF,
} from "../data/config.js";
import { OPPORTUNITES } from "../data/evenements.js";
import {
  canauxOuvrables, chargeHeures, complicationsDispo, complicationsRecherchables,
  complicationsVerrouillees, coutFacelift, coutRD, coutUnitaire, dureeDev, encadrement,
  fmtArgent, fmtH, fmtNb, fmtPct, fraicheur, gainChoc, gainMarketing, heuresEmployes,
  heuresModele, heuresParPiece, heuresProductionDispo, heuresRD, indemnite, margeMoyenne,
  materiauxRecherchables, nbEmployes, nbProduction, nomComplications, num, paletteComplication,
  porteeTotale, qualiteNouveau, tresorerie, conseilFinancable, detailFixes, coutsFixes,
  MARGE_CONSEIL_TRIMESTRES,
} from "../engine/formules.js";
import { nomDeModele } from "../data/noms.js";
import { ETIQUETTE } from "../version.js";

export default function Jeu({ g, ctx, marque, saveMsg, autosaveAt, actions }) {
  const { pays, profil } = ctx;

  const [showJournal, setShowJournal] = useState(false);
  const [confirmeAbandon, setConfirmeAbandon] = useState(false);
  const [picker, setPicker] = useState(null); // "facelift" | "edition"
  const [panneau, setPanneau] = useState(null); // "rd" | "recherche" | "embauche" | "equipe" | "canaux"
  const [nm, setNm] = useState({
    mvt: "ebauche", seg: "lifestyle", style: "sport", mat: "acier",
    compls: [], finition: false, nom: nomDeModele(),
  });

  // Retour visuel « fait ✓ » : le testeur mobile ne savait pas si son clic avait
  // pris effet tout de suite ou serait appliqué à la fin du trimestre.
  const [faites, setFaites] = useState({});
  const tour = g.annee + "-" + g.t;
  const tourPrecedent = useRef(tour);
  useEffect(() => {
    if (tourPrecedent.current !== tour) {
      tourPrecedent.current = tour;
      setFaites({});
    }
  }, [tour]);

  const marquer = (cle) => setFaites((f) => ({ ...f, [cle]: (f[cle] || 0) + 1 }));
  // Identifiants normalisés (« atelier-petit » → « atelier ») pour le récit.
  const actionsPrises = () => [...new Set(Object.keys(faites).map((k) => k.split("-")[0]))];
  const fait = (cle) =>
    faites[cle] ? (
      <span style={S.green}> ✓ fait{faites[cle] > 1 ? " ×" + faites[cle] : ""}</span>
    ) : null;

  // Une action immédiate : on la joue et on la marque d'un coup.
  const jouer = (cle, fn) => () => {
    fn();
    marquer(cle);
  };

  const opp = g.opportunite ? OPPORTUNITES.find((o) => o.id === g.opportunite) : null;
  const actifs = g.modeles.filter((m) => m.statut === "actif");
  const charge = chargeHeures(g.modeles);
  const dispoProd = heuresProductionDispo(g);
  const mainOeuvreEquipe = heuresEmployes(g.employes);
  const enc = encadrement(g.employes);
  const heuresPerdues = Math.max(0, g.heures + mainOeuvreEquipe * enc.efficacite - g.capacite);
  const postesLibres = Math.max(0, g.capacite - g.heures - mainOeuvreEquipe * enc.efficacite);
  const gainEmbauche = Math.round(Math.min(HEURES_EMPLOYE * enc.efficacite, postesLibres));
  const coutU = (m) => coutUnitaire(m, { pays, savoir: g.savoir, employes: g.employes });

  const ok = (heures, cash = 0) => g.heures >= heures && (cash <= 0 || g.cash >= cash);
  const heuresRDModele = heuresRD(COUTS_H.rd, g.employes);
  const recherchables = [...complicationsRecherchables(g, profil), ...materiauxRecherchables(g)];
  const verrouillees = complicationsVerrouillees(g);
  const complsModele = complicationsDispo(g, nm.mvt);
  const materiauxOk = Object.keys(MATERIAUX).filter((k) => g.materiaux[k]);
  const canaux = canauxOuvrables(g);
  const portee = porteeTotale(g.canaux);
  const marge = margeMoyenne(g.canaux);
  const tres = tresorerie(g);
  const libres = dispoProd - charge;
  const fixes = coutsFixes(g);
  // Un conseil ne pousse à une dépense que si le joueur garde de quoi tenir.
  const peut = (montant) => conseilFinancable(g, montant);
  const [voirFixes, setVoirFixes] = useState(false);
  const sansProduction = actifs.filter((m) => num(m.prod) <= 0);

  // Aperçu du coût de fabrication pendant la conception : c'est ce qui doit
  // guider le joueur, pas un prix suggéré.
  const apercu = {
    // `seg` est indispensable : c'est la gamme qui porte les heures par pièce.
    mvt: nm.mvt, seg: nm.seg, materiau: nm.mat, finition: nm.finition,
    compls: nm.compls.map((id) => ({ id, niveau: g.complications[id] || 1 })),
  };
  const coutApercu = coutUnitaire(apercu, { pays, savoir: g.savoir, employes: g.employes });
  const qualApercu = qualiteNouveau(nm.mvt, {
    pays, profil, savoir: g.savoir, compls: apercu.compls, finition: nm.finition,
  });

  function lancerRD() {
    actions.creerModele(nm);
    marquer("rd");
    setPanneau(null);
    // Le champ se remplit d'une nouvelle proposition pour le modèle suivant.
    setNm({ ...nm, nom: nomDeModele(), compls: [] });
  }

  function basculerCompl(id) {
    const dedans = nm.compls.includes(id);
    if (dedans) return setNm({ ...nm, compls: nm.compls.filter((x) => x !== id) });
    if (nm.compls.length >= COMPLICATIONS_MAX) return;
    setNm({ ...nm, compls: [...nm.compls, id] });
  }

  // Le mouvement peut invalider une complication déjà cochée (tourbillon = manufacture).
  function choisirMvt(k) {
    const permises = complicationsDispo(g, k);
    setNm({ ...nm, mvt: k, compls: nm.compls.filter((c) => permises.includes(c)) });
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
            <span style={{ ...(tres.basse ? S.red : S.gold), fontSize: 22 }}>{fmtArgent(g.cash)}</span>
          </div>
          <div>
            Dette
            <br />
            <span style={{ ...(g.dette > 0 ? S.red : S.steel), fontSize: 22 }}>{fmtArgent(g.dette)}</span>
          </div>
        </div>

        {/* Vague 1 de beta : trois testeurs sur trois sont morts sans voir venir
            la faillite. La mort reste possible, mais elle est annoncée. */}
        {tres.danger && (
          <div style={{ ...S.panel, borderColor: "#D06050", background: "#1E1413" }}>
            <span style={{ ...S.red, fontSize: 21 }}>
              ⚠ À ce rythme, faillite dans ~{tres.trimestres} trimestre{tres.trimestres > 1 ? "s" : ""}.
            </span>
            <br />
            <span style={S.steel}>
              Dernier trimestre : {fmtArgent(tres.dernier)}. Caisse projetée dans deux trimestres :{" "}
              <span style={S.red}>{fmtArgent(tres.projection)}</span>. Un emprunt, des soldes ou une baisse
              des coûts fixes peuvent encore renverser la tendance.
            </span>
          </div>
        )}
        {!tres.danger && tres.basse && (
          <div style={{ ...S.panel, borderColor: "#E0B44A" }}>
            <span style={{ color: "#E0B44A" }}>
              ⚠ Trésorerie basse — moins de deux trimestres de coûts fixes en caisse.
            </span>
          </div>
        )}

        {/* L'encadrement manquant se voit dès l'embauche, pas seulement dans le
            rapport de fin de trimestre. */}
        {enc.manque > 0 && (
          <div style={{ ...S.panel, borderColor: "#D06050" }}>
            <span style={S.red}>
              ⚠ Atelier sous-encadré — il manque {enc.manque} chef{enc.manque > 1 ? "s" : ""} d'atelier.
            </span>
            <br />
            <span style={S.steel}>
              {enc.chefs} chef{enc.chefs > 1 ? "s" : ""} pour {nbProduction(g.employes)} personnes en production.
              Vous en encadrez {enc.sansChef} vous-même, il faut un chef par tranche de {ENCADREMENT_PAR_CHEF}
              au-delà. L'équipe ne rend que {fmtPct(enc.efficacite)} de ses heures, soit{" "}
              {fmtH(Math.round(mainOeuvreEquipe * (1 - enc.efficacite)))} perdues ce trimestre.
            </span>
          </div>
        )}

        {/* Le budget d'heures est la ressource centrale : il passe avant les jauges. */}
        <div style={{ ...S.panel, borderColor: "#C9A227" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={S.jauge}>Heures libres ce trimestre</span>
            <span style={{ ...(libres < 0 ? S.red : S.gold), fontSize: 24 }}>
              {fmtH(libres)}
              <span style={S.steel}> sur {fmtH(dispoProd)}</span>
            </span>
          </div>
          <div style={{ background: "#0E140F", border: "1px solid #2A3A2C", height: 10, marginTop: 6 }}>
            <div
              style={{
                background: libres < 0 ? "#D06050" : "#C9A227",
                height: "100%",
                width: (dispoProd > 0 ? Math.max(0, Math.min(100, (100 * libres) / dispoProd)) : 0) + "%",
              }}
            />
          </div>
          {/* Le détail du calcul, pour que le solde soit vérifiable de tête. */}
          <div style={{ ...S.steel, marginTop: 8 }}>
            Vos heures {fmtH(g.heures)} sur {fmtH(HEURES_FONDATEUR)}
            {mainOeuvreEquipe > 0
              ? " + atelier " + fmtH(Math.round(mainOeuvreEquipe * enc.efficacite)) +
                (enc.efficacite < 1 ? " (encadrement " + fmtPct(enc.efficacite) + ")" : "")
              : ""}
            {dispoProd >= g.capacite ? " — plafonné par vos postes (" + fmtH(g.capacite) + ")" : ""}
            <br />− production planifiée {fmtH(charge)} = <span style={libres < 0 ? S.red : S.green}>{fmtH(libres)}</span> libres
          </div>
          <div style={{ ...S.steel, marginTop: 6 }}>
            Ce solde est le temps disponible pour produire : <span style={S.gold}>fixez la quantité sur chaque
            modèle</span> de votre collection. Ce qui reste part à l'établi en fin de trimestre et fait monter
            le savoir-faire. Attention, une action prise après avoir réglé la production mange les mêmes heures.
          </div>
          {heuresPerdues > 0 && (
            <div style={{ ...S.steel, color: "#D06050", marginTop: 6 }}>
              ⚠ Postes saturés : {fmtH(heuresPerdues)} de main-d'œuvre restent inemployées.{" "}
              {peut(ATELIERS.petit.cout)
                ? "Un poste de plus (" + fmtArgent(ATELIERS.petit.cout) + ") les rendrait utiles."
                : "Le plus petit agrandissement coûte " + fmtArgent(ATELIERS.petit.cout) +
                  " : hors de portée sans mettre la trésorerie en danger. Se séparer d'un collaborateur allègerait les coûts en attendant."}
            </div>
          )}

        </div>

        <div style={{ ...S.panel, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <Jauge label="Notoriété" val={g.noto} />
          <Jauge label="Crédibilité" val={g.cred} />
          <Jauge label="Désirabilité" val={g.des} />
          <Jauge label="Savoir-faire" val={g.savoir} />
          <div>
            <span style={S.jauge}>Portée</span>
            <br />
            <span style={{ fontSize: 21 }}>×{portee.toFixed(1)}</span>
            <br />
            <span style={S.steel}>marge {fmtPct(marge)}</span>
          </div>
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
              {opp.cout > 0 ? " + " + fmtArgent(opp.cout) : ""}
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
              ⚙ Recherche en cours :{" "}
              {g.recherche.type === "materiau"
                ? MATERIAUX[g.recherche.id].nom
                : COMPLICATIONS[g.recherche.id].nom +
                  " niveau " + g.recherche.niveau +
                  " — « " + paletteComplication(g.recherche.id, g.recherche.niveau).nom + " »"}
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
              <span style={S.gold}>{m.nom}</span>
              {m.statut === "actif" && num(m.prod) <= 0 && (
                <span style={S.red}> ⚠ production non réglée</span>
              )}{" "}
              <span style={S.steel}>
                — {MOUVEMENTS[m.mvt].nom} · {nomComplications(m)} · {STYLES[m.style].nom} ·{" "}
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
              <>
                <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <label style={S.steel}>
                    Votre prix
                    <br />
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="à fixer"
                      style={{ ...S.num, borderColor: num(m.prix) > 0 ? "#2A3A2C" : "#C9A227" }}
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
                    Coût/pièce
                    <br />
                    <span style={{ color: "#EDE6D6", fontSize: 20 }}>{fmtArgent(coutU(m))}</span>
                  </div>
                  <div style={S.steel}>
                    Heures
                    <br />
                    <span style={{ color: "#EDE6D6", fontSize: 20 }}>{fmtH(heuresModele(m))}</span>
                  </div>
                  <div style={S.steel}>
                    Stock
                    <br />
                    <span style={{ color: "#EDE6D6", fontSize: 20 }}>{fmtNb(m.stock)}</span>
                  </div>
                  <div style={S.steel}>
                    Fraîcheur
                    <br />
                    <span style={{ color: fraicheur(m.age) < 0.6 ? "#D06050" : "#EDE6D6", fontSize: 20 }}>
                      {Math.round(fraicheur(m.age) * 100)}%
                    </span>
                  </div>
                </div>
                <div style={{ ...S.steel, marginTop: 6 }}>
                  {num(m.prix) > 0 ? (
                    <>
                      Marge unitaire encaissée :{" "}
                      <span style={{ color: num(m.prix) * marge > coutU(m) ? "#8FBF7F" : "#D06050" }}>
                        {fmtArgent(num(m.prix) * marge - coutU(m))}
                      </span>{" "}
                      (prix × {fmtPct(marge)} de marge canal − coût)
                    </>
                  ) : (
                    <span style={S.gold}>Fixez un prix : sans prix, rien ne se vend.</span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        <div style={S.h2}>ACTIONS — {fmtH(g.heures)} disponibles</div>

        <div style={S.h3}>PRODUIT</div>
        {panneau !== "rd" && (
          <button style={S.action(ok(heuresRDModele))} onClick={() => ok(heuresRDModele) && setPanneau("rd")}>
            ⌚ Nouvelle R&D <span style={S.steel}>({fmtH(heuresRDModele)} + coût, 1 à 6 trim.)</span>{fait("rd")}
          </button>
        )}
        {panneau === "rd" && (
          <div style={{ ...S.panel, borderColor: "#C9A227" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input
                style={S.input}
                value={nm.nom}
                onChange={(e) => setNm({ ...nm, nom: e.target.value })}
                placeholder="Nom du modèle"
              />
              <button
                style={{ ...S.ghost, marginTop: 0, width: 52 }}
                title="Proposer un autre nom"
                onClick={() => setNm({ ...nm, nom: nomDeModele() })}
              >
                🎲
              </button>
            </div>
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
                    — {fmtArgent(coutRD(k, profil))}, {dureeDev(k, profil, g.employes)} trim., {mv.heures} h/pièce{" "}
                    {bloque ? "⚙ ingénieur requis" : ""}
                  </span>
                </button>
              );
            })}

            <div style={S.h3}>COMPLICATIONS — {nm.compls.length}/{COMPLICATIONS_MAX}</div>
            {complsModele.length === 0 && (
              <div style={{ ...S.steel, marginBottom: 8 }}>
                Aucune complication maîtrisée. Trois aiguilles pour l'instant — la recherche se lance dans
                ATELIER &amp; ÉQUIPE.
              </div>
            )}
            {complsModele.map((k) => {
              const niveau = g.complications[k];
              const pal = paletteComplication(k, niveau);
              const coche = nm.compls.includes(k);
              return (
                <button key={k} style={S.btn(coche)} onClick={() => basculerCompl(k)}>
                  <span style={S.gold}>{coche ? "✓ " : ""}{pal.nom}</span>
                  <span style={S.steel}> (niveau {niveau})</span>
                  <br />
                  <span style={S.steel}>
                    +{pal.heures} h/pièce, qualité +{pal.qual}, prix acceptable ×{pal.prixMult}
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
              {materiauxOk.map((k) => (
                <button key={k} style={{ ...S.btn(nm.mat === k), marginBottom: 0 }} onClick={() => setNm({ ...nm, mat: k })}>
                  {MATERIAUX[k].nom}
                  {MATERIAUX[k].cout > 0 ? " (+" + MATERIAUX[k].cout + ")" : ""}
                </button>
              ))}
            </div>
            {materiauxOk.length < Object.keys(MATERIAUX).length && (
              <div style={{ ...S.steel, marginTop: 6 }}>
                Les autres alliages demandent une recherche et un expert matériaux.
              </div>
            )}

            <div style={S.h3}>FINITION</div>
            {g.employes.decorateur > 0 ? (
              <button style={S.btn(nm.finition)} onClick={() => setNm({ ...nm, finition: !nm.finition })}>
                <span style={S.gold}>{nm.finition ? "✓ Finition maison" : "Finition maison"}</span>{" "}
                <span style={S.steel}>
                  — +{FINITION.heures} h/pièce, +{FINITION.cout} CHF/pièce, qualité +{FINITION.qual}
                </span>
              </button>
            ) : (
              <div style={{ ...S.panel, ...S.steel, marginBottom: 8 }}>
                Il faut un décorateur dans l'équipe pour proposer une finition maison.
              </div>
            )}

            <div style={S.h3}>SEGMENT VISÉ — c'est lui qui fixe le temps de fabrication</div>
            {Object.entries(SEGMENTS).map(([k, sg]) => {
              const facteur = sg.heures / SEGMENTS.grandpublic.heures;
              return (
                <button key={k} style={S.btn(nm.seg === k)} onClick={() => setNm({ ...nm, seg: k })}>
                  <span style={S.gold}>{sg.nom}</span>{" "}
                  <span style={{ ...S.gold, fontSize: 21 }}>{sg.heures} h/pièce</span>
                  {facteur > 1 && <span style={S.red}> ×{facteur} le grand public</span>}
                  <br />
                  <span style={S.steel}>{sg.desc} Repère de prix : {fmtArgent(sg.ideal)}.</span>
                </button>
              );
            })}

            {/* Pas de prix suggéré : on donne le coût, le joueur décide. */}
            {/* Le temps de fabrication est la vraie contrainte du jeu : il doit
                sauter aux yeux avant de lancer la R&D. */}
            <div style={{ ...S.panel, borderColor: "#4A6B4E", marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                <span>
                  <span style={S.steel}>Temps de fabrication</span>
                  <br />
                  <span style={{ ...S.gold, fontSize: 26 }}>{heuresParPiece(apercu)} h</span>
                  <span style={S.steel}> par pièce</span>
                </span>
                <span style={{ textAlign: "right" }}>
                  <span style={S.steel}>Coût de revient</span>
                  <br />
                  <span style={{ ...S.gold, fontSize: 22 }}>{fmtArgent(coutApercu)}</span>
                  <span style={S.steel}> · qualité {qualApercu}/10</span>
                </span>
              </div>
              <div style={{ ...S.steel, marginTop: 8 }}>
                Avec vos {fmtH(dispoProd)} disponibles ce trimestre, vous pourriez en produire{" "}
                <span style={S.gold}>{fmtNb(Math.floor(dispoProd / heuresParPiece(apercu)))}</span> — contre{" "}
                {fmtNb(Math.floor(dispoProd / SEGMENTS.grandpublic.heures))} pour un modèle grand public.
              </div>
              <div style={{ ...S.steel, marginTop: 6 }}>
                Vous fixerez son prix vous-même quand elle sortira d'étude. L'étude de marché chiffre la demande
                à plusieurs prix.
              </div>
            </div>

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
          <span style={S.steel}>({fmtH(COUTS_H.facelift)} + 75% du coût R&D) — restaure la fraîcheur</span>{fait("facelift")}
        </button>
        <button
          style={S.action(ok(COUTS_H.edition) && actifs.length > 0)}
          onClick={() => actifs.length > 0 && ok(COUTS_H.edition) && setPicker(picker === "edition" ? null : "edition")}
        >
          💎 Édition limitée ×50{" "}
          <span style={S.steel}>({fmtH(COUTS_H.edition)} + prod.) — désirabilité +8, crédibilité −1</span>{fait("edition")}
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
                      marquer(picker);
                      setPicker(null);
                    }}
                  >
                    {m.nom}{" "}
                    <span style={S.steel}>
                      {picker === "facelift"
                        ? "— " + fmtArgent(coutFacelift(m, profil))
                        : "— " + fmtArgent(50 * coutU(m)) + " de production"}
                    </span>
                  </button>
                )
            )}
            <button style={S.ghost} onClick={() => setPicker(null)}>
              Annuler
            </button>
          </div>
        )}

        <div style={S.h3}>DISTRIBUTION — portée ×{portee.toFixed(1)}, marge {fmtPct(marge)}</div>
        <div style={{ ...S.panel, ...S.steel }}>
          {Object.entries(g.canaux)
            .filter(([, n]) => n > 0)
            .map(([id, n]) => CANAUX[id].icon + " " + CANAUX[id].nom + " — " + CANAUX[id].paliers[n - 1].nom)
            .join(" · ")}
          <br />
          Plus de portée = plus de volume accessible. Mais chaque canal encaisse sa part : les détaillants
          agréés vendent large et prennent 45%.
        </div>
        {panneau !== "canaux" && canaux.length > 0 && (
          <button style={S.action(true)} onClick={() => setPanneau("canaux")}>
            🏪 Développer la distribution <span style={S.steel}>— ouvrir ou agrandir un canal</span>{fait("canal")}
          </button>
        )}
        {panneau === "canaux" && (
          <div style={{ ...S.panel, borderColor: "#C9A227" }}>
            {canaux.map((c) => {
              const jouable = c.manque.length === 0 && ok(c.heures, c.cout);
              return (
                <button
                  key={c.id}
                  style={{ ...S.btn(false), opacity: jouable ? 1 : 0.45 }}
                  disabled={!jouable}
                  onClick={() => {
                    actions.ouvrirCanal(c);
                    marquer("canal");
                    setPanneau(null);
                  }}
                >
                  <span style={S.gold}>
                    {c.canal.icon} {c.canal.nom}
                  </span>{" "}
                  <span style={S.steel}>
                    palier {c.niveau}/3 — « {c.nom} »
                  </span>
                  <br />
                  <span style={S.steel}>
                    {fmtH(c.heures)} + {fmtArgent(c.cout)}, puis {fmtArgent(c.fixes)}/trim · portée +{c.portee}, marge{" "}
                    {fmtPct(c.canal.marge)}
                    {c.manque.length ? " · ⚠ demande " + c.manque.join(" et ") : ""}
                  </span>
                </button>
              );
            })}
            <button style={S.ghost} onClick={() => setPanneau(null)}>
              Annuler
            </button>
          </div>
        )}

        <div style={S.h3}>COÛTS FIXES — {fmtArgent(fixes)}/trimestre</div>
        <button style={S.action(true)} onClick={() => setVoirFixes(!voirFixes)}>
          🧾 {voirFixes ? "Masquer le détail" : "D'où viennent mes coûts fixes ?"}{" "}
          <span style={S.steel}>— ce qui se paie chaque trimestre, quoi qu'il arrive</span>
        </button>
        {voirFixes && (
          <div style={S.panel}>
            {detailFixes(g).map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                <span style={S.steel}>
                  {l.libelle}
                  {l.detail ? <span style={{ opacity: 0.7 }}> ({l.detail})</span> : null}
                </span>
                <span>{fmtArgent(l.montant)}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex", justifyContent: "space-between",
                borderTop: "1px solid #2A3A2C", marginTop: 6, paddingTop: 6,
              }}
            >
              <span style={S.gold}>Total par trimestre</span>
              <span style={S.gold}>{fmtArgent(fixes)}</span>
            </div>
            <div style={{ ...S.steel, marginTop: 6 }}>
              Se séparer d'un collaborateur ou fermer un canal fait baisser cette ligne dès le trimestre
              suivant.
            </div>
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
          {enc.requis > 0 && (
            <>
              <br />
              Encadrement : {enc.chefs}/{enc.requis} chef{enc.requis > 1 ? "s" : ""} d'atelier. Vous encadrez
              vous-même {enc.sansChef} personnes ; au-delà, un chef pour {ENCADREMENT_PAR_CHEF} — efficacité{" "}
              {fmtPct(enc.efficacite)}.
            </>
          )}
        </div>

        {panneau !== "embauche" && (
          <button style={S.action(ok(COUTS_H.embauche))} onClick={() => ok(COUTS_H.embauche) && setPanneau("embauche")}>
            👥 Embaucher{" "}
            <span style={S.steel}>({fmtH(COUTS_H.embauche)}) — {fmtH(HEURES_EMPLOYE)} de spécialité par trimestre</span>{fait("embauche")}
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
                  Un poste supplémentaire coûte {fmtArgent(ATELIERS.petit.cout)} ({fmtH(ATELIERS.petit.heures)}), une
                  halle de {ATELIERS.grand.postes} postes {fmtArgent(ATELIERS.grand.cout)} ({fmtH(ATELIERS.grand.heures)}
                  ) — moins cher au poste.{" "}
                  {peut(ATELIERS.petit.cout)
                    ? "Votre trésorerie permet au moins le petit palier."
                    : "Votre trésorerie ne permet ni l'un ni l'autre sans descendre sous " +
                      MARGE_CONSEIL_TRIMESTRES + " trimestres de coûts fixes."}
                </span>
              </div>
            )}
            {Object.entries(EMPLOYES).map(([k, e]) => {
              // Encadrement tel qu'il serait APRÈS cette embauche : le joueur doit
              // voir la conséquence avant de cliquer, pas au rapport suivant.
              const apres = encadrement({ ...g.employes, [k]: g.employes[k] + 1 });
              return (
                <button
                  key={k}
                  style={S.btn(false)}
                  onClick={() => {
                    actions.embaucher(k);
                    marquer("embauche");
                    setPanneau(null);
                  }}
                >
                  {e.icon} <span style={S.gold}>{e.nom}</span>{" "}
                  <span style={S.steel}>— {fmtArgent(e.fixes)}/trim · {e.desc}</span>
                  {e.production && (
                    <>
                      <br />
                      <span style={{ ...S.steel, color: gainEmbauche > 0 ? "#8FBF7F" : "#D06050" }}>
                        {gainEmbauche > 0
                          ? "→ " + fmtH(gainEmbauche) + " réellement utilisables avec vos postes actuels"
                          : "→ 0 h utilisable : vos postes d'atelier sont saturés"}
                      </span>
                      {apres.manque > enc.manque && (
                        <>
                          <br />
                          <span style={S.red}>
                            → demandera un chef d'atelier de plus ({apres.chefs}/{apres.requis}), sinon l'équipe
                            tombe à {fmtPct(apres.efficacite)} de ses heures
                          </span>
                        </>
                      )}
                    </>
                  )}
                  {k === "chef" && enc.manque > 0 && (
                    <>
                      <br />
                      <span style={S.green}>
                        → comble un encadrement manquant : l'équipe passe de {fmtPct(enc.efficacite)} à{" "}
                        {fmtPct(apres.efficacite)} de ses heures
                      </span>
                    </>
                  )}
                </button>
              );
            })}
            <button style={S.ghost} onClick={() => setPanneau(null)}>
              Annuler
            </button>
          </div>
        )}

        {nbEmployes(g.employes) > 0 && panneau !== "equipe" && (
          <button style={S.action(ok(COUTS_H.licenciement))} onClick={() => setPanneau("equipe")}>
            👋 Se séparer d'un collaborateur{" "}
            <span style={S.steel}>({fmtH(COUTS_H.licenciement)} + indemnité) — allège les coûts fixes</span>{fait("licenciement")}
          </button>
        )}
        {panneau === "equipe" && (
          <div style={{ ...S.panel, borderColor: "#C9A227" }}>
            {Object.entries(g.employes)
              .filter(([, n]) => n > 0)
              .map(([k, n]) => (
                <button
                  key={k}
                  style={{ ...S.btn(false), opacity: ok(COUTS_H.licenciement) ? 1 : 0.45 }}
                  disabled={!ok(COUTS_H.licenciement)}
                  onClick={() => {
                    actions.licencier(k);
                    marquer("licenciement");
                    setPanneau(null);
                  }}
                >
                  {EMPLOYES[k].icon} <span style={S.gold}>{EMPLOYES[k].nom}</span>{" "}
                  <span style={S.steel}>
                    (×{n}) — indemnité {fmtArgent(indemnite(k))}, puis {fmtArgent(EMPLOYES[k].fixes)}/trim économisés
                  </span>
                </button>
              ))}
            <button style={S.ghost} onClick={() => setPanneau(null)}>
              Annuler
            </button>
          </div>
        )}

        {panneau !== "recherche" && recherchables.length > 0 && (
          <button style={S.action(!g.recherche)} onClick={() => !g.recherche && setPanneau("recherche")}>
            🔩 Lancer une recherche{" "}
            <span style={S.steel}>
              {g.recherche ? "— une recherche est déjà en cours" : "— complications et matériaux"}
            </span>
          </button>
        )}
        {panneau === "recherche" && (
          <div style={{ ...S.panel, borderColor: "#C9A227" }}>
            <div style={{ ...S.steel, marginBottom: 8 }}>
              Une seule recherche à la fois. Chaque complication a trois paliers, et il faut la maîtriser au
              niveau {COMPL_NIVEAU_REQUIS} pour ouvrir la suivante de l'arbre.
            </div>
            {recherchables.map((c) => {
              const h = heuresRD(c.rdHeures, g.employes);
              const jouable = !c.bloque && ok(h, c.rd);
              return (
                <button
                  key={c.type + c.id}
                  style={{ ...S.btn(false), opacity: jouable ? 1 : 0.45 }}
                  disabled={!jouable}
                  onClick={() => {
                    actions.rechercher(c);
                    marquer("recherche");
                    setPanneau(null);
                  }}
                >
                  <span style={S.gold}>
                    {c.type === "materiau" ? "🧪 " : ""}
                    {c.famille}
                  </span>{" "}
                  <span style={S.steel}>
                    {c.type === "materiau" ? "— travail de la matière" : "niveau " + c.niveau + "/3 — « " + c.nom + " »"}
                  </span>
                  <br />
                  <span style={S.steel}>
                    {fmtH(h)} + {fmtArgent(c.rd)}, {c.dev} trim.
                    {c.type === "complication"
                      ? " · +" + c.heures + " h/pièce, qualité +" + c.qual + ", prix acceptable ×" + c.prixMult
                      : ""}
                    {c.bloque ? (c.type === "materiau" ? " · 🧪 expert matériaux requis" : " · ⚙ ingénieur requis") : ""}
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

        {Object.entries(ATELIERS).map(([cle, a]) => (
          <button
            key={cle}
            style={S.action(ok(a.heuresAction, a.cout))}
            onClick={jouer("atelier-" + cle, () => actions.agrandirAtelier(cle))}
          >
            🏭 {a.nom}{" "}
            <span style={S.steel}>
              ({fmtH(a.heuresAction)}, {fmtArgent(a.cout)}) — +{fmtH(a.heures)}/trim · fixes +
              {fmtArgent(a.fixes)}/trim · {fmtArgent(Math.round(a.cout / a.postes))} le poste
            </span>
            {fait("atelier-" + cle)}
          </button>
        ))}

        <div style={S.h3}>IMAGE</div>
        <button style={S.action(ok(COUTS_H.marketing, COUTS_CHF.marketing))} onClick={jouer("marketing", () => actions.action("marketing"))}>
          📣 Marketing{" "}
          <span style={S.steel}>({fmtH(COUTS_H.marketing)}, {fmtArgent(COUTS_CHF.marketing)}) — notoriété +{gainMarketing(g, pays)}</span>{fait("marketing")}
        </button>
        <button style={S.action(ok(COUTS_H.choc, COUTS_CHF.choc))} onClick={jouer("choc", () => actions.action("choc"))}>
          💥 Campagne choc{" "}
          <span style={S.steel}>
            ({fmtH(COUTS_H.choc)}, {fmtArgent(COUTS_CHF.choc)}) — notoriété +{gainChoc(g, pays)}, crédibilité −2, désirabilité −1
          </span>{fait("choc")}
        </button>
        <button style={S.action(ok(COUTS_H.presse))} onClick={jouer("presse", () => actions.action("presse"))}>
          📰 Relations presse <span style={S.steel}>({fmtH(COUTS_H.presse)}) — crédibilité +2</span>{fait("presse")}
        </button>
        <button style={S.action(ok(COUTS_H.etude, COUTS_CHF.etude))} onClick={jouer("etude", () => actions.action("etude"))}>
          🔍 Étude de marché{" "}
          <span style={S.steel}>({fmtH(COUTS_H.etude)}, {fmtArgent(COUTS_CHF.etude)}) — la demande à trois prix différents</span>{fait("etude")}
        </button>

        <div style={S.h3}>COMMERCE</div>
        <button
          style={S.action(ok(COUTS_H.soldes) && g.modeles.some((m) => m.stock > 0 && m.statut === "actif"))}
          onClick={jouer("soldes", () => actions.action("soldes"))}
        >
          🏷 Soldes <span style={S.steel}>({fmtH(COUTS_H.soldes)}) — tout le stock à −35%, désirabilité −8</span>{fait("soldes")}
        </button>
        {!g.kickstarterFait && (
          <button
            style={S.action(ok(COUTS_H.kickstarter) && g.modeles.length > 0)}
            onClick={jouer("kickstarter", () => actions.action("kickstarter"))}
          >
            🚀 Kickstarter{" "}
            <span style={S.steel}>({fmtH(COUTS_H.kickstarter)}, une fois) — cash + notoriété + désirabilité</span>{fait("kickstarter")}
          </button>
        )}

        <div style={S.h3}>FINANCE</div>
        <button style={S.action(ok(COUTS_H.emprunt))} onClick={jouer("emprunt", () => actions.action("emprunt"))}>
          🏦 Emprunt{" "}
          <span style={S.steel}>
            ({fmtH(COUTS_H.emprunt)}) — +{fmtArgent(COUTS_CHF.emprunt)}, taux {profil === "financier" ? "4" : "6"}%
          </span>{fait("emprunt")}
        </button>
        {g.dette > 0 && (
          <button style={S.action(g.cash > 0)} onClick={jouer("rembourser", () => actions.action("rembourser"))}>
            💰 Rembourser <span style={S.steel}>(0 h) — jusqu'à {fmtArgent(COUTS_CHF.remboursement)} de dette</span>{fait("rembourser")}
          </button>
        )}

        {/* Dernier garde-fou avant de clore : un modèle sans production ne
            fabrique rien, et c'est l'erreur la plus fréquente en beta. */}
        {sansProduction.length > 0 && (
          <div style={{ ...S.panel, borderColor: "#D06050" }}>
            <span style={S.red}>
              ⚠ {sansProduction.length === 1 ? "Un modèle n'a pas" : sansProduction.length + " modèles n'ont pas"} de
              production réglée : {sansProduction.map((m) => m.nom).join(", ")}.
            </span>
            <br />
            <span style={S.steel}>
              {sansProduction.length === 1 ? "Il ne sortira" : "Ils ne sortiront"} aucune pièce ce trimestre.
              Vous avez {fmtH(libres)} disponibles.
            </span>
          </div>
        )}

        {/* Les testeurs ne savaient pas ce qui était immédiat et ce qui attendait
            la fin du trimestre : on le dit sur le bouton qui déclenche le calcul. */}
        {/* Les actions du trimestre alimentent le récit : on les transmet au moteur. */}
        <button style={S.cta} onClick={() => actions.finTrimestre(actionsPrises())}>
          FIN DU TRIMESTRE ▸
        </button>
        <div style={{ ...S.steel, textAlign: "center", marginTop: 4 }}>
          Les ventes, les coûts et la production se calculent maintenant.
        </div>
        <button style={S.ghost} onClick={() => actions.passerAnnee(actionsPrises())}>
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
        {/* Un testeur doit pouvoir enchaîner deux parties sans recharger la page. */}
        {confirmeAbandon ? (
          <div style={{ ...S.panel, borderColor: "#D06050", marginTop: 8 }}>
            <span style={S.red}>Abandonner cette partie et en recommencer une ?</span>
            <br />
            <span style={S.steel}>
              T{g.t} {g.annee} — la sauvegarde reste en place, vous pourrez la reprendre depuis l'accueil.
            </span>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button style={{ ...S.ghost, marginTop: 0 }} onClick={() => setConfirmeAbandon(false)}>
                Annuler
              </button>
              <button style={{ ...S.cta, marginTop: 0 }} onClick={actions.abandonner}>
                NOUVELLE PARTIE
              </button>
            </div>
          </div>
        ) : (
          <button style={S.ghost} onClick={() => setConfirmeAbandon(true)}>
            Nouvelle partie
          </button>
        )}
        {saveMsg && <div style={{ ...S.steel, textAlign: "center", marginTop: 6 }}>{saveMsg}</div>}
        <div style={{ ...S.steel, textAlign: "center", marginTop: 14, fontSize: 14, opacity: 0.6 }}>
          {ETIQUETTE}
        </div>

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
                  · CA {fmtArgent(j.revenus)} ·
                  <span style={j.resultat >= 0 ? S.green : S.red}>
                    {" "}
                    {j.resultat >= 0 ? "+" : ""}
                    {fmtArgent(j.resultat)}
                  </span>
                  <span style={S.steel}> · Caisse {fmtArgent(j.cash)}</span>
                </div>
              ))}
          </div>
        )}

        {/* Réserve la place de la barre fixe pour que le dernier bouton reste
            atteignable au pouce. */}
        <div style={S.espaceBarre} />
      </div>

      <BarreStatut g={g} autosaveAt={autosaveAt} />
    </div>
  );
}
