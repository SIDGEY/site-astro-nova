---
title: "Dynasty Nova : régler la vitesse de sa flotte au pourcent près"
date: 2026-09-04
description: "Le curseur de vitesse d'une mission passe des paliers de 10% à un réglage au pourcent près, de 1% à 100%. Glissement, saisie directe ou clavier : trois façons de caler précisément l'heure d'arrivée d'une flotte."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Flotte", "Interface", "Stratégie", "Game Design"]
draft: false
icon: "ph-gauge"
faq:
  - question: "Quelle est la plage de vitesse disponible pour une mission dans Dynasty Nova ?"
    answer: "De 1% à 100%, réglable au pourcent près, contre des paliers de 10% auparavant."
  - question: "Comment régler précisément la vitesse d'une flotte ?"
    answer: "Par glissement du curseur pour un réglage grossier, par saisie directe d'un pourcentage dans le champ dédié, ou au clavier avec les touches +/- et les flèches pour un ajustement cran par cran."
  - question: "Régler la vitesse au pourcent déclenche-t-il une nouvelle simulation à chaque changement ?"
    answer: "Non. Tous les paliers de vitesse sont renvoyés en un seul appel au serveur, et le curseur se contente de sélectionner la bonne valeur côté client, sans requête supplémentaire."
  - question: "Que se passe-t-il si je vide le champ de vitesse par erreur ?"
    answer: "La vitesse en cours est restaurée automatiquement plutôt que de retomber au minimum, pour éviter de modifier sans le vouloir le carburant embarqué et l'heure d'arrivée de la mission."
coverPrompt: "a soft field of electric blue light"
image: "/uploads/blog/covers/dynasty-nova-regler-la-vitesse-de-sa-flotte-au-pourcent-pres.webp"
---

## Introduction

Dynasty Nova permet désormais de régler la vitesse d'une mission au pourcent près, de 1% à 100%, plutôt que par paliers de 10%.

## Un curseur qui gagnait à être plus fin

### Le problème du cran de 10

Avant cette mise à jour, une flotte ne pouvait partir qu'à l'une de dix vitesses, par tranches de 10%. Le bas de l'échelle est justement celui où la durée d'un trajet varie le plus, puisqu'elle est inversement proportionnelle à la vitesse choisie.

### Cent paliers, un seul appel réseau

Le simulateur de trajet renvoie déjà tous les paliers de vitesse en une seule requête ; le curseur se contente de sélectionner la bonne valeur côté client. Passer de 10 à 100 paliers ne coûte donc aucun aller-retour réseau supplémentaire, ni aucun délai ajouté au glissement du curseur.

## Trois façons de choisir sa vitesse

### Glisser pour un réglage grossier

Le curseur garde son échelle visuelle familière, graduée de 0 à 120%, avec un repère à 100%. Glisser reste la façon la plus rapide de viser une plage large.

### Saisir directement la valeur voulue

Le pourcentage affiché devient un champ éditable : taper directement 37% ou 3% permet d'atteindre une valeur précise sans chercher à la viser au pixel près sur le curseur, un pourcent ne représentant qu'environ 3 pixels sur la barre.

### Ajuster au clavier, cran par cran

Les touches + et -, ainsi que les flèches du clavier, permettent un ajustement fin : un cran par pression, dix crans avec Page Haut/Bas, ou un saut direct aux extrêmes avec Origine/Fin.

## Pourquoi ce degré de précision compte

### Faire converger plusieurs flottes à la même seconde

Coordonner une attaque groupée demande que plusieurs flottes, parties de planètes différentes, arrivent au même instant sur une cible commune. Un cran de 10% ne permettait d'ajuster une heure d'arrivée qu'à grands pas ; le réglage au pourcent offre la marge nécessaire pour caler ce genre de convergence sans marge d'erreur.

### Choisir entre vitesse et consommation en connaissance de cause

La simulation affichée avant l'envoi permet de comparer, palier par palier, le temps de trajet et le carburant consommé. Avec cent valeurs disponibles au lieu de dix, le compromis entre arriver vite et arriver en dépensant peu se règle beaucoup plus finement qu'avant.

## Ce qui a changé en coulisses

### Des couleurs qui suivent des plages, pas des égalités strictes

Les couleurs d'alerte du curseur, orange à l'approche de la survitesse, rouge au-delà, étaient testées par égalité stricte avec les paliers de 10%. Avec un réglage au pourcent, cette logique aurait laissé les valeurs comprises entre 91% et 99% dans la mauvaise couleur : le calcul repose désormais sur des plages plutôt que sur des égalités.

### Un champ vidé restaure la vitesse en cours, jamais un minimum

Vider puis quitter le champ de vitesse restaure la valeur précédente plutôt que de retomber sur 1%, pour éviter de modifier silencieusement le carburant embarqué et l'heure d'arrivée d'une mission sans que le joueur l'ait demandé.

## Conclusion

Ce réglage au pourcent près donne aux joueurs le dernier degré de précision qui manquait pour caler une arrivée à l'heure voulue, sans rien changer aux formules de durée ou de consommation déjà en place.
