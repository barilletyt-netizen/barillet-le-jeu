import { S } from "../styles.js";
import { MODE_CAPTURE } from "../capture/mode.js";
import { FORMULAIRE_RETOUR } from "../data/config.js";
import { VERSION, BUILD } from "../version.js";

/**
 * Le bouton de retour, avec le contexte de partie déjà rempli.
 *
 * Un testeur qui doit décrire lui-même sa version, son année et son rang ne le
 * fait pas — ou le fait mal. Ces quatre valeurs partent en paramètres d'URL,
 * que le formulaire peut pré-remplir. Rien d'autre : ni identifiant, ni
 * sauvegarde, ni contenu de partie.
 *
 * Sans URL de formulaire configurée, le bouton n'apparaît pas.
 */
export function lienRetour(g) {
  if (!FORMULAIRE_RETOUR || MODE_CAPTURE) return null;
  const p = new URLSearchParams({ version: VERSION, build: BUILD });
  if (g) {
    p.set("annee", String(g.annee));
    p.set("rang", String(g.meilleurRang ?? ""));
    p.set("tresorerie", String(Math.round(g.cash)));
  }
  return FORMULAIRE_RETOUR + (FORMULAIRE_RETOUR.includes("?") ? "&" : "?") + p.toString();
}

export default function BoutonRetour({ g, style, libelle }) {
  const url = lienRetour(g);
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...S.steel, textDecoration: "none", border: "1px solid #4A7C9E",
        borderRadius: 2, padding: "6px 12px", fontSize: 14, display: "inline-block",
        ...style,
      }}
    >
      <span style={S.blue}>✎</span> {libelle || "Donner mon avis"}
    </a>
  );
}
