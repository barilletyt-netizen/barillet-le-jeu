import { S } from "../styles.js";
import { ANNEE_DEBUT, ANNEE_FIN, HEURES_FONDATEUR } from "../data/config.js";
import { REVENUS_TOP50 } from "../data/monde.js";
import { fmtArgent } from "../engine/formules.js";

/**
 * Écran d'accueil de partie. Version minimale de la page d'introduction prévue
 * en S3 : de quoi qu'un testeur externe sache où il va en trente secondes.
 * La consigne de session en bas est là pour la phase de test — à retirer ou
 * remplacer par du contexte narratif quand S3 arrivera.
 */
export default function Brief({ onContinuer, onRetour }) {
  const Regle = ({ titre, children }) => (
    <div style={{ marginBottom: 10 }}>
      <span style={S.gold}>{titre}</span>
      <br />
      <span style={S.steel}>{children}</span>
    </div>
  );

  return (
    <div style={S.root}>
      <div style={{ ...S.wrap, paddingTop: 24 }}>
        <div style={S.h1}>Avant de commencer</div>

        <div style={{ ...S.panel, borderColor: "#C9A227", marginTop: 14 }}>
          <span style={S.gold}>Le but</span>
          <br />
          Vous fondez une marque horlogère en {ANNEE_DEBUT}. Vous avez {ANNEE_FIN - ANNEE_DEBUT} ans — soit{" "}
          {(ANNEE_FIN - ANNEE_DEBUT) * 4} trimestres — pour la faire entrer au{" "}
          <span style={S.gold}>Stanley Morgan Top 50</span>, le classement mondial de l'industrie. Il y faut{" "}
          {fmtArgent(REVENUS_TOP50)} de revenus annuels. Vous commencez très loin de là.
        </div>

        <div style={S.h2}>OÙ VOUS ARRIVEZ</div>
        <div style={S.panel}>
          <span style={S.steel}>
            <span style={S.gold}>Janvier 2015.</span> La Banque nationale vient d'abandonner le taux plancher :
            le franc s'envole de 20% en une matinée et toute l'industrie suisse se réveille avec des coûts
            insupportables. Les grands groupes encaissent, les petits ferment.
            <br />
            <br />
            Au même moment, une montre connectée américaine s'apprête à sortir et personne ne sait encore si
            elle balaiera l'entrée de gamme ou si elle passera comme une mode. Les salons sont pleins, le
            marché chinois ralentit, et la profession n'ose pas le dire tout haut.
            <br />
            <br />
            C'est le moment que vous choisissez pour fonder votre marque. Vous n'êtes personne, vous n'avez
            pas de nom, pas de réseau et pas d'atelier — juste un établi et le temps que vous voudrez bien y
            passer.
          </span>
        </div>

        <div style={S.h2}>LES RÈGLES</div>
        <div style={S.panel}>
          <Regle titre="Un tour = un trimestre">
            Vous jouez de {ANNEE_DEBUT} à {ANNEE_FIN}, quatre tours par an. Le bouton{" "}
            <span style={S.gold}>▸▸ Passer à la fin de l'année</span> enchaîne les trimestres restants quand vous
            n'avez rien à décider.
          </Regle>

          <Regle titre={HEURES_FONDATEUR + " heures par trimestre"}>
            C'est votre seule vraie ressource. Chaque action en coûte : une campagne marketing 80 h, une R&D
            180 h. Les heures que vous ne dépensez pas partent à l'établi et fabriquent des montres. Autrement
            dit, chaque heure de communication est une montre non produite.
          </Regle>

          <Regle titre="Vous fixez vos prix">
            Le jeu vous donne le coût de fabrication, jamais un prix conseillé. Une montre sans prix ne se vend
            pas. L'étude de marché chiffre la demande à plusieurs prix.
          </Regle>

          <Regle titre="Développer prend du temps">
            Une montre lancée en R&D sort au bout d'un à six trimestres. Rien n'est instantané, ni les
            modèles, ni les complications, ni la réputation.
          </Regle>

          <Regle titre="L'atelier plafonne tout">
            Vous ne pouvez pas produire plus d'heures qu'il n'y a de postes de travail. Embaucher sans
            agrandir ne sert à rien, et inversement.
          </Regle>

          <Regle titre="La faillite est définitive">
            Sous −50'000 CHF de caisse, la partie s'arrête (le seuil est en francs, quelle que soit la devise d'affichage). Il n'y a pas de retour en arrière : l'emprunt est
            là pour ça, servez-vous-en avant d'être au fond.
          </Regle>
        </div>

        <div style={S.h2}>CONSIGNE DE TEST</div>
        <div style={{ ...S.panel, borderColor: "#4A7C9E" }}>
          <span style={S.blue}>Merci de tester !</span>
          <br />
          <span style={S.steel}>
            Jouez au moins <span style={S.gold}>jusqu'en 2030</span> — les quinze premières années sont celles
            qu'on cherche à équilibrer. N'hésitez pas à utiliser{" "}
            <span style={S.gold}>▸▸ Passer à la fin de l'année</span> dès qu'un trimestre ne vous inspire aucune
            décision : c'est fait pour, et c'est plus rapide que de cliquer quatre fois.
            <br />
            <br />
            Notez tout ce qui vous surprend, vous bloque ou vous paraît injuste, même si ça vous semble
            évident. La première partie sert surtout à repérer ce qui est incompréhensible.
          </span>
        </div>

        <button style={S.cta} onClick={onContinuer}>
          CRÉER MA MARQUE ▸
        </button>
        <button style={S.ghost} onClick={onRetour}>
          Retour
        </button>
      </div>
    </div>
  );
}
