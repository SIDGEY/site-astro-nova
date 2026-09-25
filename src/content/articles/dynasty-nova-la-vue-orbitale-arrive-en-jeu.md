---
title: "Dynasty Nova : la vue orbitale arrive en jeu"
date: 2026-09-25
description: "Dynasty Nova montre enfin un système comme un système : étoile centrale, corps en orbite, textures qui tournent. Une carte au survol révèle propriétaire, statut et ressources de chaque corps."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Galaxie", "Exploration", "UX/UI Design"]
draft: false
faq:
  - question: "Qu'est-ce que la vue orbitale dans Dynasty Nova ?"
    answer: "Une nouvelle façon d'afficher un système : une étoile au centre, ses corps en orbite à la distance de leur position réelle, chacun tournant sur lui-même. Elle remplace la liste habituelle à partir de 768px de large, sur les univers où elle est activée."
  - question: "Comment activer la vue orbitale dans Dynasty Nova ?"
    answer: "Une bascule Orbites / Liste apparaît directement dans la galaxie sur les univers où la fonctionnalité est ouverte, et le choix retenu se conserve d'une visite à l'autre. Sous 768px de large, seule la liste reste servie."
  - question: "Que montre la carte qui apparaît au survol d'un corps en vue orbitale ?"
    answer: "Sa position, son nom, son propriétaire teinté selon qu'il s'agit d'un allié ou d'un ennemi, son statut (vous, abandonnée, inhabitée), et pour une case déjà connue ses points, sa taille, sa plage de température et ses débris."
  - question: "La vue orbitale est-elle disponible sur tous les univers de Dynasty Nova ?"
    answer: "Non. Elle passe derrière un feature flag propre à chaque univers, fermé par défaut : tant qu'il n'est pas ouvert, seule la liste s'affiche, et la bascule elle-même n'apparaît pas."
coverPrompt: "a soft field of electric blue light"
image: "/uploads/blog/covers/dynasty-nova-la-vue-orbitale-arrive-en-jeu.webp"
---

## Introduction

Dynasty Nova ne se contente plus de décrire un système en liste : il peut désormais le montrer. Une étoile au centre, des corps qui tournent sur leur orbite à la bonne distance, et une carte détaillée qui se révèle au survol de chacun.

## Un système qui se voit plutôt que se lit

### L'étoile au centre, les corps à leur vraie place

La scène place une étoile au centre et répartit les corps en orbite à la distance de leur position réelle dans le système : la première position orbite près de l'étoile, la dernière loin d'elle. Le nombre d'orbites affichées s'adapte au nombre de positions que compte le système, sans jamais tasser deux orbites voisines l'une sur l'autre.

### Trois couches qui tournent différemment

Un corps affiche trois éléments qui ne bougent pas ensemble : sa texture défile lentement sur elle-même, la limite entre son jour et sa nuit reste orientée vers l'étoile plutôt que de tourner avec le corps, et son iconographie de coin ne tourne jamais, posée en fixe sur le cercle.

### Une figure propre à chaque système

L'angle de départ de chaque orbite se calcule à partir des coordonnées du système, pas d'un tirage aléatoire : deux systèmes voisins ne s'ouvrent jamais sur la même figure, et un même système retrouve toujours la sienne d'une visite à l'autre.

## Une carte détaillée au survol

### Ce qu'elle révèle pour un corps connu

Survoler un corps ouvre une carte qui affiche sa position, son nom, la couronne d'un corps important, et son propriétaire teinté selon qu'il s'agit d'un allié, d'un partenaire de pacte ou d'un ennemi. Pour une case déjà sondée, elle ajoute les points du propriétaire, la taille du corps, sa plage de température et ses débris en métal et en cristal.

### La même discrétion qu'en liste

Une case jamais sondée ne révèle ni son propriétaire ni son biome dans cette carte, exactement comme dans la liste classique : la vue orbitale ne crée aucune fuite d'information que le mode liste ne laissait pas déjà passer.

## Une vue qui respecte le joueur qui clique

### Des révolutions lentes plutôt qu'un mouvement gênant

Les corps se déplacent lentement sur leur orbite, l'orbite la plus proche de l'étoile étant la plus rapide. Le système se fige entièrement dès qu'un corps est survolé ou reçoit le focus clavier, et reprend son mouvement sans saut au moment où l'attention se détourne.

### Toujours réservée à un univers qui l'ouvre

La vue orbitale reste fermée par défaut sur chaque univers, dissimulée derrière une fonctionnalité que l'équipe active univers par univers. Tant qu'elle ne l'est pas, la bascule elle-même n'apparaît nulle part : proposer un choix d'affichage dont un seul terme existe n'aurait aucun sens.

### Un interrupteur géré depuis l'administration

Chaque univers dispose de son propre panneau de fonctionnalités dans le back-office, avec une case pour l'ouvrir à tout le monde ou la réserver à une liste de testeurs. Fermer la vue orbitale sur un univers ne fait pas oublier cette liste : elle reprend effet dès que la fonctionnalité rouvre.

## Conclusion

La vue orbitale change la manière de lire un système sans rien retirer à ce que la liste offrait déjà. Reste à découvrir sur quels univers Dynasty Nova choisira de l'ouvrir en premier.
