# Barillet — le jeu

Simulation de gestion horlogère, tour par tour trimestriel. Vous fondez une marque en 2015
et vous avez cinquante ans pour entrer au « Stanley Morgan Top 50 ».

Jeu web (Vite + React), jouable sur mobile.
Lore et design : [`docs/barillet-le-jeu-lore.md`](docs/barillet-le-jeu-lore.md) (v0.6).
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

- **Budget d'heures, plus de points d'action.** Le fondateur a **360 h par trimestre**.
  Chaque action en coûte (marketing 80 h, presse 50 h, R&D 180 h, Kickstarter 160 h…).
  Ce qui n'est pas dépensé part à l'établi : ces heures produisent des montres et font
  monter le savoir-faire (1 point par tranche de 150 h, plafonné à 2). L'ancien bonus
  établi a disparu — les heures libres *sont* l'établi.
  *(L'addendum disait 500 h ; le playtest a tranché à 360 h, c'était trop facile.)*
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
  marche → Tourbillon, **à trois paliers chacune** (18 recherches). Il faut maîtriser une
  famille au niveau 2 pour ouvrir la suivante. Chaque palier ajoute des heures/pièce, de
  la qualité et du prix acceptable ; un modèle fige le niveau du jour de sa création.
  Les hautes complications exigent un ingénieur, le tourbillon exige la manufacture.
- **Crédibilité rééquilibrée** : gains passifs au T1 de chaque année — +1 si le
  savoir-faire atteint 60, +1 tous les 5 ans d'existence de la marque.
- **Horizon 2015 → 2065** (50 ans, 200 trimestres).
- Sauvegarde en `barillet-save-v7` : les parties antérieures ne sont pas
  migrées, le modèle a changé.

### Retours du premier smoke test (v0.6)

- **Le joueur fixe ses prix.** Plus aucun prix suggéré : la conception annonce le
  coût de fabrication, la qualité et les heures par pièce. Une montre sans prix ne
  se vend pas. L'étude de marché chiffre la demande à trois prix différents.
- **Distribution par canaux** au lieu d'une jauge sur 100 : vente directe,
  e-commerce, foires, détaillants agréés, boutique en propre — trois paliers
  chacun. Chaque canal a une portée (volume) et une marge : les AD ouvrent le gros
  volume mais prennent 45%, la boutique en propre garde tout et coûte une fortune.
- **Matériaux à rechercher** (bronze → titane → céramique / or), en plus d'exiger
  l'expert : on ne passe plus directement à l'or dès l'embauche.
- **Jusqu'à 3 complications par montre**, heures et qualité cumulées.
- **Chefs d'atelier** : au-delà de 5 personnes en production par chef, l'équipe ne
  rend qu'une fraction de ses heures. **Licenciement** possible, avec indemnité.
- **Impôt de 18%** sur le bénéfice annuel, prélevé au T4.
- **Classement cohérent** : rang et revenus des concurrents dérivent d'une même
  table interpolée. Fini le concurrent 92e avec plus de chiffre qu'un 50e.
- **Volumes rééquilibrés** : la saturation d'un segment se mesure sur les ventes
  récentes et se résorbe (au lieu de fermer le marché pour toujours), les pools
  sont élargis, la notoriété monte moins vite, le facelift coûte 75% du budget R&D.
  Une partie type démarre autour de 0,15 M la première année et met une dizaine
  d'années à passer le million — au lieu de millions dès la 2e année.

### Retours de beta, vague 1 (v0.6.1)

Trois testeurs externes, tous en faillite rapide sans l'avoir vue venir.

- **Barre de statut persistante** en bas d'écran (public mobile) : heures, caisse,
  trimestre. Les heures se décomptent avec une micro-animation et l'écart s'affiche
  brièvement (« −80 h »). La caisse passe en rouge sous le seuil d'alerte.
- **Avertissement de faillite** : « ⚠ À ce rythme, faillite dans ~N trimestres »
  dès que la caisse projetée passe sous zéro, avec un niveau intermédiaire quand la
  trésorerie descend sous deux trimestres de coûts fixes. Même seuil que le rouge
  de la barre.
- **Immédiat contre fin de trimestre** : témoin « ✓ fait » sur chaque action jouée
  (avec le compte si elle est répétée), remis à zéro au tour suivant ; et le bouton
  de fin de trimestre précise que les ventes, coûts et production se calculent alors.
- **Générateur de noms** : marque et modèles pré-remplis avec des propositions
  d'inspiration jurassienne, toujours modifiables, avec un bouton 🎲 pour relancer.
- **Devise d'affichage selon le pays** : € en France, ¥ au Japon, ¥ CNY en Chine.
  Cosmétique uniquement — `src/engine/devise.js` convertit à l'affichage, le moteur
  ne connaît que le franc.
- **Témoin « sauvegarde auto ✓ »** dans la barre de statut à chaque autosave.

Le format de sauvegarde reste `barillet-save-v7`, inchangé : les parties de
testeurs en cours restent lisibles.

### Retours de beta, vague 2 (v0.6.2)

- **Le compteur d'heures est devenu un solde unique** : `heures du fondateur
  restantes + heures d'atelier (corrigées de l'encadrement) − production
  planifiée`. Programmer 200 pièces de quartz fait passer le solde de 360 h à
  160 h, immédiatement. Le détail du calcul s'affiche sous le solde et dans la
  barre, pour qu'il reste vérifiable.
- **L'atelier s'agrandit par tranches de 4 postes** (200'000 CHF, +1'800 h,
  14'000 CHF/trim) au lieu d'un poste à la fois, et l'atelier de départ passe à
  810 h : le fondateur plus un compagnon, pour que la première embauche serve
  tout de suite.
- **L'encadrement se voit avant de cliquer** : le panneau d'embauche annonce si
  ce recrutement va demander un chef d'atelier de plus et à quelle efficacité
  l'équipe tomberait, et l'entrée « chef d'atelier » chiffre le gain. L'alerte
  de sous-encadrement est passée en bandeau, au même rang que l'alerte de
  faillite, avec les heures perdues du trimestre.

### Phase A post-beta (v0.7.0)

Les points 1 à 6 du patch UX étaient déjà livrés en v0.6.1/v0.6.2 (barre de statut,
alerte de faillite, « fait ✓ », générateur de noms, devise par pays, témoin
d'autosave). Nouveautés de cette phase :

- **Le fondateur encadre ses 3 premiers employés** sans chef d'atelier. La
  pénalité d'efficacité ne s'applique qu'au-delà : le chef devient un palier de
  croissance, plus un prérequis à la première embauche.
- **Les conseils vérifient la faisabilité** : aucun message ne recommande une
  dépense qui ferait passer la trésorerie sous trois trimestres de coûts fixes.
  Sous ce seuil, la formulation devient neutre et informative, sans injonction.
- **Production explicite** : le bandeau d'heures dit que le solde sert à
  produire, un badge « ⚠ production non réglée » marque tout modèle actif à
  zéro, et un rappel apparaît avant de clore le trimestre.
- **Coûts fixes décomposés** : panneau dépliable en jeu et détail ligne à ligne
  dans le rapport (structure, salaires par poste, agrandissements, canaux).

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
