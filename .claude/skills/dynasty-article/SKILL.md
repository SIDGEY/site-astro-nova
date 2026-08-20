---
name: dynasty-article
description: >-
  Génère des brouillons d'articles pour le blog dynastynova.com à partir de six
  signaux réels croisés : l'activité de dev du jeu (PR mergées sur Dynasty-Nova/Frontend
  et Dynasty-Nova/Backend), la performance GSC/GA4 propre à dynastynova.com, le capital
  de recherche legacy de play-astronova.com (ancienne marque), et le cluster "jeux" de
  beryldesign.fr (déjà spécialisé sur Dynasty Nova/OGame, 78% de ses clics). Trois modes
  de production (dev-diary, research, video/Vidiome). Toujours en brouillon
  (`draft: true`), lot ≤ 3 par run. Déclencher quand l'utilisateur veut « générer/proposer
  un article », « des idées de sujets », « un article sur une fonctionnalité du jeu »,
  ou nomme Vidiome / un sujet Dynasty Nova à traiter.
---

# dynasty-article — chaîne éditoriale dynastynova.com

Produit des **brouillons** (`draft: true`) prêts à relire — jamais de publication
auto. Le backlog persistant (`editorial/backlog.jsonl`) évite de reproposer un sujet
déjà traité ou rejeté.

**Trois points d'arrêt obligatoires** : ① validation du lot retenu (≤ 3 idées),
② validation des sources selon le mode, ③ confirmation finale avant de rendre la main.

Ce skill est une adaptation, à l'échelle de ce blog (~8 articles, 500-700 mots
chacun), du skill `beryl-article` du repo beryldesign — même politique
brouillon-first, même mécanique de backlog, mais sans le scoring pondéré par cluster
ni le pipeline de traduction EN (pas justifiés à ce corpus).

## Prérequis (vérifier une fois)

- `GSC_SERVICE_ACCOUNT_KEY_FILE` / `GSC_SITE_URL` et `GA4_SERVICE_ACCOUNT_KEY_FILE` /
  `GA4_PROPERTY_ID` dans `.env` — déjà configurés pour dynastynova.com (voir
  `.env.example`). Le même compte de service a aussi accès à `sc-domain:play-astronova.com`
  (passer `--site` à `gsc-fetch.mjs`) et à `sc-domain:beryldesign.fr` / la propriété
  GA4 de beryldesign (lus directement depuis le cache déjà présent sur disque dans
  son repo, pas besoin de re-fetch).
- `gh` authentifié avec accès aux repos `Dynasty-Nova/Frontend` et `Dynasty-Nova/Backend`
  (déjà le cas si `gh repo view Dynasty-Nova/Frontend` répond).
- `VIDIOME_API_KEY` dans `.env` — requis seulement pour le **mode `video`**. Prod :
  base par défaut `www.vidiome.com`, marche seulement si le backend Vidiome a un
  `OPENROUTER_API_KEY` valide côté Vercel (sinon `502 llm_provider_error`).

## Étape 0 — Rafraîchir les signaux

```bash
npm run gsc:fetch                                                  # dynastynova.com
node scripts/gsc-fetch.mjs --site sc-domain:play-astronova.com     # legacy Astro Nova
npm run ga4:fetch -- --host dynastynova.com                        # isole le nouveau site dans la propriété partagée
npm run game:fetch                                                  # PR mergées, les 2 repos du jeu
npm run ideas -- --generate --apply                                 # combine tout dans le backlog
```
Beryldesign (signal 5) n'a pas besoin d'être re-fetché : `dynasty-ideas.mjs` lit
directement le cache déjà présent dans son repo (`.gsc-cache`/`.ga4-cache`), rafraîchi
par leur propre skill `beryl-article`.

## Étape 1 — Choisir le lot (point d'arrêt ①)

### Mode dirigé — l'utilisateur a déjà dit « je veux un article sur X »

Vérifier que X se rattache à la phrase mère de `docs/charte_editoriale.md` §2, puis
regarder si un signal existant le corrobore (`npm run ideas -- --list --json` +
recherche manuelle) avant de rédiger à l'aveugle.

### Mode ouvert — piocher dans le backlog

