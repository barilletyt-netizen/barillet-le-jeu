import { S } from "../styles.js";
import { ANNEE_DEBUT, ANNEE_FIN } from "../data/config.js";
import { fmtArgent } from "../engine/formules.js";

const TITRES = { faillite: "FAILLITE", top50: "TOP 50 !", temps: ANNEE_FIN + " — BILAN" };
const ICONES = { faillite: "💀", top50: "👑", temps: "⌛" };

export default function Fin({ f, marque, onRejouer }) {
  const nom = marque || "Votre marque";
  const textes = {
    faillite:
      f.annee + ". Les créanciers ont saisi l'atelier. " + nom + " rejoint le cimetière des marques oubliées.",
    top50:
      f.annee + ". " + nom + " entre au Stanley Morgan Top 50 avec " + fmtArgent(f.revenus) +
      " de revenus. L'industrie s'incline.",
    temps:
      (ANNEE_FIN - ANNEE_DEBUT) + " ans se sont écoulés. " + nom + " termine autour du rang #" + f.rang +
      " avec " + fmtArgent(f.revenus) + " de revenus annuels. " +
      (f.rang <= 200 ? "Une marque indépendante respectée." : "Le Top 50 reste un rêve lointain."),
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
