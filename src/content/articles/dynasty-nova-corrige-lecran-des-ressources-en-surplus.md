---
title: "Dynasty Nova corrige l'affichage des ressources en surplus"
date: 2026-08-20
description: "Un correctif récent met fin à un bug frustrant : les ressources reçues au-delà de votre capacité de stockage étaient invisibles et impossibles à dépenser. Voici ce qui change."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Mise à Jour", "Gameplay", "Ressources"]
draft: false
image: "/uploads/blog/covers/dynasty-nova-corrige-lecran-des-ressources-en-surplus.webp"
icon: "ph-wrench"
faq:
  - question: "Pourquoi mes ressources ne peuvent-elles pas dépasser ma capacité de stockage ?"
    answer: "Elles le peuvent désormais. Un correctif récent permet à votre métal, cristal et hydrogène de dépasser la capacité de vos entrepôts lorsqu'un surplus arrive d'un coup, par exemple via un transport de flotte."
  - question: "Que se passe-t-il si je reçois plus de ressources que ma capacité de stockage ?"
    answer: "Le surplus reste visible et disponible : vous pouvez toujours lancer une construction ou une recherche avec. Seule la production locale de cette ressource se met en pause tant que le surplus n'est pas résorbé."
  - question: "Comment savoir si ma production de ressources est à l'arrêt ?"
    answer: "La jauge correspondante passe au rouge et affiche la valeur réelle du surplus (par exemple 250k/100k), accompagnée d'une bannière qui explique pourquoi la production est temporairement gelée."
  - question: "Le surplus de ressources va-t-il finir par se perdre ?"
    answer: "Non. Il ne diminue que si vous le dépensez ou si votre consommation nette est négative, jamais par un plafonnement artificiel du stock lui-même."
coverPrompt: "a soft field of warm amber and gold light"
---

## Introduction

Gérer un empire spatial, c'est avant tout gérer un flux : métal, cristal et hydrogène s'accumulent, se dépensent, s'échangent entre planètes. Un bug récent cassait ce flux dans un cas précis, et particulièrement injuste : celui du surplus.

## Le problème : un surplus invisible et bloqué

### Une planète qui refuse d'utiliser son surplus

Quand une planète recevait d'un coup plus de ressources que sa capacité de stockage ne pouvait en contenir, typiquement après un transport de flotte entre deux colonies, ce surplus disparaissait purement et simplement de l'affichage. Pire : il restait indépensable. Impossible de lancer la construction ou la recherche qu'il aurait pourtant largement permis de financer.

### Une seule cause, un effet partout

La cause tenait à une seule ligne de logique, mais elle irriguait tout le jeu. La barre de ressources, les modales de détail, les bâtiments, les recherches, le chantier spatial et même les défenses lisaient tous la même valeur, plafonnée artificiellement à la capacité de stockage, quelle que soit la quantité réellement possédée.

## La correction : plafonner la production, pas le stock

### La nouvelle règle

Le correctif inverse la logique. Désormais, c'est la **production** qui est plafonnée par la capacité de stockage, pas le stock lui-même :

- Si votre stock reste sous la capacité, rien ne change : l'accumulation continue normalement.
- Si un surplus arrive (transport, récompense, pack), il est conservé tel quel et reste pleinement dépensable ; seule la production locale de cette ressource se met en pause tant qu'il n'est pas résorbé.
- Si votre consommation nette redevient négative, le stock redescend normalement, même en surplus : le plafond n'agit que vers le haut.

### Ce qui change à l'écran

Le changement le plus visible se joue sur la jauge de ressources : elle affiche désormais la valeur réelle sans la tronquer, sature à 100 % et passe au rouge en cas de surplus. Dans la fenêtre de détail, l'en-tête indique clairement le rapport entre le surplus et la capacité (par exemple 250k/100k), avec une bannière qui explique que la production est en pause, sans jamais bloquer la dépense.

## Pourquoi ça compte pour votre stratégie

Ce genre de correctif est discret, mais il change concrètement la façon d'aborder certaines décisions. Un joueur qui planifiait un gros transport de ressources entre deux planètes n'a plus besoin d'anticiper une perte au passage : tout ce qui arrive reste utilisable, même largement au-delà de sa capacité de stockage. C'est un détail qui compte quand chaque unité de métal ou de cristal peut faire la différence dans une course à la technologie ou à la flotte.

## Conclusion

Dynasty Nova continue d'affiner ces mécaniques au fil des retours de la communauté bêta. La meilleure façon de bâtir un empire fiable, c'est de commencer par des fondations qui ne trichent jamais avec vos ressources.

**Explorer la galaxie** et tester ce correctif directement en jeu reste la meilleure manière de voir la différence.
