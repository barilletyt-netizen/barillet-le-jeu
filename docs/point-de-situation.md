# BARILLET — LE JEU · Point de situation

*État au 11 août 2026. Document destiné au chef de projet / game designer.*
*Rédigé par l'agent de développement. Toutes les valeurs chiffrées sont vérifiées dans le code, pas de mémoire.*

---

## 1. En une phrase

Le jeu est **en ligne et jouable de bout en bout** : https://barilletyt-netizen.github.io/barillet-le-jeu/
Sessions S1 et S2 du plan v0.5 livrées, plus une session non prévue (« S2.5 ») qui traite les onze retours du premier smoke test. Il reste S3 à S6, dont toute la couche narrative et tous les assets.

---

## 2. Où en est le projet

### Livré

| Session | Contenu | État |
|---|---|---|
| **S1 — portage** | Proto porté sous Vite + React, 6 écrans, sauvegarde localStorage, déploiement GitHub Pages automatique | ✅ |
| **S2 — moteur** | Budget d'heures (remplace les PA), employés spécialisés, arbre de complications, crédibilité rééquilibrée, horizon 2065 | ✅ |
| **S2.5 — retours playtest** | Prix libre, canaux de distribution, recherche des matériaux, complications cumulables, encadrement, licenciements, impôts, cohérence du classement, rééquilibrage des volumes | ✅ |

### Reste à faire

| Session | Contenu | Remarque |
|---|---|---|
| **S3 — narratif** | Récit trimestriel généré, brèves des concurrents, classement vivant (revenus du Top 50 qui évoluent), page d'introduction | C'est la réponse directe au verdict « austère ». Rien n'est commencé. |
| **S4 — rythme** | Objectifs quinquennaux, événements 2026–2065, ~20 aléas complets, les 20 YouTubeurs | Aujourd'hui : 5 événements historiques (2015-2023) et 10 aléas. |
| **S5 — assets** | Sprites par couches, avatars, personnage animé, menu animé, intégration audio | Aucun asset. Le jeu est 100% typographique. |
| **S6 — polish & beta** | Équilibrage d'une partie complète 2015-2065, écrans de fin, build itch.io | L'équilibrage long terme n'a jamais été testé sur 200 trimestres. |

**Jalons annoncés** : beta communauté fin novembre, devlog #1 dès que S2–S3 donnent quelque chose à montrer. **S3 est le prochain morceau à faire, et c'est aussi celui qui débloque le devlog.**

---

## 3. Ce qui tourne aujourd'hui

### Technique
- **Stack** : Vite 6 + React 18, aucune dépendance hors React. ~2 800 lignes.
- **Dépôt** : `barilletyt-netizen/barillet-le-jeu`, public. 5 commits sur `main`.
- **Déploiement** : GitHub Actions, automatique à chaque push sur `main`. ~40 s.
- **Structure** : `src/data/` (config, événements, monde) · `src/engine/` (formules, simulation, sauvegarde) · `src/components/` (6 écrans) — le moteur est séparé de l'UI et testable en Node sans navigateur.
- **Sauvegarde** : localStorage, clé `barillet-save-v7`, automatique en début de trimestre. Aucune migration entre versions : chaque changement de modèle invalide les parties en cours.

### Boucle de jeu
Tour = 1 trimestre, 2015 → 2065 (200 tours). Le fondateur dispose de **360 heures par trimestre** ; toute action en coûte, et ce qui reste part à l'établi (production + savoir-faire).

**Coûts en heures** : marketing 80 · campagne choc 110 · presse 50 · R&D 180 · facelift 140 · édition limitée 80 · Kickstarter 160 · étude de marché 40 · soldes 30 · embauche 40 · licenciement 30 · agrandir l'atelier 60 · emprunt 30 · canaux 40 à 140 selon le palier.

**Production** : quartz 1 h/pièce, ébauche 3 h, manufacture 10 h, plus les heures de complication et de finition. Heures productibles = `min(heures du fondateur + heures d'équipe × efficacité d'encadrement, postes d'atelier)`.

**Équipe** : horloger (8 000/trim) et décorateur (9 000) apportent 450 h de production ; ingénieur (12 000) accélère la R&D ; expert matériaux (10 000) donne accès aux alliages ; chef d'atelier (14 000) encadre 5 personnes en production. Sans encadrement suffisant, l'équipe ne rend que 55 % de ses heures.

**Atelier** : 500 h de postes au départ, +450 h par agrandissement à 120 000 CHF.

**Distribution** — 5 canaux, 3 paliers chacun, avec portée (volume) et marge (part encaissée) :

| Canal | Portée max | Marge | Verrou |
|---|---|---|---|
| Vente directe | ×0.7 | 100 % | — |
| E-commerce | ×2.0 | 92 % | — |
| Foires et salons | ×1.4 | 95 % | — |
| Détaillants agréés | ×5.0 | **55 %** | crédibilité ≥ 6 |
| Boutique en propre | ×2.6 | 100 % | notoriété ≥ 30 |

**Produit** : 3 mouvements × 4 styles × 5 matériaux × 6 familles de complications à 3 paliers (18 recherches) × finition, jusqu'à 3 complications par montre. Matériaux et complications se recherchent (heures + CHF + trimestres). **Le joueur fixe ses prix lui-même** : le jeu annonce le coût de fabrication, pas un prix suggéré ; une montre sans prix ne se vend pas.

**Économie** : impôt de 18 % sur le bénéfice annuel au T4, intérêts trimestriels sur la dette, coûts fixes = base + masse salariale + ateliers + canaux.

