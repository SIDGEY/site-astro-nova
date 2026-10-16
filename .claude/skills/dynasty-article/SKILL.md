---
name: dynasty-article
description: >-
  Génère des brouillons d'articles pour le blog dynastynova.com à partir de six
  signaux réels croisés : l'activité de dev du jeu (PR mergées sur Dynasty-Nova/Frontend
  et Dynasty-Nova/Backend), la performance GSC/GA4 propre à dynastynova.com et sa
  conversion vers le jeu par article (PostHog), le capital
  de recherche legacy de play-astronova.com (ancienne marque), et le cluster "jeux" de
  beryldesign.fr (déjà spécialisé sur Dynasty Nova/OGame, 78% de ses clics). Quatre modes
  de production (dev-diary, research, video/Vidiome, community-post pour Reddit/forums).
  Chaque article de blog sert aussi l'acquisition de nouveaux joueurs : intention de
  recherche non-marque, intro lisible sans connaître le jeu, CTA tracé (UTM) vers
  play.dynastynova.com, maillage vers les pages d'entrée.
  Toujours en brouillon (`draft: true`) pour les modes blog, jamais de publication
  automatique sur une plateforme tierce pour community-post. Lot ≤ 3 par run. Déclencher
  quand l'utilisateur veut « générer/proposer un article », « des idées de sujets », « un
  article sur une fonctionnalité du jeu », « un post pour Reddit/un forum », ou nomme
  Vidiome / un sujet Dynasty Nova à traiter.
---

# dynasty-article — chaîne éditoriale dynastynova.com

Produit des **brouillons** (`draft: true`) prêts à relire — jamais de publication
auto. Le backlog persistant (`editorial/backlog.jsonl`) évite de reproposer un sujet
déjà traité ou rejeté.

**Double objectif du blog** : informer les joueurs actuels ET amener des joueurs qui
ne connaissent pas encore Dynasty Nova. Le SEO fait venir le lecteur, l'article doit
lui donner envie de lancer une partie. Concrètement, chaque article de blog respecte le
« Parcours d'acquisition » de l'Étape 4 ; ça ne crée pas de mode à part, ça s'applique
aux modes existants.

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
- `POSTHOG_PERSONAL_API_KEY` / `POSTHOG_PROJECT_ID` dans `.env` (voir `.env.example`) pour
  `posthog:fetch` : conversion vers le jeu par page et par source, lecture réelle,
  frictions. Absentes ou projet trop récent (moins de 7 jours de données) : se contenter
  de GA4, et ne pas présenter de chiffre de conversion comme mesuré.
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
npm run posthog:fetch                                               # conversion par page vers le jeu (PostHog)
npm run game:fetch                                                  # PR mergées, les 2 repos du jeu
npm run ideas -- --generate --apply                                 # combine tout dans le backlog
```
Beryldesign (signal 5) n'a pas besoin d'être re-fetché : `dynasty-ideas.mjs` lit
directement le cache déjà présent dans son repo (`.gsc-cache`/`.ga4-cache`), rafraîchi
par leur propre skill `beryl-article`.

**Anti-redondance automatique** : `--generate` compare le titre de chaque idée
candidate (les 6 signaux) au titre de chaque article déjà présent dans
`src/content/articles/*.md` (recouvrement ≥ 2 mots significatifs, voir
`overlapsExisting()` dans `scripts/dynasty-ideas.mjs`) et rejette silencieusement
celles qui matchent déjà un sujet couvert. Ce filtre ne joue que sur le TITRE — il
peut laisser passer un sujet déjà traité sous un angle/titre différent, donc rester
vigilant en Étape 1 plutôt que de lui faire confiance à 100 %.

## Étape 1 — Choisir le lot (point d'arrêt ①)

### Mode dirigé — l'utilisateur a déjà dit « je veux un article sur X »

Vérifier que X se rattache à la phrase mère de `docs/charte_editoriale.md` §2, puis
**vérifier explicitement qu'aucun article existant ne couvre déjà ce sujet**
(`ls src/content/articles/` + lecture rapide des titres/descriptions les plus
proches) — le filtre anti-redondance d'Étape 0 ne s'applique qu'au mode `--generate`,
jamais à un sujet nommé directement par l'utilisateur. Puis regarder si un signal
existant le corrobore (`npm run ideas -- --list --json` +
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

**Filtre acquisition** (en plus de l'ordre ci-dessus) :
- Dans un lot, **au moins une idée doit pouvoir être trouvée par quelqu'un qui ne
  connaît pas le jeu** : un signal `legacy-gsc`/`gsc-gap`/`beryldesign` sur une requête
  non-marque, ou une page d'intention du calendrier (Étape 4). Un lot 100 % dev-diary
  ne parle qu'aux joueurs déjà là.
- Pour un `dev-diary`, préférer une fonctionnalité qui change l'expérience d'un
  **nouveau** joueur ou qui illustre ce qui distingue le jeu (gratuit, navigateur,
  mobile, combats lisibles…) à un réglage qui ne parle qu'aux vétérans. Si le sujet
  reste pointu, le dire dans la présentation du lot plutôt que de l'écarter.
- Pour voir ce qui amène déjà des visiteurs, lire le dernier
  `.ga4-cache/dynastynova.com-GA4-*/` (`Pages.csv` : pages `/blog/…` qui reçoivent des
  sessions, `Sources.csv` : part du trafic organique, `Evenements.csv` : total des
  `play_click`, départs vers le jeu).
- **Ce qui convertit** : le dernier `.posthog-cache/dynastynova.com-PostHog-*/`.
  `Pages.csv` donne par article les visiteurs, ceux partis vers le jeu, la conversion,
  la durée médiane et la part lue jusqu'au bout ; `Entrees.csv` la conversion selon la
  page d'arrivée ; `Sources.csv` selon l'origine (organique, Reddit, campagne UTM).
  Croiser par chemin de page avec GSC (requête → page) : un sujet dont les articles
  voisins **convertissent** mérite un article de plus, un sujet qui attire sans convertir
  appelle plutôt un meilleur parcours qu'un nouvel article. Citer les chiffres au mot dans
  la présentation du lot. Sous ~30 visiteurs sur une page, parler de tendance, pas de taux.
- **Retouches prioritaires** : un article publié avec beaucoup de visiteurs mais une
  conversion faible ou une lecture qui s'arrête tôt (`Lus jusqu'au bout` bas) est un
  meilleur investissement qu'un article neuf. Le proposer dans le lot comme « mise à
  niveau » (parcours d'acquisition de l'Étape 4, sans changer le slug) en citant ses
  chiffres.

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

