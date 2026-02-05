---
title: "La découverte du framework Remix : un retour d’expérience"
description: "Pour la refonte du site web corawine.be, nous avons décidé d’utiliser le framework Remix, un framework full stack web qui utilise React sous le capot ave..."
date: 2023-10-03
author: "Atecna Team"
coAuthors: []
tags: ["Développement Front End", "Framework Remix", "REX"]
draft: false
seo:
  title: "La découverte du framework Remix : un retour d’expérience"
  description: "Pour la refonte du site web corawine.be, nous avons décidé d’utiliser le framework Remix, un framework full stack web qui utilise React sous le capot ave..."
---

Pour la refonte du site web [corawine.be](http://corawine.be), nous avons décidé d’utiliser [le framework Remix, un framework full stack web](https://remix.run/) qui utilise React sous le capot avec du rendu côté serveur. Un concurrent de NextJS pour faire simple. D’ailleurs, nos équipes avaient participé à [la NextJS 13 conf 2022](https://www.atecna.fr/articles/compte-rendu-next-js-2022/).

Nous voulions tester Remix car bien que NextJS, soit le framework le plus renommé et le plus utilisé des full stack web frameworks en React, il a quand même quelques limitations, nous forçant à adopter la manière spécifique à NextJS.  
Là où le framework Remix, lui, part du principe que le navigateur peut faire pleins de choses.

## Explication du framework

Les personnes habituées à travailler avec du « pur » [React](https://react.dev/) vont être déroutées. En effet, elles vont devoir passer des Form partout et traiter les données côté backend. Cependant, une fois qu’on a pris le pli, c’est très plaisant et beaucoup plus rapide à utiliser.  

Comme tous les framework web full stack actuels, du moins à ma connaissance, Remix prend le parti pris de tout mettre dans un seul fichier.  
  
Je m’explique, la méthode côté backend appelée pour récupérer les données et construire le composant est appelée « [loader](https://remix.run/docs/en/main/discussion/introduction)« . De même, la méthode permettant d’exécuter du code côté backend lors de l’appui sur un bouton pour valider l’envoi d’un formulaire est nommée « [action](https://remix.run/docs/en/main/discussion/introduction)« . Tout cela est encapsulé dans le fichier du composant lui-même.

![presentation du framework Remix](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

## Avantages & inconvénients du framework Remix

Suite à l’utilisation [du framework Remix](https://remix.run/) sur un projet de taille moyenne, nous avons pu identifier les avantages et les inconvénients de ce framework.

### Les avantages de Remix

*   **Avec Remix, vous revenez aux bases du web.** Les formulaires sont simples, directs et efficaces.  
    Cela nous donne une grande liberté de création et nous permet d’écrire du code plus performant. C’est un gros avantage du framework Remix, tout est dans le même fichier. Cela permet de se retrouver donc rapidement dans le code et de gagner du temps en développement.

*   **Le routing est super simple à prendre en main.** Chaque composant est une route, ce qui rend le routing très simple à mettre en place.

*   Le framework Remix dispose **d’une gestion des erreurs intégrée**. Cela nous permet de gérer les erreurs de manière simple et efficace, sans avoir a recréer la roue pour le moindre cas un peu complexe

### Les inconvénients d’utiliser Remix

*   Ce framework est moins utilisé que NextJS, ce qui signifie qu’il y a moins de documentation et de ressources disponibles.

*   Le fait que **tout soit dans le même fichier** est un avantage, mais sans une standardisation préalable, cela peut vite devenir un énorme fouillis entre le code Front et Back au sein d’une même page.

*   Le framework Remix ne gère pas très bien l’internationalisation. Il est possible de mettre en place une solution, mais c’est un peu plus compliqué que sur NextJS.

## Recommandations

Si vous cherchez un framework full stack web pour développer un site web simple ou de taille moyenne, ce framework est une très bonne option.

Cependant, si vous cherchez un framework pour développer un site web complexe ou internationalisé, nous vous recommandons d’utiliser NextJS.

## **Bonus : quelques conseils pour utiliser le framework Remix**

*   **Standardisez votre code dès le départ**

Pour éviter de vous retrouver avec un fouillis entre le code Front et Back, standardisez votre code dès le départ.  
Par exemple, vous pouvez utiliser des conventions de nommage pour les variables, les fonctions et les classes.

*   **Utilisez ses outils**

Le framework Remix propose une série d’outils qui vous aideront à développer vos projets.  
Par exemple, le Remix Dev Server vous permet de développer votre site web en local de manière rapide et efficace.

*   **N’hésitez pas à demander de l’aide**

[La communauté du framework Remix](https://github.com/remix-run/remix/discussions) est très active et il existe de nombreuses ressources disponibles pour vous aider à démarrer, n’hésitez pas à demander de l’aide si vous avez des questions ou si vous vous confrontez à des problèmes complexes.

## Conclusion

Globalement, je suis satisfait de mon expérience avec le framework Remix.  
C’est un framework qui permet de développer des sites web rapidement et efficacement.

Cependant, il est important de prendre en compte les inconvénients de l’outil avant de l’utiliser sur un projet important.

## ****Envie d’échanger avec la Team Front-End ?****

Ils seront ravis de répondre à vos questions !
