---
title: "Construire des interfaces utilisateurs animées et optimisées avec WAAPI"
description: "Aujourd’hui, les animations sont devenues incontournables lorsque nous utilisons des applications.    Nous verrons dans cet article quelles peuvent être leurs..."
date: 2021-01-19
author: "Atecna Team"
coAuthors: []
tags: ["animations", "keyframes", "Tips", "WAAPI", "Web Animation"]
draft: false
seo:
  title: "Construire des interfaces utilisateurs animées et optimisées avec WAAPI"
  description: "Aujourd’hui, les animations sont devenues incontournables lorsque nous utilisons des applications.    Nous verrons dans cet article quelles peuvent être leurs..."
---

Aujourd’hui, **les animations sont devenues incontournables** lorsque nous utilisons des applications.

Nous verrons dans cet article **quelles peuvent être leurs utilités, quelles sont les bases de l’animation sur le web, et comment les développer avec l’API Web Animations.**

## Qu’est-ce qu’une animation (réellement) ?

> _« Une animation est la visualisation d’un changement au fil du temps, où plutôt pendant une durée spécifiée, dans le but de créer pour l’utilisateur une expérience intuitive et agréable dans nos applications. »_
> 
> Leon Revill, Web Architect @revillweb

## Pourquoi les animations sont-elles importantes lors de la conception d’application ?

Il existe 3 raisons qui justifient à elles-seules d’investir du temps dans l’ajout d’animation à nos applications :

1.  **Les utilisateurs s’y attendent** Avec toutes les applications disponibles aujourd’hui, **les utilisateurs sont habitués à des interfaces utilisateurs lisses, et cela s’accompagne souvent d’une animation.** Ainsi, si votre application n’utilise pas bien l’animation, elle peut sembler moins « raffinée », voir même obsolète. Si vous supprimiez toutes les animations de vos applications préférées, vous seriez surpris de voir à quel point l’expérience serait différente !
2.  **L’animation bien faite augmente considérablement l’expérience utilisateur** Nous avons dit que l’animation était la visualisation du changement sur une durée. Elle est importante, car elle nous permet en tant que développeur, de décrire en détail à l’utilisateur pourquoi nous modifions quelque chose sur son écran. C’est une sorte d’autre dimension de communication avec l’utilisateur 🙂
3.  **Certaines animations sont tout simplement amusantes** L’ajout d’animation peut réellement procurer de la joie à l’utilisateur et donner une impression positive à votre application. L’intérêt réside également dans la possibilité pour vous d’exprimer une partie de votre personnalité et de montrer à vos utilisateurs que vous vous souciez des expériences que vous leur offrez. Cependant il faut être prudent avec l’utilisation de telles animations puisqu’il est facile de faire en sorte que l’utilisateur attende que votre animation se termine avant de pouvoir réellement obtenir ce qu’il voulait faire en premier lieu. Ceci est très ennuyeux pour l’utilisateur et vous ne voulez pas que ça arrive.

## Les bases de l’animation sur le web

WAAPI s’avère particulièrement puissant pour créer des interfaces utilisateurs animées. Cependant, il est nécessaire afin de garantir des performances optimales de connaître certaines « best practices, notamment en ce qui concerne les principes de base de l’utilisation des animations en CSS. En effet certaines propriétés CSS sont plus coûteuses à animer que d’autres.

## Quelles propriétés à animer ?

Il existe quatre étapes principales dans le processus des navigateurs, qui peuvent se produire lorsque vous modifiez une propriété sur un élément :

1.  Calculer le style
2.  Générer la géométrie et la position (**Layout**)
3.  Peindre les éléments sur les calques (**Paint**)
4.  Dessiner les calques sur l’écran (**Composite**)

