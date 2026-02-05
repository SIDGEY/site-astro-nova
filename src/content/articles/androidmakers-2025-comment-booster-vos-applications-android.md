---
title: "AndroidMakers 2025 : Comment booster vos applications android"
description: "AndroidMakers est un événement incontournable pour les passionnés et professionnels du développement Android. Chaque année, cette convention rassemble des..."
date: 2025-05-22
author: "Atecna Team"
coAuthors: []
tags: ["AndroidMakers2025", "Bug", "Sécurité", "UX"]
draft: false
seo:
  title: "AndroidMakers 2025 : Comment booster vos applications android"
  description: "AndroidMakers est un événement incontournable pour les passionnés et professionnels du développement Android. Chaque année, cette convention rassemble des..."
---

AndroidMakers est un événement incontournable pour les passionnés et professionnels du développement Android. Chaque année, cette convention rassemble des développeurs, ingénieurs et experts du monde entier pour échanger autour des dernières tendances, outils et bonnes pratiques de l’écosystème Android. Dans cet article, Atecna vous propose un retour sur quatre Talks marquants de l’édition 2025, qui ont particulièrement retenu l’attention de notre collaborateur.

##### Temps de lecture : 15 min

## UX & Accessibilité cognitive : et si vous simplifiez vraiment l’expérience utilisateur ? 

**Talk animé par Marie Benoit, Développeuse mobile indépendante**

En France, environ 12 millions de personnes vivent avec un handicap, dont 80 % sont atteintes de handicaps invisibles. Parmi eux, on retrouve les troubles psychiques (comme le burn-out), les handicaps mentaux (ex : trisomie 21) et cognitifs (ex : TDAH). 

Ces handicaps peuvent impacter différentes fonctions cognitives : mémoire, langage, raisonnement, apprentissage, intelligence, résolution de problèmes, prise de décision, perception ou encore attention. 

Pour concevoir des interfaces plus inclusives, il est essentiel de s’appuyer sur 5 principes fondamentaux :

*   Simplicité linguistique 

*   Clarté visuelle 

*   Prévisibilité 

*   Adaptabilité 

*   Multimodalité

> Atecna adopte pleinement l’approche **Design Centré Utilisateur** et propose des services d’**accessibilité numérique** pour accompagner les organisations dans la création d’interfaces inclusives, ergonomiques et conformes aux standards, notamment RGAA et WCAG. L’équipe intègre l’accessibilité dès la conception comme un pilier méthodologique central.

### Bonnes et mauvaises pratiques selon Marie Benoit

**Exemple à éviter : Leclerc Drive**   
La plateforme affiche un champ de recherche, mais redirige finalement l’utilisateur vers la création de compte — un parcours confus et peu prévisible. 

**Exemple inspirant : Super U**   
Le parcours de création de compte est bien balisé, les étapes sont clairement indiquées, les instructions compréhensibles, et l’interface respecte une bonne hiérarchie de l’information. 

### Points de vigilance dans le design : 

*   Éviter la surcharge cognitive 

*   Hiérarchiser clairement l’information 

*   Garder une interface simple et lisible 

*   Assurer une bonne gestion du clavier 

*   Maintenir la constance et la prévisibilité 

*   Utiliser des labels explicites et pertinents 

### Ressources et leviers d’action 

Les équipes doivent travailler avec des personnes en situation de handicap et se former, plutôt que de se reposer uniquement sur des simulateurs.  
Elles doivent intégrer l’accessibilité comme un processus continu, dès les phases de conception UX/UI, et l’inscrire dans la Definition of Done.

Pour progresser, les équipes doivent mettre en place un rôle de “Accessibility Master”, collaborer avec des experts en accessibilité et recueillir régulièrement des retours utilisateurs.

Grâce à son expertise et son accompagnement auprès de personnes ayant des troubles cognitifs, Marie Benoit met en lumière un type de handicap invisible, souvent mal pris en compte car non identifié dans les critères classiques d’accessibilité.

## Changer les bugs en or: le guide du développeur vers l’amélioration continue      

**Talk animé par Dennis Bordet, Android Developer at Theodo Apps** 

**Objectif :** Analyser les problèmes et les bugs afin d’en tirer des enseignements et améliorer la qualité des applications. 

Les développeurs doivent d’abord identifier et reproduire le bug, puis trouver une première solution ou un contournement. Sans cette étape préalable, ils ne peuvent pas tirer d’enseignements pertinents.