### `community-post` — Reddit/forums (acquisition directe, pas un article de blog)

Cible les communautés où traînent déjà des joueurs OGame/4X : r/ogame, r/webgames,
r/incremental_games, forums de jeux navigateur. Contrairement aux trois autres modes,
**ça ne produit pas de fichier dans `src/content/articles/`** — le texte est présenté
à l'utilisateur pour qu'il le poste lui-même depuis son propre compte.

- **Source** : privilégier un angle `dev-diary` réel (une PR récente et concrète) —
  c'est ce qui donne un post crédible plutôt qu'auto-promotionnel.
- **Voix** : premier degré, développeur qui partage un progrès, pas un communiqué
  marketing. Ton `docs/charte_editoriale.md` toujours valable, mais registre plus
  familier/direct qu'un article de blog.
- **Divulgation obligatoire en premier** : la plupart de ces subreddits exigent que le
  développeur se déclare explicitement (« Je développe Dynasty Nova, un... ») — ne
  jamais poster de façon déguisée.
- **Vérifier les règles de la communauté avant de rédiger** : beaucoup de subreddits
  interdisent l'auto-promo hors thread dédié ("Self-Promo Saturday" etc.) ou exigent
  un flair précis — si l'utilisateur ne le sait pas, le signaler comme point à
  vérifier plutôt que de l'ignorer.
- **Longueur** : 100-250 mots, pas un article complet.
- **Lien** : si un article du blog couvre le sujet, y renvoyer plutôt que directement
  vers le jeu (le lecteur y trouve le contexte et le CTA). Ajouter
  `?utm_source=<communauté, ex. reddit-ogame>&utm_medium=community&utm_campaign=<slug>`
  pour distinguer ce trafic dans `Sources.csv`. Un seul lien, et seulement si les
  règles de la communauté l'autorisent.

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

**`community-post`** : pas de frontmatter, pas de fichier. Rédiger le texte du post
(titre + corps, 100-250 mots, voix premier degré — voir Étape 2) directement dans la
réponse à l'utilisateur, prêt à copier-coller. S'arrêter là pour ce mode — les étapes
qui suivent (frontmatter, `npm run build`) ne s'appliquent qu'aux modes blog.

**Voix et structure** (modes blog) : suivre `docs/charte_editoriale.md` à la lettre — ton
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
(contrairement à beryldesign). Cible **500-700 mots**.

