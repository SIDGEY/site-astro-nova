// @ts-nocheck
// GÉNÉRÉ par scripts/sync-game.mjs — copie de src/features/planets/utils/planetSurface.ts (Dynasty-Nova/Frontend @ eb30637d).
// Ne pas modifier ici : relancer `npm run game:sync`.
import * as THREE from 'three';

/** Equirectangular map set backing a single planet variant. */
export interface PlanetTextureSet {
  albedo: string;
  normal: string;
  specular: string;
  /**
   * Corps sans atmosphère — une lune, aujourd'hui le seul cas. La coque additive est masquée et
   * la frange au limbe retombe à une lueur rasante : lui laisser le halo d'une planète, c'est
   * lui prêter un ciel qu'elle n'a pas, et la rendre à nouveau indiscernable de sa planète.
   */
  airless?: boolean;
  /**
   * Tried when this set's albedo fails to load: the biome's own set under a skin read from the
   * CDN, whose files the back office may not have uploaded.
   */
  fallback?: PlanetTextureSet;
  /**
   * Système d'anneaux, optionnel. Une **bande radiale**, pas une image d'anneau : tout ce qui
   * décrit un anneau ne dépend que du rayon, donc une texture de quelques centaines d'octets que
   * le shader lit à la distance de l'axe — ni couture ni UV à fabriquer. L'alpha porte la
   * densité, pour qu'un vide entre deux anneaux soit transparent et non noir.
   *
   * Facultative : seul un skin en porte, déposé depuis le BO. Absente ou introuvable sur le CDN,
   * l'anneau reste masqué et la branche d'ombre n'est pas compilée.
   */
  ring?: string;
  /**
   * Cloud cover, optional: an equirectangular grey map (grey = density) drawn on a shell just
   * above the ground, which also casts its shadow on it. Only drawn when `atmosphere.clouds`
   * says how; absent, no cloud mesh is shown and the shadow branch is not compiled.
   */
  clouds?: string;
  /** Haze and cloud settings of the variant. Absent, the planet renders as before: no haze. */
  atmosphere?: PlanetAtmosphere;
}

/**
 * Atmosphere of a planet variant, as the codex tunes and ships it next to the maps
 * (`atmosphere.json`). Ignored on an airless body.
 */
export interface PlanetAtmosphere {
  /** Haze laid over the ground, thicker towards the limb. 0 leaves the ground untouched. */
  veilDensity: number;
  /** Hex colour of the haze. Absent, the halo's hue (read from the albedo) is used. */
  veilColor?: string;
  /** How the cloud map is drawn. Absent, the variant has no clouds (a gas giant's bands). */
  clouds?: PlanetCloudLayer;
}

export interface PlanetCloudLayer {
  /** Radius of the cloud shell, in planet radii. Also sets how far the shadow falls. */
  altitude: number;
  opacity: number;
  /** Share of light a fully dense cloud takes from the ground below. */
  shadow: number;
  /** Starting longitude of the layer, in degrees. */
  longitude: number;
  /** Curve applied to the map before `cover`. */
  gamma: number;
  /** Below 1, thins the cover out (only the densest cores remain); above 1, thickens it. */
  cover: number;
  /** Density left where the map is empty: a thin permanent overcast. */
  floor: number;
  /** Mip bias when reading the map: blurs the cloud edges. */
  softness: number;
  brightness: number;
  /** Hex colour of the lit clouds. */
  tint: string;
}

/** Rayons de l'anneau, en multiples du rayon de la planète — l'ordre de grandeur de Saturne. */
const RING_INNER_RATIO = 1.28;
const RING_OUTER_RATIO = 2.3;
/**
 * Ce qu'une planète annelée cède en taille pour que ses anneaux tiennent dans le cadre. Le budget
 * d'affichage est calé sur le DIAMÈTRE DE LA SPHÈRE : les anneaux, qui portent jusqu'à 2,3 rayons,
 * en sortiraient. Sur les côtés c'est sans importance — un anneau coupé par le bord se lit très
 * bien — mais le joueur peut basculer la planète jusqu'à 36°, et l'anneau monte alors à 1,35 rayon
 * en hauteur. Ce facteur l'y ramène, sans rétrécir les planètes qui n'ont pas d'anneaux.
 */
export const RINGED_PLANET_SCALE = 0.75;
/** Part de lumière que l'anneau retire aux nuages qu'il ombre. */
const RING_SHADOW_STRENGTH = 0.8;
/** Sous l'ombre de la planète, l'anneau reste faiblement éclairé par la planète elle-même. */
const RING_EARTHSHINE = 0.18;
/**
 * Spin of the ring's inner edge over the planet's own, in rad/s. Further out it slows as an orbit
 * does (Kepler, ω ∝ r^-1.5), so the ring shears against itself as well as against the ground.
 */
const RING_SPIN_SPEED = 0.12;
/**
 * Lanes of the ring that each turn as one piece, neighbours blended. A truly continuous shear
 * would wind the clumps ever tighter until they shimmer; lanes keep the drift between radii and
 * bound how fine the pattern gets, however long the page stays open.
 */
