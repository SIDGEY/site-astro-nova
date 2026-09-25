---
title: "Dynasty Nova : les lunes ont enfin leur propre visage"
date: 2026-09-25
description: "Dynasty Nova donne aux lunes leur propre jeu de textures : fini la copie conforme de leur planète, place à une surface grise cratérée, sans ciel ni halo atmosphérique."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Lunes", "Exploration", "Fonctionnalité"]
draft: false
faq:
  - question: "Pourquoi une lune ressemblait-elle à sa planète dans Dynasty Nova ?"
    answer: "Parce que le contrat de jeu recopiait le type et le biome de la planète sur sa lune. La scène 3D dérivait ses textures de ce couple : une lune s'affichait donc comme une seconde copie de sa planète, même nom, mêmes coordonnées, même visage."
  - question: "Une lune a-t-elle une atmosphère dans Dynasty Nova ?"
    answer: "Non. Une lune est désormais marquée comme un corps sans air : la coque atmosphérique additive qui habille une planète disparaît, et la frange lumineuse au limbe devient une simple lueur rasante plutôt qu'un halo."
  - question: "Toutes les lunes ont-elles la même apparence dans Dynasty Nova ?"
    answer: "Pour l'instant, oui : un premier jeu de textures partagé habille toutes les lunes. Le système est construit pour se diversifier facilement plus tard, la sélection passant déjà par un simple index de dossier."
coverPrompt: "a soft field of turquoise and teal light"
image: "/uploads/blog/covers/dynasty-nova-les-lunes-ont-enfin-leur-propre-visage.webp"
---

## Introduction

Dynasty Nova donne aux lunes un visage qui leur appartient. Jusqu'ici, une lune affichait la même texture que sa planète, halo atmosphérique compris : elle reçoit désormais son propre jeu de cartes, taillé pour un corps sans air.

## Le problème d'une lune qui n'existait pas vraiment

### Une texture recopiée depuis la planète

Le contrat de jeu ne donnait à une lune ni type ni biome propres : les deux venaient de la case occupée par sa planète. La scène 3D dérivait donc son jeu de textures de ce couple hérité, et une lune s'affichait comme une seconde copie de sa planète, même nom, mêmes coordonnées, même visage.

### Un halo qui n'avait pas de sens

Ce visage recopié incluait la coque atmosphérique additive d'une planète, un habillage pensé pour un corps qui respire. Une lune l'affichait quand même, alors qu'elle n'a jamais eu d'air à donner à voir.

## Un jeu de textures pensé pour un corps sans air

### Une surface grise et cratérée

Les lunes reçoivent désormais leur propre jeu de textures, au même format que celui des planètes : cartes équirectangulaires d'albédo, de relief et de reflet. La sélection distingue explicitement un corps de type lune, qui ne prend jamais plus le couple type/biome hérité de sa planète.

### Une frange de lumière plutôt qu'un halo

Un corps sans air se voit doté d'un indicateur dédié qui masque la coque atmosphérique et ramène la frange lumineuse au limbe à une simple lueur rasante. L'intensité de cette frange, autrefois figée dans le code du rendu, devient réglable indépendamment pour chaque corps.

### Une vérification côte à côte

Sans session de jeu connectée disponible pour comparer en conditions réelles, la différence a été vérifiée sur une page de test dédiée, ensuite supprimée, montrant la vraie scène 3D des planètes : la planète jungle à halo vert d'un côté, la lune grise et cratérée sans halo de l'autre.

### Un message de chargement qui ne ment plus

Une lune n'annonce plus la stabilisation d'une atmosphère désertique pendant son chargement. Le message affiché correspond désormais à ce que le corps est réellement : un satellite minéral, pas une planète miniature.

## Ce que ce changement prépare

### Un système prêt à se diversifier

Le jeu de textures actuel reste unique pour toutes les lunes, mais la sélection passe déjà par un simple index de dossier. Ajouter une variante suffira à diversifier leur apparence, sans toucher au reste du système.

### Une base lunaire préchargée comme les autres

Le préchargement des textures d'une base lunaire suit désormais la même logique que pour une planète, dédoublonné sur la carte d'albédo pour ne pas gaspiller les emplacements disponibles au profit d'une seule lune visitée deux fois.

## Conclusion

Une lune de Dynasty Nova ne se contente plus d'emprunter le visage de sa planète : elle a désormais le sien, sans ciel ni halo qui n'aurait jamais dû lui appartenir. Reste à voir quelles variantes viendront enrichir ce premier visage lunaire.
