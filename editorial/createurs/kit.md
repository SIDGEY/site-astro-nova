# Kit créateurs YouTube

Ce qu'on envoie aux créateurs pour qu'ils parlent de Dynasty Nova. Le message envoyé par
l'Apps Script (`envoi-gmail.gs`, feuille « cibles ») est `message-youtube.txt`, rempli
chaîne par chaîne par `scripts/youtube-creators.mjs`. Les modèles ci-dessous servent aux
cas particuliers : relance à la main, message court sur un réseau, demande de tarif.

Les `[CROCHETS]` se remplissent à chaque envoi. `[OFFRE]` se décide une fois pour toutes
(voir « Ce qu'on propose ») avant le premier envoi.

## Fiche du jeu (à reprendre telle quelle)

- **Dynasty Nova**, anciennement Astro Nova : jeu de stratégie spatiale 4X en temps réel.
- **Gratuit**, sans téléchargement : se joue dans le navigateur, sur ordinateur et sur
  mobile. Lien : https://play.dynastynova.com
- **Pour qui** : les joueurs d'OGame et des jeux navigateur de gestion, avec une interface
  moderne, une planète en 3D et un arbre technologique rangé par catégories.
- **Deux dynasties** au choix, pour toujours dans chaque univers : l'Héritage (humains,
  augmentés, cyborgs, clones) et l'Accord (xénos de multiples espèces). Chacune a deux traits
  et deux classes à elle, avec leur arbre de talents.
- **Pay-to-Fast, pas Pay-to-Win** : aucun achat ne donne d'avantage stratégique définitif,
  seulement du temps gagné.
- **Ouvert à tous**, sans liste d'attente. Développé en France, en activité : feuille de route
  publique sur https://dynastynova.com/roadmap/
- Contact : contact@dynastynova.com · Discord : https://discord.gg/dVXdVqw5d5 ·
  X : https://twitter.com/dynastynova

**Visuels** à joindre (lien de dossier partagé à créer une fois, `[LIEN VISUELS]`) :
captures `public/landing/screenshot1.jpg` et `screenshot2.jpg`, bannières
`public/game/banners/*.webp`, dynasties `public/game/dynasties/`, logo `public/logo.svg`,
image de partage `public/og-default.jpg`. Vidéo de démonstration : `demo-video/`
(`npm run capture` puis `npm run remotion:render`), utile comme séquences pour leur montage.

## Ce qu'on propose

À trancher avant le premier envoi : le message type (`message-youtube.txt`) propose aujourd'hui le niveau Contenu (avantages en jeu, univers privé avec bots).

| Niveau | Pour qui | Contrepartie | Ce qu'on demande |
|---|---|---|---|
| Découverte | Toutes chaînes | Aucune : le jeu est gratuit, on aide (guide, réponses rapides, mise en avant sur le Discord et le blog) | Rien d'imposé. S'ils en parlent, le lien tracé en description |
| Contenu | Niche, 1 k à 100 k | `[AVANTAGE EN JEU]` pour eux et/ou leur communauté, si le jeu le permet | Une vidéo ou un passage, lien tracé en description |
| Sponsor | Grand public, 100 k et plus | `[MONTANT]` € au forfait, ou par inscription mesurée | Intégration de 60 à 90 s ou passage dans une vidéo « jeux navigateur », lien tracé |

Au-delà de 100 k abonnés, attendre une demande de rémunération : sans budget, viser plutôt
les chaînes de 10 k à 100 k qui font des vidéos « je teste des jeux navigateur ».

## Règles à respecter

- **Influence commerciale (loi du 9 juin 2023)** : dès qu'il y a une contrepartie (argent,
  avantage en jeu, cadeau), le créateur doit l'afficher clairement (« Publicité » ou
  « Collaboration commerciale ») pendant toute la vidéo, et cocher « Contient une promotion
  rémunérée » sur YouTube. On le rappelle dans l'e-mail : c'est notre responsabilité aussi.
  Au-delà d'un montant fixé par décret, un contrat écrit est obligatoire.
- **Jamais** de chaîne pour enfants (le script les écarte), jamais d'avis imposé : le créateur
  dit ce qu'il pense du jeu.