**Structure obligatoire H2 + H3** : jamais une suite plate de H2 avec un seul
paragraphe dessous, ça se lit comme une liste de gros titres, pas un article. Chaque
H2 couvre un thème et se subdivise en 2-3 H3 qui portent chacun un paragraphe court et
focalisé. Référence de densité : n'importe quel fichier existant dans
`src/content/articles/*.md` (ex. `astronova-creer-une-ui-mobile-first-inspiree-des-meilleures-pratiques.md`).

**Titre orienté intention, marque en fin de titre** : le titre est aussi la balise
`<title>` (le schéma n'a pas de `seoTitle`). Commencer par les mots qu'un joueur tape
sans connaître le jeu (« Simulateur de combat : … », « Jeu comme OGame : … »,
« Protection des nouveaux joueurs : … »), et placer « dans Dynasty Nova » à la fin si
le sujet est propre au jeu. Ne plus ouvrir par « Dynasty Nova : … » : au 2026-10-06,
91 % des clics Google du site venaient de la requête de marque et les articles titrés
ainsi ne captaient aucune recherche non-marque. Exception : une annonce ou un
lancement, que seuls cherchent ceux qui connaissent déjà le jeu. Ne jamais toucher au
slug d'un article publié en changeant son titre.

**Une page d'intention par mois au minimum** : en plus des dev-diaries, produire au
moins un article qui répond à une question réelle de joueur qui ne connaît pas encore le
jeu (guide, définition, comparatif), sur le modèle de
`jeu-de-strategie-spatiale-gratuit-navigateur-dynasty-nova.md` et
`debuter-jeu-de-strategie-spatiale-guide-premieres-heures.md`.

Calendrier tenu (brouillons prêts, à passer en `draft: false` le mois venu, puis
vérifier que les faits cités sont toujours vrais en jeu) :
- 2026-10 : article pilier + guide débutant (publiés le 2026-10-06)
- 2026-11 : `jouer-jeu-de-strategie-spatiale-sur-mobile-sans-application.md`
- 2026-12 : `lexique-jeu-de-strategie-spatiale-ogame.md`
- 2027-01 : `preparer-un-raid-jeu-de-strategie-spatiale.md`
Pistes suivantes, à confronter au GSC avant d'écrire : coloniser sa deuxième planète,
choisir sa classe (une fois la 3.7.0 en production), défendre sa planète sans flotte,
jouer entre amis à un jeu de stratégie spatiale.

**Parcours d'acquisition (tous les modes blog)** : convention déjà suivie par les
articles récents (ex. `vendre-et-acheter-des-ressources-banque-stellaire-dynasty-nova.md`,
`preparer-un-raid-jeu-de-strategie-spatiale.md`), à appliquer systématiquement :
- **Intro lisible à froid** : le premier paragraphe doit tenir pour un lecteur arrivé
  de Google sans connaître le jeu. Dans un `dev-diary`, situer Dynasty Nova en une
  demi-phrase (jeu de stratégie spatiale gratuit, dans le navigateur, jouable sur
  mobile) avant de parler de la nouveauté. Jargon du genre (raid, recyclage,
  colonisation…) expliqué au premier usage ou lié au lexique.
- **CTA vers le jeu, tracé** : au moins un lien vers le jeu, dans la conclusion,
  formulé avec un verbe de la charte §8 (« Explorer la galaxie », « Envoyer la
  flotte »…) et jamais « Cliquez ici ». Un second au maximum, au milieu de l'article,
  s'il tombe naturellement. Format exact :
  `[play.dynastynova.com](https://play.dynastynova.com/?utm_source=blog&utm_medium=article&utm_campaign=<campagne>)`
  où `<campagne>` = sujet court en kebab-case (`banque-stellaire`), préfixé
  `intention-` pour une page d'intention (`intention-raid`). Le script de
  `src/layouts/BaseLayout.astro` conserve ces UTM et compte le clic en `play_click`.
- **Maillage interne** : 2-3 liens `/blog/<slug>/` vers des articles publiés
  (`draft: false`). Un `dev-diary` renvoie vers au moins une page d'entrée (le pilier
  `jeu-de-strategie-spatiale-gratuit-navigateur-dynasty-nova` ou le guide
  `debuter-jeu-de-strategie-spatiale-guide-premieres-heures`) ; une page d'intention
  renvoie vers les dev-diaries qui prouvent ce qu'elle affirme. Vérifier que chaque
  slug lié existe.
