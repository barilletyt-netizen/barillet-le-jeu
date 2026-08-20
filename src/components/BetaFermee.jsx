import { S } from "../styles.js";
import { LIENS } from "../data/config.js";
import LiensBarillet from "./LiensBarillet.jsx";
import { ETIQUETTE } from "../version.js";

/**
 * Écran servi pendant la fermeture de la beta (drapeau BETA_FERMEE).
 *
 * Le jeu complet reste dans le code : on court-circuite simplement l'app. Aucun
 * bouton de contournement, et surtout aucune écriture dans le localStorage —
 * les parties des visiteurs doivent être intactes à la réouverture.
 */
export default function BetaFermee() {
  const lien = (url, texte) =>
    url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" style={S.lien}>
        {texte}
      </a>
    ) : (
      <span style={S.gold}>{texte}</span>
    );

  return (
    <div style={S.root}>
      <div style={{ ...S.wrap, paddingTop: 70, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>⌚</div>
        <div style={{ ...S.h1, fontSize: 20 }}>BARILLET</div>
        <div style={{ ...S.steel, marginTop: 10 }}>le jeu</div>

        <div style={{ ...S.h2, marginTop: 34 }}>BETA FERMÉE POUR TRAVAUX</div>

        <div style={{ ...S.panel, textAlign: "left" }}>
          Merci aux testeurs de la première vague. Vos parties, vos faillites et vos remarques ont servi :
          l'équilibrage est en chantier, et une bonne partie de ce que vous avez signalé est déjà corrigé.
          <br />
          <br />
          Le jeu rouvrira une fois le moteur réglé et la couche narrative en place.
        </div>

        <div style={{ ...S.panel, borderColor: "#C9A227", textAlign: "left" }}>
          <span style={S.gold}>La suite au devlog #1</span>
          <br />
          <span style={S.steel}>
            sur {lien(LIENS.youtube, "la chaîne YouTube Barillet")}
            {LIENS.youtube ? "" : " (lien à venir)"}.
          </span>
          <br />
          <br />
          <span style={S.steel}>
            Accès anticipé à la prochaine version via le Discord — l'invitation est en description de la
            vidéo et dans la newsletter.
          </span>
        </div>

        {/* Les mêmes liens qu'à l'accueil : une seule liste à tenir à jour. */}
        <LiensBarillet />

        <div style={{ ...S.steel, marginTop: 26, fontSize: 14, opacity: 0.7 }}>{ETIQUETTE}</div>
      </div>
    </div>
  );
}
