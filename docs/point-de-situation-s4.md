# BARILLET — bilan de S4
### Branche `chantier-post-beta` · 32 commits · sauvegarde v10 · août 2026

> Ce document remplace la version rédigée en cours de session, dont les chiffres
> étaient antérieurs à la correction de tarification et donc caducs.

---

## 1. S4 est terminée

Les huit étapes du brief sont livrées, plus quatre chantiers qui n'y figuraient
pas et que la mesure a rendus nécessaires.

| | avant S4 | maintenant |
|---|---|---|
| événements historiques | 5 | **57** — un par année au moins, aucun trou |
| aléas | 10 | **54** |
| opportunités | 5 | **26** |
| décisions | 0 | **23** |

Les treize entrées « manquantes » du lot initial n'en sont plus : les douze
marquées *(choix)* sont devenues des décisions, `copieConcurrent` est un aléa
ordinaire, et six recrutements de direction se sont ajoutés.

**Outils de mesure** : `npm run sim` (santé, 40 parties), `npm run bots`
(équilibrage, options `--pays`, `--sans <evt>`, `--bot`, `--gamme`, `--plafond`,
`--opp`, `--opp-cat`, `--opp-une`), `npm run chrono` (couverture et effets
cumulés).

---

## 2. Les trois résultats qui comptent

### La chronologie a rendu le jeu gagnable

Sans toucher à une seule formule de demande. Le critère bloqué depuis des mois
est tombé le jour où le monde a cessé d'être vide entre 2024 et 2065.

### La correction de tarification a invalidé nos conclusions antérieures

Les bots fixaient leurs prix avec leur propre formule, sans la qualité, sans la
crédibilité, sans les multiplicateurs d'époque. Ils étaient aveugles à la moitié
du modèle économique. **La domination du haut de gamme, qu'on tenait pour
acquise depuis des mois, était partiellement un artefact de mesure** : une fois
corrigée, le Margeur perd 60 M et sept ans d'avance.

C'est la quatrième fois du projet que la distinction « on mesure le bot » /
« on mesure le jeu » a coûté du temps. Un avertissement est posé en tête de la
section équilibrage du lore.

### Les directeurs ont débloqué la fin de partie

Diagnostic : après 2050, les bots tournaient à **99% de capacité d'atelier avec
3,66 milliards en caisse et 19% du marché consommé**. Ni l'argent ni les clients
ne manquaient — il manquait un moyen de convertir l'un en l'autre. Le goulot
final était le budget d'heures du fondateur.

Un directeur **exonère** au lieu de multiplier : les actions de son domaine
tombent à 5 h, les 360 heures du fondateur ne bougent jamais. Six rôles, chacun
avec sa condition propre. Après implémentation, l'occupation d'atelier retombe à
12-21% et **les quatre stratégies atteignent le Top 50**, contre deux.

---

## 3. État de l'équilibrage — clos jusqu'à S6

```
bot          | entrée Top 50 | ans dedans | y finit | en sort | faillites | CA médian
Margeur      |          2047 |          6 |    0/10 |   10/10 |         0 | 214 M
Volumiste    |          2041 |          8 |    0/10 |   10/10 |         0 | 148 M
Prestigieux  |          2030 |         36 |    9/10 |    1/10 |         0 | 278 M
Équilibré    |          2047 |         16 |    2/10 |    8/10 |         0 | 229 M
```

