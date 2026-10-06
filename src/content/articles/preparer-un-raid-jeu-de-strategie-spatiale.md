---
title: "Préparer un raid dans un jeu de stratégie spatiale : espionner, simuler, calculer le trajet"
date: 2027-01-06
description: "Un raid rentable se décide avant le départ de la flotte : espionnage, simulation du combat, durée de vol et protections de la cible. La méthode, appliquée à Dynasty Nova."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Stratégie", "Combat", "OGame", "Flotte"]
draft: true
image: "/uploads/blog/covers/preparer-un-raid-jeu-de-strategie-spatiale.webp"
icon: "ph-crosshair"
coverPrompt: "a soft field of violet and magenta light, a sharp diagonal streak crossing the frame"
faq:
  - question: "Comment préparer un raid dans un jeu comme OGame ?"
    answer: "En trois temps : espionner la cible juste avant d'agir, simuler le combat à partir du rapport, puis calculer le trajet et l'heure d'arrivée. Dans Dynasty Nova, le simulateur rejoue le combat 50 fois avec le vrai moteur du jeu."
  - question: "Pourquoi espionner juste avant d'attaquer ?"
    answer: "Un rapport d'espionnage est une photo à l'instant T. Avec des trajets de plusieurs heures, la cible a le temps de rentrer sa flotte ou de dépenser ses ressources : un rapport récent évite d'attaquer sur des informations périmées."
  - question: "Peut-on attaquer un nouveau joueur dans Dynasty Nova ?"
    answer: "Non pendant ses 7 premiers jours dans l'univers : il est protégé par le bouclier nouvel arrivant, sauf s'il attaque lui-même. La protection débutant bloque aussi les attaques quand l'écart de points est trop grand."
  - question: "Que faire des débris après un combat ?"
    answer: "Envoyer une mission de recyclage : elle récupère les ressources du champ de débris laissé en orbite par les vaisseaux détruits."
---

## Qu'est-ce qui rend un raid rentable ?

Dans un jeu de stratégie spatiale comme OGame ou Dynasty Nova, **un raid rentable se décide avant le départ de la flotte**. Le butin doit couvrir le carburant, les pertes éventuelles et le temps d'immobilisation des vaisseaux. Trois questions suffisent à trancher : que possède la cible, puis-je gagner le combat, et à quelle heure j'arrive.

### La règle des trois vérifications

Espionner, simuler, calculer. Sauter une étape, c'est parier : une défense non vue, une flotte rentrée entre-temps ou un trajet plus long que prévu suffisent à transformer un raid en perte sèche.

## Espionner la cible

L'espionnage est la mission la plus sûre du jeu, et la base de toute attaque.

### Ce que dévoile un rapport

Une sonde d'espionnage rapporte ce que possède la planète visée. Le niveau du rapport fixe ce qu'il montre : dans Dynasty Nova, la flotte apparaît à partir du palier 3, les défenses à partir du palier 5 et les recherches à partir du palier 9.

### Espionner juste avant d'agir

Un rapport est une photo à l'instant T. Les trajets de flotte durent souvent plusieurs heures : la cible a le temps de rentrer sa flotte ou de dépenser son stock. Le réflexe des joueurs expérimentés est d'envoyer une sonde juste avant le départ de l'attaque.

## Simuler le combat

Un combat repose sur des tirages aléatoires : une seule bataille imaginée ne dit pas grand-chose.

### Le simulateur de combat

Dans Dynasty Nova, le [simulateur de combat](/blog/dynasty-nova-simuler-un-combat-avant-denvoyer-sa-flotte/) part d'un rapport d'espionnage, rejoue l'affrontement **50 fois** avec le vrai moteur du jeu et donne un taux de victoire, les pertes moyennes et les survivants moyens.

### Ce qui n'a pas été vu

Une catégorie absente du rapport s'affiche comme incertaine, jamais comme un zéro. Si les défenses n'ont pas été vues, un meilleur rapport vaut mieux qu'un pari.

## Calculer le trajet

La durée de vol décide de l'heure d'arrivée, et donc de ce que vous trouverez sur place.

### La formule

Dynasty Nova applique la [formule d'OGame](/blog/dynasty-nova-duree-de-vol-des-flottes-la-formule-dogame/) : **(3500 / s) × √(10 × d / v) + 10** secondes, où s est le pourcentage de vitesse, d la distance et v la vitesse du vaisseau le plus lent.

### Régler l'heure d'arrivée

Baisser la vitesse allonge le trajet mais économise l'hydrogène et permet de viser une arrivée précise. La soute compte aussi : le butin rapporté est limité par la capacité de transport de la flotte.

## Vérifier que la cible est attaquable

Certaines cibles sont protégées, et le jeu le signale avant l'envoi.

### Les protections

- **Bouclier nouvel arrivant** : 7 jours de protection à partir de l'arrivée dans l'univers.
- **Protection débutant** : attaque impossible quand l'écart de points est trop grand, dans un sens comme dans l'autre.
- **Anti-bashing** : un quota d'attaques sur un même joueur, toutes ses colonies confondues.
- **Mode vacances** : un empire en pause est inattaquable.

### Après le combat

Un combat laisse un champ de débris en orbite : une mission de recyclage en récupère les ressources. Envoyer la flotte, c'est sur [play.dynastynova.com](https://play.dynastynova.com/?utm_source=blog&utm_medium=article&utm_campaign=intention-raid).
