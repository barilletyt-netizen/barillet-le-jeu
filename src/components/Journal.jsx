import { S } from "../styles.js";

/**
 * La Gazette du Balancier : le trimestre en une de journal.
 *
 * Le fond ivoire est délibéré — c'est un objet posé sur l'établi, pas un
 * panneau d'interface de plus. Les testeurs cessaient de lire la chronique au
 * bout de trois tours ; un journal se parcourt en diagonale, ce qui est
 * exactement ce qu'on veut d'un résumé trimestriel.
 */
export default function Journal({ j }) {
  if (!j) return null;
  return (
    <div style={S.journal}>
      <div style={S.journalTitre}>LA GAZETTE DU BALANCIER</div>

      <div style={S.journalBandeau}>
        <span>{j.saison}</span>
        <span>n° {j.numero}</span>
        <span>Chronique de l'industrie</span>
      </div>

      <div style={S.journalUne}>{j.une.titre}</div>
      <div style={S.journalChapo}>{j.une.texte}</div>

      {j.articles.length > 0 && (
        <div
          style={{
            ...S.journalCol,
            // Deux colonnes dès qu'il y a la place : ça fait vraiment journal.
            gridTemplateColumns: j.articles.length > 1 ? "repeat(auto-fit, minmax(220px, 1fr))" : "1fr",
          }}
        >
          {j.articles.map((a, i) => (
            <div key={i}>
              <div style={S.journalSousTitre}>{a.titre}</div>
              <div style={S.journalTexte}>{a.texte}</div>
            </div>
          ))}
        </div>
      )}

      {j.filet && <div style={S.journalFilet}>Brèves — {j.filet}</div>}
    </div>
  );
}
