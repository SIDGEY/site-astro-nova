---
title: "Travailler autrement l’UI Kit : une démarche de fond centrée sur l’usage réel"
description: "Depuis plusieurs semaines, l’équipe Design d’Atecna mène une réflexion approfondie sur la documentation du design system d’un grand acteur de la dist..."
date: 2025-07-08
author: "Atecna Team"
coAuthors: []
tags: ["design", "documentation design system", "figma", "UI kit", "UX"]
draft: false
seo:
  title: "Travailler autrement l’UI Kit : une démarche de fond centrée sur l’usage réel"
  description: "Depuis plusieurs semaines, l’équipe Design d’Atecna mène une réflexion approfondie sur la documentation du design system d’un grand acteur de la dist..."
---

Depuis plusieurs semaines, l’équipe [Design](https://www.atecna.fr/nos-domaines-dexpertises/ux-design/?pk_vid=507d649d23e0bd7a17519770408be34d) d’Atecna mène une réflexion approfondie sur la documentation du design system d’un grand acteur de la distribution. Dans un contexte où les enjeux **UI/UX** sont devenus essentiels pour garantir cohérence et performance sur les interfaces digitales, il devenait nécessaire de repenser l’approche.

### Un design system existant, mais fragmenté

Le client disposait d’un **design system spécifique** pour son site e-commerce national, distinct de celui utilisé à l’international. Ce système, opérationnel dans Figma, manquait cependant d’une documentation claire, accessible et directement connectée à la réalité de la production.

Face à ce constat, l’équipe a lancé une démarche : ne plus se limiter à une bibliothèque de composants, mais construire une documentation structurée, fidèle à l’existant, évolutive et exploitable par toutes les parties prenantes.

### Départ du travail : analyser le « ploproduit »

Le point de départ a été l’un des composants les plus emblématiques : la carte produit, surnommée **ploproduit**. Présente sur quasiment toutes les pages (listing, home, panier, checkout, mises en avant, etc.), elle constituait un cas d’usage idéal pour structurer la documentation par l’exemple.

Le travail a consisté à :

*   Recenser toutes les occurrences et variantes du composant
*   Analyser les déclinaisons selon les supports (desktop, mobile web, application)
*   Identifier les écarts d’UX, de hiérarchie d’information ou d’affordance
*   Décomposer le composant en 3 niveaux :

*   *   **Niveau 0 :** le composant global
    *   **Niveau 1 :** ses sections (média, prix, description, actions…)
    *   **Niveau 2 :** les éléments unitaires (flap, icône, libellé…)

### Automatiser la matière brute avec HTML2Design

Pour gagner du temps, l’équipe a utilisé un plugin Figma, HTML2Design, afin d’importer directement des pages de production en fichiers design. Cette méthode a permis d’ancrer la documentation dans la réalité des interfaces déjà en ligne, et non uniquement dans des maquettes théoriques.

### Tester l’IA avec Figma Make

Dans un second temps, l’équipe a mené des expérimentations avec Figma Make, un outil récent permettant de générer des sites à partir d’instructions ou de fichiers Figma. L’objectif : transformer la documentation en site consultable et partageable à toute l’équipe, sans compte Figma.

Cependant, cette approche IA a montré ses limites :

*   Temps de réponse long pour des modifications simples
*   Résultats parfois enrichis sans cohérence avec le besoin initial
*   Difficulté de maintenir une qualité constante sans expertise technique

### Recentrage sur Figma Site pour une approche pérenne

Suite à ces constats, l’équipe a décidé de basculer vers Figma Site, un outil plus collaboratif et maîtrisable. Il permet de construire une documentation structurée, modulaire et fidèle aux usages de Figma Design.

Cette nouvelle base offre plusieurs avantages :

*   Une architecture claire et modulaire, pensée en niveaux (composant > section > élément)
*   Un rendu consultable librement, sans compte requis
*   Une accessibilité renforcée pour tous les designers de l’équipe
*   Une proximité directe avec la logique Figma Design (components, variants, styles, etc.)

### Et maintenant ?

Le chantier se poursuit avec une nouvelle interface déjà bien avancée dans Figma Site.

L’équipe est en train de finaliser les pages liées au « ploproduit », et elle prévoit des ateliers de synchronisation réguliers avec l’équipe design pendant les congés de la responsable du sujet.

En parallèle, l’équipe organise des sessions de montée en compétence sur l’IA afin de partager les enseignements autour de Figma Make et des outils génératifs.

Cette démarche itérative pose les bases d’une documentation évolutive, collaborative et réellement alignée avec les usages et les réalités du terrain.
