import { S } from "../styles.js";

/**
 * Une lettre d'Olivier, sous la Gazette.
 *
 * Ce n'est pas un journal : papier à lettre, texte penché, signature. Le
 * contraste avec la une imprimée juste au-dessus est volontaire — la Gazette
 * parle de l'industrie, Olivier parle à quelqu'un.
 */
export default function Lettre({ lettre, reaction, objectif }) {
  if (!lettre && !reaction) return null;
  return (
    <div
      style={{
        background: "#EFE7D2",
        color: "#2A2418",
        border: "1px solid #C9B98A",
        borderRadius: 2,
        padding: "18px 20px",
        marginTop: 12,
        fontFamily: "'Iowan Old Style', Palatino, Georgia, serif",
        fontStyle: "italic",
        lineHeight: 1.6,
        boxShadow: "0 2px 0 rgba(0,0,0,0.25)",
      }}
    >
      {reaction && (
        <div style={{ marginBottom: lettre ? 16 : 0 }}>
          <div style={{ fontSize: 12, fontStyle: "normal", letterSpacing: "0.1em", color: "#7A6A4A" }}>
            {reaction.reussi ? "OBJECTIF TENU" : "OBJECTIF NON TENU"} — {reaction.objectif}
          </div>
          <div style={{ marginTop: 6 }}>{reaction.texte}</div>
          {reaction.recompense && (
            <div style={{ marginTop: 6, fontStyle: "normal", color: "#6A5A2A" }}>
              Il t'envoie {reaction.recompense}.
            </div>
          )}
        </div>
      )}

      {lettre && (
        <>
          {lettre.scellee && (
            <div style={{ fontSize: 12, fontStyle: "normal", letterSpacing: "0.1em", color: "#7A6A4A" }}>
              LA LETTRE SCELLÉE
            </div>
          )}
          <div style={{ whiteSpace: "pre-line", marginTop: lettre.scellee ? 8 : 0 }}>{lettre.texte}</div>
          <div style={{ marginTop: 12, textAlign: "right", fontStyle: "normal", color: "#5A4A2A" }}>
            — {lettre.auteur}
          </div>
        </>
      )}

      {objectif && !reaction && (
        <div
          style={{
            marginTop: 14, paddingTop: 10, borderTop: "1px solid #D6C79A",
            fontStyle: "normal", fontSize: 14,
          }}
        >
          <span style={{ letterSpacing: "0.08em", color: "#7A6A4A" }}>CE QU'IL SUGGÈRE — </span>
          {objectif.texte}. <span style={{ color: "#6A5A2A" }}>S'il y arrive : {objectif.recompense.texte}.</span>
          <div style={{ color: "#8A7A5A", marginTop: 4 }}>
            Rien à perdre s'il n'y arrive pas — Olivier suggère, il ne commande pas.
          </div>
        </div>
      )}
    </div>
  );
}