- **FAQ** : quand l'article l'établit, une des 3-4 questions est celle d'un joueur qui
  hésite à commencer (« Dynasty Nova est-il gratuit ? », « Peut-on y jouer sur
  mobile ? »). Même règle que la FAQ : rien qui ne soit écrit dans l'article.
- **Transparent sans trop en dire** : décrire ce que le joueur voit et fait (écrans,
  parcours, délais). Jamais de chiffres d'équilibrage internes, de formules, de
  pourcentages de configuration, de back-office ni de monétisation. Si une information
  manque, déprioriser le sujet plutôt que de la deviner.

**Jamais de tiret cadratin/demi-cadratin (—, –)** : tic d'écriture IA immédiatement
reconnaissable (voir `docs/charte_editoriale.md` §4). Remplacer par une virgule, un
point, deux-points, un point-virgule ou des parenthèses selon le sens — y compris en
relisant son propre brouillon avant de le rendre, pas seulement en rédigeant.

**FAQ obligatoire, sur TOUS les articles, y compris les anciens qu'on retouche** :
chaque article se termine par 3-4 questions/réponses (frontmatter `faq`, ci-dessous),
la question dans les mots exacts qu'un joueur taperait, la réponse en 1-3 phrases
autonomes. Génère automatiquement un schéma `FAQPage` (`src/lib/seo.ts`) et s'affiche
en bas de l'article (`blog/[...slug].astro`, accordéon calqué sur la FAQ in-game de
`Frontend/src/features/help/pages/HelpPage.tsx`). Piocher les questions dans le signal
qui a motivé l'idée (ex: `legacy-gsc`/`gsc-gap` du backlog = la question EST la
requête réelle) plutôt qu'en inventer ; pour un article sans signal de ce type
(rétrofit d'un ancien article), les tirer des affirmations déjà présentes dans le
corps du texte, jamais d'un fait non écrit dans l'article.

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
image: "/uploads/blog/covers/<slug>.webp"  # voir "Cover unique" ci-dessous — sinon fallback cover-{1..27}.webp
icon: "ph-...."                    # optionnel — voir src/utils/articleIcon.ts pour les icônes déjà mappées par tag
faq:                                # 3-4 items, voir "FAQ obligatoire" ci-dessus
  - question: "..."
    answer: "..."
coverPrompt: "..."                  # brief nommant une teinte, voir "Cover unique" ci-dessous
```

**Publier via script** (mode `video`, ou pour respecter le format à la lettre dans
tous les modes) :
```bash
node scripts/vidiome-publish.mjs --article article.json [--cache .vidiome-cache/<theme-slug>] [--dry]
```
Sinon, écrire directement le fichier dans `src/content/articles/<slug>.md` en suivant
le gabarit ci-dessus.

## Étape 4bis — Cover unique

Chaque nouvel article (modes blog uniquement, pas `community-post`) reçoit une cover
générée plutôt que de retomber sur le pool générique `cover-{1..27}.webp`. D'abord
écrire un `coverPrompt` court dans le frontmatter — un brief qui **nomme une teinte**
cohérente avec le sujet (table de correspondance dans
`docs/dynasty-cover-style-guide.md` §4 : bleu = technologie, or = ressources/lore,
turquoise = exploration, violet = flottes/combat, rouge = compétitif). Puis :
```bash
node scripts/generate-cover.mjs --slug <slug> --from-article --dry   # relire le prompt final
node scripts/generate-cover.mjs --slug <slug> --from-article         # génère public/uploads/blog/covers/<slug>.webp
```
Référencer le chemin obtenu dans le champ `image` du frontmatter. **Toujours relire
l'image visuellement avant de committer** — Cloudflare Workers AI (backend, tier
gratuit) peut ponctuellement dériver du style (deuxième teinte parasite, forme non
continue) ; en cas de résultat raté, réessayer plutôt que publier tel quel. Si le
résultat n'est pas satisfaisant après 2-3 essais, revenir au fallback existant (ne pas
renseigner `image`) plutôt que de forcer un rendu médiocre.

## Étape 5 — Valider

```bash
npm run build   # le schéma Zod de articlesCollection valide implicitement au build
```
Il n'existe pas de script `lint`/`check` séparé dans ce repo — la relecture manuelle
contre `docs/charte_editoriale.md` §11 tient lieu de contrôle qualité.

## Étape 6 — Confirmation finale (point d'arrêt ③)

Présenter chaque brouillon produit (chemin, titre, mode, source, plus la requête
non-marque visée, le lien CTA avec sa campagne et les articles liés) → l'utilisateur
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
- Ne jamais exposer les clés (`.env`, `VIDIOME_API_KEY`, `CLOUDFLARE_API_TOKEN`, la
  clé de service GSC/GA4, `POSTHOG_PERSONAL_API_KEY`).
- **Cover** : toujours relire visuellement une image générée avant de la référencer
  dans `image` — jamais committer un résultat qui s'écarte de
  `docs/dynasty-cover-style-guide.md` (deuxième teinte, forme non continue, objet
  reconnaissable). Mieux vaut laisser le fallback `cover-{1..27}.webp` s'appliquer
  qu'un rendu raté.
- **`community-post` : ne jamais poster automatiquement** sur Reddit/un forum — ce
  n'est pas à ce skill de détenir ou d'utiliser les identifiants d'un compte
  communautaire. Toujours remettre le texte à l'utilisateur pour publication manuelle.
- **Jamais de tiret cadratin/demi-cadratin (—, –)** dans un article ni un post
  community, relire le brouillon spécifiquement pour ça avant l'Étape 5.
- **Structure H2 + H3, FAQ et parcours d'acquisition obligatoires** sur tout article
  (modes blog), y compris quand on retouche un article déjà publié pour une autre
  raison (cover, correctif de contenu…) : ne pas laisser passer une occasion de le
  mettre à niveau. Au 2026-10-16, 45 des 56 articles publiés n'ont aucun lien vers le
  jeu (`grep -L "play.dynastynova.com"` sur les articles `draft: false`) ; leur ajouter
  le CTA tracé et le maillage dès qu'on y touche, sans changer le slug.
- **Acquisition sans racolage** : le CTA reste in-univers et à sa place (conclusion,
  au plus un autre) ; pas de bandeau, de superlatif ni de promesse que le jeu ne tient
  pas (charte §3, « ce que nous ne promettons pas »).

## Mode routine (sans humain dans la boucle)

Quand la demande dit « mode routine » (une routine planifiée, personne pour répondre),
les trois points d'arrêt sont remplacés par **une PR** : l'auteur relit et fusionne, et
c'est la fusion qui vaut validation. Le skill `publication` publiera ensuite l'article à sa
date. Ce mode ne publie jamais et ne pousse jamais sur `main`.

1. **Signaux** : si les clés GSC/GA4/PostHog ne sont pas dans l'environnement, sauter Étape 0 sauf
   les PR du jeu : `gh pr list -R Dynasty-Nova/Frontend --state merged --search
   "merged:>=<date J-7>"`, idem pour `Dynasty-Nova/Backend`. Si `gh` n'a pas accès à ces
   dépôts, s'arrêter et le dire.
2. **Choix (2 articles au plus)** : uniquement des `feat` qui changent ce qu'un joueur voit
   ou fait. Regrouper une PR front et sa PR back dans un même article. Écarter `fix`,
   `chore`, `refactor`, le back-office et l'admin. Écarter une PR fusionnée **après la
   dernière release** (`gh release list -R Dynasty-Nova/Frontend --limit 1`) : la
   fonctionnalité n'est pas encore en production, elle attend la semaine suivante.
   Écarter un sujet déjà couvert (titres et descriptions de `src/content/articles/`).
3. **Rédaction** : Étape 4 à la lettre (titre orienté intention, H2 + H3, FAQ, 500 à 700
   mots, aucun tiret cadratin, règle anti-hallucination : rien qui ne soit dans la PR),
   parcours d'acquisition compris (intro lisible à froid, CTA tracé, maillage interne).
   `draft: true`, et `date` = le prochain mercredi qui n'a pas déjà deux brouillons datés.
4. **Cover** : `scripts/generate-cover.mjs` si `CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_API_TOKEN`
   sont présents ; sinon, pas de champ `image` (cover de repli) et le dire dans la PR.
5. **Validation** : `npm ci && npm run build`.
6. **PR** : branche `routine/articles-<date du jour>`, un commit par article, push, puis
   `gh pr create` vers `main`. Corps de la PR : pour chaque article, les PR sources (liens),
   ce que l'article affirme et d'où ça vient, la date de publication prévue, la requête
   non-marque visée et la campagne UTM du CTA, et la phrase
   « Fusionner cette PR vaut validation : le skill publication publiera l'article à sa
   date. » Ne jamais fusionner soi-même.
7. Rien qui vaille un article cette semaine : pas de PR, un compte rendu d'une ligne.