const RING_LANES = 8;
/** How far the clumps take the ring's density, either way: they read as arcs, not as holes. */
const RING_CLUMP_CONTRAST = 0.35;

/**
 * Direction the sunlight comes from, in world space. Exposed as a direction so
 * each scene can push the source as far away as it needs: at a large distance
 * the point-to-surface vector barely varies, which yields the parallel
 * terminator of a directional light whatever the planet's world radius.
 */
export const PLANET_SUN_DIRECTION = new THREE.Vector3(-250, 50, 350).normalize();

const DEFAULT_ATMOSPHERE_COLOR = new THREE.Color(0.8, 0.8, 0.8);
const ATMOSPHERE_RADIUS_RATIO = 1.15;
/** Albedo maps are baked flat; widening the gamut keeps biomes readable apart. */
const SATURATION_BOOST = 1.3;
const RIM_STRENGTH = 0.8;
/**
 * Un corps sans air garde une frange, mais rocheuse : ce qui s'allume au limbe est la pente
 * rasante du relief, pas une couche de gaz. La couper net aplatirait la sphère contre le fond.
 */
const AIRLESS_RIM_STRENGTH = 0.15;

/** Extra spin of the clouds over the ground's own, in rad/s: weather drifts across the land. */
const CLOUD_DRIFT_SPEED = 0.04;
/** Rings of the cloud shell; twice as many meridians. Finer than the ground: its edge is seen. */
const CLOUD_SEGMENTS = 64;
/**
 * The cloud map read from a direction in the planet's frame, rotated by the layer's drift. The
 * unwrap is `THREE.SphereGeometry`'s, so a direction and the UV of the shell agree. Shared by the
 * cloud shell and the shadow it casts on the ground, which read the same density.
 */
const CLOUD_DENSITY_GLSL = `
  uniform sampler2D cloudMap;
  uniform float cloudRotation;
  uniform float cloudGamma;
  uniform float cloudCover;
  uniform float cloudFloor;
  uniform float cloudSoftness;
  vec2 cloudUv(vec3 direction) {
    float c = cos(cloudRotation);
    float s = sin(cloudRotation);
    vec3 q = normalize(vec3(c * direction.x - s * direction.z, direction.y, s * direction.x + c * direction.z));
    return vec2(fract(atan(q.z, -q.x) / (2.0 * PI)), 1.0 - acos(clamp(q.y, -1.0, 1.0)) / PI);
  }
  float cloudShape(float raw) {
    float density = pow(raw, cloudGamma);
    density = cloudCover <= 1.0
      ? clamp((density - (1.0 - cloudCover)) / cloudCover, 0.0, 1.0)
      : pow(density, 1.0 / cloudCover);
    return mix(cloudFloor, 1.0, density);
  }`;

/**
 * Averages the albedo down to a single vivid hue used to tint the atmosphere.
 * Sampling a 16×16 downscale is enough — we only need the dominant colour — and
 * keeps the read off the main thread's critical path.
 */
function computeAtmosphereColor(image: CanvasImageSource | undefined): THREE.Color {
  if (!image) return DEFAULT_ATMOSPHERE_COLOR.clone();

  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return DEFAULT_ATMOSPHERE_COLOR.clone();

  try {
    context.drawImage(image, 0, 0, 16, 16);
    const { data } = context.getImageData(0, 0, 16, 16);

    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      // Skip near-black pixels: night-side and empty areas would drag the
      // average towards grey and wash the halo out.
      if (data[i] + data[i + 1] + data[i + 2] <= 30) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    if (count === 0) return DEFAULT_ATMOSPHERE_COLOR.clone();

    const hsl = { h: 0, s: 0, l: 0 };
    new THREE.Color(r / count / 255, g / count / 255, b / count / 255).getHSL(hsl);

    return new THREE.Color().setHSL(
      hsl.h,
      Math.min(1, hsl.s * 1.5),
      Math.min(1, Math.max(0.4, hsl.l * 1.5)),
    );
  } catch {
    // A tainted canvas (cross-origin texture) throws on getImageData.
    return DEFAULT_ATMOSPHERE_COLOR.clone();
  }
}

// Skins come from the cosmetics CDN, another origin: without CORS the texture would taint the
// WebGL context. Harmless on the packaged, same-origin biome files.
const textureLoader = new THREE.TextureLoader().setCrossOrigin('anonymous');

function loadTexture(url: string, colorSpace: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    textureLoader.load(
      url,
      (texture) => {
        texture.colorSpace = colorSpace;
        resolve(texture);
      },
      undefined,
      () => reject(new Error(`Planet texture unavailable: ${url}`)),
    );
  });
}

/** Jeu de textures prêt à poser sur le matériau, avec la teinte d'atmosphère déjà calculée. */
interface LoadedTextures {
  albedo: THREE.Texture;
  normal: THREE.Texture | null;
  specular: THREE.Texture | null;
  ring: THREE.Texture | null;
  clouds: THREE.Texture | null;
  atmosphereColor: THREE.Color;
}

