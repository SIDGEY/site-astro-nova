/**
 * L'empire d'illustration des écrans reconstruits, le même d'un écran à l'autre : un milieu de
 * partie sur une planète tempérée (6 °C, 40 °C au plus chaud), sans classe ni talent, qui remplit
 * les prérequis de tout ce que montre la home (le cuirassé demande un chantier spatial 7).
 *
 * Débits, capacités, coûts et durées sortent des formules du backend (`Building::getProduction`,
 * `getStorage`, `getCost`, `getBuildingTime`, `Ship`/`Defense::getConstructionTime`), à la vitesse
 * ×1 et sur les valeurs de base de ses migrations (tables `building`, `ship`, `defense`). Seuls
 * niveaux, quantités et stocks sont choisis. Ce sont des valeurs d'exemple : le jeu reçoit celles
 * du joueur de l'API.
 */

export type CostCode = 'metal' | 'crystal' | 'hydrogen';
export type Cost = Partial<Record<CostCode, number>>;
type Output = Partial<Record<CostCode | 'energy', number>>;

/** Niveaux des bâtiments et installations de la base. */
export const LEVELS: Record<string, number> = {
  planetary_base: 1,
  metal_mine: 18,
  crystal_mine: 15,
  hydrogen_synthesizer: 13,
  solar_plant: 19,
  metal_storage: 5,
  crystal_storage: 4,
  hydrogen_storage: 3,
  research_lab: 7,
  robotic_factory: 6,
  shipyard: 7,
  missile_silo: 0,
  logistics_center: 0,
};

/** Unités en poste sur la base. */
export const QUANTITIES: Record<string, number> = {
  ballistic_projector: 120,
  photonic_cannon: 60,
  high_energy_emitter: 16,
  magnetic_accelerator: 4,
  ion_battery: 0,
  light_fighter: 150,
  heavy_fighter: 60,
  cruiser: 24,
  battleship: 8,
  small_cargo: 40,
};

/** Stocks de la barre de ressources. */
export const STOCK: Record<CostCode, number> = { metal: 172000, crystal: 96800, hydrogen: 41300 };

// `base_cost` [métal, cristal, hydrogène], `cost_multiplicator`, `base_production`, `base_storage`.
const BUILDINGS: Record<string, { cost: [number, number, number]; energy?: number; factor: number; production?: Output; storage?: Partial<Record<CostCode, number>> }> = {
  planetary_base: { cost: [0, 0, 0], factor: 1, production: { metal: 20, crystal: 10 }, storage: { metal: 10000, crystal: 10000, hydrogen: 10000 } },
  metal_mine: { cost: [60, 15, 0], factor: 1.5, production: { metal: 30, energy: -10 } },
  crystal_mine: { cost: [48, 24, 0], factor: 1.6, production: { crystal: 20, energy: -10 } },
  hydrogen_synthesizer: { cost: [225, 75, 0], factor: 1.5, production: { hydrogen: 10, energy: -10 } },
  solar_plant: { cost: [75, 30, 0], factor: 1.5, production: { energy: 20 } },
  metal_storage: { cost: [1000, 0, 0], factor: 2, storage: { metal: 5000 } },
  crystal_storage: { cost: [1000, 500, 0], factor: 2, storage: { crystal: 5000 } },
  hydrogen_storage: { cost: [1000, 1000, 0], factor: 2, storage: { hydrogen: 5000 } },
  research_lab: { cost: [200, 400, 200], factor: 2 },
  robotic_factory: { cost: [400, 120, 200], factor: 2 },
  shipyard: { cost: [400, 200, 100], factor: 2 },
  missile_silo: { cost: [20000, 20000, 1000], factor: 2 },
};

// `base_cost` et `build_time` (secondes, chantier spatial au niveau 0).
const UNITS: Record<string, { cost: [number, number, number]; time: number }> = {
  ballistic_projector: { cost: [2000, 0, 0], time: 2880 },
  photonic_cannon: { cost: [1500, 500, 0], time: 2880 },
  high_energy_emitter: { cost: [6000, 2000, 0], time: 11520 },
  magnetic_accelerator: { cost: [20000, 15000, 2000], time: 50400 },
  light_fighter: { cost: [3000, 1000, 0], time: 1800 },
  heavy_fighter: { cost: [6000, 4000, 0], time: 5400 },
  cruiser: { cost: [20000, 7000, 2000], time: 28800 },
  battleship: { cost: [45000, 15000, 0], time: 64800 },
};

// Ce que la modale replie sous le coût : prérequis (`requirements`, tous remplis ici) et nombre
// d'entités qu'ils débloquent (`DependencyList`), relevés dans les migrations du backend.
export const REQUIREMENTS: Record<string, number> = {
  shipyard: 1,
  missile_silo: 1,
  ballistic_projector: 1,
  photonic_cannon: 2,
  high_energy_emitter: 3,
  magnetic_accelerator: 4,
  light_fighter: 1,
  heavy_fighter: 2,
  cruiser: 3,
  battleship: 2,
};
export const UNLOCKS: Record<string, number> = {
  research_lab: 17,
  robotic_factory: 2,
  shipyard: 26,
  missile_silo: 2,
};