```bash
node scripts/dynasty-ideas.mjs --list --status proposed
```
Chaque idée porte un `mode` et un `explain` qui cite des chiffres réels — **le
reproduire au mot pour justifier le choix**, pas juste afficher l'idée. Lecture par
source :
- `pr:<repo>#<n>` (mode `dev-diary`) — fonctionnalité réellement livrée. Le signal le
  plus fort : contenu non copiable.
- `legacy-gsc:<requête>` (mode `research`) — capital de recherche sous l'ancienne
  marque (Astro Nova) à ne pas perdre pendant la migration de domaine.
- `gsc-gap:<requête>` (mode `research`) — opportunité propre à dynastynova.com,
  impressions sans clic.
- `beryldesign:<slug>` (mode `research`) — angle déjà PROUVÉ sur beryldesign.fr
  (cluster jeux, 78% des clics du site) mais jamais couvert ici. Adapter la voix : sur
  beryldesign c'est l'agence qui parle du jeu à la 3e personne, ici c'est Dynasty Nova
  qui parle de lui-même à la 1re personne (« nous »).
- `seo-checklist:<mot-clé>` (mode `research`) — mot-clé cible de `docs/seo-checklist.md`
  non encore couvert, priorité la plus basse (aucune preuve de demande, juste une
  cible déclarée).

**Mode batch** : sélectionner jusqu'à **3** idées `proposed`/`queued` (jamais plus).
```bash
node scripts/dynasty-ideas.mjs --queue <id1> <id2> <id3> --apply
```
Présenter le lot complet (titre, mode, source, `explain`) → **une seule confirmation
couvrant les 3**. Si l'utilisateur en écarte une :
```bash
node scripts/dynasty-ideas.mjs --reject <id> --reason "…" --apply
```
Puis pour chaque idée retenue, exécuter les étapes 2-5, en marquant l'avancement :
```bash
node scripts/dynasty-ideas.mjs --claim <id> --apply
node scripts/dynasty-ideas.mjs --complete <id> --slug <slug-du-fichier> --apply
```
Un run interrompu doit libérer les idées non terminées (`--release <id> --apply`)
plutôt que les laisser bloquées en `in-progress`.

## Étape 2 — Réunir les sources selon le mode (point d'arrêt ②)

### `dev-diary` — fonctionnalité réellement livrée (mode principal, différenciant)

```bash
gh pr view <repo> <number> --json title,body,url,files
```
Si le corps de la PR est un template non rempli (`<!-- ... -->`), s'appuyer sur le
titre + la liste des fichiers modifiés + au besoin `gh pr diff <repo> <number>` pour
comprendre concrètement ce qui a changé. **Règle anti-hallucination** : ne décrire
que ce qui est réellement dans le titre/corps/diff de la PR — jamais une
fonctionnalité inventée ou extrapolée. Si l'utilisateur peut fournir une capture
d'écran réelle de la fonctionnalité en jeu, l'utiliser ; sinon, écrire sans figure
inline plutôt que d'en inventer une.

### `research` — comparatifs de genre, capital de marque, mots-clés

Sourcer via `WebSearch`/`WebFetch` si le sujet le demande (comparatifs OGame,
tendances 4X spatial). Pour un angle `beryldesign:<slug>`, relire l'article source
(`/Users/ghambourger/Documents/Github/beryldesign/beryldesign/src/content/post/<slug>.md`)
pour comprendre l'angle qui a fonctionné, sans le copier — le réécrire à la première
personne, du point de vue de Dynasty Nova.

### `video` (Vidiome) — optionnel

Trouver 2-3 vidéos complémentaires (FR ou EN, chaîne reconnue, pas trop datées).
**RÈGLE ANTI-HALLUCINATION** : vérifier chaque vidéo via `WebFetch` de
`https://www.youtube.com/oembed?url=...&format=json` avant de l'inclure.

Présenter la shortlist de sources (quelle que soit sa nature) → **s'arrêter**,
l'utilisateur valide.

## Étape 3 — Générer le contenu brut (mode `video` uniquement)

```bash
node scripts/vidiome-generate.mjs "<url1>" "<url2>" --slug <theme-slug> --lang fr
```
Sorties JSON dans `.vidiome-cache/<theme-slug>/` (gitignored). Gérer `404` (pas de
transcript → remplacer la vidéo), `402` (crédits insuffisants), `502` (backend
Vidiome). Pour `dev-diary`/`research`, pas de script dédié — rassembler les
notes/citations dans un fichier de travail temporaire (hors `src/`).

