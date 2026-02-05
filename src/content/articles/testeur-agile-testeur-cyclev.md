---
title: "Testeur Agile VS Testeur cycle en V"
description: "Avant d’entreprendre une exploration des différences entre l’agilité et le cycle en V du point de vue du test, rappelons d’abord ce qui est..."
date: 2021-08-26
author: "Atecna Team"
coAuthors: []
tags: []
draft: false
seo:
  title: "Testeur Agile VS Testeur cycle en V"
  description: "Avant d’entreprendre une exploration des différences entre l’agilité et le cycle en V du point de vue du test, rappelons d’abord ce qui est..."
---

Avant d’entreprendre une exploration des différences entre l’agilité et le cycle en V du point de vue du test, rappelons d’abord ce qui est commun aux deux philosophies. 

## 1 – Les 7 principes de test 

*   **Les tests montrent la présence de défauts et non leur absence !** 
*   **Les tests exhaustifs sont impossibles** 

Dès l’instant où les variables se multiplient, les scenarios possibles sont de l’ordre de l’infini. 

*   **Tester le plus tôt possible** 

Commencer le test en amont du projet (test statique) permet de corriger d’éventuelles anomalies avant les développements, de prévenir certains ajustements… _in fine_, l’équipe gagne du temps, les échanges sont plus fluides et cela évite des surcoûts. 

*   **Regroupement de défauts** 

Un petit nombre de modules contient généralement la plupart des défauts découverts lors des tests avant livraison, ou est responsable de la plupart des défaillances en exploitation. Des regroupements prévisibles de défauts, ou des regroupements réellement observés en test ou en exploitation, constituent un élément important de l’analyse des risques utilisée pour cibler l’effort de test. 

*   **Paradoxe du pesticide** 

Au fil du temps, les cas de tests répétés couvrant encore et toujours les mêmes chemins perdent de leur efficacité et des anomalies prolifèrent. Il est donc primordial de revisiter ces cas de test afin de pouvoir détecter de nouvelles anomalies dans le but d’améliorer la qualité du système. 

*   **Les tests dépendent du contexte** 

Un site e-commerce ne sera pas testé de la même manière qu’un logiciel de voiture autonome ! 

*   **Illusion de l’absence d’erreurs** 

Le système proposé doit répondre à un besoin utilisateur. Trouver et corriger des anomalies d’un système qui ne correspond pas au besoin est inutile. 

