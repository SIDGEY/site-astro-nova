# Pilotage par API : accès, commandes, garde-fous

Trois scripts, un module commun :

| Script | Rôle |
|---|---|
| `scripts/ads-google.mjs` | Google Ads (bibliothèque `google-ads-api`, Google Ads API v25 ; c'est la bibliothèque Node de référence, maintenue par Opteo : Google n'en publie pas pour Node) |
| `scripts/ads-reddit.mjs` | Reddit Ads API v3 |
| `scripts/ads-report.mjs` | compte rendu hebdomadaire, sans interaction |
| `scripts/ads-lib.mjs` | garde-fous, journal, requêtes PostHog communes |

Les en-têtes des scripts décrivent la mise en place pas à pas. Les secrets vont dans `.env.local`
(ignoré par Git), la liste commentée est dans `.env.example`.

## Mise en place (une fois, par l'utilisateur)

**Google Ads**
1. Projet Google Cloud de GA4/GSC : activer « Google Ads API » et « Data Manager API ».
2. Depuis le 2026-09-09, **le jeton développeur est retiré** (facultatif, ignoré) : le niveau
   d'accès est celui du projet Cloud. Au niveau Test, seuls les comptes de test répondent
   (`CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION`) : demander **Explorer** dans la page Google Ads API
   du projet pour piloter le vrai compte.
3. Client OAuth « Application de bureau », jeton de rafraîchissement avec les scopes `adwords` et
   `datamanager`, écran de consentement publié (en mode test, le jeton expire en 7 jours).
4. `GOOGLE_ADS_CUSTOMER_ID` (et `GOOGLE_ADS_LOGIN_CUSTOMER_ID` si l'accès passe par un MCC).
5. Toute campagne du compte doit porter la déclaration « publicité politique UE » : depuis le
   2026-04-01, une seule campagne non déclarée bloque toute modification de campagne du compte.
   `read` les signale (colonne « Déclaration UE » de `Campagnes.csv`) ; le script déclare celles
   qu'il crée.
6. Import des conversions : `create-conversion-actions --apply`, reporter les deux ID dans
   `.env.local`. L'import passe par la **Data Manager API** : depuis le 2026-06-15,
   `UploadClickConversions` refuse les comptes qui ne l'utilisaient pas déjà.

**Reddit Ads**
1. Business Manager > Developer Portal : créer l'app (admin d'une entreprise vérifiée).
2. Autoriser (URL dans l'en-tête de `ads-reddit.mjs`), puis
   `node scripts/ads-reddit.mjs token --code <code> --redirect-uri <URI>` : le jeton de
   rafraîchissement est écrit dans `.env.local` sans être affiché.
3. Créer le pixel dans l'Events Manager (`REDDIT_ADS_PIXEL_ID`) : obligatoire sur tout groupe
   d'annonces depuis le 2026-07-13.
4. Le compte doit être en euros, sinon les écritures de budget sont refusées.
5. Les annonces Reddit reposent sur un post : le créer dans le gestionnaire avec une vraie capture
   du jeu, puis renseigner son `postId` dans la spec avant `create`.

## Commandes

```bash
# Lecture (aucun risque)
npm run ads:google -- read --days 30        # .ads-cache/google-<date>/ : Campagnes, Jours, Annonces, MotsCles, TermesDeRecherche, Negatifs
npm run ads:reddit -- read --days 30        # .ads-cache/reddit-<date>/ : Campagnes, Groupes, Annonces, Jours, ParGroupe, ParCommunaute
npm run ads:report                          # semaine passée → editorial/ads-log.md
npm run ads:google -- lint --spec editorial/ads/google/search-fr-ogame.json   # hors ligne

# Écritures : toujours d'abord sans --apply (plan affiché, validé par l'API Google en validate_only)
npm run ads:google -- pause --campaign <id> --reason "…"
npm run ads:google -- add-negatives --campaign <id> --phrase "a,b" --exact "c"
npm run ads:google -- replace-ad --ad-group <id> --ad <id> --spec <f> --group <g> --variant <v>
npm run ads:google -- set-budget --campaign <id> --eur <montant>
npm run ads:google -- create --spec <f> --budget-eur <j> --max-cpc-eur <cpc>
npm run ads:google -- enable --campaign <id>
npm run ads:google -- upload-conversions --kind signup --days 3
npm run ads:reddit -- pause --campaign <id> | --ad-group <id>
npm run ads:reddit -- exclude-keywords --ad-group <id> --add "a,b"
npm run ads:reddit -- set-budget --ad-group <id> --eur <montant>
npm run ads:reddit -- create --spec <f> --budget-eur <j par groupe> --bid-eur <cpc>
npm run ads:reddit -- upload-conversions --days 3
```

## Ce que les scripts refusent d'eux-mêmes

| Garde-fou | Où |
|---|---|
| Aucune écriture sans `--apply` | `gate()` de `ads-lib.mjs` |
| Aucune écriture sans `ADS_DAILY_CAP_EUR`, ni au-delà (budgets actifs de toutes les régies ; l'autre régie doit avoir été lue depuis moins de 24 h) | `guardDailyCap()` |
| Hausse de budget > +30 % par rapport au plus bas budget connu sur 7 jours | `guardBudgetIncrease()` |
| Création, activation, hausse de budget sans `--confirm <jeton>` du plan affiché | `gate()` |
| Campagne `"status": "bloque"` | `create` |
| Nom hors convention, `utm_campaign` absent ou différent du nom, titre > 30, description > 90, chemin > 15, « OGame » dans le chemin affiché | `loadSpec()` |
| Deux campagnes du même nom (le nom est la clé de jointure) | `create` |
| Import d'achats tant que le jeu n'envoie pas d'événement d'achat | `upload-conversions` |
| Écriture de budget Reddit sur un compte qui n'est pas en euros | `eurAccount()` |

Chaque écriture appliquée ajoute à `editorial/ads-log.md` l'état avant/après et la commande de
retour arrière.

## Qui décide quoi

| Action | Qui |
|---|---|
| Lire, calculer, écrire le journal | le skill, seul (y compris en tâche planifiée) |
| Pause d'une campagne ou d'un groupe, mots-clés négatifs ou exclus, remplacement d'une annonce par une variante de la spec | le skill, seul, **si une règle d'arrêt ou le rapport des termes le justifie** (citer la règle dans `--reason`) |
| Import de conversions | le skill, seul |
| Hausse de budget, création de campagne, activation | **accord explicite de l'utilisateur dans la conversation**, puis `--confirm <jeton>` |
| Baisse de budget | le skill, seul si une règle le justifie, sinon proposé |
| Nouveau texte d'annonce (hors variantes déjà validées dans une spec) | proposé, puis ajouté à la spec par une PR |

**Mode auto de Claude Code** : il peut bloquer une écriture sur une campagne payante, même
justifiée. Dans ce cas, ne pas contourner : donner à l'utilisateur la commande exacte (avec
`--apply` et, s'il y a lieu, `--confirm`) à lancer dans son terminal. Le journal s'écrit pareil.

## Tâche planifiée

Le compte rendu du lundi tourne sans personne :

```bash
cd "<dépôt>" && npm run ads:report    # code de sortie 2 si une alerte a été levée
```

En lecture seule par défaut : un garde-fou J7 franchi devient une **ALERTE** dans le journal, et
la pause attend une session interactive. Avec `--apply-guards`, le script met lui-même en pause
les campagnes que le garde-fou désigne (et seulement celles-là) : à n'ajouter à la tâche planifiée
que si l'utilisateur l'a décidé.
