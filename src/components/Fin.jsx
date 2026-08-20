import { useEffect } from "react";
import { S } from "../styles.js";
import { ANNEE_DEBUT, ANNEE_FIN } from "../data/config.js";
import { fmtArgent } from "../engine/formules.js";
import { FINS, pieceDeMusee } from "../engine/fins.js";

const TITRES = { faillite: "FAILLITE", temps: ANNEE_FIN + " — BILAN", rachat: "RACHETÉE" };
const ICONES = { faillite: "💀", temps: "⌛", rachat: "🤝" };

/** L'épilogue de la fin obtenue, adapté à la trajectoire. */
function epilogue(f, nom) {
  const g = f.etat || {};
  const duree = f.anneesTop50 || 0;

  if (f.fin === "scandale") {
    return (
      f.annee + ". Un dernier papier a suffi. Les comptes de " + nom + " étaient bons, l'atelier " +
      "tournait, et plus personne dans la profession ne prendra votre appel. La maison continuera " +
      "sans vous — c'est peut-être le pire."
    );
  }
  if (f.fin === "empire") {
    return (
      "2065. Trois maisons rachetées, une direction industrielle, " + fmtArgent(g.cash) + " en caisse " +
      "et la " + f.rang + "ᵉ place mondiale. " + nom + " a cessé d'être une marque pour devenir un " +
      "groupe. Ceux qui vous regardaient de haut en 2015 travaillent pour vous."
    );
  }
  if (f.fin === "montreDuSiecle") {
    const piece = pieceDeMusee(g);
    return (
      "2065. " + nom + " n'aura jamais été grande" + (f.rang <= 200 ? ", ou pas très" : "") + ". " +
      "Mais « " + (piece ? piece.nom : "la pièce") + " » est sous vitrine, et elle y restera. " +
      "Dans deux cents ans, on saura encore qui l'a faite."
    );
  }
  if (f.fin === "marqueCulte") {
    return (
      "2065. Jamais plus d'une poignée de références, jamais un pas de trop, et une liste d'attente " +
      "qui ne s'est jamais vidée. " + nom + " est de ces maisons dont on parle à voix basse dans les " +
      "salons. Vous auriez pu être gros. Vous avez préféré être désiré."
    );
  }
  // La Succession, modulée par la trajectoire.
  const base =
    (ANNEE_FIN - ANNEE_DEBUT) + " ans. " + nom + " termine au rang #" + f.rang + " avec " +
    fmtArgent(f.revenus) + " de revenus annuels. ";
  if (!f.top50Depuis) {
    return (
      base +
      (f.rang <= 200
        ? "La maison n'aura jamais vu le Top 50, mais elle aura duré cinquante ans — ce qui n'est pas donné à tout le monde. "
        : "Le Top 50 est resté un horizon. L'atelier, lui, a tenu. ") +
      "L'enveloppe d'Olivier attendait dans le tiroir depuis 2048."
    );
  }
  return (
    base + "Entrée au Top 50 en " + f.top50Depuis + ", " + duree + " exercice" +
    (duree > 1 ? "s" : "") + " tenus dedans" + (f.rang <= 50 ? ", et vous y êtes encore" : "") + ". " +
    "L'enveloppe d'Olivier attendait dans le tiroir depuis 2048."
  );
}

export default function Fin({ f, marque, onRejouer }) {
  useEffect(() => window.scrollTo(0, 0), []);
  const nom = marque || "Votre marque";
  const alternative = f.type === "alternative";
  const fin = alternative ? FINS.find((x) => x.id === f.fin) : null;

  const textes = {
    faillite:
      f.annee + ". Les créanciers ont saisi l'atelier. " + nom + " rejoint le cimetière des marques oubliées.",
    rachat:
      f.annee + ". Le groupe a signé. Le nom reste sur les cadrans, l'atelier tourne encore, et " + nom +
      " ne vous appartient plus. On vous a remercié dans le communiqué.",
    temps:
      (ANNEE_FIN - ANNEE_DEBUT) + " ans se sont écoulés. " + nom + " termine au rang #" + f.rang + ".",
  };

  return (
    <div style={S.root}>
      <div style={{ ...S.wrap, paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>{alternative ? fin.icone : ICONES[f.type]}</div>
        <div style={{ ...S.h1, marginTop: 10 }}>{alternative ? fin.nom : TITRES[f.type]}</div>
        <div style={{ ...S.panel, marginTop: 20, textAlign: "left" }}>
          {alternative ? epilogue(f, nom) : textes[f.type]}
        </div>

        {/* Les cinq destins, à chaque partie. Celui qu'on a obtenu en clair, les
            autres en indices — jamais un chiffre. C'est ce qui donne envie de
            relancer, et le principal levier de rejouabilité du jeu. */}
        <div style={{ ...S.h2, marginTop: 28, textAlign: "left" }}>LES CINQ DESTINS</div>
        <div style={{ ...S.steel, textAlign: "left", marginBottom: 10 }}>
          Une partie n'en révèle qu'un. Les autres existent.
        </div>
        {FINS.map((x) => {
          const obtenue = alternative && x.id === f.fin;
          return (
            <div
              key={x.id}
              style={{
                ...S.panel,
                textAlign: "left",
                borderColor: obtenue ? "#C9A227" : "#2A3A2C",
                opacity: obtenue ? 1 : 0.72,
              }}
            >
              <span style={obtenue ? S.gold : S.steel}>
                {obtenue ? x.icone + " " + x.nom : "· · ·"}
              </span>
              <br />
              <span style={obtenue ? { color: "#EDE6D6" } : S.steel}>
                {obtenue ? x.description : x.indice}
              </span>
            </div>
          );
        })}

        <button style={S.cta} onClick={onRejouer}>
          REJOUER
        </button>
      </div>
    </div>
  );
}
