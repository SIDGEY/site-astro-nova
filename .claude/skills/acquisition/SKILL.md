---
name: acquisition
description: >-
  Analyse dynastynova.com en croisant GSC (requête → page), GA4 (vues, sources) et PostHog
  (départ vers le jeu par page et par source, lecture, frictions, Web Vitals), puis propose
  et applique au plus 3 changements du site pour amener plus de nouveaux joueurs sur
  play.dynastynova.com, chacun noté dans un journal avec sa mesure de départ et relu
  14 jours plus tard. Sert aussi à nourrir le skill `dynasty-article` (sujets qui
  convertissent, articles à remettre à niveau). Déclencher quand l'utilisateur veut
  « analyser le site », « voir ce qui convertit », « améliorer l'acquisition / la home /
  un article selon les données », « faire le point PostHog », ou relire l'effet d'un
  changement passé.
---

# acquisition — analyser, changer, mesurer

Le cercle : **les données disent où le site perd des joueurs → un changement ciblé →
mesure 14 jours plus tard → ce qui marche est généralisé, et les sujets qui convertissent
repartent vers `dynasty-article`.** Ce skill ne publie aucun article (c'est `publication`)
et n'en rédige pas (c'est `dynasty-article`).

**Deux points d'arrêt** : ① validation des changements proposés (≤ 3), ② relecture du
diff avant commit.

## Étape 0 — Rafraîchir et relire le journal

```bash
npm run gsc:fetch
npm run ga4:fetch -- --host dynastynova.com
npm run posthog:fetch                     # --days 14 pour juger un changement récent
```
Puis lire `editorial/acquisition-log.md` : toute entrée « à relire » dont la date est
passée se traite **avant** toute nouvelle proposition (Étape 3).

Sans clés PostHog (`.env`), ou moins de 7 jours de données : le dire, travailler sur
GSC/GA4 seuls et ne présenter aucune conversion comme mesurée.

**Vérifier que PostHog reçoit bien les données** avant d'en tirer quoi que ce soit : le
projet est sur le plan gratuit (1 million d'événements par mois, période qui repart vers
le 5). Quota épuisé, PostHog jette tout sauf les `$exception` : un creux brutal un jour
donné, avec des erreurs qui continuent, c'est le quota, pas une chute du trafic.
```sql
SELECT toDate(timestamp) AS jour, countIf(event = '$exception') AS erreurs,
       countIf(event != '$exception') AS autres
FROM events WHERE timestamp > now() - INTERVAL 14 DAY GROUP BY jour ORDER BY jour DESC
```
(via le MCP PostHog, `execute-sql`). Une période touchée est exclue des comparaisons du
journal.

## PostHog en direct (MCP)

Le MCP `posthog` (outil `mcp__posthog__exec`, région EU) pilote **deux projets**, chacun
avec son quota gratuit d'un million d'événements par mois :

- **308915 « Dynasty Nova »** (organisation « Dynasty Nova Website ») : le **site**.
  Tableau « Site : visiteurs et départs vers le jeu » (dashboard 1030658) : entonnoir
  visite → `play_click`, visiteurs par jour, départs par page, visiteurs par canal.
- **218176 « Dynasty Nova »** (organisation du jeu) : le **jeu**. Tableau « Acquisition :
  du site au joueur » (dashboard 1030608) : arrivées depuis le site → inscription →
  tutoriel par page d'origine, inscriptions par canal de la session.

Le pont entre les deux est `utm_content` : chaque lien du site vers le jeu porte la page de
départ (`BaseLayout.astro`), que le jeu enregistre sur sa page vue d'arrivée.
`posthog:fetch` fait la jointure (colonnes « Arrivés dans le jeu » / « Inscrits » de
`Pages.csv`). Vérifier le projet actif (`call project-get {}`) avant toute requête,
`switch-project` sinon.

- **Annotation à chaque déploiement** qui change le parcours (`annotation-create`, scope
  `project`, dans le projet concerné) : c'est le repère des comparaisons avant/après.
- **Test A/B plutôt qu'avant/après** quand le trafic de la page le permet (quelques
  centaines de visiteurs par variante). Sinon, l'avant/après à J+14 de l'Étape 3.
- Toute modification d'un projet (réglages, expériences, tableaux) se fait sur demande de
  l'utilisateur : lire librement, changer seulement avec son accord.

## Étape 1 — Croiser par chemin de page

