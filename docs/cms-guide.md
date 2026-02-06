# Guide de Gestion du Contenu - Astro Nova

Ce document décrit comment gérer et modifier le contenu du jeu et de la landing page.

## 1. Architecture du Contenu

Astro Nova utilise une approche **code-first** pour la gestion du contenu :

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

Les sections de la landing page sont des composants React dans :
```
src/features/landing/
├── components/
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   └── ...
└── LandingPage.tsx
```

### Modifier le contenu
1. Ouvrir le composant concerné
2. Modifier le texte ou les données
3. Vérifier le rendu en local (`npm run dev`)
4. Déployer

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
- `.env.development` : Développement local
- `.env.production` : Production
- `.env.example` : Template pour les nouveaux développeurs

### Variables importantes
```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_USE_EMULATOR=true/false
```

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

# Déploiement Firebase
npm run deploy
```

### Checklist avant déploiement
- [ ] Tests passent
- [ ] Build sans erreurs
- [ ] Contenu vérifié en local
- [ ] Images optimisées
- [ ] Traductions complètes

---
