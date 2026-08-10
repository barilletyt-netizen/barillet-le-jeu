# Barillet — le jeu

Simulation de gestion horlogère, tour par tour trimestriel. Vous fondez une marque en 2015
et vous avez cinquante ans pour entrer au « Stanley Morgan Top 50 ».

Jeu web (Vite + React), jouable sur mobile.
Lore et design : [`docs/barillet-le-jeu-lore.md`](docs/barillet-le-jeu-lore.md) (v0.5).
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

## Ce qui est implémenté

### Session 1 — portage
Le prototype validé, porté sous Vite + React : UI « établi », 6 jauges, demande par
segment, événements 2015-2023, aléas, opportunités, classement annuel, sauvegarde
localStorage (automatique en début de trimestre + bouton manuel), déploiement Pages.

### Session 2 — moteur (spec v0.5)

- **Budget d'heures, plus de points d'action.** Le fondateur a **500 h par trimestre**.
  Chaque action en coûte (marketing 60 h, presse 40 h, R&D 150 h, Kickstarter 120 h…).
  Ce qui n'est pas dépensé part à l'établi : ces heures produisent des montres et font
  monter le savoir-faire (1 point par tranche de 200 h, plafonné à 2). L'ancien bonus
  établi a disparu — les heures libres *sont* l'établi.
- **Employés spécialisés** (30 h pour embaucher, ~450 h/trimestre chacun) :
  horloger et décorateur apportent des heures de production ; l'ingénieur réduit les
  heures de R&D de 40 % et fait gagner un trimestre de développement ; l'expert
  matériaux débloque bronze, titane, céramique et or et baisse les coûts matière de 20 %.
  Le décorateur débloque la **finition maison** (+1 h/pièce, qualité +1, entretient la
  désirabilité).
- **L'atelier est un plafond de postes** (500 h au départ, +450 h par agrandissement) :
  embaucher sans agrandir ne sert à rien, et inversement. Les heures productibles sont
  `min(heures du fondateur + heures d'équipe, postes)`.
- **Complications** — arbre Date → Chronographe → GMT → Phase de lune → Réserve de
  marche → Tourbillon. Chacune se recherche une fois (heures + CHF + trimestres) puis
  s'applique aux nouveaux modèles : heures/pièce, qualité et prix acceptable en hausse.
  Les hautes complications exigent un ingénieur, le tourbillon exige la manufacture.
- **Crédibilité rééquilibrée** : gains passifs au T1 de chaque année — +1 si le
  savoir-faire atteint 60, +1 tous les 5 ans d'existence de la marque.
- **Horizon 2015 → 2065** (50 ans, 200 trimestres).
- Sauvegarde en `barillet-save-v5` : les parties v4 (points d'action) ne sont pas
  migrées, le modèle a changé.

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

- **S3 — narratif** : récit trimestriel généré, brèves des concurrents, classement
  vivant (revenus du Top 50 qui évoluent), page d'introduction.
- **S4 — rythme** : objectifs quinquennaux, événements 2026-2065, aléas complets,
  les 20 YouTubeurs. C'est aussi là qu'il faudra replacer le **déblocage progressif
  des actions**, qui est sorti du plan révisé.
- **S5 — assets** : sprites par couches, avatars, personnage animé, menu animé, audio.
- **S6 — polish & beta** : équilibrage d'une partie complète 2015-2065, écrans de fin,
  build itch.io.
- **Fins alternatives** (Succession, Marque Culte, Empire, Montre du Siècle, Scandale) :
  seules Faillite / Top 50 / fin de partie sont implémentées.
- **Équilibrage long terme non fait** : l'horizon est passé à 2065 mais les seuils de
  rang et la courbe de demande n'ont pas été recalibrés sur 200 trimestres (c'est S6).
