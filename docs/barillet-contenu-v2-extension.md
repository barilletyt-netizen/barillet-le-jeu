# BARILLET — LOT DE CONTENU v2 · EXTENSION
## 40 aléas supplémentaires · 18 opportunités supplémentaires
### S'ajoute à `barillet-contenu-v1.md`. Totaux après implémentation : **68 aléas · 26 opportunités**

---

# 0 · DEUX RÈGLES DE TIRAGE (à coder AVANT le contenu)

Sans elles, 68 aléas se comportent comme 10 : les mêmes reviennent, les rares ne sortent jamais.

**Règle 1 — mémoire courte.** Tout aléa ou opportunité déjà tiré voit son poids divisé par 4 pendant 12 trimestres, puis par 2 pendant 12 de plus. Même principe que la pénalité de rotation déjà en place dans la Gazette.

**Règle 2 — pondération par époque.** Chaque entrée porte une fenêtre `epoque` : `debut` (marque < 5 ans ou < 3 employés), `croissance`, `maturite` (> 15 ans ou > 10 employés), ou `toujours`. Un aléa hors de sa fenêtre a un poids de 0. Sans ça, le joueur reçoit une proposition de rachat de maison au trimestre 3 et un cambriolage de réserves vides.

**Fréquences révisées** avec ce volume : aléa 45% par trimestre (au lieu de 40%), opportunité 50% (au lieu de 45%). Le jeu peut se permettre d'être plus vivant maintenant que le catalogue est profond.

---

# 1 · 40 ALÉAS SUPPLÉMENTAIRES

Format : `id` · condition · époque — texte de rapport, puis titres de presse.

## 1A · Atelier et production (8)

**`maitreRetraite`** · savoir-faire ≥ 40 · croissance/maturité
> Un maître horloger à la retraite propose de venir deux jours par semaine. Savoir-faire +6, mais 4'000 CHF de plus par trimestre. *(choix : accepter / décliner)*
> « Un ancien revient à l'établi » · « La transmission par la porte de derrière »

**`erreurSerie`** · ≥ 50 pièces produites ce trimestre · toujours
> Une erreur de réglage sur toute une série. 20% de la production à repasser : autant d'heures perdues.
> « Toute une série à reprendre » · « L'erreur qu'on ne voit qu'après »

**`apprentiDoue`** · ≥ 2 employés · toujours
> Un apprenti d'un talent rare. Savoir-faire +4 tout de suite, et dans quatre trimestres il vaudra un horloger confirmé — sans en coûter le salaire pendant deux ans.
> « Un apprenti qu'on garde » · « Le coup d'œil d'un débutant »

**`outillageOccasion`** · ≥ 1 agrandissement · toujours
> Une manufacture qui ferme liquide son outillage. 40'000 CHF pour 200 h de capacité supplémentaire — le prix d'un tiers d'agrandissement. *(choix)*
> « Le tour d'un confrère » · « L'outillage d'une maison qui ferme »

**`accidentTravail`** · ≥ 3 employés · toujours
> Un accident à l'établi. Personne de gravement blessé, mais un poste immobilisé un trimestre et une inspection à venir. Crédibilité −2.
> « Accident à l'atelier » · « Une inspection s'annonce »

**`inventaireOublie`** · marque ≥ 4 ans · toujours
> En rangeant la réserve : trente pièces d'un ancien modèle, jamais mises en vente. Elles partent en stock immédiatement.
> « Trente montres retrouvées » · « Le fond de réserve »

**`hygrometrie`** · ≥ 1 agrandissement · croissance/maturité
> La régulation d'humidité a lâché. Poussière et oxydation : 10% du stock à démonter et nettoyer.
> « L'atelier prend l'humidité » · « Tout à démonter »

**`normesAtelier`** · ≥ 5 employés · maturité
> Mise aux normes exigée sur l'atelier. 18'000 CHF, non négociables.
> « L'inspection passe » · « Les normes ont un prix »

