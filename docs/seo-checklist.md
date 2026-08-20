# Checklist SEO Dynasty Nova

Cette checklist répertorie les éléments SEO implémentés et à vérifier pour la landing page et les pages publiques du jeu.

## 1. Meta-données de base
- [x] **Title Tag** : Format `Titre de la Page | Dynasty Nova - Jeu de Stratégie Spatiale`.
- [x] **Meta Description** : Unique, entre 140 et 160 caractères, incitant au jeu.
- [x] **Canonical URL** : URL absolue pointant vers la version de référence de la page.
- [x] **Robots Meta** : Par défaut `index, follow`. `noindex` pour les pages de jeu authentifiées.

## 2. Open Graph & Social
- [x] **og:title / og:description** : Reprennent les meta-données de base ou les personnalisent.
- [x] **og:type** : `website` pour la landing, `game` si supporté.
- [x] **og:image** : Image 1200x630px (bannière du jeu). Fallback sur `og-image.jpg`.
- [x] **Twitter Cards** : Format `summary_large_image`.

## 3. JSON-LD (Schema.org)
- [x] **Organization** : Informations sur l'éditeur du jeu.
- [x] **WebSite** : Présent sur la landing page.
- [x] **VideoGame** : `getVideoGameSchema()` dans `src/lib/seo.ts`, injecté site-wide via `SEO.astro` (corrigé le 20/08/2026 — cette case était cochée alors que le schéma n'existait pas encore).
- [x] **FAQ** : `getFaqSchema()` dans `src/lib/seo.ts`. Auto-injecté quand un bloc `faq` existe sur une page (`[...slug].astro`) ou quand un article de blog a un frontmatter `faq` (`blog/[...slug].astro`) — voir `docs/geo-guidelines.md`.

## 4. Structure & Contenu (Landing Page)
- [x] **Balise H1** : Une seule par page, contenant les mots-clés principaux.
- [x] **Hiérarchie des titres** : Utilisation logique (H2, H3) sans sauter de niveau.
- [x] **Attributs Alt** : Présents sur toutes les images (vaisseaux, planètes, etc.).
- [x] **Liens internes** : Maillage vers les sections importantes.

## 5. Technique & Performance
- [x] **Sitemap.xml** : Mis à jour avec les pages publiques.
- [x] **Robots.txt** : Déclare l'emplacement du sitemap, exclut `/app/` et les pages de jeu.
- [ ] **PWA Manifest** : Pour l'installation de l'application.
- [x] **Vitesse (LCP/CLS)** : Images optimisées, polices préchargées.

## 6. Mobile & Responsive
- [x] **Viewport** : Meta viewport correctement configuré.
- [x] **Touch-friendly** : Boutons suffisamment grands (min 44x44px).
- [x] **Responsive** : Affichage adapté mobile, tablette, desktop.

## 7. Accessibilité (A11y)
- [x] **Skip Links** : Permet de sauter la navigation au clavier.
- [x] **Sémantique HTML5** : Utilisation de `header`, `nav`, `main`, `section`, `footer`.
- [x] **Focus Visible** : Ring visible sur tous les éléments interactifs.
- [x] **ARIA Labels** : Pour les éléments interactifs sans texte visible.

## 8. Mots-clés cibles

### Primaires
- Jeu de stratégie spatiale
- Jeu de stratégie en ligne
- Jeu spatial gratuit
- Empire spatial

### Secondaires
- Jeu navigateur science-fiction
- Jeu de gestion de ressources
- Jeu multijoueur spatial
- Construire flotte spatiale

### Longue traîne
- Jeu comme OGame
- Jeu de stratégie tour par tour en ligne
- Jeu de colonisation spatiale gratuit

## 9. GEO (Generative Engine Optimization)
- [x] **FAQPage par page/article à fort potentiel** : voir `docs/geo-guidelines.md` pour la structure de contenu citable (réponse directe, définitions, format Q/R).
- [ ] **Audit régulier des citations IA** : vérifier périodiquement (ChatGPT/Perplexity/AI Overviews) si Dynasty Nova est cité sur les requêtes cibles de la section 8.
- [ ] **llms.txt** : pas encore mis en place — à évaluer si le trafic issu des moteurs génératifs devient significatif.

---