// `BaseTemperature` : centrale solaire à 1 + T/100, synthèse d'hydrogène à 1,44 − 0,004 × Tmax.
const SOLAR_FACTOR = 1 + 6 / 100;
const HYDROGEN_FACTOR = 1.44 - 0.004 * 40;

const known = (table: Record<string, unknown>, code: string) => {
  if (!(code in table)) {
    throw new Error(`empire.ts : pas de valeurs de base pour « ${code} ». Connus : ${Object.keys(table).join(', ')}.`);
  }
};

/** Production horaire d'un bâtiment à un niveau (négative pour l'énergie consommée). */
export function productionAt(code: string, level: number): Output {
  known(BUILDINGS, code);
  const base = BUILDINGS[code].production ?? {};
  const growth = code === 'planetary_base' ? level : level * 1.1 ** level;
  const out: Output = {};
  for (const [res, value] of Object.entries(base) as [keyof Output, number][]) {
    const factor = code === 'solar_plant' ? SOLAR_FACTOR : code === 'hydrogen_synthesizer' && res === 'hydrogen' ? HYDROGEN_FACTOR : 1;
    out[res] = Math.trunc(value * growth * factor);
  }
  return out;
}

/** Capacité de stockage d'un bâtiment à un niveau. */
export function storageAt(code: string, level: number): Partial<Record<CostCode, number>> {
  known(BUILDINGS, code);
  const base = BUILDINGS[code].storage ?? {};
  const multiplier = level <= 0 ? 0 : code === 'planetary_base' ? level : Math.floor(2.5 * Math.exp((20 * level) / 33));
  return Object.fromEntries(Object.entries(base).map(([res, value]) => [res, value * multiplier]));
}

const level = (code: string) => LEVELS[code] ?? 0;
const toCost = ([metal, crystal, hydrogen]: number[]): Cost =>
  Object.fromEntries(Object.entries({ metal, crystal, hydrogen }).filter(([, v]) => v > 0));

/** Fiche « niveau suivant » d'un bâtiment : coût, énergie d'exploitation ou de construction, durée. */
export function nextLevel(code: string) {
  known(BUILDINGS, code);
  const { cost, energy, factor } = BUILDINGS[code];
  const target = level(code) + 1;
  const costs = cost.map((value) => Math.floor(value * factor ** (target - 1)));
  const total = costs.reduce((sum, value) => sum + value, 0);
  return {
    level: level(code),
    costs: toCost(costs),
    /** `next.production.energy` : ce que le niveau visé consomme (−) ou produit (+). */
    energy: productionAt(code, target).energy,
    /** `next.cost.energy` : l'énergie à produire pour lancer la construction. */
    energyCost: energy,
    buildTime: Math.round((total / (2500 * (1 + level('robotic_factory')))) * 3600),
  };
}

/** Fiche de fabrication d'une unité : coût et durée d'une unité. */
export function unitBuild(code: string) {
  known(UNITS, code);
  const { cost, time } = UNITS[code];
  return {
    count: QUANTITIES[code] ?? 0,
    costs: toCost(cost),
    buildTime: Math.max(1, Math.round(time / (1 + level('shipyard')))),
  };
}

const MINES: Record<CostCode, string> = { metal: 'metal_mine', crystal: 'crystal_mine', hydrogen: 'hydrogen_synthesizer' };
const STORES: Record<CostCode, string> = { metal: 'metal_storage', crystal: 'crystal_storage', hydrogen: 'hydrogen_storage' };

/** Bilan d'une ressource : lignes de production et de stockage, dans l'ordre de la base. */
export function resourceBalance(res: CostCode) {
  const line = (code: string, value: number | undefined) => ({ code, level: level(code), value: value ?? 0 });
  const production = [line(MINES[res], productionAt(MINES[res], level(MINES[res]))[res]), line('planetary_base', productionAt('planetary_base', 1)[res])].filter((l) => l.value > 0);
  const storage = [line('planetary_base', storageAt('planetary_base', 1)[res]), line(STORES[res], storageAt(STORES[res], level(STORES[res]))[res])].filter((l) => l.value > 0);
  const sum = (lines: { value: number }[]) => lines.reduce((total, l) => total + l.value, 0);
  return { stock: STOCK[res], production, productionTotal: sum(production), storage, capacity: sum(storage), mine: MINES[res] };
}

/** Bilan énergétique : la centrale solaire produit, les mines consomment. */
export function energyBalance() {
  const producers = [{ code: 'solar_plant', level: level('solar_plant'), value: productionAt('solar_plant', level('solar_plant')).energy ?? 0 }];
  const consumers = (['metal', 'crystal', 'hydrogen'] as CostCode[]).map((res) => {
    const code = MINES[res];
    const output = productionAt(code, level(code));
    return { code, level: level(code), res, value: Math.abs(output.energy ?? 0), output: output[res] ?? 0 };
  });
  const production = producers.reduce((total, p) => total + p.value, 0);
  const consumption = consumers.reduce((total, c) => total + c.value, 0);
  // `computeEnergyUsagePercentage`, `computeEnergyShareOfProduction`.
  const usage = production > 0 ? Math.max(0, Math.round((consumption / production) * 100)) : 0;
  const share = (value: number) => (production > 0 ? Math.round((Math.abs(value) / production) * 100) : 0);
  return { producers, consumers, production, consumption, available: production - consumption, usage, share };
}
