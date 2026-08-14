# BARILLET — LE JEU
## Document de lore et de design — v0.7 (août 2026)

> Simulation de gestion horlogère, tour par tour trimestriel, pixel art.
> Inspiration : Coffee Inc 2. Objectif : contenu pour la chaîne Barillet (devlogs + communauté).
> Plateforme v1 : jeu web (GitHub Pages / itch.io), jouable sur mobile.
> **Statut : boucle cœur validée en proto (3 itérations), portée sous Vite + React (S1), moteur d'heures en place (S2).**
> Verdict playtest v0.4 : « un début, mais austère » → le fun viendra des assets, du déblocage progressif et de la variété de contenu. Les mécaniques tiennent.
> **Changement majeur v0.5 : les points d'action sont remplacés par un budget d'heures.**

---

## 1. Cadre temporel

- **Début : 2015.** Durée : 50 ans → fin en 2065. (Appliqué depuis S2.)
- **Tour = 1 trimestre** (200 tours). Passage d'année entière en un clic : indispensable (validé).
- **Courbe de progression visée** (playtest, référence Coffee Inc 2) : une à deux années avant le décollage, pas de millions de bénéfice dès la 2e année. La saturation d'un segment se mesure sur les **ventes récentes** et se résorbe, au lieu de fermer le marché définitivement — sinon le joueur bute sur un mur infranchissable vers 25–30 M de CA.
- **Objectifs quinquennaux** : tous les 5 ans (2020, 2025, 2030…), un méga-événement — bilan de décennie du Stanley Morgan + un objectif proposé pour les 5 ans suivants (ex. « atteindre CHF 500'000 de revenus annuels », « lancer une mécanique », « entrer au top 500 »). Objectif atteint = récompense (crédibilité, offre de financement, invitation salon majeur). Raté = conséquence douce. C'est ce qui relance l'intérêt du passage des trimestres sur 200 tours. (Session S4.)

### Événements historiques scriptés 2015–2026
- **Janv. 2015 : la BNS abandonne le taux plancher** — le CHF s'envole de 20% en un jour. Coûts suisses en forte hausse, exportateurs en crise. (Événement d'ouverture brutal si départ en Suisse.)
- 2015 T2 : lancement Apple Watch (choc quartz entrée de gamme, 2 ans)
- 2016–2017 : ralentissement chinois puis reprise des exportations
- 2017 : la Daytona « Paul Newman » vendue 17,8 M$ aux enchères — le vintage explose, désirabilité mécanique +
- 2019–2020 : **mort de Baselworld** — le salon historique s'effondre, recomposition des salons
- 2020 : Covid — salons annulés, boutiques fermées, boom e-commerce
- 2021–2022 : bulle spéculative (marché gris, listes d'attente)
- 2023–2025 : correction du marché de l'occasion
- 2025 : tensions douanières US — droits de douane sur les montres suisses

### Événements fictifs 2026–2065 (timeline de prédiction)
- 2027 : taxe carbone européenne sur les produits de luxe (coûts +, image des marques « propres » +)
- 2028 : la génération Z redécouvre le mécanique — boom des petites marques accessibles
- 2030 : pénurie de composants électroniques — le quartz et les smartwatches en crise, renaissance mécanique
- 2032 : première montre à boîtier imprimé 3D certifiée chronomètre — le « fait main » se repositionne
- 2034 : l'Inde devient le 2e marché horloger mondial (nouveau segment géographique)
- 2036 : un grand groupe coupe la fourniture de mouvements aux tiers (écho ETA) — crise des marques d'assemblage, prime aux manufactures
- 2038 : une IA conçoit un mouvement primé — crise identitaire de l'artisanat, le « 100% humain » devient un label
- 2040 : interdiction de l'or minier — or recyclé obligatoire (coûts, opportunité d'image)
- 2043 : krach financier mondial — le luxe s'effondre 2 ans
- 2046 : traité de réglementation du marché gris — la spéculation encadrée, désirabilité recalibrée
- 2050 : renaissance artisanale mondiale — les métiers d'art valorisés comme jamais
- 2055 : la Chine domine le haut de gamme — recomposition du Top 50
- 2060 : l'horlogerie classée au patrimoine immatériel prioritaire — subventions aux manufactures historiques (bonus ancienneté)
(Claude Code : répartir en événements T1–T4, certains avec choix du joueur. Session S4.)

## 2. Création de personnage

### Pays de départ (4 en v1)
| Pays | Avantage | Inconvénient |
|---|---|---|
| Suisse | Savoir-faire +8, qualité +2, crédibilité +2 | Coûts ×1.35, choc BNS 2015 |
| Chine | Coûts ×0.55 | Crédibilité −2 au départ |
| Japon | Savoir-faire +8, qualité +2 | Marketing export ×0.85 |
| France | Marketing ×1.45 (presse accessible) | Écosystème limité, coûts ×1.1 |

### Profil (3)
- **Ingénieur** — manufacture débloquée, dev −1 trimestre, R&D −30%
- **Financier** — capital ×1.5, emprunts à taux réduit
- **Artisan** — qualité +2, savoir-faire +10

