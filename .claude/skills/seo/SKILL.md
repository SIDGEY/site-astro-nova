---
name: seo
description: >-
  Lance l'agent `seo-expert` sur dynastynova.com : audit SEO fondé sur les vraies données
  (indexation URL Inspection, crawl du build, GSC marque / hors marque, SERP réelles,
  citations par les moteurs génératifs), au plus 5 changements chiffrés et classés,
  application après validation, journal `editorial/seo-log.md` relu à J+28. Ne rédige pas
  d'article (c'est `dynasty-article`) et ne publie rien (c'est `publication`). Déclencher
  quand l'utilisateur parle de SEO, de référencement, d'indexation, de positions Google,
  de title ou meta description, de maillage interne, de mots-clés, de GEO ou de
  visibilité dans ChatGPT / AI Overviews, ou veut relire l'effet d'un changement SEO.
argument-hint: "[audit | technique | indexation | contenu | geo | page <url> | relire]"
---

# seo — l'agent `seo-expert` aux commandes, toi aux validations

Le travail lourd (fetchs, crawl, inspection d'URLs, recherches web) tourne dans le
sous-agent `seo-expert` (`.claude/agents/seo-expert.md`), pour que la conversation ne
reçoive que ses conclusions. Ce skill garde **deux points d'arrêt** : ① validation des
changements proposés, ② relecture du diff avant commit.

## Étape 0 — Cadrer

Argument (défaut `audit`) :

| Argument | Périmètre donné à l'agent |
|---|---|
| `audit` | les 7 couches de la méthode, tout le site |
| `technique` | exploration, indexation, balises, JSON-LD, performance (couches 1, 2, 5) |
| `indexation` | statuts URL Inspection de tous les articles publiés, causes, maillage à créer |
| `contenu` | intentions hors marque, SERP, cannibalisation, pages piliers, maillage (3, 4) |
| `geo` | citations par les moteurs génératifs, FAQ, réponses directes (6) |
| `page <url>` | une seule page, toutes couches, avec la SERP de sa requête cible |
| `relire` | seulement les entrées « à relire » échues du journal |

Lire `editorial/seo-log.md` s'il existe : une entrée « Résultat : à relire » dont la date
est passée se traite **avant** toute nouvelle proposition (l'ajouter au brief de l'agent).

## Étape 1 — Lancer l'audit

Outil `Agent`, `subagent_type: "seo-expert"`, avec un brief qui contient : le mode
`audit`, le périmètre ci-dessus, la date du jour, les entrées à relire, et toute
contrainte donnée par l'utilisateur dans sa demande. L'agent rend son rapport (état des
lieux, problèmes classés, ≤ 5 changements, sujets pour `dynasty-article`, actions pour
l'utilisateur). Noter son identifiant : l'Étape 3 le réutilise.

Si le type `seo-expert` est introuvable (agent créé pendant la session), lancer un agent
`general-purpose` dont le brief commence par « Lis `.claude/agents/seo-expert.md` et
applique-le comme tes instructions », puis la suite du brief.

## Étape 2 — Présenter (point d'arrêt ①)

Restituer le rapport sans le délayer : état des lieux, puis les changements proposés
numérotés, chacun avec son constat chiffré et sa date de relecture. Une seule question
pour le lot : lesquels appliquer, et avec quelles retouches. Rien n'est modifié avant
la réponse.

## Étape 3 — Appliquer

Reprendre **le même agent** (outil `SendMessage` vers son identifiant ; le charger par
`ToolSearch` s'il est différé) pour garder son analyse : mode `appliquer`, liste exacte
des changements validés et retouches de l'utilisateur. Il modifie, construit, relance
`seo:audit`, journalise et rend `git diff --stat` avec ses vérifications.

## Étape 4 — Relire et commiter (point d'arrêt ②)

Montrer le diff (`git diff`, filtré aux fichiers touchés), puis commiter sur demande avec
un message du style du repo (`fix(seo): …`, `feat(seo): …`). Le push sur `main` déploie
le site par FTP : seulement si l'utilisateur le demande. Après un déploiement qui change
des balises ou le maillage, proposer à l'utilisateur de demander l'indexation des une ou
deux URLs clés dans Search Console (c'est lui qui le fait).

## Étape 5 — Passer le relais

Terminer par trois lignes au plus :
- sujets ou refontes pour `dynasty-article` (avec la requête qui les justifie) ;
- ce qui relève de la conversion pour `acquisition` ;
- les actions qui restent à l'utilisateur (Search Console, backlinks, comptes tiers).

## Garde-fous

- Aucun chiffre interne dans un fichier versionné : le dépôt est public. Les chiffres
  restent dans la conversation, `.seo-cache/` et `editorial/seo-log.md` (hors Git).
- Un audit qui n'a pas pu lire une source (clé absente, quota, API en erreur) le dit, et
  ne présente pas comme mesuré ce qui ne l'est pas.
- Jamais plus de 5 changements par run : on mesure ce qu'on change.
