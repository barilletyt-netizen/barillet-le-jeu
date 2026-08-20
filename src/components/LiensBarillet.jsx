import { S } from "../styles.js";
import { LIENS, LIENS_PUBLICS } from "../data/config.js";

/**
 * Les liens de la maison, sur l'écran d'accueil.
 *
 * Ils figuraient jusqu'ici sur la seule page de fermeture — c'est-à-dire
 * précisément quand le jeu n'était pas jouable. Un joueur qui arrive par le
 * jeu doit pouvoir trouver la chaîne, et un joueur qui repart doit pouvoir
 * s'abonner.
 */
export default function LiensBarillet({ style }) {
  const liens = LIENS_PUBLICS.filter((l) => LIENS[l.cle]);
  if (!liens.length) return null;
  return (
    <div
      style={{
        display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center",
        marginTop: 22, ...style,
      }}
    >
      {liens.map((l) => (
        <a
          key={l.cle}
          href={LIENS[l.cle]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...S.steel,
            textDecoration: "none",
            border: "1px solid #2A3A2C",
            borderRadius: 2,
            padding: "6px 12px",
            fontSize: 14,
          }}
        >
          <span style={S.gold}>{l.icone}</span> {l.nom}
        </a>
      ))}
    </div>
  );
}