### Origine sociale
- **Héritier** : CHF 2'000'000, réseau 8, crédibilité 5 — facile
- **Classe moyenne** : CHF 300'000, réseau 4, crédibilité 2 — équilibré
- **Self-made** : **CHF 10'000** + dette étudiante 30'000, réseau 2, crédibilité 1 — brutal. Le Kickstarter et les micro-séries quartz sont quasi obligatoires. C'est voulu.

### Avatars
8–10 avatars pixel art. Le fondateur vieillit visuellement et prend sa retraite en fin de partie. Pas de vie privée.

## 3. Boucle de jeu et jauges

### Le système d'heures (décision majeure v0.5 — remplace les points d'action)

**Principe.** Plus de PA. Le fondateur dispose de **360 heures par trimestre**. Toute action coûte des heures. Les heures non allouées vont automatiquement à l'établi : elles alimentent la production et font monter le savoir-faire (1 point par 150 h, plafonné à 2). L'ancien « bonus établi » disparaît — les heures libres *sont* l'établi.

> **Playtest, août 2026 :** le budget était fixé à 500 h dans l'addendum. Verdict manette en main : « on peut faire beaucoup trop de choses, le jeu est bien trop facile. » Descendu à **360 h** avec des coûts d'action relevés. Une R&D mange désormais la moitié du trimestre.

**Coûts** (blocs chunky, jamais de micro-gestion) :

| Action | Heures | Aussi |
|---|---|---|
| Campagne marketing | 80 h | + CHF |
| Campagne choc | 110 h | + CHF |
| Relations presse | 50 h | — |
| R&D nouveau modèle | 180 h | + CHF, puis dev sur plusieurs trimestres |
| Recherche de complication | 60–460 h | + CHF, + trimestres |
| Facelift | 80 h | + CHF |
| Salon | 80 h | + voyage |
| Kickstarter | 160 h | — |
| Développer la distribution | 80 h | + CHF |
| Étude de marché | 40 h | + CHF |
| Édition limitée | 80 h | + production |
| Soldes | 30 h | — |
| Embauche | 40 h | — |
| Agrandir l'atelier | 60 h | + CHF |
| Emprunt | 30 h | — |
| Production | heures restantes | quartz 1 h/pièce, ébauche 3 h, manufacture 10 h |

