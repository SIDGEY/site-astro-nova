---
name: createurs
description: >-
  Trouve et démarche des créateurs YouTube francophones pour amener de nouveaux joueurs sur
  play.dynastynova.com : recherche par l'API YouTube (vidéos « jeux navigateur » grand public
  par défaut, ou niche OGame / 4X), qualification, brouillons d'e-mails personnalisés à
  partir du kit, suivi des contacts et relances dans editorial/createurs/suivi.csv, puis
  mesure des joueurs amenés par chaque créateur (lien tracé, PostHog). Ne publie ni n'envoie
  jamais rien : les e-mails restent en brouillon. Déclencher quand l'utilisateur veut
  « trouver des youtubeurs / créateurs / influenceurs », « contacter des créateurs »,
  « faire les relances créateurs », « voir ce que rapportent les créateurs », ou parle de
  partenariats YouTube pour Dynasty Nova.
---

# createurs — trouver, contacter, mesurer

Le cercle : **les vidéos récentes disent quelles chaînes ont le bon public → un message
personnalisé, avec un lien tracé propre à la chaîne → une seule relance → les joueurs amenés
se lisent dans PostHog → on revient vers ceux qui convertissent.**

Ce skill **n'envoie rien** : les e-mails sont déposés en brouillon (Gmail), ou donnés en
texte à copier. **Deux points d'arrêt** : ① choix des chaînes à contacter, ② relecture des
brouillons.

Fichiers :
- `scripts/youtube-creators.mjs` (`npm run youtube:creators`) : la recherche.
- `editorial/createurs/suivi.csv` : une ligne par chaîne, le statut et l'historique (commité).
- `editorial/createurs/kit.md` : fiche du jeu, offre, règles, modèles de messages.
- `.youtube-cache/` : sorties complètes avec e-mails et vidéos (gitignored).

## Étape 0 — Prérequis

- `YOUTUBE_API_KEY` dans `.env` ou dans les secrets de l'environnement cloud. Vérifier avec
  `npm run youtube:creators -- --check` (1 unité de quota). Clé absente : le dire, donner la
  marche à suivre de l'en-tête du script, et s'arrêter. **Ne jamais inventer de chaînes** :
  sans l'API, aucune liste.
- `[OFFRE]` décidée dans `kit.md` (« Ce qu'on propose »). Pas décidée : demander avant de
  rédiger le moindre message, en rappelant les trois niveaux.

## Étape 1 — Relances et suivi d'abord

Lire `editorial/createurs/suivi.csv` avant toute nouvelle recherche :
- `contacté` dont `contact_le` date de 7 jours ou plus, sans `relance_le` : préparer la
  relance (modèle C) dans le même fil, puis `relancé` et `relance_le`.
- `relancé` depuis 7 jours ou plus sans réponse : `sans réponse`. Pas de nouveau message.
- `accepté` sans `video_le` : vérifier si la vidéo est sortie (dernières vidéos de la chaîne
  par l'API, `playlistItems`) et le noter.

## Étape 2 — Rechercher

```bash
npm run youtube:creators                      # profil navigateur : grand public, 10 k et plus (≈ 3 000 unités)
npm run youtube:creators -- --profil niche    # OGame / 4X, 1 k à 100 k (≈ 1 700 unités)
```
Quota : 10 000 unités par jour, les deux profils tiennent dans la même journée. Le script
ajoute les nouvelles chaînes au suivi en `à qualifier` et met à jour les chiffres des
autres sans toucher à leur statut.

## Étape 3 — Qualifier (point d'arrêt ①)

Pour les 15 premières chaînes `à qualifier` par score, lire dans
`.youtube-cache/creators-<profil>-<date>.json` : vidéos sur le thème, vues moyennes,
rapport vues / abonnés, dernière vidéo, e-mail, liens. Écarter (`écarté`, raison en
`notes`) :
- une chaîne qui ne publie plus (dernière vidéo à plus de 90 jours) ;
- un public visiblement trop jeune, ou un ton incompatible avec un jeu de stratégie ;
- une vidéo « jeux navigateur » isolée dans une chaîne d'un tout autre sujet, sauf si les
  vues sont fortes ;
- un rapport vues / abonnés sous 0,02 (audience qui ne regarde plus).

Présenter au plus **10 chaînes** à contacter : nom, abonnés, vidéo d'accroche (titre, date,
vues), contact trouvé, niveau d'offre proposé (kit), et pourquoi. L'utilisateur choisit.
Les choisies passent en `à contacter`.

Pas d'e-mail public : le noter (« e-mail dans À propos ») et proposer le modèle D sur le
réseau trouvé dans `liens`. L'onglet « À propos » de YouTube cache l'e-mail derrière un
captcha : c'est à l'utilisateur d'aller le chercher.

## Étape 4 — Rédiger (point d'arrêt ②)

Un message par chaîne choisie, à partir du modèle A (profil navigateur) ou B (niche) de
`kit.md` :
- l'accroche cite **une vraie vidéo** de la chaîne (titre exact du JSON) et un détail qui
  s'en déduit ; jamais un compliment générique, jamais un détail inventé sur son contenu ;
- `[LIEN TRACÉ]` = la colonne `lien_trace` de la chaîne, jamais le lien nu ;
- contrepartie prévue : ajouter le paragraphe « Collaboration commerciale ».

Avec le MCP Gmail : `create_draft` pour chaque message (destinataire = e-mail public de la
chaîne). **Jamais `send_message`.** Sans Gmail : donner les messages en texte, prêts à
copier. Montrer les brouillons, attendre la validation, puis mettre à jour le suivi :
`contacté`, `contact_le` = date du jour, `offre`.

## Étape 5 — Mesurer

```bash
npm run posthog:fetch -- --days 30
```
`Createurs.csv` (projet du jeu) : arrivées et inscriptions par `utm_campaign`, c'est-à-dire
par chaîne, que le lien mène au jeu ou au site. `(youtube sans lien tracé)` : venues de
YouTube sans notre lien (créateur qui a mis le lien nu, ou bouche-à-oreille).

Pour chaque vidéo publiée, noter dans `notes` du suivi les arrivées et inscriptions à
J+7 et J+30. Une chaîne qui convertit : la recontacter pour la prochaine mise à jour
(modèle F). Ajouter une entrée à `editorial/acquisition-log.md` pour chaque vidéo publiée
(constat, lien tracé, mesure, date de relecture), au même format que les autres.

## Garde-fous

- Rien ne part sans validation : brouillons seulement, ni envoi, ni publication, ni
  commentaire sous les vidéos.
- Un message, une relance, puis silence trois mois. `refus` est définitif sauf si le
  créateur revient de lui-même.
- Pas d'e-mail ni de donnée personnelle dans `suivi.csv` (commité) : les contacts restent dans
  `.youtube-cache/` et dans Gmail.
- Toute contrepartie impose la mention « Collaboration commerciale » (loi du 9 juin 2023) :
  le rappeler dans le message, ne jamais suggérer de la cacher.
- Les chiffres de l'API sont arrondis par YouTube (abonnés à 3 chiffres significatifs) :
  les présenter comme des ordres de grandeur.
