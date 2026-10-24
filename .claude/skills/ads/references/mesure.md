# Mesure : du clic payé au joueur qui paie

Ce fichier fixe ce que chaque chiffre du journal veut dire. Un chiffre qui ne se calcule pas
comme ici n'entre pas dans le journal.

## La chaîne d'attribution

```
annonce (Google, Reddit)
  └─ URL finale : page d'atterrissage + utm_* + identifiant de clic (gclid / gbraid / wbraid, rdt_cid)
       └─ dynastynova.com : la première page de la session retient utm_* et identifiant de clic
          (sessionStorage `dn_session_origin`, src/layouts/BaseLayout.astro)
            └─ clic vers play.dynastynova.com : le lien reçoit utm_source/medium/campaign/term de la
               session, utm_content = chemin de la page de départ, et l'identifiant de clic
                 └─ jeu : posthog-js lit utm_* et identifiants de clic sur la page vue d'arrivée
                    (propriétés d'événement, puis `$initial_*` sur la personne) ; le Frontend envoie
                    utm_* au Backend à l'inscription (entité UserAcquisition, dernier contact, 30 jours)
```

Conséquences :
- **La clé de jointure entre régies, GA4 et PostHog est `utm_campaign`**, égale au nom de la
  campagne dans la régie. Ne jamais renommer une campagne en cours : on casse la série.
- `utm_content` côté site garde l'ID de l'annonce (GA4, PostHog 308915), mais il arrive dans le jeu
  remplacé par le chemin de la page de départ (c'est le pont page → inscription du skill
  `acquisition`). Les inscriptions se lisent donc **par campagne et par page d'atterrissage**, pas
  par annonce. Par annonce, on juge sur les clics et le CTR de la régie.
- L'identifiant de clic n'existe dans le jeu que pour les visiteurs arrivés après le déploiement
  du relais (`CLICK_ID_KEYS` de BaseLayout). Avant, aucun import de conversion n'est possible.

## Convention UTM

| Paramètre | Valeur | Exemple |
|---|---|---|
| `utm_source` | la régie, en minuscules | `google`, `reddit`, `youtube`, `meta`, `tiktok` |
| `utm_medium` | `cpc` pour toute régie au clic ; `sponsor` pour un créateur payé au forfait | `cpc` |
| `utm_campaign` | `<canal>-<langue>-<audience>`, identique au nom de la campagne dans la régie | `search-fr-ogame`, `reddit-en-4x` |
| `utm_content` | l'ID de l'annonce (macro de la régie) | Google `{creative}`, Reddit macro d'ID d'annonce |
| `utm_term` | le mot-clé (Google `{keyword}`) ou le groupe d'annonces (Reddit) | `{keyword}` |

Google : les UTM vont dans le **suffixe d'URL finale** de la campagne (`final_url_suffix`), le
`gclid` est ajouté par le marquage automatique (à laisser activé). Reddit : UTM et macros dans
l'URL de destination de l'annonce, `rdt_cid` ajouté par Reddit.

La campagne Meta déjà en place (skill `acquisition`) porte `utm_source=fb|ig&utm_medium=paid` :
elle reste hors du compte rendu `ads` tant qu'elle n'est pas passée à cette convention.

Canaux (`<canal>`) : `search` (Google Search), `reddit`, `yt` (créateur YouTube : `yt-<langue>-<chaine>`),
`meta`, `tiktok`. Langues : `fr`, `en`, `es` (le jeu n'a pas d'allemand : voir canaux.md).

## Définitions

Toutes par campagne (`utm_campaign`), sur la même fenêtre de dates pour toutes les sources
(par défaut les 7 derniers jours complets, lundi → dimanche, fuseau Europe/Paris).

