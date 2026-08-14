# BARILLET — point de situation S4
### Intégration du lot de contenu · branche `chantier-post-beta` · 16 commits

---

## 1. Où on en est

Le brief S4 comptait huit étapes. **Sept sont livrées, la huitième ne l'est pas.**

| étape | état |
|---|---|
| 1 · règles de tirage | ✅ livrée |
| 2 · chronologie complète | ✅ livrée |
| 3 · aléas | ⚠️ 55 sur 68 |
| 4 · presse achetée + enquête | ✅ livrée |
| 5 · familles de journal | ✅ livrée |
| 6 · politique salariale | ✅ livrée |
| 7 · opportunités | ✅ livrée (26/26) |
| 8 · entrées à choix | ❌ non commencée |

**Volumes :**

| | avant S4 | maintenant | visé |
|---|---|---|---|
| événements | 5 | **57** | 51 |
| aléas | 10 | **55** | 68 |
| opportunités | 5 | **26** | 26 |

Les 13 aléas manquants sont les 12 marqués *(choix)* dans le lot v2 et
`copieConcurrent`. Ils ne sont **pas** saisis dans le catalogue : ils attendent
l'interface de décision de l'étape 8, sans laquelle ils se liraient comme des
aléas subis — exactement l'inverse de l'intention.

Le format de sauvegarde passe en **v10** (l'état porte désormais le pays, le
profil, la politique salariale, la mémoire des tirages, les modificateurs
durables, le compteur de complaisances et l'historique des rangs).

---

## 2. Le trou de 42 ans est comblé

`npm run chrono` vérifie et affiche : **aucune année vide de 2015 à 2065**,
57 événements dont 34 à effet permanent.

Les chiffres 2015-2026 sont ceux du lot, non arrondis. La répartition
trimestrielle est respectée (les événements ne sont pas regroupés en T1).

**Empilement des effets permanents**, multiplicateurs de demande cumulés :

| gamme | 2035 | 2050 | 2065 |
|---|---|---|---|
| grand public | ×0,87 | ×0,75 | ×0,75 |
| lifestyle | ×1,19 | ×1,25 | ×1,25 |
| connaisseurs | ×1,46 | ×2,11 | ×1,50 |
| bling | ×1,61 | ×1,45 | ×0,51 |

Aucune gamme ne descend sous ×0,4. Le quartz tombe à ×0,30 en grand public
après 2050, mais c'est `finQuartz` qui le veut explicitement.

En parallèle, les coûts montent : ×1,30 sur la production en 2065, ×1,19 sur
les charges fixes plus 12'800 CHF par trimestre en ajouts secs, ×1,22 sur les
salaires.

---

## 3. Ce que la chronologie a changé au jeu

**Le jeu est devenu gagnable.** C'est le fait marquant de la session : le
critère (a) de la Phase B, bloqué depuis des mois, est rempli sans qu'on ait
touché à une seule formule de demande. Deux stratégies sur quatre entrent au
Top 50.

```
bot          | Top 50 (médiane) | faillites | CA médian 2065 | rang
Margeur      |             2041 |         0 | CHF 229'461'650 |   56
Volumiste    |                — |         0 |  CHF 93'697'102 |  110
Prestigieux  |             2033 |         0 | CHF 228'044'232 |   57
Équilibré    |                — |         4 |   CHF 1'196'598 | 1086
```

**Trois critères restent en échec, et ils tiennent au contenu, pas au code :**

1. **Entrée au Top 50 en 2033**, sept ans trop tôt. Le Prestigieux surfe sur
   `polarisation` dès 2026.
2. **Écart de CA de 191×** entre la meilleure et la pire stratégie survivante.
3. **L'Équilibré meurt 4 fois sur 10.** En trace, il ne s'effondre pas : il
   plafonne à 1 M de chiffre dès 2020 et n'en bouge plus.

**Diagnostic.** Deux causes cumulées, l'une de demande, l'autre de coûts.

- **La demande** : `polarisation` (2026) déplace définitivement le marché vers
  le haut de gamme. Un événement d'atténuation a été ajouté en 2045
  (`retourMilieu`) sur demande : il ramène l'écart grand public / connaisseurs
  de 3,3× à 2,8× en 2050, et fait remonter le Volumiste de 87 à 94 M. Ça
  corrige sans effacer le pari de gamme, mais ça arrive dix-neuf ans après le
  choc.
- **Les coûts** : `bns` impose **+18% de coûts permanents dès le premier
  trimestre** à un joueur suisse. S'y ajoutent `carbone`, `energie`, `matieres`
  et `transmission`. Une stratégie à marge fine n'accumule jamais la
  trésorerie nécessaire à l'agrandissement, et reste bloquée à un employé
  pendant quarante ans. C'est le suspect principal de la mort de l'Équilibré.

Aucune formule de demande n'a été touchée, conformément au brief.

---

## 4. Un angle mort de la mesure

**Les bots n'acceptent aucune opportunité** — zéro occurrence dans le harnais.
Les 26 opportunités, dont les 21 nouvelles, ne sont donc mesurées par rien.

La question posée en fin de brief — « si `licenceMarque`, `familyOffice`,
`rachatFournisseur` ou `contratOEM` devient un passage obligé plutôt qu'une
bifurcation, dis-le-moi » — **est sans réponse**. Y répondre suppose
d'apprendre aux bots à arbitrer une opportunité, ce qui est un chantier à part
entière : il faut leur donner une politique de décision, sinon on mesure la
politique et non l'opportunité.

C'est la lacune la plus sérieuse de cette session.

---

## 5. Écarts assumés par rapport au brief

1. **Les effets sont devenus déclaratifs.** Cinq événements tenaient dans une
   fonction écrite à la main ; cinquante-sept avec trente-quatre effets
   permanents, non. Un module d'empilement (`engine/effets.js`) additionne des
   modificateurs typés. C'est ce qui rend l'étape 2 vérifiable par un test.
2. **Les heures par pièce sont devenues de la capacité.** « Heures +15% » se
   code « capacité ×0,87 » : même résultat, sans propager l'accumulateur dans
   les dix fonctions qui comptent des heures.
3. **Trois effets de canal sont approximés en portée globale**
   (`swatchBaselworld`, `exodeBaselworld`, `salonUnique`). Le lot demandait des
   modificateurs par canal et la création d'un canal « salon de Genève ». C'est
   la déviation la moins fidèle du lot et elle mérite une reprise.
4. **Le tirage de scandale du voyage de presse a été retiré**, remplacé par le
   compteur de complaisances. Les deux faisaient doublon, et c'est le compteur
   qui était demandé.
5. **Deux aléas ont perdu leur coût en heures** (`venteCaritative`,
   `ecolePartenariat`) : un aléa se subit dans le rapport, il n'a pas de bouton
   pour dépenser des heures. Ils devraient passer en aléas à choix à l'étape 8.
6. **Quatre mécaniques ont été ajoutées** parce que quatre opportunités
   promettaient un effet qu'aucun code ne tenait : précommande avec échéance et
   pénalité, engagement de volume, revenu récurrent, embauche facilitée.

---

## 6. Décisions attendues

1. **`bns` doit-il rester à +18% permanent ?** C'est le levier le plus probable
   de la mort de l'Équilibré. Trois options : le laisser (le joueur doit
   apprendre à couvrir ses coûts), lui donner une durée, ou le compenser par un
   événement de reprise plus tôt que 2045.
