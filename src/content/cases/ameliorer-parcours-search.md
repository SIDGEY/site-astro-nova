---
clientName: "Moteur de recherche"
sector: "Digital"
summary: "La mission : garantir une bonne implémentation de la nouvelle solution search Leroy Merlin et donc améliorer l’expérience utilisateur"
problem: ""
solution: ""
results: [{"label":"Impact","value":"Significatif"}]
stack: ["CRO"]
featured: false
date: 2021-11-26
coverImage: "/assets/cases/ameliorer-parcours-search/cover.png"
sourceUrl: "https://www.atecna.fr/nos-domaines-dexpertises/cro/ameliorer-parcours-search/"
importedAt: "2026-01-30"
---

ÉTUDE DE CAS

# Moteur de recherche : améliorer le parcours search tout en changeant d’outil 📈

![Logo Leroy Merlin](/assets/cases/ameliorer-parcours-search/cover.png)

Client

**Leroy Merlin**

Secteur d’activité

**Retail**

Client

**Leroy Merlin**

Secteur d’activité

Retail

Problématique

Leroy Merlin se situe dans un marché du bricolage où la concurrence est forte.  
En termes de chiffre d’affaires, sur le digital, Leroy Merlin reste derrière Manomano, mais reste **l’enseigne de bricolage préférée des français.** 

Il faut aussi savoir que **le moteur de recherche interne d’un site e-commerce est un des leviers les plus important, voir le plus important !**

_“Un chercheur est un acheteur”_…

C’est donc un élément clé de différenciation par rapport à la concurrence !

L’objectif de notre mission était donc de garantir une bonne implémentation de la nouvelle solution search Leroy Merlin et par conséquent, améliorer l’expérience utilisateur. 

ACTION 1

## Accompagner l’implémentation de la nouvelle solution tout en ne dégradant pas le parcours

Avant notre arrivée, le choix d’aller vers une solution open-source (elastic search) avait déjà été pris. Notre rôle était donc d’assurer une bonne transition entre l’ancien et le nouvel outil. 

Il a fallu écrire un MVP (Minimum Viable Product : le minimum acceptable pour aller en production sans dégrader l’expérience utilisateur) selon l‘importance des fonctionnalités. 

Une fois établi, le MVP a été partagé au Product Owner afin de mettre en place la roadmap. 

ACTION 2

## Recetter le MVP et assurer un bon tracking pour le suivi des performances

Le planning établi, il a fallu recetter l’implémentation du nouveau search et son algo. L’objectif était d’assurer une pertinence à minimum équivalente à ce qui était fait auparavant. 

La recette s’est effectuée sur un environnement de dev et de pre-production afin de s’assurer de la pertinence du search et de l’organisation des filtres et produits. 

En plus de cette recette métier, il a fallu établir tous les scénarios possibles de comportement de recherche afin de co-construire avec la web analyse le tracking search. 

**L’objectif étant de pouvoir comparer les performances avant/après, et de construire les bases du tracking pour les futures évolutions.** 

Pour recetter le tracking, nous avons utilisé une extension présente sur Google Chrome : “dataslayer”. Cela a permis de vérifier que les paramètres search étaient bien envoyés et que les customs dimensions étaient également bien présentes. 

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

ACTION 3

## KPIs à suivre et mise en place d’un Data Studio

Choisir les KPIs est une phase importante pour **suivre, analyser et partager** les performances du moteur de recherche.

**Les principaux KPIs à suivre pour le search vont être :** le taux d’ajout panier, le taux de clic « fiche produit » sur la SERP (Search Engine Result Page), le taux d’utilisation du moteur et le taux de 0 résultat. 

L’élaboration d’un Data Studio permet de partager et de **suivre les indicateurs de manière dynamique, visuelle et précise.** On peut identifier rapidement s’il y a un décrochage au niveau des performances et creuser si nécessaire. 

ACTION 4

## Nouvelles features

Il a fallu identifier les features **en fonction du comportement client sur le search et des irritants identifiés.** 

Par exemple, nous avons identifié 2 comportements : 

