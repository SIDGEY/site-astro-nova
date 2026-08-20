# Charte visuelle des covers générées — dynastynova.com

Style de rendu utilisé par `scripts/generate-cover.mjs` pour produire une cover
**unique par article** (au lieu de piocher dans le pool de 27 images de repli
`public/uploads/blog/covers/cover-{1..27}.webp`, qui sont des macro-photos
abstraites génériques téléchargées, sans lien thématique avec le jeu).

## 1. Pourquoi ce style

Contrainte de départ : matcher le pool de covers de repli déjà en place
(`public/uploads/blog/covers/cover-{1..27}.webp`) — des photos macro
**très défocalisées**, téléchargées, sans lien thématique avec le jeu, mais
avec un rendu visuel cohérent qu'il ne faut pas trahir : aucune forme
reconnaissable, juste un dégradé doux d'une seule teinte, avec du grain, et
**aucun noir** — le cadre est rempli de couleur du bord à bord.

Une première version de ce style visait un rendu "nébuleuse spatiale" (ruban
net, fond presque noir, particules scintillantes) — jugée trop éloignée de
l'existant après relecture (2026-08-20) : trop de noir, pas assez zoomé, un
rendu trop proche d'un effet VFX numérique plutôt que d'une photo macro
floue. Corrigé pour matcher fidèlement le pool existant.

## 2. Composition constante (le "rendu maison")

Macro extrême, si proche et si floue qu'**aucune forme n'est reconnaissable**
— juste un champ de lumière colorée qui remplit tout le cadre bord à bord,
sans fond sombre, sans vignettage, sans coin noir. Grain de pellicule fin
visible sur toute l'image — une photo légèrement imparfaite, pas un rendu
numérique propre.

**Une seule teinte dominante par cover**, dégradée en douceur d'un point
presque blanc (le plus lumineux) à une zone bien saturée de cette même
teinte — jamais vers le noir, jamais une deuxième couleur franchement
différente dans la même image.

Cette contrainte (teinte unique + cadrage plein) est décidée pour la même
raison que chez beryldesign : Cloudflare Workers AI (`flux-1-schnell`, backend
par défaut, gratuit) sort un carré 512×512 fixe sans contrôle d'aspect ratio —
`sharp` recadre ensuite en 5:3 en ne gardant que la bande centrale. Un champ
de lumière qui remplit déjà tout le cadre ne perd jamais un élément de sens
isolé à ce recadrage.

## 3. Le prompt final = préambule + brief + suffixe négatif

Le script assemble trois blocs (voir `RENDER_PREAMBLE`/`NEGATIVE_SUFFIX` dans
`scripts/generate-cover.mjs`) :

1. **Préambule constant** (technique) — décrit la composition macro, la
   lumière, la règle "une seule teinte" ci-dessus. Ne change jamais.
2. **Brief de composition** — le champ `coverPrompt` du frontmatter de
   l'article (voir §4), qui **nomme la teinte** et ajoute 1-2 détails propres
   au sujet (ex. "avec de fins filaments dorés" pour un article sur les
   ressources).
3. **Suffixe négatif constant** — exclusions techniques (pas de texte, pas de
   logo, pas de visage, pas plusieurs couleurs, pas de planète à surface
   solide avec continents, etc.).

## 4. Écrire un bon `coverPrompt`

Le `coverPrompt` est un **brief court**, pas le prompt final — le
préambule/suffixe s'en chargent déjà de tout le reste (flou, absence de noir,
grain). Il ne doit faire que **nommer la teinte**, cohérente avec le sujet de
l'article — ne pas ajouter de détail de composition (pas d'objet, pas de
scène, pas de mot "espace"/"nébuleuse"/"ruban" qui tirerait le rendu vers une
forme reconnaissable) :

| Teinte                          | Sujets                                          |
| ------------------------------- | ------------------------------------------------ |
| Bleu électrique (`#3B82F6`-ish) | Technologie, défense, mises à jour techniques    |
| Or / ambre                      | Ressources, économie, historique/lore de l'empire |
| Turquoise / vert nébuleuse      | Exploration, planètes, colonisation              |
| Violet / magenta                | Flottes, combat, guildes/PvP                     |
| Rouge corail                    | Événements compétitifs, alertes, classements     |

Exemples de `coverPrompt` :

```yaml
coverPrompt: "a soft field of electric blue light"
coverPrompt: "a soft field of warm amber and gold light"
coverPrompt: "a soft field of violet and magenta light"
```

Ne jamais décrire une interface, un logo, du texte, un visage, une planète à
surface solide, ni un objet identifiable (ruban, vaisseau, étoile) — le
suffixe négatif l'exclut déjà, mais le brief ne doit pas non plus le
suggérer.

## 5. Format de sortie

1600×960 (ratio 5:3) en WebP, dans
`public/uploads/blog/covers/<slug>.webp` — le même ratio que l'affichage CSS
réel (`aspect-[5/3]` dans `blog/index.astro` et `blog/[...slug].astro`), donc
aucun recadrage supplémentaire côté site. C'est un choix délibéré, différent
du format carré 1920×1920 des 27 images de repli existantes (qui, elles,
perdent ~40% de hauteur à l'affichage) — pas la peine de perpétuer ce
gaspillage pour les nouvelles covers générées.

## 6. Backend

Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`), même compte
que celui déjà utilisé côté beryldesign (tier gratuit, ~10k neurones/jour) —
`CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_API_TOKEN` dans `.env`. Pas de fallback
Gemini ici (nécessiterait d'activer la facturation Google Cloud sur un
projet séparé pour un besoin ponctuel — non justifié).
