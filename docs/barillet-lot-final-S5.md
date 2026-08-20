# BARILLET — LOT DE SPÉCIFICATION · fins, mentor, catalogue, prérequis métier
## À implémenter après les chantiers en cours. Arbitré par le game designer, fait foi sur toute version antérieure du lore.

---

# ⚠ AVERTISSEMENT PRÉALABLE — la qualité n'est pas plafonnée

Un modèle avec 3 complications, mouvement manufacture, or et finition maison atteint **17/10** en qualité. L'échelle affichée est sur 10, le calcul ne borne rien.

**C'est très probablement un bug — et le critère de la fin « La Montre du Siècle » repose dessus (qualité ≥ 17).** Décision du game designer : **ne pas plafonner la qualité.** Si tu estimes devoir corriger ce calcul pour une autre raison, **préviens avant de le faire** : la fin deviendrait inatteignable. Documente le comportement dans le lore comme un choix assumé, pas comme un oubli.

---

# 1 · LES YOUTUBEURS — accords tranchés

- **Accords obtenus** : Flyback, MoonWatch (JC). Ils peuvent être nommés tels quels.
- **Accords non obtenus** : Frank sans C, Clément Entretemps → **ne pas les nommer**, remplacer par des parodies dans la liste des archétypes.
- **Easter egg obligatoire** : **Barillet lui-même figure comme YouTubeur dans le jeu.** Prévu depuis la v0.4, ne pas le perdre. Archétype : le vulgarisateur francophone, sensible aux montres accessibles, bonus de crédibilité modéré et de notoriété sur les segments grand public et lifestyle.

---

# 2 · LES LETTRES D'OLIVIER — objectifs quinquennaux

## 2.1 Le personnage

**Olivier**, le mentor. Vieil horloger de la vallée, celui qui a formé le fondateur. Il écrit **tous les cinq ans**, et sa lettre s'affiche **sous la Gazette du Balancier**, dans une mise en forme distincte (papier à lettre, écriture manuscrite, ton personnel — pas le ton journalistique de la Gazette).

**Arc narratif sur 50 ans :**
- 2015-2030 : sceptique et exigeant. Il doute, il pousse, il compare à ce qu'il a connu.
- 2030-2045 : fier, mais toujours un cran au-dessus de ce que le joueur a fait.
- 2045-2048 : inquiet, il parle de transmission et de ce qui restera.
- **2048 : Olivier meurt.** La lettre de 2050 est écrite par sa fille, qui a trouvé les brouillons de son père.
- 2050-2060 : la fille continue, d'un ton différent — plus distant, plus admiratif.
- **2065 : une lettre scellée d'Olivier**, écrite avant sa mort, s'ouvre à la fin de la partie. Son contenu s'adapte à la trajectoire finale (Top 50 / indépendante / en difficulté / rachetée).

C'est le seul fil narratif continu de la partie. Il coûte peu et vaut beaucoup.

## 2.2 Les objectifs

Un objectif par période, **proposé et non imposé**. Le jeu choisit la variante qui correspond le mieux à l'état et à la stratégie apparente de la marque. Suivi dans le récapitulatif annuel, au même titre que la position au Top 50.

