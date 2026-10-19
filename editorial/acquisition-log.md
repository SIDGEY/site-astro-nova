# Journal d'acquisition

Un changement du site par entrée, avec sa mesure de départ et sa date de relecture (voir
le skill `acquisition`). On ne réécrit jamais une entrée passée, on complète son résultat.

## 2026-10-16 · tout le site · installation de PostHog
- Constat : GA4 ne donne pas les départs vers le jeu par page, seulement leur total.
- Changement : PostHog sur toutes les pages (`src/lib/posthog.ts`), `play_click` envoyé aussi à PostHog, `npm run posthog:fetch`.
- Mesure : premier `posthog:fetch` exploitable après 7 jours de données.
- Résultat : à relire

## 2026-10-16 · /blog/mon-premier-article/ · remise à niveau en page d'entrée
- Constat : 2ᵉ résultat sur « dynasty nova » (GSC 2026-07-16 → 2026-10-14 : 386 impressions en position 2,08, plus 606 en position 1,60 pour l'URL sans slash, 33 clics) ; GA4 2026-09-16 → 2026-10-16 : 36 vues, 279 s de session. Présentait le jeu comme un « 4X à galaxie procédurale », lien Discord cassé, aucun lien vers le jeu. Le pilier `/blog/jeu-de-strategie-spatiale-gratuit-navigateur-dynasty-nova/` : 3 vues sur la même période.
- Changement : intro à froid alignée sur le pilier, FAQ et meta description corrigées, Discord réparé, CTA tracé `utm_campaign=bienvenue`, liens vers le pilier et le guide débutant (slug et titre inchangés).
- Mesure : départs vers le jeu depuis la page (PostHog Pages.csv, projet 308915) et vues GA4 du pilier et du guide, à relire le 2026-10-30. Pas de point de départ PostHog (site sur son propre projet depuis le 2026-10-16) : juger sur la tendance, sous 30 visiteurs.
- Résultat : à relire

## 2026-10-16 · /pages/, /conditions-generales/, /politique-de-confidentialite/ · noindex des liens parasites sous la marque
- Constat : GSC 2026-07-16 → 2026-10-14, affichées sous la home pour « dynasty nova » : /pages/ 897 impressions, 10 clics (1,11 %) ; /conditions-generales/ 627 impressions, 1 clic (0,16 %) ; /politique-de-confidentialite/ 569 impressions, 0 clic. /pages/ renvoyait aussi vers /home (404).
- Changement : champ `index` des pages (schéma, gabarit, CMS), ces trois pages en `noindex, follow` et hors sitemap ; /home retiré du sommaire ; liens internes avec slash final (en-tête, pieds de page, réglages), qui passaient par une redirection 301.
- Mesure : requête « dynasty nova » dans GSC Requêtes-Pages.csv : clics hors home et part des impressions allant au blog, au guide, au pilier et à la roadmap. À relire le 2026-10-30, seconde lecture le 2026-11-13 (désindexation lente).
- Résultat : à relire

## 2026-10-16 · /blog/dynasty-nova-annonce-et-decompte-louverture-dun-univers/ · titre clarifié
- Constat : GSC 2026-07-16 → 2026-10-14 : 493 impressions, 5 clics (1,01 %), position 1,67, dont 332 impressions et 0 clic sur « dynasty nova ». Titre bancal (« annonce et décompte l'ouverture d'un univers »).
- Changement : titre « Dynasty Nova : les nouveaux univers s'annoncent avec un décompte » (annonce : la marque reste en tête), slug et description inchangés.
- Mesure : CTR GSC de la page (Pages.csv), à relire le 2026-10-30.
- Résultat : à relire

Note de mesure (2026-10-16) : le projet PostHog du jeu (218176) a épuisé son quota le 2026-10-14 (événements hors `$exception` : 2 041 le 14, 4 le 15, 6 le 16). Les inscriptions attribuées à une page (« Inscrits » de Pages.csv) sont nulles jusqu'à la remise à zéro, vers le 2026-11-05 : période exclue des comparaisons d'inscriptions. Le site a basculé sur son propre projet (308915) au déploiement de `9e211ee`.

## 2026-10-17 · / (mobile) · premier écran qui montre le jeu au trafic publicitaire
- Constat : PostHog 308915, 2026-10-16 → 2026-10-17 (moins de 7 jours de données, tendance) : 20 sessions `fb / paid` (campagne 120248449199420618), toutes sur mobile dans le navigateur intégré Facebook, toutes entrées sur `/` : 0 `play_click`, 0 clic d'aucune sorte, scroll moyen 1,6 %, durée médiane 11 s, LCP p75 1 265 ms. Autres sessions mobiles sur `/` : 15 sessions, 11 `play_click`, scroll moyen 35,2 %. GA4 2026-09-17 → 2026-10-17 : 178 sessions `fb / paid`. Le bouton était visible au premier écran (360×560), mais ce premier écran n'était que du texte, les écrans du jeu commençant sous la ligne de flottaison.
- Changement : sous 640 px seulement, sous-titre court (`subtitleShort`), atouts « Gratuit · Sans téléchargement · Mobile et ordinateur » au-dessus du bouton, « Découvrir le jeu » masqué, marges resserrées : le haut des téléphones entre dans le premier écran (à 504 px sur 360×560). Ordinateur inchangé. Commit `7a154b4`.
- Mesure : part des sessions `fb / paid` avec `play_click` (départ : 0 / 20) et scroll moyen ; contrôle : conversion des autres sessions mobiles sur `/` (départ : 11 `play_click` / 15 sessions). À relire le 2026-10-31.
- Résultat : à relire

## 2026-10-17 · / · meta description qui nomme l'ancienne marque
- Constat : GSC 2026-07-17 → 2026-10-15, Requêtes-Pages.csv : « astro nova » sur `/`, 202 impressions, 11 clics (5,45 %), position 4,72. La description de la home ne disait pas que Dynasty Nova s'appelait Astro Nova.
- Changement : description « Dynasty Nova, anciennement Astro Nova : jeu de stratégie spatiale gratuit, sans téléchargement… » ; titre inchangé. Commit `7a154b4`.
- Mesure : CTR de « astro nova » sur `/` ; contrôle : « dynasty nova » (départ : 74,30 %, 572 impressions, position 1,02, Requêtes.csv). À relire le 2026-10-31, seconde lecture le 2026-11-14 (reprise de la description par Google).
- Résultat : à relire

## 2026-10-17 · /roadmap/, /blog/ · bouton vers le jeu
- Constat : GA4 2026-09-17 → 2026-10-17 : /roadmap/ 90 vues, /blog/ 106 vues. PostHog 2026-10-16 → 2026-10-17 : /roadmap/ 5 visiteurs, 0 départ, 66,67 % lus jusqu'au bout ; /blog/ 6 visiteurs, 0 départ, scroll moyen 22,4 %. Sur mobile, aucun lien visible vers le jeu sur ces pages (seulement dans le menu).
- Changement : bloc `cta` en fin de roadmap (bloc remis aux couleurs du site : carte sombre, bouton bleu) ; bouton « Jouer gratuitement » sous le chapeau de /blog/. Commit `7a154b4`.
- Mesure : départs vers le jeu depuis ces deux pages (PostHog Pages.csv), en tendance sous 30 visiteurs. À relire le 2026-10-31.
- Résultat : à relire

## 2026-10-17 · trois articles sans lien vers le jeu · CTA tracé et maillage (entrée rattrapée le 2026-10-19)
- Constat : GA4 2026-09-19 → 2026-10-19 : /blog/dynasty-nova-jeu-de-gestion-de-ressources-ce-qui-fait-la-difference/ 17 vues, /blog/dynasty-nova-pourquoi-les-jeux-comme-ogame-fascinent-encore-20-ans-apres/ 6 vues, /blog/dynasty-nova-pourquoi-renommer-astro-nova-en-pleine-beta/ 1 vue. Aucun des trois n'avait de lien vers le jeu.
- Changement : intro à froid, CTA tracés `intention-gestion-ressources`, `intention-jeux-comme-ogame` et `astro-nova`, maillage vers le pilier, le guide et les articles voisins ; slugs, titres et dates inchangés. Commit `e09da7a`.
- Mesure : départs vers le jeu depuis ces trois pages (PostHog Pages.csv), en tendance sous 30 visiteurs. À relire le 2026-10-31.
- Résultat : à relire

## 2026-10-19 · /blog/<slug>/ (tous les articles) · bouton vers le jeu en fin d'article
- Constat : PostHog 308915, 2026-10-16 → 2026-10-19 (3 jours, tendance) : aucun article n'a de départ vers le jeu (Pages.csv). /blog/dynasty-nova-des-lunes-en-orbite-de-vos-planetes/ : 6 entrées, 7 vues, 6 visiteurs, 0 départ, durée médiane 119,8 s, 50 % lus jusqu'au bout, arrivées surtout par l'e-mail du jeu (`resend / email-e07`). 40 articles publiés sans aucun lien vers play.dynastynova.com ; le gabarit d'article n'en avait pas.
- Changement : bloc « Fondez votre empire dans Dynasty Nova », bouton « Jouer gratuitement » et atouts de la home (Gratuit · Sans téléchargement · Mobile et ordinateur), entre le texte et la FAQ, dans `src/pages/blog/[...slug].astro`. Lien sans UTM : BaseLayout pose l'origine et la page de départ.
- Mesure : départs vers le jeu depuis les pages /blog/<slug>/ (Pages.csv, départ : 0) ; part des `play_click` d'article dont `link_text` vaut « Jouer gratuitement ». À relire le 2026-11-02.
- Résultat : à relire

Note de mesure (2026-10-19) : depuis le déploiement de `7a154b4` (2026-10-17 vers 22 h 30), sur mobile et sur `/` : 37 sessions `fb`/`ig`, 0 `play_click`, 15 clics dont la plupart sur les boutons de biome par un seul visiteur, 15 sessions sorties avant toute mesure Web Vitals ; autres sessions mobiles : 29 sessions, 21 `play_click` (PostHog 308915, requête SQL). Tendance à confirmer à la relecture du 2026-10-31 : la perte du trafic payant semble venir de l'annonce (clics accidentels, navigateur intégré) plus que de la page. Le projet du jeu (218176) est toujours hors quota (1 à 11 événements par jour hors `$exception` du 15 au 19) : aucune inscription mesurable avant la remise à zéro.
