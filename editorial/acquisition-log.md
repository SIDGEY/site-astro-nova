# Journal d'acquisition

Un changement du site par entrée, avec sa mesure de départ et sa date de relecture (voir
le skill `acquisition`). On ne réécrit jamais une entrée passée, on complète son résultat.

## 2026-10-16 · tout le site · installation de PostHog
- Constat : GA4 ne donne pas les départs vers le jeu par page, seulement leur total.
- Changement : PostHog sur toutes les pages (`src/lib/posthog.ts`), `play_click` envoyé aussi à PostHog, `npm run posthog:fetch`.
- Mesure : premier `posthog:fetch` exploitable après 7 jours de données.
- Résultat : à relire