| Période | Objectif | Récompense si atteint |
|---|---|---|
| 2015-2020 | 1 M de CA annuel **ou** une famille de complication maîtrisée **au palier 3** | Une R&D offerte (0 h, 0 CHF) |
| 2020-2025 | Entrer dans les 1000 **ou** 4 références actives | Une tranche d'atelier offerte |
| 2025-2030 | 5 M de CA **ou** 5 salariés | Un recrutement de direction offert (heures et frais d'embauche) |
| 2030-2035 | Entrer dans les 500 **ou** maîtriser 2 matériaux | Crédibilité +10 et un palier de canal offert |
| 2035-2040 | 25 M de CA **ou** 10 salariés | Subvention de 1 M CHF |
| 2040-2045 | Entrer dans les 200 **ou** traverser le krach de 2043 sans faillite | Désirabilité +12 |
| 2045-2050 | Entrer dans les 100 **ou** bâtir une manufacture | Manufacture à moitié prix |
| 2050-2055 | Entrer dans les 50 | Crédibilité +15 et une opportunité exceptionnelle débloquée |
| 2055-2060 | Rester 5 ans dans le Top 50 **ou** avoir racheté 3 marques | Un directeur offert, salaire pris en charge 5 ans |
| 2060-2065 | Finir dans le Top 50 **ou** atteindre une fin alternative | Épilogue enrichi dans la lettre scellée |

## 2.3 Règle absolue : aucune pénalité en cas d'échec

Un objectif raté ne coûte **rien** : ni jauge, ni argent, ni malus caché. Seulement une ligne d'Olivier, déçue mais jamais dure, et l'objectif suivant qui arrive.

**Raison :** un testeur de la beta est mort en suivant à la lettre la chaîne de conseils du jeu. On ne recrée pas ce piège sous une forme narrative. Olivier suggère, il ne commande pas, et sa déception ne se paie pas en points.

---

# 3 · EFFET DE CATALOGUE — trois pénalités, aucune limite dure

**Problème mesuré :** deux modèles visant le même segment additionnent aujourd'hui leur demande. Une gamme de 8 références vaut 8× une gamme de 2, ce qui pousse à empiler sans fin. Ce n'est pas réaliste : une marque qui multiplie les déclinaisons dilue son identité et perd ses clients.

**Pas de plafond au nombre de références.** Trois pénalités économiques :

1. **Cannibalisation.** Deux modèles visant le même segment **se partagent son pool** au lieu de l'additionner, pondéré par leur attractivité respective (prix, qualité, fraîcheur, style). Deux modèles sur des segments différents restent additifs.
2. **Dilution de la désirabilité.** Au-delà de **6 références actives**, chaque référence supplémentaire coûte **−1 de désirabilité par trimestre**. La rareté perçue baisse quand tout est disponible.
3. **Coût d'entretien.** Chaque référence active coûte des heures et des francs par trimestre (stock, pièces détachées, catalogue). Une référence qui ne se vend plus devient un poids, pas un décor gratuit.

**Objectif d'équilibrage : une taille de catalogue optimale entre 4 et 12 selon la stratégie.** Remesurer avec `npm run bots -- --gamme` après implémentation. Si l'optimum sort sous 4 ou au-dessus de 15, les curseurs sont mal réglés.

---

# 4 · PRÉREQUIS MÉTIER — coller à la réalité de la manufacture

## 4.1 Le tourbillon

**Exige 4 ingénieurs employés simultanément ET un directeur technique en poste.**

⚠ **Le directeur technique n'existe pas** dans les six rôles actuels (production, RH, SI, commercial, marketing, finance). **C'est un septième rôle à créer :**

- **Directeur technique** — salaire du niveau des autres directeurs (~30'000 CHF/trimestre). Exonère les actions de R&D et de recherche de complication (à 5 h), **mais ne délègue pas la création de modèle** : la règle intangible reste, le produit se conçoit aux heures du fondateur. Prérequis d'embauche : ≥ 2 ingénieurs employés et savoir-faire ≥ 50.
- Il est le prérequis exclusif du tourbillon, et devient la figure qui manque à la haute horlogerie dans le jeu.

## 4.2 Les matériaux

Chaque cran exige un nombre croissant d'experts matériaux **employés simultanément** :

| Matériau | Experts matériaux requis |
|---|---|
| Bronze | 1 |
| Titane | 2 |
| Céramique | 3 |
| Or | 4 |

La recherche du matériau reste par ailleurs nécessaire (heures + CHF + trimestres) : l'expert débloque l'accès, il ne remplace pas la recherche.

## 4.3 Conséquence à mesurer

Avec 4 experts matériaux pour l'or **et** le coût de l'or ×2,2 après `or5000` (2026), **le segment bling devient probablement inaccessible avant 2035**. C'est réaliste et voulu, mais **à vérifier aux bots** : si aucune stratégie ne peut plus l'atteindre du tout sur une partie complète, signale-le avant de corriger.

---

# 5 · LES CINQ FINS ALTERNATIVES — version validée

**Ces conditions font foi et remplacent toute version antérieure du lore.** Ordre de priorité en cas de cumul : Scandale > Empire > Montre du Siècle > Marque Culte > Succession.

### 1. Le Scandale *(défaite narrative, priorité maximale)*
Compteur de complaisances ≥ 6 **et** l'aléa d'enquête a frappé au moins 2 fois — **ou** crédibilité tombée sous 10 après avoir dépassé 50.
> La marque survit, le fondateur est écarté de l'industrie. Distinct de la faillite : les comptes allaient bien.

### 2. L'Empire
3 marques indépendantes rachetées **et** directeur de production en poste **et** rang ≤ 100 en 2065 **et** ≥ 200 M en caisse.
> Le chassé est devenu le chasseur. Incompatible avec la Marque Culte.

### 3. La Montre du Siècle
Un modèle possédant : tourbillon **manufacture**, **qualité ≥ 17**, complications de palier 3, savoir-faire ≥ 80 au moment de sa création, et entré au musée (aléa `museeExpo`).
> Le nom passe à la postérité même si la marque est restée moyenne. Victoire d'artisan.
> *(Rappel : le seuil de 17 dépend du calcul de qualité non plafonné — voir l'avertissement en tête de document.)*

### 4. La Marque Culte
Le catalogue n'a **jamais** dépassé **5 références actives** sur toute la partie **et** désirabilité ≥ 90 pendant 10 ans consécutifs **et** indépendance préservée en 2065.
> Pas de contrainte de directeurs ni de volume produit : c'est la retenue du catalogue qui fait la marque culte.

### 5. La Succession
Arriver en 2065 vivant, indépendant, sans faillite ni rachat.
> La lettre scellée d'Olivier s'ouvre, puis la maison passe à l'un des enfants avec un mot : « fais mieux que moi. » Variantes d'épilogue selon le rang final.

---

# 6 · ÉCRAN DE FIN ENRICHI — révéler les autres fins

Après **chaque** fin, l'écran affiche **la liste des cinq fins** :
- **celles atteintes** : révélées avec leur nom et leur description complète
- **celles non atteintes** : révélées comme **indices, sans aucun chiffre**

Exemples d'indices (rédiger dans le même ton) :
> « Certaines maisons n'ont jamais laissé leur catalogue dépasser une poignée de références — et c'est ce qui les a rendues légendaires. »
> « D'autres ont préféré racheter leurs concurrents plutôt que de les affronter. »
> « Une maison n'est jamais tombée à cause de ses comptes, mais à cause de ce qu'elle offrait aux journalistes. »
> « Un seul garde-temps a suffi à faire passer un nom à la postérité, dans une maison qui n'a jamais été grande. »
> « Il y a ceux qui gagnent, et ceux qui transmettent. »

**Objectif :** une collection à débloquer, qui donne envie de relancer une partie. C'est le principal levier de rejouabilité du jeu.

---

# 7 · ORDRE DE TRAVAIL

1. **Les quatre fins manquantes** (Marque Culte, Empire, Montre du Siècle, Scandale) + l'écran de fin enrichi
2. **L'effet de catalogue** (section 3) + remesure `--gamme`
3. **Les lettres d'Olivier** (section 2)
4. **Le directeur technique et les prérequis métier** (section 4) + remesure de l'accessibilité du bling
5. **La navigation dans une collection de plus de six références** (retour de beta non traité)
6. **Le tutoriel**
7. **Les canaux Baselworld** (écart n° 3)
8. **S5 — les assets**

Si tout ne tient pas dans une session, arrête-toi à un chantier complet et dis-moi où. Comme d'habitude : signale les écarts que tu as pris et pourquoi.
