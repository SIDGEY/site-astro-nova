---
title: "Jouer entre amis à un jeu de stratégie spatiale : les univers privés de Dynasty Nova"
date: 2026-09-24
description: "Dynasty Nova ouvre les univers privés : une pastille les distingue dans la liste, un code d'invitation copiable y donne accès, et les rapports de transport reçus affichent enfin le bon camp."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Univers", "Communauté", "Fonctionnalité"]
draft: false
faq:
  - question: "Comment rejoindre un univers privé dans Dynasty Nova ?"
    answer: "En saisissant son code d'invitation dans le champ dédié, accessible depuis n'importe quel écran. Le code navigue directement vers l'univers correspondant, sans qu'il ait besoin d'apparaître dans une liste publique."
  - question: "Où trouver le code d'invitation d'un univers privé ?"
    answer: "Sur la fiche de l'univers, une fois qu'on en est déjà membre : le code y est affiché et copiable en un clic. C'est la seule adresse qui mène à un univers privé, puisqu'il ne figure dans aucune liste."
  - question: "Que se passe-t-il si le code d'invitation est invalide ?"
    answer: "Dynasty Nova affiche un écran dédié : « Invitation introuvable » si le code n'existe pas, ou « Ce code n'ouvre pas cet univers » si l'accès est refusé, sans jamais révéler la raison exacte du refus."
  - question: "Comment reconnaître un univers privé dans la liste des univers ?"
    answer: "Une pastille « Privé » s'affiche sur sa carte, dans le sélecteur comme dans l'écran de changement d'univers, pour le distinguer d'un univers public rejoignable librement."
coverPrompt: "a soft field of turquoise and teal light"
image: "/uploads/blog/covers/dynasty-nova-rejoindre-un-univers-prive-par-code-dinvitation.webp"
---

## Introduction

Dynasty Nova ouvre les univers privés à la lecture comme à l'accès : une pastille les distingue désormais dans toutes les listes, et un code d'invitation copiable permet d'y faire entrer qui l'on veut, sans qu'aucun joueur extérieur ne puisse les découvrir par hasard.

## Un univers privé, visible seulement de qui le connaît déjà

### La pastille qui manquait

Avant cette mise à jour, rien ne distinguait un univers privé d'un univers public dans les listes de jeu : ni sur la carte, ni dans la fiche détaillée. Une pastille « Privé » s'affiche désormais partout où un univers apparaît, sur sa carte comme dans l'écran de changement d'univers.

### Le code comme seule porte d'entrée

Un univers privé ne figure dans aucune liste consultable par un joueur qui n'en est pas encore membre. Le code d'invitation, affiché et copiable depuis la fiche une fois qu'on a rejoint, devient donc la seule adresse capable d'y mener quelqu'un d'autre : sans lui, l'univers reste invisible.

## Rejoindre par code, depuis n'importe quel écran

### Un champ qui interroge vraiment le serveur

Le champ « code d'invitation » navigue directement vers l'univers correspondant plutôt que de chercher dans une liste déjà chargée localement, ce qui n'aurait de toute façon jamais pu fonctionner : un univers privé n'y figure par définition pas. Le code saisi est nettoyé et mis en majuscules avant l'appel, pour absorber une frappe imprécise.

### Trois refus, trois messages distincts

Un code inexistant affiche l'écran « Invitation introuvable ». Un code qui ne correspond pas à l'univers visé répond « Ce code n'ouvre pas cet univers », sans jamais préciser pourquoi, pour ne rien révéler d'un univers qu'on n'a pas le droit de voir. Un troisième cas, moins fréquent, se traduit par un message dédié quand la demande elle-même est mal formée.

## Un rapport de transport qui change enfin de côté

### Le même envoi, deux lectures différentes

Un rapport de transport reçu affichait jusqu'ici les mêmes libellés qu'un rapport envoyé, ressources comptées en positif dans les deux cas. Désormais, le libellé, l'issue et le signe des ressources basculent selon qui consulte le rapport : « Ressources livrées » côté expéditeur, « Ressources reçues » côté destinataire, un signe négatif quand la cargaison quitte ses mains, positif quand elle y arrive.

### Une origine qui n'était plus la sienne

Reçue, la base de départ d'un transport n'appartient pas à celui qui consulte le rapport, mais à l'expéditeur. Elle s'affichait pourtant comme si elle était la sienne, jusqu'à révéler le nom d'une base jamais scoutée. Elle passe désormais par la carte dédiée à l'adversaire, comme n'importe quelle base identifiée par l'espionnage.

## Conclusion

Entre la pastille qui distingue un univers privé d'un coup d'œil et le code qui en ouvre la porte, Dynasty Nova donne enfin aux communautés fermées les mêmes outils de lecture que les univers publics. Reste à choisir avec qui partager le sien.
