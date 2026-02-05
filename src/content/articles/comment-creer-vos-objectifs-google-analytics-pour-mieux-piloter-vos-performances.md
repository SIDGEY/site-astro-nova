---
title: "Comment créer vos objectifs Google Analytics pour mieux piloter vos performances ?"
description: "Google Analytics permet de placer le focus sur certains « comportements » de vos visiteurs.    Un comportement peut consister en une page vue  (..."
date: 2020-05-29
author: "Atecna Team"
coAuthors: []
tags: ["Google Analytics", "Tips"]
draft: false
seo:
  title: "Comment créer vos objectifs Google Analytics pour mieux piloter vos performances ?"
  description: "Google Analytics permet de placer le focus sur certains « comportements » de vos visiteurs.    Un comportement peut consister en une page vue  (..."
---

Google Analytics permet de placer le focus sur certains « comportements » de vos visiteurs.

Un comportement peut consister en une page vue  (par exemple _« Page confirmation de commande »_) mais aussi en la réalisation d’un événement (par exemple _« Ajout panier »_).

Un objectif, **c’est donc la réalisation d’un comportement** que nous jugeons important de suivre dans le temps.

## Comment créer un objectif Google Analytics ?

Tout se situe dans la partie _« Admin »_ :

💠 Cliquez sur _« Configuration »_

💠 Cliquez maintenant sur _« Objectif »_

