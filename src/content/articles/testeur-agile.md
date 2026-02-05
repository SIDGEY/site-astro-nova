---
title: "Testeur Agile et Agile Testeur"
description: "Etienne Eberlé, consultant e-qualité, nous fait part de son retour d’expérience suite à sa mission chez La Redoute !    « Mutation vers l’ag..."
date: 2021-01-29
author: "Atecna Team"
coAuthors: []
tags: ["agilité", "recette"]
draft: false
seo:
  title: "Testeur Agile et Agile Testeur"
  description: "Etienne Eberlé, consultant e-qualité, nous fait part de son retour d’expérience suite à sa mission chez La Redoute !    « Mutation vers l’ag..."
---

**Etienne Eberlé, consultant e-qualité, nous fait part de son retour d’expérience suite à sa mission chez La Redoute !**

_« Mutation vers l’agilité et création de features teams. »  
_C’est avec ce brief que ma mission à _La Redoute_ débute.   
Qui dit features teams, dit livraisons itératives en production et qui dit livraisons itératives en production, dit testing !

**Pour faire très bref : sécuriser les mises en production dans une philosophie Agile.**

![ordinateur test](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

## Le contexte

### Les règles du jeu sont les suivantes :

1.  Durée des sprints : 2 semaines.
2.  Phase de tests intégrée au sprint (pas de décalage entre les devs et les tests).
3.  Trois environnements de tests :

*   En environnement d’UAT (User Acceptance Test) : tests manuels jusqu’au « go » pour livraisons quotidiennes en préprod.
*   En préprod : tests manuels et campagnes automatisées de non-régression.
*   En prod : mises en production quasi quotidiennes et campagnes automatisées de non-régression.

### Mes camarades de jeu

Un product owner, deux chefs projets Tech, un UX / UI, deux développeurs front, un développeur back (délocalisé), un automaticien (automatise les tests de non-régression, délocalisé).

### Mon terrain de jeu

Du tunnel de commande à l’espace client (panier, livraison, paiement, confirmation, connexion, création de compte, historique de commandes, modification de compte…) sur le site Français et les filiales étrangères (Suisse, Angleterre, Belgique, Italie, Espagne, Portugal, Russie).

Le périmètre est stimulant, les projets impactants et la mission ultra enrichissante.

**Pour ne citer que quelques projets :** nouveau SI Paiement, PCI DSS et DPS2, implémentation d’un nouveau PSP, migration de services web (gestion clients), programme fidélité, social login, géoblocking, RGPD, codes promo, formulaire SAV, plusieurs pages redesignées…

## Mais comment cela se traduit concrètement ?

*   Appréhension et compréhension du nouvel implément.
*   Rédaction du cahier de tests (fonctionnels et à automatiser) et préparation des jeux de données nécessaires au déroulement des tests (dans tous les environnements).
*   Exécutions des tests dans les différents environnements d’UAT et sur différents supports (mobiles, tablettes, desktops, Chrome, IE, Safari, Samsung Browser…).
*   Création, priorisation et suivi des tickets d’anomalies jusqu’à validation des User Stories.
*   Participation aux décisions de mise en production.

## Selon moi, les 4 choses à retenir de cette expérience :

### 1 – Être un testeur challengeur

Parce qu’un testeur n’est pas qu’un simple exécutant, et en tant que premier utilisateur de la nouveauté, ma valeur ajoutée se situe également dans le fait de challenger les parcours et design, mais aussi les règles de gestion.

Il faut également rester vigilant quant à la qualité des développements livrés. Ce n’est pas parce qu’il y a un testeur, que la QA du dev est dispensable 😉 Cela évite des allers-retours chronophages lors des phases de recette.

D’une manière générale il faut rester en contact avec l’entièreté de l’équipe pour comprendre les choix techniques, la raison d’être de la fonctionnalité et faire du produit le meilleur produit possible.

### 2 – Faire porter sa voix lors des planifications

Parce que la phase de tests est nécessaire pour la mise en production, il est essentiel de la comptabiliser lors de la notation de l’US. À prendre en compte aussi : le temps de récolte des jeux de données qui peuvent parfois être longs et impliquer d’autres services, la rédaction des cahiers de tests ou encore le suivi de l’automatisation de tests de non-régression si cela est prévu.

### 3 – L’automatisation : l’amie du testeur

À _La Redoute_, nous avons la chance d’avoir un service dédié à la non-régression. Tous les tests de non-régression, joués dans différents environnements, sur différentes plateformes sont automatisés, ce qui permet un gain de temps phénoménal !

C’est _Cerberus_ qui fait tout ça, un outil de tests automatisés qui lance des campagnes et permet leur analyse en quelques clics. Pour résumer, le testeur rédige le test dans _Cerberus_, l’automaticien automatise le test et programme les campagnes à faire tourner puis analyse les résultats. D’ailleurs, _Cerberus_ participe aussi (à sa manière) aux décisions de mise en prod.

Pour la petite histoire, _Cerberus_ est un outil développé en interne par _La Redoute_ il y a une dizaine d’années. Cet outil a d’ailleurs été exporté chez d’autres grands noms du web.

### 4 – Les réunions tres amigos

**Les process aussi peuvent être testés !**

Nous avons éprouvé et approuvé les réunions tres amigos dans le cadre de projets conséquents. Ces ateliers regroupent le PO, un dev ou CP Tech et un testeur. Lors de ces réunions, le PO propose une user story avec des règles de gestion, que le dev et le testeur viennent compléter et challenger.

**Plusieurs points positifs :**

*   Bonne connaissance de l’US.
*   Enrichir les règles de gestion et anticiper les cas particuliers.
*   Penser en amont à la qualité d’une manière globale (accessibilité, webperf…) et anticiper la non-régression.
*   Anticiper la récolte des jeux de données.

En bref, cela permet une phase de tests plus fluide et plus efficace.

## Résultats

*   Une bibliothèque de tests étoffée et facilement éditable (Cerberus)
*   Des campagnes de tests plus complètes
*   Des mises en production plus sereines et agiles
*   Moins de « no go »
*   Des parcours clients plus fluides
*   Des fonctionnalités plus innovantes
*   Une amélioration continue plus performante

## Et une dernière petite chose :

On peut entendre parfois, à _La Redoute_ comme ailleurs, que le test n’est pas « grand-chose », que c’est « facile de faire quelques clics »… Il n’en est rien ! **Être un testeur à valeur ajoutée (et je dirais même à valeurs ajoutées) est un réel métier et demande de vraies compétences** 😉

Le fait qu’un testeur soit désormais intégré dans une feature team implique une dynamique inter-équipes (ne serait-ce que pour collecter les données nécessaires aux tests ou impliquer les métiers dans les dernières phases de tests), et donc permet de mieux faire connaître la Qualité aux autres services et métiers de l’entreprise.

La qualité globale du site et des applications s’en ressent et valorise nos métiers !

### Témoignage

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

« Le testeur est un élément indispensable de l’équipe. En représentant le client au sein de la feature team pendant les sprints, il permet d’assurer la bonne qualité des Users Stories mises en ligne. Il est également un élément clé lors de la discussion des US dans la mesure où il connait bien le fonctionnel et qu’il se projette rapidement dans les différents scenarii à concevoir et tester. »

_– Aurélien Dhellemmes  
PO Checkout et Espace Client  
La Redoute_

### **Envie d’échanger avec un expert E-Qualité ?**

Ils seront ravis de répondre à vos questions !