/**
 * Les textures survivent au changement de planète, au lieu d'être relâchées avec la scène :
 * revenir sur une base déjà vue n'a alors plus rien à décoder ni à téléverser. Le cache est borné
 * parce qu'un jeu complet pèse une quinzaine de Mo de mémoire GPU — au-delà, on échangerait une
 * latence contre une saturation.
 */
export const PLANET_TEXTURE_CACHE_LIMIT = 4;
const textureCache = new Map<string, LoadedTextures>();

// Renseignée par la première surface créée : le préchargement s'exécute sans surface sous la
// main, mais doit produire des textures filtrées à l'identique pour être réutilisables telles
// quelles au moment de l'affichage.
let sharedMaxAnisotropy = 1;

function takeFromCache(key: string): LoadedTextures | undefined {
  const hit = textureCache.get(key);
  if (!hit) return undefined;
  // `Map` conserve l'ordre d'insertion : réinsérer suffit à marquer l'entrée comme la plus
  // récemment utilisée, et donc la dernière à être évincée.
  textureCache.delete(key);
  textureCache.set(key, hit);
  return hit;
}

function putInCache(key: string, entry: LoadedTextures) {
  textureCache.set(key, entry);
  while (textureCache.size > PLANET_TEXTURE_CACHE_LIMIT) {
    const oldestKey = textureCache.keys().next().value;
    if (oldestKey === undefined) break;
    const oldest = textureCache.get(oldestKey);
    textureCache.delete(oldestKey);
    [oldest?.albedo, oldest?.normal, oldest?.specular, oldest?.ring, oldest?.clouds].forEach(
      (texture) => texture?.dispose(),
    );
  }
}

export interface PlanetSurfaceOptions {
  /** Sphere radius in the parent group's local units. */
  radius: number;
  /** World-space position of the light, fed to both shaders. */
  sunPosition: THREE.Vector3;
  segments?: number;
  maxAnisotropy?: number;
}

/**
 * Charge un jeu de textures et le range en cache. Extrait de la classe pour que le préchargement
 * puisse l'appeler sans surface : les textures obtenues sont exactement celles que `load` posera
 * ensuite, d'où un affichage sans décodage ni téléversement.
 */
async function loadTextureSet(
  set: PlanetTextureSet,
  shouldAbort?: () => boolean,
): Promise<LoadedTextures | null> {
  const albedo = await loadTexture(set.albedo, THREE.SRGBColorSpace);
  if (shouldAbort?.()) {
    albedo.dispose();
    return null;
  }

  const [normal, specular, ring, clouds] = await Promise.all([
    loadTexture(set.normal, THREE.NoColorSpace).catch(() => null),
    loadTexture(set.specular, THREE.NoColorSpace).catch(() => null),
    // La bande est lue telle qu'elle est écrite, sans conversion : le shader de l'anneau écrit
    // directement dans le tampon, comme la coque atmosphérique.
    set.ring ? loadTexture(set.ring, THREE.NoColorSpace).catch(() => null) : Promise.resolve(null),
    set.clouds
      ? loadTexture(set.clouds, THREE.NoColorSpace).catch(() => null)
      : Promise.resolve(null),
  ]);
  if (ring) {
    // La bande est lue par son rayon : ni répétition ni repli, sinon le vide intérieur
    // réapparaît contre le bord externe.
    ring.wrapS = ring.wrapT = THREE.ClampToEdgeWrapping;
  }
  if (clouds) {
    // The drift slides the map along the longitude: it must wrap around the seam, not the poles.
    clouds.wrapS = THREE.RepeatWrapping;
    clouds.wrapT = THREE.ClampToEdgeWrapping;
  }

  const loaded = [albedo, normal, specular, ring, clouds].filter(
    (t): t is THREE.Texture => t !== null,
  );
  if (shouldAbort?.()) {
    loaded.forEach((texture) => texture.dispose());
    return null;
  }

  loaded.forEach((texture) => {
    texture.anisotropy = sharedMaxAnisotropy;
  });

  const entry: LoadedTextures = {
    albedo,
    normal,
    specular,
    ring,
    clouds,
    // `Texture.image` n'est pas typé par three : c'est l'HTMLImageElement décodé par le loader.
    // La lecture canvas se fait une seule fois par planète, son résultat étant mis en cache.
    atmosphereColor: computeAtmosphereColor(albedo.image as CanvasImageSource),
  };
  putInCache(set.albedo, entry);
  return entry;
}

/**
 * Précharge un jeu de textures hors affichage. Sans effet si la planète est déjà en cache, et
 * volontairement séquentiel côté appelant : il ne doit jamais disputer la bande passante au
 * chargement de la planète visible.
 */
export async function prefetchPlanetTextures(set: PlanetTextureSet): Promise<void> {
  if (textureCache.has(set.albedo)) return;
  try {
    await loadTextureSet(set);
  } catch (error) {
    if (!set.fallback) throw error;
    await prefetchPlanetTextures(set.fallback);
  }
}

/**
 * A planet rendered as a textured sphere wrapped in an additive atmosphere
 * shell, replacing the per-biome GLB models. The surface is a stock Phong
 * material whose shader is extended in place (`onBeforeCompile`) with a
 * saturation lift and a Fresnel rim light, so three.js keeps handling normal
 * and specular mapping for us.
 */
