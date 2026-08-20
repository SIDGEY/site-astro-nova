# Lignes directrices GEO (Generative Engine Optimization)

Le SEO classique optimise pour être **classé** dans une liste de liens bleus. Le GEO
optimise pour être **cité** — repris textuellement ou paraphrasé — dans une réponse
générée par ChatGPT, Perplexity, les AI Overviews de Google, etc. C'est un objectif
distinct qui demande une structure d'écriture différente, en complément (jamais au
détriment) de `docs/charte_editoriale.md` qui cadre le ton et la voix.

## Pourquoi ça compte pour Dynasty Nova

Les joueurs qui découvrent un nouveau jeu passent de plus en plus par une question
posée à une IA plutôt que par une recherche classique ("un jeu comme OGame mais plus
moderne ?", "jeu de stratégie spatiale gratuit navigateur ?"). Si Dynasty Nova ne peut
pas être cité en réponse, cette acquisition entière échappe au site — quel que soit
son classement Google.

## Principes de structure citable

### 1. Réponse directe en ouverture

Chaque section (`##`/`###`) doit répondre à sa propre question **dans sa première
phrase**, avant tout développement narratif. Un moteur génératif extrait rarement une
réponse enfouie au 3e paragraphe.

> ❌ "Depuis des années, les jeux de stratégie spatiale fascinent les joueurs du monde
> entier, et Dynasty Nova s'inscrit dans cette tradition en proposant..."
>
> ✅ "Dynasty Nova est un jeu de stratégie spatiale 4X par navigateur, gratuit,
> inspiré d'OGame. [développement ensuite]"

### 2. Définitions nettes, réutilisables hors contexte

Une phrase qui reste vraie et compréhensible même extraite de son paragraphe est une
phrase citable. Éviter les références anaphoriques ("cela", "ce système") dans les
phrases candidates à la citation — nommer explicitement le sujet.

### 3. Format Question/Réponse structuré (FAQPage)

- Chaque page à fort potentiel d'acquisition (FAQ, articles de blog visant une
  requête comparative ou définitionnelle) doit porter 3-5 questions/réponses.
- Techniquement : le champ `faq` du frontmatter (`articlesCollection`,
  `src/content.config.ts`) ou un bloc `type: "faq"` dans les pages CMS — les deux
  génèrent automatiquement un schéma `FAQPage` via `getFaqSchema()`
  (`src/lib/seo.ts`), injecté par `SEO.astro`.
- Une question = **la formulation exacte qu'un joueur taperait** (dans un moteur de
  recherche ou à une IA), pas une reformulation éditorialisée.
- Une réponse = 1 à 3 phrases, complète et autonome, sans renvoi ("voir plus haut").

### 4. Comparaisons et listes structurées

Les moteurs génératifs extraient très bien les tableaux et listes à puces pour
répondre à des requêtes comparatives ("X vs Y", "alternatives à X"). Pour un article
`research` comparant Dynasty Nova à un autre jeu (OGame, Forge of Empires...),
préférer une liste ou un tableau à un paragraphe narratif pour les points de
comparaison factuels — la prose reste pour le contexte et la voix éditoriale autour.

### 5. Données structurées globales déjà en place

- **`VideoGame`** (`getVideoGameSchema()`) — injecté sur toutes les pages,
  décrit Dynasty Nova lui-même (genre, plateforme). Ne rien dupliquer côté contenu :
  ce schéma couvre déjà "qu'est-ce que Dynasty Nova".
- **`Article`** — sur chaque billet de blog (`blog/[...slug].astro`), avec date et
  auteur réels.
- **`FAQPage`** — voir §3.

## Ce qu'on ne fait PAS

- On ne sacrifie jamais le ton de `docs/charte_editoriale.md` pour la citabilité —
  une réponse directe peut rester épique et incarnée ("Dans Dynasty Nova, vous ne
  gagnez pas en cliquant plus vite — vous gagnez en anticipant.").
- On n'invente pas de fausses questions pour gonfler une FAQ. Une question sans vraie
  demande (vérifiable dans le backlog GSC/beryldesign, voir le skill `dynasty-article`)
  ne mérite pas sa place.
- Pas de `llms.txt` pour l'instant (section 9 de `docs/seo-checklist.md`) — à
  réévaluer si le trafic issu des moteurs génératifs devient mesurable dans GA4.
