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
