/**
 * Le catalogue du jeu, tel que `scripts/sync-game.mjs` l'a tiré de `Dynasty-Nova/Frontend`.
 *
 * C'est la seule porte vers ces données : les écrans reconstruits de la home (`components/game/`)
 * et les blocs qui les composent y lisent noms, descriptions et images, au lieu d'en garder une
 * copie dans le contenu. Pour suivre le jeu : relancer la synchro, rien d'autre.
 *
 * Les textes suivent la langue de la page : `gameFor(locale)` pour les entités, `gameT(locale, clé)`
 * pour les libellés d'interface. En anglais, ce sont ceux du jeu anglais, y compris ce qu'il
 * affiche encore en français (les vaisseaux, par exemple).
 */
import catalog from '../data/game.json';
import gameTexts from '../data/game.i18n.json';
import { LOCALE_META, type Locale } from './i18n';

export interface GameEntity {
  code: string;
  name: string;
  /** Description courte, celle des cartes de liste. */
  description: string;
  /** Description longue, celle des modales (vide si le jeu n'en a pas). */
  longDescription?: string;
  image: string;
}

export interface GameResource extends GameEntity {
  icon: string;
}

export interface GameAvatar {
  code: string;
  name: string;
  image: string;
  background: string;
  /** Rareté et prix en Stellar Points au catalogue de la boutique ; absents si l'avatar n'y est pas. */
  rarity?: 'offered' | 'common' | 'rare' | 'epic' | 'legendary' | 'exclusive';
  price?: number;
}

export interface GameDynasty {
  code: string;
  name: string;
  people: string;
  motto: string;
  /** Le récit de l'écran de choix ; vide pour une dynastie qui n'est pas encore jouable. */
  fiction: string;
  playable: boolean;
  traits: { code: string; name: string; description: string }[];
  scene: string;
  banner: string;
}

export const ENTITY_FAMILIES = ['buildings', 'facilities', 'defenses', 'ships', 'research', 'packs'] as const;
export type EntityFamily = (typeof ENTITY_FAMILIES)[number];

export const RESOURCE_ORDER = ['metal', 'crystal', 'hydrogen', 'energy'] as const;
export type ResourceCode = (typeof RESOURCE_ORDER)[number];

export const gameSource = catalog.source;
export const logo = catalog.logo;
export const banners = catalog.banners as Record<string, string>;
export const backdrops = (catalog as { backdrops: { space: string } }).backdrops;
export const planets = catalog.planets as Record<
  string,
  { variant: string; albedo: string; normal?: string; specular?: string; clouds?: string; airless?: boolean; sphere?: string; horizon?: string; atmosphere?: Record<string, unknown> }
>;

/** URL d'une bannière de page du jeu (`heroes/<nom>`) ; un nom inconnu fait échouer le build. */
export function banner(name: string): string {
  const url = banners[name];
  if (!url) {
    throw new Error(`Bannière « ${name} » absente du jeu (connues : ${Object.keys(banners).join(', ')}).`);
  }
  return url;
}

/** Les textes d'une entité dans une autre langue : seuls ceux que le jeu traduit y figurent. */
type Texts<T> = Partial<Omit<T, 'code'>>;
type EnglishTexts = {
  nav: Record<string, string>;
  resources: Record<string, Texts<GameResource>>;
  avatars: Record<string, Texts<GameAvatar>>;
  dynasties: Record<string, Texts<Omit<GameDynasty, 'traits'>> & { traits?: Record<string, { name?: string; description?: string }> }>;
} & Record<EntityFamily, Record<string, Texts<GameEntity>> | undefined>;

const english = gameTexts.en as unknown as EnglishTexts;
const ui = gameTexts.ui as Record<Locale, Record<string, string>>;

