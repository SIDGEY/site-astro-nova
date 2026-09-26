---
title: "Dynasty Nova : neuf familles d'assets repensées pour la v6"
date: 2026-09-25
description: "Bâtiments, installations, recherche, défense, vaisseaux, avatars, héros, illustrations d'aide et packs boutique passent tous sur une même recette visuelle v6. Le détail de ce qui change et pourquoi."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Identité Visuelle", "Développement", "UX/UI Design"]
draft: false
icon: "ph-palette"
coverPrompt: "a soft field of electric blue light"
faq:
  - question: "Quelles parties du jeu changent avec la refonte visuelle v6 ?"
    answer: "Neuf familles d'assets passent sur la recette v6 : bâtiments, installations, recherche, défense, vaisseaux, avatars, héros, illustrations d'aide, packs boutique et icônes de ressources. Les textures de planètes ne sont pas concernées, elles sont traitées à part."
  - question: "Est-ce que la bannière de la page galaxie change de comportement ?"
    answer: "Oui : elle affichait auparavant l'illustration de l'univers courant, avec une illustration de secours qui n'apparaissait en pratique jamais. Elle montre désormais une seule illustration de galaxie, la même quel que soit l'univers où vous jouez."
  - question: "Pourquoi l'illustration de galaxie garde-t-elle un rendu différent des autres bannières ?"
    answer: "Le passage par la charte colorimétrique assombrissait et refroidissait trop ce rendu, en effaçant le cœur chaud et les traînées de poussière crème de l'illustration d'origine. Elle garde donc son rendu non gradé, les quinze autres bannières gardent le leur."
  - question: "Le travail sur les planètes fait-il partie de cette mise à jour ?"
    answer: "Non, les textures de planètes (sphères, cartes d'albédo, de normales et de spéculaire, rendus d'horizon et de vue complète) sont traitées dans une passe séparée."
---

## Une même recette visuelle pour neuf familles d'assets

Dynasty Nova regénère neuf familles d'assets sur une recette v6 commune, construite à partir de deux images de référence par famille puis passées par une même charte colorimétrique. L'objectif : que la boutique, l'arbre de recherche ou l'écran de défense se lisent comme un seul univers cohérent, plutôt que comme des couches ajoutées au fil du temps.

### Les familles concernées

Neuf familles reçoivent la passe v6 : bâtiments, installations, recherche, défense, vaisseaux, avatars, héros de page, illustrations d'aide et packs de la boutique. Les icônes de la barre de ressources suivent la même recette pour rester visuellement alignées avec le reste.

### Ce qui reste pour une passe séparée

Les textures de planètes (rendu sphérique, cartes d'albédo, de normales et de spéculaire, vues d'horizon et vues complètes) ne font pas partie de cette mise à jour. Elles suivent leur propre chantier, avec ses propres contraintes techniques, pour ne pas retarder la sortie du reste.

## Un changement de comportement sur la page galaxie

La bannière héros de la page galaxie ne se contente pas d'un nouveau visuel, elle change de logique d'affichage.

### Avant : une illustration de secours jamais visible

La bannière suivait l'univers courant du joueur, avec l'illustration générique de galaxie prévue comme repli le temps que l'univers charge. Dans les faits, ce chargement est trop rapide pour que ce repli s'affiche jamais : l'illustration de secours restait un code mort visuel, invisible pour tous les joueurs.

### Maintenant : une seule illustration, dans tous les univers

La page galaxie affiche désormais une illustration unique, la même quel que soit l'univers rejoint. Les cartes de sélection d'univers, elles, gardent leur propre logique d'illustration par univers : rien n'est perdu, seule la bannière change de règle.

## Un détail assumé plutôt que corrigé en silence

Sur seize bannières héros repassées par la charte colorimétrique v6, une seule garde volontairement son rendu d'origine.

### Pourquoi l'illustration de galaxie fait exception

Le passage par la charte assombrissait et refroidissait le rendu de l'illustration de galaxie au point de perdre son cœur chaud et ses traînées de poussière couleur crème, deux éléments qui donnaient son identité à l'image. Plutôt que de livrer un rendu dégradé pour respecter une règle uniforme, l'illustration garde son grade d'origine.

### Une exception documentée, pas un oubli

Ce genre de choix, laissé sans explication, ressemble à une erreur de fabrication qu'un joueur attentif pourrait signaler par erreur. En le documentant explicitement, l'équipe évite qu'une exception assumée soit reprise comme un bug à corriger.

## Explorer la galaxie sous son nouveau visage

Cette repasse visuelle ne change aucune mécanique de jeu, elle rend plus lisible ce qui existait déjà : bâtiments, flotte, recherche et boutique parlent enfin la même langue visuelle. Rejoindre un univers, c'est désormais évoluer dans un empire dont chaque écran a été pensé ensemble plutôt qu'empilé au fil des mises à jour.
