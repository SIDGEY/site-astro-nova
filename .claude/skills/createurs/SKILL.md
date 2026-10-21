---
name: createurs
description: >-
  Trouve des créateurs YouTube francophones pour amener de nouveaux joueurs sur
  play.dynastynova.com et prépare leurs lignes dans la feuille « cibles » (prospection
  envoyée depuis Gmail par Apps Script) : recherche par l'API YouTube par segment
  (navigateur, ogame, espace, stratégie, mobile, mmo, découverte, nostalgie, gestion),
  e-mails publics lus dans les descriptions des chaînes et des vidéos, message personnalisé
  à partir d'une vraie vidéo, lien tracé par chaîne, puis mesure des joueurs amenés par
  créateur (PostHog). N'envoie jamais rien lui-même. Déclencher quand l'utilisateur veut
  « trouver des youtubeurs / créateurs », « plus d'e-mails de créateurs », « compléter la
  feuille cibles », « voir ce que rapportent les créateurs », ou parle de partenariats YouTube
  pour Dynasty Nova.
---

# createurs — trouver, préparer, mesurer

Le cercle : **les vidéos récentes disent quelles chaînes ont le bon public → une ligne par
chaîne dans la feuille « cibles », avec l'e-mail public, la vidéo de référence, un lien tracé
propre à la chaîne et un message personnalisé → l'Apps Script envoie par lots de 15 et
relance une fois → les joueurs amenés se lisent dans PostHog.**

Ce skill **n'envoie rien** : il produit des CSV que l'utilisateur relit et importe dans la
feuille. L'envoi, c'est l'Apps Script de l'utilisateur (`editorial/createurs/envoi-gmail.gs`),
qu'il déclenche lui-même. **Point d'arrêt** : relecture des lignes avant import.

Fichiers :
- `scripts/youtube-creators.mjs` (`npm run youtube:creators`) : nouvelles chaînes, au format
  de la feuille.
- `scripts/creators-enrich.mjs` (`npm run cibles:emails`) : e-mails manquants de la feuille.
- `editorial/createurs/message-youtube.txt` : le message type (`{nom}`, `{accroche}`,
  `{support}`, `{lien}`).
- `editorial/createurs/kit.md` : fiche du jeu, offre, règles, autres modèles.
- `.youtube-cache/` : sorties (gitignored, elles contiennent des e-mails).

## Étape 0 — Prérequis

- `YOUTUBE_API_KEY` dans `.env` : `npm run youtube:creators -- --check`. Clé absente : le
  dire, donner la marche à suivre de l'en-tête du script, s'arrêter. **Ne jamais inventer
  de chaîne ni d'e-mail** : sans l'API, pas de liste.
- L'export à jour de la feuille (Fichier > Télécharger > CSV), appelé ici `cibles.csv`.

## Étape 1 — Compléter les e-mails de la feuille

```bash
npm run cibles:emails -- cibles.csv --statut "à contacter"    # ≈ 2 unités par ligne
```
Écrit `cibles-enrichi.csv` (séparateur « ; ») : e-mails trouvés dans les descriptions, avec
la vidéo où ils apparaissent, et réseaux manquants. Rien n'est inventé ni deviné : une
chaîne sans e-mail public reste sans e-mail (l'onglet À propos, derrière un captcha, est à
ouvrir à la main).

## Étape 2 — Trouver de nouvelles chaînes

Un profil par segment, environ 1 000 à 1 600 unités chacun (10 000 par jour) :
```bash
npm run youtube:creators -- --profil navigateur --exclure cibles.csv
npm run youtube:creators -- --profil espace --exclure cibles.csv
# ogame, strategie, mobile, mmo, decouverte, nostalgie, gestion
```
Chaque run écrit `.youtube-cache/cibles-<profil>-<date>.csv`, au format de la feuille,
lignes avec e-mail en tête, statut « à contacter ».

## Étape 3 — Relire (point d'arrêt)

Avant que l'utilisateur importe (Fichier > Importer > Ajouter à la feuille actuelle,
séparateur « Point-virgule »), passer en revue les lignes avec e-mail dans le JSON du même
run et signaler celles à retirer :
- e-mail qui ne semble pas être celui du créateur (marque, sponsor, agence d'un autre) ;
- vidéo de référence sans rapport avec le jeu, ou titre qui sonne faux une fois cité dans
  l'accroche ;
- public visiblement trop jeune, ou ton incompatible avec un jeu de stratégie.
Présenter le compte : lignes prêtes, lignes sans e-mail, lignes à retirer et pourquoi.

## Étape 4 — Mesurer

```bash
npm run posthog:fetch -- --days 30
```
`Createurs.csv` (projet du jeu) : arrivées et inscriptions par `utm_content=yt-<handle>`,
c'est-à-dire par chaîne. `(youtube sans lien tracé)` : venues de YouTube sans le lien.
Reporter les chiffres des vidéos publiées dans la colonne `vidéo publiée`, et ajouter une
entrée à `editorial/acquisition-log.md` pour chaque vidéo (constat, lien, mesure, date de
relecture), au même format que les autres.

## Garde-fous

- Pas d'envoi, pas de publication, pas de commentaire sous les vidéos : seulement des CSV
  à relire.
- E-mails publics seulement, publiés par le créateur lui-même pour être contacté. Jamais
  d'adresse devinée (prenom@…), achetée, ou prise sur un profil personnel.
- Reddit, Facebook, Discord : pas d'e-mail. Ce sont des posts de communauté (mode
  `community-post` du skill `dynasty-article`) ou des messages aux modérateurs, écrits à
  la main.
- Toute contrepartie impose la mention « Collaboration commerciale » (loi du 9 juin 2023,
  voir `kit.md`).
- Gmail perso : 100 destinataires par jour au plus par Apps Script. Le lot de 15 et le
  rythme de 20 s protègent la réputation de l'adresse ; un taux de « rebond » qui monte
  signale des adresses à revoir, pas un lot à grossir.