## 1B · Fournisseurs et matières (6)

**`lotDefectueux`** · toujours
> Un lot de cadrans arrive hors tolérance. Production divisée par deux ce trimestre, remboursement partiel du fournisseur.
> « Des cadrans hors tolérance » · « Le lot qu'il faut renvoyer »

**`remiseVolume`** · ≥ 300 pièces sur l'année · croissance/maturité
> Le fournisseur propose −12% sur les composants pendant un an, contre un engagement de volume. En dessous, pénalité. *(choix)*
> « Le fournisseur propose un contrat » · « Remise contre engagement »

**`fournisseurHistorique`** · marque ≥ 6 ans · toujours
> Le fournisseur qui vous suivait depuis les débuts ferme. Coûts +15% pendant deux trimestres, le temps d'en retrouver un.
> « La maison qui nous fournissait ferme » · « Vingt ans de relation qui s'arrêtent »

**`ebauchesLiquidation`** · toujours
> Soixante ébauches en liquidation à moitié prix. À prendre maintenant ou jamais. *(choix)*
> « Des ébauches à saisir » · « La liquidation d'un confrère »

**`penurieSaphir`** · toujours
> Les glaces saphir manquent. Heures par pièce +20% ce trimestre, le temps de sourcer ailleurs.
> « Plus de saphir » · « Les glaces manquent »

**`maroquinier`** · désirabilité ≥ 30 · croissance/maturité
> Un maroquinier réputé propose de signer vos bracelets. Qualité +1 permanente sur un modèle, coût +40 par pièce. *(choix + sélection du modèle)*
> « Un maroquinier signe nos bracelets » · « Le cuir prend un nom »

## 1C · Commercial et distribution (6)

**`detaillantImpaye`** · canal détaillants actif · toujours
> Un détaillant dépose le bilan avec votre marchandise. 8% du chiffre du trimestre passé en pertes.
> « Un détaillant fait défaut » · « La marchandise et l'argent »

**`commandeCorporate`** · notoriété ≥ 25 · toujours
> Une entreprise veut quarante pièces gravées à son logo pour ses cadres. Payées comptant, sans marge de négociation. *(choix : le prestige contre le cachet)*
> « Quarante montres pour une entreprise » · « La commande d'entreprise »

**`localCentreVille`** · trésorerie ≥ 250'000 · croissance/maturité
> Un local se libère dans une rue passante, à 30% sous le prix habituel d'une boutique. L'occasion ne se représentera pas. *(choix)*
> « Un local en centre-ville » · « L'adresse qui se libère »

**`vagueRetours`** · ≥ 200 pièces vendues sur l'année · toujours
> Une vague de retours clients sur un défaut mineur mais visible. 5% des ventes annulées, désirabilité −3.
> « Les clients renvoient » · « Un défaut qui se voit »

**`marcheGrisEnvol`** · désirabilité ≥ 50 · croissance/maturité
> Vos pièces se revendent 40% au-dessus du prix catalogue. Désirabilité +8 — et pas un franc pour la maison.
> « La cote s'envole sur le marché gris » · « On revend plus cher que nous »

**`revendeurParallele`** · canal e-commerce ≥ palier 2 · toujours
> Un revendeur parallèle brade vos modèles en ligne. Ventes +10% ce trimestre, désirabilité −6. Difficile de s'en réjouir.
> « Nos montres bradées en ligne » · « Le circuit parallèle »

## 1D · Presse, réseaux et réputation (7)

**`podcast`** · crédibilité ≥ 15 · toujours
> Un podcast horloger vous invite une heure. 20 h de préparation, crédibilité +4, notoriété +3. *(choix)*
> « Une heure au micro » · « La maison se raconte »

**`macroVirale`** · un modèle en vente · toujours
> Quelqu'un a filmé en macro un défaut de finition sur votre mouvement. La vidéo tourne. Crédibilité −6, notoriété +6.
> « Le défaut filmé de trop près » · « La macro qui fait mal »