| critère | état |
|---|---|
| le jeu est gagnable (≥ 2 stratégies au Top 50) | ✅ 4 sur 4 |
| aucune stratégie n'écrase les autres en CA (< 5×) | ✅ 1,9× |
| la meilleure y est encore en 2065 (majorité) | ✅ 9/10 |
| au moins une stratégie viable en sort | ✅ les quatre |
| l'Équilibré ne fait pas faillite | ✅ 0 |
| aucune stratégie ne domine (écart d'entrée < 10 ans) | ❌ **17 ans** |

**Le seul critère en échec est l'écart d'entrée**, tenu par le seul Prestigieux
qui entre en 2030 quand les autres arrivent en 2041-2047.

**Deux réserves de méthode**, plus importantes que le tableau :

1. **La cible de « finir dans le Top 50 sur 3 à 5 graines » est dépassée par le
   haut** : le Prestigieux y finit 9 fois sur 10. Rester est devenu trop facile
   pour lui.
2. **Un joueur expert atteint le rang 30 en 2023**, huit ans de partie, quand
   les bots n'entrent qu'entre 2030 et 2047. **L'écart expert/bot est de quinze
   à vingt ans, pas du facteur deux** qu'on supposait. Les critères mesurés sur
   les bots sont donc un plancher très bas, et le début de partie est
   probablement trop rapide pour qui sait quoi faire.

Conclusion : on ne rouvrira pas l'équilibrage avec des robots. Il faut des
joueurs qui découvrent.

---

## 4. Ce que la mesure a dit des opportunités

Accepter tout contre ne rien accepter vaut **1,6× à 2,3×** selon la stratégie.
Aucune n'est un passage obligé : elles sont des bifurcations, comme voulu.

La bissection par entrée a en revanche désigné des pièges, corrigés :
`horlogerLegendaire` coûtait un double salaire à perpétuité sans jamais rien
produire ; `salonAmerique` et `localCentreVille` étaient trop chers pour ce
qu'ils donnaient. `concoursDesign` reste un pari assumé.

Elle a aussi révélé un vrai défaut : **une proposition à effet définitif pouvait
revenir indéfiniment**. Le label Swiss made repassait tous les trois ans et
chaque refus multipliait le prix acceptable par 0,85 — cinq refus et la marque
était morte d'un cumul invisible. Toute proposition portant un modificateur sans
durée, une dilution ou une fin de partie ne se propose plus qu'une fois.

**Angle mort restant** : `labelSwissMade` n'est pas mesurable en l'état, parce
que les bots ne modélisent pas l'effet du label sur leurs propres prix.

---

## 5. Ce qui reste à faire, par ordre arrêté

### 1. Les cinq fins alternatives — priorité absolue

C'est ce qui achève la restructuration du Top 50 en jalon. Sans elles, la
deuxième moitié de partie n'a pas de but : entrer dans les cinquante ne termine
plus rien, et rien d'autre ne prend le relais.

Conditions déjà arbitrées en § 9 du lore, avec ordre de priorité et exclusions
mutuelles. **Codées à ce jour : la Succession (sous le nom « temps ») et le
Rachat par décision. Manquent : Marque Culte, Empire, Montre du Siècle,
Scandale.**

### 2. Le tutoriel

Trois à cinq pages courtes, consultables **avant** la partie et **rappelables en
jeu** depuis les endroits où le vocabulaire apparaît — ébauche, manufacture,
complication, anglage. Pas de mur de texte au démarrage. Ces pages servent aussi
de script vidéo pour la chaîne. C'est le retour de beta le plus fréquent.

### 3. Les canaux Baselworld (écart n° 3)

`swatchBaselworld`, `exodeBaselworld` et `salonUnique` portent aujourd'hui une
portée globale au lieu de modificateurs par canal, et le canal « salon de
Genève » n'existe pas. **L'exode doit forcer la bascule foires → e-commerce** :
c'est tout son intérêt, et en portée globale il n'est qu'un malus.

### 4. S5 — les assets

Sprites par couches, avatars, animations. Le verdict de tous les testeurs est
« austère », et c'est le seul chantier qui y réponde. Les emplacements 64×64
sont déjà posés dans les fiches de modèle.

---

## 6. Ce sur quoi le game designer doit trancher

1. **L'écart d'entrée de 17 ans se corrige-t-il, ou s'assume-t-il ?** Le
   Prestigieux entre en 2030 parce qu'il surfe sur `polarisation` dès 2026. Le
   corriger suppose de retoucher un événement structurant ; l'assumer suppose de
   dire qu'une stratégie de prestige *doit* décoller plus vite.
2. **Faut-il ralentir le début de partie ?** Le repère expert (rang 30 en huit
   ans) suggère que oui, mais aucun bot ne le montre. À trancher avec des
   playtests, pas avec le harnais.
3. **Les objectifs quinquennaux du S4 initial** n'ont pas été faits. Ils
   visaient exactement le problème que les fins alternatives vont traiter — y
   a-t-il encore lieu de les ajouter ?
4. **Les 20 YouTubeurs** restent bloqués sur les accords Frank sans C, Flyback
   et Clément Entretemps.

---

## 7. Points de vigilance techniques

- **`BETA_FERMEE` vaut `false` sur cette branche** et `true` sur `main`. Un
  merge rouvrirait la beta publique : à remettre à `true` dans le commit de
  merge.
- **Sauvegarde v10** : les parties antérieures ne se rechargent pas. La forme de
  l'état a trop changé.
- **Deux retours de test non traités** : la navigation dans une collection
  nombreuse reste laborieuse au-delà de six références, et un décrochage
  d'affichage des heures disponibles vers 100 salariés n'a jamais été reproduit.
