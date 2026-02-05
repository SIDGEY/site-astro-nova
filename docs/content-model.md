# Modèles de Contenu - Astro Nova

Ce document décrit les différentes structures de données utilisées pour le contenu du jeu et de la landing page.

## 1. Données de Jeu (Firestore)

### Structure principale

Voir `FIRESTORE_STRUCTURE.md` pour la documentation complète de la base de données.

### Collections de contenu statique

#### `buildings`
Bâtiments constructibles sur les planètes.
- **Dossier source** : `src/data/buildingsData.ts`
- **Champs clés** :
  - `id` : Identifiant unique du bâtiment
  - `name` : Nom affiché (ex: "Excavateur minéral", "Centre d'innovation")
  - `description` : Description immersive
  - `type` : Type (PRODUCTION, ENERGY, STORAGE, FACILITY, RESEARCH, RESOURCE, SHIPYARD)
  - `baseCost` : Coût de base { metal, crystal, hydrogene, energy }
  - `costFactor` : Multiplicateur de croissance
  - `maxLevel` : Niveau maximum
  - `requirements` : Prérequis (bâtiments, technologies)
  - `production` : Fonctions de calcul de production

#### `technologies`
Recherches disponibles au centre d'innovation.
- **Dossier source** : `src/data/researchData.ts`
- **Champs clés** :
  - `id` : Identifiant unique
  - `name` : Nom de la technologie (ex: "Science Énergétique", "Calcul Quantique")
  - `description` : Description courte
  - `longDescription` : Description détaillée
  - `type` : Type (ENERGY, LASER, ION, etc.)
  - `category` : Catégorie (ENERGY, COMPUTER, DRIVE, WEAPONS, DEFENSE, EXPLORATION)
  - `baseCost` : Coût de base { metal, crystal, hydrogene, energy }
  - `costFactor` : Multiplicateur (généralement 2.0)
  - `maxLevel` : Niveau maximum
  - `requirements` : Prérequis
  - `effects` : Effets par niveau

#### `ships`
Vaisseaux constructibles au dock orbital.
- **Dossier source** : `src/data/shipsData.ts`
- **Champs clés** :
  - `id` : Identifiant unique
  - `name` : Nom du vaisseau (ex: "Intercepteur", "Cargo stellaire")
  - `description` : Description et rôle
  - `category` : Catégorie (civil, combat, special)
  - `baseCost` : Coût de construction { metal, crystal, hydrogene }
  - `structuralIntegrity` : Points de structure
  - `weaponPower` : Puissance d'attaque
  - `shieldPower` : Puissance de bouclier
  - `speed` : Vitesse de base
  - `capacity` : Capacité de fret
  - `consumption` : Consommation d'hydrogène
  - `requirements` : Prérequis
  - `reactorType` : Type de réacteur (Combustion, Impulsion, Hyperspace)

#### `defenses`
Défenses planétaires.
- **Dossier source** : `src/data/defenseData.ts`
- **Champs clés** :
  - `id` : Identifiant unique
  - `name` : Nom de la défense (ex: "Projecteur balistique", "Canon photonique")
  - `description` : Description
  - `baseCost` : Coût de construction { metal, crystal, hydrogene }
  - `structuralIntegrity` : Points de structure
  - `weaponPower` : Puissance d'attaque
  - `shieldPower` : Puissance de bouclier
  - `requirements` : Prérequis

## 2. Contenu Landing Page

### Pages statiques
- **Dossier** : `src/pages/` (routes publiques)
- **Format** : React/TypeScript avec CSS

### Sections de la landing

```typescript
interface HeroSection {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

interface FeatureSection {
  title: string;
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
}

interface TestimonialSection {
  title: string;
  testimonials: {
    quote: string;
    author: string;
    avatar?: string;
  }[];
}
```

## 3. Internationalisation (i18n)

### Structure des traductions
- **Dossier** : `src/i18n/locales/`
- **Langues** : fr, en, es
- **Format** : JSON avec clés imbriquées

```json
{
  "name": {
    "metal_mine": "Excavateur minéral",
    "crystal_mine": "Extracteur cristallin",
    "hydrogen_synthesizer": "Condensateur d'hydrogène",
    "solar_plant": "Capteurs photovoltaïques",
    "research_lab": "Centre d'innovation",
    "shipyard": "Dock orbital"
  },
  "description": {
    "metal_mine": "Les excavateurs minéraux constituent..."
  }
}
```

## 4. Assets et Médias

### Images
- **Dossier** : `public/` (statiques), `src/assets/` (importées)
- **Formats** : WebP (préféré), PNG pour transparence, SVG pour icônes
- **Naming** : kebab-case (ex: `metal-mine-level-5.webp`)

### Catégories d'assets
| Dossier | Contenu |
| :--- | :--- |
| `public/assets/images/buildings/` | Images des bâtiments |
| `public/assets/images/ships/` | Images des vaisseaux |
| `public/assets/images/research/` | Icônes des technologies |
| `public/assets/images/facilities/` | Images des installations |
| `public/landing/` | Images marketing |

## 5. Comment ajouter du contenu ?

### Pour un nouveau bâtiment
1. Ajouter l'entrée dans `src/data/buildingsData.ts`.
2. Ajouter les traductions dans `src/i18n/locales/fr/buildings.json`.
3. Ajouter l'image dans `public/assets/images/buildings/`.
4. Mettre à jour le Game Design Document si nécessaire.

### Pour une nouvelle page publique
1. Créer le composant dans `src/pages/`.
2. Ajouter la route si nécessaire.
3. Vérifier le SEO (title, meta, etc.).

### Pour modifier le contenu de la landing
1. Modifier les sections dans les composants concernés.
2. Mettre à jour les traductions.
3. Vérifier le rendu responsive.

---
