---
name: ads
description: >-
  Pilote la publicité payante de Dynasty Nova comme une agence d'acquisition : prépare les
  campagnes (Google Search sur les requêtes OGame en FR/EN/DE, Reddit Ads sur r/OGame, r/4Xgaming,
  r/WebGames, r/incremental_games, créateurs YouTube, Meta/TikTok en audience similaire sur les
  payeurs), les pilote par API (scripts ads-google, ads-reddit), mesure chaque semaine dépense,
  coût par inscription et rétention J7 des inscrits payés en croisant régies, GA4 et PostHog,
  coupe ce que les règles d'arrêt condamnent et propose au plus 3 optimisations chiffrées, le tout
  noté dans editorial/ads-log.md. Hausse de budget et création de campagne seulement après accord.
  Déclencher dès que l'utilisateur parle de pub, d'ads, de campagne payante, de Google Ads, de
  Reddit Ads, de budget publicitaire, de coût par inscription ou d'acquisition payante, veut
  « lancer une campagne », « faire le point sur les pubs », « optimiser les campagnes », ou quand
  une tâche planifiée lance le compte rendu hebdomadaire.
argument-hint: "[setup <canal> | report | optimize | relire]"
---

# ads — l'agence d'acquisition payante, toi aux décisions d'argent

Le cercle : **une campagne se prépare avec ses règles d'arrêt écrites avant le lancement → elle se
mesure chaque semaine en coût par inscription et en rétention J7 → ce qui ne passe pas les règles
est coupé, ce qui les passe monte d'un palier → chaque changement est relu à J+14.**