Ressource utile : [Guide du Debugging](https://debug.guide/) 

### Étape 1 : Le Contexte 

Il est crucial que les développeurs repèrent une ligne de code précise liée au bug.  
Si cette ligne reste floue, cela montre qu’ils ne comprennent pas complètement le bug.

En parallèle, il est nécessaire de retrouver le commit ou la Pull Request associée au changement de code, afin de recueillir le contexte complet de l’évolution. 

La première étape consiste à définir clairement le problème, en spécifiant l’écart entre le comportement observé et celui attendu (une vidéo du bug est encore plus pertinente). 

Cette PR peut également être liée à une demande fonctionnelle, si elle correspond à un ticket précis.  

L’objectif ici est de comprendre l’intention du développeur et les objectifs du développement au moment où le bug a été introduit, afin de disposer de toutes les informations nécessaires pour mieux comprendre la situation. Cela permet notamment :

*   Identifier plus rapidement les causes du bug 

*   Partager plus efficacement les apprentissages 

*   Faciliter les demandes d’aide en cas de blocage

### Étape 2 : Hypothèses sur les causes du bug 

#### Quelques points importants : 

*   Adopter une approche d’apprentissage plutôt que de justification : les erreurs arrivent, mais l’objectif est d’en tirer des leçons. Si nous sommes responsables de l’introduction du bug, il faut être humble et ouvert à la réflexion. 

*   Ne pas chercher à accuser : accuser les autres ou les circonstances empêche l’amélioration continue. 

#### Causes classiques : 

*   Erreurs de développement : refactoring mal effectué, utilisation incorrecte de bibliothèques, etc. 

*   Architecture inadéquate : non-respect des principes comme SOLID, KISS, DRY, ou 5S. 

*   Découpage insuffisant de l’US (User Story) : le bug peut être plus difficile à détecter si l’US n’a pas été bien décomposée. 

*   Mauvaise traduction des besoins fonctionnels. 

*   Implémentation incorrecte de Design Patterns. 

*   Choix inapproprié de structures de données : certaines structures peuvent ne pas correspondre aux besoins du projet. 

### Étape 3 : Hypothèses sur la non-détection ou la détection tardive du bug 

Explorer pourquoi un bug n’a pas été détecté plus tôt (par exemple, pourquoi un bug est apparu en production et n’a pas été repéré lors de la phase de recette ou de la revue de la Merge Request). 

Plus un bug est détecté tard, plus il est coûteux à corriger. 

### Étape 4 : Actions à prendre 

#### Quelques principes clés à garder en tête : 

*   Choisir la bonne action : si plusieurs solutions sont possibles, il est important de se concentrer sur la cause principale plutôt que de simplement traiter les symptômes. 

*   Ne pas alourdir les processus : un processus trop complexe finira par ralentir l’action. L’objectif est de garder une approche simple et efficace. 

*   Rendre les actions durables : il faut modifier les processus de travail pour éviter que le problème se reproduise. 

#### Actions typiques : 

*   Identifier les autres occurrences du bug. 

*   Prévenir sa réintroduction. 

*   Mettre en place des mécanismes pour une détection plus rapide à l’avenir. 

### Étape 5 : Les Apprentissage 

#### Les principaux enseignements de cette démarche incluent : 

*   Améliorer la connaissance de la codebase : comprendre non seulement le fonctionnement de l’application mais aussi ses points de faiblesse. 

*   Maîtriser mieux les outils de travail : la recherche de solutions permet de se tenir à jour sur les outils et technologies utilisés (IDE, CI/CD, etc.). 

*   Identifier les points de faiblesse récurrents : découvrir les causes profondes des bugs et les goulots d’étranglement dans le processus de développement. 

*   Mesurer et suivre des KPIs : utiliser des indicateurs précis pour résoudre des problèmes à plus grande échelle et améliorer la qualité de manière continue. 

> Ces pratiques reflètent **l’approche DevOps et qualité logicielle** d’Atecna, qui mise sur des processus d’**amélioration continue**, la mise en place de **KPIs de performance** et la **capitalisation des incidents** pour faire progresser nos équipes. Cela correspond aussi à notre **accompagnement dans l’industrialisation des tests et l’observabilité**.

## Building dynamic forms with JSONForms and Kotlin Multiplatform 

**Talk animé par Gerard Paligot, Staff Decathlon**  

### Défis de la création de formulaires adaptatifs à l’échelle internationale 

La conception de formulaires dynamiques pour un usage international pose un véritable défi.  
Les équipes doivent souvent personnaliser fortement ces formulaires lorsqu’ils sont utilisés par différentes entités commerciales ou dans plusieurs pays. Cette personnalisation complique leur maintenance et nuit à la cohérence globale du système. Les solutions de design actuelles ne répondent pas bien à ces besoins complexes et provoquent une mauvaise expérience utilisateur et augmentent les coûts de développement.

### Une approche déclarative avec JSONForms 

Pour surmonter ces obstacles, les intervenants ont présenté une méthode déclarative innovante basée sur l’utilisation de **JSONForms.** Cette solution permet aux développeurs de structurer les formulaires autour de trois éléments clés, interconnectés mais distincts : **le schéma de données, le schéma d’interface utilisateur et l’état des données.**

*   **Le schéma de données** définit les caractéristiques fondamentales de chaque champ : type de contenu (texte, email, mot de passe…), contraintes (longueur, format…), etc. Il assure que les données saisies soient valides et adaptées au contexte, qu’il s’agisse, par exemple, d’un numéro de téléphone spécifique à un pays ou d’un code postal formaté correctement. 

*   **Le schéma d’interface utilisateur (UI Schema)** détermine l’agencement visuel du formulaire. Il utilise des mises en page verticales ou horizontales et une variété de composants (champs texte, cases à cocher, boutons radio, sélecteurs de date…) pour rendre l’interface intuitive. Chaque champ est lié à un identifiant unique, ce qui facilite les ajustements selon les marchés. Par exemple, un champ « région » peut être affiché ou masqué selon le pays sélectionné. 

*   **L’état des données** conserve dynamiquement les informations saisies par l’utilisateur. Il permet de suivre les modifications en temps réel et d’ajuster l’affichage selon des règles conditionnelles. Un champ « numéro d’identification », par exemple, peut apparaître uniquement si le pays de résidence sélectionné le nécessite. 

### Les bénéfices d’une architecture modulaire 

Les équipes de développement bénéficient de la séparation entre la structure des données, l’interface et l’état. Elles maintiennent plus facilement les formulaires, réutilisent les composants et personnalisent les interfaces selon les besoins. Elles modifient rapidement les champs en fonction des exigences métier, adaptent l’affichage aux contraintes locales et appliquent une logique conditionnelle avancée pour créer des formulaires intelligents, adaptés à chaque contexte.

### Renderers personnalisés et compatibilité multiplateforme 

Un autre point fort de la solution repose sur la capacité à développer des composants de rendu personnalisés. Il a été démontré qu’il est possible de créer, par exemple, une interface au style Cupertino (iOS) fonctionnant sur Android, soulignant ainsi la flexibilité de l’approche. L’ajustement des schémas d’interface permet également d’assurer une expérience homogène sur différentes plateformes, en tenant compte des particularités de chaque environnement. 

### Conclusion 

Cette méthodologie aide les équipes à concevoir des formulaires mobiles dans des environnements internationaux et complexes, en s’appuyant sur un cadre solide et standardisé. Elle permet de personnaliser les interfaces de façon avancée, d’assurer la compatibilité multiplateforme et de structurer l’architecture de manière claire. Grâce à cette approche, les développeurs conçoivent des interfaces cohérentes, maintenables et réutilisables. Avec JSONForms, ils disposent d’un levier stratégique pour améliorer l’expérience utilisateur, réduire les coûts et répondre aux exigences locales des marchés.

Pour en savoir plus : [https://github.com/GerardPaligot/jsonforms-kotlin](https://github.com/GerardPaligot/jsonforms-kotlin)  
  

> Nous mettons en avant des **architectures frontend modulaires**, et cette approche basée sur JSONForms illustre parfaitement la **conception d’interfaces réutilisables et industrialisables** à laquelle Atecna forme et accompagne ses clients.  
> L’interopérabilité, la personnalisation et la compatibilité multiplateforme (web & mobile) font aussi partie de notre champ d’expertise technique.

## Sécuriser nos apps : Anticiper les menaces, protéger les utilisateurs 

**Talk animé par Alexandre Genet, Android Developer**  

### Objectif 

Ce retour d’expérience présente des pratiques de sécurité pour les applications Android.  
Il explore notamment les techniques de décompilation, l’extraction de secrets et les méthodes de prévention contre la rétro-ingénierie. Les auteurs s’appuient sur le _Mobile Application Security Testing Guide_ (MASTG) de l’OWASP, utilisent des exercices pratiques issus des Android Crackmes, et intègrent des outils comme confR2.ai pour détecter les secrets dans les binaires.   

### Ressources Utilisées 

Pour cette analyse, plusieurs ressources ont été utilisées : 

*   Le OWASP MASTG ([lien vers le guide](https://mas.owasp.org/MASTG)) fournit des lignes directrices complètes pour auditer la sécurité des applications mobiles, avec un accent particulier sur la protection contre la rétro-ingénierie et la décompilation des APK. 

*   Les Android Crackmes ([lien vers Crackmes Android](https://mas.owasp.org/crackmes/Android/)) offrent des exercices pratiques permettant d’examiner des binaires Android. Ces challenges permettent d’explorer des techniques d’obfuscation, de validation de licence, et d’intégrité. 

*   Le talk confR2.ai ([lien YouTube](https://www.youtube.com/watch?v=UxE5GNUBCXo)) a été utilisé pour démontrer des techniques de détection automatisée de secrets dans un binaire. Cela permet de trouver des clés API, des tokens ou des identifiants codés en dur dans l’application. 

### Expérimentations et Résultats 

#### 1\. Analyse de Binaire avec les Crackmes 

L’objectif principal était de comprendre comment différents APKs peuvent être protégés contre la rétro-ingénierie. Nous avons utilisé des outils comme JADX pour la décompilation, et Frida pour l’analyse dynamique. L’étude des Crackmes a permis d’identifier des méthodes d’obfuscation et des vérifications simples, mais qui peuvent être contournées sans une protection supplémentaire côté serveur. 

#### 2\. Recherche de Secrets avec confR2.ai 

L’utilisation de confR2.ai pour l’analyse des APKs a révélé l’importance d’éviter le stockage de secrets (clés API, tokens) dans l’APK. L’outil est efficace pour détecter des secrets codés en dur dans les binaires, mais il est important de noter que cette méthode n’empêche pas la fuite de secrets. Elle permet uniquement de les identifier rapidement dans le code compilé. 

### Bonnes Pratiques Retenues 

#### Protéger les Secrets 

La règle principale est de ne jamais stocker de clés API, tokens ou secrets dans l’APK, même sous forme obfusquée. Ces secrets doivent être gérés côté serveur, en utilisant des mécanismes comme OAuth ou JWT pour délivrer des clés de manière dynamique et sécurisée. 

#### Vérification du Certificat 

Une méthode clé pour renforcer la sécurité consiste à implémenter la validation du certificat ou de la signature de l’application. Cela peut être réalisé par exemple via des vérifications côté Android avec PackageManager.getPackageInfo().signatures. Cette approche permet de détecter si l’APK a été modifié ou re-signé, ce qui peut être un indicateur de rétro-ingénierie ou d’attaque. 

#### Obfuscation et Renforcement du Code 

Il est essentiel d’utiliser des outils d’obfuscation comme ProGuard ou R8 pour rendre le code plus difficile à comprendre et à modifier. De plus, il est recommandé d’ajouter des contrôles d’intégrité runtime pour détecter si l’application est exécutée dans un environnement compromis (root, debugger, outils comme Frida). 

#### Architecture Sécurisée côté Serveur 

Les développeurs doivent éviter de baser la sécurité uniquement sur le côté client. Ils doivent adopter une architecture Zero Trust. L’application mobile doit vérifier en continu l’identité et l’intégrité des utilisateurs. Elle doit s’appuyer sur des services back-end sécurisés. Par exemple, ils peuvent utiliser SafetyNet ou Play Integrity.  
Ces solutions valident l’intégrité du terminal. Elles permettent ou bloquent l’accès aux ressources sensibles selon le résultat.

#### Synthèse 

Cette expérience montre que les développeurs doivent combiner des techniques de détection et de prévention, à la fois côté client et côté serveur, pour sécuriser les applications Android.  
Ils ne doivent jamais stocker de secrets sensibles dans les binaires.  
Ils doivent aussi renforcer l’application en validant les certificats et en obfusquant le code.  
Enfin, ils doivent utiliser des contrôles runtime pour détecter les environnements compromis, comme le root, le débogage ou la manipulation mémoire.

Les développeurs doivent solidement sécuriser l’architecture back-end.  
Ils doivent aussi gérer les secrets de façon dynamique et sécurisée côté serveur.  
En appliquant ces bonnes pratiques, ils réduisent significativement les risques de compromission des applications Android.

> Ces sujets recoupent **l’expertise mobile et applicative** proposée par Atecna, en particulier la **sécurisation des applications natives**, l’intégration de **bonnes pratiques OWASP**, et la **mise en place d’architectures sécurisées** côté serveur. Nous accompagnons notamment nos clients dans l’audit, la mise en conformité et le **durcissement des applications mobiles.**

L’édition 2025 d’AndroidMakers a une nouvelle fois montré la richesse et la diversité des enjeux :  
De nos jours, les développeurs Android font face à de nombreux défis. Les talks ont offert des pistes concrètes pour faire évoluer les projets.  

En intégrant ces bonnes pratiques et en adoptant une approche centrée sur l’utilisateur, la qualité et la sécurité, vous pourrez véritablement booster vos applications Android tout en offrant une expérience optimale et inclusive à vos utilisateurs.
