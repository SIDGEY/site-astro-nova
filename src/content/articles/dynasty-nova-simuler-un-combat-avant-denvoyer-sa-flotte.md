---
title: "Dynasty Nova : simuler un combat avant d'envoyer sa flotte"
date: 2026-08-27
description: "Le nouveau simulateur de combat de Dynasty Nova permet de tester une attaque avant de l'envoyer, avec un rapport d'espionnage pré-rempli, un taux de victoire calculé sur 50 tirages et le même moteur que les vrais affrontements."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Simulateur De Combat", "Stratégie", "Flotte", "Game Design"]
draft: false
faq:
  - question: "Comment fonctionne le simulateur de combat de Dynasty Nova ?"
    answer: "Il compose une flotte attaquante, associe un défenseur (via un rapport d'espionnage ou une saisie manuelle), puis relance l'affrontement 50 fois pour afficher un taux de victoire, les pertes moyennes et un déroulé round par round."
  - question: "Le simulateur utilise-t-il les mêmes règles que les vrais combats ?"
    answer: "Oui. Il s'appuie sur le moteur de résolution de combat réel du jeu, jamais une version simplifiée, pour que le taux de victoire affiché reste exploitable pour calibrer un raid."
  - question: "Que se passe-t-il si mon rapport d'espionnage n'a pas tout révélé ?"
    answer: "Les catégories non observées (flotte, défenses ou recherches) s'affichent en ambre plutôt qu'à zéro, et une recherche adverse non vue est simulée aux niveaux de l'attaquant pour éviter un pronostic trop optimiste."
  - question: "Le simulateur prend-il en compte les missiles interplanétaires ?"
    answer: "Non. Les missiles interplanétaires ne tirent dans aucun round de combat classique, ils sont donc exclus du catalogue de défenses simulables."
coverPrompt: "a soft field of violet and indigo light"
---

## Introduction

Dynasty Nova lance un simulateur de combat accessible depuis le menu latéral et depuis chaque rapport d'espionnage. Avant d'envoyer sa flotte contre une cible, un joueur peut désormais tester l'issue de l'affrontement plusieurs fois de suite, avec le même moteur que celui utilisé pour les vrais combats.

## Composer une attaque sans regretter un envoi

### Deux façons de définir sa cible

Le simulateur accepte deux sources pour le défenseur : un rapport d'espionnage existant, ou une saisie manuelle. Un rapport pré-remplit automatiquement la flotte, les défenses et les recherches adverses connues, tout en laissant chaque champ modifiable pour tester des variantes, par exemple une défense laser doublée par rapport à ce qui a été observé.

### Un mode d'envoi affiché, jamais devinable

Tant que le pré-remplissage n'est pas modifié, la simulation envoie l'identifiant du rapport d'espionnage au serveur, ce qui conserve les hypothèses de recherche calculées côté serveur. Dès la première correction manuelle, elle bascule sur une flotte défenderesse explicite, signalée par un bandeau réversible. Le panneau de résultat affiche toujours le mode réellement envoyé.

## Ce que révèle chaque simulation

### Un taux de victoire sur 50 tirages, pas un coup de dé

Un combat repose sur des tirages aléatoires : une seule bataille ne dit pas grand-chose. Le simulateur relance l'affrontement 50 fois et retourne un taux de victoire, les pertes moyennes, les survivants moyens, ainsi que le déroulé round par round d'un tirage concret conservé en entier.

### Ce qui n'a pas été vu reste incertain, jamais à zéro

Un rapport d'espionnage ne révèle que ce que son niveau a atteint : la flotte à partir du palier 3, les défenses à partir du palier 5, les recherches à partir du palier 9. Une catégorie non observée s'affiche en ambre, jamais comme un zéro, et la recherche adverse non vue est simulée aux niveaux de l'attaquant plutôt qu'à zéro, pour éviter un pronostic trop optimiste.

## Sous le capot, un moteur qui ne triche pas

### Le même moteur que le vrai combat

Le simulateur s'appuie sur le moteur de résolution de combat réel de Dynasty Nova, celui qui tranche les affrontements en jeu, jamais une version allégée. C'est ce qui rend chaque taux de victoire directement exploitable pour calibrer un raid.

### Les missiles interplanétaires, exclus du calcul

Les missiles interplanétaires ne tirent dans aucun round de combat classique : ils sont donc écartés du catalogue de défenses simulables, y compris quand un vieux rapport d'espionnage les mélange avec les défenses habituelles.

## Conclusion

Le simulateur de combat transforme une question qui restait sans réponse avant l'envoi d'une flotte, à savoir "ai-je une chance ?", en un chiffre concret bâti sur 50 tirages réels. De quoi engager une attaque en stratège, pas en joueur de dés.
