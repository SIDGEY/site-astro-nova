---
title: "Dynasty Nova : les missiles interplanétaires arrivent en jeu"
date: 2026-08-13
description: "Dynasty Nova sépare enfin les missiles des défenses classiques : un silo dédié, une frappe irréversible dont la portée et la durée de vol viennent uniquement du serveur, et des dégâts qui ne se réparent jamais tout seuls."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Combat", "Flotte", "Game Design"]
draft: false
icon: "ph-crosshair"
faq:
  - question: "Comment fonctionnent les missiles interplanétaires dans Dynasty Nova ?"
    answer: "Les missiles occupent un silo dédié, séparé des défenses classiques, avec 10 emplacements par niveau (1 par intercepteur, 2 par ogive). Les tirer lance une frappe irréversible dont la portée et la durée de vol sont calculées uniquement par le serveur."
  - question: "Peut-on intercepter un missile ennemi dans Dynasty Nova ?"
    answer: "Oui : un intercepteur détruit exactement une ogive adverse, sans jet de dé ni probabilité. Chaque intercepteur ne peut arrêter qu'un seul missile avant d'être lui-même consommé."
  - question: "Les défenses détruites par une frappe de missiles se réparent-elles automatiquement ?"
    answer: "Non, délibérément : contrairement aux dégâts d'un combat classique, une défense détruite par des missiles reste détruite. C'est ce qui justifie le coût d'investir dans des missiles plutôt que d'envoyer une flotte."
  - question: "Une frappe de missiles peut-elle être rappelée une fois lancée ?"
    answer: "Non. Une salve de missiles ne dispose d'aucun trajet de retour ni bouton de rappel : les ogives ne reviennent jamais, même si la planète visée est abandonnée avant l'impact."
coverPrompt: "a soft field of violet and magenta light"
---

## Introduction

Dynasty Nova sépare enfin les missiles interplanétaires des défenses classiques : ils quittent l'ordre de bataille pour devenir une arme à part entière, avec son propre silo, sa propre frappe, et ses propres règles d'interception.

## Les missiles quittent l'ordre de bataille

### Le bug qu'il fallait corriger

Les intercepteurs et les ogives à longue portée étaient jusqu'ici semés comme des défenses ordinaires, avec un bouclier et une attaque provisoires. Résultat : chaque ogive stockée rejoignait l'ordre de bataille du défenseur et livrait gratuitement ses 12 000 points d'attaque, à chaque round de chaque combat de défense. Un missile stocké n'est pourtant pas censé combattre tout seul.

### Un silo, pas un simple champ de bataille

Les missiles portent désormais un statut distinct de celui des défenses : ils ne rejoignent plus jamais un ordre de bataille, ne subissent aucune perte, et ne laissent aucun débris. Leur capacité dépend d'un silo dédié, 10 emplacements par niveau, un emplacement par intercepteur et deux par ogive, occupés aussi bien par les missiles déjà stockés que par ceux encore en commande. Les missiles stockés comptent tout de même dans les points du joueur, comme dans OGame : les tirer retire ces points aussitôt.

## Lancer une frappe, un aller simple

### Portée et durée de vol décidées par le serveur seul

Une frappe se lance comme une mission à part entière, avec une portée limitée à cinq fois le niveau de propulsion à impulsion moins un système, jamais à l'échelle d'une galaxie entière. La portée, la distance et la durée de vol viennent uniquement du serveur : aucune règle de déplacement n'est rejouée côté interface, pour ne jamais annoncer un temps de vol faux sur une décision qu'il est impossible d'annuler.

### Une confirmation en deux temps, jamais de rappel

Lancer une frappe demande une confirmation en deux temps, parce qu'une fois les ogives parties, elles ne reviennent jamais, même si la planète visée est abandonnée entre-temps. La salve suit la même carte de trajet que les mouvements de flotte, mais sans bouton de rappel ni trajet inversé : un missile ne se rappelle pas.

## Ce qui se passe à l'impact

### Un intercepteur détruit une ogive, sans jet de dé

Face à une frappe entrante, un intercepteur détruit exactement une ogive adverse et se consomme dans l'opération : aucun jet de dé, aucune probabilité, juste un échange direct. Les survivantes forment un capital de dégâts, proportionnel à la puissance des ogives et à la technologie d'armement de l'attaquant, dépensé sur la grille de défense, en commençant par la plus solide ou par la cible désignée par l'attaquant.

### Des dégâts qui ne se réparent pas tout seuls

Une défense détruite par une frappe de missiles ne se répare jamais automatiquement, contrairement aux dégâts d'un combat classique. C'est un choix assumé : c'est précisément ce qui rend l'investissement dans des missiles plus intéressant que l'envoi d'une flotte entière pour le même résultat. Les missiles ne visent d'ailleurs jamais un bâtiment, un vaisseau en orbite, ou le stock de ressources : uniquement les défenses.

## Conclusion

Les missiles interplanétaires deviennent une arme de harcèlement à part entière : rapide à lancer, impossible à rappeler, et capable d'infliger des dégâts qu'aucune réparation automatique ne viendra effacer. De quoi repenser la défense d'une planète au-delà du seul calcul de flotte.
