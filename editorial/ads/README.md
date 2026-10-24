# Publicité payante : état des campagnes

Dossier versionné du skill `ads` (`.claude/skills/ads/`). Le dépôt est public : ici, aucun
montant, aucune dépense, aucun identifiant de campagne, aucun chiffre de conversion. Budgets,
plafonds et règles chiffrées vivent dans `editorial/ads-plan.json`, le journal dans
`editorial/ads-log.md`, les relevés dans `.ads-cache/` (tous hors Git).

État au 2026-10-24 : **aucune campagne n'existe dans une régie**, rien n'a été envoyé.

## Les campagnes

| Campagne (= `utm_campaign`) | Régie | Spec | Page d'atterrissage | État |
|---|---|---|---|---|
| `search-fr-ogame` | Google Search | `google/search-fr-ogame.json` | `/venir-d-ogame/` | prête, lancement bloqué par les prérequis communs |
| `search-en-ogame` | Google Search | `google/search-en-ogame.json` | `/en/from-ogame/`, `/en/space-strategy-browser-game/` | prête, lancement bloqué par les prérequis communs |
| `search-de-ogame` | Google Search | `google/search-de-ogame.json` | `/de/von-ogame/` (à créer) | **bloquée** : le jeu n'a pas d'allemand (en, fr, es) ; pas de page allemande |
| `reddit-en-ogame` | Reddit Ads | `reddit/reddit-en-ogame.json` | `/en/from-ogame/` | prête, il manque les posts Reddit (`postId`) et les prérequis communs |
| `reddit-en-4x` | Reddit Ads | `reddit/reddit-en-4x.json` | `/en/space-strategy-browser-game/` | prête, il manque les posts Reddit (`postId`) et les prérequis communs |

« Prête » veut dire : spec relue contre le jeu en production, `lint` vert, `create` en dry-run
hors ligne passé. Une campagne prête ne part qu'avec l'accord explicite de l'utilisateur sur le
plan chiffré, puis le jeton `--confirm` affiché par le dry-run.

## Prérequis à lever, dans l'ordre

1. **Mettre en production le relais des identifiants de clic** (`gclid`, `gbraid`, `wbraid`,
   `rdt_cid`) de `src/layouts/BaseLayout.astro` et les trois pages d'atterrissage (push sur
   `main`). Contrôle : arriver sur dynastynova.com avec `?gclid=test&utm_source=google`, puis
   vérifier que le lien vers le jeu porte les deux. Sans ce relais, aucune inscription ne peut
   être renvoyée à une régie.
2. **Attendre que le PostHog du jeu reçoive de nouveau des événements** (quota du plan gratuit
   épuisé à la mi-octobre, remise à zéro attendue début novembre). Contrôle : requête de santé de
   `references/mesure.md`. Tant qu'il est aveugle, aucune inscription ni rétention n'est
   mesurable : on ne lance pas. Envisager de réduire le volume d'événements du jeu ou de changer de
   plan, sinon le quota retombera en cours de campagne.
3. **Brancher les accès API** (procédure : `references/api.md`, en-têtes de
   `scripts/ads-google.mjs` et `scripts/ads-reddit.mjs`), poser le plafond `ADS_DAILY_CAP_EUR`
   dans `.env.local`, puis relancer `create` sans `--apply` : la validation API remplace le
   contrôle hors ligne.
4. **Valider le plan** (`editorial/ads-plan.json`) : budgets, plafonds de CPC, budgets de test.
5. **Reddit seulement** : créer les posts des annonces avec de vraies captures du jeu, renseigner
   leur `postId` dans les specs, créer le pixel Reddit.
6. **Allemand** : seulement quand le jeu sera traduit en allemand ; créer alors `/de/von-ogame/`.
   L'espagnol est déjà dans le jeu : c'est la prochaine langue à ouvrir (spec et page à préparer).

## Ce que l'utilisateur fait lui-même

- Accès API Google Ads (projet Cloud au niveau Explorer, client OAuth, jeton de
  rafraîchissement, identifiant client) et Reddit Ads (application du Developer Portal, jeton,
  compte en euros, pixel).
- Les posts Reddit : rédigés à partir des textes des specs, illustrés par de vraies captures de
  play.dynastynova.com (jamais d'écran inventé), publiés depuis le gestionnaire. Commentaires
  ouverts seulement si quelqu'un peut répondre dans la journée.
- La décision sur le plan chiffré, puis l'accord explicite sur chaque création et chaque
  activation.
- La valeur d'une inscription : export du revenu des premiers jours d'une cohorte passée depuis
  l'admin du jeu, en attendant un événement d'achat côté serveur (voir plus bas).
- La relecture des pages `/en/` : elles sont servies avec la mise en page du site en français
  (langue du document, navigation, pied de page). À corriger dans la mise en page avant de payer
  du trafic anglophone, ou à accepter en connaissance de cause.

## La chaîne de mesure

```
annonce → page d'atterrissage (utm_* dans le suffixe d'URL Google ou les paramètres Reddit,
          + gclid / rdt_cid ajoutés par la régie)
  → dynastynova.com retient utm_* et identifiant de clic pour la session (BaseLayout)
    → le lien vers play.dynastynova.com les reçoit, utm_content = chemin de la page de départ
      → PostHog du jeu lit utm_* et l'identifiant de clic à l'arrivée ; inscription = auth_signup_submitted
        → rétention J1 / J7 (page vue du jeu), import de conversions vers la régie
```

- La clé de jointure entre régies, GA4 et PostHog est `utm_campaign`, égale au nom de la
  campagne : ne jamais renommer une campagne en cours.
- Les inscriptions se lisent par campagne et par page d'atterrissage, pas par annonce
  (`utm_content` est remplacé par le chemin de la page avant d'arriver dans le jeu).
- Le Backend (`GET /admin/acquisition`) compte les inscriptions réelles : c'est la référence,
  et le seul recours quand PostHog est aveugle.
- Le revenu n'est pas mesuré : le jeu n'envoie aucun événement d'achat en argent réel. Tant
  qu'un événement serveur au webhook Stripe n'existe pas, la valeur d'une inscription reste une
  estimation, dite comme telle dans le plan.
- Compte rendu chaque semaine : `npm run ads:report` (définitions et règles d'arrêt :
  `references/mesure.md`).

## Commandes

```bash
node scripts/ads-google.mjs lint --spec editorial/ads/google/search-fr-ogame.json
node scripts/ads-reddit.mjs lint --spec editorial/ads/reddit/reddit-en-4x.json
# création : d'abord sans --apply (plan et jeton), montants pris dans editorial/ads-plan.json
node scripts/ads-google.mjs create --spec editorial/ads/google/search-fr-ogame.json --budget-eur <j> --max-cpc-eur <cpc>
node scripts/ads-reddit.mjs create --spec editorial/ads/reddit/reddit-en-ogame.json --budget-eur <j par groupe> --bid-eur <cpc>
```

Les campagnes sont créées en pause ; l'activation (`enable`) est une seconde décision.