**`forumsDefense`** · crédibilité ≥ 30 · toujours
> Attaquée sur un forum, la marque a été défendue par ses propres clients. Crédibilité +3, désirabilité +2.
> « Les clients montent au créneau » · « Une communauté qui répond »

**`couvertureMagazine`** · notoriété ≥ 30 · croissance/maturité
> Couverture d'un magazine spécialisé. Notoriété +7, crédibilité +3.
> « En couverture » · « La une d'un magazine »

**`demontageDirect`** · un modèle en vente · toujours
> Un YouTubeur démonte votre montre en direct devant 200'000 personnes. Tout dépend de ce qu'il y a dedans.
> Si qualité ≥ 7 : crédibilité +8, désirabilité +5. Sinon : crédibilité −7, désirabilité −4.
> « Démontée en direct » · « L'épreuve du tournevis »

**`prixDesign`** · un modèle de moins de 2 ans · croissance/maturité
> Un prix de design récompense une de vos pièces. Désirabilité +7, notoriété +4.
> « Un prix pour le dessin » · « Récompensée pour son style »

**`celebriteGenante`** · notoriété ≥ 40 · toujours
> Une personnalité très commentée porte votre montre partout. Notoriété +9, crédibilité −5. On ne choisit pas ses ambassadeurs.
> « Une ambassadrice encombrante » · « Le poignet qu'on n'avait pas demandé »

## 1E · Marché et finance (6)

**`tauxHausse`** · dette > 100'000 · toujours
> Les taux montent. Vos intérêts augmentent de moitié pour les trois prochaines années.
> « La banque resserre » · « Le crédit coûte plus cher »

**`investisseurApproche`** · CA annuel ≥ 1 M · croissance/maturité
> Un investisseur propose 400'000 CHF contre 20% du capital. De quoi accélérer — et un actionnaire à convaincre. *(choix ; alimente la dilution et la fin « rachat »)*
> « Un investisseur frappe à la porte » · « De l'argent contre des parts »

**`subventionRegionale`** · pays = Suisse ou France · debut/croissance
> Une aide régionale à l'artisanat vous est accordée : 50'000 CHF, sans contrepartie autre qu'un dossier à remplir.
> « Une aide pour l'artisanat » · « Le canton met la main à la poche »

**`primeAssurance`** · ≥ 1 agrandissement · toujours
> Après le sinistre d'un confrère, les primes d'assurance de la branche augmentent. Coûts fixes +4'000 par trimestre.
> « Les assurances revoient leurs tarifs » · « Le sinistre du voisin, notre facture »

**`changeFavorable`** · toujours
> Le change vous est favorable ce trimestre. Coûts de production −8%.
> « Le change joue pour nous » · « Un trimestre de répit sur les coûts »

**`grosImpaye`** · CA annuel ≥ 500'000 · toujours
> Un client important ne paie pas et conteste. 12% de la trésorerie bloqués, procédure engagée.
> « Un impayé qui pèse » · « L'argent qui ne rentre pas »

## 1F · Humain (3)

**`horlogerLegendaire`** · savoir-faire ≥ 60 · maturité
> Un horloger dont tout le monde connaît le nom cherche une maison. Savoir-faire +12 et crédibilité +6 s'il signe — au double du salaire habituel. *(choix)*
> « Un nom rejoint la maison » · « Le régleur que tout le monde voulait »

**`ancienCamarade`** · marque ≤ 8 ans · debut/croissance
> Un ancien camarade d'école propose de s'associer : 200'000 CHF contre 15% et un droit de regard. *(choix ; dilution)*
> « Un associé se propose » · « L'argent d'un ami »

**`departsSimultanes`** · ≥ 4 employés ET politique salariale serrée · toujours
> Deux départs le même mois. Le message est clair. Savoir-faire −6, deux postes vacants.
> « Deux départs le même mois » · « L'atelier se vide »

## 1G · Liés au pays de départ (4)

