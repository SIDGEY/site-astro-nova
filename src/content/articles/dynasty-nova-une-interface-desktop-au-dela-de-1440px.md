---
title: "Dynasty Nova : une interface desktop au-delà de 1440px"
date: 2026-09-18
description: "Dynasty Nova déploie une véritable interface desktop au-dessus de 1440px de large : quatre colonnes fixes, un panneau planète permanent qui ne recharge plus sa scène 3D, et des rapports de bataille lus camp par camp sur leur propre page."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["UX/UI Design", "Mobile-first", "Mise à Jour"]
draft: false
image: "/uploads/blog/covers/dynasty-nova-une-interface-desktop-au-dela-de-1440px.webp"
icon: "ph-cursor-click"
faq:
  - question: "Dynasty Nova a-t-il une interface différente sur grand écran ?"
    answer: "Oui. Au-dessus de 1440px de large, Dynasty Nova affiche une interface desktop à quatre colonnes fixes : le rail de navigation, un sous-menu contextuel, le contenu de la page et un panneau planète permanent. En dessous de cette largeur, l'interface mobile habituelle reste inchangée."
  - question: "Pourquoi le panneau planète ne se recharge plus quand je redimensionne la fenêtre ?"
    answer: "Sur l'interface desktop, la scène 3D de la planète est montée une seule fois pour toute la session. Avant ce changement, chaque redimensionnement du panneau reconstruisait entièrement le contexte graphique, les textures et le champ d'étoiles, ce qui rendait chaque ajustement de fenêtre visible et coûteux."
  - question: "Comment lire un rapport de bataille sur l'interface desktop ?"
    answer: "Un rapport de bataille s'ouvre sur sa propre page plutôt que dans une fenêtre superposée, et se lit camp par camp : chaque camp affiche ses unités sous forme de tableau, avec ses pertes totales résumées juste en dessous."
  - question: "Est-ce que l'interface mobile de Dynasty Nova va disparaître ?"
    answer: "Non. Les deux interfaces coexistent selon la largeur de l'écran : en dessous de 1440px, l'interface mobile-first reste la seule utilisée, sans aucun changement de comportement."
coverPrompt: "a soft cool blue glow suggesting a wide multi-column screen layout"
---

## Introduction

Dynasty Nova ajoute une véritable interface desktop au-dessus de 1440px de large, pensée pour tirer parti d'un grand écran plutôt que d'étirer simplement l'interface mobile. Quatre colonnes fixes, un panneau planète qui ne recharge plus sa scène 3D à chaque redimensionnement, et des rapports repensés pour se lire d'un coup d'œil : voici ce qui change pour un joueur sur ordinateur.

## Quatre colonnes, un seul écran

### Une coquille pensée pour ne jamais scroller en bloc

Au-dessus de 1440px, l'écran se découpe en quatre colonnes fixées à la hauteur de la fenêtre : le rail de navigation, un sous-menu contextuel, le contenu de la page consultée, et le panneau planète. Seule la colonne de contenu défile, ce qui évite à un joueur de perdre de vue sa navigation ou sa planète en parcourant une longue liste de bâtiments ou de rapports.

### Un sous-menu qui s'ouvre au survol, sans navigation

Survoler une icône du rail déplie le sous-menu de cette section sans quitter la page en cours, après un court délai qui évite les ouvertures accidentelles au simple passage de la souris. Les filtres de page, comme le type de rapport ou la catégorie de quête, vivent désormais dans ce sous-menu et dans l'adresse de la page plutôt que dans un état local, ce qui les rend partageables et cohérents avec le bouton retour du navigateur.

## Un panneau planète enfin permanent

### La scène 3D ne se démonte plus à chaque pixel

Avant cette interface, le panneau planète reconstruisait entièrement sa scène 3D, textures et champ d'étoiles compris, à chaque pixel de redimensionnement de la fenêtre. Sur l'interface desktop, la scène se monte une seule fois pour toute la session : redimensionner ou naviguer entre les pages ne la fait plus jamais recalculer depuis zéro.

### Une barre de ressources qui suit le rail

La barre de ressources du panneau planète se détache de son bord supérieur pour s'aligner avec le logo du rail de navigation, ce qui unifie visuellement les deux colonnes fixes de l'interface plutôt que de les traiter comme deux blocs indépendants.

## Des rapports repensés pour l'écran large

### Une page dédiée plutôt qu'une fenêtre superposée

Un rapport de mission s'ouvre désormais sur sa propre page plutôt que dans une fenêtre superposée au reste de l'écran, et un rapport de combat se lit camp par camp : qui était présent, où, avec quel matériel, chaque camp affichant ses unités en tableau et ses pertes totales juste en dessous.

### Des actions regroupées dans un seul bloc

Les actions d'un rapport, simuler à nouveau, partager avec l'alliance ou supprimer, se rassemblent dans un seul bloc d'icônes accolé au titre de la page plutôt que dispersées en boutons séparés. La conclusion du rapport, comme une défaite ou une position repérée, devient le titre du corps du rapport plutôt qu'une ligne isolée sous le titre de la page, et la liste des unités ne se cache plus derrière un bouton "tout afficher".

## Conclusion

Cette interface desktop ne se contente pas d'élargir l'affichage mobile : elle repense la navigation, la lecture des rapports et la scène 3D pour un grand écran, tout en laissant l'expérience mobile-first parfaitement intacte en dessous de 1440px. Deux interfaces, une seule stratégie derrière chacune.