**Employés = heures spécialisées.** Chaque employé apporte ~450 h/trimestre dans sa spécialité :
- **Horloger** : heures de production + savoir-faire
- **Décorateur** : heures de production + débloque les **finitions** (qualité et désirabilité sur les modèles concernés)
- **Ingénieur** : accélère la R&D (moins d'heures, un trimestre de moins), requis pour les hautes complications
- **Expert matériaux** : débloque bronze / or / titane / céramique (remplace les anciens modules matériaux), réduit les coûts matière
- Plus tard (départements) : commercial, marketing, IT — convertissent des tâches du fondateur en tâches déléguées

**L'atelier s'agrandit par tranches de quatre postes.** Retour de beta : agrandir poste par poste était fastidieux. Une extension ouvre quatre postes d'un coup, à prix unitaire dégressif. L'atelier de départ accueille déjà le fondateur et un compagnon, pour que la première embauche serve immédiatement.

**Atelier = postes de travail.** La capacité d'atelier reste un plafond d'heures : on ne peut pas produire plus d'heures qu'il n'y a de postes, même avec des employés. Embaucher sans agrandir ne sert à rien — et inversement. **Ce plafond doit être dit explicitement dans l'UI** (playtest : le joueur embauchait sans comprendre pourquoi rien ne changeait) : le panneau d'embauche annonce les heures réellement utilisables, et le bandeau d'heures signale la main-d'œuvre perdue.

**Conséquence design voulue** : en début de partie, chaque heure de com est une montre non produite. La première embauche est un tournant. C'est le cœur émotionnel du jeu.

### Autres règles de boucle
- **Économie 100% en CHF interne** (décision finale). **Devise d'affichage selon le pays de départ** (implémenté en vague 1 de beta) : € en France, ¥ au Japon, ¥ CNY en Chine, à taux fixes grossiers. Purement cosmétique — le moteur, les seuils et le classement restent en francs. Le seuil de faillite (−50'000 CHF) est explicitement annoncé comme tel dans la page d'introduction.
- Faillite = game over, **mais annoncée**. Retour de beta : les trois testeurs sont morts sans la voir venir. Une alerte apparaît dès que la caisse projetée (caisse + résultat du dernier trimestre × 2) passe sous zéro, avec le nombre de trimestres restants au rythme actuel. Un second niveau, plus doux, signale une trésorerie sous deux trimestres de coûts fixes. La mort reste possible, jamais surprenante.
- **Barre de statut persistante** en bas d'écran : heures libres, caisse, trimestre. Rien d'autre — les jauges restent dans le corps de la page.
- **Le compteur d'heures est un solde unique** : heures du fondateur encore disponibles + heures d'atelier (corrigées de l'encadrement) − production déjà planifiée. Retour de beta : n'afficher que les heures du fondateur, et ne rien déduire quand on programme la production, rendait le budget illisible. Le détail du calcul est affiché sous le solde pour qu'il reste vérifiable de tête.
- **Immédiat contre fin de trimestre** : toute action jouée porte un témoin « fait ✓ » jusqu'à la fin du tour, et le bouton de fin de trimestre annonce que les ventes, les coûts et la production se calculent à ce moment-là.

### Les 6 jauges (validées)
1. **Notoriété** — décline ~5%/trim, marketing à rendement décroissant
2. **Crédibilité** — presse, reviews, salons. Rééquilibrée en S2 : gains passifs (savoir-faire ≥ 60 → +1/an ; ancienneté de la marque → +1 tous les 5 ans)
3. **Désirabilité** — hype/marché gris. Monte : éditions limitées, finitions, **rupture de stock (+2/trim par modèle en sold-out — la rareté volontaire est une stratégie de cœur)**. Descend : soldes, surstock
4. **Savoir-faire** — établi, R&D, embauches ; améliore qualité et coûts
5. **Distribution** — n'est plus une jauge sur 100 mais un **jeu de canaux** (voir ci-dessous)
6. **Capacité d'atelier — EN HEURES** : plafond de production. Frein anti-snowball principal.

### Canaux de distribution (v0.6 — remplacent la jauge)
Playtest : « la distribution, j'aimerais qu'on la développe comme l'équipe. Au lieu d'un truc en /100, il faudrait dire si on vend chez un AD, nous-mêmes sur internet, sur les foires ou dans une boutique à nous. »

Cinq canaux, trois paliers chacun. Chaque canal a une **portée** (volume accessible), une **marge** (part du prix qui revient à la marque), un coût d'ouverture et des coûts fixes récurrents.

| Canal | Portée max | Marge | Particularité |
|---|---|---|---|
| Vente directe | ×0.7 | 100% | Disponible d'emblée, petit volume |
| E-commerce | ×2.0 | 92% | Frais de paiement et logistique |
| Foires et salons | ×1.4 | 95% | Fixes lourds, entretient la crédibilité |
| Détaillants agréés | ×5.0 | 55% | Le volume, mais 45% part au revendeur. Demande crédibilité ≥ 6 |
| Boutique en propre | ×2.6 | 100% | Marge pleine, loyer très lourd, désirabilité +. Demande notoriété ≥ 30 |

L'arbitrage central : les AD ouvrent le gros volume mais diluent la marge ; la boutique en propre garde tout mais coûte une fortune en fixe.

### Encadrement (v0.6, ajusté v0.7)
Le fondateur encadre lui-même ses **3 premiers employés de production**. Au-delà, il faut **un chef d'atelier pour 5 personnes** supplémentaires, sinon l'atelier tombe à 55% des heures rendues. Playtest : « plus on engage de personnel, plus à un moment il va falloir des chefs d'atelier pour gérer tout cela » — mais faire tomber la pénalité dès le premier horloger rendait le démarrage incompréhensible. Le chef est un palier de croissance, pas un prérequis. On peut aussi **se séparer d'un collaborateur** (indemnité de 2 trimestres de salaire).

### Règle d'écriture des conseils (v0.7)
Aucun message d'aide ne recommande une dépense si le joueur ne peut pas la payer en gardant **trois trimestres de coûts fixes** d'avance. En dessous, la formulation passe en neutre et informatif, sans impératif. Retour de beta : un testeur est mort en suivant littéralement la chaîne de recommandations du jeu. Un conseil qui tue est un bug.

### Backlog (noté, non implémenté)
- **Combos et synergies** : boosts provisoires ou consommables déclenchés par des enchaînements d'actions précis (retour testeur). À traiter en S4 avec le déblocage progressif des actions — c'est la même mécanique de récompense de la maîtrise.
- **Habillage** : référence citée par un testeur, *Game Dev Tycoon*, à verser au moodboard de S5.
- **Tutoriel « l'horlogerie en quelques pages »** : le jeu suppose acquis un vocabulaire qui ne l'est pas. Un néophyte ne sait pas ce qu'est une ébauche, pourquoi une manufacture coûte cinquante fois plus cher, ce que vaut un anglage, ni pourquoi une complication se paie en heures. Prévoir trois à cinq pages courtes, illustrées, consultables **avant** la partie et **rappelables en jeu** depuis les endroits où le vocabulaire apparaît (choix du mouvement, gamme, complications, finition) — pas un mur de texte au démarrage, qu'on saute. Contenu pressenti : (1) ce qu'il y a dans une montre et qui fait quoi ; (2) quartz, ébauche, manufacture — ce que chacun coûte et ce qu'il rapporte ; (3) les quatre gammes et à qui elles s'adressent ; (4) ce qu'une complication ajoute et ce qu'elle prend ; (5) les trois jauges d'image et pourquoi elles ne se rattrapent pas à l'argent. Sert aussi la chaîne YouTube : ces pages sont un script de vidéo. **Session S5** — remonté, c'est le retour de beta le plus fréquent.

### Fiscalité (v0.6)
**Impôt de 18% sur le bénéfice annuel**, prélevé au bilan du T4.

### Complications (arbre techno — 3 niveaux par famille)
- Arbre : **Date → Chronographe → GMT → Phase de lune → Réserve de marche → Tourbillon**
- **Chaque famille a trois paliers** (18 recherches en tout), chacun avec ses heures, son coût et ses trimestres. Playtest : un seul palier par complication rendait l'arbre trop plat.
- Il faut maîtriser une famille **au niveau 2** pour ouvrir la suivante — on ne traverse pas l'arbre en effleurant chaque branche.
- Les paliers : Date à guichet → Grande date → Quantième annuel · Chrono à came → Roue à colonnes → Rattrapante · Aiguille 24 h → Heure sautante → Heure universelle · Phase de lune → Lune de précision → Complication astronomique · Indicateur de réserve → Réserve longue durée → Réserve d'un mois · Tourbillon une cage → Tourbillon volant → Tourbillon multi-axes
- Prérequis : un **ingénieur** (employé ou profil) à partir de la phase de lune ; le tourbillon exige en plus un mouvement manufacture
- **Une montre peut cumuler jusqu'à 3 complications** (v0.6) : heures et qualité s'additionnent, les multiplicateurs de prix acceptable se multiplient.
- Effet : ajoute des heures de production/pièce, monte la qualité et le prix acceptable. Un modèle fige le niveau du jour de sa création.

### Matériaux (v0.6 — arbre de recherche)
Acier acquis d'office. Bronze → Titane → Céramique / Or : chacun demande une **recherche** (heures + CHF + trimestres) **et** un expert matériaux dans l'équipe. Playtest : « dès que j'ai le bon artisan, je peux rusher les montres en or et augmenter drastiquement le bénéfice. »

### Prix : c'est le joueur qui décide (v0.6)
Le jeu n'affiche **aucun prix par défaut**. À la conception il annonce le **coût de fabrication**, la qualité et les heures par pièce ; le prix est saisi par le joueur, et une montre sans prix ne se vend pas. L'**étude de marché** chiffre la demande à trois prix différents.
- La « Montre du Siècle » (fin n°8) exige le tourbillon manufacture

### Déblocage progressif des actions (principe clé)
Les options ne sont pas toutes disponibles en permanence. Prérequis par jauges, année, complications, taille d'équipe. Exemples : Campagne choc → notoriété ≥ 20 ; Édition limitée → désirabilité ≥ 15 ; Boutique en propre → distribution ≥ 40. Certaines actions n'apparaissent qu'après un événement. *(Non implémenté : sorti du plan révisé, à replacer en S4 ou S6.)*

## 3 bis. Équilibrage — méthode et état (Phase B, en cours)

> ### ⚠ Avertissement : toute mesure antérieure à août 2026 est caduque
>
> Jusqu'à cette date, les bots d'équilibrage **fixaient leurs prix avec leur
> propre formule**, qui ignorait la qualité du modèle, la crédibilité de la
> marque et les multiplicateurs d'époque. Ils étaient donc aveugles à tout ce
> qui déplace le prix acceptable — c'est-à-dire à une bonne moitié du modèle
> économique du jeu.
>
> **Conséquence : nos conclusions sur la domination du haut de gamme étaient
> partiellement des artefacts.** Une fois la tarification corrigée
> (`prixAcceptable()` devient la source unique, partagée par le moteur et les
> bots), le Margeur perd 60 M de chiffre et sept ans d'avance, le Prestigieux
> 36 M. Les deux stratégies qu'on croyait dominantes l'étaient en partie parce
> qu'on les mesurait mal.
>
> Ne pas rouvrir un débat d'équilibrage en citant un chiffre d'avant cette
> correction. Les seuls repères valables sont ceux produits après.
>
> C'est la quatrième fois du projet que la distinction « on mesure le bot » /
> « on mesure le jeu » a compté. Les trois précédentes : des bots morts de
> notoriété nulle, un verdict vert par vacuité, un harnais qui achetait des
> ateliers qu'il ne pouvait pas payer.

### Méthode
Quatre bots stratèges (`npm run bots`) jouent 2015-2065 sur dix graines reproductibles : **le Margeur** (prix 1,35× le prix acceptable), **le Volumiste** (0,8×, portée maximale), **le Prestigieux** (jauges d'abord, 1,1×), **l'Équilibré**. Sortie par bot : année d'entrée au Top 50, faillites, CA et rang médians. Verdict automatique sur les critères.

**Critères de validation** : (a) la meilleure stratégie entre au Top 50 entre 2050 et 2065 sur ≥ 3 graines — les humains font environ deux fois mieux que les bots, c'est le couloir voulu ; (b) aucune stratégie avant 2040 ; (c) écart de CA médian < 3× entre la meilleure et la pire stratégie viable ; (d) le Volumiste peut faire faillite sur quelques graines, pas 10/10 ; (e) l'Équilibré finit dans le couloir médian.

**Deux pièges méthodologiques rencontrés, à ne pas refaire :**
- Des bots naïfs qui ne dépensent rien en image meurent tous : la demande dépend de la notoriété, donc on mesure alors la bêtise des bots, pas l'équilibrage. Tout bot doit entretenir un plancher de jauges, reprendre ses prix et faire ses facelifts.
- Le verdict automatique passait au vert par vacuité : quand personne n'atteint le Top 50, « aucune stratégie ne domine » est trivialement vrai. Un critère de gagnabilité est indispensable.

### Le temps de fabrication porte la gamme (refonte v0.8)

Échelle arbitrée sur le réel horloger, pas sur l'équilibrage — c'est le sujet du jeu, autant qu'il soit crédible :

**Les heures se justifient par le travail, pas par la clientèle** — retour de test : « il faudrait le justifier au-delà de : c'est pour telle population ». Chaque gamme affiche en jeu le geste qui prend le temps.

| Gamme | Heures par pièce | Ce qu'on y fait |
|---|---|---|
| Grand public | 1 h | Mouvement posé, boîtier fermé, contrôle de marche au banc |
| Lifestyle | 2 h | Boîtier brossé puis poli, bracelet ajusté à la main, double contrôle |
| Connaisseurs | 12 h | Anglage des ponts à la lime, côtes de Genève, réglage en cinq positions |
| Bling-bling | 30 h | Sertissage pierre à pierre, polissage miroir, démontage et remontage après essais |

Le mouvement maison ajoute 6 h, les complications et la finition s'ajoutent par-dessus. Un quartz s'assemble en une heure, un tourbillon manufacture finition maison en approche cinquante.

**Ce que ça règle.** La marge par heure d'atelier — la ressource rare — passait de 199 CHF en grand public à 3 571 en bling, un facteur 18 : monter en gamme était strictement supérieur. Avec les heures portées par la gamme, l'écart tombe à **1,8×**. Le haut de gamme reste légèrement plus rentable à l'heure, ce qui est juste : c'est un métier de marge. Mais il ne peut plus produire en volume.

**Conséquence voulue** : une gamme haute demande beaucoup plus de monde. C'est le sens du mot manufacture.

### Réglages posés

| Curseur | Valeur | Raison |
|---|---|---|
| Heures par gamme | 1 / 2 / 12 / 30 h | Réel horloger. Ramène la marge par heure de 18× à 1,8× |
| Atelier, petit palier | 1 poste, 60 000 CHF, +450 h, 5 000/trim | Sans lui, une stratégie de volume n'atteint jamais la halle et meurt : mesuré 10 faillites sur 10 |
| Atelier, grande halle | 4 postes, 200 000 CHF, +1 800 h, 14 000/trim | Moins cher au poste : s'offrir la halle reste la bonne affaire |
| Élasticité prix | 1,6 au-dessus du prix acceptable | Posée à 2,6, détendue une fois les heures en place : le haut de gamme était puni deux fois. Mesuré : écart entre stratégies 48× → 31× |
| Rendements des jauges | concaves, exposant 0,55 | Les premiers points de notoriété valent plus que les derniers |
| Demande de base, haut de gamme | connaisseurs 750 → 2 100, bling 280 → 800 | Le haut de gamme était dix fois moins demandé à l'unité ; écart de CA 15× → 5,9× |
| Pools haut de gamme | rendus à 90 000 / 30 000 | Compensation levée : le frein est le temps d'atelier, plus un marché rétréci artificiellement |
| Seuil Top 50 | 60 M en 2015, +3,0 %/an | Calé aux bots (voir ci-dessous) |
| Gain de notoriété | (4 − noto/22) au lieu de (5 − noto/20) | Se faire un nom prend des années : étire la rampe des deux premières décennies |
| Premiers paliers de distribution | e-commerce 35 k, salons 30 k, détaillants 30 k | Même intention : le ticket d'entrée de la distribution retarde le décollage sans toucher au plafond |

### État de validation

| Critère | État |
|---|---|
| (b) aucune stratégie au Top 50 avant 2040 | ✅ |
| (c) écart de CA < 3× entre stratégies viables | ✅ **2,1×** (contre 75× au départ) |
| (d) le Volumiste n'est pas condamné | ✅ 0 faillite sur 10 (contre 10/10) |
| (e) l'Équilibré dans le couloir médian | ✅ 2ᵉ sur 4 |
| (a) la meilleure stratégie entre au Top 50 entre 2050 et 2065 | ❌ **aucune n'entre** |

**Pourquoi (a) résiste, et ce n'est pas une question de seuil.** Les quatre bots atteignent leur plafond vers 2035-2040 puis restent plats trente ans (Volumiste : 98 M en 2035, 130 M en 2065). Face à une courbe plate, aucun seuil exponentiel ne peut créer de couloir : mesuré, à 2,8 %/an une stratégie entre dès 2036, à 3,0 %/an plus personne n'entre. Il n'existe pas de valeur intermédiaire.

**Où en est la rampe après le freinage du début (v0.9.1).** Le Volumiste passe désormais par 11 M en 2020, 28 M en 2025, 59 M en 2030, 97 M en 2035, et culmine au **rang 55** vers 2035-2040 — au pied du Top 50 sans y entrer. Un joueur humain, qui fait environ deux fois mieux qu'un bot, entre donc dans le classement ; le bot n'y arrive pas tout à fait. C'est le couloir recherché, atteint par le bas plutôt que par le calendrier.

**Ce qui reste ouvert** : l'entrée se jouerait vers 2035-2040 plutôt que 2050-2065, et la courbe redescend ensuite parce que le seuil monte plus vite que la marque. Deux pistes si l'on veut vraiment déplacer la fenêtre —
1. *Ralentir le début* pour que le plafond soit atteint vers 2055 plutôt que 2035 (cohérent avec l'intention « une à deux années avant le décollage », mais le début a déjà été durci deux fois) ;
2. *Faire croître le marché lui-même* (pools indexés sur la croissance), pour que le plafond monte avec le temps et qu'il faille surpasser le marché, pas seulement le rejoindre.

## 3 bis. Les directeurs — le troisième acte *(livré S4)*

Diagnostic à l'origine : après 2050, les bots tournaient à 99% de capacité
d'atelier avec 3,66 milliards en caisse et 19% du marché consommé. Ni l'argent
ni les clients ne manquaient : il manquait un moyen de convertir l'un en
l'autre. Le goulot final était le budget d'heures du fondateur — agrandir coûte
60 h, embaucher 40 h, et il n'en a que 360.

**Principe : un directeur ne multiplie rien, il exonère.** Les actions de sa
catégorie tombent à 5 h. Les 360 heures du fondateur ne changent jamais.

| rôle | salaire/trim. | exonère | et débloque |
|---|---|---|---|
| Directeur de production | 34'000 | agrandissements, embauches | la manufacture |
| DRH | 26'000 | embauches, licenciements | risque social ÷ 2 |
| DSI | 28'000 | actions de canal | palier e-commerce mondial |
| Directeur commercial | 30'000 | canaux, soldes, distribution | portée +15% |
| Directrice marketing | 28'000 | campagnes, presse, éditions | — |
| Directeur financier | 25'000 | emprunts | impôt −4 points |

Prérequis du premier : 10 employés et 40 de crédibilité. Chaque directeur
supplémentaire exige +5 employés et +5 de crédibilité. Recrutement par
l'interface de décision, un seul par rôle.

**Règle intangible : le produit ne se délègue pas.** R&D, complications,
matériaux et création de modèles restent aux heures du fondateur, quels que
soient les directeurs. On délègue l'entreprise, jamais l'horlogerie.

**La manufacture** — 50 postes, 22'500 h par trimestre, 6 M de francs et
**quatre trimestres de chantier** avant le premier établi. Réservée au
directeur de production. Le joueur engage la somme sur une demande qu'il aura
dans un an : c'est un pari, pas un achat.

*Mesure après implémentation : les quatre stratégies atteignent le Top 50 (deux
auparavant), et l'occupation de l'atelier retombe de 99% à 12-21%. Le plafond
de fin de partie s'est déplacé de la capacité vers la demande.*

## 4. Production & organisation
(inchangé v0.3 : postes clés nommés avec stats + effectifs standard ; louer → construire ; Vallée de Joux/Neuchâtel = vivier, Paris = difficile ; départements Marketing/Finance/IT ; distribution directe/détaillants/boutiques/e-commerce ; fournisseurs avec stats, track record, coût, faillite possible ; verticalisation = accomplissement ultime, pas de simulation de label)

## 5. Financement
Kickstarter (levier du self-made) ; emprunts ; investisseurs avec dilution → trop dilué = vente forcée → fin « rachat ».

## 6. Écosystème

### Marques concurrentes (noms provisoires validés jusqu'à la vidéo communauté)
Rolodex, Cartel, Homega, Padek Philange, Audemars Pique, Long-Innes, Fissot, Grand Seikho, TAG Heure, Ublot + indépendants : Manufacture Delorme, Kairos & Cie, Atelier Brumaire, Ferrand-Roux, Tempus Nova, Ostara Watch Co, Cadran Bleu, Maison Vaucher, Heure Zéro, Berthoud Frères.
Classement annuel : **« Stanley Morgan Top 50 »** (métrique centrale, cérémonie annuelle).
Groupes acheteurs (offres de rachat) : Groupe Richemond, Souatch Group, fonds « Alpine Capital Partners » (à affiner).

**Classement vivant (S3)** : les revenus des marques du Top 50 évoluent d'année en année (croissance aléatoire pondérée + événements). Le classement n'est plus statique.

### Les 20 YouTubeurs
**Caméos réels (accords) :** MoonWatch (JC — accord obtenu), **Barillet (easter egg : Julien lui-même en YouTubeur dans le jeu)**.
**⚠ À confirmer avant publication** : Frank sans C, Flyback, Clément Entretemps sont des chaînes/podcasts réels — obtenir leur accord comme pour JC, sinon les passer en parodie légère.
**15 parodies anglophones (archétypes) :**
1. Freddy Baldassini — le pédagogue américain souriant (bonus crédibilité)
2. Nico Léopard — le milliardaire hater flamboyant (review = quitte ou double)
3. The Urban Gentleman — le dandy vintage (aime dress/classique)
4. Bark & Jacques — le duo accessible (aime <500)
5. Encore Une Montre — le testeur compulsif (aime les nouveautés, fraîcheur +)
6. Résurrection Horlogère — le restaurateur (aime le mécanique, déteste le quartz)
7. Hodinski — le média chic (crédibilité forte, difficile à séduire)
8. Jenny L. — l'esthète des cadrans (sensible au design/matériaux)
9. Tic Tac Théo — le vulgarisateur speed (grand public)
10. WatchSpotter — le chasseur de célébrités (désirabilité)
11. Le Comptoir du Gousset — le puriste grincheux (manufacture uniquement)
12. Marina Deep — la spécialiste plongeuses
13. Sir Windsor — l'aristocrate bling (segment bling)
14. Le Radar du Gris — l'analyste du marché de l'occasion (désirabilité/spéculation)
15. Quartz Squad — le collectif pro-quartz assumé (contrepoint)
Mécanique : reviews = bonus/malus, jamais fatal. Presse achetable (voyages, montres offertes) avec risque de scandale.

### Contrefaçon, marché gris
(inchangé : contrefaçon liée à la notoriété ; marché gris simulé, rareté = stratégie légitime)

## 7. Aléas et effets d'époque *(livré S4)*

Le catalogue compte **55 aléas** (10 d'origine, 14 du lore, 31 nouveaux) et
**56 événements** couvrant chaque année de 2015 à 2065. Le détail des textes et
des effets est dans `docs/barillet-contenu-v1.md`, `-v2-extension.md` et
`-v3-chronologie.md` ; l'implémentation est dans `src/data/evenements.js`.

**Deux règles de tirage** gouvernent le catalogue, sans lesquelles soixante
entrées se comportent comme dix : une **mémoire courte** (poids ÷4 pendant 12
trimestres, ÷2 pendant 12 de plus) et une **fenêtre d'époque** (`debut`,
`croissance`, `maturite`, `toujours`). Fréquences : 45% pour les aléas, 50%
pour les opportunités.

**Les effets s'empilent** (`src/engine/effets.js`) : chaque événement ou aléa
porte des modificateurs déclaratifs — demande par gamme, par mouvement ou
croisée, coûts, matériaux, mouvements, charges fixes, salaires, capacité,
portée, prix acceptable, désirabilité et son plafond, pools, notoriété, impôt,
intérêts. 33 événements ont un effet permanent. `npm run chrono` vérifie la
couverture et affiche les multiplicateurs cumulés en 2035, 2050 et 2065.

**Politique salariale** : serrée (−15% de masse salariale, risque social ×2,
savoir-faire −1/an), standard, généreuse (+20%, risque ÷2, savoir-faire +1/an,
équipe +5% d'efficacité). Gratuite en heures. Elle commande la grève et les
départs simultanés.

**Compteur de presse achetée** : chaque voyage de presse et chaque collab
l'incrémente ; l'enquête tombe avec 5% de probabilité par complaisance et par
trimestre, coûte 14 de crédibilité et remet le compteur à zéro. C'est ce qui
fait que ces deux opportunités cessent de promettre un risque qui n'existait
pas.

## 8. Couche narrative (S3 — livrée)

- **Récit trimestriel** : 1–2 paragraphes générés par gabarits, qui racontent le trimestre en intégrant (a) les actions prises par le joueur, (b) l'aléa/événement, (c) le résultat commercial, (d) une brève du monde. Ton : chronique horlogère, sérieux avec clins d'œil.
- **Nouvelles des concurrents** : chaque trimestre, 1–2 brèves du monde (« Rolodex ouvre une boutique à Shanghai », « Ublot signe un footballeur », « Ferrand-Roux en difficulté — rachat possible »).
- **Page d'introduction** au lancement d'une partie : le pitch (créer une marque pérenne, viser le Top 50), les règles de base, le contexte 2015.

## 9. Fins de partie

**Changement de structure (S4) : entrer au Top 50 ne termine plus la partie.**
Le pitch est « créer une marque pérenne » — durer est le test, entrer ne l'est
pas. L'entrée devient un jalon : cérémonie annuelle spéciale, une de la
Gazette, et la partie continue jusqu'en 2065. L'état de partie garde l'année
d'entrée et le nombre d'exercices passés dans les cinquante ; l'écran de fin
juge la trajectoire entière.

### Conditions chiffrées

| fin | condition | vérification |
|---|---|---|
| **Faillite** | trésorerie < −50'000 CHF | à chaque trimestre |
| **Rachat** | accepter l'offre de `consolidation` (2045), ou dilution cumulée ≥ 50% | décision / au bilan annuel |
| **La Succession** | atteindre 2065 sans faillite ni rachat — c'est la fin par défaut | fin de partie |
| **La Marque Culte** | production ≤ 500 pièces/an **et** désirabilité ≥ 90, dix exercices consécutifs, **et jamais plus d'un directeur en poste** | au bilan annuel |
| **L'Empire** | trois `rachatInde` acceptés, **directeur de production en poste**, **et** CA annuel ≥ 30 M | au bilan annuel |
| **La Montre du Siècle** | un modèle cumulant mouvement manufacture, tourbillon niveau 3, finition, qualité ≥ 12 **et** désirabilité de la marque ≥ 85 le trimestre de sa sortie | à la sortie d'étude |
| **Le Scandale** | compteur de presse achetée cumulé ≥ 8 sur la partie, enquête déclenchée ≥ 2 fois, **et** crédibilité < 10 | à chaque trimestre |

La direction rend les deux voies **mutuellement exclusives** : on ne bâtit pas un empire sans déléguer, et on ne reste pas une maison culte en recrutant six directeurs. C'est ce qui fait de la délégation un choix et non une progression obligée.

Les fins alternatives ne sont pas exclusives de la Succession : elles se
déclenchent quand leur condition est remplie et **remplacent** l'épilogue par
défaut. Si plusieurs sont remplies en 2065, l'ordre de priorité est Scandale >
Empire > Montre du Siècle > Marque Culte > Succession.

**Épilogue de la Succession**, modulé par : l'année d'entrée au Top 50 (jamais /
tardive / précoce), le nombre d'exercices tenus dedans, et le rang final. Une
maison entrée en 2042 et sortie en 2058 ne raconte pas la même histoire qu'une
maison entrée en 2050 et encore là en 2065.

*(Conditions arbitrées en S4, implémentation à venir : seule la Succession —
sous le nom « temps » — et le Rachat par décision sont codés.)*

## 10. Direction artistique (moodboard fourni par Julien, 5 références)
- **Style : flat pixel art à gros contour sombre**, formes lisibles, fond uni clair ou carte colorée
- Résolution sprites montres : 48×48 à 64×64, palette douce (beiges, bruns, verts sauge, or)
- Les silhouettes iconiques (sport acier à lunette octogonale, rectangulaire dress à chiffres romains, calculatrice rétro, plongeuse) sont **reconnaissables mais génériques** — cohérent avec l'approche parodique, jamais de reproduction exacte d'un design déposé
- L'UI sombre « établi » du proto (vert nuit + laiton + ivoire, typo pixel) est validée comme base ; les cartes de montres sur fond clair contrastent dessus
- Chaque modèle créé par le joueur = sprite assemblé par couches : boîtier (forme × matériau) + cadran (couleur) + bracelet — combinatoire plutôt que sprites uniques
- **Menu d'accueil** avec élément pixel animé (balancier qui oscille)
- **Personnage animé en jeu** selon le profil : établi (artisan/ingénieur) ou bureau (financier)

## 11. Audio
**Bande sonore composée par Julien** (2–3 pistes + sons UI). Prévoir un gestionnaire audio simple : boucle menu, boucle jeu, stingers (cérémonie annuelle, fin de partie), volume réglable, **coupé par défaut sur mobile**. (Session S5.)

## 12. Ton
Simulation sérieuse avec clins d'œil. L'humour vit dans les noms, les événements, les reviews.

## 13. Reporté en v1.1 (post-beta, décision de périmètre)
- **Décoration profonde des montres** (pierres, gravures, cadrans d'art) : cosmétique, multiplie les sprites, n'ajoute rien mécaniquement au lancement. La combinatoire boîtier/matériau/cadran/bracelet suffit pour la v1.

## 14. RESTE À TRANCHER
- [ ] Accords Frank sans C / Flyback / Clément Entretemps (ou passage en parodie)
- [ ] Noms définitifs via vidéo communauté (plus tard)
- [ ] Détail des 4 fins alternatives (conditions chiffrées)
- [ ] Salons fictifs : 5–6 à nommer (parodies de Watches & Wonders, Baselworld†, salons Asie/US)
- [ ] Où replacer le déblocage progressif des actions, sorti du plan révisé

## 15. Plan de sessions (révisé v0.5 : 4 → 6)

- **S1 — portage ✅** : repo `barillet-le-jeu`, projet Vite + React, self-made à 10'000, capacité en heures, sauvegarde localStorage, déploiement GitHub Pages.
- **S2 — moteur ✅** : système d'heures (fondateur + employés spécialisés), complications, rééquilibrage crédibilité, horizon → 2065.
- **S2.5 — retours du premier smoke test ✅** : prix libre, canaux de distribution, recherche des matériaux, complications cumulables, encadrement, licenciements, impôts, cohérence du classement, rééquilibrage des volumes.
- **S3 — narratif ✅** : récit trimestriel, brèves concurrents, classement vivant, page d'introduction.
- **S4 — rythme** *(partiellement livré)* : chronologie complète 2015–2065 (56 événements, une année ne peut plus être vide), catalogue d'aléas porté à 55, règles de tirage (mémoire courte + fenêtre d'époque), compteur de presse achetée et enquête, politique salariale, familles de journal « classement » et « concurrence ». Restent : les 21 opportunités du lot v1/v2, les 12 aléas à choix, les objectifs quinquennaux et les 20 YouTubeurs.
- **S5 — assets** : sprites par couches, avatars, personnage animé, menu animé, intégration audio.
- **S6 — polish & beta** : équilibrage complet (une partie 2015–2065 testée), écrans de fin, build itch.io + GitHub Pages.

Beta communauté : **fin novembre**. Devlog #1 : dès que S2–S3 donnent quelque chose à montrer.