![Chrome devtools frame mode](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

« Chrome devtools frame mode » : plus vous démarrez haut dans la cascade plus le navigateur doit travailler

La propriété à modifier détermine la quantité de travail que le navigateur doit effectuer pour procéder au rendu de la page.

[Voici un lien](https://csstriggers.com/) qui indique pour chaque propriété les étapes dans lesquelles le navigateur intervient.

Par exemple, les propriétés suivantes : _left, right, top, bottom, margin, padding, width, heigh_t font intervenir le navigateur dès l’étape 2 : Layout.

Une propriété ci-dessus affectée par un changement affectera de même tous ses enfants, et c’est au navigateur de tout recalculer.

_color, background, box-shadow, border-radius_ sont des exemples de propriétés qui font intervenir le navigateur à l’étape 3.

Seules deux propriétés ne font intervenir le navigateur qu’à l’étape 4 : _opacity_ et _transform_

Voici [un article rédigé par Paul Lewis et Paul Irish](https://www.html5rocks.com/en/tutorials/speed/high-performance-animations/) qui détaille encore davantage tout cela 😊

**Ce qu’il faut retenir, c’est qu’il est vivement recommandé d’utiliser ces deux dernières propriétés pour créer des animations à moindre coût !**

## La propriété _will-change_ pour optimiser vos animations

Cette propriété permet aux développeurs d’indiquer aux navigateurs les modifications que nous allons apporter à un élément. Cela permet au navigateur d’effectuer les optimisations appropriées à l’avance.

![Capture écran box](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Lorsque nous effectuerons ces changements, le navigateur effectuera les modifications plus rapidement.

Pour connaître plus en détails les rouages opérés par le navigateur derrière cette technologie, [voici une vidéo sortie lors du Google I/O 2016.](https://www.youtube.com/watch?v=thNyy5eYfbc)

## L’API Web Animation (WAAPI)

L’API Web Animations est une API JavaScript standardisée, intégrée dans les navigateurs et permettant aux développeurs d’animer des éléments DOM.

CSS a toujours été le moyen le plus performant d’animer sur le web, car le moteur d’animations CSS peut exécuter des animations sur le processeur graphique (GPU) au lieu du processeur centrale (CPU), ce qui nous permet de réaliser des animations fluides à 60 images par seconde.

L’API Web Animations nous permet enfin d’écrire une logique d’animation en Javascript et ouvre le moteur d’animation du navigateur nous permettant d’exécuter ces animations sur le GPU.

**En gros, WAAPI permet :**

*   Des animations performantes s’exécutant sur le GPU
*   Des animations dynamiques avec Javascript
*   Un contrôle de lecture des animations, ce qui permet de mettre en pause, de rembobiner, etc…
*   de chaîner de multiples animations avec les promises
*   de s’adapter parfaitement à l’approche composants des librairies/Framework JavaScript actuels (_React, Angular, VueJS_, etc…)
*   Tout ça, sans aucune dépendance 🤩

## Compatibilité des navigateurs

![Capturé écran navigateurs WAAPI](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Excepté Internet Explorer (comme d’habitude 🤡), la plupart des navigateurs supportent les fonctionnalités proposées par WAAPI.

Vous pouvez vous rendre [sur ce lien](https://caniuse.com/?search=web%20animations%20api) pour en savoir plus, et un polyfill est également disponible [à cette adresse](https://github.com/web-animations/web-animations-js).

## Les bases

Allons faire un tour dans le code, et voyons la différence entre une petite animation CSS (à gauche) et la même chose en javascript (à droite).

![Différence entre animation CSS et Javascript](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Qui nous donne le résultat suivant :

![Animation Hi qui change de couleur](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Nous voyons que la méthode utilisée pour créer une animation en Javascript se nomme « animate ». Jusque-là, tout semble logique 🙂.

Le premier argument de cette méthode est un tableau d’objets keyframe. Ces keyframes représentent les différents états de notre animation. il faut au moins spécifier 2 objets représentant l’état de début et de fin de l’animation.

Le second argument de cette méthode est soit un objet avec un ensemble d’options, soit un nombre représentant la durée de l’animation.

Il existe une autre syntaxe : au lieu de spécifier un tableau comme premier argument de la méthode « animate », vous pouvez spécifier un objet et chaque propriété de celui-ci sera alors la propriété de l’élément que vous souhaitez animer.

Par exemple :

![Capture écran box animate](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Syntaxe 1 : utiliser la méthode animate avec comme premier argument, un tableau d’objet keyframes

![Capturé écran méthode animate](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Syntaxe 2 : utiliser la méthode « animate » avec comme premier argument un objet contenant les propriétés à modifier

Ces deux morceaux de code font exactement la même chose : vous pouvez [voir une démonstration ici.](https://codesandbox.io/s/waapi-demo-1-w3i0t)

Notons cependant que l’utilisation de la syntaxe 2 a ses limites : vous ne pouvez pas spécifier un offset pour chacune des keyframes individuelles. Il est impossible également d’utiliser des fonctions d’accélération pour chacune des keyframes.

Nous verrons ces deux choses un peu plus loin dans l’article 😉

## Travailler avec les keyframes

### La propriété offset

Pour illustrer ce qui va suivre, voici petit morceau de code qui fait déplacer un élément que j’ai nommé « circle » :

![Capture écran circule animate](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Ici, nous voyons qu’il y a 4 keyframes, soit 4 étapes d’animation

Puisque nous n’avons pas spécifié de durée, l’API Web Animations va d’elle-même diviser  la durée de 2 secondes pour aller de l’étape 1 à l’étape 4 de manière égale.

![API Web Animations](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

La propriété offset permet de spécifier une durée par nous-même. Celle-ci doit être un nombre compris entre 0 et 1.

Voici un exemple ci-dessous :

![Capture écran propriété Offset circulate animate](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Voici comment le navigateur va traiter notre animation à présent qu’un offset a été défini :

![Etapes Api web animations](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

### La propriété easing

Il existe une autre propriété dans l’objet keyframe nommée « easing ». Cela nous permet de modifier la fonction d’accélération par défaut à utiliser en 2 objets keyframes.

L’API Web Animations utilise par défaut une fonction d’accélération linéaire, ce qui signifie que le taux de changement est constant tout au long de l’animation.

J’ai modifié l’exemple utilisé plus haut pour illustrer mes propos.

Voyez plutôt :

![Capture écran circulate animate propriété easing](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Dans l’exemple suivant, j’ai mis la propriété easing à l’étape 1 et 2

Le navigateur va traiter le passage de l’étape 1 à l’étape 2 avec la fonction « ease-in ». Cela ressemble à une accélération progressive.

De l’étape 2 à 3, l’animation sera jouée avec la fonction d’accélération « ease-out », soit l’inverse de la fonction « ease-in » : elle ralentit à la fin de sa progression.

Pour en savoir plus sur ces fonctions d’accélération et ces « trucs de mathématiciens », je vous laisse [vous diriger là-dessus 🧙](https://developers.google.com/web/fundamentals/design-and-ux/animations/the-basics-of-easing)‍

Vous pouvez également consulter la démonstration du code utilisé dans cette partie [à cette adresse](https://codesandbox.io/s/waapi-demo-2-m0k68).

## Les propriétés de timing

Je vous avais dit que j’y reviendrai 😊

Lors du tout premier morceau de code que je vous ai présenté pour illustrer une animation avec WAAPI, un objet faisait office de deuxième argument de la méthode « animate » : c’est celui-ci que nous allons voir en détail dans cette partie.

On peut donc utiliser un objet contenant une multitude d’options pour contrôler certains aspects de notre animation. Il existe à l’heure actuelle 8 propriétés qui peuvent être spécifiées dans cet objet :

*   duration
*   delay
*   direction
*   easing
*   endDelay
*   fill
*   iterations
*   iterationStart

Voici un petit exemple pour illustrer :

![Capture écran box animate propriétés timing](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

J’ai défini ici 5 propriétés de timing.

Dans cet exemple, la propriété duration indique au navigateur que la durée de l’animation est de 2 secondes.

La propriété « _delay »_ indique quand l’animation doit commencer. Ici elle démarre 2 secondes après le chargement de la page.

La propriété « _iterations »_ indique au navigateur combien de fois il doit exécuter l’animation. Ici elle s’exécute sans arrêt, mais on peut préciser un nombre si on le souhaite.

La propriété « _direction »_ mise ici en « alternate » indique que l’animation se fera de droite à gauche puis de gauche à droite, et ainsi de suite.

On peut aussi définir une fonction d’accélération globale à notre animation avec la propriété « _easing »._ Par défaut, elle est linéaire, je ne reviens pas sur ce sujet vu un peu plus en détail précédemment 😎

Pour aller plus loin sur ce qu’on peut faire avec toutes ces propriétés je vous renvoie [vers cette documentation.](https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming)

Vous pouvez également retrouver [une démonstration à cette adresse.](https://codesandbox.io/s/waapi-demo-3-2rjjm)

## Les contrôles de lecture fournis par WAAPI

WAAPI fournit cinq méthodes pour contrôler nos animations :

*   pause()
*   play()
*   reverse()
*   finish()
*   cancel()

On peut ainsi faire fonctionner nos animations avec des événements, tels que l’interaction avec l’utilisateur.

Généralement, quand vous créez une animation, elle est directement lue par le navigateur. La méthode pause() permet de stopper celle-ci avant qu’elle ne commence.

Regardez l’exemple ci-dessous :

![Capture écran méthode pause](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Ici, l’animation sera joué avec la méthode play() lors du click sur la box

Vous pouvez retrouver [la démonstration via ce lien.](https://codesandbox.io/s/waapi-demo-4-lfvqo)

La méthode reverse() permet de rembobiner l’animation.

Cette méthode est très utile, notamment si vous créez une modale qui a une animation à l’ouverture. Vous pouvez simplement appeler la méthode reverse() lors de la fermeture pour effectuer l’animation à l’envers.

La différence entre les méthodes cancel() et finish() est la suivante :

*   La méthode finish() permet de sauter l’animation directement à l’état finale.
*   La méthode cancel() annule complétement l’animation et la réinitialise à l’état de départ.

Il existe des propriétés de contrôle de lecture comme _« currentTime »_ ou _« playbackRate »_ qui permettent de modifier la vitesse de lecture de l’animation. Là encore, [la documentation vous permettra d’aller plus sur ces sujets.](https://developer.mozilla.org/en-US/docs/Web/API/Animation#Properties)

## Les callbacks et les promises

Dans « le monde réel », on veut souvent animer plusieurs éléments.

Une animation peut émettre plusieurs événements :

*   _« onCancel »_ lorsque l’animation est annulée avec la méthode cancel()
*   _« onFinish »_ lorsque l’animation est terminée. C’est grâce à cet événement que nous pourrons enchaîner les animations.

On peut également utiliser les promises pour chaîner les animations, mais celles-ci ne sont pas encore supportées par l’ensemble des navigateurs.

Pour en savoir plus sur les promises, [rendez-vous ici.](https://developer.mozilla.org/en-US/docs/Web/API/Animation/finished)

## Conclusion

Nous avons vu pourquoi il était cool de mettre en place des animations lors du développement de nos interfaces, et la plus-value que cela peut représenter.

On sait aussi maintenant comment le navigateur procède pour rendre nos éléments animés, et les principes de base de l’animation.

Je vous ai montré le fonctionnement de WAAPI dans les grandes lignes : maintenant vous n’avez plus d’excuses pour ajouter un peu de fun dans vos interfaces ! 😜

Personnellement, je recommanderai d’utiliser WAAPI pour des animations complexes où il est nécessaire de savoir quand un morceau se termine, où lors d’événements qui ne peuvent pas être gérés en CSS.

Et bien sûr, vous pouvez toujours utiliser les animations CSS pour effectuer des choses simples en termes de performance ! 😊
