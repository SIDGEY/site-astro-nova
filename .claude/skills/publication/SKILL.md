---
name: publication
description: >-
  Publie les articles du blog dynastynova.com déjà validés (présents sur main en
  `draft: true`) dont la date est arrivée, avec un plafond de rythme, des contrôles
  bloquants, puis build et push sur main (déploiement FTP automatique). Ne rédige jamais
  rien : c'est le pendant « actif » des skills de production comme `dynasty-article`.
  Déclencher quand l'utilisateur ou une routine demande de « publier les articles prêts »,
  « faire la publication de la semaine » ou lance le mode publication.
---

# publication — dynastynova.com

Ce skill **publie**, il n'écrit pas. Il ne travaille que sur ce qui est déjà sur `main` :
un brouillon arrive sur `main` par une PR que l'auteur a relue et fusionnée, et cette
fusion vaut validation. Un brouillon qui n'est pas sur `main` n'existe pas pour ce skill.

## Règles

- **Éligible** : un fichier `src/content/articles/*.md` avec `draft: true` et un champ
  `date:` inférieur ou égal à la date du jour (UTC, `date -u +%F`).
- **Retenu à la main** : tout slug listé dans `.claude/skills/publication/hold.txt`
  (un par ligne, `#` pour commenter). Jamais publié par ce skill, quelle que soit sa date.
  Pour libérer un article, l'auteur retire sa ligne.
- **Plafond** : au plus **2 articles par exécution**, les plus anciens d'abord (`date`
  croissante, puis nom de fichier). Les suivants attendent l'exécution d'après. Publier
  en rafale est le schéma « scaled content » que Google pénalise.
- **Date honnête** : si la `date` d'un article retenu est antérieure à aujourd'hui (il a
  attendu son tour), la passer à la date du jour en même temps que `draft: false`.
- **Rien d'autre ne bouge** : ni titre, ni slug, ni corps, ni autre fichier.

## Contrôles

Bloquants (l'article n'est pas publié, il reste en brouillon et c'est signalé) :
- si le champ `image:` est renseigné, le fichier existe sous `public/` (sans champ
  `image`, le site utilise une cover de repli : c'est accepté, mais signalé) ;
- le frontmatter a un `faq` de 3 à 4 entrées ;
- le corps contient au moins un `## ` et un `### ` (structure H2 + H3 de la charte) ;
- aucun tiret cadratin ou demi-cadratin (`—`, `–`) dans le fichier.

Signalés sans bloquer :
- un titre qui commence par « Dynasty Nova : » (règle « titre orienté intention » du
  skill `dynasty-article`) ;
- un corps hors de 450 à 800 mots.

## Déroulé

1. `git checkout main && git pull --ff-only`.
2. Lister les éligibles, retirer ceux de `hold.txt`, appliquer le plafond.
3. S'il n'en reste aucun : ne rien modifier, ne rien commiter, répondre
   « Rien à publier aujourd'hui » (avec, s'il y en a, la liste des brouillons retenus par
   `hold.txt` ou bloqués par un contrôle).
4. Pour chaque retenu qui passe les contrôles bloquants : `draft: true` → `draft: false`,
   et la date mise à jour si besoin (règle « date honnête »).
5. `npm ci` puis `npm run build`. Si le build échoue : `git checkout -- .`, ne rien
   commiter, rendre compte de l'erreur.
6. Un commit par exécution, message en français :
   `feat: publie <titre 1>[ et <titre 2>]`, ligne vide, puis la ligne
   `Co-Authored-By:` de l'agent. Puis `git push origin main`.
7. Compte rendu (voir ci-dessous).

## Compte rendu

Court, en français, pour l'auteur :
- les articles publiés, avec leur URL `https://dynastynova.com/blog/<fichier sans .md>/`
  (en ligne environ 35 minutes après le push, le temps du déploiement FTP) ;
- ceux bloqués par un contrôle, et pourquoi ;
- les avertissements non bloquants ;
- pour chaque article publié, **un brouillon de post LinkedIn** prêt à programmer :
  80 à 150 mots, première ligne qui accroche sur le problème du joueur, voix du
  développeur à la première personne, 3 à 4 hashtags, et le lien tagué
  `?utm_source=linkedin&utm_medium=social&utm_campaign=<fichier sans .md>`.
  Jamais de tiret cadratin. Le post n'est pas publié : c'est l'auteur qui le programme.

## Garde-fous

- Ne jamais publier un fichier listé dans `hold.txt`, ni plus de 2 articles par exécution.
- Ne jamais rédiger ni réécrire un article : si un contrôle échoue, on signale.
- Ne jamais ouvrir de PR ni pousser ailleurs que sur `main`, et seulement après un build vert.
- Ne jamais exposer de clé ou de secret dans le compte rendu.