## Étape 4 — Rédaction de l'article

**Voix et structure** : suivre `docs/charte_editoriale.md` à la lettre — ton
épique-accessible (§4), vocabulaire de référence (§5 : empire, flotte, ressources,
stratégie, galaxie…), jamais de « il suffit de cliquer » (§6), CTA in-univers
(§8 : « Explorer la galaxie », jamais « Cliquez ici »), passer la checklist §11 avant
de considérer le brouillon terminé.

**Citabilité (GEO)** : suivre `docs/geo-guidelines.md` — chaque section répond à sa
propre question dans sa première phrase, définitions autonomes (pas de "cela"/"ce
système" sans antécédent explicite), comparaisons en liste/tableau plutôt qu'en
prose quand le sujet le permet.

**Format** : Markdown simple — `##` pour les sections, `**gras**` pour les
termes/produits clés, listes `- item` pour les énumérations, **jamais de HTML brut**
(contrairement à beryldesign). Référence de longueur et de ton : n'importe quel
fichier existant dans `src/content/articles/*.md`. Cible **500-700 mots**.

**FAQ obligatoire** : chaque article se termine par 3-4 questions/réponses (frontmatter
`faq`, ci-dessous) — la question dans les mots exacts qu'un joueur taperait, la
réponse en 1-3 phrases autonomes. Génère automatiquement un schéma `FAQPage`
(`src/lib/seo.ts`) et s'affiche en bas de l'article (`blog/[...slug].astro`). Piocher
les questions dans le signal qui a motivé l'idée (ex: `legacy-gsc`/`gsc-gap` du
backlog = la question EST la requête réelle) plutôt qu'en inventer.

**Frontmatter** = schéma exact de `articlesCollection`
(`src/content.config.ts:559-575`) — ne pas ajouter de champ hors schéma :
```yaml
title: "..."
date: 2026-08-20
description: "..."
author: "Guillaume Hambourger"
coAuthors: []
tags: ["...", "..."]
draft: true
image: "/uploads/blog/....avif"   # optionnel — omettre laisse le fallback cover-{1..27}.webp s'appliquer
icon: "ph-...."                    # optionnel — voir src/utils/articleIcon.ts pour les icônes déjà mappées par tag
faq:                                # 3-4 items, voir "FAQ obligatoire" ci-dessus
  - question: "..."
    answer: "..."
```

**Publier via script** (mode `video`, ou pour respecter le format à la lettre dans
tous les modes) :
```bash
node scripts/vidiome-publish.mjs --article article.json [--cache .vidiome-cache/<theme-slug>] [--dry]
```
Sinon, écrire directement le fichier dans `src/content/articles/<slug>.md` en suivant
le gabarit ci-dessus.

## Étape 5 — Valider

```bash
npm run build   # le schéma Zod de articlesCollection valide implicitement au build
```
Il n'existe pas de script `lint`/`check` séparé dans ce repo — la relecture manuelle
contre `docs/charte_editoriale.md` §11 tient lieu de contrôle qualité.

## Étape 6 — Confirmation finale (point d'arrêt ③)

Présenter chaque brouillon produit (chemin, titre, mode, source) → l'utilisateur
relit et décide de publier (`draft: false`) ou d'ajuster. Marquer l'idée `--complete`
dans le backlog une fois le fichier écrit.

## Garde-fous

- **Brouillon-first**, un humain valide toujours avant publication. Lot ≤ 3.
- **Anti-hallucination** : en `dev-diary`, ne jamais décrire une fonctionnalité qui
  n'est pas réellement dans la PR citée. En `video`, ne jamais citer une vidéo non
  vérifiée par oEmbed.
- Ne jamais reprendre un angle `beryldesign:<slug>` mot pour mot — adapter la voix
  (1re personne Dynasty Nova, pas 3e personne agence).
- Ne jamais ajouter de champ frontmatter hors du schéma `articlesCollection`.
- Ne jamais exposer les clés (`.env`, `VIDIOME_API_KEY`, la clé de service GSC/GA4).
