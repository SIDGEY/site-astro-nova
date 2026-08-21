---
title: "Dynasty Nova : le bouton Accélérer fonctionne enfin pour de vrai"
date: 2026-08-21
description: "Le bouton qui promettait de finir une construction contre des points stellaires ne faisait rien jusqu'à récemment. Voici comment l'accélération de file fonctionne désormais, et ce qu'elle coûte réellement."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Mise à Jour", "Gameplay", "Stratégie"]
draft: false
image: "/uploads/blog/covers/dynasty-nova-le-bouton-accelerer-fonctionne-enfin.webp"
icon: "ph-lightning"
faq:
  - question: "Comment accélérer une construction, une recherche ou un vaisseau en cours ?"
    answer: "En dépensant des points stellaires sur la file en cours via le bouton Accélérer, qui n'apparaît que si l'ordre peut réellement être accéléré."
  - question: "Comment le coût de l'accélération est-il calculé ?"
    answer: "Les 30 premières secondes restantes sont offertes. Au-delà, chaque tranche de 30 secondes coûte un demi-point stellaire, arrondi vers le haut."
  - question: "Peut-on accélérer une commande qui n'a pas encore démarré dans la file ?"
    answer: "Non. Seule la commande actuellement en production peut être accélérée, celles qui attendent encore leur tour n'ont pas de coût défini et démarrent normalement une fois leur tour venu."
  - question: "Peut-on accélérer la réparation d'un vaisseau après une bataille ?"
    answer: "Non, les réparations lancées par le chantier orbital après une défaite ne font pas partie des files accélérables."
coverPrompt: "a soft field of electric blue light"
---

## Introduction

Un bouton "Accélérer" existait déjà dans l'interface de Dynasty Nova, mais jusqu'à récemment, cliquer dessus ne changeait rien. Voici ce qui a changé, et surtout, ce que ça coûte vraiment.

## Le bouton qui ne faisait rien

### Un coût affiché, jamais réellement débité

Le prix affiché sur le bouton était calculé côté client, sans jamais être transmis au serveur. La minuterie de construction ignorait tout simplement ce coût, et la fonction censée traiter l'accélération côté serveur était vide.

### Un symptôme discret mais frustrant

Résultat concret : cliquer sur "Accélérer" ne débitait rien et ne terminait rien. La construction continuait son cours normal, comme si le bouton n'avait jamais existé.

## Comment l'accélération fonctionne désormais

### Le serveur, seul juge du prix

Le coût est maintenant calculé et vérifié uniquement par le serveur, à partir du temps réellement restant sur la commande. Les 30 premières secondes dues sont offertes ; au-delà, chaque tranche supplémentaire de 30 secondes coûte un demi-point stellaire, arrondi vers le haut. Un client ne peut donc plus proposer un prix inventé ou périmé.

### Une seule route pour quatre files

Bâtiments, recherches, vaisseaux et défenses partagent désormais le même mécanisme d'accélération. Le bouton n'apparaît que si l'ordre en cours peut réellement être accéléré ; sinon, il reste simplement invisible plutôt que d'afficher une action qui ne mènerait à rien.

## Ce qui reste impossible à accélérer

Une commande qui attend encore son tour dans la file n'a pas de minuterie active, et donc aucun coût défini : elle ne peut pas être rushée à l'avance. Les réparations lancées automatiquement par le chantier orbital après une défaite au combat suivent la même règle et restent hors de portée de l'accélération.

## Pourquoi ça compte pour votre stratégie

Ce correctif transforme un bouton cosmétique en un vrai levier stratégique. Dépenser des points stellaires pour finir une construction en avance devient un choix réel, avec un coût transparent et cohérent, plutôt qu'une promesse qui ne se concrétisait jamais.

**Lancer la recherche** ou **construire maintenant** puis accélérer au bon moment fait désormais une vraie différence dans votre progression.
