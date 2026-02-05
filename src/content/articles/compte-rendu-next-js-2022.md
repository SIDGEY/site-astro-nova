---
title: "Compte-rendu de la Next.js 13 Conf 2022"
description: "Le 25 octobre 2022, nous avons eu le plaisir d’assister à la Next.js Conf édition 2022. Au cœur de cette conférence, la présentation de la nouvelle version du..."
date: 2022-12-05
author: "Atecna Team"
coAuthors: []
tags: ["Développement Front End", "front-end", "REX"]
draft: false
seo:
  title: "Compte-rendu de la Next.js 13 Conf 2022"
  description: "Le 25 octobre 2022, nous avons eu le plaisir d’assister à la Next.js Conf édition 2022. Au cœur de cette conférence, la présentation de la nouvelle version du..."
---

Le 25 octobre 2022, nous avons eu le plaisir d’assister à la Next.js Conf édition 2022. Au cœur de cette conférence, la **présentation de la nouvelle version du framework Next.js** : Next.js 13. Avant de rentrer dans le vif du sujet de cette présentation, revenons sur quelques éléments de définition.

## Qu’est-ce que Next.js ?

Next.js est un framework gratuit et open source s’appuyant sur la bibliothèque **[JavaScript](https://www.atecna.fr/expertises/java/) React** et sur la **technologie Node.js**. Next.js prend en charge les techniques de **rendu des pages web côté serveur** (SSR : Server Side Rendering), le **rendu statique de pages web** (SSG: Static Site Generation). Il prend également en charge la **génération hybride de pages web et / ou incrémentale des pages** (ISR: Incremental Static  
Generation).

Maintenant que la définition formelle est donnée, passons au contenu de la conférence.

## Le pré-show du Next.js 13

> So exciting to be here at [#nextjsconf](https://twitter.com/hashtag/nextjsconf?src=hash&ref_src=twsrc%5Etfw) [pic.twitter.com/yLGiPU6Yxs](https://t.co/yLGiPU6Yxs)
> 
> — Steven ⬢ (@styfle) [October 25, 2022](https://twitter.com/styfle/status/1584974782222995459?ref_src=twsrc%5Etfw)

La conférence démarre à 19h, au sein des locaux de Vercel, par un pré-show d’une trentaine de minutes où différents speakers apparaissent : **Rich Harris créateur de Svelte, Una Kravets, Ingénieur en relations avec les développeurs chez Google Chrome, Dan Abramov ingénieur logiciel chez Facebook et co-fondateur de Redux**. Tous ces intervenants ont joué un rôle majeur dans la création de Next.js v13 et le décrivent comme une révolution dans le monde du Framework JS. Ce pré-show se termine par la présentation d’une collaboration entre **Vercel (Next.Js) et KidSuper (Label de mode)**. Après 30 premières minutes intenses, les présentateurs annoncent le début de la conférence par une Keynote, présentée par Guillermo Rauch, CEO de Vercel.

## Résumé de la Keynote du Next.js 13

Lors de cette Keynote, on nous présente l’état actuel de Next.Js. Bien que sa communauté ne cesse de s’agrandir, Next compte déjà de grandes entreprises parmi ses utilisateurs : **Walmart, Nintendo, Loom, Facebook, Twilo, Solana** et d’autres noms du retail et du SaaS.

Next.Js, dans sa version actuelle, a des limites :  
● Coût de mise en place (serveur, Analytics)  
● Nécessite de **jongler avec deux API pour être le plus dynamique possible** (Web API, Node API)  
● Un seul pays d’origine dépendant des CDN cache (ex: vitesse de site) ou du statique (JAMStack).

Afin de pallier à ces limites, Next.JS v13 sort !

### Quelles sont les nouveautés de Next.JS 13 ?

Voici la liste non-exhaustive des nouveautés :

*   Un nouveau compilateur, le successeur de Webpack : [Turbopack](https://turbo.build/pack). Selon les benchmarks, il est **700 fois plus rapide que son prédécesseur** (Hot Module Reload) et 4 fois plus rapide en “Cold starts ». Il ne fonctionne qu’avec React, et tout comme son concurrent VITE, il est **utilisable avec TypeScript, React javascript, et les CSS Modules**. Dans un futur proche, il sera compatible avec **Vue JS et Svelte**.
*   Une nouvelle batterie de composants avec 3 librairies : **next/image, next/font, vercel/og**.
*   Un nouveau système de Router, supporté dans des **composants React Server and Nested** **Layouts**, et support du streaming.

### Next.js 13 : Les 3 conférences phares

Nous sommes ensuite invités à assister à des présentations plus spécifiques, pour le bien (et l’extrême longueur de ce compte rendu), voici les 3 conférences auxquelles nous sommes invités :  
● **Enterprise-grade composable** commerce with Next.js  
● Introducing Turbopack: the Turbo-charged bundler  
● Building a design system in Next.js with **Tailwind**

#### Enterprise-grade composable commerce with Next.js

TJ Kholi, Creative Partner chez Monogram (Birchbox.com) nous explique dans cette présentation, combien le commerce composable, **basé sur le concept MACH est maintenant possible et pourquoi l’environnement Next.js et les acteurs du e-commerce** que sont **Shopify, Saleor, Swell, Bigcommerce** vont être au centre de la scène du marché du retail.

Grâce à la collaboration Next/Headless e-commerce, les bénéfices du commerce composable sont **en corrélation directe avec les principaux indicateurs de performance** : **Plus de ventes, plus de rétention et plus de satisfaction client**.

Pour cela il est important de **créer une plateforme plus sécurisée, qui inspire plus de confiance et qui est plus rapide via des choix d’intégrations intelligents**, des interfaces propres et lisibles mais aussi des Core Web Vitals respectés. La présentation se termine par un tour plus technique de ce que Monogram et Next.js vont utiliser (**SWR/ Caching / Middleware/ Edge functions**).

#### Introducing Turbopack: the Turbo-charged bundler

Turbopack fait aussi rêver que Vite : **basé sur Rust, 3 fois plus rapide** (peut prendre 1,8 secondes pour démarrer tandis que Vite prend en moyenne 11,4 secondes). Voici dans les détails ce qu’il faut retenir de Turbopack, le successeur de Webpack.

![Comparatif Turbopack versus Webpack](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

**Comparatif Turbopack versus Webpack**

#### Building a design system in Next.js with Tailwind

Dans cette courte présentation, on assiste à une démo de Tru Narla montrant comment il est possible de créer un design system avec Tailwind et Next.js. Chaque société peut **exprimer le besoin d’avoir son propre design system pour se démarquer de ses concurrents**. Et tout comme Figma permet de le faire, Next.js pourrait permettre la création de son propre design system avec des notions telles que l’accessibilité.

## Next.js 13 Conf 2022 : Ce qu’il faut retenir

Que retenir de cette conférence, riche en informations et en échanges ? Personnellement j’ai adoré ! Les nouveaux éléments présentés **donnent envie de les prendre en main, de jouer avec, de faire des comparaisons avec l’existant**. Et c’est ce qui est fun je trouve dans l’ensemble, c’est un très bon framework qui a, à mon sens, beaucoup de potentiel pour l’avenir. Mais **il reste encore un long chemin à parcourir avant qu’il ne mûrisse suffisamment pour être prêt pour la production**. Si le cœur vous en dit, je vous invite à visionner le replay de la conférence pour en savoir plus !

## ****Envie d’échanger avec la Team Front-End ?****

Ils seront ravis de répondre à vos questions !
