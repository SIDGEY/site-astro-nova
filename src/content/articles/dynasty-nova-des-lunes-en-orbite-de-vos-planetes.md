---
title: "Lunes dans un jeu de stratégie spatiale : formation, bâtiments et défense dans Dynasty Nova"
date: 2026-09-09
description: "Dynasty Nova ajoute les lunes : un second corps céleste qui naît des débris d'un combat en orbite, avec ses propres bâtiments, sa propre garnison, et une mission dédiée pour le briser."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Lunes", "Flotte", "Combat", "Game Design"]
draft: false
image: "/uploads/blog/covers/dynasty-nova-des-lunes-en-orbite-de-vos-planetes.webp"
icon: "ph-moon"
faq:
  - question: "Comment se forme une lune dans Dynasty Nova ?"
    answer: "Une lune se forme uniquement à partir des débris laissés par un combat en orbite, selon une probabilité réglée par chaque univers : 20 % de chance maximale par défaut, atteinte à partir de 2 000 000 d'unités de débris. Ces réglages reproduisent fidèlement ceux d'OGame."
  - question: "Comment détruire la lune d'un adversaire ?"
    answer: "Une mission dédiée, réservée aux vaisseaux Colossus, s'attaque d'abord à la garnison qui défend la lune, puis à la lune elle-même selon deux probabilités distinctes reprises d'OGame. Envoyer plus de Colossus n'abaisse jamais le risque de perdre sa propre flotte."
  - question: "Une lune a-t-elle les mêmes bâtiments qu'une planète ?"
    answer: "Non : une lune ne peut construire qu'une base lunaire, une phalange de capteur et une porte de saut. La colonisation et le recyclage restent réservés aux planètes, tandis que la mission de destruction n'existe, à l'inverse, que contre une lune."
  - question: "Les bots peuvent-ils utiliser les lunes ?"
    answer: "Pas encore : l'intelligence artificielle du jeu planifie son économie sur les planètes uniquement et ne tire pas encore parti des lunes."
coverPrompt: "a soft field of turquoise and pale teal light"
---

## Introduction

Dynasty Nova est un jeu de stratégie spatiale gratuit, dans le navigateur et jouable sur mobile, inspiré d'OGame : vous y bâtissez un empire de planètes, de flottes et de recherches. Il ajoute maintenant les **lunes** à l'univers : un second corps céleste, en orbite de vos planètes, qui naît du combat plutôt que d'un choix de construction. Formation, bâtiments dédiés, destruction : voici ce qui change concrètement pour votre flotte, votre stratégie et vos rapports de combat.

## Comment une lune se forme

### Un sous-produit du combat, réglé par l'univers

Une lune se forme à partir des débris laissés par un combat en orbite, jamais autrement : aucune construction ne permet de l'obtenir directement. Chaque univers règle ses propres probabilités de formation : par défaut, la chance plafonne à 20 % et ce plafond demande 2 000 000 d'unités de débris pour être atteint, des valeurs qui reproduisent exactement le comportement d'OGame. Aucun univers en cours ne voit donc son fonctionnement changer avec cette mise à jour.

### Une taille calculée, pas tirée au sort

Le diamètre d'une lune suit la formule d'OGame au chiffre près : les onze tailles mesurées au plafond, de 8 366 à 8 944 kilomètres, sont reproduites fidèlement, avec un plancher fixé à 3 605 kilomètres. La taille dépend de la proximité entre les débris générés et le plafond de formation de l'univers : retoucher les probabilités de formation ne modifie donc jamais silencieusement les tailles obtenues.

## Une base à part entière, avec ses propres bâtiments

### Le même statut qu'une planète, un nom en commun

Une lune partage le nom et les coordonnées de la planète qu'elle orbite : seul son type la distingue. Elle stocke ses propres ressources, garde sa propre garnison et lève ses propres bâtiments, exactement comme une planète. Une flotte vise désormais un corps céleste précis, planète ou lune, et non plus une simple case de la carte : en cas de retour, elle atterrit sur le corps qu'elle a quitté.

### Base lunaire, phalange et porte de saut

Trois constructions n'existent que sur une lune. Chaque niveau de base lunaire ouvre trois emplacements et en occupe un, dans la limite fixée par le diamètre de la lune. La phalange de capteur balaie une planète de la même galaxie et dévoile les flottes en route : composition, mission et horaires ; chaque balayage coûte de l'hydrogène, pris sur la lune. La porte de saut transfère instantanément votre flotte entre deux de vos propres lunes, sous réserve d'un temps de recharge propre à chaque niveau.

## Attaquer ou défendre une lune

### Casser une lune se joue aux Colossus

Détruire la lune d'un adversaire passe par une mission dédiée, réservée aux vaisseaux Colossus : aucun autre type de vaisseau n'y participe. La garnison de la lune doit d'abord être vaincue au combat (le [simulateur de combat](/blog/dynasty-nova-simuler-un-combat-avant-denvoyer-sa-flotte/) permet de tester l'affrontement avant d'envoyer la flotte), avant que deux probabilités distinctes, toutes deux reprises d'OGame, ne décident du sort de la lune. Un exemple de référence, 100 Colossus contre une lune de 8 944 kilomètres, reproduit exactement les chiffres publiés : 54,27 % et 47,29 %.

### Le risque affiché sans détour

Envoyer plus de Colossus n'abaisse jamais le risque de perdre sa propre flotte : les deux probabilités sont montrées ensemble, sans laisser croire qu'un nombre suffit à sécuriser l'opération. La pire des quatre issues possibles reste flotte perdue, lune intacte. Côté rapports de combat, un bloc dédié à la formation de lune s'affiche systématiquement, même lorsque la tentative échoue : un échec à 19 % raconte encore une tentative, là où un combat à 0 % n'en raconte aucune.

## Conclusion

Les lunes ouvrent un second front stratégique à chaque planète : un corps à défendre, à exploiter, ou à briser. Les probabilités de formation et de destruction viennent directement d'OGame, sans réinvention, pour que l'expérience reste familière à qui la connaît déjà. Restent à venir les bots capables d'en tirer parti à leur tour : pour l'instant, l'intelligence artificielle planifie son économie sur les planètes uniquement.

Pour découvrir le jeu avant votre première lune, [notre présentation](/blog/jeu-de-strategie-spatiale-gratuit-navigateur-dynasty-nova/) en résume les principes et le [guide des premières heures](/blog/debuter-jeu-de-strategie-spatiale-guide-premieres-heures/) donne l'ordre à suivre. Une lune ne naît que d'un combat en orbite : envoyer la flotte commence sur [play.dynastynova.com](https://play.dynastynova.com/?utm_source=blog&utm_medium=article&utm_campaign=lunes).
