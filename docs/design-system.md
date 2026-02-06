# Design System Astro Nova

Ce document définit les principes visuels, les tokens sémantiques et les règles d'accessibilité appliqués au jeu.

## 1. Principes Visuels

L'identité visuelle cible un univers **spatial futuriste et immersif**. Elle repose sur :
- **Immersion spatiale** : Fonds sombres avec effets de profondeur (étoiles, nébuleuses).
- **Clarté UI** : Interfaces épurées avec hiérarchie visuelle forte.
- **Feedback visuel** : Animations et transitions qui renforcent les actions du joueur.
- **Éléments holographiques** : Styles futuristes avec effets de brillance et de transparence.

## 1.1 Framework CSS

Le projet utilise **Tailwind CSS** comme framework de styling principal.
- Configuration : `tailwind.config.js`
- Classes utilitaires pour espacement, couleurs et typographie
- Support natif du responsive design

## 2. Palette de Couleurs

Le système utilise des variables CSS pour une maintenance facilitée et un support natif du mode sombre.

| Token | Usage | Valeur |
| :--- | :--- | :--- |
| `--bg` | Fond principal | Slate 950 (très sombre) |
| `--surface` | Fond des cartes | Slate 800/900 avec glassmorphism |
| `--surface-glass` | Éléments flottants | Blanc/Slate avec opacité 10-20% |
| `--text` | Texte principal | Slate 100-200 |
| `--text-muted` | Texte secondaire | Slate 400-500 |
| `--primary` | Accent principal (Tech) | Bleu #4789C8 / Cyan |
| `--secondary` | Accent secondaire (Action) | Violet #8B5CF6 |
| `--accent` | Éléments importants | Turquoise #14B8A6 |
| `--success` | État positif | Vert émeraude |
| `--warning` | Alerte | Orange ambre |
| `--danger` | Erreur / Combat | Rouge corail |
| `--metal` | Ressource métal | Gris argenté |
| `--crystal` | Ressource cristal | Bleu cyan |
| `--hydrogene` | Ressource hydrogène | Vert émeraude |
| `--energy` | Énergie | Jaune doré |
| `--border` | Bordures subtiles | Slate 700 avec opacité |

## 3. Typographie

### Police principale
- **Famille** : **Lexend** (Google Fonts)
- **Fallback** : sans-serif
- **Graisses** : 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Configuration Tailwind** : `fontFamily.sans: ['Lexend', 'sans-serif']`

### Police secondaire
- **Noto Sans Cuneiform** : Pour éléments décoratifs spéciaux

### Échelle typographique
| Classe | Taille | Usage |
| :--- | :--- | :--- |
| `text-xs` | 12px | Labels, badges |
| `text-sm` | 14px | Texte secondaire, infobulles |
| `text-base` | 16px | Corps de texte |
| `text-lg` | 18px | Titres de cartes |
| `text-xl` | 20px | Titres de sections |
| `text-2xl` | 24px | Titres de pages |
| `text-3xl` | 30px | Titres importants |
| `text-4xl` | 36px | Titres principaux |

## 4. Accessibilité (WCAG 2.2 AA)

Le jeu est conçu pour être inclusif.

### Contrastes
- Tous les couples texte/fond dépassent un ratio de **4.5:1**.
- Les ressources utilisent des icônes en plus des couleurs.

### Navigation Clavier
- **Focus Visible** : Anneau de focus bleu/cyan hautement contrasté.
- **Ordre de tabulation** : Logique de gauche à droite, haut en bas.
- **Raccourcis clavier** : Pour les actions fréquentes (à documenter).

### Mouvement
- Respect de `prefers-reduced-motion`.
- Les animations critiques sont simplifiées si demandé.

## 5. Composants UI

### Boutons
| Variante | Usage |
| :--- | :--- |
| `btn-primary` | Actions principales (Construire, Lancer) |
| `btn-secondary` | Actions secondaires |
| `btn-ghost` | Actions tertiaires, navigation |
| `btn-danger` | Actions destructrices (Annuler, Attaquer) |
| `btn-disabled` | État désactivé (avec tooltip explicatif) |

### Cartes
- Bordures légères avec effet de brillance subtil.
- Coins arrondis (`rounded-xl` à `rounded-2xl`).
- Fond glassmorphism avec backdrop-blur.
- Ombre douce au survol.

### Barres de progression
- Utilisées pour : construction, recherche, production.
- Animation fluide de remplissage.
- Couleur selon le type d'action.

### Modales
- Overlay sombre avec blur.
- Animation d'entrée/sortie (scale + fade).
- Bouton de fermeture toujours visible.

## 6. Iconographie

### Système d'icônes
- **Bibliothèque principale** : Phosphor Icons
- **Style** : Regular ou Bold selon l'importance
- **Taille** : 16px (inline), 20px (boutons), 24px (navigation)

### Icônes par catégorie
| Catégorie | Exemples |
| :--- | :--- |
| Ressources | Icônes custom pour métal, cristal, hydrogène, énergie |
| Navigation | Planet, Rocket, Flask, Shield |
| Actions | Plus, Minus, Play, Stop, Check |
| États | CheckCircle, Warning, XCircle |

## 7. Effets et Animations

### Micro-interactions
- Hover sur les boutons : scale 1.02 + brightness
- Hover sur les cartes : élévation + bordure illuminée
- Clic : feedback tactile (scale 0.98)

### Transitions page
- Fade-in du contenu principal
- Slide-in des panneaux latéraux

### Animations de gameplay
- Pulsation douce pour éléments en cours (construction, recherche)
- Compte à rebours animé
- Particules spatiales en arrière-plan (optionnel)

## 8. Bonnes Pratiques

1. **Utiliser les tokens** : Ne jamais coder de couleurs en dur.
2. **Espacement cohérent** : Multiples de 4 ou 8 (grille Tailwind).
3. **Hiérarchie claire** : Titres, sous-titres, corps dans l'ordre logique.
4. **Images optimisées** : WebP avec alt descriptif.
5. **Responsive** : Mobile-first, adaptation desktop.
6. **Accessibilité** : Toujours tester au clavier.

---
