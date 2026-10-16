// @ts-nocheck
// GÉNÉRÉ par scripts/sync-game.mjs — copie de src/features/planets/utils/planetAtmosphere.ts (Dynasty-Nova/Frontend @ 26bf68c4).
// Ne pas modifier ici : relancer `npm run game:sync`.
import type { PlanetAtmosphere, PlanetCloudLayer } from './planetSurface.ts';

/**
 * `atmosphere.json` as the codex ships it next to a variant's maps. The keys are those of the
 * codex's rendering prototype, where the cloud layer and the haze were tuned; every setting is
 * written out, defaults included.
 */
interface ShippedAtmosphere {
  atmosphere?: boolean;
  /** File name of the cloud map, `null` when the variant has none (a gas giant). */
  nuages?: string | null;
  cloudalt?: number;
  cloudopacity?: number;
  cloudshadow?: number;
  cloudlon?: number;
  cloudgamma?: number;
  cloudcover?: number;
  cloudfloor?: number;
  cloudsoft?: number;
  cloudbright?: number;
  cloudtint?: string;
  veil?: number;
  veilcolor?: string;
}

// The prototype's defaults, for a file that leaves a key out.
const DEFAULT_CLOUD_LAYER: PlanetCloudLayer = {
  altitude: 1.012,
  opacity: 0.92,
  shadow: 0.55,
  longitude: 0,
  gamma: 1,
  cover: 1,
  floor: 0,
  softness: 0,
  brightness: 0.95,
  tint: '#ffffff',
};

const finite = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const hexColor = (value: unknown): string | undefined =>
  typeof value === 'string' && /^#?[0-9a-f]{6}$/i.test(value)
    ? `#${value.replace('#', '')}`
    : undefined;

/** Reads a shipped profile; `null` for a world without air, or a file that is not a profile. */
export function parsePlanetAtmosphere(raw: unknown): PlanetAtmosphere | null {
  if (!raw || typeof raw !== 'object') return null;
  const shipped = raw as ShippedAtmosphere;
  if (shipped.atmosphere !== true) return null;

  const clouds: PlanetCloudLayer | undefined = shipped.nuages
    ? {
        // A shell below the ground would never show; one far above would detach from it.
        altitude: Math.min(
          1.1,
          Math.max(1, finite(shipped.cloudalt, DEFAULT_CLOUD_LAYER.altitude)),
        ),
        opacity: finite(shipped.cloudopacity, DEFAULT_CLOUD_LAYER.opacity),
        shadow: finite(shipped.cloudshadow, DEFAULT_CLOUD_LAYER.shadow),
        longitude: finite(shipped.cloudlon, DEFAULT_CLOUD_LAYER.longitude),
        gamma: finite(shipped.cloudgamma, DEFAULT_CLOUD_LAYER.gamma),
        // The shader divides by it.
        cover: Math.max(0.01, finite(shipped.cloudcover, DEFAULT_CLOUD_LAYER.cover)),
        floor: finite(shipped.cloudfloor, DEFAULT_CLOUD_LAYER.floor),
        softness: finite(shipped.cloudsoft, DEFAULT_CLOUD_LAYER.softness),
        brightness: finite(shipped.cloudbright, DEFAULT_CLOUD_LAYER.brightness),
        tint: hexColor(shipped.cloudtint) ?? DEFAULT_CLOUD_LAYER.tint,
      }
    : undefined;

  return {
    veilDensity: Math.max(0, finite(shipped.veil, 0)),
    veilColor: hexColor(shipped.veilcolor),
    clouds,
  };
}
