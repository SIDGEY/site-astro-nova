---
clientName: "Optimiser la mesure de ses actions grâce à Power BI"
sector: "Digital"
summary: "Améliorer la visibilité globale du trafic, les performances par rayon et surtout avoir une vue globale de ces données"
problem: ""
solution: ""
results: [{"label":"Impact","value":"Significatif"}]
stack: ["Web analyse"]
featured: false
date: 2021-05-31
coverImage: "/assets/cases/optimiser-la-mesure-de-vos-actions-power-bi/cover.png"
sourceUrl: "https://www.atecna.fr/nos-domaines-dexpertises/web-analyse/optimiser-la-mesure-de-vos-actions-power-bi/"
importedAt: "2026-01-30"
---

ÉTUDE DE CAS

# Optimiser la mesure de ses actions grâce à Power BI 📈

![Logo Leroy Merlin](/assets/cases/optimiser-la-mesure-de-vos-actions-power-bi/cover.png)

Client

**Leroy Merlin**

Secteur d’activité

**Retail**

Client

**Leroy Merlin**

Secteur d’activité

Retail

Problématique

Le pôle web de Leroy Merlin travaille depuis plusieurs années pour proposer une expérience-client optimale malgré un contexte omnicanal fort.  
  
La Data est très utile pour comprendre les consommateurs, cependant, les RPI (Responsable Produit Internet) sont confrontés à un surplus d’information, souvent mal organisé.  
Dans cette optique, l’objectif de notre intervention a été d’**améliorer la visibilité globale du trafic, les performances par rayon et surtout d’avoir une vue globale de ces données.**

ACTION 1

## Résoudre la phase irritante

L’un des métiers les plus concernés par ce sujet est le poste de RPI, qui signifie **« Responsable Produit Internet ».**  
  
Le rôle d’un RPI consiste à animer un univers produit sur un site (peinture, outillage, cuisine). Ces univers contiennent différents niveaux d’arborescence, dont voici un exemple :

![arborescence produit](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Son quotidien est de gérer les mises en avant, les opérations commerciales, l’identification des irritants clients et l’animation des équipes selon leur secteur de vente.  
  
Pour mener à bien leurs missions, les RPI sont avides de data mais peuvent se retrouver noyés par celle-ci. En effet, les équipes travaillent avec différents outils et référentiels, ce qui entraine une **multiplicité des sources** (Google Analytics, Business Object, des rapports issus de la centrale d’achat..), contraignant ainsi la lecture des données.  
  
Donc beaucoup de temps passés sur la recherche et la consolidation des chiffres **au détriment de l’analyse et de l’action !**  
  
La qualité du tracking était aussi à revoir. Pendant longtemps, Google Analytics capturait les infos d’arborescence via des libellés.  
Or, ce tracking différait entre desktop, mobile et application. On se retrouvait par exemple avec _«Terrasse et jardin», «terrasse\_et\_jardin» et «terrasse\_jardin» et «1452144587»._  
Il a fallu **construire une table de référence**, dans laquelle nous avons fait des rapprochements afin que dans le rapport, les différentes écritures soient associées au bon nœud de nomenclature.  
Et pour clôturer le tout, les analyses menées dans Google Analytics et Data Studio débouchaient généralement sur un échantillonnage élevé de la donnée, ce qui faussent énormément les données.  
  
**A ce stade, il était important de trouver un outil aux équipes de Leroy Merlin pour collecter les données, les visualiser et mettre en avant l’essentiel.**

ACTION 2

## La mise en place du Dashboard via Power BI

Pour répondre à cette problématique, nous avons choisi de mettre en place un Dashboard via la solution **Power BI** afin de permettre un gain de temps considérable lors de la collecte des données.  
  
**Notre démarche : avancer vite en fonctionnant par « lots »**  
  

*   Le premier lot se concentre sur les chiffres de trafic et de performance.
*   Le second lot intégre la vue par famille (3ème niveau d’arborescence).
*   Le dernier lot consiste à intégrer la frise web complète (trafic, fiche produit vue, ajout panier, checkout, conversion).

  
**Les différentes actions**  
  

*   Révision du trafic afin de capturer des IDs de nomenclature, plutôt que des libellés
*   Définition des KPIs à intégrer au dashboard
*   Rédaction d’une spécification « data » à destination du data enginer en charge du projet

Cela a consisté notamment par la pré-définition des tables utiles pour la construction du dashboard.  
  

*   Réalisation du dataset via des requêtes Google Big Query
*   Mise en place des jointures entre les différentes tables, création des métriques calculées et recette comparative avec Google Analytics
*   Construction du Power BI
*   Pédagogie auprès des équipes et communications

Dans le détail, nous avons répondu à ces questions pour chaque univers, sous-univers et famille produit :

  
*   Quel est le volume de mon arborescence ? Quel nœud dois-je travailler en priorité ?
*   Quelle est la part de trafic entrant sur ce nœud ? Dois-je effectuer des actions pour le rendre plus visible en ligne par exemple ?
*   Combien de visites de mon nœud découlent sur une vue de fiche produit ? Dois-je travailler mon e-merch pour l’améliorer ?
*   Combien de visites découlent sur un ajout panier ? Dois-je travailler mon offre (prix, délais, etc) ?
*   Quelle est la part de trafic de l’arborescence sur le trafic global Leroy Merlin ?
*   De quelles sources de trafic proviennent mes visites ?
*   Quelles sont les familles qui surperforment ? Celles à travailler en priorité ?

![Performance e-commerce rayon](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

![dashboard Leroy Merlin](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

**Témoignage de Céline Drolez Vanthournout, Responsable Pôle e-commerce chez Leroy Merlin**

De formation commerciale, Céline est une « addict » des chiffres avec un crédo : « _Tout ce qui se mesure se pilote »._  
  
« Le dashboard permet de mieux appréhender la façon dont les visiteurs naviguent sur le site. Il devient donc un incroyable levier de décision.  
  
Cela permet notamment de challenger les actions tournant principalement autour de la génération de trafic, des opérations commerciales, et de la mise en place de leviers e-merch.  
  
En résumé, les utilisateurs apprécient **la certification** (fiabilité et disponibilité) de la donnée : **il devient facile et rapide d’interpréter les chiffres**, notamment grâce aux définitions clairement exprimées dans le rapport. Les équipes ont ainsi tous le même niveau d’accès à l’information.  
  
**C’est donc un dashboard qui est utile, utilisable et surtout utilisé ! »**

**Statistique d’usage du rapport créé : 4ème rapport le plus consulté parmi l’ensemble des rapports Leroy Merlin !**

![REX LM Web Analyse](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

![Fichier avec une loupe](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

****Notre intervention a permis à Leroy Merlin :****   

**Notre intervention a permis à Leroy Merlin :** 

*   De mieux appréhender la façon dont les visiteurs naviguent sur leur site
*   Une meilleure acculturation de la data pour les RPI
*   Une certification de la donnée et des chiffres communiqués (via notre démarche de recette/qualité)
*   Des actions concrètes sur la partie acquisition de trafic (ajustement des enchères SEA, mise en place de chantiers sur le nommage des nomenclatures, sur les filtres…)
*   Plus globalement, une meilleure priorisation des actions à mener, orientée data-driven

[Découvrez les autres études de cas](https://www.atecna.fr/etude-cas/)