[![objectis_GA](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)](https://www.atecna.fr/wp-content/uploads/2020/05/11102017/objectis_GA.png)

Ensuite, cliquez sur _« Nouvel objectif »_.

Vous voilà dans le **formulaire de création**.

Ici, deux possibilités s’offrent à vous : passer par un modèle ou par la méthode personnalisée.

C’est cette seconde option sur laquelle nous allons nous pencher ici :

💠 Nom : Donnez un nom clair et compréhensible par tous à votre objectif, en veillant à respecter une nomenclature précise.

💠 Type :

*   **Destination** : si l’objectif se base sur la vue d’une page
*   **Event** : si l’objectif se base sur la réalisation d’un événement Google Analytics
*   **Durée** : pour isoler les visites avec plus de X secondes, X minutes, X heures
*   **Pages/Ecrans par session** : pour isoler les visites avec plus de X pages

Pour la suite, partons sur deux exemples concrets.

## Créer un objectif à partir d’un événement

Prenons l’exemple de **la validation d’un formulaire de contact sur le site atecna.fr** :

Je me rends sur le site et vérifie l’événement s’envoyant lors de la validation formulaire avec le module dataslayer par exemple. Si besoin, relisez [notre article sur la recette du tracking](https://www.atecna.fr/articles/recetter-un-plan-de-marquage-analytics-un-jeu-denfants/). 😀

Dans le cas d’Atecna, cela donne :

*   Catégorie : « contactez\_nous »
*   Action : « soumissions\_formulaire »
*   Libellé : « Lille »

Dans le formulaire de création, je choisis donc le type « Event », et je configure de la sorte :

[![event_GA](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)](https://www.atecna.fr/wp-content/uploads/2020/05/11102015/event_GA.png)

Je ne renseigne pas le champ « Libellé », car je souhaite recueillir l’ensemble des événements correspondants, et pas uniquement ceux qui concernent Lille.

💡 **La petite astuce :** pour les trois premiers champs, je peux renseigner du « strictement égal », du « commence par » ainsi que du regex.

*   **Valeur :** la valeur permet d’attribuer une valeur monétaire à la réalisation d’un événement.

Deux possibilités :

*   L’événement renseigne une valeur et je peux donc l’utiliser
*   Je renseigne une valeur fixe\*

Dans le cas présent, attribuer une valeur ne serait pas pertinent, je fais donc le choix de ne pas renseigner ce champ.

**Notre premier objectif est maintenant créé !** 👍🏻

## Créer un objectif à partir d’une page vue

Prenons l’exemple de **la fiche produit vue.**

*   Je me rends sur une fiche produit, et je vérifie comment est construit la variable « Path », toujours avec le module dataslayer. En effet, cette variable ne correspond pas forcément toujours à l’URL).
*   Dans notre cas, nous avons : Path = « produit/fiche\_produit/cat=kitchen/sku=123 »

Si je souhaite un objectif pour toutes les fiches produit de manière générale, je procède comme suit :

[![objectif_fiche_produit](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)](https://www.atecna.fr/wp-content/uploads/2020/05/11102016/objectif_fiche_produit.png)

*   Si en revanche, je souhaite un objectif pour toutes les fiches produit cuisine, je vais réaliser la commande suivante :

[![objectif_fiche_produit_cuisine](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)](https://www.atecna.fr/wp-content/uploads/2020/05/11102017/objectif_fiche_produit_cuisine.png)

💡 **La petite astuce** **:** Pour les objectifs de type « destination », je peux créer un tunnel avec des étapes précédant l’objectif, facultatifs ou non. Dans notre exemple, je peux par exemple créer une étape antérieure pour les pages liste vues. A noter que l’objectif en tant que tel représente toujours la dernière étape.

[![entonnoir_de_conversion](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)](https://www.atecna.fr/wp-content/uploads/2020/05/11102015/entonnoir_de_conversion.png)

L’intérêt est double :

*   Avoir accès à des visualisations de type _« entonnoir »_, notamment dans _« Conversions > Objectifs > Schéma de l’entonnoir de conversion »_. Vous saurez ainsi quand l’utilisateur rentre et sort, et s’il réalise ou non l’objectif.
*   Alimenter les métriques _« amorces »_, _« abandons »_ et _« taux d’abandon »_.

## Pourquoi créer un objectif ?

L’avantage principal de l’objectif réside dans sa faculté à **créer automatiquement différents indicateurs liés au comportement.** Cela signifie que vous retrouverez dans vos différents rapports Google Analytics un certain nombre de métriques, à savoir :

*   **Réalisation de l’objectif** : tout simplement, le nombre de visites avec complétion de l’objectif
*   **Taux de conversion de l’objectif** : sur 100 visites, combien ont réalisé l’objectif ?
*   **Valeur de l’objectif** : valeur totale des objectifs

Puis ensuite, si vous avez défini un entonnoir :

*   **Amorce de l’objectif** : volume de visites ayant initié l’objectif (sur la première étape si celle-ci est obligatoire ou sur l’ensemble des étapes si aucune n’est obligatoire)
*   **Abandon du processus de conversion** : Volume de visites ayant initié l’objectif sans l’avoir réalisé
*   **Taux d’abandon de l’objectif**: visites ayant abandonné l’objectif / visites ayant initié l’objectif

**Autre avantage non négligeable :** les métriques _« amorces »_, _« réalisations »_ et _« valeur objectif »_ peuvent servir de construction des segments. Je peux donc facilement créer un segment des visites avec formulaire validé par exemple.

### Quelques exemples d’objectifs que nous vous recommandons de suivre

*   **Objectif « erreur vue »** : permet de monitorer le volume de visites avec au moins une erreur vue. L’apparition d’un pic pourrait ainsi vous permettre d’être réactif et d’alerter le support rapidement.
*   **Objectif « transaction »** : permet de suivre la part de visites avec commande. De la même manière, une baisse anormale pourrait mettre en évidence un problème dans le tunnel de commande.
*   **Objectif « hors rebond »** : un objectif isolant les visites avec 2 pages et plus permet de monitorer la qualité du trafic arrivant sur le site. Une forte diminution peut signifier une perte de qualité dans le trafic acheté par exemple.

## Gardez en tête

*   **La limite imposée est de 20 objectifs par vue.** Si vous n’avez plus d’objectif disponible, créez une nouvelle vue, ou « faites du ménage ». 😊
*   **La création d’un objectif n’est pas rétroactif**.
*   **Un objectif ne peut être supprimé.** S’il n’est plus pertinent, vous pouvez le désactiver pour éviter les mauvaises interprétations et lui attribuer un autre usage ultérieurement.

**Des questions sur le sujet ? Nous sommes à votre entière disposition !**

[Je contacte un expert](https://www.atecna.fr/contact/)
