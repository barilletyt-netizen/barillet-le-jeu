# Barillet — le jeu

Simulation de gestion horlogère, tour par tour trimestriel. Vous fondez une marque en 2015
et vous avez vingt ans pour entrer au « Stanley Morgan Top 50 ».

Jeu web (Vite + React), jouable sur mobile.
Lore et design : [`docs/barillet-le-jeu-lore.md`](docs/barillet-le-jeu-lore.md) (v0.4).
Prototype d'origine conservé pour référence : `docs/barillet-proto-v3.jsx.txt`.

## Développement

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # génère dist/
npm run preview  # sert dist/ localement
```

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy.yml` construit et publie `dist/` à chaque push sur `main`.
Pour l'activer une première fois : **Settings → Pages → Source : GitHub Actions**.

`vite.config.js` fixe `base: "/barillet-le-jeu/"` en build : si le dépôt est renommé,
changer cette valeur.

## Ce qui est implémenté (session 1)

Portage du prototype validé, avec les décisions de la spec v0.4 :

- **2 points d'action par trimestre** (au lieu de 3 dans le proto). Les PA non dépensés
  = travail à l'établi : savoir-faire +1 et coûts fixes −4'000 chacun.
- **Self-made à CHF 10'000** + dette étudiante de 30'000. Brutal, c'est voulu.
- **Capacité d'atelier en heures** : quartz 1 h/pièce, ébauche 3 h, manufacture 10 h.
  300 h au départ, +400 h par agrandissement d'atelier. En cas de saturation, toute
  la production est réduite au prorata.
- **Sauvegarde localStorage** : automatique en début de chaque trimestre, plus un bouton
  « Sauvegarder » manuel. Clé `barillet-save-v4`.
- Le reste (UI « établi », jauges, demande, événements 2015-2023, aléas, opportunités,
  classement annuel) reprend l'équilibrage du prototype.

## Structure

```
src/
  data/        config.js (pays, profils, mouvements, segments…), evenements.js, monde.js
  engine/      formules.js (demande, coûts, heures), simulation.js (le trimestre), save.js
  components/  Intro, Setup, Jeu, Rapport, BilanAnnuel, Fin
  styles.js    palette « établi » : vert nuit + laiton + ivoire
```

La demande a une source unique (`demandeBase` dans `formules.js`) : l'étude de marché et
la simulation utilisent la même formule, la simulation y ajoutant seulement l'aléa de ±15 %.

## Reste à faire

- **Session 2** : modules d'atelier (matériaux, complications, bureau technique),
  déblocage progressif des actions, rééquilibrage de la crédibilité (gains passifs).
- **Session 3** : les 20 YouTubeurs, les ~20 aléas complets, événements 2015-2026 enrichis.
- **Session 4** : sprites pixel art par couches, avatars, écrans de fin.
- **Horizon de partie** : le proto s'arrête en 2035 ; la spec v0.4 vise 2065 (50 ans).
  Constantes `ANNEE_DEBUT` / `ANNEE_FIN` dans `src/data/config.js`, à rouvrir quand
  l'équilibrage long terme sera fait.
- **Fins alternatives** (Succession, Marque Culte, Empire, Montre du Siècle, Scandale) :
  seules Faillite / Top 50 / fin de partie sont implémentées.
