---
title: "Durée de vol des flottes : Dynasty Nova adopte la formule d'OGame"
date: 2026-10-15
description: "Comment se calcule le temps de vol d'une flotte dans un jeu de type OGame, et pourquoi Dynasty Nova a corrigé une erreur qui rendait chaque trajet environ 10 fois trop court."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Mise à Jour", "Flotte", "OGame", "Stratégie"]
draft: true
image: "/uploads/blog/covers/dynasty-nova-duree-de-vol-des-flottes-la-formule-dogame.webp"
icon: "ph-hourglass"
coverPrompt: "a soft field of deep violet and indigo light, a long gentle diagonal streak of brightness crossing the frame"
faq:
  - question: "Quelle est la formule du temps de vol d'une flotte dans OGame ?"
    answer: "Le temps de vol en secondes vaut (3500 / s) × √(10 × d / v) + 10, où s est le pourcentage de vitesse choisi (1 pour 100 %), d la distance entre les deux positions et v la vitesse du vaisseau le plus lent de la flotte. Dynasty Nova applique désormais exactement cette formule."
  - question: "Pourquoi les trajets de flotte sont-ils plus longs dans Dynasty Nova ?"
    answer: "Une erreur d'échelle sur le pourcentage de vitesse rendait chaque trajet environ 10 fois plus court que dans OGame. Depuis la correction, un saut de galaxie en petit transporteur dans un univers à vitesse x1 prend 6 h 09 au lieu de 37 minutes."
  - question: "Les flottes déjà en vol ont-elles été ralenties ?"
    answer: "Non. Seuls les nouveaux trajets suivent la formule corrigée ; les flottes déjà en vol au moment du changement ont gardé leur heure d'arrivée."
  - question: "La consommation d'hydrogène a-t-elle changé avec la nouvelle durée de vol ?"
    answer: "Non. La consommation d'hydrogène et le temps de vol des missiles interplanétaires sont inchangés : seule la durée des trajets de flotte a été corrigée."
---

## Comment se calcule le temps de vol d'une flotte ?

Dans un jeu de stratégie spatiale de type OGame, **le temps de vol d'une flotte dépend de trois choses : la distance, la vitesse du vaisseau le plus lent et le pourcentage de vitesse choisi au départ**. Dynasty Nova applique désormais la formule d'OGame à l'identique :

- **Temps de vol (secondes) = (3500 / s) × √(10 × d / v) + 10**
- **s** : le pourcentage de vitesse, exprimé entre 0 et 1 (1 signifie 100 %, 0,5 signifie 50 %)
- **d** : la distance entre la planète de départ et la cible
- **v** : la vitesse du vaisseau le plus lent de la flotte

### Pourquoi c'est la flotte la plus lente qui compte

Une flotte voyage groupée : elle avance au rythme de son vaisseau le plus lent. Envoyer un petit transporteur avec des vaisseaux lourds, c'est accepter le rythme des vaisseaux lourds. C'est l'un des premiers arbitrages qu'un commandant apprend à faire.

### Le pourcentage de vitesse, un vrai levier

Réduire la vitesse allonge le trajet mais économise de l'hydrogène, et permet surtout de régler une heure d'arrivée précise. Nous avions déjà rendu ce réglage possible [au pourcent près](/blog/dynasty-nova-regler-la-vitesse-de-sa-flotte-au-pourcent-pres/) ; la formule corrigée lui redonne tout son poids.

## L'erreur que nous avons corrigée

Jusqu'au début du mois d'octobre, Dynasty Nova divisait par un pourcentage compté de 1 à 100, là où la formule d'OGame le compte en dixièmes. Résultat : **chaque trajet durait environ 10 fois moins longtemps** que dans OGame.

### Un exemple concret

Un saut de galaxie en petit transporteur, dans un univers à vitesse x1, prenait 37 minutes. Avec la formule corrigée, il prend **6 h 09**, la durée qu'un vétéran d'OGame attend. Sur les trajets très courts de vaisseaux rapides, l'écart est un peu moindre, à cause des 10 secondes fixes de la formule.

### Une formule vérifiée deux fois

Pour éviter de remplacer une erreur par une autre, la formule a été comparée à deux implémentations indépendantes et publiques du genre, puis verrouillée par des tests sur des durées absolues : petit transporteur, sonde d'espionnage, vitesse à 10 % et univers accéléré.

## Ce qui change pour votre stratégie

Des trajets plus longs, ce sont des décisions qui pèsent plus lourd. C'est exactement ce qui fait l'intérêt du genre.

### Espionner juste avant d'agir

Un rapport d'espionnage est une photo à l'instant T. Avec des vols de plusieurs heures, la cible a le temps de rentrer sa flotte ou de dépenser ses ressources. Le réflexe des joueurs expérimentés : envoyer une sonde juste avant le départ de l'attaque, pas des heures avant.

### Ce qui n'a pas bougé

Les flottes déjà en vol au moment de la correction ont gardé leur heure d'arrivée. La consommation d'hydrogène et la durée de vol des missiles interplanétaires sont inchangées. Les joueurs contrôlés par l'IA utilisent la même formule que vous.

## Pour les vétérans d'OGame

Si vous avez joué à OGame, vos repères de timing sont de nouveau valables dans Dynasty Nova : mêmes ordres de grandeur, mêmes calculs, sur une interface pensée pour le navigateur et le mobile.

### Retrouver ses réflexes

Planifier un raid pour une arrivée nocturne, synchroniser deux flottes sur une même cible : tout cela redevient une affaire de calcul. Envoyer la flotte, c'est sur [play.dynastynova.com](https://play.dynastynova.com/?utm_source=blog&utm_medium=article&utm_campaign=formule-vol-ogame).