export class PlanetSurface {
  readonly group = new THREE.Group();

  private readonly surfaceMaterial: THREE.MeshPhongMaterial;
  private readonly atmosphereMaterial: THREE.ShaderMaterial;
  private readonly atmosphereMesh: THREE.Mesh;
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly atmosphereColor = DEFAULT_ATMOSPHERE_COLOR.clone();
  // Même raison que `atmosphereColor` : relu à chaque recompilation du shader, et non capturé
  // une fois pour toutes — le jeu de textures posé peut l'avoir changé entre-temps.
  private rimStrength = RIM_STRENGTH;
  /**
   * L'anneau : maillage et matériau créés une fois pour toutes, masqués tant qu'aucun jeu de
   * textures n'apporte de bande. Les construire à la volée obligerait à recompiler le shader de
   * surface à chaque changement de planète, que la scène évite précisément de reconstruire.
   */
  private readonly ringMesh: THREE.Mesh;
  private readonly ringMaterial: THREE.ShaderMaterial;
  /** Partagée entre le shader de l'anneau et celui de la surface, qui y lit l'ombre portée. */
  private readonly ringTexture: THREE.IUniform<THREE.Texture | null> = { value: null };
  /**
   * The cloud layer, built once and hidden like the ring. Its uniforms are shared with the
   * surface shader, which reads the same map for the shadow the clouds cast.
   */
  private readonly cloudMesh: THREE.Mesh;
  private readonly cloudMaterial: THREE.ShaderMaterial;
  private readonly cloudUniforms = {
    cloudMap: { value: null } as THREE.IUniform<THREE.Texture | null>,
    cloudRotation: { value: 0 },
    cloudGamma: { value: 1 },
    cloudCover: { value: 1 },
    cloudFloor: { value: 0 },
    cloudSoftness: { value: 0 },
    cloudLift: { value: 0 },
    cloudShadow: { value: 0 },
  };
  private readonly veilUniforms = {
    veilColor: { value: DEFAULT_ATMOSPHERE_COLOR.clone() },
    veilDensity: { value: 0 },
  };
  /** Longitude the layer starts from, in radians; the drift is added to it. */
  private cloudLongitude = 0;
  private readonly radius: number;
  // `onBeforeCompile` runs again on every recompile (assigning a map flips a
  // shader define), so the uniforms are re-read from `atmosphereColor` there
  // rather than captured once.
  private compiledUniforms: Record<string, THREE.IUniform> | null = null;

