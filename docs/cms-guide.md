# Guide de Gestion du Contenu - Dynasty Nova

Ce document décrit comment gérer et modifier le contenu du jeu et de la landing page.

## 1. Architecture du Contenu

Dynasty Nova utilise une approche **code-first** pour la gestion du contenu :

- **Données de jeu** : Fichiers TypeScript dans `src/data/`
- **Traductions** : Fichiers JSON dans `src/locales/`
- **Assets visuels** : Images dans `public/`
- **Configuration** : Fichiers dans la racine du projet

## 2. Modifier les Données de Jeu

### Bâtiments

Fichier : `src/data/buildingsData.ts`

```typescript
// Exemple de structure
export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 1,
    name: 'Excavateur minéral',
    type: BuildingTypeEnum.PRODUCTION,
    baseCost: costToResources({ metal: 60, crystal: 15, hydrogene: 0, energy: 0 }),
    costFactor: 1.5,
    maxLevel: 50,
    requirements: []
  }
  // ...
];
```

### Technologies

Fichier : `src/data/researchData.ts`

- Modifier les coûts, effets et prérequis directement dans le fichier.
- Les changements sont appliqués au prochain build.

### Vaisseaux et Défenses

Fichiers : `src/data/shipsData.ts`, `src/data/defenseData.ts`

## 3. Modifier les Textes

### Traductions i18n

Dossier : `src/i18n/locales/fr/` (ou autre langue)

Structure recommandée :
```
src/i18n/locales/
├── fr/
│   ├── buildings.json    # Noms et descriptions bâtiments
│   ├── researches.json   # Noms et descriptions recherches
│   ├── defenses.json     # Noms et descriptions défenses
│   └── pages/            # Textes par page
├── en/
│   └── ...
└── es/
    └── ...
```

### Bonnes pratiques
- Utiliser des clés descriptives : `name.metal_mine`, `description.metal_mine`
- Éviter les textes trop longs dans les JSON
- Tester les traductions dans l'interface

## 4. Modifier la Landing Page

### Sections principales

La home est `src/content/pages/home.md` : une liste de blocs (`type: …`) rendus par
`src/components/BlockRenderer.astro`, un composant par type dans `src/components/blocks/`.

### Les écrans du jeu (blocs `featurePhone`, carrousels)

Les téléphones de la home ne sont **pas des captures** : ce sont les écrans du jeu reconstruits en
HTML (`src/components/game/`), avec les classes du design system du jeu (Astrolabe) et ses vraies
images, noms et descriptions. Le contenu ne nomme qu'une famille et des codes d'entités :

```yaml
- type: featurePhone
  family: buildings          # resources | buildings | facilities | defenses | ships | shop
  items: [metal_mine, crystal_mine, hydrogen_synthesizer, solar_plant]
  reversed: false

- type: carousel
  source: research           # research | avatars (items: codes pour restreindre/ordonner, limit)
```

Le reste en découle : vignettes, fiche de chaque entité, page de liste, fond de section (la bannière
de page du jeu), compteur « +N ». Un code inconnu fait échouer le build avec la liste des codes
valides. Niveaux, coûts et stocks affichés sont des valeurs d'illustration, fixées dans
`src/components/game/FeatureScreens.astro` et `ScreenTopBar.astro` (le jeu les reçoit de l'API).

### Suivre les évolutions du jeu

```bash
npm run game:sync -- --fetch
```

`scripts/sync-game.mjs` lit le jeu sur `origin/main` (`../Frontend`, jamais la copie de travail),
les avatars en ligne dans la dernière livraison du codex (`../dynasty-nova-codex`), et réécrit
`src/data/game.json` (le catalogue, avec le commit du jeu) et `public/game/` (images redimensionnées,
textures de la planète 3D). Les deux sont versionnés : la CI de déploiement n'a pas les autres dépôts.
Chemins et ref surchargeables : `FRONTEND_PATH`, `CODEX_PATH`, `GAME_REF`.

Les visuels du hero (`gameHero`) et de la communauté (`community`) sont des bannières de page du
jeu, nommées par `banner:` (`quests`, `alliance`, … — les noms des fichiers sous
`src/assets/images/heroes/` du jeu). Un chemin écrit à la main reste possible (`backgroundImage:`,
`image:`).

La planète 3D (`block3D`) tourne sur le moteur du jeu lui-même : `PlanetSurface`, copié par la
synchro dans `src/vendor/game/` (ne pas modifier ces fichiers), dans la scène que le codex rejoue
(`Planete3D.astro`). Nuages et voile viennent de l'`atmosphere.json` de chaque biome. `three` doit
rester à la version du jeu (`source.three` dans `game.json`).

Si le jeu change la **mise en page** d'un écran (pas seulement ses images ou ses textes), c'est le
composant correspondant de `src/components/game/` qu'il faut retoucher ; chacun cite en en-tête le
composant du jeu qu'il reproduit.

### Modifier le contenu
1. Modifier `src/content/pages/home.md`
2. Vérifier le rendu en local (`npm run dev`)
3. Pousser sur `main` (déploiement FTP automatique)

## 5. Ajouter des Images

### Processus
1. Préparer l'image au bon format (WebP recommandé)
2. Optimiser (max 200KB pour les images UI, 500KB pour les arrière-plans)
3. Placer dans le bon dossier `public/`
4. Référencer avec le chemin absolu (`/buildings/metal-mine.webp`)

### Conventions de nommage
- Tout en minuscules
- Tirets pour séparer les mots : `crystal-mine-level-3.webp`
- Suffixe de taille si plusieurs versions : `hero-bg-mobile.webp`

## 6. Variables d'Environnement

### Fichiers concernés
- `.env` : Développement local (jamais commité)
- `.env.example` : Template pour les nouveaux développeurs

### Variables importantes
Voir `.env.example` : elles ne servent qu'aux scripts d'analyse et de génération
(`scripts/`), le site statique lui-même n'a aucune variable d'environnement.

## 7. Workflow de Modification

### Pour une modification mineure (texte, valeur)
1. Modifier le fichier concerné
2. Tester en local
3. Commit et push
4. Vérifier en staging/production

### Pour une modification majeure (nouvelle fonctionnalité)
1. Créer une branche feature
2. Implémenter les changements
3. Tester localement
4. Créer une Pull Request
5. Review et merge
6. Déployer

## 8. Mise en Production

### Commandes
```bash
# Build de production
npm run build
```

Le déploiement est automatique : un push sur `main` déclenche le workflow
`.github/workflows/deploy.yml`, qui build le site et l'envoie en FTP sur OVH.

### Checklist avant déploiement
- [ ] Tests passent
- [ ] Build sans erreurs
- [ ] Contenu vérifié en local
- [ ] Images optimisées
- [ ] Traductions complètes

---
