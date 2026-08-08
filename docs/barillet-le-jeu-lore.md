# BARILLET — LE JEU
## Document de lore et de design — v0.4 (août 2026)

> Simulation de gestion horlogère, tour par tour trimestriel, pixel art.
> Inspiration : Coffee Inc 2. Objectif : contenu pour la chaîne Barillet (devlogs + communauté).
> Plateforme v1 : jeu web (GitHub Pages / itch.io), jouable sur mobile.
> **Statut : boucle cœur validée en proto (3 itérations). Prêt pour Claude Code.**
> Verdict playtest : « un début, mais austère » → le fun viendra des assets, du déblocage progressif et de la variété de contenu. Les mécaniques tiennent.

---

## 1. Cadre temporel

- **Début : 2015.** Durée : 50 ans → fin en 2065.
- **Tour = 1 trimestre** (200 tours). Passage d'année entière en un clic : indispensable (validé).

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
(Claude Code : répartir en événements T1–T4, certains avec choix du joueur.)

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

- **2 points d'action par trimestre** (décision finale — resserré depuis le proto à 3 pour créer de vrais dilemmes). Pas de bonus de PA par profil en v1.
- **PA non dépensés = travail à l'établi** : savoir-faire +1 et coûts fixes −4'000 chacun (validé).
- **Économie 100% en CHF interne** (décision finale). Affichage possible d'autres devises en pure cosmétique.
- Faillite = game over.