2. **L'entrée au Top 50 en 2033 est-elle acceptable ?** Le critère disait
   « aucune stratégie avant 2040 ». Soit on ralentit le début, soit on révise le
   critère maintenant que le jeu est enfin gagnable.
3. **Faut-il apprendre aux bots à arbitrer les opportunités ?** Sans ça, un
   quart du contenu de S4 reste non mesuré.
4. **L'étape 8 est-elle prioritaire sur le reste de S4 ?** Les 12 aléas à choix
   et les trois événements à décision (`robotEtabli`, `espace`, l'offre de
   rachat de `consolidation`) attendent une interface. Le brief disait que
   c'était « la moitié de la variété perçue ».

---

## 7. Backlog ajouté

**Tutoriel « l'horlogerie en quelques pages »**, pour les néophytes qui veulent
une aide au départ. Le jeu suppose acquis un vocabulaire qui ne l'est pas :
ébauche, manufacture, anglage, complication. Trois à cinq pages courtes,
consultables avant la partie et **rappelables en jeu** depuis les endroits où
le vocabulaire apparaît — un mur de texte au démarrage se saute. Contenu
pressenti : ce qu'il y a dans une montre ; quartz / ébauche / manufacture, ce
que chacun coûte et rapporte ; les quatre gammes et leur clientèle ; ce qu'une
complication prend et ce qu'elle rend ; pourquoi les trois jauges d'image ne se
rattrapent pas à l'argent. Ces pages sont aussi un script de vidéo pour la
chaîne. Placé en S6, ou S5 si les assets arrivent tôt.

---

## 8. Prochaine session — ordre arrêté

L'équilibrage est **clos jusqu'à S6**. Ne pas le rouvrir avec de vrais joueurs
plutôt qu'avec des bots.

1. **Les cinq fins alternatives, en entier.** Priorité absolue : c'est ce qui
   achève la restructuration du Top 50 en jalon. Sans elles, la deuxième moitié
   de partie n'a pas de but. Conditions chiffrées déjà arbitrées en § 9 du lore
   (Succession, Marque Culte, Empire, Montre du Siècle, Scandale), avec leur
   ordre de priorité et leurs exclusions mutuelles par la direction.
2. **Le tutoriel** — trois à cinq pages courtes, consultables **avant** la
   partie et **rappelables en jeu** depuis les endroits où le vocabulaire
   apparaît : ébauche, manufacture, complication, anglage. Pas de mur de texte
   au démarrage. Ces pages servent aussi de script vidéo pour la chaîne.
3. **Les canaux Baselworld** (écart n° 3) — l'exode doit forcer la bascule
   foires → e-commerce. En portée globale, il n'est qu'un malus.

Si une seule session ne suffit pas pour les trois : **livrer les fins
complètes et s'arrêter proprement.**

---

## 9. Reste du S4 initial, non traité

Objectifs quinquennaux · les 20 YouTubeurs (bloqués sur les accords Frank sans
C, Flyback, Clément Entretemps) · déblocage progressif des actions · combos et
synergies.

## 10. Après : S5

Assets — sprites par couches, avatars, animations. Le verdict de tous les
testeurs est « austère », et c'est le seul chantier qui y répond.