**Jauges** : notoriété, crédibilité, désirabilité, savoir-faire (la distribution est devenue les canaux). Déclin naturel chaque trimestre, gains passifs de crédibilité au T1 (savoir-faire ≥ 60, ancienneté par tranche de 5 ans).

**Contenu** : 5 événements historiques (2015-2023), 10 aléas, 5 opportunités, 4 segments de marché, classement annuel avec voisins cohérents, 3 fins (faillite, Top 50, fin de partie).

---

## 4. Historique des playtests et arbitrages

Trois retours du joueur, chacun a modifié le design :

**Playtest 1 — « le mur des postes n'est pas explicite »**
→ Le panneau d'embauche annonce désormais les heures réellement utilisables compte tenu des postes libres, et le bandeau d'heures signale la main-d'œuvre payée mais inemployable.

**Playtest 2 — « avec 500 h on peut faire beaucoup trop de choses, le jeu est bien trop facile »**
→ Budget descendu de 500 à **360 h**, coûts d'action relevés. Une R&D mange la moitié du trimestre.

**Playtest 2 — « les R&D de complication sont trop simples »**
→ Chaque famille passe à **3 paliers nommés** (18 recherches), et il faut maîtriser une famille au niveau 2 pour ouvrir la suivante.

**Playtest 3 — onze points**, tous traités : prix imposé par le segment, événements avant la première montre, répétition des opportunités, distribution en jauge /100, facelift trop bon marché, absence d'impôts, une seule complication par montre, impossibilité de licencier, matériaux accessibles d'un coup, incohérence du classement, et la critique de fond ci-dessous.

**Critique de fond du playtest 3** : « la demande augmente facilement, rien ne pénalise la progression, on fait des millions dès la 2ᵉ année ; et à l'inverse il y a un mur vers 25–30 M que rien ne permet de franchir ».
→ Cause identifiée : la saturation de marché était **cumulative sur toute la partie** — chaque vente fermait le marché définitivement. Elle se mesure maintenant sur les ventes récentes et se résorbe de 25 % par trimestre. Les pools de segments ont été élargis (grand public 90 000 → 800 000), la notoriété monte plus lentement, et les freins ajoutés (impôts, encadrement, coûts fixes des canaux, marge des AD) ralentissent le début.

**Courbe obtenue** (simulation d'un joueur automatique, classe moyenne, un seul modèle quartz) :

| Année | CA | Résultat net | Pièces | Rang |
|---|---|---|---|---|
| 2015 | 0,15 M | +0,01 M | 569 | 1243 |
| 2017 | 0,47 M | +0,08 M | 1 791 | 864 |
| 2022 | 1,04 M | +0,14 M | 5 070 | 616 |
| 2029 | 2,44 M | +0,26 M | 13 223 | 405 |

Deux ans avant le décollage, dix ans pour passer le million. Plafond théorique levé : le seul segment lifestyle peut désormais supporter les 60 M du Top 50 — mais il faut une gamme complète, pas un modèle.

---

## 5. Décisions à arbitrer

### Curseurs posés sans repère de playtest
Trois valeurs ont été choisies par déduction, jamais validées manette en main :
1. **Marge des détaillants agréés à 55 %.** C'est le curseur qui décide si passer par les AD est un bon calcul ou un piège. C'est l'arbitrage central de toute la distribution.
2. **Rythme des dix premières années.** La courbe ci-dessus est-elle « lente et tendue » comme Coffee Inc, ou juste lente ?
3. **Un chef d'atelier pour 5 personnes**, chute à 55 % d'efficacité sans encadrement. Aucun repère pour savoir si le palier tombe au bon moment.

### Points de design en suspens
- **Le déblocage progressif des actions** (campagne choc → notoriété ≥ 20, etc.) était dans le plan v0.4, a disparu du plan révisé v0.5, et n'est donc dans aucune session. À replacer, probablement S4.
- **Les départements** (commercial, marketing, IT) que le lore mentionne « plus tard » : c'est le prolongement naturel des chefs d'atelier si on veut pousser la hiérarchie. Non planifié.
- **Les 4 fins alternatives** (Succession, Marque Culte, Empire, Montre du Siècle, Scandale) n'ont pas de conditions chiffrées. Marqué « à trancher » depuis la v0.4.
- **Accords YouTubeurs** : Frank sans C, Flyback, Clément Entretemps sont des chaînes réelles. Accord à obtenir ou passage en parodie **avant publication**. Bloquant pour S4.
- **Salons fictifs** : 5-6 à nommer, jamais fait.

### Risque principal
**L'équilibrage long terme n'a jamais été testé.** L'horizon est passé à 2065 (200 trimestres) mais aucune partie complète n'a été jouée ni simulée jusqu'au bout. Les seuils de rang, la courbe de demande et la progression des concurrents sont calibrés sur les vingt premières années au mieux. C'est le périmètre de S6, mais si la beta communauté est fin novembre, c'est le poste qui peut déraper.

---

## 6. Ce que je recommande comme prochaine étape

**S3 (narratif)**, pour trois raisons : c'est la réponse directe au verdict « austère » qui traîne depuis le proto ; c'est ce qui débloque le devlog #1 ; et c'est indépendant de l'équilibrage, donc ça n'entre pas en conflit avec les arbitrages du point 5.

Contenu attendu : récit trimestriel par gabarits (actions du joueur + aléa + résultat commercial + brève du monde), 1-2 brèves de concurrents par trimestre, revenus du Top 50 qui évoluent d'année en année, et une page d'introduction au lancement de partie.

Si le chef de projet préfère sécuriser l'équilibrage avant d'ajouter du contenu, l'alternative est de remonter S6 et de faire une passe de simulation complète 2015-2065 — mais le jeu restera austère pour la beta.
