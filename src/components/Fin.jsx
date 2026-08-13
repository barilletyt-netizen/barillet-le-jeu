import { S } from "../styles.js";
import { ANNEE_DEBUT, ANNEE_FIN } from "../data/config.js";
import { fmtArgent } from "../engine/formules.js";

const TITRES = { faillite: "FAILLITE", top50: "TOP 50 !", temps: ANNEE_FIN + " — BILAN", rachat: "RACHETÉE" };
const ICONES = { faillite: "💀", top50: "👑", temps: "⌛", rachat: "🤝" };

export default function Fin({ f, marque, onRejouer }) {
  const nom = marque || "Votre marque";
  const textes = {
    faillite:
      f.annee + ". Les créanciers ont saisi l'atelier. " + nom + " rejoint le cimetière des marques oubliées.",
    top50:
      f.annee + ". " + nom + " entre au Stanley Morgan Top 50 avec " + fmtArgent(f.revenus) +
      " de revenus. L'industrie s'incline.",
    rachat:
      f.annee + ". Le groupe a signé. Le nom reste sur les cadrans, l'atelier tourne encore, et " + nom +
      " ne vous appartient plus. On vous a remercié dans le communiqué.",
    // Le bilan juge la trajectoire entière, pas le dernier chiffre : quand on
    // est entré, combien d'années on a tenu, et où l'on finit.
    temps: (() => {
      const base =
        (ANNEE_FIN - ANNEE_DEBUT) + " ans se sont écoulés. " + nom + " termine au rang #" + f.rang +
        " avec " + fmtArgent(f.revenus) + " de revenus annuels. ";
      if (!f.top50Depuis) {
        return base + (f.rang <= 200
          ? "La maison n'aura jamais vu le Top 50, mais elle aura duré cinquante ans — ce qui n'est pas donné à tout le monde."
          : "Le Top 50 est resté un horizon. L'atelier, lui, a tenu.");
      }
      const duree = f.anneesTop50 || 0;
      if (f.rang <= 50) {
        return base + "Entrée au Top 50 en " + f.top50Depuis + ", la maison y a passé " + duree +
          " exercice" + (duree > 1 ? "s" : "") + " et y termine. " +
          (duree >= 20
            ? "Ce n'est plus une percée, c'est une institution."
            : "Il aura fallu " + (f.top50Depuis - ANNEE_DEBUT) + " ans pour y entrer, et il faudra continuer.");
      }
      return base + "Entrée au Top 50 en " + f.top50Depuis + ", la maison y a passé " + duree +
        " exercice" + (duree > 1 ? "s" : "") + " avant d'en sortir. " +
        "Monter est une chose ; rester en est une autre, et c'était celle-là le vrai test.";
    })(),
  };

  return (
    <div style={S.root}>
      <div style={{ ...S.wrap, paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>{ICONES[f.type]}</div>
        <div style={{ ...S.h1, marginTop: 10 }}>{TITRES[f.type]}</div>
        <div style={{ ...S.panel, marginTop: 20, textAlign: "left" }}>{textes[f.type]}</div>
        <button style={S.cta} onClick={onRejouer}>
          REJOUER
        </button>
      </div>
    </div>
  );
}