La clé de jointure est le chemin (`/blog/<slug>/`) : URL sans domaine dans GSC
(`.gsc-cache/dynastynova.com-Performance-on-Search-*/Pages.csv`, `Requêtes-Pages.csv`),
`Page` dans GA4 et PostHog. Chercher, dans cet ordre de rendement :

1. **Fort trafic, faible départ vers le jeu** (PostHog `Pages.csv` : visiteurs élevés,
   conversion sous la médiane du site) → parcours d'acquisition absent ou faible : CTA
   tracé, intro lisible à froid, maillage vers les pages d'entrée.
2. **Lecture qui s'arrête tôt** (`Lus jusqu'au bout` bas, durée médiane courte alors que la
   requête GSC est précise) → l'article ne répond pas vite à l'intention : remonter la
   réponse, couper l'introduction.
3. **Impressions sans clic** (GSC : impressions élevées, CTR bas, position ≤ 10) → titre
   et meta description, pas le contenu.
4. **Pages d'entrée qui convertissent** (`Entrees.csv`) → les renforcer : liens internes
   depuis les articles à fort trafic vers elles.
5. **Sources qui convertissent** (`Sources.csv`) → Reddit, campagne, référent : à
   signaler pour `dynasty-article` (mode `community-post`) ou pour l'utilisateur.
6. **Frictions** (`Frictions.csv`) : un rage click ou dead click répété sur un élément
   donne un correctif précis (élément qui a l'air cliquable et ne l'est pas, lien cassé).
7. **Appareils** (`Appareils.csv`) : un écart de conversion mobile/desktop pointe la
   version qui décroche ; **Web Vitals** (`Vitals.csv`) : LCP p75 > 2 500 ms, INP p75 >
   200 ms ou CLS p75 > 0,1 sur une page d'entrée, c'est du SEO perdu.

Sous ~30 visiteurs, une page donne une tendance, pas un taux : le dire.

Ce que les CSV ne montrent pas, PostHog le montre : heatmaps et replays. Pour une page
retenue, proposer à l'utilisateur de regarder 3 à 5 replays de sessions sorties sans
`play_click` (Replay > filtre page), ce que Claude ne peut pas faire seul.

## Étape 2 — Proposer au plus 3 changements (point d'arrêt ①)

Pour chacun : la page, le constat chiffré (cité au mot depuis les CSV), le changement,
la mesure qui dira s'il a marché, et la date de relecture (J+14). Préférer le changement
le plus petit qui teste l'hypothèse. Une seule confirmation pour le lot.

Puis appliquer, en respectant les règles du repo :
- articles : parcours d'acquisition et règles de rédaction de `dynasty-article` (Étape 4,
  pas de tiret cadratin, slug inchangé) ;
- home et écrans du jeu : rester fidèle au jeu réel (Frontend), rien d'inventé ;
- `npm run build` doit passer.

## Étape 3 — Journal et relecture

Ajouter une entrée par changement à `editorial/acquisition-log.md` :

```markdown
## 2026-10-16 · /blog/<slug>/ · CTA tracé + intro à froid
- Constat : 412 visiteurs / 30 j, 0,7 % partis vers le jeu, 18 % lus jusqu'au bout.
- Changement : <ce qui a été fait, commit>
- Mesure : conversion visiteurs (PostHog Pages.csv), à relire le 2026-10-30.
- Résultat : à relire
```

À la relecture, `npm run posthog:fetch -- --days 14` et comparer à la mesure de départ
(même durée, en gardant en tête la saisonnalité et le volume). Remplir `Résultat` :
**gagné** (généraliser : appliquer aux pages semblables au prochain run), **neutre** ou
**perdu** (revenir en arrière si la baisse est nette). Ne jamais réécrire une entrée
passée, seulement compléter son résultat.

## Étape 4 — Rendre à `dynasty-article` (point d'arrêt ②)

Montrer le diff, puis commiter (le push sur `main` déclenche le déploiement FTP : le
faire seulement si l'utilisateur le demande). Terminer par ce qui nourrit les articles :
sujets ou formats qui convertissent, articles à remettre à niveau, sources à travailler.

## Garde-fous

- Aucun chiffre interne (trafic, conversion) dans un contenu publié du site : ils restent
  dans le journal et la conversation.
- Ne jamais inventer un chiffre : tout constat cite un CSV daté.
- Ne jamais exposer `POSTHOG_PERSONAL_API_KEY` ni les clés Google.
- Ne pas modifier la configuration de suivi (`src/lib/posthog.ts`, gtag, Meta) sans le
  dire : un changement de mesure fausse toutes les comparaisons du journal.