**`labelSwissMade`** · pays = Suisse · croissance/maturité
> Contrôle sur la composition de vos montres. Mise en conformité 25'000 CHF, ou renoncement au label — et à ce qu'il permet de facturer. *(choix)*
> « Le label sous contrôle » · « Ce que veut dire Swiss made »

**`zoneEconomique`** · pays = Chine · toujours
> Votre région est classée zone économique prioritaire. Coûts de production −10%, permanent.
> « La région passe en zone prioritaire » · « Un coup de pouce administratif »

**`marcheInterieurJP`** · pays = Japon · toujours
> Le marché intérieur japonais s'ouvre enfin aux petites maisons locales. Demande +15% pendant deux ans.
> « Le marché intérieur s'entrouvre » · « Les Japonais découvrent leurs marques »

**`presseParisienne`** · pays = France · toujours
> La presse parisienne s'entiche de votre maison. Crédibilité +6, notoriété +5. Ça ne durera pas, autant en profiter.
> « Paris s'entiche de la maison » · « La presse parisienne adopte »

---

# 2 · 18 OPPORTUNITÉS SUPPLÉMENTAIRES

Format : `id` · coût CHF · coût heures · condition · époque — texte, puis effet.

## 2A · Salons et concours (4)

**`salonAsie`** · 40'000 · 100 h · crédibilité ≥ 20 · croissance/maturité
> Un salon horloger asiatique vous propose un stand. Loin, cher, et c'est là que se trouve la moitié des acheteurs.
- Notoriété +12, crédibilité +5, portée des canaux +15% pendant 4 trimestres.

**`salonAmerique`** · 35'000 · 90 h · notoriété ≥ 25 · croissance/maturité
> Un salon à New York, sur le premier marché mondial. Le billet d'entrée est le double d'ailleurs.
- Notoriété +10, canal détaillants +1 palier gratuit si déjà ouvert.

**`concoursDesign`** · 8'000 · 40 h · un modèle de moins de 3 ans · toujours
> Un concours de design horloger. Peu de gloire, mais une ligne au palmarès.
- 45% de nomination (désirabilité +5), 15% de victoire (désirabilité +10, notoriété +6).

**`salonEcoles`** · 5'000 · 40 h · ≥ 2 employés · toujours
> Le salon des écoles d'horlogerie. Deux jours à serrer des mains pour recruter avant les autres.
- Prochaine embauche à −50% de coût en heures, et l'employé arrive avec savoir-faire +3.

## 2B · Image et prestige (5)

**`partenariatMusee`** · 20'000 · 60 h · savoir-faire ≥ 45 · maturité
> Un musée horloger propose une exposition temporaire sur votre maison.
- Crédibilité +10, désirabilité +5, notoriété +4.