### Les 6 jauges (validées)
1. **Notoriété** — décline ~5%/trim, marketing à rendement décroissant
2. **Crédibilité** — presse, reviews, salons. Rééquilibrage requis : ajouter des gains passifs (savoir-faire ≥ 60 → +1/an ; ancienneté de la marque → +1 tous les 5 ans)
3. **Désirabilité** — hype/marché gris. Monte : éditions limitées, **rupture de stock (+2/trim par modèle en sold-out — la rareté volontaire est une stratégie de cœur)**. Descend : soldes, surstock
4. **Savoir-faire** — établi, R&D, embauches ; améliore qualité et coûts
5. **Distribution** — multiplie le volume accessible (absorbe l'ancien « réseau », supprimé)
6. **Capacité d'atelier — EN HEURES** : quartz 1h/pièce, ébauche 3h, manufacture 10h. Frein anti-snowball principal.

### Modules d'atelier (déblocages)
- Traitement des matériaux : bronze → or → titane/céramique
- Atelier complications : chrono → GMT → tourbillon (arbre techno)
- Bureau technique : requis pour la manufacture
- Chaque module : coût d'achat + coûts fixes récurrents + heures de capacité

### Déblocage progressif des actions (principe clé)
Les options ne sont pas toutes disponibles en permanence. Prérequis par jauges, année, modules, taille d'équipe. Exemples : Campagne choc → notoriété ≥ 20 ; Édition limitée → désirabilité ≥ 15 ; Boutique en propre → distribution ≥ 40. Certaines actions n'apparaissent qu'après un événement.

## 4. Production & organisation
(inchangé v0.3 : postes clés nommés avec stats + effectifs standard ; louer → construire ; Vallée de Joux/Neuchâtel = vivier, Paris = difficile ; départements Marketing/Finance/IT ; distribution directe/détaillants/boutiques/e-commerce ; fournisseurs avec stats, track record, coût, faillite possible ; verticalisation = accomplissement ultime, pas de simulation de label)

## 5. Financement
Kickstarter (levier du self-made) ; emprunts ; investisseurs avec dilution → trop dilué = vente forcée → fin « rachat ».

## 6. Écosystème

### Marques concurrentes (noms provisoires validés jusqu'à la vidéo communauté)
Rolodex, Cartel, Homega, Padek Philange, Audemars Pique, Long-Innes, Fissot, Grand Seikho, TAG Heure, Ublot + indépendants : Manufacture Delorme, Kairos & Cie, Atelier Brumaire, Ferrand-Roux, Tempus Nova, Ostara Watch Co, Cadran Bleu, Maison Vaucher, Heure Zéro, Berthoud Frères.
Classement annuel : **« Stanley Morgan Top 50 »** (métrique centrale, cérémonie annuelle).
Groupes acheteurs (offres de rachat) : Groupe Richemond, Souatch Group, fonds « Alpine Capital Partners » (à affiner).

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

## 7. Aléas (~20, tirés de l'histoire horlogère et mondiale)
1. Fournisseur en faillite (racheté par un groupe — écho ETA)
2. Fraude d'un employé (détournement)
3. Fournisseur en retard (production ÷2)
4. Envolée du CHF (coûts +12%)
5. Célébrité porte votre montre (écho Paul Newman)
6. Contrefaçons massives saisies aux douanes
7. Article élogieux dans la presse spécialisée
8. Cambriolage de l'atelier (écho braquages de manufactures)
9. Démission d'un horloger clé (débauché)
10. Buzz TikTok inattendu
11. Récession locale
12. Un collectionneur commande une série
13. Rappel qualité (défaut de mouvement) — coût + crédibilité
14. Invitation à une vente caritative type « Only Watch » — pièce unique, prestige
15. Votre montre bat un record aux enchères (si désirabilité haute) — désirabilité ++
16. Grève dans l'atelier (si employés > 5 et salaires bas)
17. Vol d'un prototype avant un salon
18. Nouveau droit de douane sur votre marché principal
19. Incendie d'atelier (assurance partielle)
20. Un journaliste enquête sur la presse achetée (si utilisée) — scandale rétroactif
21. Pénurie d'acier / de composants
22. Un concurrent copie votre best-seller (fraîcheur −)

## 8. Fins de partie
1. **Victoire 1 : Top 50** du Stanley Morgan
2. **Victoire 2 : Top 10**
3. **Rachat** (accepté ou forcé par dilution) — fin moyenne, épilogue narratif
4. **Faillite** — défaite
5. **La Succession** — à la retraite (fin des 50 ans), léguer l'entreprise à l'un de ses enfants avec un mot : « fais mieux que moi ». Épilogue selon l'état de la marque. (Idée Julien)
6. **La Marque Culte** — rester volontairement minuscule (< 500 pièces/an) avec désirabilité ≥ 90 pendant 10 ans : la marque devient légendaire sans jamais grandir. Victoire alternative.
7. **L'Empire** — racheter 3+ marques en difficulté et finir en groupe : le chassé devient chasseur. Victoire alternative.
8. **La Montre du Siècle** — créer une pièce ultime (tourbillon manufacture, qualité 10, désirabilité max) qui entre au musée : le nom passe à la postérité même si la marque reste moyenne. Victoire d'artisan.
9. **Le Scandale** — presse achetée révélée + fraude cumulées : ruine réputationnelle, la marque survit mais le fondateur est banni de l'industrie. Défaite narrative distincte de la faillite.

## 9. Direction artistique (moodboard fourni par Julien, 5 références)
- **Style : flat pixel art à gros contour sombre**, formes lisibles, fond uni clair ou carte colorée
- Résolution sprites montres : 48×48 à 64×64, palette douce (beiges, bruns, verts sauge, or)
- Les silhouettes iconiques (sport acier à lunette octogonale, rectangulaire dress à chiffres romains, calculatrice rétro, plongeuse) sont **reconnaissables mais génériques** — cohérent avec l'approche parodique, jamais de reproduction exacte d'un design déposé
- L'UI sombre « établi » du proto (vert nuit + laiton + ivoire, typo pixel) est validée comme base ; les cartes de montres sur fond clair contrastent dessus
- Chaque modèle créé par le joueur = sprite assemblé par couches : boîtier (forme × matériau) + cadran (couleur) + bracelet — combinatoire plutôt que sprites uniques

## 10. Ton
Simulation sérieuse avec clins d'œil. L'humour vit dans les noms, les événements, les reviews.

## 11. RESTE À TRANCHER
- [ ] Accords Frank sans C / Flyback / Clément Entretemps (ou passage en parodie)
- [ ] Noms définitifs via vidéo communauté (plus tard)
- [ ] Détail des 4 fins alternatives (conditions chiffrées)
- [ ] Salons fictifs : 5–6 à nommer (parodies de Watches & Wonders, Baselworld†, salons Asie/US)

## 12. Plan Claude Code (kickoff)
**Prérequis faits :** GitHub ✓, itch.io ✓, moodboard ✓, lore v0.4 ✓, proto validé ✓.

**Session 1 (~2h) :** créer le repo `barillet-le-jeu` ; porter le proto (fichier barille-proto.jsx fourni comme spec de départ) dans un vrai projet Vite + React ; PA à 2 ; self-made à 10'000 ; capacité en heures ; sauvegarde localStorage ; déploiement GitHub Pages dès la fin de session (le jeu est en ligne, même moche).
**Session 2 :** modules d'atelier + déblocage progressif des actions + rééquilibrage crédibilité.
**Session 3 :** les 20 YouTubeurs + aléas complets + événements 2015–2026 enrichis.
**Session 4 :** sprites pixel art par couches + avatars + écrans de fin.
Ensuite : beta communauté sur itch.io, devlog #1.

**Prompt de démarrage à coller dans Claude Code, session 1 :**
« Lis barillet-le-jeu-lore.md et barille-proto.jsx. Crée un projet Vite+React nommé barillet-le-jeu qui porte le prototype en respectant la spec v0.4 : 2 PA/trimestre, self-made à 10'000 CHF, capacité en heures d'atelier (quartz 1h, ébauche 3h, manufacture 10h), sauvegarde localStorage, et prépare le déploiement GitHub Pages. Garde l'UI et l'équilibrage du proto pour le reste. »