Le travail lourd (lectures d'API, calculs, diagnostics) tourne dans le sous-agent `ads-manager`
(`.claude/agents/ads-manager.md`), pour que la conversation ne reçoive que ses conclusions. Le
skill garde les décisions qui engagent de l'argent : **création, activation et hausse de budget
n'ont lieu qu'après ton accord explicite**. Le reste (pause, mots-clés négatifs, remplacement
d'une annonce) est appliqué seul quand une règle d'arrêt le justifie, et journalisé.

Références, à lire selon le besoin :
- `references/mesure.md` : chaîne d'attribution, convention UTM, définitions, règles d'arrêt ;
- `references/canaux.md` : ordre des canaux, structure, prérequis bloquants, marque OGame ;
- `references/api.md` : mise en place des accès, commandes, garde-fous codés, qui décide quoi.

## Étape 0 — Cadrer

| Argument | Ce que fait l'agent |
|---|---|
| `setup <canal>` | prépare specs, page d'atterrissage, plan chiffré et commandes, sans rien lancer (`google`, `reddit`, `youtube`, `meta`, `tiktok`, ou une campagne précise) |
| `report` (défaut) | compte rendu de la semaine passée dans le journal, recommandation par campagne, résumé en 5 lignes |
| `optimize` | au plus 3 changements chiffrés, appliqués après validation |
| `relire` | juge les changements dont la relecture J+14 est échue |

Lire `editorial/ads-log.md` s'il existe : toute entrée « Résultat : à relire » échue et toute
**ALERTE** sans suite passent **avant** le reste (les ajouter au brief).

**Prérequis de mesure, à vérifier à chaque run** (détail dans `canaux.md`) : le PostHog du jeu
reçoit des événements (quota du plan gratuit), le relais des identifiants de clic est en
production, le jeu existe dans la langue de la campagne. Si l'un manque : pas de lancement ni de
hausse, et le compte rendu le dit en premier.

## Étape 1 — Lancer l'agent

Outil `Agent`, `subagent_type: "ads-manager"`, avec un brief qui contient : le mode et son
argument, la date du jour, les entrées à relire et alertes en cours, toute contrainte donnée par
l'utilisateur. Noter l'identifiant de l'agent : l'Étape 3 le réutilise.

Si le type `ads-manager` est introuvable (agent créé pendant la session), lancer un agent
`general-purpose` dont le brief commence par « Lis `.claude/agents/ads-manager.md` et applique-le
comme tes instructions », puis la suite du brief.

**Mode `report` lancé par une tâche planifiée** (aucun humain pour répondre) : ne pas lancer
l'agent, exécuter seulement `npm run ads:report`. Le script lit, calcule et écrit le journal ; il
ne modifie aucune campagne (sauf `--apply-guards`, si l'utilisateur l'a choisi pour la tâche) et
sort en code 2 sur une alerte. Rendre son résumé tel quel.

## Étape 2 — Présenter (point d'arrêt ①)

Restituer sans délayer :
- `setup` : livrables (fichiers), prérequis manquants, **plan chiffré à valider** (budget
  journalier, CPC maximal, budget de test, valeur estimée d'une inscription), commandes de
  création qui attendent l'accord ;
- `report` : le résumé en 5 lignes, les écritures déjà faites par l'agent (avec leur retour
  arrière), les décisions qui t'attendent ;
- `optimize` : les changements numérotés, chacun avec son constat chiffré, sa commande et sa date
  de relecture.

Une seule question pour le lot. Rien de ce qui demande ton accord n'est appliqué avant la réponse.

## Étape 3 — Appliquer

Reprendre **le même agent** (`SendMessage` vers son identifiant ; le charger par `ToolSearch` s'il
est différé), mode `appliquer`, avec la liste exacte validée. Pour une création, une activation ou
une hausse de budget, l'agent passe le jeton `--confirm` du plan que tu as validé : si l'état du
compte a changé entre-temps, le script refuse et l'agent revient vers toi.

Si le mode auto de Claude Code bloque une écriture sur une campagne payante, l'agent rend la
commande exacte : la lancer dans ton terminal. Ne jamais contourner.

## Étape 4 — Relire et livrer (point d'arrêt ②)

- Fichiers versionnés (specs, pages d'atterrissage, scripts) : montrer le diff, `npm run build`
  vert, puis commit ou PR selon la demande (`feat(ads): …`). Le push sur `main` déploie le site.
- Avant tout push : **aucun montant, dépense, ID de campagne ni chiffre de conversion** dans le
  diff (`git diff origin/main..` à relire) : le dépôt est public. Journal, plan et relevés restent
  hors Git (`editorial/ads-log.md`, `editorial/ads-plan.json`, `.ads-cache/`, `.env.local`).

## Étape 5 — Passer le relais

Trois lignes au plus :
- la page d'atterrissage ou le message qui convertit, pour `acquisition` et `dynasty-article` ;
- les communautés Reddit qui répondent, pour le mode `community-post` de `dynasty-article` ;
- ce qui reste à faire par toi (accès API, posts Reddit, créateurs à contacter, chantier côté jeu).

## Journal

`editorial/ads-log.md`, hors Git, une entrée par semaine (écrite par `ads:report`, décision
complétée par l'agent) et une entrée par écriture (écrite par les scripts : avant, après, motif,
retour arrière). Les changements d'`optimize` ont leur propre entrée avec mesure de départ et
« Résultat : à relire » à J+14. On ne réécrit jamais une entrée passée, on complète son résultat.

## Garde-fous

- Jamais de chiffre inventé : une donnée absente reste une case vide, dite comme telle.
- Les garde-fous sont dans le code (`scripts/ads-lib.mjs`) : lecture seule par défaut, `--apply`
  pour écrire, plafond `ADS_DAILY_CAP_EUR`, +30 % par semaine au plus, jeton de confirmation pour
  création, activation et hausse. Ne jamais les contourner ni écrire dans une API sans eux.
- Rétention J7 des inscrits payés sous 15 % sur 7 jours glissants : pause et alerte.
- Les nouvelles pages respectent `src/content.config.ts` et la fidélité au jeu réel.
- Aucun secret affiché, aucun chiffre interne versionné.