**`documentaire`** · 30'000 · 80 h · marque ≥ 10 ans · maturité
> Une équipe veut tourner un documentaire sur l'atelier. Un mois de caméras dans les pattes.
- Notoriété +14, crédibilité +6. Production −20% ce trimestre (l'atelier est occupé).

**`atelierOuvert`** · 10'000 · 50 h · ≥ 1 agrandissement · toujours
> Ouvrir l'atelier au public deux week-ends. Les gens veulent voir des mains travailler.
- Crédibilité +5, désirabilité +4, et 15 ventes directes à plein tarif.

**`ambassadeur`** · 60'000 · 40 h · notoriété ≥ 45 · maturité
> Signer un ambassadeur reconnu. Cher, efficace, et jamais tout à fait sincère.
- Notoriété +18, désirabilité +6, crédibilité −3. Coûts fixes +8'000/trimestre tant que le contrat court (12 trimestres).

**`capsuleCollab`** · 25'000 · 70 h · désirabilité ≥ 35 · croissance/maturité
> Une marque d'un autre univers — mode, automobile, musique — propose une série capsule.
- Notoriété +12, désirabilité +8, crédibilité −4. 50 pièces vendues d'office à 1,5× le prix.

## 2C · Commercial (4)

**`boutiqueEphemere`** · 30'000 · 60 h · notoriété ≥ 20 · toujours
> Un pop-up de trois mois dans une rue passante. Tout le stock disponible, plein tarif.
- Écoule jusqu'à 80 pièces du stock à 100% du prix, notoriété +5.

**`preventeCommunaute`** · 0 · 60 h · désirabilité ≥ 30 · toujours
> Proposer une précommande à vos clients fidèles. L'argent rentre avant que la montre existe.
- Encaisse immédiatement 60% du prix de 40 pièces à produire dans les 2 trimestres. Si la production ne suit pas : crédibilité −8 et remboursement.

**`contratOEM`** · 0 · 90 h · ≥ 3 employés · croissance/maturité
> Une autre marque veut que vous produisiez pour elle, sans votre nom dessus. C'est de l'argent facile et un peu d'âme en moins.
- Revenu garanti pendant 4 trimestres (l'équivalent de 100 pièces au coût +35%), mais crédibilité −5 et la capacité mobilisée d'autant.

**`licenceMarque`** · 0 · 50 h · notoriété ≥ 50 · maturité
> Un industriel veut licencier votre nom pour une gamme accessible. Beaucoup d'argent, un vrai risque.
- +250'000 CHF immédiats et +40'000/trimestre pendant 12 trimestres. Désirabilité −12, crédibilité −8, permanents.

## 2D · Production et savoir-faire (3)

**`certificationChrono`** · 25'000 · 80 h · qualité d'un modèle ≥ 7 · croissance/maturité
> Faire certifier chronomètre un de vos calibres. Long, cher, et ça se voit sur le cadran.
- Qualité +1 permanente sur le modèle, crédibilité +7, prix acceptable +12%.

**`rachatFournisseur`** · 300'000 · 100 h · trésorerie ≥ 500'000 · maturité
> Votre fournisseur de composants est à vendre. L'acheter, c'est ne plus jamais dépendre de personne.
- Coûts matière −25% permanents, savoir-faire +6, +1 agrandissement d'atelier. **Première étape concrète vers la verticalisation** (fin « La Montre du Siècle » / accomplissement manufacture).

**`formationInterne`** · 15'000 · 70 h · ≥ 4 employés · croissance/maturité
> Faire former toute l'équipe par un spécialiste extérieur pendant un trimestre.
- Savoir-faire +8, efficacité d'équipe +8% permanente. Production −25% ce trimestre.

## 2E · Finance (2)

**`familyOffice`** · 0 · 70 h · CA annuel ≥ 3 M · maturité
> Un family office propose un ticket patient : de l'argent qui ne demande pas de résultat trimestriel.
- +1'000'000 CHF contre 25% du capital. Aucun coût récurrent. **Alimente la dilution → fin « rachat ».**

**`empruntObligataire`** · 0 · 60 h · CA annuel ≥ 5 M · maturité
> Émettre un emprunt auprès de vos clients : ils prêtent, vous remboursez en montres ou en francs.
- +600'000 CHF de dette à taux réduit (3%), désirabilité +5 (les clients deviennent parties prenantes).

---

# 3 · NOTE D'ÉQUILIBRAGE

Ce lot ajoute beaucoup de sources de trésorerie et de jauges. **Refaire tourner `npm run bots` après implémentation est obligatoire** : quatre opportunités (`licenceMarque`, `familyOffice`, `rachatFournisseur`, `contratOEM`) peuvent à elles seules débloquer une stratégie que les bots ne connaissent pas encore. Si l'une d'elles devient un passage obligé, c'est qu'elle est trop bonne — les opportunités doivent être des bifurcations, pas des étapes.

Les choix marqués *(choix)* doivent tous passer par l'interface d'acceptation/refus déjà en place pour les opportunités : un aléa qui se subit et un aléa qui se décide ne se lisent pas pareil, et c'est la moitié de la variété perçue.
