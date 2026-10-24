# Canaux : dans quel ordre, avec quoi, sous quelles règles

L'ordre suit l'intention. On achète d'abord des gens qui cherchent déjà un jeu comme le nôtre,
puis des communautés qui en parlent, et seulement ensuite de l'audience froide, quand on sait à
quoi ressemble un joueur qui paie.

| Priorité | Canal | Pourquoi | Quand |
|---|---|---|---|
| 1 | Google Search, requêtes OGame | intention explicite (« jeu comme OGame », « OGame mobile ») | dès que la mesure est saine |
| 2 | Reddit Ads : r/OGame, r/4Xgaming, r/WebGames, r/incremental_games | communautés du genre, ciblage par subreddit | en parallèle de Search, budget plus petit |
| 3 | Créateurs YouTube (sponsoring) | confiance d'un créateur du genre, audience qui joue | après 2 à 3 semaines de Search : on sait quelle page et quel message convertissent |
| 4 | Meta, TikTok | audience froide, seulement en **audience similaire bâtie sur les payeurs** | quand la liste des payeurs dépasse le seuil minimal de la régie ; jamais en ciblage large |

## Prérequis communs, bloquants

Une campagne ne se lance pas si l'un manque, et le compte rendu le dit :
1. PostHog du jeu reçoit des événements (requête de santé de `mesure.md`).
2. Le relais utm + identifiant de clic du site est en production (vérifier sur dynastynova.com
   qu'un lien vers le jeu, après arrivée avec `?gclid=test&utm_source=google`, porte bien les deux).
3. **Le jeu existe dans la langue de la campagne** : en, fr, es (Frontend `src/i18n/config.ts`).
   Un navigateur dans une autre langue bascule en anglais.
4. Une page d'atterrissage dédiée dans cette langue (`src/content/pages/`, `index: false`).
5. Le plan (budget de test, valeur estimée d'une inscription, règles d'arrêt chiffrées) est écrit
   dans `editorial/ads-plan.json` **avant** le lancement.
6. `ADS_DAILY_CAP_EUR` est posé dans `.env.local`.

## 1. Google Search

**Structure** : une campagne par langue (`search-fr-ogame`, `search-en-ogame`, plus tard
`search-es-ogame`, `search-de-ogame`), le nom de campagne = `utm_campaign`. Trois groupes
d'annonces par campagne, du plus au moins rentable attendu :
- `alternative` : « jeu comme OGame », « alternative OGame », « jeux similaires à OGame » ;
- `ogame` : la marque concurrente seule ou avec un qualificatif (« OGame mobile », « OGame
  gratuit », « OGame nouvel univers ») : intention mêlée, souvent des joueurs d'OGame qui veulent
  se connecter, donc négatifs serrés et premier groupe à mettre en pause s'il dépense sans inscrire
  (« Maximiser les clics » n'a qu'un plafond de CPC par campagne : pas d'enchère par groupe) ;
- `generique` : « jeu de stratégie spatiale navigateur », « jeu spatial gratuit en ligne ».

**Correspondances** : expression et exacte au départ, pas de requête large tant que la campagne
n'a pas une trentaine de conversions importées sur 30 jours (seuil indicatif, en dessous les
enchères automatiques n'ont pas de quoi apprendre). Enchères : `Maximiser les clics` avec un CPC
maximal au lancement, puis `Maximiser les conversions` sur la conversion « inscription » importée
une fois ce volume atteint.

**Réglages** : réseau Search seul (ni partenaires du Réseau de Recherche, ni Display), ciblage
géographique « présence » (pas « intérêt »), langues de la campagne, marquage automatique activé,
UTM dans le suffixe d'URL finale.

**Mots-clés négatifs**, toutes campagnes : intention outil ou compte OGame (connexion, login, mot
de passe, lobby, gameforge, speedsim, trashsim, simulateur, calculateur, convertisseur, infocompte,
tracker, formule, wiki), triche (bot, hack, cheat, triche, script), téléchargement d'application
(apk, télécharger, download), hors sujet (emploi, stage, pdf, mod). Liste exacte par langue dans
les specs `editorial/ads/google/*.json`. Chaque semaine, le rapport des termes de recherche ajoute
ses négatifs (mode `optimize`).

**Annonces** : annonces responsives (RSA), 15 titres de 30 caractères au plus, 4 descriptions de
90 au plus, chemins d'URL de 15 au plus. Deux annonces par groupe : une qui nomme OGame, une qui
ne le nomme pas.

**Marque OGame** : enchérir sur le mot-clé d'une marque concurrente est permis, mais OGame est une
marque déposée de Gameforge. Si Gameforge a déposé une plainte auprès de Google, une annonce qui
cite « OGame » dans son texte est limitée ou refusée dans les pays concernés : l'annonce sans la
marque prend le relais, c'est pour ça qu'elle existe. Dans tous les cas :
- jamais « OGame » dans le chemin d'URL affiché ni dans un titre qui laisse croire à une version
  d'OGame ou à un lien avec Gameforge ;
- comparatif exact et vérifiable seulement (les lignes du tableau de la page d'atterrissage),
  jamais de dénigrement ;
- la page d'atterrissage dit en FAQ que le jeu est indépendant.

**Allemagne** : premier marché d'OGame, mais **le jeu n'a pas d'allemand**. Mots-clés et annonces
DE sont prêts (`search-de-ogame.json`, `"status": "bloque"`) ; la campagne ne se crée pas avant
une traduction allemande du jeu, sinon on paie des clics qui atterrissent sur un jeu en anglais.
L'espagnol, lui, est déjà traduit dans le jeu : c'est la prochaine langue à ouvrir.

## 2. Reddit Ads

**Structure** : une campagne `reddit-en` par audience, objectif trafic (clics) au départ, puis
conversions quand le pixel ou l'API de conversion Reddit est branché :
- `reddit-en-ogame` : r/OGame → `/en/from-ogame/` ;
- `reddit-en-4x` : r/4Xgaming, r/WebGames, r/incremental_games → `/en/space-strategy-browser-game/`.

Le ciblage par communauté est le levier ; pas d'extension d'audience automatique au départ.

**Annonces** : un titre d'annonce qui ressemble à un post de la communauté, pas à une bannière
(« I'm building a free space 4X that runs on mobile », pas « BEST SPACE GAME ! »), une image tirée
du vrai jeu (captures de `play.dynastynova.com`, jamais d'écran inventé), commentaires ouverts
seulement si l'utilisateur peut y répondre dans la journée. Le ton de r/incremental_games et
r/WebGames est allergique au marketing : parler de la mécanique (production hors ligne, sessions
courtes), pas de superlatifs.

Le post organique reste du ressort du mode `community-post` de `dynasty-article` : ne jamais
publier une annonce qui reprend mot pour mot un post organique en cours.

## 3. Créateurs YouTube

Pas d'API : livrable = une liste de créateurs (base existante `editorial/createurs/`) avec, pour
chacun, la chaîne, la langue, les vidéos du genre, un lien tracé `utm_source=youtube&utm_medium=sponsor&utm_campaign=yt-<langue>-<chaine>`
vers la page d'atterrissage de sa langue, et un code de parrainage si le jeu en propose. Le
contact et la négociation restent à l'utilisateur. Le coût d'un sponsoring entre dans le journal
comme une dépense de campagne, le jour de la publication de la vidéo.

## 4. Meta et TikTok

Seulement en audience similaire bâtie sur les **payeurs** (liste exportée du Backend, hachée par
la régie), jamais sur tous les inscrits ni en ciblage large : l'audience froide coûte cher et ne
ressemble à nos joueurs que si la source leur ressemble. La campagne Meta déjà en place relève du
skill `acquisition` (`npm run meta:fetch`) ; toute modification y est lancée par l'utilisateur.