- **Un seul message, une seule relance** (l'Apps Script relance à J+7). Pas de réponse
  ensuite : on ne recontacte pas avant trois mois. « stop » : on retire la ligne.
- **Un lien tracé par chaîne** (colonne `lien tracé` de la feuille,
  `utm_content=yt-<handle>`), jamais le lien nu : c'est ce qui permet de savoir qui amène
  des joueurs (`npm run posthog:fetch`, Createurs.csv).

## Modèles

### A. Grand public, vidéos « jeux navigateur »

**Objet** : `[PRÉNOM/PSEUDO]`, un 4X spatial pour ta prochaine vidéo jeux navigateur ?

> Salut `[PSEUDO]`,
>
> J'ai vu ta vidéo « `[TITRE DE LA VIDÉO]` » : `[UN DÉTAIL PRÉCIS QUI MONTRE QU'ON L'A
> REGARDÉE]`.
>
> Je travaille sur Dynasty Nova, un jeu de stratégie spatiale qui se joue directement dans le
> navigateur, gratuit, sur ordinateur comme sur mobile. Rien à voir avec un petit jeu flash :
> on choisit sa dynastie, on colonise des planètes, on monte sa flotte et on affronte d'autres
> joueurs en temps réel. Si tu as connu OGame, c'est la même famille, en moderne.
>
> Je pense qu'il aurait sa place dans ta prochaine sélection de jeux navigateur : `[OFFRE]`.
>
> Le lien à mettre en description, s'il te plaît, est celui-ci : `[LIEN TRACÉ]`. Il nous
> permet de voir ce que ta vidéo nous apporte, rien d'autre.
>
> Visuels et vidéo de gameplay : `[LIEN VISUELS]`. Je réponds vite ici ou sur Discord si tu
> veux un coup de main pour démarrer.
>
> `[SIGNATURE]`
> Dynasty Nova · https://dynastynova.com

Si l'offre comporte une contrepartie, ajouter avant la signature :

> Comme il y a une contrepartie, il faudra afficher « Collaboration commerciale » dans la
> vidéo et cocher la promotion rémunérée sur YouTube : on tient à ce que ce soit carré.

### B. Niche OGame, stratégie spatiale, 4X

**Objet** : Dynasty Nova, un successeur moderne d'OGame, pour ta chaîne ?

> Salut `[PSEUDO]`,
>
> Je suis tes vidéos sur `[JEU]` : `[DÉTAIL PRÉCIS]`.
>
> On développe Dynasty Nova, un 4X spatial navigateur qui reprend ce qui fait le sel
> d'OGame (planètes, recherches, flottes, colonisation) avec une interface moderne, une
> planète en 3D et deux dynasties aux classes et talents différents. Gratuit, Pay-to-Fast et
> pas Pay-to-Win, jouable sur mobile.
>
> On cherche des joueurs exigeants pour le pousser dans ses retranchements, et ton avis nous
> intéresse autant que ta vidéo : `[OFFRE]`.
>
> Lien tracé pour ta description : `[LIEN TRACÉ]` · visuels : `[LIEN VISUELS]` · Discord :
> https://discord.gg/dVXdVqw5d5
>
> `[SIGNATURE]`

### C. Relance (J+7, une seule fois, dans le même fil)

> Salut `[PSEUDO]`, je me permets de remonter mon message au cas où il se serait perdu.
> Si ce n'est pas le moment ou pas ton style, aucun souci, dis-le moi et je ne t'embête plus.
> `[SIGNATURE]`

### D. Message court (Discord, X, Instagram), quand il n'y a pas d'e-mail

> Salut `[PSEUDO]` ! J'ai vu ta vidéo « `[TITRE]` ». Je bosse sur Dynasty Nova, un 4X
> spatial gratuit qui se joue dans le navigateur. Je peux t'envoyer une présentation par
> e-mail ? Tu as une adresse pro ?

### E. Réponse à une demande de tarif

> Merci pour ta réponse ! Pour une `[intégration / vidéo dédiée]`, on peut proposer
> `[MONTANT]` €, ou `[MONTANT PAR INSCRIPTION]` € par inscription mesurée par ton lien.
> Tu as un média kit avec tes vues moyennes et ton audience (âge, pays) ?

Si aucun budget n'est prévu : remercier, proposer le niveau Découverte, passer en
`refus` ou `plus tard`, sans insister.

### F. Après la vidéo

> Merci `[PSEUDO]` ! La vidéo est top, `[DÉTAIL]`. Ton lien a déjà amené `[N]` joueurs
> dans le jeu. Si tu veux y revenir pour une prochaine mise à jour, on te prévient en premier.