export interface GameCatalog {
  nav: Record<string, string>;
  resources: Record<ResourceCode, GameResource>;
  dynasties: GameDynasty[];
  avatars: GameAvatar[];
  family(name: EntityFamily): GameEntity[];
  /**
   * Résout des codes en entités, dans l'ordre demandé. Un code inconnu fait échouer le build : c'est
   * le signe qu'une entité a été renommée ou retirée du jeu, et la home doit le savoir plutôt que
   * d'afficher une vignette vide.
   */
  pick(name: EntityFamily, codes?: string[]): GameEntity[];
}

function makeCatalog(
  nav: Record<string, string>,
  resources: Record<ResourceCode, GameResource>,
  dynasties: GameDynasty[],
  avatars: GameAvatar[],
  families: Record<EntityFamily, GameEntity[]>,
): GameCatalog {
  const family = (name: EntityFamily) => families[name];
  return {
    nav,
    resources,
    dynasties,
    avatars,
    family,
    pick(name, codes) {
      const all = family(name);
      if (!codes || codes.length === 0) return all;
      return codes.map((code) => {
        const found = all.find((e) => e.code === code);
        if (!found) {
          throw new Error(
            `Entité « ${code} » absente de la famille « ${name} » du jeu (codes connus : ${all.map((e) => e.code).join(', ')}). Relancer \`npm run game:sync\` ou corriger le contenu.`,
          );
        }
        return found;
      });
    },
  };
}

const french = makeCatalog(
  catalog.nav as Record<string, string>,
  catalog.resources as Record<ResourceCode, GameResource>,
  catalog.dynasties as GameDynasty[],
  catalog.avatars as GameAvatar[],
  Object.fromEntries(ENTITY_FAMILIES.map((name) => [name, catalog[name] as GameEntity[]])) as Record<EntityFamily, GameEntity[]>,
);

const overlay = <T extends { code: string }>(list: T[], texts?: Record<string, Partial<T>>): T[] =>
  texts ? list.map((item) => ({ ...item, ...texts[item.code] })) : list;

const CATALOGS: Record<Locale, GameCatalog> = {
  fr: french,
  en: makeCatalog(
    english.nav,
    Object.fromEntries(
      Object.entries(french.resources).map(([code, resource]) => [code, { ...resource, ...english.resources[code] }]),
    ) as Record<ResourceCode, GameResource>,
    french.dynasties.map((dynasty) => {
      const { traits, ...texts } = english.dynasties[dynasty.code] ?? {};
      return {
        ...dynasty,
        ...texts,
        traits: dynasty.traits.map((trait) => ({ ...trait, ...traits?.[trait.code] })),
      };
    }),
    overlay(french.avatars, english.avatars),
    Object.fromEntries(ENTITY_FAMILIES.map((name) => [name, overlay(french.family(name), english[name])])) as Record<
      EntityFamily,
      GameEntity[]
    >,
  ),
};

/** Le catalogue dans la langue d'une page. */
export const gameFor = (locale: Locale): GameCatalog => CATALOGS[locale];

/**
 * Un libellé d'interface du jeu, par sa clé (`espace:chemin`, comme dans le jeu) : celui du jeu
 * français ou du jeu anglais. `{{var}}` est remplacé par `vars` ; avec `count`, la forme plurielle
 * du jeu (`clé_one`, `clé_other`) est choisie. La synchro relève les clés dans le code : la clé
 * s'écrit donc en toutes lettres, en deuxième argument (un gabarit `…rarity.${r}` vaut toutes les
 * clés qui commencent ainsi), et une clé nouvelle demande `npm run game:sync -- --texts`.
 */
export function gameT(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const labels = ui[locale];
  const plural =
    typeof vars?.count === 'number'
      ? (labels[`${key}_${new Intl.PluralRules(LOCALE_META[locale].bcp47).select(vars.count)}`] ?? labels[`${key}_other`])
      : undefined;
  const text = plural ?? labels[key];
  if (text === undefined) {
    throw new Error(`Libellé du jeu « ${key} » absent de src/data/game.i18n.json : lancer \`npm run game:sync -- --texts\`.`);
  }
  return vars ? text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match)) : text;
}
