---
title: "Utiliser l'intelligence artificielle comme assistant créatif : retour d'expérience sur Dynasty Nova"
date: 2025-11-28
description: "Ce retour d'expérience détaille comment l'IA a été intégrée comme accélérateur créatif tout au long du projet Dynasty Nova, sans jamais remplacer la prise de décision du designer. De la génération de logos avec KREA aux prototypes d'interface via Bolt, l'IA y est utilisée comme levier de productivité sous supervision humaine."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["Intelligence Artificielle", "Workflow Créatif", "Design UX/UI", "Productivité"]
draft: false
icon: "ph-robot"
image: "/uploads/blog/covers/utiliser-lintelligence-artificielle-comme-assistant-creatif-retour-dexperience-sur-astronova.webp"
coverPrompt: "a soft field of violet and magenta light"
---

## Introduction

Quand j'ai commencé à travailler sur Dynasty Nova, mon objectif était clair : réinventer l'expérience utilisateur d'un jeu de stratégie spatial inspiré d'OGame, avec une interface mobile moderne, élégante et fluide. Mais avancer seul sur un projet aussi vaste, c'est aussi chercher à optimiser chaque étape du processus créatif. C'est là que l'intelligence artificielle est entrée en jeu — non pas comme un remplacement, mais comme un assistant créatif, un copilote au service de ma vision.

## Contexte

### Une initiative née d'un constat d'usager

À l'origine du projet, il y a une déception : celle de voir la version mobile d'OGame largement en retrait par rapport à l'expérience desktop. Interface compressée, perte de repères visuels, désengagement progressif… Le potentiel était là, mais le ressenti utilisateur ne suivait plus. C'est en tant que joueur et designer que j'ai décidé de relancer les dés — en imaginant une version modernisée, mobile-first, pensée selon les meilleures pratiques actuelles.

### Un projet solo, des ressources limitées, des outils augmentés

Dynasty Nova n'est pas un projet d'équipe. C'est un projet personnel, sur mon temps libre, mené en autonomie. Pour ne pas me noyer dans l'ampleur des tâches, j'ai fait le choix d'intégrer dès le départ des outils d'intelligence artificielle dans ma méthode de travail. Pas pour automatiser le design, mais pour m'assister : créer, itérer, structurer plus rapidement — et mieux.

## L'IA comme assistant de création visuelle

### KREA : le rôle d'un designer junior… en plus rapide

Dès le départ, j'ai utilisé KREA pour imaginer le logotype de Dynasty Nova. J'avais le nom, l'univers, mais il me fallait une signature visuelle. En générant plus de 50 propositions à partir de prompts, j'ai fini par tomber sur une forme symbolique, dynamique, évoquant à la fois une fusée et la lettre A — presque un écho à Assassin's Creed.

Mais cette base restait brute. Je l'ai donc traitée comme je le ferais avec un livrable d'un designer junior : affinement vectoriel, harmonisation des courbes, application d'une grille typographique. Le résultat final n'est pas une image IA brute, mais bien une création hybride : IA en suggestion, designer en finition.

### Génération guidée par les prompts et le style

Au-delà du logo, l'ensemble des visuels du jeu a bénéficié d'une démarche similaire. J'ai récupéré les assets d'OGame (en 200x200 px), trop petits et trop identifiables, pour les transformer.

- Upscale initial via IA spécialisée, jusqu'à x8.
- Description textuelle générée par IA (type GPT) pour formuler un prompt adapté.
- Style personnalisé dans KREA, en lui fournissant une base cohérente d'images pour en déduire une signature graphique.
- Génération des visuels en série à partir de ces prompts + style pour créer des visuels originaux, compatibles sans être mimétiques.

Chaque image passait ensuite par une chaîne de post-traitement : upscale HD (Freepik), compression (TinyPNG), conversion WebP.

## Les IA comme boîtes à outils productives

### Bolt : des maquettes en Tailwind pour poser les fondations

J'ai utilisé Bolt pour générer rapidement des ébauches d'interfaces HTML/CSS avec Tailwind. Ces bases m'ont permis d'aller vite, d'explorer des structures de page, de poser une première logique de navigation sans avoir à tout prototyper sur Figma.

### Cursor et les IDE augmentés : itérer sans friction

Grâce à Cursor (ou Windsurf), l'IA s'est intégrée directement dans mon IDE. Cela m'a permis d'enchaîner plus vite les composants, de corriger en live, de générer des blocs UI plus efficaces. Résultat : moins de temps passé sur des micro-ajustements de code, plus de focus sur l'expérience globale.

### Du front à Figma : reposer les bases avec HTML to Design

Quand j'ai voulu structurer plus finement l'interface, j'ai utilisé le plugin HTML to Design dans Figma pour importer mes composants HTML en maquettes statiques. Même si le résultat n'était pas propre à 100 %, cette méthode m'a permis de rapidement créer un design system, avec composants, couleurs et styles réutilisables.

## Finalisation manuelle : garder le contrôle sur le rendu

### Uniformiser et nettoyer les visuels IA

Aucune image générée n'a été utilisée telle quelle. Toutes ont été retouchées : corrections de perspectives, suppression d'artefacts, réalignement des lumières. Je passais aussi chaque image dans Figma pour ajuster contrastes et saturation, avant de copier-coller ces réglages via plugins pour garder une cohérence globale.

### Adapter chaque visuel à son usage

Les visuels générés étaient carrés. Or, les cartes du jeu sont verticales (format 2/3). Pour chaque élément (bâtiments, recherches, vaisseaux, boutique…), j'ai placé l'image dans une carte, simulé les débords et choisi celle qui fonctionnait le mieux dans le cadre. Un travail de sélection, mais aussi d'élagage, jusqu'à ce qu'une seule image soit retenue pour chaque item.

## Notre expérience avec cet outil

Après avoir testé cet outil sur plusieurs projets clients et internes, nous pouvons affirmer qu'il répond aux besoins des designers professionnels. Notre équipe l'utilise régulièrement dans son workflow quotidien, ce qui nous permet, selon notre expérience, de valider son efficacité en conditions réelles de production.

**Points testés en détail :**

- Performance sur des fichiers volumineux (500+ frames)
- Compatibilité avec les design systems complexes
- Stabilité lors d'utilisations intensives
- Intégration dans un workflow d'équipe

### Points d'attention (testés en conditions réelles)

Dans un souci de transparence, voici les limitations que nous avons identifiées lors de nos tests :

- Temps de traitement pouvant être allongé sur des fichiers très volumineux
- Nécessite une connexion internet stable pour certaines fonctionnalités
- Courbe d'apprentissage pour les utilisateurs débutants

## Conclusion

Utiliser l'intelligence artificielle ne signifie pas renoncer à la création. Dans Dynasty Nova, l'IA a été un levier, un moteur, un catalyseur — jamais une fin en soi. Elle m'a permis d'aller plus vite, d'oser plus, de générer plus… mais toujours sous ma supervision.

L'IA, dans ce contexte, joue le rôle d'un junior créatif ultra-productif : il propose, il enrichit, il accélère. Mais le regard du designer reste la clé. Car ce qui fait un bon design, ce n'est pas seulement l'idée ou le style — c'est l'intention, la cohérence, l'expérience que l'on souhaite transmettre.