  constructor({ radius, sunPosition, segments = 64, maxAnisotropy = 1 }: PlanetSurfaceOptions) {
    sharedMaxAnisotropy = maxAnisotropy;
    this.radius = radius;

    this.surfaceMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      normalScale: new THREE.Vector2(0.8, 0.8),
      shininess: 40,
    });

    this.surfaceMaterial.onBeforeCompile = (shader) => {
      this.compiledUniforms = shader.uniforms;
      shader.uniforms.sunPosition = { value: sunPosition.clone() };
      shader.uniforms.atmosphereColor = { value: this.atmosphereColor.clone() };
      shader.uniforms.rimStrength = { value: this.rimStrength };
      shader.uniforms.ringStrip = this.ringTexture;
      shader.uniforms.ringInner = { value: radius * RING_INNER_RATIO };
      shader.uniforms.ringOuter = { value: radius * RING_OUTER_RATIO };
      Object.assign(shader.uniforms, this.cloudUniforms, this.veilUniforms);

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          varying vec3 vWorldPos;
          varying vec3 vWorldNorm;
          #if defined(PLANET_HAS_RING) || defined(PLANET_HAS_CLOUDS)
          uniform vec3 sunPosition;
          varying vec3 vLocalPos;
          varying vec3 vLocalSunDir;
          #endif`,
        )
        .replace(
          '#include <fog_vertex>',
          `#include <fog_vertex>
          vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
          vWorldNorm = normalize(mat3(modelMatrix) * objectNormal);
          #if defined(PLANET_HAS_RING) || defined(PLANET_HAS_CLOUDS)
          vLocalPos = transformed;
          // Le soleil ramené dans le repère du modèle. C'est ici et pas dans le fragment que
          // ça se calcule : three ne déclare pas \`modelMatrix\` côté fragment. La transposée
          // d'une rotation valant son inverse, l'inverse se lit en trois produits scalaires.
          mat3 modelRot = mat3(modelMatrix);
          vec3 sunDirWorld = normalize(sunPosition - vWorldPos);
          vLocalSunDir = vec3(
            dot(modelRot[0], sunDirWorld),
            dot(modelRot[1], sunDirWorld),
            dot(modelRot[2], sunDirWorld)
          );
          #endif`,
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform vec3 sunPosition;
          uniform vec3 atmosphereColor;
          uniform float rimStrength;
          varying vec3 vWorldPos;
          varying vec3 vWorldNorm;
          #if defined(PLANET_HAS_RING) || defined(PLANET_HAS_CLOUDS)
          varying vec3 vLocalPos;
          varying vec3 vLocalSunDir;
          #endif
          #ifdef PLANET_HAS_RING
          uniform sampler2D ringStrip;
          uniform float ringInner;
          uniform float ringOuter;
          #endif
          #ifdef PLANET_HAS_CLOUDS
          uniform float cloudLift;
          uniform float cloudShadow;
          ${CLOUD_DENSITY_GLSL}
          #endif
          #ifdef PLANET_HAS_VEIL
          uniform vec3 veilColor;
          uniform float veilDensity;
          #endif`,
        )
        // Injected after tone mapping and the sRGB conversion so the rim glow
        // keeps its punch instead of being rolled off with the rest of the image.
        .replace(
          '#include <dithering_fragment>',
          `float lum = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
          gl_FragColor.rgb = mix(vec3(lum), gl_FragColor.rgb, ${SATURATION_BOOST.toFixed(2)});

          #ifdef PLANET_HAS_RING
          // Ombre portée de l'anneau sur les nuages — la moitié qui fait qu'un anneau ne
          // ressemble pas à un autocollant. Le plan de l'anneau est y=0 dans le repère du
          // groupe : depuis le point de surface on remonte vers le soleil jusqu'à ce plan, et
          // le rayon obtenu lit directement la bande.
          //
          // Le soleil arrive déjà ramené dans le repère du modèle par l'étage sommet : l'ombre
          // reste donc juste pendant que le joueur fait tourner la planète, sans qu'aucune
          // uniforme n'ait à être remise à jour image par image.
          vec3 sunDirLocal = normalize(vLocalSunDir);
          if (abs(sunDirLocal.y) > 1e-4) {
            float toPlane = -vLocalPos.y / sunDirLocal.y;
            if (toPlane > 0.0) {
              vec2 hit = vLocalPos.xz + toPlane * sunDirLocal.xz;
              float ringT = (length(hit) - ringInner) / (ringOuter - ringInner);
              if (ringT >= 0.0 && ringT <= 1.0) {
                float density = texture2D(ringStrip, vec2(ringT, 0.5)).a;
                gl_FragColor.rgb *= 1.0 - density * ${RING_SHADOW_STRENGTH.toFixed(2)};
              }
            }
          }
          #endif

          // Préfixé pour ne pas entrer en collision avec les variables déjà
          // déclarées par les chunks de three.js à ce point du shader (dont \`normal\`).
          vec3 planetNormal = normalize(vWorldNorm);
          vec3 planetLightDir = normalize(sunPosition - vWorldPos);
          vec3 planetViewDir = normalize(cameraPosition - vWorldPos);
          float NdotL = dot(planetNormal, planetLightDir);
          float NdotV = dot(planetNormal, planetViewDir);

          float rimFactor = 1.0 - smoothstep(0.0, 1.0, NdotV);
          float litRimFactor = smoothstep(-0.3, 0.6, NdotL) * pow(rimFactor, 2.0);
          gl_FragColor.rgb += atmosphereColor * litRimFactor * rimStrength;

          #ifdef PLANET_HAS_CLOUDS
          // Shadow of the clouds: from the ground point, climb towards the sun up to the cloud
          // shell and read the density there, on a coarse mip — a shadow has soft edges. A low
          // sun stretches the climb, capped so the terminator does not sample the far side.
          vec3 groundDir = normalize(vLocalPos);
          vec3 sunDirCloud = normalize(vLocalSunDir);
          float cosSun = max(dot(groundDir, sunDirCloud), 0.12);
          vec3 shadowDir = normalize(vLocalPos + sunDirCloud * (cloudLift / cosSun));
          float occlusion = cloudShape(textureLod(cloudMap, cloudUv(shadowDir), 3.0 + cloudSoftness).r);
          gl_FragColor.rgb *= 1.0 - occlusion * cloudShadow;
          #endif

          #ifdef PLANET_HAS_VEIL
          // Haze: the air column grows towards the limb, and the haze is lit like the ground.
          float veilPath = 1.0 / max(NdotV, 0.12);
          float veilAmount = 1.0 - exp(-veilDensity * (0.25 + 0.26 * (veilPath - 1.0)));
          float veilDay = smoothstep(-0.25, 0.55, NdotL);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, veilColor * veilDay * 0.85, veilAmount);
          #endif

          #include <dithering_fragment>`,
        );
    };

    const surfaceGeometry = new THREE.SphereGeometry(radius, segments, segments);
    this.geometries.push(surfaceGeometry);
    this.group.add(new THREE.Mesh(surfaceGeometry, this.surfaceMaterial));

    this.atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        atmosphereColor: { value: this.atmosphereColor.clone() },
        sunPosition: { value: sunPosition.clone() },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 atmosphereColor;
        uniform vec3 sunPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          // Back faces are rendered, so the grazing angle we want sits on the
          // negative side of the dot product.
          float intensity = pow(max(0.0, -dot(vNormal, viewDir)), 2.5) * 1.5;
          float lightIntensity = smoothstep(-0.2, 0.8, dot(vNormal, normalize(sunPosition - vWorldPos)));
          gl_FragColor = vec4(atmosphereColor, 1.0) * intensity * lightIntensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });

    const atmosphereGeometry = new THREE.SphereGeometry(
      radius * ATMOSPHERE_RADIUS_RATIO,
      segments,
      segments,
    );
    this.geometries.push(atmosphereGeometry);
    this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, this.atmosphereMaterial);
    this.group.add(this.atmosphereMesh);

    // L'anneau. La géométrie n'est qu'un support : rien n'y est lu par UV, le shader se repère à
    // la distance de l'axe. Posé dans le même groupe que la sphère, il suit sa rotation, et ses
    // amas tournent en plus à leur propre vitesse (`ringTime`), plus vite au bord intérieur.
    this.ringMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ringStrip: this.ringTexture,
        ringInner: { value: radius * RING_INNER_RATIO },
        ringOuter: { value: radius * RING_OUTER_RATIO },
        planetRadius: { value: radius },
        sunPosition: { value: sunPosition.clone() },
        ringTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vLocalPos;
        varying vec3 vWorldPos;
        void main() {
          vLocalPos = position;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        #include <common>
        uniform sampler2D ringStrip;
        uniform float ringInner;
        uniform float ringOuter;
        uniform float planetRadius;
        uniform vec3 sunPosition;
        uniform float ringTime;
        varying vec3 vLocalPos;
        varying vec3 vWorldPos;

        float ringHash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        // Value noise whose x wraps every \`period\` cells: read around the ring, it has no seam.
        float ringNoise(vec2 p, float period) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          float x0 = mod(i.x, period);
          float x1 = mod(i.x + 1.0, period);
          return mix(
            mix(ringHash(vec2(x0, i.y)), ringHash(vec2(x1, i.y)), u.x),
            mix(ringHash(vec2(x0, i.y + 1.0)), ringHash(vec2(x1, i.y + 1.0)), u.x),
            u.y
          );
        }
        // Clumps of one lane, turned by that lane's own orbit. Far more cells around than across:
        // the clumps are arcs drawn out along the orbit.
        float laneClumps(float lane, float angle, float ringT) {
          float laneRadius = mix(ringInner, ringOuter, (lane + 0.5) / ${RING_LANES.toFixed(1)});
          float spin = ringTime * ${RING_SPIN_SPEED.toFixed(3)} * pow(ringInner / laneRadius, 1.5);
          float turn = fract((angle + spin) / PI2);
          return ringNoise(vec2(turn * 24.0, ringT * 12.0), 24.0) * 0.65
            + ringNoise(vec2(turn * 72.0, ringT * 40.0), 72.0) * 0.35;
        }

        void main() {
          float ringT = (length(vLocalPos.xz) - ringInner) / (ringOuter - ringInner);
          if (ringT < 0.0 || ringT > 1.0) discard;
          vec4 band = texture2D(ringStrip, vec2(ringT, 0.5));
          if (band.a < 0.004) discard;

          // Les amas : chaque couloir tourne d'un bloc, et l'on fond le couloir voisin dans
          // l'interstice pour que la frontière ne se voie pas.
          float angle = atan(vLocalPos.z, vLocalPos.x);
          float lanePos = clamp(ringT * ${RING_LANES.toFixed(1)} - 0.5, 0.0, ${(RING_LANES - 1).toFixed(1)});
          float lane = floor(lanePos);
          float clumps = mix(
            laneClumps(lane, angle, ringT),
            laneClumps(min(lane + 1.0, ${(RING_LANES - 1).toFixed(1)}), angle, ringT),
            smoothstep(0.0, 1.0, lanePos - lane)
          );
          band.a = clamp(
            band.a * mix(${(1 - RING_CLUMP_CONTRAST).toFixed(2)}, ${(1 + RING_CLUMP_CONTRAST).toFixed(2)}, clumps),
            0.0,
            1.0
          );
          band.rgb *= mix(0.88, 1.12, clumps);

          // Ombre de la PLANÈTE sur l'anneau : le point est-il dans le cylindre d'ombre ? La
          // planète est au centre du groupe, donc à l'origine du repère monde de celui-ci.
          vec3 toSun = normalize(sunPosition - vWorldPos);
          vec3 toCenter = -vWorldPos;
          float along = dot(toCenter, toSun);
          float lit = 1.0;
          if (along > 0.0) {
            float offAxis = length(toCenter - along * toSun);
            lit = smoothstep(planetRadius * 0.99, planetRadius * 1.08, offAxis);
          }

          // Pas de tone mapping ici : comme la coque atmosphérique, ce shader écrit directement
          // dans le tampon, et la bande est lue sans conversion d'espace colorimétrique.
          gl_FragColor = vec4(band.rgb * mix(${RING_EARTHSHINE.toFixed(2)}, 1.0, lit), band.a);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
    });

    const ringGeometry = new THREE.RingGeometry(
      radius * RING_INNER_RATIO,
      radius * RING_OUTER_RATIO,
      Math.max(64, segments * 4),
      1,
    ).rotateX(-Math.PI / 2);
    this.geometries.push(ringGeometry);
    this.ringMesh = new THREE.Mesh(ringGeometry, this.ringMaterial);
    this.ringMesh.visible = false;
    // Drawn after the clouds: neither writes depth, and the front of a ring passes over them.
    this.ringMesh.renderOrder = 2;
    this.group.add(this.ringMesh);

    // The cloud shell. Built at the ground's radius and scaled to the layer's altitude, which
    // changes from one variant to the next.
    this.cloudMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...this.cloudUniforms,
        ...this.veilUniforms,
        sunPosition: { value: sunPosition.clone() },
        atmosphereColor: { value: this.atmosphereColor.clone() },
        cloudOpacity: { value: 1 },
        cloudBrightness: { value: 1 },
        cloudTint: { value: new THREE.Color(0xffffff) },
      },
      vertexShader: `
        varying vec3 vLocalPos;
        varying vec3 vWorldPos;
        varying vec3 vWorldNorm;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vLocalPos = position;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPosition.xyz;
          vWorldNorm = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        #include <common>
        uniform vec3 sunPosition;
        uniform vec3 atmosphereColor;
        uniform float cloudOpacity;
        uniform float cloudBrightness;
        uniform vec3 cloudTint;
        uniform vec3 veilColor;
        uniform float veilDensity;
        varying vec3 vLocalPos;
        varying vec3 vWorldPos;
        varying vec3 vWorldNorm;
        varying vec2 vUv;
        ${CLOUD_DENSITY_GLSL}
        void main() {
          vec2 uv = vec2(vUv.x - cloudRotation / (2.0 * PI), vUv.y);
          float density = cloudShape(texture2D(cloudMap, uv, cloudSoftness).r);
          if (density < 0.004) discard;

          vec3 N = normalize(vWorldNorm);
          float NdotL = dot(N, normalize(sunPosition - vWorldPos));
          float NdotV = dot(N, normalize(cameraPosition - vWorldPos));
          // Wrapped Lambert: light bleeds a little past the terminator, as through real cloud.
          float diffuse = clamp((NdotL + 0.18) / 1.18, 0.0, 1.0);
          float albedo = mix(0.58, 1.0, density) * cloudBrightness;
          vec3 color = cloudTint * albedo * (3.0 / PI) * diffuse;
          color += vec3(0.0232, 0.0331, 0.0648) * 0.4 * albedo;
          // Warm fringe along the terminator, and the halo's hue towards the limb.
          color += vec3(1.0, 0.42, 0.18) * exp(-pow((NdotL - 0.04) / 0.14, 2.0)) * 0.22;
          float rim = pow(1.0 - max(NdotV, 0.0), 3.0);
          color = mix(color, color * 0.6 + atmosphereColor * diffuse * 0.7, rim * 0.6);

          float alpha = density * cloudOpacity * mix(0.55, 1.0, smoothstep(0.0, 0.3, NdotV));
          gl_FragColor = vec4(color, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>

          // The haze lies partly above the clouds too.
          float veilPath = 1.0 / max(NdotV, 0.12);
          float veilAmount = 1.0 - exp(-veilDensity * (0.25 + 0.26 * (veilPath - 1.0)));
          gl_FragColor.rgb = mix(gl_FragColor.rgb, veilColor * smoothstep(-0.25, 0.55, NdotL) * 0.85, veilAmount * 0.7);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    const cloudGeometry = new THREE.SphereGeometry(radius, CLOUD_SEGMENTS * 2, CLOUD_SEGMENTS);
    this.geometries.push(cloudGeometry);
    this.cloudMesh = new THREE.Mesh(cloudGeometry, this.cloudMaterial);
    this.cloudMesh.visible = false;
    this.cloudMesh.renderOrder = 1;
    this.group.add(this.cloudMesh);
  }

  /**
   * Loads a variant's maps and swaps them in. The albedo is awaited first
   * because the atmosphere hue is derived from it; normal and specular follow
   * in parallel and are optional, so a missing detail map degrades the look
   * instead of leaving the planet untextured.
   */
  async load(set: PlanetTextureSet, shouldAbort?: () => boolean): Promise<void> {
    const cached = takeFromCache(set.albedo);
    if (cached) {
      this.apply(cached, set);
      return;
    }

    let entry: LoadedTextures | null;
    try {
      entry = await loadTextureSet(set, shouldAbort);
    } catch (error) {
      if (!set.fallback) throw error;
      // The skin's texture is missing: the planet keeps its biome's face.
      await this.load(set.fallback, shouldAbort);
      return;
    }
    if (entry) this.apply(entry, set);
  }

  /** Vrai quand le jeu de textures posé a apporté une bande d'anneaux qui a pu être chargée. */
  get hasRing(): boolean {
    return this.ringMesh.visible;
  }

  /** True when the variant shown has a cloud layer that could be loaded. */
  get hasClouds(): boolean {
    return this.cloudMesh.visible;
  }

  /**
   * Moves the clouds and the ring's clumps to where they are at `timeSeconds`: both ride the
   * ground's rotation (they hang in the same group) and turn faster still, each at its own pace.
   * Absolute time, so a scene that skips frames still shows them where they belong.
   */
  animateLayers(timeSeconds: number) {
    this.cloudUniforms.cloudRotation.value = this.cloudLongitude + timeSeconds * CLOUD_DRIFT_SPEED;
    this.ringMaterial.uniforms.ringTime.value = timeSeconds;
  }

  /** Pose un jeu de textures déjà prêt : c'est tout ce que coûte un retour sur une planète vue. */
  private apply(entry: LoadedTextures, set: PlanetTextureSet) {
    const airless = set.airless === true;
    this.surfaceMaterial.map = entry.albedo;
    this.surfaceMaterial.normalMap = entry.normal;
    this.surfaceMaterial.specularMap = entry.specular;

    // L'anneau s'éteint autant qu'il s'allume : la même surface sert successivement à toutes les
    // planètes visitées. Le `define` évite de payer la branche d'ombre sur celles qui n'en ont
    // pas, au prix d'une recompilation — au même moment que celle qu'entraîne déjà le changement
    // de maps, donc sans recompilation supplémentaire.
    const hasRing = entry.ring !== null;
    this.ringTexture.value = entry.ring;
    this.ringMesh.visible = hasRing;

    const atmosphere = airless ? undefined : set.atmosphere;
    const cloudLayer = entry.clouds ? atmosphere?.clouds : undefined;
    const hasClouds = cloudLayer !== undefined;
    const hasVeil = (atmosphere?.veilDensity ?? 0) > 0;
    this.applyClouds(hasClouds ? entry.clouds : null, cloudLayer);

    // The cloud shadow and the haze follow the same rule as the ring's shadow.
    this.surfaceMaterial.defines = {
      ...(hasRing && { PLANET_HAS_RING: true }),
      ...(hasClouds && { PLANET_HAS_CLOUDS: true }),
      ...(hasVeil && { PLANET_HAS_VEIL: true }),
    };
    this.surfaceMaterial.needsUpdate = true;

    this.atmosphereColor.copy(entry.atmosphereColor);
    this.atmosphereMaterial.uniforms.atmosphereColor.value.copy(this.atmosphereColor);
    this.compiledUniforms?.atmosphereColor?.value.copy(this.atmosphereColor);

    // La même surface sert successivement aux deux corps de la case (la scène n'est jamais
    // reconstruite d'une base à l'autre) : l'atmosphère se rallume donc autant qu'elle s'éteint.
    this.atmosphereMesh.visible = !airless;
    this.rimStrength = airless ? AIRLESS_RIM_STRENGTH : RIM_STRENGTH;
    if (this.compiledUniforms?.rimStrength) {
      this.compiledUniforms.rimStrength.value = this.rimStrength;
    }

    // The haze takes the halo's hue unless the variant names its own. The hex is used as is,
    // like the halo's colour: both are mixed in after tone mapping, straight into the output.
    this.veilUniforms.veilDensity.value = atmosphere?.veilDensity ?? 0;
    if (atmosphere?.veilColor) {
      this.veilUniforms.veilColor.value.setHex(
        parseInt(atmosphere.veilColor.replace('#', ''), 16),
        THREE.LinearSRGBColorSpace,
      );
    } else {
      this.veilUniforms.veilColor.value.copy(this.atmosphereColor);
    }
    this.cloudMaterial.uniforms.atmosphereColor.value.copy(this.atmosphereColor);
  }

  private applyClouds(map: THREE.Texture | null, layer: PlanetCloudLayer | undefined) {
    this.cloudUniforms.cloudMap.value = map;
    this.cloudMesh.visible = map !== null && layer !== undefined;
    if (!map || !layer) return;

    this.cloudMesh.scale.setScalar(layer.altitude);
    this.cloudUniforms.cloudLift.value = (layer.altitude - 1) * this.radius;
    this.cloudUniforms.cloudShadow.value = layer.shadow;
    this.cloudUniforms.cloudGamma.value = layer.gamma;
    this.cloudUniforms.cloudCover.value = layer.cover;
    this.cloudUniforms.cloudFloor.value = layer.floor;
    this.cloudUniforms.cloudSoftness.value = layer.softness;
    this.cloudLongitude = THREE.MathUtils.degToRad(layer.longitude);
    this.cloudUniforms.cloudRotation.value = this.cloudLongitude;
    const { uniforms } = this.cloudMaterial;
    uniforms.cloudOpacity.value = layer.opacity;
    uniforms.cloudBrightness.value = layer.brightness;
    // The tint is a colour of the lit cloud, before tone mapping: converted like any sRGB input.
    uniforms.cloudTint.value.set(layer.tint);
  }

  dispose() {
    // Les textures ne sont PAS relâchées ici : elles appartiennent au cache, qui les partage
    // entre les scènes successives et ne les libère qu'à l'éviction.
    this.geometries.forEach((geometry) => geometry.dispose());
    this.surfaceMaterial.dispose();
    this.atmosphereMaterial.dispose();
    this.ringMaterial.dispose();
    this.cloudMaterial.dispose();
    this.group.removeFromParent();
  }
}