*   Les mots clés utilisés correspondaient à des caractéristiques produits. Nous avons donc fait en sorte de pouvoir indexer les attributs produits qui étaient les plus pertinents pour le moteur de recherche (avec différentes typologies). 

*   La plupart des recherches étaient sur 3 mots clés ou moins. Il était donc nécessaire d’aiguiller / affiner le client dans sa recherche. Cela nous a conduit à réfléchir sur des features permettant au client de trouver son produit plus rapidement et de manière plus simplifiée. 

**Point important :** à chaque nouvelle feature, il fallu vérifier le tracking et/ou établir le scénario associé pour garantir le bon tracking et donc par la suite, assurer le suivi des performances. 

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

ACTION 5

## Intégration de la taxonomie au Search

Depuis peu, **le Knowldege Graph est devenu un enjeu primordial** pour la gestion des contenus chez Leroy Merlin. **La brique principale est la taxonomie.** Plutôt les taxonomies car il peut y en avoir plusieurs. Pour le search, nous nous sommes reposés sur la taxonomie de nature de produit. L’objectif était de réaliser un dictionnaire de l’ensemble des produits, charté et uniformisé. L’information est donc hiérarchisée et utilisable plus facilement. 

Cela nous a permis de brancher l’algo search sur cette taxonomie afin d’améliorer la pertinence globale et de répondre en partie au besoin d’aiguillage des clients lors de requêtes pas assez précises. 

**Exemple de taxonomie de nature de produit**

![taxonomie](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

Ensuite, pour améliorer la pertinence, la compréhension et l’interprétation des recherches clients, **nous sommes passés d’un algo basé uniquement sur la reconnaissance de texte à une reconnaissance des entités / des champs.** 

Cela permet de savoir à grande échelle ce qui est contenu dans une requête : nature, attribut, marque, destination, etc. 

L’objectif est de mieux identifier les typologies de recherches et d’y répondre par des features adaptées. La reconnaissance des entités permet de détecter les intentions de recherches des clients. 

C’est là que se situe la différence entre une requête et une query:

*   **Requête :** recherche client simple, sans intention particulière. Exemple : perceuse bosch. 
*   **Query :** recherche client qui contient une intention. Exemple : poser parquet flottant. 

ACTION 6

## Impact de l’arrivée de la marketplace

Depuis mi 2021, Leroy Merlin a intégré une marketplace afin d’élargir l’offre de produit et de répondre au catalogue grandissant du principal concurrent : Manomano. 

**Cette arrivée de la marketplace a eu un impact non négligeable sur le moteur de recherche.** La data produit était utilisée pour l’[e-merchandising](https://www.atecna.fr/expertises/e-merchandising/) et le searchandising. La qualité de cette data était donc primordiale pour avoir un bon moteur de recherche. 

Nous avons été impactés de manière négative sur le search car la data des produits marketplace était mal ou pas renseignée et le peuplement n’était pas correct dans énormément de cas. Nous avons donc eu une baisse de la pertinence search. 

Un projet de redressement de la data au global est en cours afin de pallier les problèmes identifiés, aussi bien sur le moteur de recherche que dans la navigation.

Cela montre encore une fois que **la data produit doit être au cœur des préoccupations et des enjeux**, car l’e-merchandising et tous ses leviers sont dépendants de cette data produit. 

![Fichier avec une loupe](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)

****Notre intervention a permis à Leroy Merlin :****   

**Notre intervention a permis à Leroy Merlin :** 

*   Une meilleure vision de l’utilisation du moteur de recherche
*   Une amélioration du taux de 0 résultats de 53%
*   Un taux d’utilisation du moteur de recherche en croissance de 24%
*   Un taux d’ajout panier qui a augmenté de 33%
*   Un chiffre d'affaires du search multiplié par 2

Si vous souhaitez en savoir plus, visionnez le [**Webinar**](https://www.atecna.fr/expertises/e-merchandising/tracking-moteur-recherche-interne/) avec Pierre Renaudeau, Consultant E-merchandising Atecna et Renaud Joy, Business Owner chez Leroy Merlin

[Découvrez les autres études de cas](https://www.atecna.fr/etude-cas/)