![schéma qualité](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Ensuite, ce qu’il y a de commun dans le test Agile et le test en Waterfall, **c’est le testeur !** On retrouve des caractéristiques communes dans son état d’esprit… 

**[La Qualité](https://www.atecna.fr/expertises/e-qualite/)** est un sujet d’équipe et une bonne communication avec les membres est primordiale pour prévenir les défauts et optimiser la Qualité du système. 

Le testeur doit questionner les choses, être pragmatique et rigoureux mais aussi avoir le sens du détail tout en étant concis. Aussi, il n’hésite pas à être force de propositions et à challenger le besoin et les acquis. 

## 2 – Cycle en V / Waterfall : rôles du testeur 

![cycle en v test](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Le cycle en V est un modèle de développement historique, très utilisé **pour des projets d’ampleur** (ex : prélèvement des impôts à la source) ou pour la **production de systèmes complexes.** Cette méthodologie ordonne les différentes phases de conception et d’exécution comme suit : 

### Phase d’analyse des exigences

C’est la période du cycle de vie pendant laquelle les exigences, fonctionnelles et non fonctionnelles, du produit sont définies et documentées.

**Rôles du testeur :** sur la base des spécifications, le QA est amené à concevoir son plan de test, à faire du test statique (revue de spécifications notamment). Cette phase entre en résonance avec l’un des principes majeurs du test, à savoir « tester tôt ».

### Phase de conception et d’implémentation

La phase de conception est la période du cycle de vie durant laquelle l’architecture logicielle, les composants logiciels, les données et les interfaces sont conçus et documentés afin de satisfaire aux exigences.

La phase d’implémentation est la période du cycle de vie pendant laquelle le logiciel est créé à partir des spécifications de conception. Les tâches de cette phase se concentrent autour du code où les composants sont implémentés et testés individuellement.

**Rôles du testeur :** lors de cette phase, le testeur conçoit ses cas de tests et scenarii de test (test unitaire, test système, test d’intégration, test d’acceptation). La préparation des jeux de données et environnements de test est un point prépondérant géré pendant cette étape du projet. Cette phase entre en résonance avec un autre principe ISTQB, les tests exhaustifs sont impossibles. Il est important ici de concevoir les cas de test suffisants et nécessaires permettant une couverture optimale du système/fonctionnalité testé.

### Phase de test

C’est la période du cycle de vie consacrée à l’intégration et à l’évaluation des composants et du logiciel afin de vérifier les exigences aussi bien au niveau système qu’utilisateur. Cette phase est constituée d’une succession d’activités de test.

**Rôles du testeur :** il passe en mode exécution. Il déroule ses cas de test correspondant aux différentes phases du cycle en V jusqu’aux tests d’acceptation.

### À retenir

Nous pouvons retenir que le testeur en V a, à sa disposition une documentation exhaustive des exigences. Peu de place (voire aucune) n’est laissée au changement des spécifications. **Le besoin n’évolue pas ou peu pendant toutes les phases du projet.** 

**En bref, l’idée est de contrôler la qualité du logiciel, le long de la branche ascendante du V. Les cycles de développements et de tests sont alignés, toutefois l’exécution des tests n’est mise en œuvre qu’une fois l’implémentation réalisée.** 

## 3\. Méthode Agile : rôles du testeur 

Les méthodologies Agiles remettent **en question la notion de « gestion de projet » au profit de « gestion de produit ».** Il faut donc comprendre que toute la construction du logiciel/système est basée sur ce que la fonctionnalité ajoutée peut apporter en termes de valeur produit. Chaque fonctionnalité est une nouvelle brique que l’on ajoute au produit existant dans un processus itératif. **Les livraisons sont plus rapides, plus fréquentes et l’utilisation partielle du produit se fait assez tôt.** 

L’Agilité part ainsi du principe que **le produit évoluera au cours des itérations**, par voie de conséquence, les spécifications et planifications détaillées seront obsolètes (ou presque) dès leur rédaction. Des « user stories » (que nous pourrions traduire par expériences client), basées sur la valeur ajoutée de l’implément pour le client final, sont imaginées pour conceptualiser et cadrer les développements. 

### Le testeur Agile est user centric 

Ne nous le cachons pas, un testeur curieux des pratiques de ses utilisateurs finaux (personas, test utilisateur, tracking) sera plus efficient et plus prompt à définir un niveau de qualité du système/fonctionnalité qu’il teste, notamment en évitant le piège des « fausses » anomalies bloquantes. 

### Le testeur Agile fait partie d’une équipe Agile 

Le testeur fait partie intégrante de l’équipe Agile, composée la plupart du temps d’une équipe de développeurs, d’UX/UI, d’un PO et d’un CP technique. A ce titre, il participe à tous les cérémonies (daily meeting, poker planning, démonstration, rétrospective, release planning day…) et relaie un esprit “qualité” à toute son équipe et parties prenantes. 

### Le testeur Agile ne fait pas que du test 

Un testeur Agile qui, grâce à sa connaissance du produit et des différentes règles de gestion, peut aider le Product Owner dans la rédaction/modification des User Stories. Certaines organisations adoptent la cérémonie des _tres amigos_ (PO + CPtech + QA), toujours dans l’objectif de définir et redéfinir la User Story en fonction du besoin utilisateur, de l’existant, de la faisabilité. Il s’agit là du cadre idéal permettant de répondre efficacement à la Definition of Ready (DoR). 

Pour plus de détails, n’hésitez pas à regarder cette vidéo sur les bienfaits des réunions 3 amigos : 

### Le testeur Agile s’adapte au changement 

En agilité, le testeur doit accueillir favorablement les changements puisqu’ils sont fréquents et permettent d’améliorer le produit. Un projet défini à l’avance comme nous l’avons vu pour le cycle en V, n’est plus la règle et le testeur agile est amené à intervenir tout au long de la vie de son produit. 

### Le testeur Agile est garant du respect de la Definition of Done

La mise en place d’une Definition of Done claire et partagée avec toute l’équipe est prépondérante en agilité. Les critères d’acceptance sont un des points clés de la DoD. Le rôle du testeur, ici, est de confirmer le caractère « done » d’une US. 

### Le testeur Agile conçoit et exécute 

Le testeur doit évidemment concevoir et exécuter ces cas de tests. Idéalement, le testeur agile a un sprint d’avance (c’est-à-dire une itération) sur la conception des cas de tests dans le but notamment d’accompagner le product owner pour tendre vers la Definition DoR avant le démarrage des développements. 

### Prend part à la stratégie d’automatisation 

La méthode de développement incrémental permettant un déploiement continu, renforce le rôle central des tests dans le processus de mise production. Mais, elle augmente le risque de bugs. L’automatisation des cas de test dans ce cadre agile est vitale pour sécuriser chaque mise en production. En ce sens, le testeur contribue à améliorer les processus de test en adaptant (modification, suppression, création) les tests de non-régression automatisés. 

### Peut faire des tâches « Support » 

Dans la réalité, les « frontières » peuvent être floues. Au sein d’une entreprise le QA reconnu pour la qualification des bugs/anomalies est souvent une des personnes à qui l’on rapporte un problème en production, tâche qui est du périmètre du support et non du QA. 

### À retenir

Le testeur Agile a un rôle à jouer dans la Qualité du produit, mais n’en est pas le seul garant (faisant partie d’une équipe) et fait office d’Ambassadeur au service de la Qualité afin de toujours servir au mieux les besoins (explicites et implicites) du client final. 

**Le testeur Agile s’approprie le produit et participe à son évolution.** 

Chaque méthodologie ou philosophie a ses forces et ses faiblesses… Nous pourrions en débattre un certain temps ! Au-delà des 7 principes du Test, nous avons pu entrevoir que les rôles, le quotidien, les missions, la temporalité diffèrent que l’on soit un testeur en V ou en agilité. 

Dans les deux cas, il est, selon moi, **primordial que le testeur ne cesse de se poser des questions tout au long de ses tests.** Voici un exemple amusant de question : 

« _Quand j’avais 4 ans, ma sœur en avait 2. Aujourd’hui, j’ai 44 ans. Quel âge a ma sœur ?_ » 

Le testeur répondra : « _C’est une question difficile car elle en soulève d’autres… Elle pourrait avoir 42 ans, mais également 41 ou 43, dans la mesure où nous n’avons pas les dates des deux anniversaires. Elle pourrait aussi être décédée ou ne pas être ta sœur : demi-sœur ou sœur adoptée. Tu pourrais penser ta sœur décédée, mais en fait, elle est devenue astronaute pour un projet secret, alors elle vieillirait moins vite et serait alors plus jeune que 41 ans, ou au contraire, vieillirait plus vite et serait potentiellement plus vieille que toi désormais… Tu vois, question difficile…_ » 

Le développeur, lui, répondra sûrement : « _44 – (4-2) = 42 ans_ » 

**Un projet, une équipe, une organisation quelle qu’elle soit a besoin de ces différents esprits pour pouvoir prospérer et réussir ce qui est entrepris.** Cette complémentarité est nécessaire pour assurer une bonne communication. 

**Selon moi, le testeur en méthodologie Agile jouit de plus de souplesse** et peut activement participer à l’amélioration du produit. Le testeur en cycle en V quant à lui, profite de documents de spécifications clairement définis et exhaustifs. 

Quant à moi, si vous me demandez à quelle méthodologie je me rapproche le plus, je vous répondrai la philosophie Agile. Mais j’ajouterai d’autres questions… 

Quelle est la différence entre un testeur Agile et un testeur dans une équipe Agile ? 

Quid d’un testeur Agile dans une équipe de Test ?
