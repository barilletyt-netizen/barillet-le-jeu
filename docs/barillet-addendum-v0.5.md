# BARILLET — ADDENDUM SPEC v0.5
## À fusionner dans barillet-le-jeu-lore.md (Claude Code : lire ce fichier et mettre à jour le lore, puis supprimer cet addendum)

### 1. SYSTÈME D'HEURES — remplace les points d'action (décision majeure)

**Principe.** Plus de PA. Le fondateur dispose de **500 heures par trimestre**. Toute action coûte des heures. Les heures non allouées vont automatiquement à l'établi (production + savoir-faire, comme l'ancien bonus établi).

**Coûts indicatifs (blocs chunky, jamais de micro-gestion) :**
- Campagne marketing : 60 h + CHF
- Campagne choc : 80 h + CHF
- Relations presse : 40 h
- R&D nouveau modèle : 150 h (puis le développement court sur les trimestres comme avant)
- Facelift : 60 h + CHF
- Salon : 80 h + voyage
- Kickstarter : 120 h
- Développer la distribution : 60 h + CHF
- Étude de marché : 30 h + CHF
- Négociation fournisseur / embauche / emprunt : 20–40 h
- Production : les heures restantes du fondateur alimentent l'atelier (quartz 1 h/pièce, ébauche 3 h, manufacture 10 h — inchangé)

**Employés = heures spécialisées.** Chaque employé apporte ~450 h/trimestre dans sa spécialité :
- **Horloger** : heures de production + qualité
- **Décorateur** : débloque les finitions (impact désirabilité), heures de production haut de gamme
- **Ingénieur** : accélère la R&D, requis pour certaines complications
- **Expert matériaux** : débloque bronze/or/titane/céramique (remplace partiellement les modules matériaux), réduit les coûts matière
- Plus tard (départements) : commercial, marketing, IT — convertissent des tâches du fondateur en tâches déléguées

**Conséquence design voulue** : en début de partie, chaque heure de com est une montre non produite. La première embauche est un tournant. C'est le cœur émotionnel du jeu.

**Migration** : supprimer PA_PAR_TRIMESTRE ; les prérequis d'actions passent de « X PA » à « X heures » ; l'ancien bonus établi disparaît (les heures libres SONT l'établi).

### 2. COUCHE NARRATIVE (priorité anti-austérité)

- **Récit trimestriel** : 1–2 paragraphes générés par gabarits, qui racontent le trimestre en intégrant (a) les actions prises par le joueur, (b) l'aléa/événement, (c) le résultat commercial, (d) une brève du monde. Ton : chronique horlogère, sérieux avec clins d'œil.
- **Nouvelles des concurrents** : chaque trimestre, 1–2 brèves du monde (« Rolodex ouvre une boutique à Shanghai », « Ublot signe un footballeur », « Ferrand-Roux en difficulté — rachat possible »). Les marques du Top 50 ont des revenus qui évoluent d'année en année (croissance aléatoire pondérée + événements), le classement n'est plus statique.
- **Page d'introduction** au lancement d'une partie : le pitch (créer une marque pérenne, viser le Top 50), les règles de base, le contexte 2015.

### 3. OBJECTIFS QUINQUENNAUX

Tous les 5 ans (2020, 2025, 2030…), un **méga-événement** : bilan de décennie du Stanley Morgan + un objectif proposé pour les 5 ans suivants (ex. « atteindre CHF 500'000 de revenus annuels », « lancer une mécanique », « entrer au top 500 »). Objectif atteint = récompense (crédibilité, offre de financement, invitation salon majeur). Raté = conséquence douce. Relance l'intérêt du passage des trimestres.

### 4. COMPLICATIONS (arbre techno — à implémenter enfin)

- Arbre : Date → Chronographe → GMT → Phase de lune → Réserve de marche → Tourbillon
- Chaque complication : R&D (heures + CHF + trimestres), prérequis (ingénieur employé ou profil ingénieur pour les hautes), ajoute heures de production/pièce, qualité et prix acceptable en hausse
- La « Montre du Siècle » (fin n°8) exige le tourbillon manufacture

### 5. ASSETS & AUDIO (session dédiée)

- Menu d'accueil avec élément pixel animé (balancier qui oscille)
- Personnage animé en jeu selon le profil : établi (artisan/ingénieur) ou bureau (financier)
- **Bande sonore composée par Julien** (2–3 pistes + sons UI) : prévoir un gestionnaire audio simple (boucle menu, boucle jeu, stingers cérémonie annuelle/fin), volume réglable, coupé par défaut sur mobile
- Sprites montres par couches : boîtier × matériau × cadran × bracelet (déjà prévu)

### 6. REPORTÉ EN v1.1 (post-beta, décision de périmètre)

- Décoration profonde des montres (pierres, gravures, cadrans d'art) : cosmétique, multiplie les sprites, n'ajoute rien mécaniquement au lancement. La combinatoire boîtier/matériau/cadran/bracelet suffit pour la v1.

### 7. PLAN DE SESSIONS RÉVISÉ (4 → 6)

- **S2 : moteur** — système d'heures (fondateur + employés spécialisés), complications, rééquilibrage crédibilité, horizon → 2065
- **S3 : narratif** — récit trimestriel, brèves concurrents, classement vivant, page d'intro
- **S4 : rythme** — objectifs quinquennaux, événements 2026–2065, aléas complets, les 20 YouTubeurs
- **S5 : assets** — sprites par couches, avatars, personnage animé, menu animé, intégration audio
- **S6 : polish & beta** — équilibrage complet (une partie 2015–2065 testée), écrans de fin, build itch.io + GitHub Pages
- Beta communauté : fin novembre. Devlog #1 : dès que S2–S3 donnent quelque chose à montrer.
