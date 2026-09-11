---
title: "Dynasty Nova annonce ses maintenances serveur en jeu"
date: 2026-09-10
description: "Dynasty Nova affiche désormais un bandeau qui annonce puis décompte chaque maintenance serveur, et suspend le temps de la trêve les départs de flotte hostiles, sans toucher au reste du jeu."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Mise à Jour", "Interface", "Annonce"]
draft: false
image: "/uploads/blog/covers/dynasty-nova-annonce-ses-maintenances-serveur-en-jeu.webp"
icon: "ph-clock-countdown"
faq:
  - question: "Que se passe-t-il pendant une maintenance serveur dans Dynasty Nova ?"
    answer: "Quatre départs sont refusés le temps de la maintenance : espionnage, attaque, destruction de lune, frappe de missiles, et déclaration de guerre d'alliance au vote. Construction, recherche, transport, déploiement, recyclage et colonisation continuent normalement."
  - question: "Comment savoir quand une maintenance serveur commence ou se termine ?"
    answer: "Un bandeau ambre s'affiche en tête d'écran et décompte l'échéance à la seconde, calé sur l'horloge du serveur plutôt que sur celle de l'appareil du joueur. Il change seul de discours entre une fenêtre annoncée et une fenêtre en cours."
  - question: "Une flotte déjà en vol pendant une maintenance est-elle annulée ?"
    answer: "Non : seul le départ d'une nouvelle mission est refusé. Une flotte déjà en vol atterrit normalement, et une frappe déjà lancée touche sa cible comme prévu."
  - question: "Les bots sont-ils concernés par la maintenance serveur ?"
    answer: "Oui : les bots passent par les mêmes commandes que les joueurs et observent donc la trêve automatiquement, sans traitement particulier de leur intelligence artificielle."
coverPrompt: "a soft field of electric blue light"
---

## Introduction

Dynasty Nova affiche désormais ses maintenances serveur directement en jeu : un bandeau annonce l'échéance, la décompte à la seconde, et une trêve suspend le temps de la fenêtre les départs de flotte qui viseraient un autre joueur. Voici ce que ça change, et ce qui continue sans interruption.

## Un bandeau qui change de discours tout seul

### Deux états, une seule source de vérité

Le bandeau tient deux discours distincts. Une fenêtre annoncée prévient sans rien bloquer et décompte vers son début ; une fenêtre en cours annonce la suspension et décompte vers sa fin. Le serveur ne signale jamais le passage de l'une à l'autre : le client recalcule en permanence lequel des deux discours tenir, à la seconde près, sans aller-retour supplémentaire.

### Un décompte calé sur l'horloge du serveur

Le décompte se mesure contre l'horloge du serveur, corrigée de l'écart avec celle de l'appareil du joueur. Sans cette correction, un navigateur en avance de quelques minutes lèverait le bandeau avant que le serveur n'ait lui-même levé la maintenance, et proposerait des boutons que l'API refuserait encore.

## Une trêve qui bloque quatre départs, rien de plus

### Espionnage, attaque, missiles et déclaration de guerre suspendus

Pendant la maintenance, quatre départs sont refusés : l'espionnage, l'attaque et la destruction de lune, la frappe de missiles, et la déclaration de guerre d'une alliance au moment du vote. Construction, recherche, transport, déploiement, recyclage et colonisation continuent normalement : la trêve empêche d'atteindre un autre joueur, elle ne fige pas la partie.

### Ce qui est déjà parti ne revient jamais en arrière

Seul le départ d'une nouvelle mission est concerné par le refus. Une flotte déjà en vol atterrit à l'heure prévue, une frappe déjà lancée touche sa cible, et une question de guerre déjà adoptée par une alliance continue de déclarer cette guerre. Les bots, qui passent par les mêmes commandes que les joueurs, observent cette trêve sans qu'aucun traitement spécifique n'ait été nécessaire pour leur intelligence artificielle.

## Un bandeau pensé pour rester lisible partout

### Dans le flux de la page, jamais par-dessus

Le bandeau pousse le contenu du jeu vers le bas plutôt que de se poser dessus : une maintenance peut durer plusieurs heures, et un bandeau flottant aurait masqué la barre de ressources tout ce temps. La couleur retenue est l'ambre, réservée aux états qui se lèvent d'eux-mêmes, plutôt que le rouge des situations irréversibles.

### Un même bandeau sur mobile, desktop et l'écran de sélection d'univers

Le bandeau coiffe aussi bien la version mobile que le shell desktop, et jusqu'à l'écran de sélection d'univers, l'endroit même où un joueur choisit un serveur avant de s'y connecter. Sur téléphone, le détail se replie pour ne garder que le titre et le décompte sur deux lignes, quand la place manque pour tout afficher.

## Conclusion

La maintenance serveur devient une information plutôt qu'une coupure silencieuse : un bandeau qui prévient, décompte, puis se referme de lui-même, pendant qu'une trêve ciblée protège chaque joueur sans mettre le reste du jeu en pause.
