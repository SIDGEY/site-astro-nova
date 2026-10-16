/**
 * Le catalogue du jeu, tel que `scripts/sync-game.mjs` l'a tiré de `Dynasty-Nova/Frontend`.
 *
 * C'est la seule porte vers ces données : les écrans reconstruits de la home (`components/game/`)
 * et les blocs qui les composent y lisent noms, descriptions et images, au lieu d'en garder une
 * copie dans le contenu. Pour suivre le jeu : relancer la synchro, rien d'autre.
 */
import catalog from '../data/game.json';

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

export const ENTITY_FAMILIES = ['buildings', 'facilities', 'defenses', 'ships', 'research', 'packs'] as const;
export type EntityFamily = (typeof ENTITY_FAMILIES)[number];

export const RESOURCE_ORDER = ['metal', 'crystal', 'hydrogen', 'energy'] as const;
export type ResourceCode = (typeof RESOURCE_ORDER)[number];

export const gameSource = catalog.source;
export const nav = catalog.nav as Record<string, string>;
export const logo = catalog.logo;
export const banners = catalog.banners as Record<string, string>;
export const backdrops = (catalog as { backdrops: { space: string } }).backdrops;
export const avatars = catalog.avatars as GameAvatar[];
export const planets = catalog.planets as Record<
  string,
  { variant: string; albedo: string; normal?: string; specular?: string; clouds?: string; airless?: boolean; sphere?: string; horizon?: string; atmosphere?: Record<string, unknown> }
>;

export const resources = catalog.resources as Record<ResourceCode, GameResource>;

export function family(name: EntityFamily): GameEntity[] {
  return catalog[name] as GameEntity[];
}

/**
 * Résout des codes en entités, dans l'ordre demandé. Un code inconnu fait échouer le build : c'est
 * le signe qu'une entité a été renommée ou retirée du jeu, et la home doit le savoir plutôt que
 * d'afficher une vignette vide.
 */
export function pick(name: EntityFamily, codes?: string[]): GameEntity[] {
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
}

/** URL d'une bannière de page du jeu (`heroes/<nom>`) ; un nom inconnu fait échouer le build. */
export function banner(name: string): string {
  const url = banners[name];
  if (!url) {
    throw new Error(`Bannière « ${name} » absente du jeu (connues : ${Object.keys(banners).join(', ')}).`);
  }
  return url;
}