| Mesure | Définition | Source |
|---|---|---|
| Dépense | coût facturé par la régie, en euros | régie (API) |
| Clics, impressions, CTR | tels que la régie les compte | régie |
| CPC | dépense ÷ clics | calcul |
| Sessions | sessions GA4 de dynastynova.com avec `sessionCampaignName` = campagne | GA4 |
| Départs vers le jeu | sessions du site avec un `play_click`, campagne d'entrée de session | PostHog 308915 |
| Inscriptions | personnes du jeu dont la page vue d'arrivée porte la campagne et qui ont un `auth_signup_submitted` | PostHog 218176 |
| Coût par inscription | dépense ÷ inscriptions | calcul |
| Rétention J1 / J7 | part des inscrits actifs (une `$pageview` du jeu) dans la fenêtre [J+1, J+2[ / [J+7, J+8[ après leur inscription, sur les seuls inscrits dont la fenêtre est terminée | PostHog 218176 |
| Revenu attribué | somme des achats en argent réel des inscrits de la campagne | aucune source à ce jour (voir plus bas) |
| Valeur par inscription | revenu attribué ÷ inscriptions, sur une cohorte d'au moins 30 jours | calcul |

Limites connues, à rappeler dans chaque compte rendu où elles jouent :
- `auth_signup_submitted` part au clic sur « Créer un compte », **avant** la réponse du serveur :
  il compte aussi les tentatives refusées. Le Backend (`GET /admin/acquisition`, rôle admin) compte
  les inscriptions réelles par source/support/campagne/contenu : c'est la référence dès qu'un accès
  admin est branché, et le seul recours quand PostHog est aveugle.
- **Quota PostHog du jeu** (plan gratuit, 1 million d'événements par mois, remise à zéro vers le 5) :
  quand il est épuisé, plus aucune inscription ni rétention n'est mesurée. Vérifier chaque semaine
  (requête plus bas). Une semaine touchée n'a pas de coût par inscription : case vide, pas d'estimation.
- **Revenu** : le jeu n'envoie aucun événement pour un achat en argent réel (Stripe Checkout, retour
  `?payment=success` sans événement ; `shop_pack_purchase_confirmed` ne couvre que les packs payés
  en points stellaires et n'a pas de montant en euros). Tant que ce n'est pas corrigé dans le jeu
  (événement serveur au webhook Stripe, avec montant, devise et utilisateur), revenu et valeur par
  inscription restent vides, et la règle d'arrêt « coût > 2 × valeur » s'appuie sur la valeur
  **estimée** posée dans le plan avant lancement, signalée comme telle.
- Sous 10 inscrits dans une cohorte, un taux de rétention est une tendance, pas une mesure : le dire.

## Règles d'arrêt par défaut

Écrites dans le plan de chaque campagne **avant** son lancement (`editorial/ads-plan.json`, hors Git),
avec les montants propres à la campagne. Par défaut :

1. **Rétention J7 des inscrits payés < 15 %** sur 7 jours glissants (inscrits de J-14 à J-8) →
   pause de la campagne et alerte. Garde-fou codé dans `scripts/ads-report.mjs` (au-dessus de
   `ADS_MIN_COHORT` inscrits, 10 par défaut ; en dessous, alerte « échantillon trop faible » sans pause).
2. **Coût par inscription > 2 × valeur d'une inscription** (mesurée si disponible, sinon estimée
   au plan) sur 14 jours → couper.
3. **Budget de test épuisé sans aucune inscription** → couper et relire la chaîne de mesure avant
   tout autre diagnostic (une campagne à zéro inscription est plus souvent un suivi cassé qu'une
   audience nulle).
4. Sinon : **maintenir**, ou **monter d'un palier** (+30 % au plus par semaine et par campagne) si
   coût par inscription < valeur et rétention J7 ≥ 15 % sur une cohorte d'au moins 10 inscrits.

## Requêtes de contrôle

Santé du PostHog du jeu (projet 218176) avant toute lecture d'inscriptions :
```sql
SELECT toDate(timestamp) AS jour, countIf(event = '$exception') AS erreurs,
       countIf(event != '$exception') AS autres, countIf(event = 'auth_signup_submitted') AS inscriptions
FROM events WHERE timestamp > now() - INTERVAL 14 DAY GROUP BY jour ORDER BY jour DESC
```
Des `autres` à zéro avec des erreurs qui continuent : quota épuisé, période exclue.

Inscrits payés et rétention par campagne : c'est `scripts/ads-report.mjs` qui les calcule (requête
HogQL commentée dans le script), pour que le calcul soit le même chaque semaine.
