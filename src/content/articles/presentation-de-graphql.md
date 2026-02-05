---
title: "Présentation de GraphQL"
description: "Introduction aux micro-services    En informatique, les différentes entités (serveurs, navigateurs …) communiquent entre elles avec différents protocoles. Le p..."
date: 2022-10-28
author: "Atecna Team"
coAuthors: []
tags: ["JAVA"]
draft: false
seo:
  title: "Présentation de GraphQL"
  description: "Introduction aux micro-services    En informatique, les différentes entités (serveurs, navigateurs …) communiquent entre elles avec différents protocoles. Le p..."
---

## Introduction aux micro-services

En informatique, les différentes entités (serveurs, navigateurs …) communiquent entre elles avec différents protocoles. Le plus connu, REST, permet de définir un contrat d’interface entre le consommateur et le fournisseur.

Pour faire un parallèle, on peut considérer que le contrat d’interface dans un restaurant est le menu : le restaurateur (serveur) propose tout ce qui est possible d’avoir au menu (contrat d’interface), et le client (navigateur) fait sa requête en fonction de ce qui est disponible.

## Etat des lieux

Actuellement, le protocole REST est le plus populaire. C’est un protocole robuste et fiable. Cependant, il a ses défauts : les contrats d’interfaces sont très peu flexibles, le moindre changement nécessite de passer sur une nouvelle version web service.

De plus, REST ne permet pas de choisir toutes les données que l’on reçoit. Il envoie toujours la même quantité de données, peu importe ce dont on a besoin. Pour notre restaurateur, on peut imaginer que le serveur donne la carte complète avec les plats, boissons et desserts alors que le client n’est venu que pour boire un verre.

## GraphQL c’est quoi ?

![imageGraphQL](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

GraphQL est un autre protocole qui existe pour la communication entre micro-services. Il a été créé par Facebook en 2012 avant de s’en détacher et de devenir open source en 2015. C’est un protocole qui est de plus en plus utilisé, notamment pour la communication avec une interface front, celle qui gère la partie visuelle d’un site.  L’avantage principal de GraphQL est sa granularité : avec un seul appel, le client est capable de recevoir uniquement les informations dont il a besoin. Et ça permet entre autres de ne faire que les traitements nécessaires côté fournisseur, et donc de gagner en temps de réponse en évitant les traitements inutiles. Notre restaurateur est alors capable de proposer une carte personnalisée à son client, comme une carte végétarienne

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Avec GraphQL, ces deux appels sont gérés avec un seul webservice !

Cela permet notamment la mise à jour du contrat sans remettre en cause les appels existants, et de nouveaux champs aussi peuvent être ajoutés. Cela permet donc de mettre à jour le contrat plus facilement qu’avec REST

Par contre, il est vrai que la gestion du cache est plus complexe qu’avec REST : les appels sont dépendants du client. Notre restaurateur aurait donc besoin d’un grand nombre de menus en stock.

De plus, GraphQL étant moins populaire que REST, une montée en compétence est à prévoir si jamais on veut utiliser cette solution. En effet, bien que de plus en plus populaire et utiliser par de plus en plus de site, GraphQL n’est pas encore connu autant que REST.

### Pourquoi s’intéresser à GraphQL

Dans un milieu où REST est quasiment en monopole, GraphQL propose une alternative intéressante et qui est de plus en plus populaire. Sa granularité est sa grande force, dans un monde qui est toujours en évolution.

L’une n’est pas meilleure que l’autre, il faut surtout choisir en fonction du contexte, en fonction des avantages et des inconvénients de chaque solution. Il est donc d’autant plus intéressant de connaitre plusieurs solutions pour avoir la capacité de s’adapter !

### **Envie d’échanger avec la Team Java ?**

Ils seront ravis de répondre à vos questions !
