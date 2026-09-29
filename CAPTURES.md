# Mode capture — devlog #1

Branche `capture-devlog1`. **Local uniquement** : rien de ceci n'est déployé.

```bash
npm run dev
```

Puis ouvrir les URLs ci-dessous dans une fenêtre **1920×1080**.

Le mode capture ne fait que charger un état de partie préparé. Chaque scène
**joue réellement la partie** avec le moteur du jeu jusqu'au moment à filmer :
seules les décisions sont scriptées (embaucher, lancer un modèle, fixer un
prix, faire du marketing), avec les mêmes fonctions de coût que l'interface.
Trésorerie, ventes, rang et faillites sortent de `simulateQuarter`. Aucune
valeur n'est écrite à la main.

Une graine fixe par scène : **la même URL redonne exactement la même image**,
on peut refaire une prise.

En mode capture :

- aucune sauvegarde n'est écrite — ta partie en cours reste intacte ;
- aucune mesure d'audience ne part — filmer ne gonfle pas GoatCounter ;
- numéro de version, liens externes et bouton de retour sont masqués ;
- l'interface est agrandie ×1,6 pour être lisible en 1080p, barres de
  défilement masquées.

Le jeu n'a ni overlay de debug, ni compteur de FPS, ni console affichée : il
n'y avait rien d'autre à masquer.

---

## Les scènes

| scène | URL | ce qu'elle montre |
|---|---|---|
| faillite-1 | http://localhost:5173/?capture=faillite-1 | Suisse · Artisan · Self-made. Faillite au **T2 2015**, caisse −55'715 CHF. |
| faillite-2 | http://localhost:5173/?capture=faillite-2 | France · Financier · Self-made. Faillite au **T2 2015**, caisse −75'600 CHF. |
| faillite-3 | http://localhost:5173/?capture=faillite-3 | Chine · Ingénieur · Self-made. Faillite au **T2 2015**, caisse −86'214 CHF. |
| faillite-4 | http://localhost:5173/?capture=faillite-4 | Japon · Artisan · Classe moyenne. Faillite au **T4 2015**, caisse −112'000 CHF. |
| creation | http://localhost:5173/?capture=creation | Écran de création vierge, nom « Maison Barillet ». Tout le parcours pays → profil → origine est à cliquer. |
| trimestre | http://localhost:5173/?capture=trimestre | T1 2017, Suisse · Artisan. Horloger, décorateur et ingénieur embauchés. Panneau des heures en haut. |
| modele | http://localhost:5173/?capture=modele | T1 2018, profil Ingénieur. Panneau de conception ouvert : quartz / ébauche / manufacture, Grande date (niv. 2) et Chrono à came (niv. 1) débloqués. |
| classement | http://localhost:5173/?capture=classement | Classement annuel 2015. Maison Barillet au **rang 1 192**. |
| vieillissement | http://localhost:5173/?capture=vieillissement | Rapport du T3 2018. Le modèle « Tavannes » marqué **(vieillissant)**. |
| concurrents | http://localhost:5173/?capture=concurrents | Même écran que *classement* : les 10 géants et 4 indépendants voisins. |
| proto-v1 | http://localhost:5173/proto-v1.html | Le prototype de `docs/`, servi tel quel, même agrandissement ×1,6. |

Une URL mal orthographiée affiche la liste des scènes disponibles.

## Pour le split-screen

Ouvrir côte à côte, dans deux fenêtres de même taille :

- http://localhost:5173/proto-v1.html
- http://localhost:5173/?capture=creation

Les deux colonnes font exactement la même largeur à l'image.

## Valeurs vérifiées dans le code

**Mouvements** (`src/data/config.js`, `MOUVEMENTS`) :

| mouvement | coût unitaire | coût de R&D |
|---|---|---|
| Quartz | 20 CHF | 8'000 CHF |
| Ébauche | 220 CHF | 35'000 CHF |
| Manufacture | 2'500 CHF | 400'000 CHF |

⚠ **L'écran de conception affiche le coût de R&D, pas le coût unitaire.** Dans
la scène *modele* on lit « Quartz — CHF 5'600 », « Manufacture — CHF 280'000 » :
ce sont les R&D avec la remise de −30 % du profil Ingénieur. Les 20 et 2'500
CHF n'apparaissent nulle part à l'écran — ils entrent seulement dans le « coût
par pièce » d'un modèle, avec le reste des composants et le multiplicateur de
pays.

**Classement** : rang **1 192** obtenu en 2015, avec 177'005 CHF de revenus
annuels. Non forcé : la scène joue plusieurs exercices et garde celui dont le
rang est le plus proche de 1 200. L'écran l'affiche « #~1192 », avec un tilde.

**Concurrents** (`src/data/monde.js`) :

- 10 géants : Rolodex, Cartel, Homega, Padek Philange, Audemars Pique,
  Long-Innes, Fissot, Grand Seikho, TAG Heure, Ublot
- 10 indépendants : Manufacture Delorme, Kairos & Cie, Atelier Brumaire,
  Ferrand-Roux, Tempus Nova, Ostara Watch Co, Cadran Bleu, Maison Vaucher,
  Heure Zéro, Berthoud Frères
